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

    // Keep body overflow clean - native scrolling stays operational
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
      window.removeEventListener('click', handleClick);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    // Responsive Lerp loop for real-time scroll scrub
    const loop = () => {
      if (isDoneRef.current) return;

      currentProgress.current += (targetProgress.current - currentProgress.current) * 0.18;
      setProgress(currentProgress.current);

      // Once progress clears 0.72, C3 has fully zoomed past screen edges
      if (currentProgress.current >= 0.72) {
        setProgress(1);
        cleanupListeners();
        setIsDone(true);
        if (onComplete) onComplete();
        return;
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    // Wheel event: User physically zooms the C3 logo by scrolling
    const handleWheel = (e: WheelEvent) => {
      if (isDoneRef.current) return;

      // If user has already scrolled through, let native scroll flow seamlessly
      if (targetProgress.current >= 0.70) {
        cleanupListeners();
        setIsDone(true);
        if (onComplete) onComplete();
        return;
      }

      if (e.deltaY > 0) {
        e.preventDefault();
        const delta = e.deltaY / 180;
        const next = Math.min(Math.max(targetProgress.current + delta, 0), 1.05);

        // Natural momentum: once user initiates zoom scroll past 30%, glide cleanly open
        if (next >= 0.30) {
          targetProgress.current = 1.05;
        } else {
          targetProgress.current = next;
        }
      } else if (e.deltaY < 0 && targetProgress.current > 0) {
        // Can scrub back if before commitment
        const delta = e.deltaY / 180;
        targetProgress.current = Math.max(targetProgress.current + delta, 0);
      }
    };

    // Touch events for mobile touch scroll scrub
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDoneRef.current) return;
      if (targetProgress.current >= 0.70) {
        cleanupListeners();
        setIsDone(true);
        if (onComplete) onComplete();
        return;
      }
      if (touchStartY.current === null) return;
      const currentY = e.touches[0].clientY;
      const delta = (touchStartY.current - currentY) / 120;
      touchStartY.current = currentY;

      if (delta > 0) {
        e.preventDefault();
        const next = Math.min(Math.max(targetProgress.current + delta, 0), 1.05);
        if (next >= 0.28) {
          targetProgress.current = 1.05;
        } else {
          targetProgress.current = next;
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartY.current = null;
    };

    // Keyboard support (Down arrow, Space, PageDown, Enter)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDoneRef.current) return;
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') {
        e.preventDefault();
        targetProgress.current = 1.05;
      }
    };

    // Click anywhere to zoom into the site
    const handleClick = () => {
      if (isDoneRef.current) return;
      targetProgress.current = 1.05;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    return () => {
      cleanupListeners();
    };
  }, [onComplete]);

  if (isDone) {
    return null;
  }

  // Smooth transform values computed from user's physical scroll scrub progress (0 -> 1)
  const clamped = Math.min(Math.max(progress, 0), 1);
  const xLeft = -(clamped * 115);      // 0vw -> -115vw (smooth split to left)
  const xRight = clamped * 115;        // 0vw -> +115vw (smooth split to right)
  const scale = 1 + clamped * 8.5;     // Dramatic, cinematic zoom (1x -> 9.5x)
  const emblemOpacity = Math.max(0, 1 - clamped * 1.35);
  const bgOpacity = Math.max(0, 1 - clamped * 2.2);
  const glowOpacity = Math.max(0, 1 - clamped * 2.5);
  const hintOpacity = Math.max(0, 1 - clamped * 5);

  return (
    <div
      style={{
        pointerEvents: clamped > 0.7 ? 'none' : 'auto',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none cursor-pointer"
    >
      {/* Seamless Full-Screen Backdrop: fades out smoothly as you scroll */}
      <div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 bg-claude-bg dark:bg-claude-darkBg pointer-events-none transition-opacity duration-75"
      />

      {/* Warm Terracotta Ambient Glow behind C3 */}
      <div
        style={{
          opacity: glowOpacity,
          transform: `scale(${1 + clamped * 1.5})`,
        }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-claude-terracotta/25 dark:bg-claude-terracotta/35 blur-[140px] -z-10 will-change-transform"
      />

      {/* The Official C3 Monogram Logo Split Assembly: Scales & splits as user scrolls */}
      <div className="relative z-30 flex items-center justify-center select-none pointer-events-none will-change-transform">
        <div className="relative w-[280px] xs:w-[340px] sm:w-[440px] md:w-[500px] aspect-[551/388] flex items-center justify-center drop-shadow-2xl">
          {/* Left C Half (Glides smoothly to the LEFT) */}
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

          {/* Right 3 Half (Glides smoothly to the RIGHT) */}
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

      {/* Scroll Instruction (Scrub Indicator) */}
      <div
        style={{
          opacity: hintOpacity,
          transform: `translateY(${clamped * 20}px)`,
        }}
        className="absolute bottom-8 sm:bottom-10 z-40 flex items-center justify-center text-center select-none pointer-events-none px-4"
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-claude-text dark:text-claude-darkText font-semibold">
          <span>Scroll to zoom &amp; explore C3</span>
          <ChevronDown className="w-4 h-4 text-claude-terracotta animate-bounce" />
        </div>
      </div>
    </div>
  );
};
