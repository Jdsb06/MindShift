import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 bg-white/5 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-start justify-between gap-4 text-left p-5 hover:bg-white/5"
        aria-expanded={open}
        aria-controls={`faq-panel-${index}`}
        onClick={() => setOpen(!open)}
      >
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">{item.q}</h3>
          <p className="mt-1 text-xs text-indigo-300 uppercase tracking-wide">{item.tag}</p>
        </div>
        <span className="mt-1 shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/10 text-gray-300">
          {open ? (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
          )}
        </span>
      </button>
      {open && (
        <div id={`faq-panel-${index}`} className="px-5 pb-5 text-gray-300 leading-relaxed">
          {typeof item.a === 'string' ? (
            <p>{item.a}</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {item.a.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const navigate = useNavigate();

  const faqs = [
    { tag: 'General', q: 'What is MindShift?', a: 'MindShift is a mindful productivity platform that helps you align your attention with your intentions using a blend of thoughtful design and adaptive insights.' },
    { tag: 'General', q: 'Who is MindShift for?', a: 'Creators, founders, students, and knowledge workers who want less digital anxiety and more meaningful progress—without burnout.' },
    { tag: 'Focus', q: 'What is Focus Calibration?', a: 'A guidance layer that helps you identify priorities, reduce noise, and enter deep work with less friction.' },
    { tag: 'Momentum', q: 'How does Momentum Architecture work?', a: 'It turns micro-achievements into compounding feedback loops. You track small wins that build consistency over time.' },
    { tag: 'AI', q: 'Does it use AI?', a: 'Yes. MindShift uses lightweight, privacy-conscious models to surface patterns and nudge you toward your optimal states.' },
    { tag: 'Privacy', q: 'How do you handle my data?', a: 'Privacy-first. Your data stays under your control and is used only to power features you explicitly enable.' },
    { tag: 'Privacy', q: 'Do you sell or share data?', a: 'No. We don’t sell your data. We aim to minimize data collection and give you clear controls.' },
    { tag: 'Getting started', q: 'How do I start?', a: [ 'Create an account via Sign Up', 'Set 1–3 compass goals that actually matter', 'Log a few actions and link them to your goals', 'Review insights at the end of the week' ] },
    { tag: 'Platform', q: 'Which platforms are supported?', a: 'The early access focuses on the web app. Mobile-friendly layouts are supported; native apps are on the roadmap.' },
    { tag: 'Pricing', q: 'Is there a free plan?', a: 'During early access, a free tier may be available with core features. Pricing details will be announced before general release.' },
    { tag: 'Features', q: 'Can I import tasks from other tools?', a: 'Basic imports and lightweight integrations are planned. Tell us which integrations you want most.' },
    { tag: 'Customization', q: 'Can I customize themes and visuals?', a: 'Yes. Theme toggles and color schemes are included. More personalization options are planned.' },
    { tag: 'Teams', q: 'Is MindShift for teams?', a: 'Teams support is in exploration. The initial release focuses on individuals and small groups.' },
    { tag: 'Science', q: 'What is the science behind MindShift?', a: 'We draw from cognitive psychology and behavioral design principles to encourage sustainable, value-aligned action.' },
    { tag: 'Support', q: 'How do I contact support or share feedback?', a: 'From the app, go to the feedback option in the footer or join early access and reply to the welcome email.' },
    { tag: 'Roadmap', q: 'What’s coming next?', a: [ 'Deeper insights and patterns', 'Richer goal linking and journaling flows', 'Selective integrations', 'More guidance for weekly reviews' ] },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Top navigation */}
      <nav className="px-6 py-4 border-b border-gray-800 sticky top-0 bg-black/60 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
            <div className="text-2xl">🧠</div>
            <span className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors">MindShift</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-lg sm:text-2xl text-gray-300 max-w-3xl mx-auto">Answers to common questions about MindShift, our approach, and what’s coming next.</p>
        </div>
      </header>

      {/* FAQ list */}
      <main className="px-6">
        <section className="max-w-4xl mx-auto pb-6">
          <div className="grid grid-cols-1 gap-4">
            {faqs.map((item, i) => (
              <FaqItem key={i} item={item} index={i} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
            <div>
              <h3 className="text-xl font-semibold text-white">Still have questions?</h3>
              <p className="text-gray-300">Join early access and we’ll guide you through your first week.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/signup')} className="px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white">Get Started</button>
              <button onClick={() => navigate('/')} className="px-5 py-3 rounded-full border border-gray-600 text-white hover:bg-white/5">Back to Home</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-500">
        <div className="border-t border-gray-800 pt-6 text-center">
          <p>© 2025 MindShift. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
