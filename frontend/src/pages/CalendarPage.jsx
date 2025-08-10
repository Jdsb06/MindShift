import React, { useEffect, useState } from 'react';
import MonthCalendar from '../components/MonthCalendar';
import CalendarTasksOverlay from '../components/CalendarTasksOverlay';
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function CalendarPage() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Calendar</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your upcoming events and intentions at a glance.</p>
          </div>
          <button className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-950 border-gray-800 hover:bg-gray-900' : 'bg-white border-gray-300 hover:bg-gray-100'}`} onClick={() => setIsOpen(true)}>
            Open Overlay
          </button>
        </div>
        <MonthCalendar events={events} />
      </div>

      <CalendarTasksOverlay
        user={user}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onEventsChange={(evts) => {
          // Support overlay sending either array or updater fn
          if (typeof evts === 'function') {
            setEvents((prev) => evts(prev));
          } else if (Array.isArray(evts)) {
            setEvents(evts);
          }
        }}
      />
    </div>
  );
}
