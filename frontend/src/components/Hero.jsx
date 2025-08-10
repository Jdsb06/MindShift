import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function Hero({ onCta }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const prefersReducedMotion = useMemo(() =>
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (prefersReducedMotion) {
        v.pause();
      } else {
        v.muted = muted;
        v.play().catch(() => {});
      }
    } catch {}
  }, [muted, prefersReducedMotion]);

  return (
    <section className="relative h-[100vh] w-full overflow-hidden">
      <div className="brand-blob brand-blob--1" />
      <div className="brand-blob brand-blob--2" />
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover ${prefersReducedMotion ? 'opacity-80' : ''} mask-fade-bottom`}
        src="/hero-loop.mp4"
        poster="/hero-poster.jpg"
        autoPlay={!prefersReducedMotion}
        muted={muted}
        playsInline
        loop
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

      <button
        aria-label={muted ? 'Unmute background video' : 'Mute background video'}
        onClick={() => setMuted(m => !m)}
        className="absolute top-4 right-4 z-20 px-3 py-2 rounded-full text-white/90 backdrop-blur-sm bg-black/30 hover:bg-black/50"
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          <span className="gradient-text">Find your focus.</span>
        </h1>
        <p className="mt-4 text-gray-300 text-lg sm:text-xl">
          Intention as self-care. Clarity in the noise.
        </p>
        <button onClick={onCta} className="btn-primary mt-8 px-8 py-4 text-lg animate-glow-pulse">
          Experience MindShift →
        </button>
      </div>
    </section>
  );
} 