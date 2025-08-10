import React, { useState } from 'react';

export default function OnboardingOverlay({ isOpen, onComplete, onSaveGoals }) {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState(['', '', '']);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4">
      <div className="card-modern max-w-2xl w-full relative overflow-hidden">
        <div className="absolute inset-0 animate-gradient-shift opacity-20 rounded-xl" />
        <div className="relative">
          <h3 className="text-2xl font-bold text-white">Welcome to MindShift</h3>
          <p className="text-gray-300 mt-1">Three tiny steps to get your momentum going.</p>

          {step === 1 && (
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {goals.map((g, i) => (
                <input
                  key={i}
                  value={g}
                  onChange={e => setGoals(o => o.map((x, idx) => idx === i ? e.target.value : x))}
                  placeholder={`Goal ${i + 1}`}
                  className="input-modern"
                />
              ))}
              <button className="btn-primary sm:col-span-3 mt-2" onClick={() => { onSaveGoals(goals); setStep(2); }}>
                Save Goals ✨
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6">
              <p className="text-gray-300 mb-3">Add your first win (try “15m deep work @Deep Work #focus”).</p>
              <button className="btn-primary" onClick={() => setStep(3)}>Add Win</button>
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 text-center">
              <div className="text-5xl mb-4">💫</div>
              <p className="text-gray-200 mb-4">Beautiful. Your momentum ring is alive.</p>
              <button className="btn-primary w-full" onClick={onComplete}>Start Exploring</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 