import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DashboardBackground = ({ children }) => {
  const { isDark, colorScheme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const particlesRef = useRef([]);

  // Generate theme-specific colors based on the current color scheme
  const themeColors = useMemo(() => {
    const baseColors = {
      'default': ['rgba(139, 92, 246, 0.15)', 'rgba(34, 211, 238, 0.15)', 'rgba(244, 114, 182, 0.15)'],
      'ocean': ['rgba(14, 165, 233, 0.15)', 'rgba(6, 182, 212, 0.15)', 'rgba(37, 99, 235, 0.15)'],
      'sunset': ['rgba(249, 115, 22, 0.15)', 'rgba(239, 68, 68, 0.15)', 'rgba(236, 72, 153, 0.15)'],
      'forest': ['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.15)', 'rgba(20, 184, 166, 0.15)'],
      'lavender': ['rgba(168, 85, 247, 0.15)', 'rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)'],
    };
    
    return baseColors[colorScheme] || baseColors.default;
  }, [colorScheme]);

  // Generate particles on mount or color scheme change
  useEffect(() => {
    particlesRef.current = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 60,
      color: themeColors[i % themeColors.length],
      speed: Math.random() * 0.05 + 0.02,
      direction: Math.random() * Math.PI * 2,
    }));
  }, [themeColors]);

  // Handle mouse movement
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
    setIsMoving(true);
    
    // Reset moving state after a delay
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsMoving(false);
    }, 2000);
  };

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen dashboard-animated-bg animate-fade-in"
      style={{
        background: isDark 
          ? 'linear-gradient(170deg, rgba(15, 23, 42, 0.95), rgba(3, 7, 18, 0.98))'
          : 'linear-gradient(170deg, rgba(248, 250, 252, 0.95), rgba(226, 232, 240, 0.98))',
        overflow: 'hidden',
        position: 'relative'
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-50"></div>
      
      {/* Animated gradient blobs */}
      {particlesRef.current.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full blur-3xl opacity-30 animate-slow-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            animationDelay: `${particle.id * 0.5}s`,
            animationDuration: `${10 + particle.id * 2}s`,
            transform: `translateY(${Math.sin(Date.now() * 0.001 + particle.id) * 20}px)`
          }}
        />
      ))}
      
      {/* Interactive glow that follows mouse */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl transition-opacity duration-700 pointer-events-none"
        style={{
          left: `calc(${mousePosition.x * 100}% - 300px)`,
          top: `calc(${mousePosition.y * 100}% - 300px)`,
          background: `radial-gradient(circle, ${themeColors[0]} 0%, ${themeColors[1]} 50%, transparent 80%)`,
          opacity: isMoving ? 0.35 : 0.1
        }}
      />
      
      {/* Scrolling parallax effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          backgroundImage: isDark
            ? 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.08) 0%, transparent 80%)'
            : 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.05) 0%, transparent 80%)',
          transform: `translateY(${scrollPosition * 0.1}px) scale(${1 + scrollPosition * 0.0005})`
        }}
      />
      
      {/* Main content with subtle shadow to lift it above background */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default DashboardBackground;