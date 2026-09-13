import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZoomPreloaderProps {
  onComplete?: () => void;
}

export const ZoomPreloader: React.FC<ZoomPreloaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'holding' | 'zooming' | 'done'>('holding');

  useEffect(() => {
    // Reset scroll to top on page refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Lock body scroll during the intro preloader
    document.body.style.overflow = 'hidden';

    // Step 1: Hold the monogram in center briefly for visual impact (350ms)
    const holdTimer = setTimeout(() => {
      setPhase('zooming');
    }, 350);

    // Step 2: Complete the zoom reveal and unlock full-page scrolling (1700ms)
    const doneTimer = setTimeout(() => {
      setPhase('done');
      document.body.style.overflow = '';
      if (onComplete) onComplete();
    }, 1700);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  // Ultra-smooth luxury editorial easing curve
  const smoothEase = [0.76, 0, 0.24, 1] as const;

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === 'zooming' ? 0 : 1,
          }}
          transition={{
            duration: 0.85,
            delay: phase === 'zooming' ? 0.45 : 0,
            ease: 'easeInOut',
          }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-claude-bg dark:bg-claude-darkBg pointer-events-none select-none"
        >
          {/* Warm Terracotta Ambient Glow behind C3 */}
          <motion.div
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{
              opacity: phase === 'zooming' ? 0 : 0.8,
              scale: phase === 'zooming' ? 3.5 : 1.1,
            }}
            transition={{
              duration: 1.2,
              ease: smoothEase,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-claude-terracotta/30 dark:bg-claude-terracotta/40 blur-[150px] -z-10"
          />

          {/* Sized container matching original emblem ratio (551 x 388) */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: phase === 'zooming' ? 12 : 1,
              opacity: phase === 'zooming' ? 0 : 1,
            }}
            transition={{
              scale: { duration: 1.35, ease: smoothEase },
              opacity: { duration: 0.55, delay: 0.5, ease: 'easeOut' },
            }}
            className="relative w-[300px] sm:w-[420px] md:w-[480px] aspect-[551/388] flex items-center justify-center drop-shadow-2xl"
          >
            {/* Left C Half (Glides smoothly to the LEFT) */}
            <motion.div
              initial={{ x: 0 }}
              animate={{
                x: phase === 'zooming' ? '-130vw' : 0,
              }}
              transition={{
                duration: 1.35,
                ease: smoothEase,
              }}
              className="absolute inset-0 w-full h-full will-change-transform"
            >
              <img
                src="/assets/c3_logo_c.png"
                alt="C3 Monogram - C"
                className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(204,90,54,0.35)]"
              />
            </motion.div>

            {/* Right 3 Half (Glides smoothly to the RIGHT) */}
            <motion.div
              initial={{ x: 0 }}
              animate={{
                x: phase === 'zooming' ? '130vw' : 0,
              }}
              transition={{
                duration: 1.35,
                ease: smoothEase,
              }}
              className="absolute inset-0 w-full h-full will-change-transform"
            >
              <img
                src="/assets/c3_logo_3.png"
                alt="C3 Monogram - 3"
                className="w-full h-full object-contain filter drop-shadow-[0_12px_30px_rgba(204,90,54,0.35)]"
              />
            </motion.div>
          </motion.div>

          {/* Understated Minimalist Chapter Tag below the logo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === 'zooming' ? 0 : 0.7,
              y: phase === 'zooming' ? 20 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-12 flex flex-col items-center gap-1.5 font-mono text-xs tracking-widest text-claude-muted dark:text-claude-darkMuted"
          >
            <span className="font-semibold text-claude-terracotta tracking-wider">C3 · ISL CHAPTER</span>
            <span className="text-[10px] opacity-70">CLAUDE CODE &amp; COWORK</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
