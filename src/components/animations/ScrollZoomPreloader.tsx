import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollZoomPreloaderProps {
  onComplete?: () => void;
}

export const ScrollZoomPreloader: React.FC<ScrollZoomPreloaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'idle' | 'zooming' | 'done'>('idle');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const isTriggeredRef = useRef(false);

  useEffect(() => {
    // Keep scroll clean
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    const triggerZoom = () => {
      if (isTriggeredRef.current) return;
      isTriggeredRef.current = true;
      setPhase('zooming');
      setTimeout(() => {
        setPhase('done');
        onCompleteRef.current?.();
      }, 550);
    };

    // Auto-advance after 800ms of viewing so user is NEVER stuck
    const autoTimer = setTimeout(() => {
      triggerZoom();
    }, 800);

    // Any user scroll, touch, or key action immediately triggers zoom reveal
    const handleWheel = () => {
      triggerZoom();
    };

    const handleTouch = () => {
      triggerZoom();
    };

    const handleKeyDown = () => {
      triggerZoom();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(autoTimer);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const smoothEase = [0.76, 0, 0.24, 1] as const;

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === 'zooming' ? 0 : 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: smoothEase }}
          onClick={() => {
            if (!isTriggeredRef.current) {
              isTriggeredRef.current = true;
              setPhase('zooming');
              setTimeout(() => {
                setPhase('done');
                onCompleteRef.current?.();
              }, 550);
            }
          }}
          className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-claude-bg dark:bg-claude-darkBg select-none cursor-pointer ${
            phase === 'zooming' ? 'pointer-events-none' : ''
          }`}
        >
          {/* Warm Terracotta Ambient Glow behind C3 */}
          <motion.div
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{
              opacity: phase === 'zooming' ? 0 : 0.7,
              scale: phase === 'zooming' ? 2.8 : 1,
            }}
            transition={{ duration: 0.6, ease: smoothEase }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-claude-terracotta/25 dark:bg-claude-terracotta/35 blur-[140px] -z-10 pointer-events-none"
          />

          {/* The Official C3 Monogram Logo Split Assembly: Scales & splits on enter */}
          <div className="relative z-30 flex items-center justify-center select-none pointer-events-none">
            <motion.div
              initial={{ scale: 1 }}
              animate={{
                scale: phase === 'zooming' ? 12 : 1,
              }}
              transition={{ duration: 0.6, ease: smoothEase }}
              className="relative w-[280px] xs:w-[340px] sm:w-[440px] md:w-[500px] aspect-[551/388] flex items-center justify-center drop-shadow-2xl"
            >
              {/* Left C Half (Glides smoothly to the LEFT) */}
              <motion.div
                initial={{ x: 0, opacity: 1 }}
                animate={{
                  x: phase === 'zooming' ? '-130vw' : 0,
                  opacity: phase === 'zooming' ? 0 : 1,
                }}
                transition={{
                  x: { duration: 0.6, ease: smoothEase },
                  opacity: { duration: 0.45, ease: 'easeOut' },
                }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <img
                  src="/assets/c3_logo_c.png"
                  alt="C3 Monogram - C"
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(204,90,54,0.35)]"
                />
              </motion.div>

              {/* Right 3 Half (Glides smoothly to the RIGHT) */}
              <motion.div
                initial={{ x: 0, opacity: 1 }}
                animate={{
                  x: phase === 'zooming' ? '130vw' : 0,
                  opacity: phase === 'zooming' ? 0 : 1,
                }}
                transition={{
                  x: { duration: 0.6, ease: smoothEase },
                  opacity: { duration: 0.45, ease: 'easeOut' },
                }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <img
                  src="/assets/c3_logo_3.png"
                  alt="C3 Monogram - 3"
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(204,90,54,0.35)]"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Instruction (Manual Scrub Indicator) */}
          <motion.div
            initial={{ opacity: 0.8, y: 0 }}
            animate={{
              opacity: phase === 'zooming' ? 0 : 0.8,
              y: phase === 'zooming' ? 15 : 0,
            }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-8 sm:bottom-10 z-40 flex items-center justify-center text-center select-none pointer-events-none px-4"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-claude-text dark:text-claude-darkText font-semibold">
              <span>Scroll down or tap to enter</span>
              <ChevronDown className="w-4 h-4 text-claude-terracotta animate-bounce" />
            </div>
          </motion.div>

          {/* Accessible Skip Button (top-right, non-intrusive, NO PILLS) */}
          <motion.button
            type="button"
            initial={{ opacity: 0.8 }}
            animate={{
              opacity: phase === 'zooming' ? 0 : 0.8,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isTriggeredRef.current) {
                isTriggeredRef.current = true;
                setPhase('zooming');
                setTimeout(() => {
                  setPhase('done');
                  onCompleteRef.current?.();
                }, 350);
              }
            }}
            className="absolute top-6 right-6 z-50 text-[11px] font-mono tracking-wider text-claude-subtext hover:text-claude-text dark:hover:text-claude-darkText px-3 py-1.5 rounded-lg border border-claude-border dark:border-claude-darkBorder bg-white/40 dark:bg-black/40 backdrop-blur-sm transition-all cursor-pointer"
          >
            Skip &rarr;
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
