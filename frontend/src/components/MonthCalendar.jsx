import React, { useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function formatISODate(d) {
  return d.toISOString().slice(0, 10);
}

export default function MonthCalendar({ events = [] }) {
  const { isDark } = useTheme();
  const [cursor, setCursor] = useState(startOfMonth(new Date()));

  const grid = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const startWeekday = (start.getDay() + 6) % 7; // make Monday=0
    const daysInMonth = end.getDate();
    const cells = [];

    // Map events by day
    const byDate = new Map();
    for (const e of events) {
      const d = e.start ? new Date(e.start) : e.end ? new Date(e.end) : null;
      if (!d) continue;
      const key = formatISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key).push(e);
    }

    // Leading blanks
    for (let i = 0; i < startWeekday; i++) cells.push({ type: 'pad', key: `pad-${i}` });
    // Month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      const key = formatISODate(d);
      const dayEvents = (byDate.get(key) || []).sort((a, b) => new Date(a.start || a.end || 0) - new Date(b.start || b.end || 0));
      cells.push({ type: 'day', key, day, date: d, events: dayEvents });
    }
    // Trailing blanks to complete weeks
    while (cells.length % 7 !== 0) cells.push({ type: 'pad', key: `pad-t-${cells.length}` });
    return cells;
  }, [cursor, events]);

  const monthLabel = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button className={`px-3 py-1 rounded ${isDark ? 'bg-gray-900 hover:bg-gray-800 border border-gray-700' : 'bg-white hover:bg-gray-100 border border-gray-300'}`} onClick={() => setCursor(addMonths(cursor, -1))}>
          ← Prev
        </button>
        <div className="text-lg font-semibold">{monthLabel}</div>
        <button className={`px-3 py-1 rounded ${isDark ? 'bg-gray-900 hover:bg-gray-800 border border-gray-700' : 'bg-white hover:bg-gray-100 border border-gray-300'}`} onClick={() => setCursor(addMonths(cursor, 1))}>
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{d}</div>
        ))}
        {grid.map((cell) => (
          cell.type === 'pad' ? (
            <div key={cell.key} className="h-24" />
          ) : (
            <div key={cell.key} className={`h-24 rounded-lg border p-1 overflow-hidden ${isDark ? 'bg-gray-950/60 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
              <div className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{cell.day}</div>
              <div className="space-y-1">
                {cell.events.slice(0, 3).map((e, idx) => (
                  <div key={idx} title={e.title} className={`truncate text-xs rounded px-1 ${isDark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-50 text-indigo-700'}`}>
                    {e.title}
                  </div>
                ))}
                {cell.events.length > 3 && (
                  <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>+{cell.events.length - 3} more</div>
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
