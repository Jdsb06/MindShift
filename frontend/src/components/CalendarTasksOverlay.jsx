import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { parseICS, groupByDate } from '../utils/ics';
import { useTheme } from '../contexts/ThemeContext';
import { saveNotionConfig, fetchNotionEvents, createNotionTask } from '../utils/notionApi';

export default function CalendarTasksOverlay({ user, isOpen, onClose, onEventsChange }) {
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [importError, setImportError] = useState(null);
  const [intention, setIntention] = useState('');
  const [useNotion, setUseNotion] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionAccessToken, setNotionAccessToken] = useState('');
  const [notionCalendarDb, setNotionCalendarDb] = useState('');
  const [notionTasksDb, setNotionTasksDb] = useState('');
  const fileRef = useRef(null);
  const dropRef = useRef(null);

  const grouped = useMemo(() => groupByDate(events), [events]);

  // Drag & Drop for ICS files
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = async (e) => {
      prevent(e);
      if (!e.dataTransfer?.files?.length) return;
      const file = e.dataTransfer.files[0];
      const isIcs = file && ((file.name && /\.ics$/i.test(file.name)) || (file.type && /text\/calendar/.test(file.type)));
      if (isIcs) {
        await handleICSImport(file);
      }
    };
    el.addEventListener('dragover', prevent);
    el.addEventListener('dragenter', prevent);
    el.addEventListener('drop', handleDrop);
    return () => {
      el.removeEventListener('dragover', prevent);
      el.removeEventListener('dragenter', prevent);
      el.removeEventListener('drop', handleDrop);
    };
  }, [dropRef.current]);

  if (!isOpen) return null;

  const handleICSImport = async (file) => {
    setImportError(null);
    try {
      const text = await file.text();
      const parsed = parseICS(text);
  setEvents(parsed);
  onEventsChange && onEventsChange(parsed);
    } catch (e) {
      setImportError('Failed to import ICS.');
    }
  };

  const handleCreateTask = async () => {
    if (!user || !intention.trim()) return;
    try {
      if (useNotion && notionConnected) {
        await createNotionTask({ title: intention.trim() });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'tasks'), {
          title: intention.trim(),
          createdAt: serverTimestamp(),
          status: 'todo',
        });
      }
      setIntention('');
    } catch (e) {
      setImportError('Failed to create task.');
    }
  };

  const handleConnectNotion = async () => {
    setImportError(null);
    setNotionLoading(true);
    try {
      await saveNotionConfig({ accessToken: notionAccessToken, calendarDatabaseId: notionCalendarDb || undefined, tasksDatabaseId: notionTasksDb || undefined });
      setNotionConnected(true);
      // After connect, try to fetch events
  const notionEvents = await fetchNotionEvents({ maxDays: 14 });
  const normalized = notionEvents.map(e => ({ ...e, start: e.start ? new Date(e.start) : null, end: e.end ? new Date(e.end) : null }));
  setEvents((prev) => [...prev, ...normalized]);
  onEventsChange && onEventsChange((prev) => Array.isArray(prev) ? [...prev, ...normalized] : normalized);
    } catch (e) {
      setImportError('Failed to connect Notion.');
    } finally {
      setNotionLoading(false);
    }
  };

  const Section = ({ title, subtitle, right, children }) => (
    <div className={`rounded-2xl p-4 border shadow-sm ${isDark ? 'bg-gradient-to-b from-gray-950/80 to-gray-900/70 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-md`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && (<div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{subtitle}</div>)}
        </div>
        {right}
      </div>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" onClick={onClose} />
  <div className={`relative w-full max-w-6xl rounded-3xl overflow-hidden border shadow-2xl overlay-animate ${isDark ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'} backdrop-blur-2xl`}> 
        <div className={`flex items-center justify-between px-6 py-5 ${isDark ? 'border-b border-white/10' : 'border-b border-black/10'}`}>
          <div>
            <div className="text-xl font-semibold tracking-tight">Calendar & Tasks</div>
            <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Turn intention into aligned action — on your terms.</div>
          </div>
          <div className="flex items-center gap-3">
            {notionConnected && (
              <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>Notion Connected</span>
            )}
            <button className={`w-9 h-9 grid place-items-center rounded-full border ${isDark ? 'bg-gray-900/70 border-gray-700 hover:bg-gray-800' : 'bg-white/70 border-gray-300 hover:bg-gray-100'}`} onClick={onClose} aria-label="Close overlay">✕</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 p-6">
          {/* Left: Events + ICS */}
          <div className="lg:col-span-2 space-y-5" ref={dropRef}>
            <Section title="Upcoming" subtitle={events.length ? 'Merged from ICS and Notion' : 'Import from ICS or connect Notion to see events'}>
              {events.length === 0 ? (
                <div className={`rounded-xl border-dashed border-2 p-8 text-center ${isDark ? 'border-gray-700 bg-gray-900/40 text-gray-400' : 'border-gray-300 bg-gray-50 text-gray-600'}`}>
                  <div className="text-2xl mb-2">🗓️</div>
                  <div className="text-sm">Drop an .ics file here or use the Import button below.</div>
                </div>
              ) : (
                <div className="max-h-[55vh] overflow-y-auto pr-2 custom-scroll">
                  {[...grouped.entries()].map(([date, items]) => (
                    <div key={date} className="mb-5">
                      <div className={`flex items-baseline justify-between mb-2 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                        <div className="text-sm font-medium">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                        <div className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{items.length} event{items.length > 1 ? 's' : ''}</div>
                      </div>
                      <div className="space-y-2">
                        {items.map((e, idx) => {
                          const isNotion = e.source === 'notion';
                          const accent = isNotion
                            ? (isDark ? 'border-emerald-600/60' : 'border-emerald-500')
                            : (isDark ? 'border-indigo-600/60' : 'border-indigo-500');
                          const badge = isNotion
                            ? (isDark ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                            : (isDark ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/50' : 'bg-indigo-50 text-indigo-700 border border-indigo-200');
                          return (
                            <div key={idx} className={`rounded-xl p-3 border-l-4 ${accent} ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white/90 border-gray-200'} shadow-sm`}> 
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-28 text-xs whitespace-nowrap mt-0.5">
                                  <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {e.start ? new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                    {e.end ? ` – ${new Date(e.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium truncate">{e.title || 'Untitled Event'}</div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge}`}>{isNotion ? 'Notion' : 'ICS'}</span>
                                  </div>
                                  {e.description && <div className={`text-xs mt-1 max-h-10 overflow-hidden ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{e.description}</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="ICS Import" subtitle="Drag & drop or choose a file" right={
              <button className="btn-primary" onClick={() => fileRef.current?.click()}>Import .ics</button>
            }>
              <input ref={fileRef} type="file" accept=".ics,text/calendar" className="hidden" onChange={(e) => e.target.files?.[0] && handleICSImport(e.target.files[0])} />
              {importError && <div className="text-xs text-red-500 mt-2">{importError}</div>}
            </Section>
          </div>

          {/* Right: Intention + Connect */}
          <div className="space-y-5">
            <Section title="Intention → Task" subtitle={useNotion && notionConnected ? 'Will be created in Notion' : 'Will be saved to Firestore'} right={
              <label className="text-xs flex items-center gap-2">
                <input type="checkbox" checked={useNotion} onChange={(e) => setUseNotion(e.target.checked)} />
                <span>Create in Notion</span>
              </label>
            }>
              <div className="flex gap-2">
                <input value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="Write your intention…" className={`flex-1 rounded-xl px-3 py-2 border ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'}`} />
                <button className="btn-primary" onClick={handleCreateTask}>{useNotion && notionConnected ? 'Add to Notion' : 'Add'}</button>
              </div>
            </Section>

            <Section title="Connect Notion" subtitle="Paste token and optional database IDs">
              <div className="space-y-3">
                <div>
                  <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Internal Integration Token</label>
                  <input value={notionAccessToken} onChange={(e) => setNotionAccessToken(e.target.value)} placeholder="secret_..." className={`w-full rounded-xl px-3 py-2 border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Calendar Database ID</label>
                    <input value={notionCalendarDb} onChange={(e) => setNotionCalendarDb(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={`w-full rounded-xl px-3 py-2 border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                  <div>
                    <label className={`text-xs block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tasks Database ID</label>
                    <input value={notionTasksDb} onChange={(e) => setNotionTasksDb(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={`w-full rounded-xl px-3 py-2 border ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-primary" onClick={handleConnectNotion} disabled={notionLoading || !notionAccessToken}>{notionLoading ? 'Connecting…' : notionConnected ? 'Reconnect' : 'Connect Notion'}</button>
                  {notionConnected && <span className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Ready</span>}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share your Notion databases with this integration. Calendar DB needs a Date property named "Date"; Tasks DB expects a Title property "Name".
                </div>
              </div>
            </Section>

            <Section title="Tips">
              <ul className={`list-disc pl-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>Drop an .ics file anywhere in this area to import.</li>
                <li>Event source badges: ICS vs Notion.</li>
                <li>Create your daily intention as a task—toggle Notion to write there.</li>
              </ul>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
