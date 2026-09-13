import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, RefreshCw, CheckCircle2, GitCommit, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

export const TerminalDemo: React.FC = () => {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const tasks = [
    {
      title: 'Build Campus Food MVP',
      prompt: 'claude "build a full-stack campus food pre-ordering app with React, Tailwind, and Supabase"',
      steps: [
        { type: 'cmd', text: '$ claude "build full-stack campus food pre-ordering app"' },
        { type: 'agent', text: 'Claude Code v1.0.2 initializing agentic workflow...' },
        { type: 'tool', text: '● [Tool: inspect_workspace] Scanning project architecture and dependencies' },
        { type: 'tool', text: '● [Tool: create_file] Generating src/components/OrderFeed.tsx (84 lines)' },
        { type: 'tool', text: '● [Tool: create_file] Scaffolded Supabase real-time order status table' },
        { type: 'tool', text: '● [Tool: run_command] npm run build → Compiled successfully in 840ms' },
        { type: 'git', text: '$ git commit -m "feat: launch campus food order MVP with live status"' },
        { type: 'success', text: '✔ Deployed live to https://c3-campus-bites.vercel.app [HTTP 200 OK]' }
      ]
    },
    {
      title: 'Smart Attendance AI',
      prompt: 'claude "create an automated classroom attendance logger using OpenCV and FastAPI"',
      steps: [
        { type: 'cmd', text: '$ claude "create automated attendance logger with face verification"' },
        { type: 'agent', text: 'Analyzing camera stream latency and database models...' },
        { type: 'tool', text: '● [Tool: write_file] app/vision/face_pipeline.py (FaceNet embeddings)' },
        { type: 'tool', text: '● [Tool: write_file] app/api/attendance_router.py with batch CSV exports' },
        { type: 'tool', text: '● [Tool: run_test] pytest tests/test_recognition.py → 12/12 passed (0.42s)' },
        { type: 'git', text: '$ git commit -m "feat: real-time face verification attendance engine"' },
        { type: 'success', text: '✔ Service active on local network at port 8000. Ready for Lab deployment.' }
      ]
    },
    {
      title: 'Security Audit & Evals',
      prompt: 'claude "audit our SIH hackathon smart contract and REST endpoints for IDOR vulnerabilities"',
      steps: [
        { type: 'cmd', text: '$ claude "audit SIH hackathon codebase for security vulnerabilities"' },
        { type: 'agent', text: 'Running automated static analysis & threat modeling (STRIDE)...' },
        { type: 'tool', text: '● [Audit Alert] Found unauthenticated IDOR vulnerability in /api/v1/user/records' },
        { type: 'tool', text: '● [Tool: replace_file_content] Applied parameterized RBAC session validation' },
        { type: 'tool', text: '● [Tool: run_test] Penetration payload simulated → 403 Forbidden confirmed' },
        { type: 'git', text: '$ git commit -m "security: patch IDOR risk and add JWT auth guard"' },
        { type: 'success', text: '✔ Audit Report generated at security_audit.md (0 High, 0 Medium risks)' }
      ]
    }
  ];

  const currentTask = tasks[selectedTaskIndex];

  // Automated step progression when running
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isRunning && step < currentTask.steps.length - 1) {
      timer = setTimeout(() => {
        sounds.playKey();
        setStep((prev) => prev + 1);
      }, 700);
    } else if (step === currentTask.steps.length - 1) {
      sounds.playSuccess();
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, step, currentTask.steps.length]);

  const handleStartSimulation = () => {
    sounds.playClick();
    setStep(0);
    setIsRunning(true);
  };

  const handleSelectTask = (index: number) => {
    sounds.playClick();
    setSelectedTaskIndex(index);
    setStep(0);
    setIsRunning(true);
  };

  return (
    <section id="terminal" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3">
          <TerminalIcon className="w-3.5 h-3.5" />
          <span>TERMINAL WORKFLOW</span>
        </div>
        <h2 className="font-serif font-normal text-3xl sm:text-5xl text-claude-text dark:text-claude-darkText tracking-tight">
          Coding with Claude Code CLI.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-claude-muted dark:text-claude-darkMuted font-sans">
          This is what modern AI engineering looks like. We run terminal agents that read your files, write entire features, test for errors, and push to Git in seconds.
        </p>
      </div>

      {/* Preset Command Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
        {tasks.map((t, idx) => (
          <button
            key={t.title}
            onClick={() => handleSelectTask(idx)}
            className={`px-3.5 py-2 text-xs font-mono rounded-xl border transition-all duration-200 ${
              selectedTaskIndex === idx
                ? 'bg-claude-terracotta text-white border-claude-terracotta shadow-sm'
                : 'bg-claude-card dark:bg-claude-darkCard text-claude-text dark:text-claude-darkText border-claude-border dark:border-claude-darkBorder hover:border-claude-terracotta'
            }`}
          >
            {t.title}
          </button>
        ))}

        <button
          onClick={handleStartSimulation}
          title="Re-run simulation"
          className="px-3 py-2 text-xs font-mono rounded-xl bg-claude-cardMuted dark:bg-claude-darkCardMuted border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText hover:text-claude-terracotta flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-claude-terracotta' : ''}`} />
          <span>Re-run</span>
        </button>
      </div>

      {/* Terminal Window Container */}
      <div className="rounded-2xl border border-claude-border dark:border-[#2E2B26] overflow-hidden bg-[#1E1C1A] text-[#F5F2EB] shadow-2xl font-mono text-xs sm:text-sm">
        
        {/* Terminal Title Bar */}
        <div className="px-4 py-3 bg-[#181615] border-b border-[#2A2825] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E06C75]/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#E5C07B]/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#98C379]/80 inline-block"></span>
            <span className="ml-2 text-xs text-[#99928A]">claude-code-cli · isl-c3-chapter</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#A39B91]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>claude-3.7-sonnet</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 sm:p-6 space-y-3 min-h-[300px]">
          {currentTask.steps.slice(0, step + 1).map((s, i) => {
            if (s.type === 'cmd') {
              return (
                <div key={i} className="text-claude-amber font-bold flex items-center gap-2">
                  <span className="text-[#99928A]">{'>'}</span>
                  <span>{s.text}</span>
                </div>
              );
            }
            if (s.type === 'agent') {
              return (
                <div key={i} className="text-[#C2BAAF] italic flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-claude-terracotta animate-spin" />
                  <span>{s.text}</span>
                </div>
              );
            }
            if (s.type === 'tool') {
              return (
                <div key={i} className="text-[#E0DDD5] pl-4 border-l-2 border-claude-terracotta/40 py-0.5">
                  {s.text}
                </div>
              );
            }
            if (s.type === 'git') {
              return (
                <div key={i} className="text-[#61AFEF] flex items-center gap-2 pt-1 font-semibold">
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>{s.text}</span>
                </div>
              );
            }
            if (s.type === 'success') {
              return (
                <div key={i} className="text-[#98C379] font-bold flex items-center gap-2 pt-2 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{s.text}</span>
                </div>
              );
            }
            return null;
          })}

          {/* Blinking Cursor */}
          {isRunning && (
            <div className="flex items-center gap-1 text-claude-amber">
              <span className="w-2.5 h-4 bg-claude-terracotta animate-pulse inline-block"></span>
            </div>
          )}
        </div>

        {/* Terminal Bottom Controls */}
        <div className="px-4 py-2.5 bg-[#181615] border-t border-[#2A2825] flex items-center justify-between text-[11px] text-[#8C847B]">
          <span>Tip: In C3 lab sessions, every student gets terminal AI agent environments set up on day one.</span>
          <span className="hidden sm:inline">Press Re-run to restart</span>
        </div>

      </div>

    </section>
  );
};
