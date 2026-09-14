import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, GitBranch, Zap, Sparkles, Terminal, CheckCircle2 } from 'lucide-react';
import { TiltCard } from './animations/TiltCard';

export const OfficeRoutine: React.FC = () => {
  const steps = [
    {
      time: '10:00 AM',
      title: 'Idea Drop & Problem Sync',
      desc: 'No slide presentations or lectures. Laptops open on desks. Share a real campus friction, project idea, or bug.',
      icon: Terminal,
    },
    {
      time: '10:30 AM',
      title: 'Pairing with Claude Code CLI',
      desc: 'Prompting terminal agents, generating React 19 / Python architecture, and writing clean type-safe logic.',
      icon: Code2Icon,
    },
    {
      time: '12:00 PM',
      title: 'Live Review & Bug Squashing',
      desc: 'Pair across branches (IT, CSE, AI/DS, ECE, Mech). Solve database states, test edge cases, and ensure real functionality.',
      icon: Zap,
    },
    {
      time: '01:00 PM',
      title: 'Push to Main & Production',
      desc: 'Commit to GitHub and deploy live to Vercel. Walk out of the office with a live working link to put on your resume.',
      icon: GitBranch,
    }
  ];

  const rules = [
    {
      num: '01',
      title: 'No Members. Only Founders.',
      desc: 'You don’t join to sit and listen. You join to create and ship software you 100% own.'
    },
    {
      num: '02',
      title: 'Mon–Thu 10 AM – 1 PM Sprints',
      desc: 'Focused daily morning build sessions at the C3 Campus Office. Consistent weekly output over cramming.'
    },
    {
      num: '03',
      title: 'All Engineering Branches',
      desc: 'Originated in the Department of Information Technology and open to 1st, 2nd, 3rd, and 4th years from IT, CSE, AI/DS, ECE, Mech, and Civil. Pure merit and enthusiasm.'
    }
  ];

  return (
    <section id="routine" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3 shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          <span>THE DAILY 3-HOUR HACKER PROTOCOL</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-claude-text dark:text-claude-darkText tracking-tight mb-4">
          Inside the <span className="italic text-claude-terracotta">C3 Campus Office</span>
        </h2>
        <p className="text-sm sm:text-base text-claude-muted dark:text-claude-darkMuted leading-relaxed">
          Monday through Thursday from 10:00 AM to 1:00 PM. Here is how we turn coffee, curiosity, and Claude Code into working apps.
        </p>
      </motion.div>

      {/* 4-Step Sprint Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <TiltCard
              key={idx}
              className="p-5 rounded-2xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder shadow-claude-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-claude-terracotta dark:text-claude-amber px-2 py-0.5 rounded bg-claude-terracotta/10">
                    {step.time}
                  </span>
                  <span className="text-[10px] font-mono text-claude-muted">
                    STEP 0{idx + 1}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-claude-text dark:text-claude-darkText mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-claude-muted dark:text-claude-darkMuted leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 mt-auto border-t border-claude-border dark:border-claude-darkBorder flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Hands-on · Zero Slides</span>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* 3 Core Rules Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 sm:p-8 rounded-3xl bg-claude-cardMuted/80 dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder">
        {rules.map((rule) => (
          <div key={rule.num} className="space-y-1.5">
            <div className="font-mono text-xs font-bold text-claude-terracotta">
              RULE #{rule.num}
            </div>
            <div className="font-serif text-base font-bold text-claude-text dark:text-claude-darkText">
              {rule.title}
            </div>
            <p className="text-xs text-claude-muted dark:text-claude-darkMuted leading-relaxed">
              {rule.desc}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
};

// Helper icon wrapper
function Code2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
    </svg>
  );
}
