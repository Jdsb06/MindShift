import React, { useMemo, useState } from 'react';

const demoGoals = ['Health', 'Deep Work', 'Relationships'];
const demoTags = ['#focus', '#gym', '#gratitude'];

export default function InteractiveTeaser() {
  const [text, setText] = useState('');
  const [log, setLog] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const atPos = useMemo(() => text.lastIndexOf('@'), [text]);
  const hashPos = useMemo(() => text.lastIndexOf('#'), [text]);

  const onChange = (e) => {
    const v = e.target.value;
    setText(v);
    const lastPos = Math.max(v.lastIndexOf('@'), v.lastIndexOf('#'));
    const last = lastPos >= 0 ? v.slice(lastPos) : '';
    if (last.startsWith('@')) {
      setSuggestions(demoGoals.map(g => '@' + g));
    } else if (last.startsWith('#')) {
      setSuggestions(demoTags);
    } else {
      setSuggestions([]);
    }
  };

  const submit = () => {
    if (!text.trim()) return;
    setLog([{ id: Date.now(), text }, ...log]);
    setText('');
    setSuggestions([]);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <h3 className="text-white text-2xl font-semibold mb-4">Try it now</h3>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={onChange}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder='Type a win… use #tags and @goals'
          className="input-modern flex-1"
        />
        <button className="btn-primary" onClick={submit}>Add ✨</button>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <span key={s} className="px-2 py-1 rounded-md bg-indigo-600/20 text-indigo-300 text-xs">{s}</span>
          ))}
        </div>
      )}
      <div className="mt-6 space-y-2">
        {log.map(item => (
          <div key={item.id} className="p-3 rounded-lg bg-white/5 border border-white/10 text-gray-200">{item.text}</div>
        ))}
      </div>
    </section>
  );
} 