import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

const FEELING_OPTIONS = [
  { 
    value: 'focused',
    emoji: '🔍', 
    label: 'Focused',
    gradient: 'from-blue-500 to-cyan-400',
    description: 'Achieve mental clarity and deep work'
  },
  { 
    value: 'calm', 
    emoji: '🧘', 
    label: 'Calm',
    gradient: 'from-blue-400 to-sky-300',
    description: 'Find inner peace and reduce mental noise'
  },
  { 
    value: 'accomplished', 
    emoji: '🏆', 
    label: 'Accomplished',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Track progress and celebrate wins'
  },
  { 
    value: 'energized', 
    emoji: '⚡', 
    label: 'Energized',
    gradient: 'from-yellow-400 to-orange-400',
    description: 'Boost motivation and productive momentum'
  },
  { 
    value: 'creative', 
    emoji: '🎨', 
    label: 'Creative',
    gradient: 'from-purple-400 to-fuchsia-500',
    description: 'Unlock innovative thinking and ideation'
  },
  { 
    value: 'balanced', 
    emoji: '⚖️', 
    label: 'Balanced',
    gradient: 'from-emerald-400 to-green-500',
    description: 'Harmonize work and life priorities'
  },
  { 
    value: 'inspired', 
    emoji: '💫', 
    label: 'Inspired',
    gradient: 'from-violet-400 to-purple-500',
    description: 'Connect to purpose and meaning'
  },
  { 
    value: 'confident', 
    emoji: '💪', 
    label: 'Confident',
    gradient: 'from-rose-400 to-red-500',
    description: 'Build resilience and self-assurance'
  }
];

