import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function MomentumHeatmap({ momentumLogs }) {
    const { isDark, colorScheme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(null);
    const [hoveredDate, setHoveredDate] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [tooltipContent, setTooltipContent] = useState({ date: '', count: 0 });
    const tooltipRef = useRef(null);
    const heatmapRef = useRef(null);
    
    // Define color scheme for the heatmap
    const getColorScheme = () => {
        switch(colorScheme) {
            case 'ocean':
                return {
                    gradient: 'from-blue-500 to-cyan-400',
                    primary: 'text-blue-500',
                    secondary: 'text-cyan-400',
                    light: 'bg-blue-50',
                    dark: 'bg-blue-900',
                    levels: ['bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500']
                };
            case 'sunset':
                return {
                    gradient: 'from-amber-500 to-red-400',
                    primary: 'text-amber-500',
                    secondary: 'text-red-500',
                    light: 'bg-amber-50',
                    dark: 'bg-amber-900',
                    levels: ['bg-amber-100', 'bg-amber-200', 'bg-amber-300', 'bg-amber-400', 'bg-amber-500']
                };
            case 'forest':
                return {
                    gradient: 'from-emerald-500 to-green-400',
                    primary: 'text-emerald-500',
                    secondary: 'text-green-500',
                    light: 'bg-emerald-50',
                    dark: 'bg-emerald-900',
                    levels: ['bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-500']
                };
            case 'lavender':
                return {
                    gradient: 'from-violet-500 to-fuchsia-400',
                    primary: 'text-violet-500',
                    secondary: 'text-fuchsia-500',
                    light: 'bg-violet-50',
                    dark: 'bg-violet-900',
                    levels: ['bg-violet-100', 'bg-violet-200', 'bg-violet-300', 'bg-violet-400', 'bg-violet-500']
                };
            default:
                return {
                    gradient: 'from-indigo-500 to-purple-400',
                    primary: 'text-indigo-500',
                    secondary: 'text-purple-500',
                    light: 'bg-indigo-50',
                    dark: 'bg-indigo-900',
                    levels: ['bg-indigo-100', 'bg-indigo-200', 'bg-indigo-300', 'bg-indigo-400', 'bg-indigo-500']
                };
        }
    };
    
    const colors = getColorScheme();

    // Generate the last 365 days of data
    const heatmapData = useMemo(() => {
        const data = {};
        const today = new Date();

        // Generate dates for the last 365 days
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            data[dateKey] = 0;
        }

        // Count entries for each day
        momentumLogs.forEach(log => {
            const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
            const dateKey = logDate.toISOString().split('T')[0];
            if (data[dateKey] !== undefined) {
                data[dateKey]++;
            }
        });

        return data;
    }, [momentumLogs]);

    // Calculate intensity levels for coloring
    const maxCount = Math.max(...Object.values(heatmapData));
    const getIntensity = (count) => {
        if (count === 0) return 0;
        if (maxCount === 0) return 0;
        if (count === 1) return 1;
        if (count <= Math.ceil(maxCount * 0.25)) return 2;
        if (count <= Math.ceil(maxCount * 0.5)) return 3;
        if (count <= Math.ceil(maxCount * 0.75)) return 4;
        return 5;
    };

    // Check if user has any entries at all
    const hasEntries = momentumLogs.length > 0;

    // Check if user has entries on at least 3 different days
    const activeDaysCount = Object.values(heatmapData).filter(count => count > 0).length;
    const shouldShowStats = activeDaysCount >= 3;
    
    // Handle tooltip display
    const handleDayHover = (date, count, event) => {
        if (!tooltipRef.current) return;
        
        const rect = event.currentTarget.getBoundingClientRect();
        const heatmapRect = heatmapRef.current.getBoundingClientRect();
        
        setTooltipPos({
            x: rect.left - heatmapRect.left + rect.width/2,
            y: rect.top - heatmapRect.top
        });
        
        setTooltipContent({
            date: new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }),
            count
        });
        
        setShowTooltip(true);
    };
    
    const handleDayLeave = () => {
        setShowTooltip(false);
    };

    // Calculate streak and other metrics
    const { currentStreak, longestStreak, totalActiveDays, consistency } = useMemo(() => {
        if (!hasEntries) {
            return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0, consistency: 0 };
        }

        // Calculate metrics
        let current = 0;
        let longest = 0;
        let activeDays = 0;
        let totalDays = Object.keys(heatmapData).length;

        const sortedDates = Object.keys(heatmapData).sort();

        for (let i = sortedDates.length - 1; i >= 0; i--) {
            const date = sortedDates[i];
            const count = heatmapData[date];

            if (count > 0) {
                activeDays++;
                current++;
                longest = Math.max(longest, current);
            } else {
                current = 0;
            }
        }

        return {
            currentStreak: current,
            longestStreak: longest,
            totalActiveDays: activeDays,
            consistency: Math.round((activeDays / totalDays) * 100)
        };
    }, [heatmapData, hasEntries]);

    // Generate calendar grid - this is now unused as we generate the calendar directly in the render
    const calendarGrid = useMemo(() => {
        // If user has no entries, don't generate the full grid
        if (!hasEntries) return [];

        // This function is kept for backward compatibility but no longer used
        return [];
    }, [heatmapData, getIntensity, isDark, hasEntries]);

    // Content for users with no entries or very few active days
    if (!hasEntries) {
        return (
            <div className={`card-modern animate-slide-in`} style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-2xl sm:text-3xl animate-float">📊</div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Momentum Map
                    </h2>
                </div>

                <div
                    className={`flex flex-col items-center justify-center p-8 rounded-xl text-center bg-gradient-to-br ${
                        isDark 
                            ? 'from-gray-800 to-gray-900' 
                            : 'from-gray-100 to-gray-200'
                    } relative overflow-hidden`}
                    style={{
                        minHeight: '240px',
                        backgroundImage: isDark
                            ? 'radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0) 50%)'
                            : 'radial-gradient(circle at 70% 30%, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.03) 25%, rgba(99, 102, 241, 0) 50%)'
                    }}
                >
                    {/* Abstract decoration - faint dots */}
                    <div className="absolute inset-0 opacity-20">
                        {Array.from({length: 50}).map((_, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full bg-indigo-400"
                                style={{
                                    width: Math.random() * 4 + 2 + 'px',
                                    height: Math.random() * 4 + 2 + 'px',
                                    left: Math.random() * 100 + '%',
                                    top: Math.random() * 100 + '%',
                                    opacity: Math.random() * 0.5 + 0.2
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 max-w-md">
                        <div className="text-5xl mb-6 animate-float">✨</div>
                        <p className={`text-xl mb-4 font-bold ${isDark ? 'text-indigo-200' : 'text-indigo-700'}`}>
                            Your Journey Begins Here
                        </p>
                        <p className={`${isDark ? 'text-gray-100' : 'text-gray-800'} mb-6`}>
                            "The best time to start was yesterday. The next best time is now."
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            Log your wins consistently to build your momentum map
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // For users with entries but fewer than 3 active days - simplified view without metrics
    if (!shouldShowStats) {
        return (
            <div className={`card-modern animate-slide-in`} style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="text-2xl sm:text-3xl animate-float">📊</div>
                    <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Momentum Map
                    </h2>
                </div>

                <div className="flex flex-col items-center justify-center p-6">
                    <p className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-center mb-4`}>
                        Great start! Log more wins to unlock your full momentum map.
                    </p>

                    <div className="w-full mt-4 relative">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${Math.min((activeDaysCount/3) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-200' : 'text-gray-700'} mt-2 text-center`}>{activeDaysCount}/3 active days</p>
                    </div>
                </div>
            </div>
        );
    }

    // Regular view for users with sufficient data
    return (
        <div className={`card-modern animate-slide-in relative overflow-hidden`} style={{ animationDelay: '0.3s' }} ref={heatmapRef}>
            {/* Background gradient effect */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br opacity-10 rounded-full blur-3xl -z-10"
                style={{
                    background: `linear-gradient(to bottom right, var(--color-${colorScheme || 'indigo'}-400), var(--color-${colorScheme || 'indigo'}-600))`,
                    transform: 'translate(25%, -25%)'
                }}>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                    <div className="text-2xl sm:text-3xl animate-float z-10">📊</div>
                    <div className={`absolute -inset-1 rounded-full ${colors.light} opacity-30 blur-sm -z-10`}></div>
                </div>
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Momentum Map
                </h2>
            </div>

            {/* Stats section with enhanced visuals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className={`stat-card group transition-all duration-300 hover:scale-105 ${
                    isDark 
                        ? 'bg-gray-800/80 hover:bg-gray-800 border-gray-700/50' 
                        : 'bg-white/80 hover:bg-white border-gray-200/50'
                    } border backdrop-blur-sm rounded-xl p-3 text-center relative overflow-hidden`}
                >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <div className={`text-2xl font-bold ${colors.primary}`}>
                        {totalActiveDays}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Active Days
                    </div>
                </div>
                
                <div className={`stat-card group transition-all duration-300 hover:scale-105 ${
                    isDark 
                        ? 'bg-gray-800/80 hover:bg-gray-800 border-gray-700/50' 
                        : 'bg-white/80 hover:bg-white border-gray-200/50'
                    } border backdrop-blur-sm rounded-xl p-3 text-center relative overflow-hidden`}
                >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <div className="text-2xl font-bold text-green-500 flex justify-center items-center">
                        {currentStreak}
                        {currentStreak > 0 && currentStreak === longestStreak && (
                            <span className="ml-1 text-xs animate-pulse">🔥</span>
                        )}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Streak
                    </div>
                </div>
                
                <div className={`stat-card group transition-all duration-300 hover:scale-105 ${
                    isDark 
                        ? 'bg-gray-800/80 hover:bg-gray-800 border-gray-700/50' 
                        : 'bg-white/80 hover:bg-white border-gray-200/50'
                    } border backdrop-blur-sm rounded-xl p-3 text-center relative overflow-hidden`}
                >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-400 to-fuchsia-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <div className="text-2xl font-bold text-purple-500">
                        {longestStreak}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Longest Streak
                    </div>
                </div>
                
                <div className={`stat-card group transition-all duration-300 hover:scale-105 ${
                    isDark 
                        ? 'bg-gray-800/80 hover:bg-gray-800 border-gray-700/50' 
                        : 'bg-white/80 hover:bg-white border-gray-200/50'
                    } border backdrop-blur-sm rounded-xl p-3 text-center relative overflow-hidden`}
                >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    <div className="text-2xl font-bold text-amber-500">
                        {consistency}%
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Consistency
                    </div>
                </div>
            </div>

            {/* Calendar heatmap with enhanced visuals */}
            <div className={`border rounded-xl p-4 ${
                isDark 
                    ? 'border-gray-700/50 bg-gray-800/30' 
                    : 'border-gray-200/50 bg-white/30'
                } backdrop-blur-sm overflow-hidden`}
            >
                <div className="flex justify-between items-center mb-4">
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Activity over time
                    </div>
                    <div className="flex items-center">
                        <span className={`text-xs mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Less</span>
                        <div className="flex gap-0.5">
                            {[0, 1, 2, 3, 4, 5].map((intensity) => (
                                <div
                                    key={intensity}
                                    className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 ${
                                        intensity === 0 
                                            ? (isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-200 border border-gray-300') 
                                            : colors.levels[intensity-1]
                                    }`}
                                ></div>
                            ))}
                        </div>
                        <span className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>More</span>
                    </div>
                </div>
                
                <div className="overflow-x-auto pb-2 no-scrollbar">
                    <div className="min-w-max grid grid-cols-7 gap-1">
                        {/* Week day labels */}
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} h-6 flex items-center justify-center`}>M</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} h-6 flex items-center justify-center`}>T</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} h-6 flex items-center justify-center`}>W</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} h-6 flex items-center justify-center`}>T</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} h-6 flex items-center justify-center`}>F</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} h-6 flex items-center justify-center`}>S</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} h-6 flex items-center justify-center`}>S</div>
                        
                        {/* Generate calendar squares */}
                        {Object.entries(heatmapData).map(([dateKey, count]) => {
                            const date = new Date(dateKey);
                            const dayOfWeek = date.getDay(); // 0 is Sunday
                            const intensity = getIntensity(count);
                            
                            // Adjust for starting with Monday (0 = Monday)
                            const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                            
                            return (
                                <div 
                                    key={dateKey}
                                    style={{ gridColumn: adjustedDay + 1 }}
                                    className={`w-6 h-6 rounded-sm flex items-center justify-center transition-all duration-300 hover:scale-110
                                        ${intensity === 0 
                                            ? (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300') 
                                            : colors.levels[intensity-1]}
                                        ${new Date(dateKey).toDateString() === new Date().toDateString() ? 'ring-2 ring-white/30' : ''}
                                    `}
                                    onMouseEnter={(e) => handleDayHover(dateKey, count, e)}
                                    onMouseLeave={handleDayLeave}
                                >
                                    {new Date(dateKey).getDate() === 1 && (
                                        <span className={`absolute text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} -mt-6`}>
                                            {date.toLocaleString('default', { month: 'short' })}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Tooltip */}
            {showTooltip && (
                <div 
                    ref={tooltipRef}
                    className={`absolute z-20 px-3 py-2 rounded-lg shadow-lg backdrop-blur-md text-sm 
                        ${isDark 
                            ? 'bg-gray-900/90 text-white border border-gray-700' 
                            : 'bg-white/90 text-gray-800 border border-gray-200'}
                    `}
                    style={{ 
                        left: `${tooltipPos.x}px`, 
                        top: `${tooltipPos.y - 45}px`,
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none',
                        boxShadow: isDark 
                            ? '0 4px 20px rgba(0,0,0,0.5)' 
                            : '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                >
                    <div className="font-medium">{tooltipContent.date}</div>
                    <div className="text-center">
                        {tooltipContent.count > 0
                            ? <span className={colors.primary}>
                                {tooltipContent.count} {tooltipContent.count === 1 ? 'entry' : 'entries'}
                              </span>
                            : <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                No entries
                              </span>
                        }
                    </div>
                </div>
            )}
        </div>
    );
}
