import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import ColorSchemeSelector from '../components/ColorSchemeSelector';
import BackgroundAudio from '../components/BackgroundAudio';

// --- Self-Contained Components for easier implementation ---

// Contained Neural HUD overlay demo
const NeuralHUDOverlay = ({ active, onClose, initialAnchor }) => {
    const containerRef = useRef(null);
    const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
    const [load, setLoad] = useState(22);
    const [sync, setSync] = useState(68);
    const targetRef = useRef({ x: 0.5, y: 0.5 });
    const prevRef = useRef({ x: null, y: null, t: null });
    const loadRef = useRef(22);
    const syncRef = useRef(68);
    const ghostsRef = useRef([]);
    const ripplesRef = useRef([]);
    const loadHistoryRef = useRef([]);
    const rafRef = useRef(null);
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // rAF loop: sync oscillation, load decay, position lerp, history, ripple GC
    useEffect(() => {
        if (!active) return;
        let running = true;
        const tick = (t) => {
            if (!running) return;
            const newSync = prefersReduced ? syncRef.current : 70 + Math.sin(t / 900) * 20;
            syncRef.current = Math.max(0, Math.min(100, newSync));
            setSync(syncRef.current);
            const baseline = 22;
            loadRef.current = loadRef.current + (baseline - loadRef.current) * 0.03;
            setLoad(loadRef.current);
            const lerp = (a, b, f) => a + (b - a) * f;
            setPos((p) => ({ x: lerp(p.x, targetRef.current.x, 0.18), y: lerp(p.y, targetRef.current.y, 0.18) }));
            const history = loadHistoryRef.current;
            history.push(loadRef.current);
            if (history.length > 48) history.shift();
            const now = performance.now();
            ripplesRef.current = ripplesRef.current.filter(r => now - r.t < 900);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            running = false;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [active, prefersReduced]);

    // On activation, set initial position to the provided anchor (e.g., button center)
    useEffect(() => {
        if (!active) return;
        if (!initialAnchor) return;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const clamp01 = (v) => Math.max(0, Math.min(1, v));
        const x = clamp01((initialAnchor.clientX - rect.left) / rect.width);
        const y = clamp01((initialAnchor.clientY - rect.top) / rect.height);
        targetRef.current = { x, y };
        setPos({ x, y });
        prevRef.current = { x, y, t: performance.now() };
    }, [active, initialAnchor]);

    // Pointer interactions
    useEffect(() => {
        if (!active) return;
        const el = containerRef.current;
        if (!el) return;
        const onMove = (clientX, clientY) => {
            const rect = el.getBoundingClientRect();
            const x = (clientX - rect.left) / rect.width;
            const y = (clientY - rect.top) / rect.height;
            const now = performance.now();
            const prev = prevRef.current;
            if (prev.t != null && prev.x != null && prev.y != null) {
                const dx = x - prev.x;
                const dy = y - prev.y;
                const dt = Math.max(1, now - prev.t);
                const speed = Math.sqrt(dx * dx + dy * dy) / dt;
                const spike = Math.min(100, speed * 22000);
                const next = loadRef.current + (spike - loadRef.current) * 0.35;
                loadRef.current = next;
                setLoad(next);
            }
            prevRef.current = { x, y, t: now };
            targetRef.current = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
            if (!prefersReduced) {
                ghostsRef.current.push({ x, y, t: now });
                if (ghostsRef.current.length > 6) ghostsRef.current.shift();
            }
        };
        const handleMouse = (e) => onMove(e.clientX, e.clientY);
        const handleTouch = (e) => {
            if (!e.touches?.[0]) return;
            onMove(e.touches[0].clientX, e.touches[0].clientY);
        };
        const handleDown = (e) => {
            const point = e.touches?.[0] ?? e;
            const rect = el.getBoundingClientRect();
            const x = (point.clientX - rect.left) / rect.width;
            const y = (point.clientY - rect.top) / rect.height;
            ripplesRef.current.push({ x, y, t: performance.now() });
        };
        el.addEventListener('mousemove', handleMouse);
        el.addEventListener('touchmove', handleTouch, { passive: true });
        el.addEventListener('mousedown', handleDown);
        el.addEventListener('touchstart', handleDown, { passive: true });
        return () => {
            el.removeEventListener('mousemove', handleMouse);
            el.removeEventListener('touchmove', handleTouch);
            el.removeEventListener('mousedown', handleDown);
            el.removeEventListener('touchstart', handleDown);
        };
    }, [active, prefersReduced]);

    // ESC to exit
    useEffect(() => {
        if (!active) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [active, onClose]);

    if (!active) return null;

    const ringSize = 90 + (load / 100) * 40;
    const ringStyle = {
        left: `${pos.x * 100}%`,
        top: `${pos.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: `${ringSize}px`,
        height: `${ringSize}px`,
        transition: prefersReduced ? 'none' : 'transform 60ms linear, width 120ms ease, height 120ms ease'
    };

    return (
        <div ref={containerRef} className="absolute inset-0" role="region" aria-label="Neural HUD demo">
            {/* Background grid and glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(79,70,229,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.08) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* Crosshair reticle at focus */}
            <div
                className="pointer-events-none absolute"
                style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="absolute -left-6 left-auto w-12 h-px bg-indigo-300/30" />
                <div className="absolute -top-6 top-auto h-12 w-px bg-indigo-300/30" />
            </div>

            {/* Ghost trail rings */}
            {!prefersReduced && ghostsRef.current.map((g, i) => {
                const age = Math.min(1, (performance.now() - g.t) / 600);
                const size = (90 + (load / 100) * 40) * (1 - age * 0.3);
                const opacity = 0.3 * (1 - age);
                return (
                    <div
                        key={`ghost-${g.t}-${i}`}
                        className="pointer-events-none absolute rounded-full border border-indigo-400/40"
                        style={{ left: `${g.x * 100}%`, top: `${g.y * 100}%`, transform: 'translate(-50%, -50%)', width: `${size}px`, height: `${size}px`, opacity }}
                    />
                );
            })}

            {/* Click/Tap ripples */}
            {!prefersReduced && ripplesRef.current.map((r, idx) => {
                const life = (performance.now() - r.t) / 900; // 0..1
                const opacity = Math.max(0, 0.4 * (1 - life));
                const scale = 0.6 + life * 1.5;
                return (
                    <div
                        key={`ripple-${r.t}-${idx}`}
                        className="pointer-events-none absolute rounded-full border-2 border-indigo-400/50"
                        style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, transform: `translate(-50%, -50%) scale(${scale})`, width: '120px', height: '120px', opacity }}
                    />
                );
            })}

            {/* Hover/focus ring */}
            <div
                className="pointer-events-none absolute rounded-full border border-indigo-400/60 shadow-[0_0_30px_rgba(99,102,241,0.35)]"
                style={ringStyle}
            >
                <div className="absolute inset-2 rounded-full border border-indigo-300/30"></div>
            </div>

            {/* Neural Sync (top-left) */}
            <div className="absolute top-5 left-5 select-none">
                <div className="h-2 bg-indigo-500/30 rounded-full w-64 overflow-hidden">
                    <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${sync}%`, transition: prefersReduced ? 'none' : 'width 200ms linear' }}
                    />
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full bg-indigo-400 ${prefersReduced ? '' : 'animate-pulse'}`} />
                    <p className="text-xs text-indigo-300">NEURAL SYNC: {Math.round(sync)}%</p>
                </div>
                {/* Load sparkline */}
                <div className="mt-3 h-8 w-64 bg-black/30 rounded-sm border border-indigo-500/20 overflow-hidden flex items-end gap-[1px] p-1">
                    {(() => {
                        const hist = loadHistoryRef.current;
                        if (!hist.length) return null;
                        const min = Math.min(...hist);
                        const max = Math.max(...hist);
                        const rng = Math.max(1, max - min);
                        return hist.map((v, i) => {
                            const h = 4 + ((v - min) / rng) * 24; // 4..28px
                            return <div key={i} className="flex-1 bg-indigo-400/50" style={{ height: `${h}px` }} />;
                        });
                    })()}
                </div>
            </div>

            {/* Cognitive Load (bottom-right) */}
            <div className="absolute bottom-5 right-5 select-none text-right">
                <p className="text-xs text-indigo-300">COGNITIVE LOAD</p>
                <p className="text-2xl font-bold text-white">{Math.round(load)}%</p>
                <div className="h-2 bg-indigo-500/30 rounded-full w-64 overflow-hidden">
                    <div
                        className="h-full bg-indigo-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, load))}%`, transition: prefersReduced ? 'none' : 'width 120ms ease' }}
                    />
                </div>
                <p className="mt-1 text-[10px] text-indigo-300/70">Local simulation • No network</p>
            </div>

            {/* Exit */}
            <div className="absolute top-4 right-4">
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-sm rounded-full bg-black/60 text-gray-200 hover:bg-indigo-600 transition-colors"
                    aria-label="Exit Neural HUD demo"
                >
                    Exit Demo
                </button>
            </div>
        </div>
    );
};

