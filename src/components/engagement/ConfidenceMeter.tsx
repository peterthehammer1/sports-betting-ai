'use client';

import { useEffect, useState } from 'react';

interface ConfidenceMeterProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

export function ConfidenceMeter({ 
  confidence, 
  size = 'md', 
  showLabel = true,
  animated = true 
}: ConfidenceMeterProps) {
  const [displayedConfidence, setDisplayedConfidence] = useState(animated ? 0 : confidence);

  useEffect(() => {
    if (!animated) {
      setDisplayedConfidence(confidence);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
    const increment = confidence / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= confidence) {
        setDisplayedConfidence(confidence);
        clearInterval(timer);
      } else {
        setDisplayedConfidence(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [confidence, animated]);

  const getColor = (value: number) => {
    if (value >= 70) return { fill: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.2)', text: 'text-green-400', label: 'HIGH VALUE' };
    if (value >= 55) return { fill: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.2)', text: 'text-blue-400', label: 'GOOD VALUE' };
    if (value >= 45) return { fill: 'rgb(234, 179, 8)', bg: 'rgba(234, 179, 8, 0.2)', text: 'text-yellow-400', label: 'MODERATE' };
    return { fill: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.2)', text: 'text-red-400', label: 'LOW VALUE' };
  };

  const colors = getColor(confidence);
  
  const sizes = {
    sm: { width: 80, height: 8, text: 'text-xs' },
    md: { width: 120, height: 10, text: 'text-sm' },
    lg: { width: 160, height: 12, text: 'text-base' },
  };

  const { width, height, text } = sizes[size];

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
            {colors.label}
          </span>
          <span className={`${text} font-bold tabular-nums ${colors.text}`}>
            {displayedConfidence}%
          </span>
        </div>
      )}
      
      {/* Bar */}
      <div 
        className="relative rounded-full overflow-hidden"
        style={{ 
          width, 
          height, 
          backgroundColor: 'rgba(51, 65, 85, 0.5)' 
        }}
      >
        {/* Background glow */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-1000 ease-out"
          style={{ 
            backgroundColor: colors.bg,
            width: `${displayedConfidence}%`
          }}
        />
        
        {/* Filled bar */}
        <div 
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
          style={{ 
            backgroundColor: colors.fill,
            width: `${displayedConfidence}%`,
            boxShadow: `0 0 10px ${colors.fill}40`
          }}
        />
        
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{ width: `${displayedConfidence}%` }}
        >
          <div className="absolute inset-0 shimmer-bar" />
        </div>
      </div>
    </div>
  );
}

// Circular confidence meter variant
export function CircularConfidenceMeter({ 
  confidence, 
  size = 'md',
  showLabel = true,
  animated = true 
}: ConfidenceMeterProps) {
  const [displayedConfidence, setDisplayedConfidence] = useState(animated ? 0 : confidence);

  useEffect(() => {
    if (!animated) {
      setDisplayedConfidence(confidence);
      return;
    }

    const duration = 1500;
    const steps = 45;
    const interval = duration / steps;
    const increment = confidence / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= confidence) {
        setDisplayedConfidence(confidence);
        clearInterval(timer);
      } else {
        setDisplayedConfidence(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [confidence, animated]);

  const getColor = (value: number) => {
    if (value >= 70) return { stroke: '#22c55e', text: 'text-green-400', label: 'HIGH VALUE' };
    if (value >= 55) return { stroke: '#3b82f6', text: 'text-blue-400', label: 'GOOD' };
    if (value >= 45) return { stroke: '#eab308', text: 'text-yellow-400', label: 'MODERATE' };
    return { stroke: '#ef4444', text: 'text-red-400', label: 'LOW' };
  };

  const colors = getColor(confidence);
  
  const sizes = {
    sm: { dimension: 48, strokeWidth: 4, fontSize: 'text-xs' },
    md: { dimension: 72, strokeWidth: 5, fontSize: 'text-lg' },
    lg: { dimension: 96, strokeWidth: 6, fontSize: 'text-2xl' },
  };

  const { dimension, strokeWidth, fontSize } = sizes[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayedConfidence / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg className="transform -rotate-90" width={dimension} height={dimension}>
          {/* Background circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="rgba(51, 65, 85, 0.5)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${colors.stroke}60)`
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${fontSize} font-bold tabular-nums ${colors.text}`}>
            {displayedConfidence}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
          {colors.label}
        </span>
      )}
    </div>
  );
}
