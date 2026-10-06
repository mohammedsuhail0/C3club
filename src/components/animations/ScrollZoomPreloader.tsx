import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { requestMobileFullscreen } from '../../utils/fullscreen';

interface ScrollZoomPreloaderProps {
  onComplete?: () => void;
}

export const ScrollZoomPreloader: React.FC<ScrollZoomPreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  const currentProgress = useRef<number>(0);
  const targetProgress = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDoneRef = useRef<boolean>(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Keep scroll clean and prevent unwanted browser restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const finishPreloader = () => {
      if (isDoneRef.current) return;
      isDoneRef.current = true;
      setProgress(1);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setIsDone(true);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    };

    // Physics Lerp loop: 100% manually driven by user interaction (Zero auto-advancing)
    const loop = () => {
      if (isDoneRef.current) return;

      // Smooth interpolation towards user's manual scroll scrub target
      currentProgress.current += (targetProgress.current - currentProgress.current) * 0.16;
      setProgress(currentProgress.current);

      // Once user deliberately scrubs through (threshold reached), smoothly finish
      if (currentProgress.current >= 0.86 || targetProgress.current >= 0.96) {
        if (currentProgress.current >= 0.88) {
          finishPreloader();
          return;
        }
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    // 1. Wheel event: 100% USER DRIVEN (Scroll down to zoom in, scroll up to zoom out)
    const handleWheel = (e: WheelEvent) => {
      if (isDoneRef.current) return;

      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        requestMobileFullscreen();
      }

      e.preventDefault();
      // Natural sensitivity: ~3-4 wheel clicks or 1 smooth trackpad gesture
      const rawDelta = e.deltaY / 320;
      const delta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 0.25);

      let nextTarget = targetProgress.current + delta;
      // If user scrolls past 70% with forward momentum, smoothly glide through
      if (nextTarget >= 0.70 && delta > 0) {
        nextTarget = 1.0;
      }
      targetProgress.current = Math.min(Math.max(nextTarget, 0), 1);
    };

    // 2. Touch events: Drag up to zoom in, drag down to zoom out
    const handleTouchStart = (e: TouchEvent) => {
      requestMobileFullscreen();
      if (e.touches.length > 0) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDoneRef.current || touchStartY.current === null) return;
      requestMobileFullscreen();
      const currentY = e.touches[0].clientY;
      const rawDelta = (touchStartY.current - currentY) / 260;
      const delta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 0.30);
      touchStartY.current = currentY;

      if (e.cancelable) {
        e.preventDefault();
      }

      let nextTarget = targetProgress.current + delta;
      // If user swipes past 65% with forward momentum, glide through to open
      if (nextTarget >= 0.65 && delta > 0) {
        nextTarget = 1.0;
      }
      targetProgress.current = Math.min(Math.max(nextTarget, 0), 1);
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    // 3. Keyboard support: ArrowDown / PageDown / Space increments zoom, ArrowUp decrements, Escape skips
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDoneRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        const next = targetProgress.current + 0.22;
        targetProgress.current = next >= 0.65 ? 1.0 : Math.min(next, 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        targetProgress.current = Math.max(targetProgress.current - 0.22, 0);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        targetProgress.current = 1.0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  if (isDone) {
    return null;
  }

  // Pure scroll-driven transformation values:
  // When progress = 0: Centered C3 monogram at 1x scale, opaque background
  // When progress = 1: C3 scales to 14x, C flies left (-125vw), 3 flies right (+125vw), backdrop dissolves
  const clamped = Math.min(Math.max(progress, 0), 1);
  const scale = 1 + Math.pow(clamped, 1.35) * 13;
  const xLeft = -(Math.pow(clamped, 1.2) * 125);
  const xRight = Math.pow(clamped, 1.2) * 125;

  // Background fades out gradually between 0.35 and 0.95 so content emerges cleanly behind
  const bgOpacity = clamped < 0.35 ? 1 : Math.max(0, 1 - (clamped - 0.35) / 0.60);

  // Emblem fades as it zooms off-screen between 0.60 and 1.0
  const emblemOpacity = clamped < 0.60 ? 1 : Math.max(0, 1 - (clamped - 0.60) / 0.38);

  // Ambient glow fades smoothly
  const glowOpacity = Math.max(0, 1 - clamped * 1.5);

  // Instruction hint fades immediately on first user scroll
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

      {/* Accessible Skip Button (top-right, non-intrusive, NO PILLS) */}
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            requestMobileFullscreen();
          }
          targetProgress.current = 1.0;
        }}
        style={{ opacity: hintOpacity }}
        className="absolute top-6 right-6 z-50 text-[11px] font-mono tracking-wider text-claude-subtext hover:text-claude-text dark:hover:text-claude-darkText px-3 py-1.5 rounded-lg border border-claude-border dark:border-claude-darkBorder bg-white/40 dark:bg-black/40 backdrop-blur-sm transition-all cursor-pointer"
      >
        Skip &rarr;
      </button>
    </div>
  );
};
