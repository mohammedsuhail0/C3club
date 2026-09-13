import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

interface ZoomPortalScrubProps {
  children: React.ReactNode;
}

export const ZoomPortalScrub: React.FC<ZoomPortalScrubProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress through this 250vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Overall emblem zoom: 1x -> 8x
  const zoomScale = useTransform(scrollYProgress, [0, 0.62], [1, 8.5]);

  // C half moves smoothly to the left
  const xLeft = useTransform(scrollYProgress, [0, 0.62], ['0vw', '-105vw']);

  // 3 half moves smoothly to the right
  const xRight = useTransform(scrollYProgress, [0, 0.62], ['0vw', '105vw']);

  // Opacity of the C3 emblem: starts at 1, fades as it clears the screen edges
  const emblemOpacity = useTransform(scrollYProgress, [0, 0.48, 0.62], [1, 0.85, 0]);

  // Content reveal inside the portal
  const contentOpacity = useTransform(scrollYProgress, [0.18, 0.62], [0, 1]);
  const contentScale = useTransform(scrollYProgress, [0.15, 0.62], [0.88, 1]);
  const contentY = useTransform(scrollYProgress, [0.15, 0.62], [50, 0]);

  // Scroll hint pill fades out immediately upon scrolling
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const hintY = useTransform(scrollYProgress, [0, 0.12], [0, 20]);

  // Pointer events on website content once zoomed through
  const pointerEvents = useTransform(scrollYProgress, (val) => (val > 0.6 ? 'auto' : 'none'));

  return (
    <div ref={containerRef} className="relative h-[250vh] w-full">
      
      {/* Pinned Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-claude-bg dark:bg-claude-darkBg">
        
        {/* Warm Terracotta Ambient Glow behind C3 */}
        <motion.div
          style={{ opacity: emblemOpacity }}
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-claude-terracotta/25 dark:bg-claude-terracotta/35 blur-[150px] -z-10"
        />

        {/* The Emerging Website Content (Revealed inside the split) */}
        <motion.div
          style={{
            opacity: contentOpacity,
            scale: contentScale,
            y: contentY,
            pointerEvents,
          }}
          className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden pt-4 pb-12"
        >
          {children}
        </motion.div>

        {/* The Official C3 Monogram Logo Split Assembly */}
        <motion.div
          style={{
            opacity: emblemOpacity,
            scale: zoomScale,
            pointerEvents: useTransform(scrollYProgress, (val) => (val > 0.6 ? 'none' : 'auto')),
          }}
          className="relative z-30 flex items-center justify-center select-none"
        >
          {/* Sized container matching original emblem ratio (551 x 388) */}
          <div className="relative w-[320px] sm:w-[440px] md:w-[520px] aspect-[551/388] flex items-center justify-center drop-shadow-2xl">
            
            {/* Left C Half (Moves Left) */}
            <motion.div
              style={{ x: xLeft }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <img
                src="/assets/c3_logo_c.png"
                alt="C3 Monogram - C"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(204,90,54,0.3)]"
              />
            </motion.div>

            {/* Right 3 Half (Moves Right) */}
            <motion.div
              style={{ x: xRight }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <img
                src="/assets/c3_logo_3.png"
                alt="C3 Monogram - 3"
                className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(204,90,54,0.3)]"
              />
            </motion.div>

          </div>
        </motion.div>

        {/* Scroll Instruction Hint Pill */}
        <motion.div
          style={{
            opacity: hintOpacity,
            y: hintY,
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
        </motion.div>

      </div>

    </div>
  );
};
