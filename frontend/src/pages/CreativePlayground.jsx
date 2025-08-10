import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GridTrailBackground from '../components/GridTrailBackground';
import { useTheme } from '../contexts/ThemeContext';

export default function CreativePlayground() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [enabled, setEnabled] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [dimBackground, setDimBackground] = useState(true);
  const [autoFlow, setAutoFlow] = useState(true); // stress release mode by default
  const [agentCount, setAgentCount] = useState(100);
  const [cursorPos, setCursorPos] = useState({ x: -9999, y: -9999 });
  const [cursorSize, setCursorSize] = useState(12);
  const [lastMove, setLastMove] = useState({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    // Prevent scroll bounce for the playground
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onMove = (e) => {
      const now = performance.now();
      const { x, y, t } = lastMove;
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      const dt = Math.max(1, now - t);
      const speed = Math.hypot(dx, dy) / dt; // px/ms
      // slower movement => larger dot
      const size = Math.max(10, Math.min(24, 22 - speed * 10));
      setCursorSize(size);
      setLastMove({ x: e.clientX, y: e.clientY, t: now });
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
  <div className={`min-h-screen w-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`} style={{ position: 'relative', cursor: 'none' }}>
      {/* Full-screen creative overlay */}
  <GridTrailBackground enabled={enabled} showGrid={showGrid} dimBackground={dimBackground} autoFlow={autoFlow} agentCount={agentCount} />

      {/* Top promo + controls */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-full bg-gray-700 text-white font-medium hover:bg-gray-600 transition-all shadow-lg"
              title="Back to Dashboard"
            >
              ← Back
            </button>
            <div>
              <div className={`text-base sm:text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                MindShift Create — breathe out the noise, let the flow carry you.
              </div>
              <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Watch the canvas animate itself. Join in with your cursor when you feel like it.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEnabled(v => !v)}
              className={`px-3 py-2 rounded-full text-white font-medium transition-all shadow-lg ${enabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {enabled ? 'Trail: On' : 'Trail: Off'}
            </button>
            <button
              onClick={() => setAutoFlow(v => !v)}
              className={`px-3 py-2 rounded-full text-white font-medium transition-all shadow-lg ${autoFlow ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {autoFlow ? 'Flow: On' : 'Flow: Off'}
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 text-white border border-white/10">
              <span className="text-xs opacity-80">Intensity</span>
              <input type="range" min="30" max="200" value={agentCount} onChange={(e)=>setAgentCount(parseInt(e.target.value,10))} />
            </div>
            <button
              onClick={() => setShowGrid(v => !v)}
              className={`px-3 py-2 rounded-full text-white font-medium transition-all shadow-lg ${showGrid ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {showGrid ? 'Grid: On' : 'Grid: Off'}
            </button>
            <button
              onClick={() => setDimBackground(v => !v)}
              className={`px-3 py-2 rounded-full text-white font-medium transition-all shadow-lg ${dimBackground ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {dimBackground ? 'Dim: On' : 'Dim: Off'}
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event('ms:clearTrail'))}
              className="px-3 py-2 rounded-full bg-gray-700 text-white font-medium hover:bg-gray-600 transition-all shadow-lg"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Center hint */}
      <div className="relative z-10 flex items-center justify-center" style={{ height: 'calc(100vh - 72px)' }}>
        <div className={`text-center px-6 py-4 rounded-xl ${isDark ? 'bg-black/30 text-gray-300' : 'bg-white/70 text-gray-700'} backdrop-blur-md border ${isDark ? 'border-white/10' : 'border-gray-300/50'} shadow-lg`}>
          <div className="text-2xl mb-2">🫁</div>
          <div className="font-medium">Release the pressure. Watch patterns breathe, then add your touch.</div>
          <div className="text-xs opacity-70 mt-1">Tip: Adjust Intensity for calmer or livelier motion.</div>
        </div>
      </div>

      {/* Custom thick-dot cursor */}
      <div
        className="pointer-events-none fixed z-20 rounded-full"
        style={{
          left: cursorPos.x - cursorSize / 2,
          top: cursorPos.y - cursorSize / 2,
          width: cursorSize,
          height: cursorSize,
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 60%, transparent 70%)',
          boxShadow: '0 0 16px 4px rgba(255,255,255,0.25)',
          transform: 'translateZ(0)',
          transition: 'width 120ms ease, height 120ms ease',
          mixBlendMode: isDark ? 'screen' : 'multiply'
        }}
      />
    </div>
  );
}
