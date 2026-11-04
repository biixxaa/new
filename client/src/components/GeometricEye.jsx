import React from 'react';

export default function GeometricEye({ size = 120, className = '', glow = true }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={glow ? 'animate-eye-pulse' : ''}
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff1a8" />
            <stop offset="40%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#aa820a" />
            <stop offset="100%" stopColor="#634b03" />
          </linearGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe57f" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#d4af37" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sacred Geometry Rays */}
        <g stroke="url(#goldGradient)" strokeWidth="0.75" opacity="0.45">
          <line x1="100" y1="15" x2="100" y2="185" />
          <line x1="15" y1="100" x2="185" y2="100" />
          <line x1="40" y1="40" x2="160" y2="160" />
          <line x1="160" y1="40" x2="40" y2="160" />
          <circle cx="100" cy="100" r="88" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="76" strokeDasharray="1 4" />
        </g>

        {/* Outer Triangular Pyramid */}
        <polygon
          points="100,24 178,162 22,162"
          fill="#0c0c0f"
          stroke="url(#goldGradient)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner concentric triangle */}
        <polygon
          points="100,48 162,154 38,154"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="1.2"
          opacity="0.6"
        />

        {/* Central Eye Background Glow */}
        <circle cx="100" cy="116" r="32" fill="url(#eyeGlow)" />

        {/* Eye Outline (Sacred almond shape) */}
        <path
          d="M 62 116 Q 100 84 138 116 Q 100 148 62 116 Z"
          fill="#060608"
          stroke="url(#goldGradient)"
          strokeWidth="2.5"
        />

        {/* Iris */}
        <circle cx="100" cy="116" r="14" fill="#131215" stroke="url(#goldGradient)" strokeWidth="1.8" />

        {/* Pupil */}
        <circle cx="100" cy="116" r="6" fill="url(#goldGradient)" />

        {/* Eye light reflection spark */}
        <circle cx="97" cy="113" r="2.2" fill="#ffffff" />

        {/* Pyramid Capstone Ray Accent */}
        <path d="M 94 48 L 100 36 L 106 48" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

