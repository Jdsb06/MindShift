import React, { useEffect, useRef } from 'react';

export default function PostSignupIntro({ isOpen, onClose, durationMs = 4000 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    let h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const to = setTimeout(onClose, durationMs);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    window.addEventListener('resize', onResize);

    // Torus parameters
    const R = 140; // major radius
    const r = 46;  // minor radius
    const points = [];
    const dotCountU = 48;
    const dotCountV = 22;
    for (let i = 0; i < dotCountU; i++) {
      for (let j = 0; j < dotCountV; j++) {
        points.push({ u: (i / dotCountU) * Math.PI * 2, v: (j / dotCountV) * Math.PI * 2 });
      }
    }

    let t = 0;
    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      // background glow
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / (2 * window.devicePixelRatio);
      const cy = h / (2 * window.devicePixelRatio);

      // rotate and draw
      points.forEach(p => {
        // Parametric torus
        const cu = Math.cos(p.u + t * 0.9);
        const su = Math.sin(p.u + t * 0.9);
        const cv = Math.cos(p.v + t * 1.6);
        const sv = Math.sin(p.v + t * 1.6);

        let x = (R + r * cv) * cu;
        let y = (R + r * cv) * su;
        let z = r * sv;

        // Extra rotation on Z/X
        const ang = t * 0.5;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const x1 = x * ca - y * sa;
        const y1 = x * sa + y * ca;
        const z1 = z;

        // Simple perspective projection
        const depth = 420;
        const scale = depth / (depth - z1);
        const px = cx + x1 * 0.9 * scale;
        const py = cy + y1 * 0.6 * scale;
        const size = 2.2 * scale;

        // Color by angle
        const col = `hsl(${(p.u / (Math.PI * 2)) * 300 + 250}, 90%, ${60 + sv * 15}%)`;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Title
      ctx.font = '600 24px Inter, ui-sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText('Welcome to MindShift', cx, cy - 120);
      ctx.font = '400 14px Inter, ui-sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Compiling your focus modules…', cx, cy - 95);
    };
    render();

    return () => {
      clearTimeout(to);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen, durationMs, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90">
      <canvas ref={canvasRef} className="w-[90vw] h-[70vh] rounded-2xl core-frame" />
      <button className="absolute top-5 right-5 color-scheme-toggle" onClick={onClose} aria-label="Skip intro">Skip</button>
    </div>
  );
} 