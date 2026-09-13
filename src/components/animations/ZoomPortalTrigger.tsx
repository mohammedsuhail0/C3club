import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ZoomPortalTriggerProps {
  children: React.ReactNode;
}

export const ZoomPortalTrigger: React.FC<ZoomPortalTriggerProps> = ({ children }) => {
  const [hasEntered, setHasEntered] = useState(false);

  const handleEnter = () => {
    if (!hasEntered) {
      sounds.playSuccess();
      setHasEntered(true);
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!hasEntered && Math.abs(e.deltaY) > 5) {
        handleEnter();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasEntered && (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter')) {
        handleEnter();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasEntered]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      
      {/* The Main Website Content Underneath */}
      <motion.div
        animate={{
          opacity: hasEntered ? 1 : 0,
          scale: hasEntered ? 1 : 0.9,
        }}
        transition={{
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2,
        }}
        className={`w-full min-h-screen ${!hasEntered ? 'pointer-events-none' : ''}`}
      >
        {children}
      </motion.div>

      {/* Replay Intro Floating Button (Visible once entered) */}
      {hasEntered && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            sounds.playClick();
            setHasEntered(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder shadow-xl text-xs font-mono text-claude-text dark:text-claude-darkText hover:text-claude-terracotta transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay C3 Intro</span>
        </motion.button>
      )}

      {/* Fullscreen Monumental C3 Portal Overlay */}
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            key="portal-overlay"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.8, delay: 0.6 },
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-claude-bg dark:bg-claude-darkBg select-none cursor-pointer"
            onClick={handleEnter}
          >
            {/* Ambient Terracotta Glow */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-claude-terracotta/25 dark:bg-claude-terracotta/35 blur-[150px]" />

            {/* Sized container matching original emblem ratio */}
            <div className="relative w-[340px] sm:w-[460px] md:w-[560px] aspect-[551/388] flex items-center justify-center drop-shadow-2xl">
              {/* Left C Half (Flies Left) */}
              <motion.div
                animate={{
                  x: hasEntered ? '-120vw' : 0,
                  scale: hasEntered ? 6 : 1,
                  opacity: hasEntered ? 0 : 1,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <img
                  src="/assets/c3_logo_c.png"
                  alt="C3 Monogram - C"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(204,90,54,0.3)]"
                />
              </motion.div>

              {/* Right 3 Half (Flies Right) */}
              <motion.div
                animate={{
                  x: hasEntered ? '120vw' : 0,
                  scale: hasEntered ? 6 : 1,
                  opacity: hasEntered ? 0 : 1,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <img
                  src="/assets/c3_logo_3.png"
                  alt="C3 Monogram - 3"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(204,90,54,0.3)]"
                />
              </motion.div>
            </div>

            {/* Click / Scroll CTA Hint */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute bottom-12 flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-claude-card/95 dark:bg-claude-darkCard/95 border border-claude-border dark:border-claude-darkBorder shadow-xl backdrop-blur-md text-xs font-mono text-claude-text dark:text-claude-darkText hover:border-claude-terracotta transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-claude-terracotta" />
                <span className="font-semibold">Click anywhere or Scroll to Enter</span>
                <ChevronDown className="w-4 h-4 text-claude-terracotta" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
