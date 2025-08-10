import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Props: progress (0-1), size (px), strokeWidth (px), color
export default function ProgressRing({ 
  progress = 0,
  size = 64, 
  strokeWidth = 8, 
  color = '#6366F1', 
  children,
  showAnimation = true,
  animationDuration = 1500,
  label,
  glowIntensity = 0.5
}) {
  const { isDark } = useTheme();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const requestRef = useRef();
  const startTimeRef = useRef();
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animatedProgress);
  
  // Create gradient definitions
  const gradientId = `progress-gradient-${Math.random().toString(36).substring(2, 9)}`;
  const glowFilterId = `progress-glow-${Math.random().toString(36).substring(2, 9)}`;
  
  // Animation effect
  useEffect(() => {
    if (!showAnimation) {
      setAnimatedProgress(progress);
      return;
    }
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      
      // Calculate progress based on elapsed time
      const animProgress = Math.min(elapsed / animationDuration, 1);
      setAnimatedProgress(progress * animProgress);
      
      // Continue animation if not finished
      if (animProgress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [progress, showAnimation, animationDuration]);
  
  // Track color based on progress
  const getTrackColor = () => {
    return isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)';
  };
  
  // Format the progress for display
  const formattedProgress = Math.round(animatedProgress * 100);
  
  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
            
            <filter id={glowFilterId}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getTrackColor()}
            strokeWidth={strokeWidth}
          />
          
          {/* Progress track with gradient */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            filter={glowIntensity > 0 ? `url(#${glowFilterId})` : undefined}
            style={{ 
              transition: 'stroke-dashoffset 0.1s ease',
              filter: `drop-shadow(0 0 ${glowIntensity * 6}px ${color}80)`
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-center" style={{ 
            fontSize: size * 0.4,
            fontWeight: 700,
            color,
            lineHeight: 1
          }}>
            {children || `${formattedProgress}%`}
          </div>
        </div>
      </div>
      
      {/* Optional label */}
      {label && (
        <div className="mt-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
          {label}
        </div>
      )}
    </div>
  );
} 