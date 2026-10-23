'use client';

import React, { useMemo } from 'react';

interface StarfieldProps {
  density?: number;
}

export default function Starfield({ density = 60 }: StarfieldProps) {
  const stars = useMemo(() => {
    // Pure deterministic star generator based on index
    return Array.from({ length: density }, (_, i) => {
      const pseudoX = ((i * 37.13 + 17.5) % 100);
      const pseudoY = ((i * 59.27 + 23.1) % 100);
      const pseudoSize = ((i * 1.3) % 2.5) + 1;
      const pseudoOpacity = ((i * 0.17) % 0.6) + 0.35;
      const pseudoDuration = ((i * 0.7) % 4) + 3;
      const pseudoDelay = (i * 0.4) % 5;

      return {
        id: i,
        x: pseudoX,
        y: pseudoY,
        size: pseudoSize,
        opacity: pseudoOpacity,
        duration: pseudoDuration,
        delay: pseudoDelay,
      };
    });
  }, [density]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Soft atmospheric radial glows */}
      <div className="absolute -top-[20%] left-1/4 w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-[130px]" />
      <div className="absolute top-1/2 -right-[15%] w-[550px] h-[550px] rounded-full bg-purple-600/10 blur-[140px]" />
      <div className="absolute -bottom-[20%] left-1/3 w-[650px] h-[650px] rounded-full bg-indigo-500/10 blur-[150px]" />

      {/* Twinkling romantic stars */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white transition-opacity"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite alternate`,
            boxShadow: star.size > 2 ? '0 0 6px rgba(255, 255, 255, 0.8)' : undefined,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes twinkle {
          0% {
            opacity: 0.15;
            transform: scale(0.85);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.15);
          }
          100% {
            opacity: 0.3;
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
