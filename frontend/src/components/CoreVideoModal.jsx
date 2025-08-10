import React from 'react';

export default function CoreVideoModal({ isOpen, onClose, src = '/hero-loop.mp4', poster = '/hero-poster.jpg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden core-frame">
        <video className="h-full w-full object-cover" src={src} poster={poster} autoPlay muted playsInline controls />
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 rounded-full p-2">✕</button>
      </div>
    </div>
  );
} 