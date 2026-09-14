import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowDown, ArrowUpRight } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeroProps {
  onOpenApply: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenApply }) => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 45]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 z-10 select-none pt-16 pb-12"
    >
      <motion.div 
        style={{ y: heroY, opacity: heroOpacity }}
        className="max-w-6xl mx-auto flex flex-col items-center justify-center my-auto"
      >
        {/* Plain, clean typography line for College - NO PILLS */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs sm:text-sm font-mono tracking-[0.25em] text-claude-terracotta dark:text-claude-amber uppercase font-semibold mb-4 sm:mb-6"
        >
          Student Software Collective · Originated in Dept. of IT, ISLEC
        </motion.div>

        {/* MASSIVE DISPLAY HEADLINE - Responsive Mobile Scaling */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif font-normal text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] tracking-tight leading-[1.02] sm:leading-[0.98] text-claude-text dark:text-claude-darkText mb-4 sm:mb-6 px-1"
        >
          The Claude Code
          <span className="block mt-1 sm:mt-2 italic text-transparent bg-clip-text bg-gradient-to-r from-claude-terracotta via-amber-600 to-rose-600">
            &amp; Cowork.
          </span>
        </motion.h1>

        {/* Punchy Subhead - Clean typography */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-2xl md:text-3xl font-serif italic text-claude-muted dark:text-claude-darkMuted max-w-3xl mx-auto mb-2 sm:mb-3 px-2"
        >
          Ship real software every week. Zero slides.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-xs sm:text-sm font-mono text-claude-muted dark:text-claude-darkMuted mb-8 sm:mb-10 max-w-md sm:max-w-xl mx-auto px-2 leading-relaxed"
        >
          Mon–Thu 10:00 AM – 1:00 PM · Open to all branches &amp; all years (1st to 4th) · Batch 01 Core
        </motion.p>

        {/* DUAL ACTION HERO CTAS - Sleek, bold, zero pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none">
            {/* Primary Action: Forge Pass */}
            <button
              onClick={() => {
                sounds.playClick();
                document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-sans font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span className="tracking-wide">Forge Your Pass</span>
              <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>

            {/* Secondary Action: Direct Redirect to Google Form */}
            <a
              href="https://forms.gle/yHpq52h2rhREPtSa8"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sounds.playSuccess()}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-claude-card dark:bg-claude-darkCard hover:bg-claude-cardMuted dark:hover:bg-claude-darkCardMuted border-2 border-claude-border dark:border-claude-darkBorder hover:border-claude-terracotta dark:hover:border-claude-terracotta text-claude-text dark:text-claude-darkText font-sans font-semibold text-base sm:text-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm"
            >
              <span>Apply to Batch</span>
              <ArrowUpRight className="w-4 h-4 text-claude-terracotta transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
          
          <button
            onClick={() => {
              sounds.playClick();
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-mono text-claude-muted/80 dark:text-claude-darkMuted/80 hover:text-claude-terracotta cursor-pointer transition-colors"
          >
            ↓ Scroll to explore what is C3
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};
