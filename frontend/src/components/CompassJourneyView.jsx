import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import ProgressRing from './ProgressRing';

export default function CompassJourneyView({ user, goal, goalId, compassGoals, momentumLogs, onClose }) {
  const { isDark, colorScheme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [milestone, setMilestone] = useState('');
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(goalId || goal || '');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [animatedEntry, setAnimatedEntry] = useState(null);
  const timelineRef = useRef(null);

  // New UX state
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'grid'
  const [range, setRange] = useState('all'); // 'all' | '30' | '7'
  const [queryText, setQueryText] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [story, setStory] = useState(null);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [localMilestones, setLocalMilestones] = useState([]); // ephemeral client-side milestones

  const availableGoals = useMemo(() => {
    if (!compassGoals) return [];
    return Object.values(compassGoals).filter(Boolean);
  }, [compassGoals]);

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    entries.forEach(e => Array.isArray(e.tags) && e.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [entries]);

  useEffect(() => {
    // initialize selected goal if not provided
    if (!selectedGoal && availableGoals.length > 0) {
      setSelectedGoal(availableGoals[0]);
    }
  }, [selectedGoal, availableGoals]);

  useEffect(() => {
    if (selectedGoal) {
      fetchGoalEntries(selectedGoal);
    }
  }, [selectedGoal, user]);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setQueryText(searchInput), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  const fetchGoalEntries = async (goalString) => {
    setIsLoading(true);
    try {
      if (user) {
        const logsRef = collection(db, 'users', user.uid, 'momentumLogs');
        const q = query(
          logsRef,
          where('linkedGoal', '==', goalString),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const entriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        setEntries(entriesData);
      } else if (momentumLogs) {
        // fallback to provided logs
        const filtered = momentumLogs
          .filter(l => l.linkedGoal === goalString)
          .map(l => ({
            id: l.id,
            ...l,
            createdAt: l.createdAt?.toDate ? l.createdAt.toDate() : (l.createdAt || new Date())
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEntries(filtered);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Error fetching goal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filters
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (range === '7') start.setDate(now.getDate() - 7);
    if (range === '30') start.setDate(now.getDate() - 30);

    return entries.filter(e => {
      const d = new Date(e.createdAt);
      if (range !== 'all' && d < start) return false;
      if (queryText && !(e.text || e.content || '').toLowerCase().includes(queryText.toLowerCase())) return false;
      if (activeTags.length > 0 && !((e.tags || []).some(t => activeTags.includes(t)))) return false;
      return true;
    });
  }, [entries, range, queryText, activeTags]);

  const groupedEntriesMemo = useMemo(() => {
    const grouped = {};
    filteredEntries.forEach(entry => {
      const dateStr = formatDate(entry.createdAt);
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(entry);
    });
    return grouped;
  }, [filteredEntries]);

  const activeDaysCount = useMemo(() => {
    const days = new Set(filteredEntries.map(e => new Date(e.createdAt).toDateString()));
    return days.size;
  }, [filteredEntries]);

  const progressPct = useMemo(() => {
    // Heuristic: 10 steps = 100%
    const totalSteps = 10;
    const pct = Math.min((filteredEntries.length / totalSteps), 1);
    return pct;
  }, [filteredEntries.length]);

  const handleAddMilestone = async () => {
    setShowMilestoneInput(false);
    if (milestone.trim()) {
      // Ephemeral add; can persist later
      setLocalMilestones(prev => [
        { id: `${Date.now()}`, text: milestone.trim(), createdAt: new Date(), goal: selectedGoal },
        ...prev
      ]);
    }
    setMilestone('');
  };

  // Get color based on current theme
  const getThemeColor = () => {
    switch (colorScheme) {
      case 'ocean':
        return { primary: 'from-blue-500 to-cyan-400', accent: 'bg-blue-500', border: 'border-blue-500' };
      case 'sunset':
        return { primary: 'from-amber-500 to-red-400', accent: 'bg-amber-500', border: 'border-amber-500' };
      case 'forest':
        return { primary: 'from-emerald-500 to-green-400', accent: 'bg-emerald-500', border: 'border-emerald-500' };
      case 'lavender':
        return { primary: 'from-purple-500 to-fuchsia-400', accent: 'bg-purple-500', border: 'border-purple-500' };
      default:
        return { primary: 'from-indigo-500 to-blue-400', accent: 'bg-indigo-500', border: 'border-indigo-500' };
    }
  };
  
  const themeColor = getThemeColor();
  
  // Handle entry animation
  const handleEntryHover = (entry) => {
    setAnimatedEntry(entry.id);
  };
  
  const handleEntryLeave = () => {
    setAnimatedEntry(null);
  };
  
  // Effect to scroll entries into view when clicking on timeline
  useEffect(() => {
    if (activeIndex >= 0 && timelineRef.current) {
      const entryElements = timelineRef.current.querySelectorAll('.entry-item');
      if (entryElements[activeIndex]) {
        entryElements[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  // Lightweight story mode (local, no network)
  const generateStory = () => {
    setGeneratingStory(true);
    try {
      const count = filteredEntries.length;
      const tagCounts = {};
      filteredEntries.forEach(e => (e.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
      const topTags = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t])=>t);
      const first = filteredEntries[filteredEntries.length-1];
      const last = filteredEntries[0];
      const startStr = first ? new Date(first.createdAt).toLocaleDateString() : '';
      const endStr = last ? new Date(last.createdAt).toLocaleDateString() : '';
      const line = `From ${startStr} to ${endStr}, you took ${count} meaningful step${count!==1?'s':''} toward “${selectedGoal}”.`;
      const focus = topTags.length ? ` Your energy clustered around ${topTags.map(t=>`#${t}`).join(', ')}.` : '';
      const cadence = activeDaysCount >= 5 ? ' Consistency is becoming your edge.' : (count >= 3 ? ' Momentum is forming—keep the rhythm gentle and steady.' : ' A spark has started—feed it with one small action each day.');
      setStory(line + focus + cadence);
    } finally {
      setGeneratingStory(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-64 flex justify-center items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin border-gradient-to-r"></div>
          <div className={`absolute inset-0 bg-gradient-to-r ${themeColor.primary} opacity-30 rounded-full blur-sm`}></div>
        </div>
      </div>
    );
  }

  const groupedEntries = groupedEntriesMemo;

  return (
    <div className={`h-full overflow-y-auto ${isDark ? 'text-white' : 'text-gray-800'}`}>
      {/* Header with glassmorphism effect */}
      <div
        className={`sticky top-0 z-10 backdrop-blur-lg border-b p-4 flex items-center justify-between ${isDark ? 'bg-gray-900/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}
      >
        <div className="flex items-center">
          <button
            onClick={onClose}
            className={`p-2 mr-3 rounded-full transition-all duration-300 hover:scale-110 ${isDark ? 'hover:bg-gray-800/70' : 'hover:bg-gray-100/70'}`}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight flex items-center truncate">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 animate-pulse ${themeColor.accent}`}></span>
              <span className="bg-gradient-to-r bg-clip-text text-transparent from-indigo-400 to-sky-400 truncate" title={selectedGoal || goal}>
                Journey: {(selectedGoal || goal) || ''}
              </span>
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Direction over distraction. Follow the thread of meaningful action.
            </p>
          </div>
        </div>
        {/* Progress + Goal switcher */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-white/10">
            <ProgressRing progress={progressPct} size={44} color={["#6366F1"]}>
              <span className="text-xs">{Math.round(progressPct*100)}%</span>
            </ProgressRing>
            <div className="text-xs">
              <div className="font-medium">Progress</div>
              <div className={`${isDark?'text-gray-400':'text-gray-600'}`}>{filteredEntries.length} steps</div>
            </div>
          </div>
          {availableGoals.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-[50%]">
              {availableGoals.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGoal(g)}
                  className={`px-4 py-1.5 rounded-full border text-sm whitespace-nowrap transition-all duration-300 ${selectedGoal === g ? 'transform hover:scale-105' : 'hover:border-indigo-400'}`}
                  style={{
                    background: selectedGoal === g ? `linear-gradient(to right, var(--color-${colorScheme || 'primary'}-500), var(--color-${colorScheme || 'primary'}-400))` : 'transparent',
                    borderColor: selectedGoal === g ? 'transparent' : 'rgba(99,102,241,0.4)',
                    boxShadow: selectedGoal === g ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pt-3 pb-1">
    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
      <div className={`flex items-center gap-1 p-1 rounded-xl border self-start ${isDark ? 'bg-gray-900/60 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
            {['timeline','grid'].map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
        className={`px-3 py-1.5 rounded-lg text-sm ${viewMode===v ? 'bg-indigo-600 text-white' : isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {v === 'timeline' ? 'Timeline' : 'Grid'}
              </button>
            ))}
            <div className="ml-2 hidden sm:flex items-center gap-1 text-xs">
              <span className={`${isDark?'text-gray-300':'text-gray-700'}`}>Active days:</span>
              <span className="font-medium">{activeDaysCount}</span>
            </div>
      </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-end">
            <div className="flex items-center gap-1">
              {[
                {id:'all', label:'All'},
                {id:'30', label:'30d'},
                {id:'7', label:'7d'}
              ].map(r => (
        <button key={r.id} onClick={()=>setRange(r.id)} className={`px-2.5 py-1.5 rounded-md text-xs ${range===r.id?'bg-indigo-600 text-white': isDark?'text-gray-300':'text-gray-700'}`}>{r.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
        value={searchInput}
        onChange={e=>setSearchInput(e.target.value)}
                placeholder="Search entries…"
                className={`px-3 py-2 rounded-lg text-sm border ${isDark?'bg-gray-800 border-gray-700 text-white placeholder-gray-400':'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              />
              <button onClick={()=>{setQueryText(''); setActiveTags([]); setRange('all');}} className={`text-xs px-3 py-2 rounded-lg border ${isDark?'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700':'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'}`}>Clear</button>
            </div>
          </div>
        </div>

        {availableTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {availableTags.map(t => {
              const active = activeTags.includes(t);
              return (
                <button key={t} onClick={()=> setActiveTags(prev => active ? prev.filter(x=>x!==t) : [...prev, t])}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${active ? 'bg-indigo-600 text-white border-indigo-600' : isDark?'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600':'bg-gray-100 text-gray-800 border-gray-300 hover:border-gray-400'}`}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative flex p-4">
        {/* Interactive timeline navigation */}
        <div className="hidden md:block w-24 mr-6 sticky top-28 self-start h-[calc(100vh-220px)] overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              TIMELINE
            </div>
            
            {/* Timeline visualization */}
            <div className="relative flex-1 flex flex-col items-center">
              <div className={`absolute left-3 top-2 bottom-2 w-0.5 ${themeColor.border} opacity-60`}></div>
              
              {Object.entries(groupedEntries).map(([date, entries], idx) => (
                <div 
                  key={date} 
                  className="relative z-10 mb-6 w-full"
                  onClick={() => setActiveIndex(idx)}
                >
                  <div 
                    className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center cursor-pointer
                      ${activeIndex === idx 
                        ? `${themeColor.accent} shadow-lg shadow-indigo-500/30` 
                        : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    <span className="text-xs font-medium">
                      {entries.length}
                    </span>
                  </div>
                  <div className="pl-8 text-xs">
                    {new Date(entries[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
              
              {entries.length === 0 && (
                <div className={`mt-8 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No journey data yet
                </div>
              )}
            </div>
          </div>
        </div>
      
        {/* Main content area */}
        <div className="flex-1" ref={timelineRef}>
          {/* Story & quick stats */}
          <div className={`mb-4 p-4 rounded-xl border ${isDark ? 'bg-gray-900/70 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-sm`}> 
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">🧩</span>
                <div>
                  <div className="text-sm font-medium">Highlights</div>
                  <div className={`text-xs ${isDark?'text-gray-400':'text-gray-600'}`}>{filteredEntries.length} entries • {activeDaysCount} active days</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={generateStory} disabled={generatingStory} className={`px-3 py-2 rounded-lg text-sm ${generatingStory ? 'opacity-70 cursor-not-allowed' : ''} ${isDark?'bg-indigo-600 hover:bg-indigo-500 text-white':'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>{generatingStory? 'Weaving your story…' : 'Story mode'}</button>
                {story && (
                  <button onClick={()=>{navigator.clipboard?.writeText(story);}} className={`px-3 py-2 rounded-lg text-sm ${isDark?'bg-gray-800 text-gray-200 hover:bg-gray-700':'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>Copy</button>
                )}
              </div>
            </div>
            {story && (
              <div className={`mt-3 text-sm ${isDark?'text-gray-200':'text-gray-700'}`}>{story}</div>
            )}
          </div>

          {/* Add milestone section */}
          {showMilestoneInput ? (
            <div className={`relative mb-6 p-5 rounded-xl border backdrop-blur-sm
              ${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="absolute top-0 right-0 left-0 h-1 overflow-hidden rounded-t-xl">
                <div className={`h-full w-full bg-gradient-to-r ${themeColor.primary}`}></div>
              </div>
            
              <label className="block text-sm font-medium mb-2 mt-1">Add a milestone for this goal</label>
              <input
                type="text"
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                className={`w-full p-3 rounded-lg border text-sm mb-3 focus:ring-2 focus:outline-none transition-all
                  ${isDark 
                    ? 'bg-gray-700/60 border-gray-600 text-white focus:ring-indigo-500/30' 
                    : 'bg-white/70 border-gray-300 text-gray-800 focus:ring-indigo-500/20'
                  }`}
                placeholder="E.g., Completed first 5K run"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowMilestoneInput(false)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105
                    ${isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMilestone}
                  disabled={!milestone.trim()}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-300
                    ${milestone.trim()
                      ? `bg-gradient-to-r ${themeColor.primary} text-white hover:scale-105 hover:shadow-lg shadow-md shadow-indigo-500/20`
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                >
                  Add Milestone
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowMilestoneInput(true)}
              className={`group w-full mb-6 p-4 rounded-lg border border-dashed text-center transition-all duration-300
                ${isDark 
                  ? 'border-gray-600 hover:border-indigo-500/70 hover:bg-indigo-900/10 text-gray-200' 
                  : 'border-gray-300 hover:border-indigo-400/70 hover:bg-indigo-50/50 text-gray-700'
                }`}
            >
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-90 ${isDark ? 'group-hover:text-indigo-400' : 'group-hover:text-indigo-600'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className={isDark ? 'group-hover:text-indigo-400' : 'group-hover:text-indigo-600'}>
                  Add a milestone
                </span>
              </span>
            </button>
          )}

          {/* Local milestones list (ephemeral) */}
          {localMilestones.length > 0 && (
            <div className="mb-6">
              <div className={`text-sm mb-2 ${isDark?'text-gray-300':'text-gray-700'}`}>Milestones</div>
              <div className="space-y-2">
                {localMilestones.map(ms => (
                  <div key={ms.id} className={`p-3 rounded-lg border ${isDark?'bg-gray-800/80 border-gray-700':'bg-white/80 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🏁</span>
                        <div>
                          <div className="text-sm font-medium">{ms.text}</div>
                          <div className={`text-xs ${isDark?'text-gray-400':'text-gray-600'}`}>{new Date(ms.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <button onClick={()=> setLocalMilestones(prev => prev.filter(x=>x.id!==ms.id))} className={`text-xs px-2 py-1 rounded-md ${isDark?'bg-gray-700 hover:bg-gray-600 text-gray-200':'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredEntries.length === 0 ? (
            <div className={`text-center p-12 rounded-xl border ${
              isDark 
                ? 'bg-gray-800/50 border-gray-700/50 text-gray-200' 
                : 'bg-gray-50/50 border-gray-200/50 text-gray-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">No entries for this goal yet</p>
              <p className="text-sm mt-2 max-w-xs mx-auto">
                Your journey entries linked to "{selectedGoal || goal}" will appear here as you add them. Try widening filters.
              </p>
            </div>
          ) : (
            viewMode === 'timeline' ? (
              <div className="space-y-8">
                {Object.entries(groupedEntries).map(([date, dayEntries], dateIndex) => (
                  <div 
                    key={date} 
                    className={`entry-item relative border-l-2 pl-6 pb-8 ${themeColor.border}`}
                    data-index={dateIndex}
                  >
                    {/* Date marker with pulsing effect */}
                    <div className={`absolute -left-[9px] w-4 h-4 rounded-full ${themeColor.accent} shadow-md shadow-indigo-500/30`}>
                      <div className={`absolute inset-0 rounded-full ${themeColor.accent} animate-ping opacity-30`}></div>
                    </div>
                    
                    <h3 className={`font-medium mb-3 flex items-center ${
                      isDark ? 'text-indigo-300' : 'text-indigo-700'
                    }`}>
                      <span className="text-xl">{date}</span>
                      <span className={`ml-3 text-sm px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {dayEntries.length} {dayEntries.length===1?'entry':'entries'}
                      </span>
                    </h3>
                    
                    <div className="space-y-4">
                      {dayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`group p-4 rounded-xl transition-all duration-300 relative overflow-hidden
                            ${animatedEntry === entry.id ? 'scale-[1.01]' : ''}
                            ${isDark 
                              ? 'bg-gray-800/90 hover:bg-gray-750/90 border border-gray-700' 
                              : 'bg-white hover:bg-gray-50 border border-gray-200'
                            }`}
                          style={{ boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.06)' }}
                          onMouseEnter={() => handleEntryHover(entry)}
                          onMouseLeave={handleEntryLeave}
                        >
                          {/* Gradient accent strip */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeColor.primary}`}></div>
                          {/* Entry time */}
                          <div className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                          
                          {/* Entry content with advanced formatting */}
                          <p className="text-base leading-relaxed">{entry.text || entry.content}</p>
                          
                          {/* Tags with interactive hover effects */}
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {entry.tags.map(tag => (
                                <span
                                  key={tag}
                                  className={`text-xs px-2.5 py-1 rounded-full transition-all duration-300 
                                    ${isDark 
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-650 hover:text-white' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    } hover:scale-105`}
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEntries.map(entry => (
                  <div key={entry.id} className={`p-4 rounded-xl border transition-all relative overflow-hidden ${isDark?'bg-gray-800/90 border-gray-700 hover:bg-gray-750/90':'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${themeColor.primary}`}></div>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`text-xs ${isDark?'text-gray-400':'text-gray-500'}`}>
                        {new Date(entry.createdAt).toLocaleDateString()} • {new Date(entry.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </div>
                      {entry.tags && entry.tags.length>0 && (
                        <div className="flex flex-wrap gap-1 ml-2">
                          {entry.tags.slice(0,3).map(tag => (
                            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full ${isDark?'bg-gray-700 text-gray-300':'bg-gray-100 text-gray-700'}`}>#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{entry.text || entry.content}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