// The Main Hero section
const Hero = () => (
    <section className="min-h-screen flex flex-col justify-center items-center text-center relative z-10">
        <div className="absolute inset-0 overflow-hidden z-[-1]">
            <video 
                className="absolute min-w-full min-h-full object-cover opacity-70" 
                autoPlay 
                muted 
                loop 
                playsInline
                poster="/images/mindshift-poster.jpg"
            >
                <source src="/hero-loop.mp4" type="video/mp4" />
                {/* Fallback image for browsers that don't support video */}
                <img src="/images/mindshift-poster.jpg" alt="MindShift Background" className="min-w-full min-h-full object-cover" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-gray-900"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-6xl sm:text-8xl font-bold text-white mb-6 animate-fade-in-up leading-tight tracking-tighter">
                Think <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">Different</span><span className="text-indigo-400">ly</span>
            </h2>
            
            <div className="mt-8 flex flex-col max-w-3xl mx-auto">
                <p className="text-2xl sm:text-3xl font-light text-gray-200 mb-5 animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
                    Not another productivity app.
                </p>
                <p className="text-xl sm:text-2xl text-gray-300 mb-10 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    A <span className="text-indigo-400 font-medium">philosophy</span> for the digital age.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <button onClick={() => window.location.href='/signup'} className="btn-primary px-10 py-4 text-xl font-medium">Experience MindShift</button>
            </div>
            
            <div className="mt-16 animate-bounce">
                <svg className="w-10 h-10 text-gray-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
            
            <div className="mt-16 grid grid-cols-3 gap-x-4 gap-y-1 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
                <div className="text-center">
                    <p className="text-4xl sm:text-5xl font-bold text-indigo-400">78%</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Reduced Digital Anxiety</p>
                </div>
                <div className="text-center">
                    <p className="text-4xl sm:text-5xl font-bold text-indigo-400">3.4x</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Improved Focus Duration</p>
                </div>
                <div className="text-center">
                    <p className="text-4xl sm:text-5xl font-bold text-indigo-400">91%</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">User Retention</p>
                </div>
            </div>
        </div>
    </section>
);

