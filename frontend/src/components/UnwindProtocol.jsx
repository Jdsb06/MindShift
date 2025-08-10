import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function UnwindProtocol({ isOpen, onClose }) {
    const { isDark } = useTheme();
    const [currentTool, setCurrentTool] = useState(null);
    const [breathingPhase, setBreathingPhase] = useState('inhale');
    const [breathingTime, setBreathingTime] = useState(4);
    const [breathingCycles, setBreathingCycles] = useState(0);
    const [brainDumpText, setBrainDumpText] = useState('');
    const [groundingStep, setGroundingStep] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const intervalRef = useRef(null);            // per-tool internal interval
    const sessionTimerRef = useRef(null);        // shared session countdown

    const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
    const [sessionTotal, setSessionTotal] = useState(0);

    const tools = [
        {
            id: 'box-breathing',
            name: 'Box Breathing',
            description: 'A simple technique to calm your nervous system',
            icon: '🫁',
            duration: '2 minutes',
            seconds: 120
        },
        {
            id: 'brain-dump',
            name: 'Brain Dump',
            description: 'Release your thoughts and let them fade away',
            icon: '🧠',
            duration: '5 minutes',
            seconds: 300
        },
        {
            id: 'grounding',
            name: '5-4-3-2-1 Grounding',
            description: 'Connect with your senses to stay present',
            icon: '🌍',
            duration: '2.5 minutes',
            seconds: 150
        }
    ];

    const groundingSteps = [
        { step: 5, sense: 'things you can see', description: 'Look around and name 5 things you can see' },
        { step: 4, sense: 'things you can touch', description: 'Name 4 things you can touch or feel' },
        { step: 3, sense: 'things you can hear', description: 'Listen for 3 things you can hear' },
        { step: 2, sense: 'things you can smell', description: 'Notice 2 things you can smell' },
        { step: 1, sense: 'thing you can taste', description: 'Name 1 thing you can taste' }
    ];

    useEffect(() => {
        if (currentTool === 'box-breathing' && isActive) {
            startBoxBreathing();
        } else if (currentTool === 'grounding' && isActive) {
            startGrounding();
        } else if (currentTool === 'brain-dump' && isActive) {
            startBrainDump();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (sessionTimerRef.current) {
                clearInterval(sessionTimerRef.current);
            }
        };
    }, [currentTool, isActive]);

    const startSessionTimer = (totalSeconds, onComplete) => {
        if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
        setSessionTotal(totalSeconds);
        setSessionTimeLeft(totalSeconds);
        sessionTimerRef.current = setInterval(() => {
            setSessionTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(sessionTimerRef.current);
                    onComplete?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startBoxBreathing = () => {
        const phases = [
            { name: 'inhale', duration: 4 },
            { name: 'hold', duration: 4 },
            { name: 'exhale', duration: 6 },
            { name: 'hold', duration: 4 }
        ];

        let phaseIndex = 0;
        let timeLeft = phases[0].duration;

        setBreathingPhase(phases[0].name);
        setBreathingTime(timeLeft);
        setBreathingCycles(0);

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            timeLeft--;
            setBreathingTime(timeLeft);

            if (timeLeft === 0) {
                phaseIndex = (phaseIndex + 1) % phases.length;
                timeLeft = phases[phaseIndex].duration;
                setBreathingPhase(phases[phaseIndex].name);
                setBreathingTime(timeLeft);
                if (phaseIndex === 0) {
                    setBreathingCycles((c) => c + 1);
                }
            }
        }, 1000);

        const tool = tools.find(t => t.id === 'box-breathing');
        startSessionTimer(tool?.seconds || 120, () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsActive(false);
        });
    };

    const startGrounding = () => {
        setGroundingStep(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        const interval = setInterval(() => {
            setGroundingStep(prev => {
                if (prev >= groundingSteps.length - 1) {
                    clearInterval(interval);
                    setIsActive(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 30000); // 30 seconds per step

        intervalRef.current = interval;

        const tool = tools.find(t => t.id === 'grounding');
        startSessionTimer(tool?.seconds || 150, () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsActive(false);
        });
    };

    const startBrainDump = () => {
        const tool = tools.find(t => t.id === 'brain-dump');
        startSessionTimer(tool?.seconds || 300, () => {
            setIsActive(false);
            setBrainDumpText('');
        });
    };

    const handleToolSelect = (tool) => {
        setCurrentTool(tool.id);
        setIsActive(true);
        setBreathingPhase('inhale');
        setBreathingTime(4);
        setBreathingCycles(0);
        setGroundingStep(0);
        setBrainDumpText('');
    };

    const handleClose = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (sessionTimerRef.current) {
            clearInterval(sessionTimerRef.current);
        }
        setCurrentTool(null);
        setIsActive(false);
        setBreathingPhase('inhale');
        setBreathingTime(4);
        setBreathingCycles(0);
        setGroundingStep(0);
        setBrainDumpText('');
        setSessionTimeLeft(0);
        setSessionTotal(0);
        onClose();
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = Math.floor(s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const renderSessionTimer = () => {
        if (!isActive || !sessionTotal) return null;
        const pct = sessionTotal ? ((sessionTotal - sessionTimeLeft) / sessionTotal) * 100 : 0;
        return (
            <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Session</span>
                    <span className="text-lg font-semibold gradient-text">
                        {formatTime(sessionTimeLeft)}
                    </span>
                    {currentTool === 'box-breathing' && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cycles: {breathingCycles}</span>
                    )}
                </div>
                <div className={`h-2 w-full rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, background: 'var(--accent-gradient)' }}
                    />
                </div>
            </div>
        );
    };

    const renderToolContent = () => {
        if (!currentTool) return null;

        switch (currentTool) {
            case 'box-breathing':
                return (
                    <div className="text-center">
                        <div className={`text-8xl mb-8 animate-breathe ${breathingPhase === 'inhale' ? 'scale-125' : breathingPhase === 'exhale' ? 'scale-75' : 'scale-100'}`}>
                            {breathingPhase === 'inhale' ? '🫁' : breathingPhase === 'exhale' ? '🫁' : '⏸️'}
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {breathingPhase === 'inhale' ? 'Breathe In' : 
                             breathingPhase === 'exhale' ? 'Breathe Out' : 'Hold'}
                        </h3>
                        <div className="text-6xl font-bold text-indigo-400 mb-1">
                            {breathingTime}
                        </div>
                        <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {breathingPhase === 'inhale' ? 'Fill your lungs completely' :
                             breathingPhase === 'exhale' ? 'Release all tension' : 'Stay present'}
                        </p>
                    </div>
                );

            case 'brain-dump':
                return (
                    <div className="w-full max-w-md mx-auto">
                        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} text-center`}>Brain Dump</h3>
                        <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} mb-6 text-center`}>
                            What's on your mind? Let it all out. This will fade away when the timer ends.
                        </p>
                        <textarea
                            value={brainDumpText}
                            onChange={(e) => setBrainDumpText(e.target.value)}
                            placeholder="Write whatever comes to mind... no judgment, no pressure..."
                            className={`w-full h-48 p-4 rounded-xl border-2 border-indigo-500 resize-none focus:outline-none focus:border-indigo-400 transition-all duration-200 ${isDark ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'}`}
                            disabled={!isActive}
                        />
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mt-2 text-center`}>
                            {isActive ? 'Your thoughts will fade away soon…' : 'Session complete'}
                        </p>
                    </div>
                );

            case 'grounding':
                return (
                    <div className="text-center">
                        <div className="text-6xl mb-6 animate-float">
                            {groundingSteps[groundingStep]?.step === 5 ? '👁️' :
                             groundingSteps[groundingStep]?.step === 4 ? '✋' :
                             groundingSteps[groundingStep]?.step === 3 ? '👂' :
                             groundingSteps[groundingStep]?.step === 2 ? '👃' :
                             groundingSteps[groundingStep]?.step === 1 ? '👅' : '🌍'}
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {groundingSteps[groundingStep]?.step} {groundingSteps[groundingStep]?.sense}
                        </h3>
                        <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} mb-6`}>
                            {groundingSteps[groundingStep]?.description}
                        </p>
                        <div className="flex justify-center gap-2">
                            {groundingSteps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                        index <= groundingStep ? 'bg-indigo-500' : 'bg-gray-600'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card-modern max-w-2xl mx-auto animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl animate-float">🧘</div>
                        <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Unwind Protocol</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                    >
                        <span className="text-2xl">×</span>
                    </button>
                </div>
                <div className={`mb-6 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} text-center`}>Calm body, clear mind. Reset the system; return to intention.</div>

                {!currentTool ? (
                    <div className="space-y-4">
                        <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-center mb-6`}>
                            Choose a tool to help you reset and find your focus
                        </p>
                        <div className="grid gap-4">
                            {tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleToolSelect(tool)}
                                    className={`p-6 rounded-xl border-2 border-indigo-500 hover:border-indigo-400 transition-all duration-200 text-left group hover:scale-105 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                                            {tool.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {tool.name}
                                            </h4>
                                            <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm mb-2`}>
                                                {tool.description}
                                            </p>
                                            <span className="text-xs text-indigo-400">
                                                {tool.duration}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        {renderSessionTimer()}
                        {renderToolContent()}
                        <div className="mt-8 flex items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    setIsActive(false);
                                    setCurrentTool(null);
                                    if (intervalRef.current) {
                                        clearInterval(intervalRef.current);
                                    }
                                    if (sessionTimerRef.current) {
                                        clearInterval(sessionTimerRef.current);
                                    }
                                }}
                                className="btn-primary"
                            >
                                Stop Session
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 
