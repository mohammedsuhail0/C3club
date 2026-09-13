import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  Terminal, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  GraduationCap, 
  Coffee, 
  Car, 
  Briefcase, 
  BookOpen, 
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { TiltCard } from './animations/TiltCard';

interface ShipWallProps {
  onOpenApply: () => void;
}

interface Project {
  id: string;
  title: string;
  category: 'campus' | 'academics' | 'ai-tools';
  categoryLabel: string;
  problem: string;
  solution: string;
  buildTime: string;
  stack: string[];
  prompt: string;
  icon: React.ElementType;
  metric: string;
}

export const ShipWall: React.FC<ShipWallProps> = ({ onOpenApply }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'campus' | 'academics' | 'ai-tools'>('all');
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);

  const projects: Project[] = [
    {
      id: 'attendance-guardian',
      title: 'ISL Attendance Guardian',
      category: 'campus',
      categoryLabel: 'Campus Life',
      icon: GraduationCap,
      problem: 'Mandatory 75% Osmania University attendance threshold causes constant exam condonation panic and guesswork.',
      solution: 'Live calculator telling you the exact number of consecutive lectures you must attend or can safely skip.',
      buildTime: '42 mins',
      stack: ['React', 'Tailwind CSS', 'Claude 3.7'],
      prompt: 'Build a zero-fluff attendance calculator for ISL engineering students: input total conducted lectures and attended ones. Calculate exact safe skips vs. required classes to maintain 75.01% with emergency condonation warnings.',
      metric: 'Saved 340+ hours of student anxiety'
    },
    {
      id: 'sgpa-forecaster',
      title: 'Osmania SGPA & CGPA Forecaster',
      category: 'academics',
      categoryLabel: 'Academics',
      icon: BookOpen,
      problem: 'Students have no idea how their internal exam marks and lab credits impact final university semester grades.',
      solution: 'Autonomous syllabus credit weighting simulator with interactive grade sliders and target CGPA calculator.',
      buildTime: '55 mins',
      stack: ['Next.js', 'TypeScript', 'Supabase'],
      prompt: 'Create an Osmania University SGPA/CGPA simulator tailored to ISLEC R22 regulation subject credits. Include interactive grade sliders (O, A+, A, B+) and live internal marks optimization.',
      metric: 'Used by 280+ students before internals'
    },
    {
      id: 'canteen-radar',
      title: 'Bandlaguda & Canteen Chow Radar',
      category: 'campus',
      categoryLabel: 'Campus Life',
      icon: Coffee,
      problem: 'Walking down to the canteen during short breaks only to find massive queues or your favorite snack sold out.',
      solution: 'Lightweight crowd rush indicator, daily menu board, and popular tea/chai spots tracker around Bandlaguda campus.',
      buildTime: '48 mins',
      stack: ['React', 'Claude Vision', 'Leaflet'],
      prompt: 'Build a real-time campus crowd radar for ISLEC canteen and Bandlaguda food spots. Include crowd status indicator (Chill, Busy, Packed), quick menu search, and operating hours.',
      metric: '100% zero wasted lunch breaks'
    },
    {
      id: 'fastnotes-pyq',
      title: 'FastNotes & University PYQ Solver',
      category: 'academics',
      categoryLabel: 'Academics',
      icon: CheckCircle,
      problem: 'Past 5-year university exam question papers are buried in unstructured PDFs and chaotic WhatsApp groups.',
      solution: 'Claude-powered semantic search that solves previous university questions with step-by-step engineering answers.',
      buildTime: '58 mins',
      stack: ['FastAPI', 'Claude Code CLI', 'VectorDB'],
      prompt: 'Create an instant exam prep assistant for Osmania engineering students: parse university question papers and generate structured 5-mark and 10-mark revision notes with circuit/logic diagrams.',
      metric: 'Indexed 50+ previous exam papers'
    },
    {
      id: 'campus-carpool',
      title: 'Old City & Campus Commute Link',
      category: 'campus',
      categoryLabel: 'Campus Life',
      icon: Car,
      problem: 'Day-scholars commuting from Charminar, Chandrayangutta, Mehdipatnam & Falaknuma waste money on solo autos.',
      solution: 'Student-verified ride board matching batchmates along the same route for split autos and carpools.',
      buildTime: '50 mins',
      stack: ['React 19', 'Supabase', 'Telegram Bot'],
      prompt: 'Build a private college commute coordination board for ISL day-scholars. Allow students to post route, pickup time, and seat availability (shared auto or bike) with college email verification.',
      metric: '420 hrs estimated monthly transit savings'
    },
    {
      id: 'placement-roaster',
      title: 'Placement Resume Roaster & Mock HR',
      category: 'ai-tools',
      categoryLabel: 'AI Tool',
      icon: Briefcase,
      problem: 'Generic textbook resumes get instantly rejected by campus placement ATS algorithms without feedback.',
      solution: 'AI interviewer that roasts weak bullet points and simulates a 5-minute technical screening with live scoring.',
      buildTime: '45 mins',
      stack: ['Claude 3.7 Sonnet', 'Vite', 'Web Audio'],
      prompt: 'Build an aggressive but constructive placement interview prep tool: student uploads project bullets, Claude pinpoints fluff, and fires 3 sharp architectural follow-ups with feedback.',
      metric: '92% students improved their project bullet points'
    }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const togglePrompt = (id: string) => {
    sounds.playClick();
    setExpandedPromptId(prev => prev === id ? null : id);
  };

  return (
    <section id="ship-wall" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCard border border-claude-terracottaBorder dark:border-claude-terracotta/30 text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3 shadow-sm">
          <Rocket className="w-3.5 h-3.5" />
          <span>PROOF OVER PROMISES · BUILT IN 60 MINS</span>
        </div>
        
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-claude-text dark:text-claude-darkText tracking-tight mb-4">
          The Ship Wall: <span className="italic text-claude-terracotta">Solutions That Actually Work</span>
        </h2>
        
        <p className="text-sm sm:text-base text-claude-muted dark:text-claude-darkMuted leading-relaxed">
          No hypothetical slide decks or abstract theory. Every tool here was built by students to solve real friction on our campus using Claude Code.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {[
            { id: 'all', label: 'All Projects (6)' },
            { id: 'campus', label: 'Campus Life' },
            { id: 'academics', label: 'Academics & Exams' },
            { id: 'ai-tools', label: 'AI & Placement Tools' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setActiveFilter(tab.id as any);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-claude-terracotta text-white font-semibold shadow-sm'
                  : 'bg-claude-card dark:bg-claude-darkCard text-claude-muted hover:text-claude-text border border-claude-border dark:border-claude-darkBorder'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid of Shipped Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, idx) => {
            const Icon = project.icon;
            const isExpanded = expandedPromptId === project.id;

            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <TiltCard className="h-full rounded-2xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder p-5 sm:p-6 shadow-claude-card flex flex-col justify-between hover:border-claude-terracotta/50 transition-colors group">
                  
                  <div>
                    {/* Top Row: Category + Build Time */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCard border border-claude-terracottaBorder dark:border-claude-terracotta/30 text-[11px] font-mono text-claude-terracotta dark:text-claude-amber font-semibold">
                        <Icon className="w-3 h-3" />
                        <span>{project.categoryLabel}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-claude-muted dark:text-claude-darkMuted">
                        <Clock className="w-3 h-3 text-claude-terracotta" />
                        <span>{project.buildTime}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl font-bold text-claude-text dark:text-claude-darkText group-hover:text-claude-terracotta transition-colors mb-2">
                      {project.title}
                    </h3>

                    {/* Problem & Solution */}
                    <div className="space-y-2 mb-4 text-xs leading-relaxed">
                      <p className="text-claude-muted dark:text-claude-darkMuted">
                        <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">Problem: </span>
                        {project.problem}
                      </p>
                      <p className="text-claude-text dark:text-claude-darkText font-medium">
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">Solution: </span>
                        {project.solution}
                      </p>
                    </div>

                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.stack.map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-[10px] font-mono text-claude-muted dark:text-claude-darkMuted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Impact Metric + Expandable Kickoff Prompt */}
                  <div className="border-t border-claude-border dark:border-claude-darkBorder pt-3 mt-auto">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {project.metric}
                      </span>
                      
                      <button
                        onClick={() => togglePrompt(project.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-claude-terracotta hover:underline cursor-pointer"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>{isExpanded ? 'Hide Prompt' : 'View Prompt'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Expandable Prompt Block */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 p-2.5 rounded-xl bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder font-mono text-[11px] text-claude-text dark:text-claude-darkText leading-relaxed select-all"
                        >
                          <div className="text-[9px] text-claude-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-claude-terracotta" />
                            <span>Claude Code Kickoff Prompt:</span>
                          </div>
                          &ldquo;{project.prompt}&rdquo;
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Callout Box: What problem will YOU solve? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-claude-card via-claude-cardMuted to-claude-card dark:from-claude-darkCard dark:via-claude-darkBg dark:to-claude-darkCard border border-claude-border dark:border-claude-darkBorder flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left"
      >
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
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-medium text-sm shadow-md hover:shadow-claude-glow transition-all cursor-pointer"
        >
          <Rocket className="w-4 h-4" />
          <span>Pitch a Campus Problem</span>
        </button>
      </motion.div>

    </section>
  );
};