export default function AIConnectionCard({ user, onFeelingSelected, userData, recentLogs }) {
  const { isDark, colorScheme } = useTheme();
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [userGoalStats, setUserGoalStats] = useState(null);
  const [animateDots, setAnimateDots] = useState(false);

  // Interactive card effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
    };
    
    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  useEffect(() => {
    // If user already has a feeling preference, set it
    if (userData?.desiredFeeling) {
      const feeling = FEELING_OPTIONS.find(f => f.value === userData.desiredFeeling);
      if (feeling) {
        setSelectedFeeling(feeling);
        setIsSubmitted(true);

        // Generate AI insight based on user data
        if (recentLogs && recentLogs.length > 0) {
          analyzeUserData();
        }
      }
    }
    
    // Start animation for loading dots
    if (isLoadingInsight) {
      setAnimateDots(true);
    } else {
      setAnimateDots(false);
    }
  }, [userData, recentLogs, isLoadingInsight]);

  const analyzeUserData = async () => {
    if (!userData || !recentLogs || recentLogs.length === 0) return;

    setIsLoadingInsight(true);

    try {
      // Analyze logs to find patterns
      const goalCounts = {};
      const tagCounts = {};
      let mostActiveGoal = null;
      let leastActiveGoal = null;
      let maxCount = 0;
      let minCount = Infinity;

      // Count entries per goal
      recentLogs.forEach(log => {
        if (log.linkedGoal) {
          goalCounts[log.linkedGoal] = (goalCounts[log.linkedGoal] || 0) + 1;

          if (goalCounts[log.linkedGoal] > maxCount) {
            maxCount = goalCounts[log.linkedGoal];
            mostActiveGoal = log.linkedGoal;
          }
        }

        if (log.tags && log.tags.length) {
          log.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      // Find least active goal
      Object.entries(userData.compassGoals || {}).forEach(([key, goalText]) => {
        const count = goalCounts[key] || 0;
        if (count < minCount) {
          minCount = count;
          leastActiveGoal = { key, text: goalText };
        }
      });

      setUserGoalStats({
        mostActiveGoal: mostActiveGoal ? {
          key: mostActiveGoal,
          text: userData.compassGoals[mostActiveGoal],
          count: goalCounts[mostActiveGoal]
        } : null,
        leastActiveGoal: leastActiveGoal || null,
        goalCounts,
        tagCounts
      });

      // Generate Socratic question based on the data analysis
      generateSocraticQuestion({
        mostActiveGoal: mostActiveGoal ? {
          key: mostActiveGoal,
          text: userData.compassGoals[mostActiveGoal],
          count: goalCounts[mostActiveGoal]
        } : null,
        leastActiveGoal: leastActiveGoal || null,
        desiredFeeling: userData.desiredFeeling,
        goalCounts,
        tagCounts
      });

    } catch (error) {
      console.error('Error analyzing user data:', error);
      setAiInsight({
        question: "How are you feeling about your progress so far?",
        context: "Let's reflect on your journey."
      });
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const generateSocraticQuestion = (stats) => {
    let insight = { question: "", context: "" };

    if (!stats.mostActiveGoal && !stats.leastActiveGoal) {
      // New user with not enough data
      insight = {
        question: `What small step toward feeling more ${userData.desiredFeeling} could you take today?`,
        context: "Every journey begins with a single step."
      };
    } else if (stats.mostActiveGoal && stats.leastActiveGoal) {
      // User has both active and inactive goals
      insight = {
        question: `I noticed you built amazing momentum with "${stats.mostActiveGoal.text}" (${stats.mostActiveGoal.count} entries). On the ${stats.leastActiveGoal.text} front, what's one tiny barrier you could remove for next week?`,
        context: "Building on strengths while addressing challenges often creates balanced growth."
      };
    } else if (stats.mostActiveGoal) {
      // User is active with one goal
      insight = {
        question: `You've been making consistent progress on "${stats.mostActiveGoal.text}". What specific aspect of this goal makes you feel most ${userData.desiredFeeling}?`,
        context: "Understanding our motivations can help us apply them to other areas."
      };
    }

    setAiInsight(insight);
    setShowResponseInput(true);
  };

  const handleSubmitResponse = async () => {
    if (!userResponse.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Save the response to user's reflection log
      await updateDoc(doc(db, 'users', user.uid), {
        lastReflection: {
          question: aiInsight.question,
          response: userResponse,
          timestamp: new Date().toISOString()
        }
      });

      setUserResponse('');
      setShowResponseInput(false);

      // Generate a follow-up acknowledgment
      setTimeout(() => {
        setAiInsight({
          ...aiInsight,
          acknowledgment: `Thank you for reflecting. I'll keep this in mind to help you continue building momentum toward feeling more ${userData.desiredFeeling}.`
        });
      }, 500);

    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectFeeling = async (feeling) => {
    if (isSubmitting) return;

    setSelectedFeeling(feeling);
    setIsSubmitting(true);

    try {
      // Save to user profile
      await updateDoc(doc(db, 'users', user.uid), {
        desiredFeeling: feeling.value,
        aiPreference: {
          tone: getToneFromFeeling(feeling.value),
          focus: getFocusFromFeeling(feeling.value)
        }
      });

      setIsSubmitted(true);

      // Notify parent component
      if (onFeelingSelected) {
        onFeelingSelected(feeling);
      }
    } catch (error) {
      console.error('Error saving feeling preference:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getToneFromFeeling = (feeling) => {
    // Map feelings to AI tone preferences
    const toneMap = {
      focused: 'direct',
      calm: 'gentle',
      accomplished: 'celebratory',
      energized: 'enthusiastic',
      creative: 'imaginative',
      balanced: 'measured',
      inspired: 'uplifting',
      confident: 'assertive'
    };

    return toneMap[feeling] || 'supportive';
  };

  const getFocusFromFeeling = (feeling) => {
    // Map feelings to AI focus areas
    const focusMap = {
      focused: 'productivity',
      calm: 'mindfulness',
      accomplished: 'achievement',
      energized: 'momentum',
      creative: 'exploration',
      balanced: 'harmony',
      inspired: 'growth',
      confident: 'progress'
    };

    return focusMap[feeling] || 'growth';
  };

  // If a feeling has been selected and saved
  if (isSubmitted) {
    return (
      <div className={`p-6 rounded-xl bg-gradient-to-br ${
        isDark 
          ? 'from-indigo-900/30 to-indigo-800/10' 
          : 'from-indigo-100 to-indigo-50'
      } animate-fade-in`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-float">{selectedFeeling.emoji}</div>
          <div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-indigo-200' : 'text-indigo-800'}`}>
              Looking for more {selectedFeeling.label.toLowerCase()}
            </h3>
            <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm`}>
              You're in the right place. Let's build some momentum.
            </p>
          </div>
        </div>

        {isLoadingInsight ? (
          <div className="mt-4 flex items-center justify-center p-4">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
              <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
              <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
            </div>
          </div>
        ) : aiInsight ? (
          <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className={`${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
              <p className="font-medium">{aiInsight.question}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{aiInsight.context}</p>
            </div>

            {aiInsight.acknowledgment ? (
              <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 text-indigo-700'}`}>
                <p className="text-sm">{aiInsight.acknowledgment}</p>
              </div>
            ) : showResponseInput ? (
              <div className="mt-3">
                <textarea
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={2}
                  className={`w-full p-2 rounded-lg border text-sm ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSubmitResponse}
                    disabled={!userResponse.trim() || isSubmitting}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      userResponse.trim() && !isSubmitting
                        ? (isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white')
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? 'Saving...' : 'Share Reflection'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResponseInput(true)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  isDark 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                } transition-colors`}
              >
                Reflect on This
              </button>
            )}
          </div>
        ) : (
          <div className={`mt-4 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <p>Your AI coach will keep this in mind while providing insights.</p>
            <button
              className={`mt-2 text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-700'} hover:underline`}
              onClick={analyzeUserData}
            >
              Get personalized insight
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className="animate-fade-in dashboard-card overflow-hidden card-glow"
      style={{
        '--x': `${mousePosition.x * 100}%`,
        '--y': `${mousePosition.y * 100}%`
      }}
    >
      <div className="relative px-6 py-8">
        {/* Interactive background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 bg-indigo-500" 
          style={{ transform: `translate(${mousePosition.x * 20 - 10}px, ${mousePosition.y * 20 - 10}px)` }}
        />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full blur-3xl opacity-10 bg-violet-500"
          style={{ transform: `translate(${mousePosition.x * -20 + 10}px, ${mousePosition.y * -20 + 10}px)` }}
        />
        
        {/* AI Connection Header with animated dots */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            Neural Connection
          </h3>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block mr-1.5 animate-pulse"></span>
            <span className={`text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>AI Aware</span>
          </div>
        </div>

        <h4 className={`text-xl font-medium mb-5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          What's one feeling you want more of in your life?
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEELING_OPTIONS.map((feeling) => (
            <button
              key={feeling.value}
              onClick={() => handleSelectFeeling(feeling)}
              disabled={isSubmitting}
              className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all ${
                selectedFeeling?.value === feeling.value
                  ? `bg-gradient-to-br ${feeling.gradient} text-white shadow-lg scale-105`
                  : isDark 
                    ? 'bg-gray-800/80 hover:bg-gray-700/90 border border-gray-700/60 hover:border-indigo-500/70' 
                    : 'bg-white/80 hover:bg-gray-50/90 border border-gray-200/60 hover:border-indigo-300/70'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md backdrop-blur-sm'}`}
              aria-pressed={selectedFeeling?.value === feeling.value}
            >
              <span className="text-3xl mb-2" style={{ 
                filter: selectedFeeling?.value === feeling.value ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none'
              }}>
                {feeling.emoji}
              </span>
              <span className={`text-sm font-medium ${
                selectedFeeling?.value === feeling.value ? 'text-white' : (isDark ? 'text-gray-100' : 'text-gray-800')
              }`}>
                {feeling.label}
              </span>
              {selectedFeeling?.value !== feeling.value && (
                <span className="text-xs mt-1 opacity-70 line-clamp-1">{feeling.description}</span>
              )}
            </button>
          ))}
        </div>

        <p className={`mt-5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} text-center`}>
          This helps your personal AI coach understand your goals and tailor insights to your needs
        </p>
        
        {/* Visual neural connection elements */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
      </div>
    </div>
  );
}
