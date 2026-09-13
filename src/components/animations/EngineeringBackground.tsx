import React, { useEffect, useState } from 'react';

export const EngineeringBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* 1. Precision Technical Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.45] dark:opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(204, 90, 54, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(204, 90, 54, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Interactive Flashlight Grid Illuminator: Reveals subtle blueprint lines under cursor */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(204, 90, 54, 0.09), transparent 80%)`,
        }}
      />

      {/* 3. Soft Ambient Vignette to keep content centered & legible */}
      <div 
        className="absolute inset-0 bg-radial from-transparent via-transparent to-claude-bg/90 dark:to-claude-darkBg/90"
      />

      {/* 4. Elegant Architectural Drafting Plus Crosshairs at Top */}
      <div className="absolute top-12 left-12 font-mono text-[10px] text-claude-terracotta/30 select-none">
        + 17.3616° N, 78.4747° E // HYDERABAD
      </div>
      <div className="absolute top-12 right-12 font-mono text-[10px] text-claude-terracotta/30 select-none">
        BATCH 01 // ARCH_REV_2026 +
      </div>
    </div>
  );
};
