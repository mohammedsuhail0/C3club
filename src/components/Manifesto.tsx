import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Flame, ShieldAlert, Sparkles, GitBranch, Layers } from 'lucide-react';
import { sounds } from '../utils/audio';
import { TiltCard } from './animations/TiltCard';

export const Manifesto: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compare' | 'rules'>('compare');

  const comparisonRows = [
    {
      aspect: 'Format',
      oldClub: 'Passive lecture with someone reading off PowerPoint slides',
      c3Club: 'Hands-on hacker session — laptops open, pairing, and shipping code',
    },
    {
      aspect: 'End of Semester Outcome',
      oldClub: 'A printed certificate of participation for your resume',
      c3Club: 'A live portfolio of 10+ working apps, GitHub repos & deployed URLs',
    },
    {
      aspect: 'Hierarchy & Credit',
      oldClub: 'The "Club President" takes all the credit on LinkedIn',
      c3Club: 'Zero hierarchy. Everyone is a founder. You own your project 100%',
    },
    {
      aspect: 'Tech Stack',
      oldClub: 'Outdated textbook theory and bubble sort in C/C++',
      c3Club: 'Frontier AI (Claude Code, MCP), prompt engineering, Git & modern full-stack',
    },
    {
      aspect: 'Student Access',
      oldClub: 'Pay annual membership fees for t-shirts & refreshments',
      c3Club: 'Zero fees. Powered by GitHub Student Developer packs and frontier AI credits',
    },
  ];

  const rules = [
    {
      num: '01',
      title: 'No Spectators, Only Founders',
      desc: 'Anyone who walks through the door comes to work on an idea. You are not on someone else’s team by default — you are the creator of your own project.',
      icon: Flame,
    },
    {
      num: '02',
      title: 'Mon–Thu Build, Weekly Ship',
      desc: 'We cowork Monday through Thursday mornings (10:00 AM – 1:00 PM) in the C3 Campus Office, pairing with Claude Code, and push working software to main every week.',
      icon: GitBranch,
    },
    {
      num: '03',
      title: 'Credit Stays Where It’s Earned',
      desc: 'What gets built and who built it is documented transparently in public. No middleman funnels your hard work into their own credentials.',
      icon: Layers,
    },
  ];

  return (
    <section id="manifesto" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Section Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>THE PHILOSOPHY</span>
        </div>
        <h2 className="font-serif font-normal text-3xl sm:text-5xl text-claude-text dark:text-claude-darkText tracking-tight">
          Why we started C3.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-claude-muted dark:text-claude-darkMuted leading-relaxed font-sans">
          Most college technical clubs are broken. Too many meetings, too many executive titles, and not a single line of real code pushed to production. We built the antidote.
        </p>

        {/* Tab Buttons */}
        <div className="mt-8 inline-flex p-1.5 rounded-xl bg-claude-cardMuted dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder shadow-sm">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('compare');
            }}
            className={`relative px-5 py-2 text-xs font-mono rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-claude-card dark:bg-claude-darkCardMuted text-claude-text dark:text-claude-darkText shadow-sm'
                : 'text-claude-muted dark:text-claude-darkMuted hover:text-claude-text'
            }`}
          >
            The Difference (Old vs C3)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('rules');
            }}
            className={`relative px-5 py-2 text-xs font-mono rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-claude-card dark:bg-claude-darkCardMuted text-claude-text dark:text-claude-darkText shadow-sm'
                : 'text-claude-muted dark:text-claude-darkMuted hover:text-claude-text'
            }`}
          >
            The 3 Core Rules
          </button>
        </div>
      </motion.div>

      {/* Tab Content with AnimatePresence */}
      <AnimatePresence mode="wait">
        {activeTab === 'compare' ? (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-claude-border dark:border-claude-darkBorder bg-claude-card dark:bg-claude-darkCard shadow-claude-card"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 border-b border-claude-border dark:border-claude-darkBorder bg-claude-bgWarm/80 dark:bg-claude-darkBgWarm/80 text-xs font-mono font-semibold">
              <div className="hidden md:block md:col-span-3 p-4 text-claude-muted dark:text-claude-darkMuted">
                DIMENSION
              </div>
              <div className="p-4 md:col-span-4 text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>TRADITIONAL COLLEGE CLUBS</span>
              </div>
              <div className="p-4 md:col-span-5 text-claude-terracotta dark:text-claude-amber flex items-center gap-1.5 bg-claude-terracottaLight/50 dark:bg-claude-terracotta/10">
                <Sparkles className="w-4 h-4" />
                <span>C3 HACKER COLLECTIVE</span>
              </div>
            </div>

            <div className="divide-y divide-claude-border dark:divide-claude-darkBorder">
              {comparisonRows.map((row, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ backgroundColor: 'rgba(204, 90, 54, 0.03)' }}
                  className="grid grid-cols-1 md:grid-cols-12 text-sm transition-colors"
                >
                  <div className="p-4 md:col-span-3 font-mono text-xs font-bold text-claude-muted dark:text-claude-darkMuted flex items-center">
                    {row.aspect}
                  </div>
                  <div className="px-4 pb-3 md:py-4 md:col-span-4 text-claude-muted dark:text-claude-darkMuted flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{row.oldClub}</span>
                  </div>
                  <div className="px-4 pb-4 md:py-4 md:col-span-5 text-claude-text dark:text-claude-darkText font-medium flex items-start gap-2.5 bg-claude-terracottaLight/20 dark:bg-claude-terracotta/5">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 font-bold" />
                    <span>{row.c3Club}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {rules.map((rule) => {
              const Icon = rule.icon;
              return (
                <TiltCard
                  key={rule.num}
                  className="p-6 sm:p-7 rounded-2xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder shadow-claude-card hover:border-claude-terracotta"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-claude-terracotta dark:text-claude-amber">
                      {rule.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-claude-terracottaLight dark:bg-claude-darkCardMuted flex items-center justify-center text-claude-terracotta dark:text-claude-amber shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-claude-text dark:text-claude-darkText mb-2">
                    {rule.title}
                  </h3>
                  <p className="text-sm text-claude-muted dark:text-claude-darkMuted leading-relaxed font-sans">
                    {rule.desc}
                  </p>
                </TiltCard>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};
