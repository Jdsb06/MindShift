import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

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
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            About MindShift
          </h1>
          <p className="text-lg sm:text-2xl text-gray-300 max-w-3xl mx-auto">
            We’re reimagining how humans relate to technology—shifting from mindless consumption to mindful momentum.
          </p>
        </div>
      </header>

      <main className="px-6">
        <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
          <div className="md:col-span-2 p-6 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-3">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              MindShift helps you align attention with intention. We combine thoughtful design with cognitive science to
              reduce digital anxiety, restore focus, and build sustainable progress. Instead of optimizing for clicks and
              compulsions, we optimize for clarity, calm, and meaningful results.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-2">At a glance</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• 78% reduced digital overwhelm (pilot users)</li>
              <li>• 3.4x improvement in focus duration</li>
              <li>• Privacy-first by design</li>
            </ul>
          </div>
        </section>

        <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-3">What we believe</h2>
            <ul className="text-gray-300 space-y-2">
              <li>• Intention over attention: your time is precious.</li>
              <li>• Quality over quantity: depth beats breadth.</li>
              <li>• Mindful momentum: sustainable beats sporadic.</li>
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-3">How MindShift helps</h2>
            <ul className="text-gray-300 space-y-2">
              <li>• Focus Calibration to cut through noise</li>
              <li>• Momentum Architecture to build consistent wins</li>
              <li>• Adaptive Insights to learn your optimal patterns</li>
            </ul>
          </div>
        </section>

        <section className="max-w-5xl mx-auto py-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-3">The story</h2>
            <p className="text-gray-300 leading-relaxed">
              Born from frustration with attention-hacking design, MindShift is a response to digital burnout. We
              started with a simple question: what if software respected your cognition? The result is a calmer, more
              intentional way to work and live—guided by your values, not your feeds.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
            <div>
              <h3 className="text-xl font-semibold text-white">Ready to experience MindShift?</h3>
              <p className="text-gray-300">Join early access and start building mindful momentum today.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/signup')} className="px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white">
                Get Started
              </button>
              <button onClick={() => navigate('/')} className="px-5 py-3 rounded-full border border-gray-600 text-white hover:bg-white/5">
                Back to Home
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-500">
        <div className="border-t border-gray-800 pt-6 text-center">
          <p>© 2025 MindShift. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
