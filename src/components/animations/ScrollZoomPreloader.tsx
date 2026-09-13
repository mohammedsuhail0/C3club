import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface ScrollZoomPreloaderProps {
  onComplete?: () => void;
}

export const ScrollZoomPreloader: React.FC<ScrollZoomPreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const animFrameId = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDoneRef = useRef(false);

  useEffect(() => {
    // Ensure we start at top of page on reload/refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Lock page scroll while preloader is active
    document.body.style.overflow = 'hidden';

    // Cleanup helper to fully release event listeners and body scroll
    const cleanupListeners = () => {
      if (isDoneRef.current) return;
      isDoneRef.current = true;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    // 60FPS Lerp loop for buttery-smooth physical scroll scrub
    const loop = () => {
      if (isDoneRef.current) return;

      // 0.12 lerp factor gives tactile weight and smooth responsive tracking
      currentProgress.current += (targetProgress.current - currentProgress.current) * 0.12;
      setProgress(currentProgress.current);

      // Once progress reaches 0.82, the split doors and C3 are already past viewport edges
      // Immediately finish and unmount cleanly!
      if (currentProgress.current >= 0.82) {
        setProgress(1);
        cleanupListeners();
        setIsDone(true);
        if (onComplete) onComplete();
        return;
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    // Wheel event: Authentic, tactile scroll scrub
    const handleWheel = (e: WheelEvent) => {
      if (isDoneRef.current) return;

      // If user has scrolled through the preloader (past 0.80), unlock native page scroll immediately!
      if (targetProgress.current >= 0.80) {
        cleanupListeners();
        setIsDone(true);
        if (onComplete) onComplete();
        return; // Do NOT preventDefault! Let native page scroll work smoothly!
      }

      e.preventDefault();
      // Sensitivity: ~360px of scroll delta to complete (feels like a genuine, natural wheel scroll)
      const delta = e.deltaY / 360;
      const next = Math.min(Math.max(targetProgress.current + delta, 0), 1.05);

      // If user scrolls past 70%, gently assist with momentum to carry past the screen edges
      if (next >= 0.70) {
        targetProgress.current = 1.05;
      } else {
        targetProgress.current = next;
      }
    };

    // Touch events for mobile (natural drag scrub)
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDoneRef.current) return;
      if (targetProgress.current >= 0.85) {
        cleanupListeners();
        setIsDone(true);
        if (onComplete) onComplete();
        return;
      }
      if (touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const delta = (touchStartY.current - currentY) / 260;
      touchStartY.current = currentY;
      const next = Math.min(Math.max(targetProgress.current + delta, 0), 1.05);
      if (next >= 0.65) {
        targetProgress.current = 1.05;
      } else {
        targetProgress.current = next;
      }
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    // Keyboard support (Down arrow / Spacebar / PageDown)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDoneRef.current) return;
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        targetProgress.current = Math.min(targetProgress.current + 0.35, 1.05);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (targetProgress.current < 0.85) {
          e.preventDefault();
          targetProgress.current = Math.max(targetProgress.current - 0.35, 0);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        targetProgress.current = 1.05;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanupListeners();
    };
  }, [onComplete]);

  if (isDone) {
    return null;
  }

  // Smooth transform values computed from physical scrub progress (0 -> 1)
  const clamped = Math.min(Math.max(progress, 0), 1);
  const xLeft = -(clamped * 75);       // 0vw -> -75vw (smooth split to left)
  const xRight = clamped * 75;         // 0vw -> +75vw (smooth split to right)
  const scale = 1 + clamped * 2.5;     // Natural, elegant scale
  const emblemOpacity = Math.max(0, 1 - clamped * 1.3);
  const bgOpacity = Math.max(0, 1 - clamped * 2.8);
  const glowOpacity = Math.max(0, 1 - clamped * 3);
  const hintOpacity = Math.max(0, 1 - clamped * 8);

  return (
    <div
      style={{
        pointerEvents: clamped > 0.8 ? 'none' : 'auto',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
    >
      {/* 
        Seamless Full-Screen Backdrop:
        Clean, uniform background that fades out smoothly as you scroll.
        Zero vertical curtain bars or split panels.
      */}
      <div
        style={{
          opacity: bgOpacity,
        }}
        className="absolute inset-0 bg-claude-bg dark:bg-claude-darkBg pointer-events-none transition-opacity duration-75"
      />

      {/* Warm Terracotta Ambient Glow behind C3 */}
      <div
        style={{
          opacity: glowOpacity,
          transform: `scale(${1 + clamped * 1.2})`,
        }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-claude-terracotta/25 dark:bg-claude-terracotta/35 blur-[140px] -z-10 will-change-transform"
      />

      {/* The Official C3 Monogram Logo Split Assembly */}
      <div className="relative z-30 flex items-center justify-center select-none pointer-events-none will-change-transform">
        <div className="relative w-[260px] xs:w-[320px] sm:w-[420px] md:w-[480px] aspect-[551/388] flex items-center justify-center drop-shadow-2xl">
          {/* Left C Half (Glides smoothly to the LEFT with the left door) */}
          <div
            style={{
              transform: `translateX(${xLeft}vw) scale(${scale})`,
              opacity: emblemOpacity,
            }}
            className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
          >
            <img
              src="/assets/c3_logo_c.png"
              alt="C3 Monogram - C"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(204,90,54,0.35)]"
            />
          </div>

          {/* Right 3 Half (Glides smoothly to the RIGHT with the right door) */}
          <div
            style={{
              transform: `translateX(${xRight}vw) scale(${scale})`,
              opacity: emblemOpacity,
            }}
            className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
          >
            <img
              src="/assets/c3_logo_3.png"
              alt="C3 Monogram - 3"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(204,90,54,0.35)]"
            />
          </div>
        </div>
      </div>

      {/* Scroll Instruction Simple Text (Zero Pills) */}
      <div
        style={{
          opacity: hintOpacity,
          transform: `translateY(${clamped * 20}px)`,
        }}
        className="absolute bottom-8 sm:bottom-10 z-40 flex items-center justify-center text-center select-none pointer-events-none px-4"
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-claude-text dark:text-claude-darkText font-semibold">
          <span>Scroll to explore C3</span>
          <ChevronDown className="w-4 h-4 text-claude-terracotta animate-bounce" />
        </div>
      </div>
    </div>
  );
};
