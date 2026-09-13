import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Terminal, 
  Clock, 
  Sparkles, 
  GraduationCap, 
  Coffee, 
  Sliders,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { TiltCard } from './animations/TiltCard';

interface CampusSolversProps {
  onOpenApply: () => void;
}

export const CampusSolvers: React.FC<CampusSolversProps> = ({ onOpenApply }) => {
  const [activePromptId, setActivePromptId] = useState<string | null>(null);

  // Live mini attendance calculator state inside card 1
  const [totalClasses, setTotalClasses] = useState<number>(64);
  const [attendedClasses, setAttendedClasses] = useState<number>(52);

  const currentPct = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  const safeSkips = Math.max(0, Math.floor((attendedClasses - 0.75 * totalClasses) / 0.75));
  const neededClasses = Math.max(0, Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25));

  const solvers = [
    {
      id: 'attendance',
      title: 'ISL Attendance Guardian',
      category: 'Campus Survival',
      icon: GraduationCap,
      problem: 'Mandatory 75% Osmania University attendance threshold causes constant exam condonation panic and guesswork.',
      solution: 'Live calculator telling you the exact number of consecutive lectures you must attend or can safely skip.',
      buildTime: '42 mins',
      stack: ['React 19', 'Tailwind', 'Claude 3.7'],
      prompt: 'Build a zero-fluff attendance calculator for ISL engineering students: input total conducted lectures and attended ones. Calculate exact safe skips vs. required classes to maintain 75.01% with emergency condonation warnings.',
      metric: 'Saved 340+ hours of student panic',
      isInteractive: true
    },
    {
      id: 'sgpa',
      title: 'Osmania SGPA & Grade Forecaster',
      category: 'Academics',
      icon: Sliders,
      problem: 'Students have no idea how internal marks and lab credits affect their final university semester CGPA.',
      solution: 'Autonomous syllabus credit weighting simulator with interactive grade sliders and target CGPA calculator.',
      buildTime: '55 mins',
      stack: ['Next.js', 'TypeScript', 'Supabase'],
      prompt: 'Create an Osmania University SGPA/CGPA simulator tailored to ISLEC R22 regulation subject credits with interactive grade sliders and live internal marks optimization.',
      metric: 'Used by 280+ students before internals',
      isInteractive: false
    },
    {
      id: 'canteen',
      title: 'Bandlaguda & Canteen Chow Radar',
      category: 'Campus Life',
      icon: Coffee,
      problem: 'Walking down to the canteen during short breaks only to find massive queues or your favorite snack sold out.',
      solution: 'Lightweight crowd rush indicator, daily menu board, and popular tea/chai spots tracker around Bandlaguda campus.',
      buildTime: '48 mins',
      stack: ['React', 'Claude Vision', 'Leaflet'],
      prompt: 'Build a real-time campus crowd radar for ISLEC canteen and Bandlaguda food spots. Include crowd status indicator (Chill, Busy, Packed), quick menu search, and operating hours.',
      metric: '100% zero wasted lunch breaks',
      isInteractive: false
    },
    {
      id: 'pyq',
      title: 'FastNotes & University PYQ Solver',
      category: 'Academics',
      icon: CheckCircle,
      problem: 'Past 5-year university exam question papers are buried in unstructured PDFs and chaotic WhatsApp groups.',
      solution: 'Claude-powered semantic search that solves previous university questions with step-by-step engineering answers.',
      buildTime: '58 mins',
      stack: ['FastAPI', 'Claude Code CLI', 'VectorDB'],
      prompt: 'Create an instant exam prep assistant for Osmania engineering students: parse university question papers and generate structured 5-mark and 10-mark revision notes with diagrams.',
      metric: 'Indexed 50+ previous exam papers',
      isInteractive: false
    }
  ];

  const togglePrompt = (id: string) => {
    sounds.playClick();
    setActivePromptId(prev => prev === id ? null : id);
  };

  return (
    <section id="campus-solvers" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCard border border-claude-terracottaBorder dark:border-claude-terracotta/30 text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3 shadow-sm">
          <Rocket className="w-3.5 h-3.5" />
          <span>BUILT IN 60 MINS WITH CLAUDE CODE</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-claude-text dark:text-claude-darkText tracking-tight mb-4">
          What We Ship: <span className="italic text-claude-terracotta">Real Campus Solutions</span>
        </h2>
        <p className="text-sm sm:text-base text-claude-muted dark:text-claude-darkMuted leading-relaxed">
          No abstract textbook theory. Every tool here was built by students in the C3 Office to solve actual friction on our campus.
        </p>
      </motion.div>

      {/* 4 Bento Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {solvers.map((item) => {
          const Icon = item.icon;
          const isPromptOpen = activePromptId === item.id;

          return (
            <TiltCard
              key={item.id}
              className="p-6 sm:p-7 rounded-3xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder shadow-claude-card flex flex-col justify-between"
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCard border border-claude-terracottaBorder dark:border-claude-terracotta/30 text-[11px] font-mono text-claude-terracotta dark:text-claude-amber font-semibold">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.category}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-mono text-claude-muted dark:text-claude-darkMuted">
                    <Clock className="w-3.5 h-3.5 text-claude-terracotta" />
                    <span>{item.buildTime}</span>
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-claude-text dark:text-claude-darkText mb-2">
                  {item.title}
                </h3>

                {/* Problem & Solution */}
                <div className="space-y-2 mb-4 text-xs leading-relaxed">
                  <p className="text-claude-muted dark:text-claude-darkMuted">
                    <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">Problem: </span>
                    {item.problem}
                  </p>
                  <p className="text-claude-text dark:text-claude-darkText font-medium">
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">Solution: </span>
                    {item.solution}
                  </p>
                </div>

                {/* Interactive Slider Widget for Attendance Card */}
                {item.isInteractive && (
                  <div className="p-4 rounded-2xl bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder my-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                        Live Calculator Preview
                      </span>
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        currentPct >= 75 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {currentPct.toFixed(1)}% · {currentPct >= 75 ? `Safe (+${safeSkips} bunks)` : `Need ${neededClasses} classes`}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-claude-muted mb-1">
                        <span>Total Conducted: {totalClasses}</span>
                        <span>Attended: {attendedClasses}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={totalClasses}
                        value={attendedClasses}
                        onChange={(e) => setAttendedClasses(Number(e.target.value))}
                        className="w-full accent-claude-terracotta cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-[11px] font-mono text-claude-muted dark:text-claude-darkMuted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom: Impact Metric & Prompt Toggle */}
              <div className="pt-3 border-t border-claude-border dark:border-claude-darkBorder">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ {item.metric}
                  </span>

                  <button
                    onClick={() => togglePrompt(item.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-claude-terracotta hover:underline cursor-pointer"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>{isPromptOpen ? 'Hide Prompt' : 'View Prompt'}</span>
                    {isPromptOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Expandable Prompt Snippet */}
                <AnimatePresence>
                  {isPromptOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5 p-3 rounded-xl bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder font-mono text-[11px] text-claude-text dark:text-claude-darkText leading-relaxed select-all"
                    >
                      <div className="text-[9px] text-claude-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-claude-terracotta" />
                        <span>Claude Code Prompt:</span>
                      </div>
                      &ldquo;{item.prompt}&rdquo;
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </TiltCard>
          );
        })}
      </div>

      {/* Callout Box: What problem will YOU solve? */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder flex flex-col sm:flex-row items-center justify-between gap-6 shadow-claude-card text-center sm:text-left">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-claude-text dark:text-claude-darkText">
            Have a campus problem you&apos;re tired of dealing with?
          </h3>
          <p className="text-xs sm:text-sm text-claude-muted dark:text-claude-darkMuted mt-1">
            Walk into the C3 Office between 10:00 AM and 1:00 PM (Mon – Thu). We&apos;ll help you ship the working solution before the week ends.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenApply();
          }}
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-medium text-sm shadow-md hover:shadow-claude-glow transition-all cursor-pointer"
        >
          <Rocket className="w-4 h-4" />
          <span>Pitch a Campus Friction</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </section>
  );
};
