import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebase';
import { MindShiftFunctionTester } from '../utils/functionTests';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import TagSelector from '../components/TagSelector';
import GoalLinker from '../components/GoalLinker';
import TagFilter from '../components/TagFilter';
import UnwindProtocol from '../components/UnwindProtocol';
import LookBack from '../components/LookBack';
import MomentumHeatmap from '../components/MomentumHeatmap';
import ProgressRing from '../components/ProgressRing';
import Tooltip from '../components/Tooltip';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [compassGoals, setCompassGoals] = useState({
        goal1: "Set your first goal",
        goal2: "Set your second goal",
        goal3: "Set your third goal"
    });
    const [momentumLogs, setMomentumLogs] = useState([]);
    const [newLog, setNewLog] = useState("");
    const [newLogTags, setNewLogTags] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [filterTags, setFilterTags] = useState([]);
    const [showAttentionSwap, setShowAttentionSwap] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [aiSummary, setAiSummary] = useState("");
    const [aiStats, setAiStats] = useState(null);
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showWeeklyReflection, setShowWeeklyReflection] = useState(false);
    const [weeklyReflection, setWeeklyReflection] = useState(null);
    const [generatingReflection, setGeneratingReflection] = useState(false);
    const [showUnwindProtocol, setShowUnwindProtocol] = useState(false);
    const [showLookBack, setShowLookBack] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                loadUserData(user.uid);
            } else {
                navigate('/');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const loadUserData = async (userId) => {
        try {
            // Load compass goals
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                setCompassGoals(userDoc.data().compassGoals || compassGoals);
            }

            // Load momentum logs
            const logsQuery = query(
                collection(db, 'users', userId, 'momentumLogs'),
                orderBy('createdAt', 'desc')
            );

            onSnapshot(logsQuery, (snapshot) => {
                const logs = [];
                snapshot.forEach((doc) => {
                    logs.push({ id: doc.id, ...doc.data() });
                });
                setMomentumLogs(logs);
            });
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (err) {
            console.error("Error logging out:", err);
        }
    };

    const addMomentumLog = async () => {
        if (!newLog.trim()) return;

        try {
            await addDoc(collection(db, 'users', user.uid, 'momentumLogs'), {
                text: newLog,
                tags: newLogTags,
                linkedGoal: selectedGoal,
                createdAt: serverTimestamp()
            });
            setNewLog("");
            setNewLogTags([]);
            setSelectedGoal(null);
        } catch (error) {
            console.error('Error adding log:', error);
        }
    };

    const deleteMomentumLog = async (logId) => {
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'momentumLogs', logId));
        } catch (error) {
            console.error('Error deleting log:', error);
        }
    };

    const updateCompassGoals = async () => {
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                compassGoals: compassGoals
            });
            setShowGoalModal(false);
        } catch (error) {
            console.error('Error updating goals:', error);
        }
    };

    const generateAiSummary = async () => {
        setGeneratingSummary(true);
        try {
            const generateMomentumSummary = httpsCallable(functions, 'generateMomentumSummary');
            const result = await generateMomentumSummary();
            setAiSummary(result.data.summary);
            setAiStats(result.data);
        } catch (error) {
            console.error('Error generating summary:', error);
            setAiSummary("Something went wrong with the AI magic ✨ But don't worry - your progress is still being tracked!");
        } finally {
            setGeneratingSummary(false);
        }
    };

    const generateWeeklyReflection = async () => {
        setGeneratingReflection(true);
        try {
            const generateWeeklyReflection = httpsCallable(functions, 'generateWeeklyReflection');
            const result = await generateWeeklyReflection();
            setWeeklyReflection(result.data);
            setShowWeeklyReflection(true);
        } catch (error) {
            console.error('Error generating weekly reflection:', error);
        } finally {
            setGeneratingReflection(false);
        }
    };

    const runFunctionTests = async () => {
        setTesting(true);
        try {
            await MindShiftFunctionTester();
        } catch (error) {
            console.error('Test error:', error);
        } finally {
            setTesting(false);
        }
    };

    // Get all available tags from logs
    const getAllTags = () => {
        const tags = new Set();
        momentumLogs.forEach(log => {
            if (log.tags) {
                log.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    };

    // Filter logs based on selected tags
    const getFilteredLogs = () => {
        if (filterTags.length === 0) return momentumLogs;
        return momentumLogs.filter(log => 
            log.tags && log.tags.some(tag => filterTags.includes(tag))
        );
    };

    const handleTagToggle = (tag) => {
        setFilterTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const clearAllFilters = () => {
        setFilterTags([]);
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center animate-fade-in`}>
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🧠</div>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading your sanctuary...</p>
                </div>
            </div>
        );
    }

    const filteredLogs = getFilteredLogs();
    const availableTags = getAllTags();

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'} animate-fade-in`}>
            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl sm:text-4xl animate-float">🧠</div>
                            <h1 className="text-2xl sm:text-4xl font-bold text-white">
                                MindShift
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {user && (
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} hidden sm:block`}>
                                    Hey {user.email?.split('@')[0]}! ✨
                                </span>
                            )}
                            <ThemeToggle />
                            <button
                                onClick={runFunctionTests}
                                disabled={testing}
                                className="px-4 py-2 bg-yellow-600 rounded-full text-white font-medium hover:bg-yellow-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                            >
                                {testing ? 'Testing... 🧪' : 'Test Functions 🧪'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className={`px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-full ${isDark ? 'text-white' : 'text-gray-800'} font-medium transition-all duration-200 transform hover:scale-105 shadow-lg`}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-6 lg:px-8 pb-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Compass Goals */}
                    <div className="card-modern animate-slide-in">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl sm:text-3xl animate-float">🧭</div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white">
                                    Your Compass
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowGoalModal(true)}
                                className="btn-primary"
                            >
                                Edit Goals
                            </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(compassGoals).map(([key, goal], index) => {
                                const goalLogs = momentumLogs.filter(log => log.linkedGoal === goal);
                                // For demo: assume 10 steps per goal for full ring
                                const totalSteps = 10;
                                const progress = Math.min(goalLogs.length / totalSteps, 1);
                                return (
                                    <div key={key} className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl border-l-4 border-indigo-500 shadow-lg hover:shadow-xl transition-all duration-200 animate-scale-in flex flex-col items-center`} style={{ animationDelay: `${index * 0.1}s` }}>
                                        <ProgressRing progress={progress} size={64} color={['#6366F1','#8B5CF6','#EC4899'][index]}>
                                            <span>{['🎯', '🌟', '💫'][index]}</span>
                                        </ProgressRing>
                                        <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm sm:text-base leading-relaxed mt-3 text-center`}>{goal}</p>
                                        {goalLogs.length > 0 && (
                                            <p className={`text-xs mt-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{goalLogs.length} step{goalLogs.length !== 1 ? 's' : ''} taken</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Momentum Log */}
                    <div className="card-modern animate-slide-in" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="text-2xl sm:text-3xl animate-float">📈</div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">
                                Momentum Log
                            </h2>
                        </div>
                        
                        {/* Tag Filter */}
                        {availableTags.length > 0 && (
                            <div className="mb-6 animate-slide-in" style={{ animationDelay: '0.3s' }}>
                                <TagFilter
                                    availableTags={availableTags}
                                    selectedTags={filterTags}
                                    onTagToggle={handleTagToggle}
                                    onClearAll={clearAllFilters}
                                />
                            </div>
                        )}

                        {/* Add New Log */}
                        <div className="space-y-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={newLog}
                                    onChange={(e) => setNewLog(e.target.value)}
                                    placeholder="What's a win from today? ✨"
                                    className="input-modern flex-1"
                                    onKeyPress={(e) => e.key === 'Enter' && addMomentumLog()}
                                />
                                <button
                                    onClick={addMomentumLog}
                                    className="btn-primary"
                                >
                                    Add ✨
                                </button>
                            </div>
                            
                            {/* Tag Selector */}
                            <TagSelector
                                selectedTags={newLogTags}
                                onTagsChange={setNewLogTags}
                                placeholder="Add tags to categorize your win..."
                            />
                            
                            {/* Goal Linker */}
                            <GoalLinker
                                compassGoals={compassGoals}
                                selectedGoal={selectedGoal}
                                onGoalSelect={setSelectedGoal}
                            />
                        </div>

                        {/* Logs Display */}
                        <div className="space-y-3">
                            {filteredLogs.map((log, index) => (
                                <div key={log.id} className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl border ${isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-400'} transition-all duration-200 momentum-entry`} style={{ animationDelay: `${index * 0.05}s` }}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm sm:text-base flex-1`}>{log.text}</p>
                                            
                                            {/* Tags */}
                                            {log.tags && log.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {log.tags.map((tag, tagIndex) => (
                                                        <span
                                                            key={tagIndex}
                                                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Linked Goal */}
                                            {log.linkedGoal && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <span className="text-xs text-indigo-400">→</span>
                                                    <span className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                                        {log.linkedGoal}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteMomentumLog(log.id)}
                                            className="ml-4 text-red-400 hover:text-red-300 transition-colors duration-200 p-1"
                                        >
                                            <span className="text-xl">×</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredLogs.length === 0 && (
                                <div className="text-center py-8 text-gray-400 animate-fade-in">
                                    <div className="text-4xl mb-4 animate-float">🌟</div>
                                    <p className="text-lg">
                                        {filterTags.length > 0 ? 'No entries match your filter' : 'No accomplishments yet'}
                                    </p>
                                    <p className="text-sm">
                                        {filterTags.length > 0 ? 'Try adjusting your tag filters' : 'Start building your momentum!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Momentum Heatmap */}
                    <MomentumHeatmap momentumLogs={momentumLogs} />

                    {/* AI Coach */}
                    <div className="card-modern animate-slide-in" style={{ animationDelay: '0.4s' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl sm:text-3xl animate-float">🤖</div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white">
                                    AI Coach
                                </h2>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setShowLookBack(true)}
                                    className="btn-primary"
                                >
                                    ✨ My Monthly Rewind
                                </button>
                                <Tooltip content="Get your first reflection after 7 days of entries!">
                                    <span style={{ position: 'relative', display: 'inline-block' }}>
                                        <button
                                            onClick={generateWeeklyReflection}
                                            disabled={generatingReflection}
                                            className="btn-primary"
                                            style={{ position: 'relative' }}
                                        >
                                            AI Coach Check-in
                                            {/* Pulsing dot for first-time hint */}
                                            <span className="animate-pulse-slow" style={{
                                                position: 'absolute',
                                                top: 6, right: 10,
                                                width: 10, height: 10,
                                                background: '#F59E42',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 8px 2px #F59E4280',
                                                pointerEvents: 'none',
                                            }} />
                                            {generatingReflection ? ' (Generating...)' : ''}
                                        </button>
                                    </span>
                                </Tooltip>
                                <button
                                    onClick={generateAiSummary}
                                    disabled={generatingSummary}
                                    className="btn-primary"
                                >
                                    Instant Insight
                                    {generatingSummary ? ' (Generating...)' : ''}
                                </button>
                            </div>
                        </div>
                        
                        {/* AI Stats */}
                        {aiStats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-in">
                                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <div className="text-2xl font-bold text-indigo-500">{aiStats.totalEntries}</div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Wins</div>
                                </div>
                                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <div className="text-2xl font-bold text-green-500">{aiStats.taggedEntries}</div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tagged</div>
                                </div>
                                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <div className="text-2xl font-bold text-purple-500">{aiStats.goalLinkedEntries}</div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Goal-Linked</div>
                                </div>
                                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <div className="text-2xl font-bold text-yellow-500">{Object.keys(aiStats.tagAnalysis || {}).length}</div>
                                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Focus Areas</div>
                                </div>
                            </div>
                        )}
                        
                        {aiSummary && (
                            <div className="bg-indigo-600 bg-opacity-20 p-6 rounded-xl border border-indigo-500 border-opacity-30 animate-fade-in">
                                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm sm:text-base leading-relaxed`}>{aiSummary}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Button for Unwind Protocol */}
            <button
                onClick={() => setShowUnwindProtocol(true)}
                className="fab"
                title="Unwind Protocol - Reset Focus"
            >
                🧘
            </button>

            {/* Weekly Reflection Modal */}
            {showWeeklyReflection && weeklyReflection && (
                <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="card-modern max-w-2xl mx-auto animate-scale-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl animate-float">📊</div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white">Weekly Reflection</h3>
                            </div>
                            <button
                                onClick={() => setShowWeeklyReflection(false)}
                                className="text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        {/* Reflection */}
                        <div className="mb-6">
                            <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Your Week in Review</h4>
                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} animate-fade-in`}>
                                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} leading-relaxed`}>
                                    {typeof weeklyReflection.reflection === 'string' 
                                        ? weeklyReflection.reflection 
                                        : 'You had a productive week! Keep up the great momentum! ✨'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        {weeklyReflection.stats && (
                            <div className="mb-6">
                                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Key Metrics</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div className="text-xl font-bold text-indigo-500">{weeklyReflection.stats.totalEntries || 0}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Wins</div>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div className="text-xl font-bold text-green-500">{weeklyReflection.stats.activeDays || 0}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Days</div>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div className="text-xl font-bold text-purple-500">{Object.keys(weeklyReflection.stats.tagCounts || {}).length}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Focus Areas</div>
                                    </div>
                                    <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <div className="text-xl font-bold text-yellow-500">{Object.keys(weeklyReflection.stats.goalCounts || {}).length}</div>
                                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Goals Progress</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Insights */}
                        {weeklyReflection.insights && Array.isArray(weeklyReflection.insights) && weeklyReflection.insights.length > 0 && (
                            <div className="mb-6">
                                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Key Insights</h4>
                                <div className="space-y-2">
                                    {weeklyReflection.insights.map((insight, index) => (
                                        <div key={index} className={`flex items-start gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} animate-slide-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                                            <span className="text-indigo-500 mt-0.5">💡</span>
                                            <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm`}>
                                                {typeof insight === 'string' ? insight : 'You made progress this week!'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {weeklyReflection.recommendations && Array.isArray(weeklyReflection.recommendations) && weeklyReflection.recommendations.length > 0 && (
                            <div className="mb-6">
                                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Suggestions for Next Week</h4>
                                <div className="space-y-2">
                                    {weeklyReflection.recommendations.map((rec, index) => (
                                        <div key={index} className={`flex items-start gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} animate-slide-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                                            <span className="text-green-500 mt-0.5">🚀</span>
                                            <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm`}>
                                                {typeof rec === 'string' ? rec : 'Keep up the great momentum!'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setShowWeeklyReflection(false)}
                            className="btn-primary w-full"
                        >
                            Close Reflection ✨
                        </button>
                    </div>
                </div>
            )}

            {/* Attention Swap Modal */}
            {showAttentionSwap && (
                <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="card-modern max-w-md mx-auto text-center animate-scale-in">
                        <div className="text-6xl mb-6 animate-breathe">🫁</div>
                        <h3 className="text-2xl font-bold mb-4 text-white">Mindful Moment</h3>
                        <div className="mb-8">
                            <p className="text-lg mb-6 text-gray-300">Take a deep breath</p>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <p>Breathe in for 4 seconds</p>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <p>Hold for 4 seconds</p>
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <p>Breathe out for 6 seconds</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAttentionSwap(false)}
                            className="btn-primary"
                        >
                            I'm Ready ✨
                        </button>
                    </div>
                </div>
            )}

            {/* Goal Edit Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="card-modern max-w-md mx-auto animate-scale-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="text-2xl animate-float">🎯</div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white">Edit Your Goals</h3>
                        </div>
                        <div className="space-y-4 mb-6">
                            {Object.entries(compassGoals).map(([key, goal], index) => (
                                <div key={key} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {['Goal 1', 'Goal 2', 'Goal 3'][index]} {['🎯', '🌟', '💫'][index]}
                                    </label>
                                    <input
                                        type="text"
                                        value={goal}
                                        onChange={(e) => setCompassGoals(prev => ({
                                            ...prev,
                                            [key]: e.target.value
                                        }))}
                                        className="input-modern w-full"
                                        placeholder={`Enter your ${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} goal`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={updateCompassGoals}
                                className="btn-primary flex-1"
                            >
                                Save ✨
                            </button>
                            <button
                                onClick={() => setShowGoalModal(false)}
                                className={`flex-1 px-6 py-3 ${isDark ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} rounded-xl ${isDark ? 'text-white' : 'text-gray-800'} font-medium transition-all duration-200`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unwind Protocol Modal */}
            <UnwindProtocol 
                isOpen={showUnwindProtocol} 
                onClose={() => setShowUnwindProtocol(false)} 
            />

            {/* Look Back Modal */}
            <LookBack 
                isOpen={showLookBack} 
                onClose={() => setShowLookBack(false)}
                momentumLogs={momentumLogs}
                compassGoals={compassGoals}
            />
        </div>
    );
}