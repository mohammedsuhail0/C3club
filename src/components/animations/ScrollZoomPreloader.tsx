import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

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
    // Start at top of page on reload/refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Keep body overflow clean
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

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

    // Physics Lerp loop: Smoothly catches up with weighted damping for a cinematic feel
    const loop = () => {
      if (isDoneRef.current) return;

      // Silky smooth interpolation with reduced speed / increased damping
      currentProgress.current += (targetProgress.current - currentProgress.current) * 0.09;
      setProgress(currentProgress.current);

      // Only finish when user has physically scrolled all the way through (progress >= 0.96 and target == 1)
      if (currentProgress.current >= 0.95 && targetProgress.current >= 0.99) {
        setProgress(1);
        cleanupListeners();
        setIsDone(true);
        if (onComplete) onComplete();
        return;
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    // Wheel event: 100% USER DRIVEN. Reduced zoom speed for deliberate, tactile control.
    const handleWheel = (e: WheelEvent) => {
      if (isDoneRef.current) return;

      e.preventDefault();
      // Reduced sensitivity (~4x slower) + per-event delta clamp so trackpad flicks don't rush through
      const rawDelta = e.deltaY / 1100;
      const delta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 0.065);
      targetProgress.current = Math.min(Math.max(targetProgress.current + delta, 0), 1);
    };

    // Touch events for mobile: Reduced speed so dragging provides gradual, controlled zoom
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDoneRef.current || touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const rawDelta = (touchStartY.current - currentY) / 850;
      const delta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 0.07);
      touchStartY.current = currentY;

      e.preventDefault();
      targetProgress.current = Math.min(Math.max(targetProgress.current + delta, 0), 1);
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    // Keyboard support: ArrowDown / PageDown increments zoom slowly, ArrowUp / PageUp decrements zoom. Escape skips.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDoneRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        targetProgress.current = Math.min(targetProgress.current + 0.08, 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        targetProgress.current = Math.max(targetProgress.current - 0.08, 0);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        targetProgress.current = 1;
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

  // Pure scroll-driven transformation values:
  // When progress = 0: Centered C3 monogram at 1x scale, opaque background
  // When progress = 1: C3 scales to 14x, C flies left (-120vw), 3 flies right (+120vw), backdrop dissolves
  const clamped = Math.min(Math.max(progress, 0), 1);
  const scale = 1 + Math.pow(clamped, 1.35) * 13;          // 1x -> 14x dramatic zoom
  const xLeft = -(Math.pow(clamped, 1.2) * 125);           // 0vw -> -125vw (C glides left)
  const xRight = Math.pow(clamped, 1.2) * 125;             // 0vw -> +125vw (3 glides right)
  
  // Background fades out gradually between 0.35 and 0.95 so Hero emerges cleanly behind
  const bgOpacity = clamped < 0.35 ? 1 : Math.max(0, 1 - (clamped - 0.35) / 0.60);
  
  // Emblem fades as it zooms off-screen between 0.60 and 1.0
  const emblemOpacity = clamped < 0.60 ? 1 : Math.max(0, 1 - (clamped - 0.60) / 0.38);
  
  // Ambient glow
  const glowOpacity = Math.max(0, 1 - clamped * 1.5);
  
  // Instruction hint fades immediately on first scroll
  const hintOpacity = Math.max(0, 1 - clamped * 4.5);

  return (
    <div
      style={{
        pointerEvents: clamped > 0.85 ? 'none' : 'auto',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
    >
      {/* Seamless Backdrop: smoothly reveals the site underneath as user scrolls */}
      <div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-claude-bg dark:bg-claude-darkBg pointer-events-none transition-opacity duration-75"
      />

      {/* Warm Terracotta Ambient Glow behind C3 */}
      <div
        style={{
          opacity: glowOpacity,
          transform: `scale(${1 + clamped * 1.8})`,
        }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-claude-terracotta/25 dark:bg-claude-terracotta/35 blur-[140px] -z-10 will-change-transform"
      />

      {/* The Official C3 Monogram Logo Split Assembly: Scales & splits strictly as user scrolls */}
      <div className="relative z-30 flex items-center justify-center select-none pointer-events-none will-change-transform">
        <div className="relative w-[280px] xs:w-[340px] sm:w-[440px] md:w-[500px] aspect-[551/388] flex items-center justify-center drop-shadow-2xl">
          {/* Left C Half (Glides to the LEFT) */}
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

          {/* Right 3 Half (Glides to the RIGHT) */}
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

      {/* Scroll Instruction (Manual Scrub Indicator) */}
      <div
        style={{
          opacity: hintOpacity,
          transform: `translateY(${clamped * 20}px)`,
        }}
        className="absolute bottom-8 sm:bottom-10 z-40 flex items-center justify-center text-center select-none pointer-events-none px-4"
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-claude-text dark:text-claude-darkText font-semibold">
          <span>Scroll down to zoom C3</span>
          <ChevronDown className="w-4 h-4 text-claude-terracotta animate-bounce" />
        </div>
      </div>

      {/* Accessible Skip Button (top-right, non-intrusive) */}
      <button
        type="button"
        onClick={() => {
          targetProgress.current = 1;
        }}
        style={{ opacity: hintOpacity }}
        className="absolute top-6 right-6 z-50 text-[11px] font-mono tracking-wider text-claude-subtext hover:text-claude-text dark:hover:text-claude-darkText px-3 py-1.5 rounded-full border border-claude-border dark:border-claude-darkBorder bg-white/40 dark:bg-black/40 backdrop-blur-sm transition-all cursor-pointer"
      >
        Skip &rarr;
      </button>
    </div>
  );
};

