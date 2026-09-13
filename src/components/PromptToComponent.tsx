import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Terminal, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Code2,
  Sliders,
  Flame,
  Coffee,
  GraduationCap,
  Layers
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface PromptOption {
  id: string;
  title: string;
  category: string;
  prompt: string;
  icon: React.ElementType;
}

export const PromptToComponent: React.FC = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('attendance');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [execStep, setExecStep] = useState<number>(4); // default 4 = complete

  // Mini-App 1 State: Attendance Calculator
  const [totalClasses, setTotalClasses] = useState<number>(64);
  const [attendedClasses, setAttendedClasses] = useState<number>(52);

  // Mini-App 2 State: SGPA Forecaster
  const [gradePoints, setGradePoints] = useState<number[]>([10, 9, 8, 9, 10]); // 5 subjects

  // Mini-App 3 State: Canteen Radar
  const [activeSpot, setActiveSpot] = useState<string>('canteen');

  const promptOptions: PromptOption[] = [
    {
      id: 'attendance',
      title: 'ISL 75% Attendance Guardian',
      category: 'Campus Survival',
      prompt: 'Build a live attendance defense calculator for ISL engineering students: track total conducted classes vs attended, and calculate exact safe bunks or required classes to maintain 75% Osmania University threshold.',
      icon: GraduationCap
    },
    {
      id: 'sgpa',
      title: 'Osmania SGPA & Grade Forecaster',
      category: 'Academics',
      prompt: 'Generate an interactive SGPA simulator for R22 regulation: 5 core engineering subjects with credit weighting, grade point sliders (O=10, A+=9, A=8, B+=7), and target honors cutoff predictor.',
      icon: Sliders
    },
    {
      id: 'canteen',
      title: 'Bandlaguda & Canteen Crowd Radar',
      category: 'Campus Life',
      prompt: 'Create a live crowd radar for ISLEC canteen and nearby tea spots in Bandlaguda. Show queue rush levels, live open/closed badges, and popular snacks available.',
      icon: Coffee
    }
  ];

  const handleSelectPrompt = (id: string) => {
    sounds.playClick();
    setSelectedPromptId(id);
    runExecution();
  };

  const runExecution = () => {
    sounds.playKey();
    setIsExecuting(true);
    setExecStep(1);

    setTimeout(() => {
      sounds.playKey();
      setExecStep(2);
    }, 400);

    setTimeout(() => {
      sounds.playKey();
      setExecStep(3);
    }, 900);

    setTimeout(() => {
      sounds.playSuccess();
      setExecStep(4);
      setIsExecuting(false);
    }, 1400);
  };

  // Calculations for Attendance Guardian
  const currentPct = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  // How many can bunk: (attended / (total + x)) >= 0.75 => x <= (attended - 0.75*total) / 0.75
  const safeSkips = Math.max(0, Math.floor((attendedClasses - 0.75 * totalClasses) / 0.75));
  // How many must attend: (attended + y) / (total + y) >= 0.75 => y >= (0.75*total - attended) / 0.25
  const neededClasses = Math.max(0, Math.ceil((0.75 * totalClasses - attendedClasses) / 0.25));

  // Calculation for SGPA
  const calculatedSGPA = (gradePoints.reduce((a, b) => a + b, 0) / gradePoints.length).toFixed(2);

  return (
    <section id="prompt-to-component" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCard border border-claude-terracottaBorder dark:border-claude-terracotta/30 text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3 shadow-sm">
          <Terminal className="w-3.5 h-3.5" />
          <span>PROMPT-TO-PROD SANDBOX</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-claude-text dark:text-claude-darkText tracking-tight mb-4">
          From Plain English to <span className="italic text-claude-terracotta">Live Interactive Code</span>
        </h2>
        <p className="text-sm sm:text-base text-claude-muted dark:text-claude-darkMuted leading-relaxed">
          Watch Claude Code take a natural language prompt and generate a working, stateful component in real time. Try switching prompts or testing the live widget.
        </p>
      </motion.div>

      {/* Split Screen Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Prompt & Terminal Workflow */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder p-6 shadow-claude-card">
          
          <div>
            <div className="flex items-center justify-between border-b border-claude-border dark:border-claude-darkBorder pb-3 mb-4">
              <span className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-claude-terracotta" />
                <span>Select Campus Prompt</span>
              </span>
              <span className="text-[10px] font-mono text-claude-muted">
                Claude 3.7 Sonnet CLI
              </span>
            </div>

            {/* Prompt Selector Buttons */}
            <div className="space-y-2.5 mb-5">
              {promptOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedPromptId === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectPrompt(opt.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-claude-terracotta/10 border-claude-terracotta text-claude-text dark:text-claude-darkText shadow-sm'
                        : 'bg-claude-bg dark:bg-claude-darkBg border-claude-border dark:border-claude-darkBorder text-claude-muted hover:text-claude-text'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-claude-terracotta text-white' : 'bg-claude-cardMuted dark:bg-claude-darkCard'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-serif font-bold">{opt.title}</div>
                        <div className="text-[10px] font-mono text-claude-muted">{opt.category}</div>
                      </div>
                    </div>

                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-claude-terracotta translate-x-0.5' : 'opacity-30'}`} />
                  </button>
                );
              })}
            </div>

            {/* Active Prompt Box */}
            <div className="p-3.5 rounded-2xl bg-claude-cardMuted/80 dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder mb-4 font-mono text-xs text-claude-text dark:text-claude-darkText leading-relaxed">
              <div className="text-[10px] text-claude-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-claude-terracotta" />
                <span>Active Natural Language Spec:</span>
              </div>
              &ldquo;{promptOptions.find(p => p.id === selectedPromptId)?.prompt}&rdquo;
            </div>
          </div>

          {/* Terminal Build Stepper */}
          <div className="pt-2">
            <div className="p-3.5 rounded-2xl bg-[#181715] text-[#E6E4DD] font-mono text-[11px] space-y-1.5 border border-[#2D2C28]">
              <div className="text-[#8C887B] text-[10px] flex items-center justify-between border-b border-[#2D2C28] pb-1.5 mb-1.5">
                <span>$ claude run component.tsx</span>
                <span className="text-emerald-400">● LIVE RUNTIME</span>
              </div>

              <div className={execStep >= 1 ? 'text-[#EDE7DF]' : 'text-[#6B6860]'}>
                {execStep >= 1 ? '✓ [1/4] Parsing natural language requirements...' : '○ [1/4] Queued...'}
              </div>
              <div className={execStep >= 2 ? 'text-[#EDE7DF]' : 'text-[#6B6860]'}>
                {execStep >= 2 ? '✓ [2/4] Synthesizing React 19 + Tailwind hooks...' : '○ [2/4] Pending syntax graph...'}
              </div>
              <div className={execStep >= 3 ? 'text-[#EDE7DF]' : 'text-[#6B6860]'}>
                {execStep >= 3 ? '✓ [3/4] Verifying campus bounds & state guards...' : '○ [3/4] Pending assertions...'}
              </div>
              <div className={execStep >= 4 ? 'text-emerald-400 font-bold' : 'text-[#6B6860]'}>
                {execStep >= 4 ? '⚡ [4/4] Compiled & mounted in 380ms' : '○ [4/4] Hot reload standby...'}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={runExecution}
                disabled={isExecuting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white text-xs font-mono font-semibold shadow-sm transition-all cursor-pointer"
              >
                {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isExecuting ? 'Synthesizing...' : 'Re-run Generation'}</span>
              </button>

              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Hallucinations</span>
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Live Rendered Interactive Mini-App */}
        <div className="lg:col-span-6 rounded-3xl bg-claude-card dark:bg-claude-darkCard border-2 border-claude-terracotta/30 p-6 sm:p-7 shadow-claude-card flex flex-col justify-between">
          
          <div>
            {/* Widget Top Bar */}
            <div className="flex items-center justify-between border-b border-claude-border dark:border-claude-darkBorder pb-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-claude-muted ml-1">
                  Preview: localhost:5173/sandbox
                </span>
              </div>

              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                INTERACTIVE WIDGET
              </span>
            </div>

            {/* WIDGET 1: ATTENDANCE GUARDIAN */}
            {selectedPromptId === 'attendance' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-serif text-xl font-bold text-claude-text dark:text-claude-darkText">
                    ISL Attendance Threshold Calculator
                  </h4>
                  <p className="text-xs text-claude-muted dark:text-claude-darkMuted mt-0.5">
                    Osmania University 75.0% Mandatory Attendance Gate
                  </p>
                </div>

                {/* Score Dial / Banner */}
                <div className={`p-4 rounded-2xl border text-center transition-colors ${
                  currentPct >= 75
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}>
                  <div className="text-3xl font-mono font-bold tracking-tight">
                    {currentPct.toFixed(1)}%
                  </div>
                  <div className="text-xs font-medium mt-1">
                    {currentPct >= 75
                      ? `Safe Zone! You can safely skip ${safeSkips} more classes.`
                      : `Warning! You must attend next ${neededClasses} classes to reach 75%.`}
                  </div>
                </div>

                {/* Interactive Sliders */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1 text-claude-muted">
                      <span>Total Conducted Lectures</span>
                      <span className="font-bold text-claude-text dark:text-claude-darkText">{totalClasses}</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={120}
                      value={totalClasses}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTotalClasses(val);
                        if (attendedClasses > val) setAttendedClasses(val);
                      }}
                      className="w-full accent-claude-terracotta cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1 text-claude-muted">
                      <span>Classes Attended</span>
                      <span className="font-bold text-claude-text dark:text-claude-darkText">{attendedClasses}</span>
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
              </div>
            )}

            {/* WIDGET 2: SGPA FORECASTER */}
            {selectedPromptId === 'sgpa' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-serif text-xl font-bold text-claude-text dark:text-claude-darkText">
                    Osmania SGPA Semester Forecaster
                  </h4>
                  <p className="text-xs text-claude-muted dark:text-claude-darkMuted mt-0.5">
                    Autonomous Credit Point Simulator (R22 Regulations)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-center">
                  <div className="text-3xl font-mono font-bold text-claude-terracotta dark:text-claude-amber">
                    {calculatedSGPA} <span className="text-sm font-sans text-claude-muted font-normal">/ 10.0</span>
                  </div>
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                    {Number(calculatedSGPA) >= 8.5 ? 'First Class with Distinction Pace 🏆' : 'First Class Standing 👍'}
                  </div>
                </div>

                {/* Subject sliders */}
                <div className="space-y-2 pt-1">
                  {['AI & Agentic Systems', 'Cloud & DevOps', 'Data Structures', 'Operating Systems', 'Design Lab'].map((sub, idx) => (
                    <div key={sub} className="flex items-center justify-between text-xs">
                      <span className="font-sans text-claude-text dark:text-claude-darkText w-36 truncate">{sub}</span>
                      <div className="flex items-center gap-2 flex-1 max-w-[180px]">
                        <input
                          type="range"
                          min={5}
                          max={10}
                          value={gradePoints[idx]}
                          onChange={(e) => {
                            const next = [...gradePoints];
                            next[idx] = Number(e.target.value);
                            setGradePoints(next);
                          }}
                          className="w-full accent-claude-terracotta cursor-pointer"
                        />
                        <span className="font-mono font-bold text-claude-terracotta w-6 text-right">
                          {gradePoints[idx]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WIDGET 3: CANTEEN RADAR */}
            {selectedPromptId === 'canteen' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-serif text-xl font-bold text-claude-text dark:text-claude-darkText">
                    Bandlaguda Food &amp; Chai Radar
                  </h4>
                  <p className="text-xs text-claude-muted dark:text-claude-darkMuted mt-0.5">
                    Real-time campus crowd tracker and quick menu search
                  </p>
                </div>

                {/* Spot selector */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'canteen', name: 'ISL Canteen', rush: 'Normal', time: '5m wait', color: 'emerald' },
                    { id: 'chai', name: 'Campus Gate Chai', rush: 'Packed', time: '12m wait', color: 'rose' },
                    { id: 'shawarma', name: 'Bandlaguda Point', rush: 'Chill', time: 'Zero wait', color: 'emerald' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSpot(s.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        activeSpot === s.id
                          ? 'bg-claude-terracotta/10 border-claude-terracotta'
                          : 'bg-claude-bg dark:bg-claude-darkBg border-claude-border dark:border-claude-darkBorder'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{s.name}</div>
                      <div className={`text-[10px] font-mono mt-0.5 text-${s.color}-600 font-medium`}>
                        ● {s.rush}
                      </div>
                      <div className="text-[9px] text-claude-muted font-mono">{s.time}</div>
                    </button>
                  ))}
                </div>

                {/* Live Menu Items for chosen spot */}
                <div className="p-3.5 rounded-2xl bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder space-y-2 text-xs">
                  <div className="flex justify-between font-mono text-[11px] text-claude-muted border-b border-claude-border dark:border-claude-darkBorder pb-1.5">
                    <span>POPULAR ITEM</span>
                    <span>STATUS</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Irani Chai &amp; Osmania Biscuit</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">FRESHLY BREWED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Veg / Chicken Biryani Plate</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">HOT &amp; READY</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Samosa &amp; Mirchi Bajji</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">AVAILABLE</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Widget Footer */}
          <div className="border-t border-claude-border dark:border-claude-darkBorder pt-3.5 mt-5 flex items-center justify-between text-xs text-claude-muted">
            <span className="font-mono text-[11px]">
              ⚡ React 19 State · Tailwind CSS
            </span>
            <span className="font-mono text-[11px] text-claude-terracotta font-semibold">
              Shipped via Claude Code
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
