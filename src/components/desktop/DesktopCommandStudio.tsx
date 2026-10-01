import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Terminal,
  Rocket,
  Layers,
  Calendar,
  Sparkles,
  ExternalLink,
  Shield,
  MapPin,
  Clock,
  ArrowRight,
  Command,
  ChevronRight,
  Volume2,
  VolumeX
} from 'lucide-react';
import { FoundingPass } from '../FoundingPass';
import { TerminalDemo } from '../TerminalDemo';
import { ShipWall } from '../ShipWall';
import { WhatIsC3 } from '../WhatIsC3';
import { EventsWeek1 } from '../EventsWeek1';
import { sounds } from '../../utils/audio';

interface DesktopCommandStudioProps {
  onOpenApply: () => void;
  onOpenOrganizer: () => void;
  activePassKey?: string;
  onToggleFullSite?: () => void;
}

type StudioTab = 'pass' | 'terminal' | 'ships' | 'pillars' | 'events';

export const DesktopCommandStudio: React.FC<DesktopCommandStudioProps> = ({
  onOpenApply,
  onOpenOrganizer,
  activePassKey,
  onToggleFullSite,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('code=') || search.includes('fnd=') || search.includes('key=')) {
        return 'pass';
      }
    }
    return 'pass';
  });

  // Keyboard navigation shortcuts [1] to [5]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === '1') {
        sounds.playClick();
        setActiveTab('pass');
      } else if (e.key === '2') {
        sounds.playClick();
        setActiveTab('terminal');
      } else if (e.key === '3') {
        sounds.playClick();
        setActiveTab('ships');
      } else if (e.key === '4') {
        sounds.playClick();
        setActiveTab('pillars');
      } else if (e.key === '5') {
        sounds.playClick();
        setActiveTab('events');
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sounds.playSuccess();
        onOpenApply();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenApply]);

  const tabs = [
    {
      id: 'pass' as StudioTab,
      label: 'Founder Pass',
      badge: 'Interactive PVC',
      icon: CreditCard,
      description: '3D landscape PVC pass generator with pure key auth & QR verification',
      keyHint: '1',
    },
    {
      id: 'terminal' as StudioTab,
      label: 'Claude Code CLI',
      badge: 'Live Simulator',
      icon: Terminal,
      description: 'Real-time terminal simulation of building & shipping with Claude CLI',
      keyHint: '2',
    },
    {
      id: 'ships' as StudioTab,
      label: 'Weekly Ships',
      badge: 'Live Apps',
      icon: Rocket,
      description: 'Campus problem solver applications shipped live every Friday',
      keyHint: '3',
    },
    {
      id: 'pillars' as StudioTab,
      label: 'Pillars & Routine',
      badge: '10 AM – 1 PM',
      icon: Layers,
      description: 'The 4 foundations and morning lab routine at Innovation Lab 3',
      keyHint: '4',
    },
    {
      id: 'events' as StudioTab,
      label: 'Week 1 Sprints',
      badge: 'Curriculum',
      icon: Calendar,
      description: '4-day onboarding sprint from CLI setup to first live deployment',
      keyHint: '5',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FAF8F5] dark:bg-[#151412] text-claude-text dark:text-claude-darkText">
      
      {/* 1. Top Enterprise Status Ribbon */}
      <header className="w-full h-14 border-b border-[#E0DCD3] dark:border-claude-darkBorder bg-[#FAF8F5]/90 dark:bg-[#151412]/90 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0 select-none">
        
        {/* Left: Brand Identity & Live Pulse */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/c3_emblem_trans.png"
              alt="C3 Logo"
              className="w-7 h-7 object-contain drop-shadow-sm"
            />
            <span className="font-mono font-bold text-sm tracking-wider text-[#B8431E] dark:text-[#E07A5F]">
              C3 // CLAUDE CODE &amp; COWORK
            </span>
          </div>

          <div className="h-4 w-px bg-black/10 dark:bg-white/10" />

          <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-claude-muted dark:text-claude-darkMuted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CAMPUS LAB 3 · MON–THU 10:00 AM – 1:00 PM</span>
            <span className="opacity-60">· Dept. of IT, ISLEC Autonomous</span>
          </div>
        </div>

        {/* Right: Quick Actions & Live Cohort Stats */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-700 dark:text-amber-400">
            <span className="font-bold">COHORT 01:</span>
            <span>28 / 30 SEATS CLAIMED</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenApply();
            }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-mono text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>APPLY (BATCH 01)</span>
            <span className="hidden xl:inline text-[10px] opacity-75 bg-black/20 px-1 rounded">⌘K</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenOrganizer();
            }}
            className="px-3 py-1.5 rounded-xl border border-claude-border dark:border-claude-darkBorder hover:border-claude-terracotta text-xs font-mono text-claude-muted dark:text-claude-darkMuted hover:text-claude-text transition-all cursor-pointer"
          >
            ADMIN
          </button>

          {onToggleFullSite && (
            <button
              onClick={() => {
                sounds.playClick();
                onToggleFullSite();
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-claude-border dark:border-claude-darkBorder hover:border-[#CC5A36] text-xs font-mono text-claude-muted dark:text-claude-darkMuted hover:text-[#CC5A36] transition-all cursor-pointer"
              title="Switch to full-page scrolling layout"
            >
              <span>Full Site</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Studio Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT CONSOLE / NAVIGATOR (Width: ~340px) */}
        <aside className="w-[340px] xl:w-[380px] border-r border-[#E0DCD3] dark:border-claude-darkBorder bg-[#F7F4EE] dark:bg-[#181715] flex flex-col justify-between shrink-0 p-5 overflow-y-auto select-none">
          
          <div className="space-y-6">
            
            {/* Mission Statement */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-black/25 border border-[#E0DCD3] dark:border-white/5 space-y-1.5">
              <span className="font-mono text-[10px] tracking-widest uppercase text-claude-terracotta font-bold block">
                AUTONOMOUS BUILDER COLLECTIVE
              </span>
              <h2 className="font-serif text-lg font-bold text-claude-text dark:text-claude-darkText leading-tight">
                Ship Real Software Every Week. Zero Slides.
              </h2>
              <p className="text-xs text-claude-muted dark:text-claude-darkMuted font-sans leading-relaxed">
                A morning software collective for students learning Claude Code CLI, prompt architecture, and launching micro-SaaS MVPs.
              </p>
            </div>

            {/* Interactive Studio Workspace Tabs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-mono font-bold text-claude-muted uppercase tracking-wider">
                <span>STUDIO WORKSPACES</span>
                <span>SHORTCUT</span>
              </div>

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab(tab.id);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all duration-200 flex items-start justify-between gap-3 cursor-pointer group ${
                      isActive
                        ? 'bg-claude-terracotta text-white shadow-md'
                        : 'bg-white/40 dark:bg-black/10 hover:bg-white dark:hover:bg-black/25 border border-[#E0DCD3]/70 dark:border-white/5 text-claude-text dark:text-claude-darkText'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-claude-terracotta/10 text-claude-terracotta'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm tracking-tight truncate">
                            {tab.label}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#CC5A36]/10 text-[#CC5A36] dark:text-[#E07A5F]'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isActive ? 'text-white/80' : 'text-claude-muted dark:text-claude-darkMuted'
                          }`}
                        >
                          {tab.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-mono text-xs px-1.5 py-0.5 rounded border shrink-0 ${
                        isActive
                          ? 'border-white/30 text-white bg-white/10'
                          : 'border-black/10 dark:border-white/10 text-claude-muted'
                      }`}
                    >
                      [{tab.keyHint}]
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timings & Location Widget */}
            <div className="p-3.5 rounded-xl bg-white/50 dark:bg-black/20 border border-[#E0DCD3] dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#CC5A36]">
                <Clock className="w-3.5 h-3.5" />
                <span>ROUTINE: MON–THU · 10 AM – 1 PM</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-claude-muted dark:text-claude-darkMuted">
                <MapPin className="w-3.5 h-3.5 text-claude-muted" />
                <span>Innovation Lab 3 · C3 Campus Office</span>
              </div>
            </div>

          </div>

          {/* Bottom Footer Info */}
          <div className="pt-4 border-t border-[#E0DCD3] dark:border-claude-darkBorder/60 space-y-2 text-[11px] font-mono text-claude-muted">
            <div className="flex items-center justify-between">
              <span>Department of IT · ISLEC</span>
              <span className="text-[#CC5A36] font-bold">UGC Autonomous</span>
            </div>
            <p className="text-[10px] text-claude-muted/80">
              Press [1]–[5] on your keyboard to switch workspace views instantly.
            </p>
          </div>

        </aside>

        {/* RIGHT MAIN STAGE (Expansive Workspace Area) */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: FOUNDER PASS WORKBENCH */}
            {activeTab === 'pass' && (
              <motion.div
                key="pass"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-6xl mx-auto"
              >
                <div className="mb-6 flex items-center justify-between pb-4 border-b border-[#E0DCD3] dark:border-claude-darkBorder">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#CC5A36] uppercase tracking-wider block">
                      STUDIO WORKBENCH · BATCH 01
                    </span>
                    <h1 className="font-serif text-3xl font-bold text-claude-text dark:text-claude-darkText">
                      Landscape Mini PVC Founder Pass
                    </h1>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-claude-muted">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Real-time Canvas Rendering · 3D Dynamic Tilt</span>
                  </div>
                </div>

                <FoundingPass
                  onOpenApply={onOpenApply}
                  externalKey={activePassKey}
                />
              </motion.div>
            )}

            {/* TAB 2: CLAUDE CODE CLI TERMINAL */}
            {activeTab === 'terminal' && (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-5xl mx-auto"
              >
                <div className="mb-6 pb-4 border-b border-[#E0DCD3] dark:border-claude-darkBorder">
                  <span className="font-mono text-xs font-bold text-[#CC5A36] uppercase tracking-wider block">
                    CLAUDE CODE CLI SIMULATOR
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-claude-text dark:text-claude-darkText">
                    Autonomous Terminal Workflows
                  </h1>
                  <p className="text-sm text-claude-muted dark:text-claude-darkMuted mt-1">
                    Watch how C3 builders use Claude Code CLI directly inside their terminal to inspect architectures, write production files, and run live test suites.
                  </p>
                </div>

                <TerminalDemo />
              </motion.div>
            )}

            {/* TAB 3: SHIP WALL & MVPS */}
            {activeTab === 'ships' && (
              <motion.div
                key="ships"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-6xl mx-auto"
              >
                <div className="mb-6 pb-4 border-b border-[#E0DCD3] dark:border-claude-darkBorder">
                  <span className="font-mono text-xs font-bold text-[#CC5A36] uppercase tracking-wider block">
                    FRIDAY DEPLOYMENT GALLERY
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-claude-text dark:text-claude-darkText">
                    The C3 Ship Wall · Real Campus Software
                  </h1>
                  <p className="text-sm text-claude-muted dark:text-claude-darkMuted mt-1">
                    Every week culminates in live URLs solving concrete student and faculty problems across ISLEC.
                  </p>
                </div>

                <ShipWall onOpenApply={onOpenApply} />
              </motion.div>
            )}

            {/* TAB 4: PILLARS & ROUTINE */}
            {activeTab === 'pillars' && (
              <motion.div
                key="pillars"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-6xl mx-auto"
              >
                <div className="mb-6 pb-4 border-b border-[#E0DCD3] dark:border-claude-darkBorder">
                  <span className="font-mono text-xs font-bold text-[#CC5A36] uppercase tracking-wider block">
                    PHILOSOPHY &amp; FOUNDATIONS
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-claude-text dark:text-claude-darkText">
                    The 4 Core Pillars of C3
                  </h1>
                  <p className="text-sm text-claude-muted dark:text-claude-darkMuted mt-1">
                    No slides. No theoretical lectures. A practical, high-velocity morning lab environment.
                  </p>
                </div>

                <WhatIsC3 />
              </motion.div>
            )}

            {/* TAB 5: WEEK 1 SPRINTS */}
            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-6xl mx-auto"
              >
                <div className="mb-6 pb-4 border-b border-[#E0DCD3] dark:border-claude-darkBorder">
                  <span className="font-mono text-xs font-bold text-[#CC5A36] uppercase tracking-wider block">
                    FOUNDING COHORT ROADMAP
                  </span>
                  <h1 className="font-serif text-3xl font-bold text-claude-text dark:text-claude-darkText">
                    Week 1 Kickoff Sessions
                  </h1>
                  <p className="text-sm text-claude-muted dark:text-claude-darkMuted mt-1">
                    From terminal setup and MCP tools to shipping your first verified campus application.
                  </p>
                </div>

                <EventsWeek1 />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

    </div>
  );
};
