import React, { useState } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

const OnboardingFlow = ({ user, onComplete }) => {
  const { isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [firstGoal, setFirstGoal] = useState('');
  const [firstWin, setFirstWin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handleGoalSubmit = () => {
    if (firstGoal.trim()) {
      handleNextStep();
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!firstWin.trim()) return;

    setIsSubmitting(true);
    try {
      // Update user's first compass goal
      await updateDoc(doc(db, 'users', user.uid), {
        'compassGoals.goal1': firstGoal,
        hasCompletedOnboarding: true
      });

      // Add first momentum log
      await addDoc(collection(db, 'users', user.uid, 'momentumLogs'), {
        content: firstWin,
        tags: ['first-win'],
        createdAt: serverTimestamp(),
        linkedGoal: 'goal1'
      });

      // Complete onboarding
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isDark ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center p-4`}>
      <div className={`max-w-md w-full rounded-xl shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-8 transition-all transform`}>
        {step === 1 && (
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Welcome to MindShift.</h2>
            <p className="text-lg mb-8">This is your space to celebrate progress, not track pressure.</p>
            <div className="mt-8">
              <button
                onClick={handleNextStep}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isDark 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                Let's Begin →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Set Your Compass</h2>
            <p className="mb-6">What's one big goal you're working towards? Let's set your first compass point.</p>

            <div className="mb-6">
              <input
                type="text"
                value={firstGoal}
                onChange={(e) => setFirstGoal(e.target.value)}
                placeholder="E.g., Improve my fitness, Learn to code..."
                className={`w-full p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
                autoFocus
              />
            </div>

            <button
              onClick={handleGoalSubmit}
              disabled={!firstGoal.trim()}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                firstGoal.trim() 
                  ? (isDark 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white')
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Log Your First Win</h2>
            <p className="mb-6">Every journey starts with a single step. Let's log your first win—it can be as simple as "Signed up to focus on my goals!"</p>

            <div className="mb-6">
              <textarea
                value={firstWin}
                onChange={(e) => setFirstWin(e.target.value)}
                placeholder="Write your first win here..."
                rows={4}
                className={`w-full p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
                autoFocus
              />
            </div>

            <button
              onClick={handleCompleteOnboarding}
              disabled={!firstWin.trim() || isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                firstWin.trim() && !isSubmitting
                  ? (isDark 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white')
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Complete & Start Your Journey →'}
            </button>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex justify-center mt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full mx-1 ${
                s === step 
                  ? (isDark ? 'bg-indigo-500' : 'bg-indigo-600') 
                  : (isDark ? 'bg-gray-600' : 'bg-gray-300')
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
