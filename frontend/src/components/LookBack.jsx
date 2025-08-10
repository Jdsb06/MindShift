import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function LookBack({ isOpen, onClose, momentumLogs, compassGoals }) {
    const { isDark } = useTheme();
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [reviewData, setReviewData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const periods = [
        { id: 'week', name: 'This Week', icon: '📅' },
        { id: 'month', name: 'This Month', icon: '📊' }
    ];

    useEffect(() => {
        if (isOpen && momentumLogs) {
            generateReviewData();
        }
    }, [isOpen, selectedPeriod, momentumLogs]);

    const generateReviewData = () => {
        setIsGenerating(true);

        // Calculate date range
        const now = new Date();
        const startDate = new Date();

        if (selectedPeriod === 'week') {
            startDate.setDate(now.getDate() - 7);
        } else {
            startDate.setMonth(now.getMonth() - 1);
        }

        // Filter logs for the selected period
        const periodLogs = momentumLogs.filter(log => {
            const logDate = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
            return logDate >= startDate && logDate <= now;
        });

        // Analyze data
        const analysis = analyzeLogs(periodLogs);
        setReviewData(analysis);
        setIsGenerating(false);
    };

    const analyzeLogs = (logs) => {
        if (logs.length === 0) {
            return {
                totalEntries: 0,
                activeDays: 0,
                topTags: [],
                topGoals: [],
                dailyActivity: {},
                tagDistribution: {},
                goalProgress: {},
                insights: [],
                recommendations: []
            };
        }

        // Daily activity
        const dailyActivity = {};
        const tagCounts = {};
        const goalCounts = {};
        const uniqueDays = new Set();

        logs.forEach(log => {
            const date = log.createdAt?.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
            const dayKey = date.toLocaleDateString();
            dailyActivity[dayKey] = (dailyActivity[dayKey] || 0) + 1;
            uniqueDays.add(dayKey);

            // Count tags
            if (log.tags) {
                log.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }

            // Count goal links
            if (log.linkedGoal) {
                goalCounts[log.linkedGoal] = (goalCounts[log.linkedGoal] || 0) + 1;
            }
        });

        // Get top tags and goals
        const topTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count }));

        const topGoals = Object.entries(goalCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([goal, count]) => ({ goal, count }));

        // Generate insights
        const insights = generateInsights(logs, topTags, topGoals, uniqueDays.size);
        const recommendations = generateRecommendations(logs, topTags, topGoals);

        return {
            totalEntries: logs.length,
            activeDays: uniqueDays.size,
            topTags,
            topGoals,
            dailyActivity,
            tagDistribution: tagCounts,
            goalProgress: goalCounts,
            insights,
            recommendations
        };
    };

    const generateInsights = (logs, topTags, topGoals, activeDays) => {
        const insights = [];

        if (logs.length > 0) {
            insights.push(`You logged ${logs.length} accomplishments across ${activeDays} days`);
        }

        if (topTags.length > 0) {
            insights.push(`Your main focus was on ${topTags[0].tag} (${topTags[0].count} entries)`);
        }

        if (topGoals.length > 0) {
            insights.push(`You made the most progress toward "${topGoals[0].goal}"`);
        }

        if (activeDays >= 5) {
            insights.push("You showed great consistency this period!");
        }

        return insights;
    };

    const generateRecommendations = (logs, topTags, topGoals) => {
        const recommendations = [];

        if (logs.length < 5) {
            recommendations.push("Try logging at least one win per day to build momentum");
        }

        if (topTags.length === 0) {
            recommendations.push("Consider adding tags to track your focus areas");
        }

        if (topGoals.length === 0) {
            recommendations.push("Link more actions to your compass goals for better alignment");
        }

        if (topTags.length > 0 && topTags[0].count > logs.length * 0.6) {
            recommendations.push("Great focus! Consider exploring other areas for balance");
        }

        return recommendations;
    };

    const renderHeatmap = () => {
        if (!reviewData?.dailyActivity) return null;

        const days = Object.keys(reviewData.dailyActivity).sort();
        const maxCount = Math.max(...Object.values(reviewData.dailyActivity));

        return (
            <div className="mb-6">
                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Daily Activity Heatmap
                </h4>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                        const count = reviewData.dailyActivity[day];
                        const intensity = maxCount > 0 ? count / maxCount : 0;

                        return (
                            <div
                                key={day}
                                className={`aspect-square rounded-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                style={{
                                    backgroundColor: `rgba(99, 102, 241, ${intensity * 0.8 + 0.2})`
                                }}
                                title={`${day}: ${count} entries`}
                            />
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderTagChart = () => {
        if (!reviewData?.topTags || reviewData.topTags.length === 0) return null;

        const total = reviewData.topTags.reduce((sum, tag) => sum + tag.count, 0);

        return (
            <div className="mb-6">
                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Focus Areas
                </h4>
                <div className="space-y-2">
                    {reviewData.topTags.map((tag, index) => {
                        const percentage = total > 0 ? (tag.count / total) * 100 : 0;

                        return (
                            <div key={tag.tag} className="flex items-center gap-3">
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'} min-w-[60px]`}>
                                    {tag.tag}
                                </span>
                                <div className={`flex-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-full h-2`}>
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'} min-w-[40px] text-right`}>
                                    {tag.count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="card-modern max-w-4xl mx-auto animate-scale-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl animate-float">📊</div>
                        <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Look Back</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
                    >
                        <span className="text-2xl">×</span>
                    </button>
                </div>
                <div className={`mb-6 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} text-center`}>Reflection creates direction. Learn the rhythm; design the next move.</div>

                {/* Period Selector */}
                <div className="flex gap-2 mb-6">
                    {periods.map((period) => (
                        <button
                            key={period.id}
                            onClick={() => setSelectedPeriod(period.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                selectedPeriod === period.id
                                    ? 'bg-indigo-600 text-white'
                                    : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:bg-indigo-600 hover:text-white`
                            }`}
                        >
                            <span>{period.icon}</span>
                            <span>{period.name}</span>
                        </button>
                    ))}
                </div>

                {isGenerating ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4 animate-pulse">📊</div>
                        <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Generating your review...</p>
                    </div>
                ) : reviewData ? (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="text-2xl font-bold text-indigo-500">{reviewData.totalEntries}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Total Wins</div>
                            </div>
                            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="text-2xl font-bold text-green-500">{reviewData.activeDays}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Active Days</div>
                            </div>
                            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="text-2xl font-bold text-purple-500">{reviewData.topTags.length}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Focus Areas</div>
                            </div>
                            <div className={`text-center p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="text-2xl font-bold text-yellow-500">{reviewData.topGoals.length}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Goals Progress</div>
                            </div>
                        </div>

                        {/* Heatmap */}
                        {renderHeatmap()}

                        {/* Tag Distribution */}
                        {renderTagChart()}

                        {/* Insights */}
                        {reviewData.insights.length > 0 && (
                            <div className="mb-6">
                                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Key Insights
                                </h4>
                                <div className="space-y-2">
                                    {reviewData.insights.map((insight, index) => (
                                        <div key={index} className={`flex items-start gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} animate-slide-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                                            <span className="text-indigo-500 mt-0.5">💡</span>
                                            <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm`}>
                                                {insight}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {reviewData.recommendations.length > 0 && (
                            <div className="mb-6">
                                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Suggestions for Next {selectedPeriod === 'week' ? 'Week' : 'Month'}
                                </h4>
                                <div className="space-y-2">
                                    {reviewData.recommendations.map((rec, index) => (
                                        <div key={index} className={`flex items-start gap-2 p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'} animate-slide-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                                            <span className="text-green-500 mt-0.5">🚀</span>
                                            <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} text-sm`}>
                                                {rec}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share Button */}
                        <button
                            onClick={() => {
                                // TODO: Implement share functionality
                                alert('Share functionality coming soon!');
                            }}
                            className="btn-primary w-full"
                        >
                            Share Review ✨
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4 animate-float">🌟</div>
                        <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>No data available for this period</p>
                    </div>
                )}
            </div>
        </div>
    );
} 
