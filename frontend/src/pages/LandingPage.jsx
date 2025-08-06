import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [scrollY, setScrollY] = useState(0);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    // Animation words for the mind stream
    const anxietyWords = [
        'overwhelmed', 'burnout', 'procrastinating', 'endless to-do list', 
        'mindless scrolling', "can't focus", 'anxiety', 'stress', 'chaos'
    ];
    
    const momentumWords = [
        'in control', 'one step at a time', 'focus', 'accomplished', 
        'gym done', 'chapter read', 'clarity', 'momentum', 'progress'
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Animation variables
        let anxietyParticles = [];
        let momentumParticles = [];
        let animationId;

        // Initialize particles
        const initParticles = () => {
            const canvasRect = canvas.getBoundingClientRect();
            anxietyParticles = anxietyWords.map((word, i) => ({
                text: word,
                x: Math.random() * canvasRect.width * 0.4,
                y: Math.random() * canvasRect.height,
                speed: 0.5 + Math.random() * 1,
                opacity: 0.3 + Math.random() * 0.4,
                size: 14 + Math.random() * 8,
                glitch: Math.random() > 0.7
            }));

            momentumParticles = momentumWords.map((word, i) => ({
                text: word,
                x: canvasRect.width * 0.6 + Math.random() * canvasRect.width * 0.4,
                y: Math.random() * canvasRect.height,
                speed: 0.3 + Math.random() * 0.8,
                opacity: 0.4 + Math.random() * 0.6,
                size: 16 + Math.random() * 10,
                glow: true
            }));
        };

        initParticles();

        const animate = () => {
            const canvasRect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);
            
            // Calculate scroll progress (0 to 1)
            const scrollProgress = Math.min(scrollY / (window.innerHeight * 0.5), 1);
            
            // Animate anxiety stream (fade out as user scrolls)
            anxietyParticles.forEach((particle, i) => {
                particle.y -= particle.speed;
                if (particle.y < -50) {
                    particle.y = canvasRect.height + 50;
                    particle.x = Math.random() * canvasRect.width * 0.4;
                }

                const opacity = particle.opacity * (1 - scrollProgress * 0.8);
                if (opacity > 0.1) {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.font = `${particle.size}px Inter, system-ui, -apple-system, sans-serif`;
                    ctx.fillStyle = isDark ? '#ef4444' : '#dc2626';
                    
                    if (particle.glitch && Math.random() > 0.95) {
                        ctx.fillStyle = isDark ? '#fca5a5' : '#fecaca';
                    }
                    
                    ctx.fillText(particle.text, particle.x, particle.y);
                    ctx.restore();
                }
            });

            // Animate momentum stream (grow stronger and move to center)
            momentumParticles.forEach((particle, i) => {
                particle.y -= particle.speed;
                if (particle.y < -50) {
                    particle.y = canvasRect.height + 50;
                    particle.x = canvasRect.width * 0.6 + Math.random() * canvasRect.width * 0.4;
                }

                // Move towards center as user scrolls
                const targetX = canvasRect.width * 0.5;
                const currentX = particle.x;
                particle.x = currentX + (targetX - currentX) * scrollProgress * 0.1;

                const opacity = particle.opacity * (0.5 + scrollProgress * 0.5);
                if (opacity > 0.1) {
                    ctx.save();
                    ctx.globalAlpha = opacity;
                    ctx.font = `${particle.size}px Inter, system-ui, -apple-system, sans-serif`;
                    
                    if (particle.glow) {
                        // Add glow effect
                        ctx.shadowColor = isDark ? '#6366f1' : '#4f46e5';
                        ctx.shadowBlur = 10;
                    }
                    
                    ctx.fillStyle = isDark ? '#6366f1' : '#4f46e5';
                    ctx.fillText(particle.text, particle.x, particle.y);
                    ctx.restore();
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [scrollY, isDark]);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'} overflow-x-hidden`}>
            {/* Interactive Canvas Background */}
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
                style={{ opacity: 0.6 }}
            />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl animate-float">🧠</div>
                        <h1 className="text-2xl font-bold text-white">MindShift</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className={`hidden sm:block px-4 py-2 rounded-full transition-all duration-200 ${
                                isDark 
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                            How It Works
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className={`hidden sm:block px-4 py-2 rounded-full transition-all duration-200 ${
                                isDark 
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                            Features
                        </button>
                        <ThemeToggle />
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-6 z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            Stop the busywork.
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent animate-pulse-slow">
                                Start building momentum.
                            </span>
                        </h1>
                    </div>
                    
                    <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                            MindShift helps you trade mindless scrolling for meaningful progress, 
                            one small win at a time.
                        </p>
                    </div>
                    
                    <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        <button
                            onClick={() => navigate('/signup')}
                            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-indigo-500/25 animate-float"
                        >
                            <span className="relative z-10">Find Your Focus →</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>
                
                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            How MindShift Works
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Three simple steps to transform your productivity and mental clarity
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="text-center animate-slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg">
                                🎯
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Set Your Compass</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Define your three most important goals. These become your north star, 
                                guiding every decision and action.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center animate-slide-in" style={{ animationDelay: '0.2s' }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg">
                                📈
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Log Your Wins</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Capture every small victory, no matter how tiny. Build momentum 
                                by celebrating progress, not just perfection.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center animate-slide-in" style={{ animationDelay: '0.3s' }}>
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg">
                                🤖
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Get AI Insights</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Our AI coach analyzes your patterns and provides personalized 
                                insights to help you stay focused and motivated.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Why Choose MindShift?
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Built for humans, not robots. Simple, beautiful, and actually works.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Feature 1 */}
                        <div className="card-modern animate-slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-start gap-4">
                                <div className="text-3xl">🧭</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Compass Goals</h3>
                                    <p className="text-gray-300">
                                        Keep your three most important goals front and center. 
                                        Never lose sight of what truly matters.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="card-modern animate-slide-in" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-start gap-4">
                                <div className="text-3xl">🏷️</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Smart Tagging</h3>
                                    <p className="text-gray-300">
                                        Organize your wins with custom tags. See patterns emerge 
                                        and understand your strengths.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="card-modern animate-slide-in" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-start gap-4">
                                <div className="text-3xl">📊</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Weekly Reflections</h3>
                                    <p className="text-gray-300">
                                        Get AI-powered insights about your week. Celebrate progress 
                                        and identify areas for growth.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="card-modern animate-slide-in" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-start gap-4">
                                <div className="text-3xl">🧘</div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Mindful Moments</h3>
                                    <p className="text-gray-300">
                                        Built-in breathing exercises and focus tools to help you 
                                        stay present and centered.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="card-modern animate-fade-in">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Ready to Transform Your Productivity?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of people who have already shifted their mindset 
                            and built unstoppable momentum.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/signup')}
                                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-indigo-500/25"
                            >
                                Start Your MindShift Today
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 ${
                                    isDark 
                                        ? 'bg-gray-800 text-white hover:bg-gray-700' 
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                            >
                                I Already Have an Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 relative z-10">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="text-2xl">🧠</div>
                        <h3 className="text-xl font-bold text-white">MindShift</h3>
                    </div>
                    <p className="text-gray-400 mb-6">
                        Transform your productivity, one small win at a time.
                    </p>
                    <div className="flex justify-center gap-6 text-sm text-gray-500">
                        <span>© 2024 MindShift. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
} 