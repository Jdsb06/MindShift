// Minimal .ics (iCalendar) parser for VEVENT entries
// Supports: SUMMARY, DTSTART, DTEND, DESCRIPTION, UID
// Returns array of { title, start, end, description, uid }

const parseDate = (val) => {
  // Handles formats: 20250101, 20250101T130000Z, 20250101T130000, with optional TZID prefix handled by stripping
  if (!val) return null;
  // Remove parameters like ;TZID=...:
  const parts = val.split(":");
  const dateStr = parts.length > 1 ? parts.slice(1).join(":") : parts[0];
  // If Z, treat as UTC
  if (/Z$/.test(dateStr)) return new Date(dateStr);
  // Insert timezone-neutral parse: YYYYMMDD or YYYYMMDDThhmmss
  const m = dateStr.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?$/);
  if (!m) return new Date(dateStr);
  const [_, y, mo, d, hh = "00", mm = "00", ss = "00"] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), Number(ss));
};

export function parseICS(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const events = [];
  let current = null;

  // Handle line folding per RFC (continuation lines start with space)
  const unfolded = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0 && /^\s/.test(line)) {
      unfolded[unfolded.length - 1] += line.trim();
    } else {
      unfolded.push(line);
    }
  }

  for (const raw of unfolded) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") {
      current = { title: "", start: null, end: null, description: "", uid: "" };
    } else if (line === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      const [keyPart, ...valueParts] = line.split(":");
      if (!keyPart || valueParts.length === 0) continue;
      const key = keyPart.split(";")[0].toUpperCase();
      const value = valueParts.join(":");
      switch (key) {
        case "SUMMARY":
          current.title = value;
          break;
        case "DTSTART":
          current.start = parseDate(line);
          break;
        case "DTEND":
          current.end = parseDate(line);
          break;
        case "DESCRIPTION":
          current.description = value;
          break;
        case "UID":
          current.uid = value;
          break;
        default:
          break;
      }
    }
  }
  return events;
}

export function groupByDate(events) {
  const map = new Map();
  for (const e of events) {
    const date = (e.start || e.end || new Date()).toISOString().slice(0, 10);
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(e);
  }
  return map;
}