// The Video Modal
const CoreVideoModal = ({ isOpen, onClose }) => {
    const videoRef = useRef(null);
    
    // Handle video playing/pausing on modal open/close
    useEffect(() => {
        if (isOpen && videoRef.current) {
            videoRef.current.play().catch(() => {});
        }
    }, [isOpen]);
    
    if (!isOpen) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-gradient-to-br from-indigo-900/30 to-black/95 backdrop-blur-sm flex items-center justify-center z-50" 
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-5xl p-4 animate-scale-in" 
                style={{ animationDuration: '0.4s' }}
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute -top-14 -right-14 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-xl hover:bg-indigo-600 transition-colors"
                    aria-label="Close video"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <div className="relative rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.3)] border border-indigo-500/30">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-transparent to-indigo-500/20 pointer-events-none"></div>
                    <video 
                        ref={videoRef}
                        className="w-full aspect-video object-cover" 
                        controls 
                        autoPlay
                        poster="/images/mindshift-poster.jpg"
                    >
                        <source src="/videos/mindshift-concept.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-medium text-white">MindShift Concept</h3>
                        <p className="text-gray-400 text-sm">A journey from digital chaos to mindful productivity</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="p-2 rounded-full bg-black/30 hover:bg-indigo-600/70 text-gray-300 hover:text-white transition-colors backdrop-blur-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-full bg-black/30 hover:bg-indigo-600/70 text-gray-300 hover:text-white transition-colors backdrop-blur-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-full bg-black/30 hover:bg-indigo-600/70 text-gray-300 hover:text-white transition-colors backdrop-blur-sm">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- The Main Landing Page Component ---

export default function LandingPage() {
    const navigate = useNavigate();
    const [showCoreVideo, setShowCoreVideo] = useState(false);
    const canvasRef = useRef(null);
    const [hudActive, setHudActive] = useState(false);
    const [hudAnchor, setHudAnchor] = useState(null);
    const hudButtonRef = useRef(null);
    const [hudHint, setHudHint] = useState(false);

    // Event listener for opening the video from different sections
    useEffect(() => {
        const handleOpenVideo = () => setShowCoreVideo(true);
        window.addEventListener('openCoreVideo', handleOpenVideo);
        return () => {
            window.removeEventListener('openCoreVideo', handleOpenVideo);
        };
    }, []);
    
    // --- Canvas Animation Effect ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const words = [
            'overwhelmed', 'burnout', 'focus', 'clarity', 'procrastinating', 
            'momentum', 'mindless scrolling', 'in control', 'anxiety', 'progress'
        ];
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();

        const initParticles = () => {
            particles = words.map(word => ({
                text: word,
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: 0.1 + Math.random() * 0.3,
                isMomentum: ['focus', 'clarity', 'momentum', 'in control', 'progress'].includes(word)
            }));
        };
        initParticles();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y -= p.speed;
                if (p.y < 0) {
                    p.y = canvas.height;
                    p.x = Math.random() * canvas.width;
                }
                ctx.font = '16px Inter, sans-serif';
                ctx.fillStyle = p.isMomentum ? 'rgba(99, 102, 241, 0.8)' : 'rgba(239, 68, 68, 0.6)';
                ctx.fillText(p.text, p.x, p.y);
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('resize', initParticles);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('resize', initParticles);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Show a brief onboarding hint when HUD activates
    useEffect(() => {
        if (!hudActive) return;
        setHudHint(true);
        const t = setTimeout(() => setHudHint(false), 4000);
        return () => clearTimeout(t);
    }, [hudActive]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 overflow-x-hidden landing-font">
            <BackgroundAudio src="/audio/ambient-mindshift.mp3" />
            <style>{`
                .landing-font { font-family: 'Inter', sans-serif; }
                .btn-primary { background-color: #6366f1; color: white; border-radius: 9999px; transition: all 0.3s ease; }
                .btn-primary:hover { background-color: #4f46e5; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4); }
                .btn-secondary { background-color: transparent; color: white; border: 1px solid #4f46e5; border-radius: 9999px; transition: all 0.3s ease; }
                .btn-secondary:hover { background-color: #4f46e5; }
                .module-btn { background-color: transparent; color: #6366f1; border: 1px solid #6366f1; padding: 8px 16px; border-radius: 4px; font-family: 'Roboto Mono', monospace; transition: all 0.2s; }
                .module-btn:hover { background-color: #6366f1; color: white; }
                .feature-card { background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 2rem; }
                .color-scheme-toggle { width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(5px); transition: all 0.2s ease; }
                .color-scheme-toggle:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); }
                .theme-toggle { width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.3); backdrop-filter: blur(5px); transition: all 0.2s ease; }
                .theme-toggle:hover { transform: scale(1.05); box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
                @keyframes typing { from { width: 0; } to { width: 100%; } }
                .animate-typing { overflow: hidden; white-space: nowrap; animation: typing 1s steps(40, end); }
                @keyframes blink { 50% { border-color: transparent; } }
                .animate-blink { border-right: 0.15em solid #a7f3d0; animation: blink 0.75s step-end infinite; }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(10px); } }
                .animate-bounce { animation: bounce 2s infinite ease-in-out; }
                @keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                
                /* Custom slider for audio volume control */
                input[type="range"] {
                  -webkit-appearance: none;
                  appearance: none;
                  height: 6px;
                  background: rgba(99, 102, 241, 0.2);
                  border-radius: 6px;
                  outline: none;
                }
                
                input[type="range"]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  background: #6366F1;
                  border-radius: 50%;
                  cursor: pointer;
                  transition: all 0.2s ease;
                }
                
                input[type="range"]::-webkit-slider-thumb:hover {
                  background: #4F46E5;
                  transform: scale(1.1);
                  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
                }
                
                input[type="range"]::-moz-range-thumb {
                  width: 16px;
                  height: 16px;
                  background: #6366F1;
                  border-radius: 50%;
                  cursor: pointer;
                  border: none;
                  transition: all 0.2s ease;
                }
                
                input[type="range"]::-moz-range-thumb:hover {
                  background: #4F46E5;
                  transform: scale(1.1);
                }
            `}</style>

            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20"
            />
            
            {/* Main content */}
            <div className="transition-opacity duration-700 opacity-100">
                 <nav className="fixed top-0 left-0 right-0 z-20 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">🧠</div>
                            <h1 className="text-2xl font-bold text-white">MindShift</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <ColorSchemeSelector />
                            <button onClick={() => navigate('/login')} className="btn-primary px-6 py-2">Sign In</button>
                        </div>
                    </div>
                </nav>
                <Hero />
                <section id="philosophy" className="py-32 px-6 relative z-10 overflow-hidden">
                    <div className="absolute inset-0 z-[-1]">
                        <div className="absolute inset-0 bg-black"></div>
                        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.8) 0%, transparent 30%), radial-gradient(circle at 70% 60%, rgba(192, 132, 252, 0.8) 0%, transparent 30%)' }}></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-24 text-center relative">
                            <div className="absolute w-px h-24 bg-gradient-to-b from-transparent via-indigo-500 to-transparent left-1/2 -top-32 transform -translate-x-1/2"></div>
                            <h2 className="text-5xl sm:text-7xl font-bold mb-10 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">The Philosophy</span>
                            </h2>
                            <p className="text-2xl sm:text-3xl font-light text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Digital tools should <span className="text-indigo-400">serve</span> your mind, not <span className="text-pink-400">consume</span> it.
                            </p>
                        </div>
                        
                        {/* Philosophy Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                            <div className="group">
                                <div className="aspect-square relative overflow-hidden rounded-xl mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 group-hover:scale-105 transition-transform duration-700"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                                        <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold mb-3 text-white tracking-tight">Intention Over Attention</h3>
                                <p className="text-gray-400 text-lg">Your attention is finite. MindShift helps you direct it with purpose, not surrender it to algorithms.</p>
                            </div>
                            
                            <div className="group">
                                <div className="aspect-square relative overflow-hidden rounded-xl mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900 group-hover:scale-105 transition-transform duration-700"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                                        <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold mb-3 text-white tracking-tight">Quality Over Quantity</h3>
                                <p className="text-gray-400 text-lg">We celebrate depth over breadth, meaningful progress over endless consumption.</p>
                            </div>
                            
                            <div className="group">
                                <div className="aspect-square relative overflow-hidden rounded-xl mb-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-900 to-indigo-900 group-hover:scale-105 transition-transform duration-700"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                                        <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold mb-3 text-white tracking-tight">Mindful Momentum</h3>
                                <p className="text-gray-400 text-lg">Sustainable progress doesn't come from burnout, but from aligned rhythms of action and renewal.</p>
                            </div>
                        </div>
                        
                        {/* The Core Video Section */}
                        <div className="relative max-w-5xl mx-auto">
                            <div 
                                className="aspect-video relative overflow-hidden rounded-2xl group cursor-pointer" 
                                onClick={() => window.dispatchEvent(new CustomEvent('openCoreVideo'))}
                            >
                                <img src="/images/mindshift-poster.jpg" alt="MindShift Concept" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-indigo-600/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-white text-2xl font-medium mt-4">Watch The MindShift Concept</h3>
                                    <p className="text-gray-300 mt-2">See how we're reimagining digital wellbeing (1:45)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Features Section */}
                <section id="features" className="py-32 px-6 relative z-10 bg-gradient-to-b from-black to-indigo-950/30">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24">
                            <p className="text-indigo-400 font-medium text-lg mb-3">CAPABILITIES</p>
                            <h2 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight text-white">
                                Not just <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">features</span>.
                                <br/>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">Superpowers</span>.
                            </h2>
                        </div>
                        
                        {/* Main Features in a visually striking way */}
                        <div className="space-y-40">
                            {/* Feature 1 */}
                            <div className="relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                                    <div className="order-2 md:order-1">
                                        <div className="space-y-6">
                                            <div className="inline-block py-2 px-4 rounded-full bg-indigo-900/50 text-indigo-300 text-sm font-medium">
                                                Neural Focus Engine
                                            </div>
                                            <h3 className="text-4xl font-bold text-white">Focus Calibration</h3>
                                            <p className="text-xl text-gray-300">
                                                Our proprietary algorithm helps you identify what truly matters and filters out the noise that drains your cognitive resources.
                                            </p>
                                            <ul className="space-y-3">
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Reduces digital overwhelm by 78%
                                                </li>
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Adaptive priority system that evolves with you
                                                </li>
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Neural calibration based on performance data
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="order-1 md:order-2">
                                        <div className="relative">
                                            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 blur-xl"></div>
                                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 to-indigo-700 p-1">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-3/4 h-3/4 rounded-full border-8 border-indigo-300/20 flex items-center justify-center">
                                                        <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-300 animate-pulse"></div>
                                                    </div>
                                                    <div className="absolute w-full h-full flex items-center justify-center">
                                                        <svg className="w-1/2 h-1/2 text-white/10" fill="currentColor" viewBox="0 0 640 512">
                                                            <path d="M488 191.1h-152l.0001 51.86c.0001 37.66-27.08 72-64.55 76.06L96 334.2V143.1l-96 123.5V432H384v-160l104-104zM0 128l96-128 224 288V128h64c17.67 0 32 14.33 32 32v64h64l64-64v224l-64-64v-64h-16c-17.67 0-32-14.33-32-32V192h-36l-64 64v192h-96l-128-128v-192z"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Feature 2 */}
                            <div className="relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                                    <div>
                                        <div className="relative">
                                            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 opacity-30 blur-xl"></div>
                                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 to-purple-700 flex items-center justify-center p-8">
                                                <div className="grid grid-cols-3 gap-2 w-full h-full">
                                                    {[...Array(9)].map((_, i) => (
                                                        <div key={i} className={`rounded-lg ${i % 3 === 0 ? 'bg-purple-600/60' : i % 2 === 0 ? 'bg-pink-600/40' : 'bg-indigo-600/30'} ${i === 4 ? 'animate-pulse' : ''}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="space-y-6">
                                            <div className="inline-block py-2 px-4 rounded-full bg-purple-900/50 text-purple-300 text-sm font-medium">
                                                Momentum Architecture
                                            </div>
                                            <h3 className="text-4xl font-bold text-white">Momentum Building</h3>
                                            <p className="text-xl text-gray-300">
                                                Track micro-achievements to generate sustainable positive feedback loops that compound over time.
                                            </p>
                                            <ul className="space-y-3">
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Visual heat mapping of productivity trends
                                                </li>
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Neurologically-optimized reward cycles
                                                </li>
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Calibrated achievement thresholds
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Feature 3 */}
                            <div className="relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                                    <div className="order-2 md:order-1">
                                        <div className="space-y-6">
                                            <div className="inline-block py-2 px-4 rounded-full bg-pink-900/50 text-pink-300 text-sm font-medium">
                                                Neural Network Intelligence
                                            </div>
                                            <h3 className="text-4xl font-bold text-white">Adaptive Insights</h3>
                                            <p className="text-xl text-gray-300">
                                                AI-powered pattern recognition identifies your optimal cognitive states and helps you replicate them.
                                            </p>
                                            <ul className="space-y-3">
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-pink-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Personalized cognitive pattern analysis
                                                </li>
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-pink-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Neural feedback integration
                                                </li>
                                                <li className="flex items-center text-gray-300">
                                                    <svg className="w-5 h-5 text-pink-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Predictive optimization suggestions
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="order-1 md:order-2">
                                        <div className="relative">
                                            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-pink-500 to-red-600 opacity-30 blur-xl"></div>
                                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-900 to-pink-700 p-8 flex items-center justify-center">
                                                <svg className="w-full h-full text-white/10" viewBox="0 0 200 200">
                                                    <defs>
                                                        <radialGradient id="a" cx="100" cy="100" r="100" gradientUnits="userSpaceOnUse">
                                                            <stop offset="0" stopColor="#fd5" />
                                                            <stop offset="1" stopColor="#ff543e" />
                                                        </radialGradient>
                                                    </defs>
                                                    
                                                    {[...Array(20)].map((_, i) => {
                                                        const r = Math.random() * 90 + 10;
                                                        const cx = Math.random() * 180 + 10;
                                                        const cy = Math.random() * 180 + 10;
                                                        return (
                                                            <circle key={i} cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.3)" />
                                                        );
                                                    })}
                                                    
                                                    {[...Array(10)].map((_, i) => {
                                                        const x1 = Math.random() * 180 + 10;
                                                        const y1 = Math.random() * 180 + 10;
                                                        const x2 = Math.random() * 180 + 10;
                                                        const y2 = Math.random() * 180 + 10;
                                                        return (
                                                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.2)" />
                                                        );
                                                    })}
                                                    
                                                    <circle cx="100" cy="100" r="10" fill="rgba(255,255,255,0.8)" className="animate-pulse" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Immersive Experience Section */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/images/neural-network-bg.jpg" 
                            alt="Neural Network Background"
                            className="w-full h-full object-cover opacity-30" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-black/80 to-black"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto relative z-10 px-6">
                        <div className="text-center mb-24">
                            <p className="text-indigo-400 font-medium text-lg mb-3">THE EXPERIENCE</p>
                            <h2 className="text-5xl sm:text-6xl font-bold mb-8 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white">Immersive. Intuitive. Transformative.</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Every element of MindShift is designed to create a seamless extension of your cognitive process.
                            </p>
                        </div>
                        
                        {/* Interactive Feature Showcase */}
                        <div className="relative aspect-[16/9] mx-auto mb-32 max-w-5xl">
                            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-indigo-500/30" data-hud-card>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-sm">
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
                                        <div className="text-center max-w-2xl">
                                            <p className="text-indigo-300 mb-2 tracking-wide">Interactive Demo</p>
                                            <h3 className="text-3xl font-bold text-white mb-3">NeuroHUD Interface</h3>
                                            {!hudActive && (
                                                <>
                                                    <p id="hud-intro" className="text-sm sm:text-base text-indigo-200/90 mb-4">
                                                        A heads-up overlay that makes your focus visible. Move your cursor to see Cognitive Load react, while Neural Sync flows in real time. No data leaves your device.
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 justify-center text-xs text-indigo-200/90 mb-4">
                                                        <span className="px-2 py-1 rounded-full bg-indigo-800/40 border border-indigo-500/30">Focus Ring follows cursor</span>
                                                        <span className="px-2 py-1 rounded-full bg-indigo-800/40 border border-indigo-500/30">Neural Sync animates</span>
                                                        <span className="px-2 py-1 rounded-full bg-indigo-800/40 border border-indigo-500/30">Cognitive Load reacts to speed</span>
                                                        <span className="px-2 py-1 rounded-full bg-indigo-800/40 border border-indigo-500/30">Privacy-first • No storage</span>
                                                    </div>
                                                    <div className="pointer-events-auto">
                                                        <button
                                                            ref={hudButtonRef}
                                                            onClick={() => {
                                                                // Compute the center of the button as initial anchor
                                                                const btn = hudButtonRef.current;
                                                                const container = btn?.closest('[data-hud-card]');
                                                                const rect = btn?.getBoundingClientRect();
                                                                if (rect) {
                                                                    const clientX = rect.left + rect.width / 2;
                                                                    const clientY = rect.top + rect.height / 2;
                                                                    setHudAnchor({ clientX, clientY });
                                                                } else {
                                                                    setHudAnchor(null);
                                                                }
                                                                setHudActive(true);
                                                            }}
                                                            aria-describedby="hud-intro"
                                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
                                                        >
                                                            Activate Demo
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Dynamic HUD overlay (active) */}
                                <NeuralHUDOverlay active={hudActive} onClose={() => { setHudActive(false); setHudAnchor(null); }} initialAnchor={hudAnchor} />
                                {/* Quick onboarding hint when active */}
                                {hudActive && hudHint && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                                        <div className="px-4 py-2 rounded-full bg-black/60 text-indigo-100 text-xs sm:text-sm shadow-[0_0_20px_rgba(99,102,241,0.25)] border border-indigo-500/30">
                                            Move your cursor to explore • Press Esc or use “Exit Demo” to close
                                        </div>
                                    </div>
                                )}
                                {/* Static HUD placeholders (inactive) */}
                                {!hudActive && (
                                    <>
                                        <div className="absolute top-0 left-0 w-64 h-20 m-8">
                                            <div className="h-2 bg-indigo-500/50 rounded-full mb-2 overflow-hidden">
                                                <div className="h-full bg-indigo-400 w-3/4 rounded-full"></div>
                                            </div>
                                            <div className="flex space-x-2 items-center">
                                                <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse"></div>
                                                <p className="text-xs text-indigo-300">NEURAL SYNC: ACTIVE</p>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-64 h-20 m-8 flex flex-col items-end">
                                            <div className="text-right mb-2">
                                                <p className="text-xs text-indigo-300">COGNITIVE LOAD</p>
                                                <p className="text-2xl font-bold text-white">32%</p>
                                            </div>
                                            <div className="h-2 bg-indigo-500/50 rounded-full w-full overflow-hidden">
                                                <div className="h-full bg-indigo-400 w-1/3 rounded-full"></div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* Stats Section */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
                            <div className="p-8 rounded-xl bg-gradient-to-br from-indigo-900/50 to-transparent backdrop-blur-sm border border-indigo-500/20 text-center">
                                <p className="text-5xl font-bold text-white mb-2">4.3x</p>
                                <p className="text-gray-400">Increase in Deep Focus Time</p>
                            </div>
                            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-900/50 to-transparent backdrop-blur-sm border border-purple-500/20 text-center">
                                <p className="text-5xl font-bold text-white mb-2">87%</p>
                                <p className="text-gray-400">Users Report Improved Well-being</p>
                            </div>
                            <div className="p-8 rounded-xl bg-gradient-to-br from-pink-900/50 to-transparent backdrop-blur-sm border border-pink-500/20 text-center">
                                <p className="text-5xl font-bold text-white mb-2">2.7hr</p>
                                <p className="text-gray-400">Daily Screen Time Reclaimed</p>
                            </div>
                            <div className="p-8 rounded-xl bg-gradient-to-br from-indigo-900/50 to-transparent backdrop-blur-sm border border-indigo-500/20 text-center">
                                <p className="text-5xl font-bold text-white mb-2">94%</p>
                                <p className="text-gray-400">User Retention After 30 Days</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="py-32 px-6 relative z-10 overflow-hidden bg-black">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto relative">
                        <div className="flex justify-center mb-16">
                            <div className="w-px h-12 bg-gradient-to-b from-transparent via-indigo-500 to-transparent"></div>
                        </div>
                        
                        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-20 tracking-tight text-white">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">Voices of Transformation</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-xl bg-gradient-to-br from-indigo-900/30 to-transparent backdrop-blur-sm border border-indigo-500/20 transition-all duration-500 hover:border-indigo-400 hover:bg-indigo-900/40">
                                <div className="flex flex-col h-full">
                                    <div className="mb-6">
                                        <div className="flex mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-gray-300 italic mb-6 text-lg">"MindShift recalibrated my relationship with technology. The Focus Engine alone saved me from countless hours of digital wandering. It's like having a cognitive compass."</p>
                                    </div>
                                    <div className="mt-auto flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 font-bold text-xl mr-4">AC</div>
                                        <div>
                                            <p className="text-white font-medium">Alex Chen</p>
                                            <p className="text-indigo-400 text-sm">Product Designer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-900/30 to-transparent backdrop-blur-sm border border-purple-500/20 transition-all duration-500 hover:border-purple-400 hover:bg-purple-900/40">
                                <div className="flex flex-col h-full">
                                    <div className="mb-6">
                                        <div className="flex mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-gray-300 italic mb-6 text-lg">"The Momentum Architecture was revelatory for me. I'd never realized how fragmented my attention was until MindShift showed me a different way. Now I'm accomplishing more with less burnout."</p>
                                    </div>
                                    <div className="mt-auto flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 font-bold text-xl mr-4">SJ</div>
                                        <div>
                                            <p className="text-white font-medium">Sarah Johnson</p>
                                            <p className="text-purple-400 text-sm">Entrepreneur</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8 rounded-xl bg-gradient-to-br from-pink-900/30 to-transparent backdrop-blur-sm border border-pink-500/20 transition-all duration-500 hover:border-pink-400 hover:bg-pink-900/40">
                                <div className="flex flex-col h-full">
                                    <div className="mb-6">
                                        <div className="flex mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-gray-300 italic mb-6 text-lg">"As a creative professional, the neural insights helped me understand my optimal focus times. The app feels like it's reading my mind—suggesting breaks exactly when I need them. A true game-changer."</p>
                                    </div>
                                    <div className="mt-auto flex items-center">
                                        <div className="w-12 h-12 rounded-full bg-pink-600/30 flex items-center justify-center text-pink-300 font-bold text-xl mr-4">MK</div>
                                        <div>
                                            <p className="text-white font-medium">Michael Kim</p>
                                            <p className="text-pink-400 text-sm">Creative Director</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* CTA Section */}
                <section className="py-32 px-6 relative z-10 bg-gradient-to-b from-black to-indigo-950/40 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 opacity-30">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <radialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                        <stop offset="0%" stopColor="rgba(99, 102, 241, 0.4)" />
                                        <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
                                    </radialGradient>
                                </defs>
                                <circle cx="50" cy="50" r="50" fill="url(#grad)" />
                            </svg>
                        </div>
                    </div>
                    
                    <div className="max-w-5xl mx-auto text-center relative">
                        <div className="mb-12">
                            <div className="inline-block py-3 px-6 rounded-full bg-indigo-900/50 text-indigo-300 text-base font-medium mb-6">
                                Limited Early Access Available
                            </div>
                        </div>
                        
                        <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-white tracking-tight leading-tight">
                            It's time to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">reclaim</span> your digital mind.
                        </h2>
                        
                        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                            Join the growing community of people who have discovered what it means to live with digital intention rather than digital distraction.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button onClick={() => window.location.href='/signup'} className="btn-primary px-12 py-5 text-xl font-medium relative group overflow-hidden">
                                <span className="relative z-10">Begin Your Journey</span>
                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            </button>
                            
                            <button 
                                onClick={() => window.dispatchEvent(new CustomEvent('openCoreVideo'))}
                                className="btn-secondary px-12 py-5 text-xl font-medium"
                            >
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Watch Concept Video
                                </div>
                            </button>
                        </div>
                        
                        <div className="mt-16 flex items-center justify-center text-gray-400">
                            <p className="flex items-center text-sm">
                                <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Privacy First, Always. Your data never leaves your device.
                            </p>
                        </div>
                    </div>
                </section>
                
                <footer className="py-24 px-6 relative z-10 bg-black overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-black"></div>
                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
                            <div className="col-span-2">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 mr-3 rounded-full bg-indigo-600/30 flex items-center justify-center">
                                        <img
                                            src="/logo.svg"
                                            alt="Logo"
                                            className="w-6 h-6 text-indigo-400"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">MindShift</h3>
                                </div>
                                <p className="text-gray-400 mb-6">
                                    Reshaping the relationship between humans and digital technology through mindful design and cognitive science.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                        </svg>
                                    </a>
                                    <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </a>
                                    <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-5 tracking-wide">Product</h4>
                                <ul className="space-y-4">
                                    <li><a href="#features" className="text-gray-400 hover:text-indigo-400 transition-colors">Features</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Pricing</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Integrations</a></li>
                                    <li><Link to="/faq" className="text-gray-400 hover:text-indigo-400 transition-colors">FAQ</Link></li>
                                </ul>
                            </div>
                            
                <div>
                                <h4 className="text-lg font-semibold text-white mb-5 tracking-wide">Company</h4>
                                <ul className="space-y-4">
                                    <li><Link to="/about" className="text-gray-400 hover:text-indigo-400 transition-colors">About</Link></li>
                                    <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Blog</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Careers</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Press</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-5 tracking-wide">Legal</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Privacy</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Terms</a></li>
                                    <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Security</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-4 md:mb-0">
                                <p className="text-gray-500">© 2025 MindShift. All rights reserved.</p>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <p className="text-green-500 text-sm">All systems operational</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Core Video Modal can still be triggered from other parts of the app */}
            <CoreVideoModal isOpen={showCoreVideo} onClose={() => setShowCoreVideo(false)} />
        </div>
    );
}