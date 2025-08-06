import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function MomentumHeatmap({ momentumLogs }) {
    const { isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState(null);
    const [hoveredDate, setHoveredDate] = useState(null);

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

    // Generate calendar grid
    const calendarGrid = useMemo(() => {
        const grid = [];
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 364);

        // Group by weeks (7 columns)
        let currentWeek = [];
        let currentDate = new Date(startDate);

        while (currentDate <= today) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const count = heatmapData[dateKey] || 0;
            const intensity = getIntensity(count);

            currentWeek.push({
                date: new Date(currentDate),
                dateKey,
                count,
                intensity
            });

            if (currentWeek.length === 7) {
                grid.push(currentWeek);
                currentWeek = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Add remaining days if any
        if (currentWeek.length > 0) {
            grid.push(currentWeek);
        }

        return grid;
    }, [heatmapData]);

    // Calculate current streak
    const calculateCurrentStreak = () => {
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);

        while (true) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const count = heatmapData[dateKey] || 0;
            
            if (count > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    };

    // Calculate longest streak
    const calculateLongestStreak = () => {
        let longestStreak = 0;
        let currentStreak = 0;
        const dates = Object.keys(heatmapData).sort();

        dates.forEach(dateKey => {
            const count = heatmapData[dateKey] || 0;
            if (count > 0) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });

        return longestStreak;
    };

    // Calculate stats
    const stats = useMemo(() => {
        const totalDays = Object.keys(heatmapData).length;
        const activeDays = Object.values(heatmapData).filter(count => count > 0).length;
        const totalEntries = Object.values(heatmapData).reduce((sum, count) => sum + count, 0);
        const currentStreak = calculateCurrentStreak();
        const longestStreak = calculateLongestStreak();

        return {
            totalDays,
            activeDays,
            totalEntries,
            currentStreak,
            longestStreak,
            consistency: totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0
        };
    }, [heatmapData]);

    // Get color based on intensity
    const getColor = (intensity) => {
        if (intensity === 0) return isDark ? '#374151' : '#f3f4f6';
        if (intensity === 1) return 'rgba(99, 102, 241, 0.2)';
        if (intensity === 2) return 'rgba(99, 102, 241, 0.4)';
        if (intensity === 3) return 'rgba(99, 102, 241, 0.6)';
        if (intensity === 4) return 'rgba(99, 102, 241, 0.8)';
        return 'rgba(99, 102, 241, 1)';
    };

    // Get tooltip content
    const getTooltipContent = (date, count) => {
        if (count === 0) {
            return `${date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}: No entries`;
        }
        return `${date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}: ${count} entr${count === 1 ? 'y' : 'ies'}`;
    };

    return (
        <div className="card-modern animate-slide-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-2xl sm:text-3xl animate-float">📊</div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Momentum Heatmap
                    </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5].map(intensity => (
                            <div
                                key={intensity}
                                className="w-3 h-3 rounded-sm border border-gray-600"
                                style={{ backgroundColor: getColor(intensity) }}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-xl font-bold text-indigo-500">{stats.activeDays}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Days</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-xl font-bold text-green-500">{stats.consistency}%</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Consistency</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-xl font-bold text-purple-500">{stats.currentStreak}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Streak</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-xl font-bold text-yellow-500">{stats.longestStreak}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Longest Streak</div>
                </div>
                <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="text-xl font-bold text-blue-500">{stats.totalEntries}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Entries</div>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
                <div className="flex gap-1 min-w-max mx-auto">
                    {calendarGrid.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={day.dateKey}
                                    className={`w-3 h-3 rounded-sm border transition-all duration-200 cursor-pointer ${
                                        isDark ? 'border-gray-700' : 'border-gray-200'
                                    } ${
                                        hoveredDate === day.dateKey ? 'scale-125 shadow-lg z-10' : ''
                                    } ${
                                        selectedDate?.dateKey === day.dateKey ? 'ring-2 ring-indigo-400' : ''
                                    }`}
                                    style={{ backgroundColor: getColor(day.intensity) }}
                                    onMouseEnter={() => setHoveredDate(day.dateKey)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                    onClick={() => setSelectedDate(day)}
                                    title={getTooltipContent(day.date, day.count)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
                <div className="mt-4 p-4 rounded-lg bg-indigo-600 bg-opacity-20 border border-indigo-500 border-opacity-30 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-semibold">
                                {selectedDate.date.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </h4>
                            <p className="text-gray-300 text-sm">
                                {selectedDate.count === 0 
                                    ? 'No entries on this day' 
                                    : `${selectedDate.count} entr${selectedDate.count === 1 ? 'y' : 'ies'} logged`
                                }
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                        >
                            <span className="text-xl">×</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-4 text-center">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Each square represents one day. Darker colors indicate more entries. Click any square to see details.
                </p>
            </div>
        </div>
    );
} 