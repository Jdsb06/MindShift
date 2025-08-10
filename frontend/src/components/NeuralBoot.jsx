import React, { useEffect, useState } from 'react';

const LINES = [
  'INITIALIZING NEURAL INTERFACE...',
  'DEFRAGMENTING ATTENTION STREAMS...',
  'PURGING CACHE: [endless_scroll.tmp, burnout.log, distraction.dll]... COMPLETE.',
  'CALIBRATING INTENTION_DRIVE... OK.',
  'LOADING CONSCIOUSNESS_OS v1.0...'
];

export default function NeuralBoot({ onComplete, speed = 28, holdMs = 900 }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    let char = 0;
    let cancelled = false;

    const typeNext = () => {
      if (cancelled) return;
      const target = LINES[currentLine];
      if (char < target.length) {
        setTyped(prev => prev + target[char]);
        char += 1;
        setTimeout(typeNext, speed);
      } else {
        // line finished
        setTimeout(() => {
          if (currentLine < LINES.length - 1) {
            setCurrentLine(idx => idx + 1);
            setTyped('');
          } else {
            // finish
            setDone(true);
            setTimeout(() => onComplete?.(), 500);
          }
        }, holdMs);
      }
    };

    typeNext();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine, done]);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-green-300 font-mono flex items-start justify-start p-6 select-none">
      <div className="w-full">
        {LINES.slice(0, currentLine).map((l, i) => (
          <div key={i} className="mb-1 os-tty-line">{l}</div>
        ))}
        <div className="os-tty-line">
          {typed}<span className="tty-cursor">_</span>
        </div>
      </div>
    </div>
  );
} 