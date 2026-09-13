import React, { useState, useEffect } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export const ZoomHeroPortal: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scrub progress from 0 to 1 over the first 450px of window scroll
  const maxScroll = 450;
  const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

  // If scrolled well past the portal, remove from DOM completely
  if (scrollY > maxScroll + 200) {
    return null;
  }

  // Smooth transforms based on scrub progress
  const scale = 1 + progress * 7.5; // 1x -> 8.5x
  const xLeft = -(progress * 110);   // 0vw -> -110vw
  const xRight = progress * 110;     // 0vw -> +110vw
  const emblemOpacity = Math.max(0, 1 - progress * 1.4);
  const veilOpacity = Math.max(0, 1 - progress * 1.6);
  const hintOpacity = Math.max(0, 1 - progress * 3.5);

  return (
    <div
      style={{
        opacity: veilOpacity,
        pointerEvents: progress > 0.6 ? 'none' : 'auto',
      }}
      className="fixed inset-0 z-30 flex items-center justify-center overflow-hidden bg-claude-bg dark:bg-claude-darkBg transition-opacity duration-75"
    >
      {/* Warm Terracotta Ambient Glow behind C3 */}
      <div
        style={{ opacity: emblemOpacity }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-claude-terracotta/25 dark:bg-claude-terracotta/35 blur-[150px] -z-10"
      />

      {/* The Official C3 Monogram Logo Split Assembly */}
      <div
        style={{
          opacity: emblemOpacity,
          transform: `scale(${scale})`,
        }}
        className="relative z-30 flex items-center justify-center select-none pointer-events-none transition-transform duration-75 will-change-transform"
      >
        {/* Sized container matching original emblem ratio (551 x 388) */}
        <div className="relative w-[300px] sm:w-[420px] md:w-[480px] aspect-[551/388] flex items-center justify-center drop-shadow-2xl">
          {/* Left C Half (Moves Left) */}
          <div
            style={{ transform: `translateX(${xLeft}vw)` }}
            className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
          >
            <img
              src="/assets/c3_logo_c.png"
              alt="C3 Monogram - C"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(204,90,54,0.3)]"
            />
          </div>

          {/* Right 3 Half (Moves Right) */}
          <div
            style={{ transform: `translateX(${xRight}vw)` }}
            className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
          >
            <img
              src="/assets/c3_logo_3.png"
              alt="C3 Monogram - 3"
              className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(204,90,54,0.3)]"
            />
          </div>
        </div>
      </div>

      {/* Scroll Instruction Hint Pill */}
      <div
        style={{
          opacity: hintOpacity,
          transform: `translateY(${progress * 25}px)`,
        }}
        className="absolute bottom-10 z-40 flex flex-col items-center gap-2 pointer-events-none"
      >
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-claude-card/95 dark:bg-claude-darkCard/95 border border-claude-border dark:border-claude-darkBorder shadow-xl backdrop-blur-md text-xs font-mono text-claude-text dark:text-claude-darkText">
          <Sparkles className="w-3.5 h-3.5 text-claude-terracotta animate-pulse" />
          <span className="font-semibold">Scroll down to enter C3</span>
          <ChevronDown className="w-4 h-4 text-claude-terracotta animate-bounce" />
        </div>
        <span className="text-[10px] font-mono text-claude-muted dark:text-claude-darkMuted uppercase tracking-widest">
          Zoom through the C3 Monogram
        </span>
      </div>
    </div>
  );
};
