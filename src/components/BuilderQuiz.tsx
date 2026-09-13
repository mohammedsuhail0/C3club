import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, Code2, Cpu, Check, ArrowRight, Zap, Target } from 'lucide-react';
import { sounds } from '../utils/audio';

interface BuilderQuizProps {
  onOpenApply: () => void;
}

export const BuilderQuiz: React.FC<BuilderQuizProps> = ({ onOpenApply }) => {
  const [selectedPersona, setSelectedPersona] = useState<number>(0);

  const personas = [
    {
      id: 0,
      badge: 'LEVEL 01 · ANY BRANCH',
      title: 'The Vibe Architect',
      subtitle: 'Zero prior coding needed. Turn plain English into real apps.',
      who: '1st & 2nd Years, Civil/Mech/ECE students, or anyone who has an idea but gets stuck on syntax.',
      icon: Sparkles,
      color: '#CC5A36',
      weeklyRoadmap: [
        { day: 'Mon 10 AM', action: 'Idea & Spec writing with Claude 3.7 (Zero-shot system prompting)' },
        { day: 'Tue 10 AM', action: 'UI generation using Tailwind & modern component libraries' },
        { day: 'Wed 10 AM', action: 'Wiring live backend data and forms in plain natural language' },
        { day: 'Thu 10 AM', action: 'Deploying live on Vercel with a custom URL to share on LinkedIn' }
      ],
      firstShip: 'A live personal portfolio or interactive campus problem-solver'
    },
    {
      id: 1,
      badge: 'LEVEL 02 · ACADEMIC CODERS',
      title: 'The CLI Agent Shipper',
      subtitle: 'Escape outdated textbook C/Java. Ship with terminal AI agents.',
      who: 'Students who know basic syntax from college classes but have never deployed a real full-stack web application.',
      icon: Terminal,
      color: '#D97757',
      weeklyRoadmap: [
        { day: 'Mon 10 AM', action: 'Claude Code CLI setup, terminal hygiene, and multi-file codebases' },
        { day: 'Tue 10 AM', action: 'Trunk-based Git workflows: writing specs, tests, and auto-refactoring' },
        { day: 'Wed 10 AM', action: 'Integrating REST APIs, Postgres/Supabase database schemas' },
        { day: 'Thu 10 AM', action: 'Automated CI/CD testing pipelines and production deploy' }
      ],
      firstShip: 'Automated attendance/grade predictor CLI tool + full web dashboard'
    },
    {
      id: 2,
      badge: 'LEVEL 03 · ADVANCED BUILDERS',
      title: 'Autonomous Systems Lead',
      subtitle: 'Agent loops, MCP servers, and full-scale product infrastructure.',
      who: 'Fullstack developers, hackathon competitors, and engineers ready to build commercial-grade SaaS.',
      icon: Cpu,
      color: '#B54C2B',
      weeklyRoadmap: [
        { day: 'Mon 10 AM', action: 'Model Context Protocol (MCP) server architecture & custom tool creation' },
        { day: 'Tue 10 AM', action: 'Multi-agent orchestration, evaluation benchmarks, and token caching' },
        { day: 'Wed 10 AM', action: 'Vector embeddings, RAG knowledge retrieval, and edge runtimes' },
        { day: 'Thu 10 AM', action: 'High-throughput stress-testing and open-source release' }
      ],
      firstShip: 'A custom Model Context Protocol (MCP) server or multi-agent autonomous system'
    }
  ];

  const current = personas[selectedPersona];
  const Icon = current.icon;

  return (
    <section id="builder-quiz" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCard border border-claude-terracottaBorder dark:border-claude-terracotta/30 text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3 shadow-sm">
          <Target className="w-3.5 h-3.5" />
          <span>EVERYONE STARTS SOMEWHERE · NO PREREQUISITES</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-claude-text dark:text-claude-darkText tracking-tight mb-4">
          Find Your <span className="italic text-claude-terracotta">Builder Persona</span>
        </h2>
        <p className="text-sm sm:text-base text-claude-muted dark:text-claude-darkMuted leading-relaxed">
          Whether you&apos;ve never written a single line of code or you live inside the terminal, there is a dedicated track for you every Monday through Thursday in the C3 Office.
        </p>
      </motion.div>

      {/* Persona Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {personas.map((persona) => {
          const PIcon = persona.icon;
          const isSelected = selectedPersona === persona.id;

          return (
            <button
              key={persona.id}
              onClick={() => {
                sounds.playClick();
                setSelectedPersona(persona.id);
              }}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3.5 ${
                isSelected
                  ? 'bg-claude-card dark:bg-claude-darkCard border-claude-terracotta shadow-md scale-[1.02]'
                  : 'bg-claude-card/50 dark:bg-claude-darkCard/50 border-claude-border dark:border-claude-darkBorder hover:border-claude-border/80'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl transition-colors ${
                  isSelected ? 'bg-claude-terracotta text-white' : 'bg-claude-cardMuted dark:bg-claude-darkBg text-claude-muted'
                }`}
              >
                <PIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-claude-muted uppercase tracking-wider">
                  {persona.badge}
                </div>
                <div className="font-serif font-bold text-sm text-claude-text dark:text-claude-darkText">
                  {persona.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Persona Detail Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder p-6 sm:p-8 shadow-claude-card"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Persona Details */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCard text-xs font-mono text-claude-terracotta dark:text-claude-amber font-semibold border border-claude-terracottaBorder dark:border-claude-terracotta/30">
                <Icon className="w-3.5 h-3.5" />
                <span>{current.badge}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-claude-text dark:text-claude-darkText">
                {current.title}
              </h3>

              <p className="text-sm sm:text-base text-claude-text dark:text-claude-darkText font-medium">
                {current.subtitle}
              </p>

              <div className="p-3.5 rounded-xl bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-xs text-claude-muted dark:text-claude-darkMuted leading-relaxed">
                <span className="font-semibold text-claude-text dark:text-claude-darkText font-mono">Who this is for: </span>
                {current.who}
              </div>

              <div className="pt-2">
                <div className="text-xs font-mono uppercase text-claude-muted tracking-wider mb-1">
                  Expected Week 1 Outcome:
                </div>
                <div className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Zap className="w-4 h-4" />
                  <span>{current.firstShip}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenApply();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-claude-glow transition-all cursor-pointer"
                >
                  <span>Apply with this Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Mon-Thu 10 AM - 1 PM Sprint Roadmap */}
            <div className="lg:col-span-6 bg-claude-cardMuted/60 dark:bg-claude-darkBg p-5 sm:p-6 rounded-2xl border border-claude-border dark:border-claude-darkBorder">
              <div className="flex items-center justify-between border-b border-claude-border dark:border-claude-darkBorder pb-3 mb-4">
                <span className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText uppercase tracking-wider">
                  Weekly Mon–Thu Sprint (10 AM – 1 PM)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-claude-terracotta/10 text-claude-terracotta font-semibold">
                  C3 Campus Office
                </span>
              </div>

              <div className="space-y-3">
                {current.weeklyRoadmap.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="shrink-0 font-mono font-bold text-claude-terracotta dark:text-claude-amber w-20 pt-0.5">
                      {step.day}
                    </span>
                    <div className="flex-1 text-claude-muted dark:text-claude-darkMuted leading-relaxed">
                      {step.action}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-claude-border dark:border-claude-darkBorder flex items-center justify-between text-[11px] font-mono text-claude-muted">
                <span>⚡ Laptops open, hands on keys</span>
                <span className="text-claude-terracotta font-semibold">Batch 01 Core</span>
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

    </section>
  );
};
