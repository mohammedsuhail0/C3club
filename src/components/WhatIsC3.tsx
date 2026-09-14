import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Laptop, Rocket, Users2, ArrowRight } from 'lucide-react';
import { TiltCard } from './animations/TiltCard';
import { sounds } from '../utils/audio';

export const WhatIsC3: React.FC = () => {
  const pillars = [
    {
      code: '01 / ROUTINE',
      icon: Laptop,
      title: 'Morning Cowork',
      highlight: 'Mon–Thu · 10 AM – 1 PM',
      desc: 'A dedicated physical space on campus with power outlets and peer builders. Bring your laptop and personal hotspot to code together.',
    },
    {
      code: '02 / INITIATIVE',
      icon: Terminal,
      title: 'Student Collective',
      highlight: 'Prompt Design & Open Architectures',
      desc: 'An independent student builder collective exploring prompt engineering, web AI tools, and vibe coding workflows with zero friction.',
    },
    {
      code: '03 / VELOCITY',
      icon: Rocket,
      title: 'Ship Every Friday',
      highlight: 'Live URLs · Real Users',
      desc: 'Localhost doesn’t count. Every week concludes with a live deployment sprint where each builder ships real software to the internet.',
    },
    {
      code: '04 / FOUNDERS',
      icon: Users2,
      title: 'All Branches Welcome',
      highlight: 'Originated in IT · Open to All',
      desc: 'Originated in the Department of Information Technology at ISLEC. Open to IT, CSE, AI & DS, ECE, Mechanical, and Civil with zero prerequisites.',
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-12">
      
      {/* Section Header - Zero Pills, Clean Typography */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
      >
        <span className="font-mono text-xs tracking-[0.25em] text-claude-terracotta dark:text-claude-amber uppercase font-semibold block mb-3">
          Originated in Dept. of Information Technology · No Slides, Only Software
        </span>

        <h2 className="font-serif font-normal text-3xl sm:text-5xl md:text-6xl text-claude-text dark:text-claude-darkText tracking-tight mb-4">
          What is C3?{' '}
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-claude-terracotta via-amber-600 to-rose-600">
            A software collective.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-claude-muted dark:text-claude-darkMuted leading-relaxed font-sans max-w-2xl mx-auto">
          Not a classroom. Not another club full of PowerPoint slides. Originated in the Department of Information Technology at ISLEC, C3 is an autonomous morning laboratory where students build and ship real products.
        </p>
      </motion.div>

      {/* 4 Crisp Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map((item, idx) => {
          const Icon = item.icon;
          return (
            <TiltCard
              key={idx}
              className="p-6 rounded-2xl bg-claude-card/90 dark:bg-claude-darkCard/90 border border-claude-border dark:border-claude-darkBorder hover:border-claude-terracotta/50 shadow-claude-card transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] font-bold text-claude-terracotta dark:text-claude-amber tracking-wider">
                    {item.code}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-claude-terracottaLight dark:bg-claude-terracotta/10 border border-claude-terracottaBorder dark:border-claude-terracotta/20 flex items-center justify-center text-claude-terracotta dark:text-claude-amber">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-serif font-bold text-xl text-claude-text dark:text-claude-darkText tracking-tight mb-1">
                  {item.title}
                </h3>
                
                <div className="font-mono text-xs text-claude-terracotta dark:text-claude-amber mb-3 font-semibold">
                  {item.highlight}
                </div>

                <p className="text-xs text-claude-muted dark:text-claude-darkMuted leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-claude-border/60 dark:border-claude-darkBorder/60 flex items-center justify-between text-[11px] font-mono text-claude-muted">
                <span>Campus Office</span>
                <span className="text-claude-terracotta font-semibold">Active</span>
              </div>
            </TiltCard>
          );
        })}
      </div>

    </section>
  );
};
