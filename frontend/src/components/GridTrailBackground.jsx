import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Canvas-based grid + mouse trail background for the dashboard
// - Semi-black backdrop
// - 1.5cm grid lines (approx in CSS pixels)
// - Colorful fading trail following the cursor
// Optimized: DPR-aware, rAF loop only when needed, capped point buffer
export default function GridTrailBackground({ enabled = true, showGrid = true, dimBackground = false, autoFlow = false, agentCount = 80, strokeWidth = 26, fadeStrength = 0.08 }) {
  const canvasRef = useRef(null);
  const runningRef = useRef(false);
  const lastPointRef = useRef(null); // last mouse point
  const lastFrameRef = useRef(0);
  const resizeObserverRef = useRef(null);
  const { isDark } = useTheme();
  const backCanvasRef = useRef(null); // offscreen for grid caching
  const agentsRef = useRef([]); // autonomous agents for stress-release flow
  const trailCanvasRef = useRef(null); // offscreen trail buffer
  const lastStrokeAtRef = useRef(0);

  // Convert cm to CSS px (spec: 1in = 96px, 1cm = 96/2.54)
  const cmToPx = (cm) => (96 / 2.54) * cm;

  // Drawing configuration
  const GRID_CM = 1.5; // requested spacing
  const GRID_SIZE_PX = cmToPx(GRID_CM); // CSS px (will multiply by DPR inside)
  const TRAIL_MAX_AGE = 3000; // ms
  const TRAIL_MAX_POINTS = 600; // cap to avoid unbounded growth

  useEffect(() => {
  if (!enabled) {
      // If disabled, ensure no canvas work occurs
      lastPointRef.current = null;
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function setSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf
      const { innerWidth: w, innerHeight: h } = window;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing to CSS px space

  // Prepare/update back buffer for cached grid
      if (showGrid || dimBackground) {
        if (!backCanvasRef.current) backCanvasRef.current = document.createElement('canvas');
        const back = backCanvasRef.current;
        back.width = Math.floor(w * dpr);
        back.height = Math.floor(h * dpr);
        const bctx = back.getContext('2d');
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawGridTo(bctx, w, h, { dim: dimBackground });
      } else {
        backCanvasRef.current = null;
      }

  // Prepare/update offscreen trail canvas
  if (!trailCanvasRef.current) trailCanvasRef.current = document.createElement('canvas');
  const tcan = trailCanvasRef.current;
  tcan.width = Math.floor(w * dpr);
  tcan.height = Math.floor(h * dpr);
  const tctx = tcan.getContext('2d');
  tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  tctx.clearRect(0, 0, w, h);

      // Initialize or reset flow agents
      if (autoFlow) {
        const agents = [];
        for (let i = 0; i < agentCount; i++) {
          agents.push({
            x: Math.random() * w,
            y: Math.random() * h,
            hueOff: Math.random() * 360,
            hist: [], // recent positions for short trail
          });
        }
        agentsRef.current = agents;
      } else {
        agentsRef.current = [];
      }
    }

    setSize();
    const handleResize = () => setSize();
    window.addEventListener('resize', handleResize);

    // Optional: use ResizeObserver to catch container changes
    if ('ResizeObserver' in window) {
      resizeObserverRef.current = new ResizeObserver(setSize);
      try { resizeObserverRef.current.observe(document.body); } catch {}
    }

    const onPointerMove = (e) => {
      if (!trailCanvasRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const tctx = trailCanvasRef.current.getContext('2d');
      const handle = (ev) => {
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const now = performance.now();
        drawStroke(tctx, lastPointRef.current, { x, y, t: now });
        lastPointRef.current = { x, y, t: now };
        lastStrokeAtRef.current = now;
      };
      const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : null;
      if (events && events.length) {
        for (const ev of events) handle(ev);
      } else {
        handle(e);
      }
      if (!runningRef.current) {
        runningRef.current = true;
        lastFrameRef.current = performance.now();
        requestAnimationFrame(tick);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    function drawGridTo(targetCtx, width, height, { dim }) {
      // optional semi-blackish background fill when dimming is requested
      if (dim) {
        targetCtx.fillStyle = isDark ? 'rgba(3,7,18,0.88)' : 'rgba(17,24,39,0.85)';
        targetCtx.fillRect(0, 0, width, height);
      } else {
        targetCtx.clearRect(0, 0, width, height);
      }

      const grid = GRID_SIZE_PX;

      // choose subtle grid colors
      const thin = 'rgba(255,255,255,0.08)';
      const bold = 'rgba(255,255,255,0.16)';

      targetCtx.save();
      targetCtx.beginPath();
      // vertical lines
      for (let x = 0; x <= width; x += grid) {
        targetCtx.moveTo(x + 0.5, 0);
        targetCtx.lineTo(x + 0.5, height);
      }
      // horizontal lines
      for (let y = 0; y <= height; y += grid) {
        targetCtx.moveTo(0, y + 0.5);
        targetCtx.lineTo(width, y + 0.5);
      }
      targetCtx.strokeStyle = thin;
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
      targetCtx.restore();

      // every 5th line bolder
      targetCtx.save();
      targetCtx.beginPath();
      for (let x = 0; x <= width; x += grid * 5) {
        targetCtx.moveTo(x + 0.5, 0);
        targetCtx.lineTo(x + 0.5, height);
      }
      for (let y = 0; y <= height; y += grid * 5) {
        targetCtx.moveTo(0, y + 0.5);
        targetCtx.lineTo(width, y + 0.5);
      }
      targetCtx.strokeStyle = bold;
      targetCtx.lineWidth = 1;
      targetCtx.stroke();
      targetCtx.restore();
    }

    // Draw a fast thick segment to the trail buffer
    function drawStroke(tctx, p0, p1) {
      if (!p1) return;
      tctx.lineCap = 'round';
      tctx.lineJoin = 'round';
      const now = p1.t || performance.now();
      const hue = (now * 0.06) % 360;
      const light = isDark ? 65 : 55;
      tctx.strokeStyle = `hsl(${hue}, 90%, ${light}%)`;
      tctx.lineWidth = strokeWidth;
      tctx.beginPath();
      if (p0) {
        tctx.moveTo(p0.x, p0.y);
        tctx.lineTo(p1.x, p1.y);
      } else {
        tctx.moveTo(p1.x, p1.y);
        tctx.lineTo(p1.x + 0.01, p1.y + 0.01);
      }
      tctx.stroke();
    }

    // Update and draw autonomous flow agents to trail buffer
    function updateAndDrawAgents(now, width, height) {
      if (!autoFlow || agentsRef.current.length === 0) return false;
      const tctx = trailCanvasRef.current?.getContext('2d');
      if (!tctx) return false;
      tctx.lineCap = 'round';
      tctx.lineJoin = 'round';

      const t = now * 0.0015; // time factor for field
      const freq = 0.006;     // spatial frequency
      const speed = 0.9;      // step size
      const maxHist = 18;     // short trail history per agent

      for (let i = 0; i < agentsRef.current.length; i++) {
        const a = agentsRef.current[i];
        // Flow field angle (smooth pseudo-noise via sin/cos mix)
        const ang = Math.sin((a.x + t * 120) * freq) + Math.cos((a.y - t * 140) * freq);
        const vx = Math.cos(ang) * speed;
        const vy = Math.sin(ang) * speed;
        const nx = a.x + vx;
        const ny = a.y + vy;

        // Keep within bounds, wrap around softly
        a.x = (nx + width) % width;
        a.y = (ny + height) % height;

        // Push to history
        a.hist.push({ x: a.x, y: a.y, t: now });
        if (a.hist.length > maxHist) a.hist.shift();

        // Draw the short ribbon
        for (let j = 1; j < a.hist.length; j++) {
          const p0 = a.hist[j - 1];
          const p1 = a.hist[j];
          const thickness = 3 + (j / maxHist) * 3; // 3..6px along ribbon
          const hue = (a.hueOff + now * 0.05 + i) % 360;
          const light = isDark ? 65 : 55;
          tctx.strokeStyle = `hsl(${hue}, 85%, ${light}%)`;
          tctx.lineWidth = thickness;
          tctx.beginPath();
          tctx.moveTo(p0.x, p0.y);
          tctx.lineTo(p1.x, p1.y);
          tctx.stroke();
        }
      }
      return true;
    }

    function drawTrail(now) {
      const pts = pointsRef.current;
      const cutoff = now - TRAIL_MAX_AGE;
      // drop old points
      while (pts.length && pts[0].t < cutoff) pts.shift();
      if (pts.length < 2) return false;

      // Fluid look: additive blending, round joins, speed-based width and glow
      const prevComp = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1];
        const p1 = pts[i];
        const age = (now - p1.t) / TRAIL_MAX_AGE; // 0 fresh → 1 old
        if (age > 1) continue;
        const alpha = Math.max(0.05, 1 - age);

        // Speed-based thickness (slower → thicker)
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const dt = Math.max(1, p1.t - p0.t);
        const speed = Math.hypot(dx, dy) / dt; // px per ms
        const speedClamped = Math.min(speed, 1.2);
        const thickness = 9 - speedClamped * 6; // ~3px to 9px

        const hue = (now * 0.04 + i * 2.5) % 360; // animated rainbow
        const lightness = isDark ? 60 : 50;
        const color = `hsla(${hue}, 90%, ${lightness}%, ${0.55 * alpha})`;

        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.shadowColor = `hsla(${hue}, 90%, ${lightness}%, ${0.35 * alpha})`;
        ctx.shadowBlur = 8;

        // Slight smoothing using quadratic curve toward midpoint
        const mx = (p0.x + p1.x) * 0.5;
        const my = (p0.y + p1.y) * 0.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
        ctx.stroke();
      }

      // Reset shadow/blend
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = prevComp;
      return true;
    }

    const tick = (now) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      // Fade trail buffer slightly for afterglow
      if (trailCanvasRef.current) {
        const tctx = trailCanvasRef.current.getContext('2d');
        tctx.save();
        tctx.globalCompositeOperation = 'destination-out';
        tctx.fillStyle = `rgba(0,0,0,${fadeStrength})`;
        tctx.fillRect(0, 0, width, height);
        tctx.restore();
      }

      // Clear and redraw scene using cached grid
      ctx.clearRect(0, 0, width, height);
      const back = backCanvasRef.current;
      if (back) {
        ctx.drawImage(back, 0, 0, back.width, back.height, 0, 0, width, height);
      }
      const hasAgents = updateAndDrawAgents(now, width, height);
      // Composite the trail buffer
      if (trailCanvasRef.current) {
        ctx.drawImage(trailCanvasRef.current, 0, 0, trailCanvasRef.current.width, trailCanvasRef.current.height, 0, 0, width, height);
      }
      // Keep animating while trail exists (fades out), else pause
      if (hasAgents || autoFlow || (performance.now() - lastStrokeAtRef.current) < 250) {
        requestAnimationFrame(tick);
      } else {
        runningRef.current = false;
      }
    };

    // Allow external clear via custom event
    const onClear = () => {
      lastPointRef.current = null;
      // Redraw grid immediately
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      if (trailCanvasRef.current) {
        const tctx = trailCanvasRef.current.getContext('2d');
        tctx.clearRect(0, 0, width, height);
      }
      const back = backCanvasRef.current;
      if (back) {
        ctx.drawImage(back, 0, 0, back.width, back.height, 0, 0, width, height);
      }
    };
    window.addEventListener('ms:clearTrail', onClear);

    // Initial render
    requestAnimationFrame((t) => {
      lastFrameRef.current = t;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      if (backCanvasRef.current) {
        ctx.drawImage(
          backCanvasRef.current,
          0,
          0,
          backCanvasRef.current.width,
          backCanvasRef.current.height,
          0,
          0,
          canvas.clientWidth,
          canvas.clientHeight
        );
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
  if (resizeObserverRef.current) {
        try { resizeObserverRef.current.disconnect(); } catch {}
      }
  window.removeEventListener('ms:clearTrail', onClear);
      runningRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GRID_SIZE_PX, isDark, enabled, showGrid, dimBackground, autoFlow, agentCount]);

  return (
    enabled ? (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    ) : null
  );
}
