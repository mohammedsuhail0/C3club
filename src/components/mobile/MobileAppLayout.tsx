import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  CreditCard,
  Layers,
  Calendar,
  Terminal,
  Sparkles,
  Shield,
  Clock,
  MapPin,
  Users2,
  Rocket,
  CheckCircle2,
  Copy,
  Download,
  Key,
  Unlock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { sounds } from '../../utils/audio';
import { fetchMemberByKey, MemberRecord } from '../../utils/api';
import { validateFounderKey } from '../../utils/founderAuth';

interface MobileAppLayoutProps {
  onOpenApply: () => void;
  onOpenOrganizer: () => void;
  activePassKey?: string;
}

type MobileTab = 'home' | 'pass' | 'pillars' | 'roadmap' | 'terminal';

export const MobileAppLayout: React.FC<MobileAppLayoutProps> = ({
  onOpenApply,
  onOpenOrganizer,
  activePassKey = '',
}) => {
  const [activeTab, setActiveTab] = useState<MobileTab>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('code=') || search.includes('fnd=') || search.includes('key=') || search.includes('letter=')) {
        return 'pass';
      }
    }
    return 'home';
  });

  // Ensure zero body scroll while mobile app view is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Update tab if activePassKey changes
  useEffect(() => {
    if (activePassKey) {
      setActiveTab('pass');
    }
  }, [activePassKey]);

  // --- PASS TAB STATE ---
  const [founderKey, setFounderKey] = useState<string>(activePassKey || '3C5B');
  const [inputKey, setInputKey] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(Boolean(activePassKey));
  const [keyError, setKeyError] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('Founding Builder');
  const [memberRole, setMemberRole] = useState<string>('Vibe Coder / Shipper');
  const [memberBranch, setMemberBranch] = useState<string>('IT · 3rd Year');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync with activePassKey
  useEffect(() => {
    if (activePassKey) {
      setFounderKey(activePassKey);
      setIsUnlocked(true);
      fetchMemberByKey(activePassKey).then((member: MemberRecord | null) => {
        if (member) {
          setMemberName(member.name || 'Founding Builder');
          setMemberRole(member.role || 'Vibe Coder / Shipper');
          setMemberBranch(`${member.branch || 'IT'} · ${member.year || '3rd Year'}`);
        }
      });
    }
  }, [activePassKey]);

  // Generate QR code for mobile card
  useEffect(() => {
    const currentKey = founderKey || '3C5B';
    const verifyUrl = `https://c3club.vercel.app/?code=${encodeURIComponent(currentKey)}`;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 180,
      color: {
        dark: '#1F1E1B',
        light: '#FAF8F5',
      },
    }).then(setQrCodeUrl).catch(() => {});
  }, [founderKey]);

  const handleUnlockKey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputKey.trim().toUpperCase();
    if (!clean) {
      setKeyError('Enter your 4-character key.');
      return;
    }
    const val = validateFounderKey(clean);
    if (!val.isValid) {
      setKeyError('Invalid key. Check your email or apply.');
      sounds.playClick();
      return;
    }
    sounds.playSuccess();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
    setFounderKey(clean);
    setIsUnlocked(true);
    setKeyError('');
    fetchMemberByKey(clean).then((member) => {
      if (member) {
        setMemberName(member.name);
        setMemberRole(member.role);
        setMemberBranch(`${member.branch} · ${member.year}`);
      }
    });
  };

  const handleCopyLink = () => {
    sounds.playSuccess();
    const url = `${window.location.origin}/?code=${encodeURIComponent(founderKey)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- PILLARS TAB STATE ---
  const [activePillarIndex, setActivePillarIndex] = useState<number>(0);
  const pillars = [
    {
      id: 1,
      badge: 'PILLAR 01',
      title: 'Claude Code CLI',
      subtitle: 'Autonomous terminal workflows',
      icon: Terminal,
      highlight: 'Terminal Loops',
      desc: 'No chat tabs or context copying. Work with agentic Claude CLI running directly inside your bash terminal, editing codebases and executing tests in parallel.',
    },
    {
      id: 2,
      badge: 'PILLAR 02',
      title: 'Morning Lab Routine',
      subtitle: 'Mon–Thu · 10 AM to 1 PM',
      icon: Clock,
      highlight: '3h Focused Cowork',
      desc: 'Four morning sessions per week in Innovation Lab 3. Zero slides or lectures. Plug in your laptop, pair program, and ship features alongside fellow founders.',
    },
    {
      id: 3,
      badge: 'PILLAR 03',
      title: 'Friday Ship Wall',
      subtitle: 'Real campus software',
      icon: Rocket,
      highlight: 'Weekly URLs',
      desc: 'Every week culminates in live campus production deployments. Solutions built for real students, faculty clubs, and department workflows.',
    },
    {
      id: 4,
      badge: 'PILLAR 04',
      title: 'Dept of IT Accreditation',
      subtitle: 'UGC Autonomous ISLEC',
      icon: Shield,
      highlight: 'Official Recognition',
      desc: 'Conceived and housed under the Department of Information Technology at ISL Engineering College. Real builder pedigree with autonomous college credit paths.',
    },
  ];

  // --- ROADMAP TAB STATE ---
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const roadmapDays = [
    {
      day: 'DAY 01',
      title: 'Terminal Setup & MCP Tools',
      date: 'Monday · 10 AM',
      focus: 'Developer Machine Config',
      details: 'Configure Claude Code CLI on macOS/Linux/Windows WSL, authenticate API credentials, and connect local MCP servers for database and file management.',
    },
    {
      day: 'DAY 02',
      title: 'Git Workflows & Prompt Architecture',
      date: 'Tuesday · 10 AM',
      focus: 'Autonomous Agent Loops',
      details: 'Master multi-agent branch orchestration, structured prompt chaining, and high-velocity bug reproduction using terminal-first pair programming.',
    },
    {
      day: 'DAY 03',
      title: 'Full-Stack Campus Prototype Sprint',
      date: 'Wednesday · 10 AM',
      focus: 'End-to-End Build',
      details: 'Scaffold responsive React/Tailwind frontends hooked to Supabase/SQLite APIs in under 90 minutes. Test edge cases and harden auth security.',
    },
    {
      day: 'DAY 04',
      title: 'Campus Ship Day & Live Demos',
      date: 'Thursday · 10 AM',
      focus: 'Production Deployment',
      details: 'Ship verified production URLs to Vercel/Render. Demo live campus tools before department peers and collect initial real-world user feedback.',
    },
  ];

  // --- TERMINAL TAB SIMULATOR STATE ---
  const [cliStep, setCliStep] = useState<number>(0);
  const cliLines = [
    '$ claude "scaffold campus club portal with React & Tailwind"',
    '● Analyzing project structure...',
    '● Generating src/components/FoundingPass.tsx...',
    '● Connecting Supabase backend client...',
    '● Running test suite: PASS (14/14 tests)',
    '✔ Deployed to production: https://c3club.vercel.app',
  ];

  useEffect(() => {
    if (activeTab === 'terminal') {
      setCliStep(0);
      const timer = setInterval(() => {
        setCliStep((prev) => (prev < cliLines.length ? prev + 1 : prev));
      }, 1100);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[#FAF8F5] dark:bg-[#141210] text-claude-text dark:text-claude-darkText select-none">
      
      {/* 1. TOP HEADER (COMPACT & NATIVE) */}
      <header className="h-13 shrink-0 border-b border-[#E0DCD3] dark:border-claude-darkBorder bg-[#FAF8F5]/95 dark:bg-[#141210]/95 backdrop-blur-md px-3.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <img
            src="/assets/c3_emblem_trans.png"
            alt="C3"
            className="w-7 h-7 object-contain drop-shadow-sm"
          />
          <div>
            <div className="font-mono font-bold text-xs text-[#B8431E] dark:text-[#E07A5F] leading-tight tracking-wider">
              C3 COLLECTIVE
            </div>
            <div className="text-[9px] text-claude-muted dark:text-claude-darkMuted font-sans">
              Dept of IT · ISLEC
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            BATCH 01
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onOpenApply();
            }}
            className="px-2.5 py-1 rounded-lg bg-claude-terracotta text-white font-mono text-[10px] font-bold shadow-xs active:scale-95 transition-transform"
          >
            Apply
          </button>
        </div>
      </header>

      {/* 2. CENTRAL VIEWPORT: STRICTLY ZERO SCROLL */}
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col items-center justify-center p-3 relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME (IMPACT OVERVIEW) */}
          {activeTab === 'home' && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm flex flex-col items-center text-center my-auto space-y-3.5"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#CC5A36]/10 border border-[#CC5A36]/25 text-[#CC5A36] text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Student Software Collective</span>
              </div>

              {/* Display Headline */}
              <h1 className="font-serif text-3xl xs:text-4xl font-normal tracking-tight text-claude-text dark:text-claude-darkText leading-[1.08]">
                The Claude Code <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-claude-terracotta via-amber-600 to-rose-600">
                  &amp; Cowork.
                </span>
              </h1>

              {/* Subhead */}
              <p className="text-xs text-claude-muted dark:text-claude-darkMuted font-serif italic max-w-xs leading-relaxed">
                Ship real campus software every week. Zero slides. Only working code.
              </p>

              {/* 2x2 Clean Campus Metrics */}
              <div className="w-full grid grid-cols-2 gap-2 pt-1 text-left">
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#CC5A36] font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Lab 3 · Mon–Thu
                  </div>
                  <div className="text-xs font-semibold text-claude-text dark:text-claude-darkText mt-0.5">
                    10 AM – 1 PM
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#CC5A36] font-bold flex items-center gap-1">
                    <Users2 className="w-3 h-3" /> Cohort Cap
                  </div>
                  <div className="text-xs font-semibold text-claude-text dark:text-claude-darkText mt-0.5">
                    15 Founders Max
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10 shadow-2xs">
                  <div className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                    <Rocket className="w-3 h-3" /> Every Friday
                  </div>
                  <div className="text-xs font-semibold text-claude-text dark:text-claude-darkText mt-0.5">
                    Live Campus Ships
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10 shadow-2xs">
                  <div className="text-[10px] font-mono text-[#CC5A36] font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> UGC Approved
                  </div>
                  <div className="text-xs font-semibold text-claude-text dark:text-claude-darkText mt-0.5">
                    Dept of IT, ISLEC
                  </div>
                </div>
              </div>

              {/* Primary Dual Actions */}
              <div className="w-full flex items-center gap-2 pt-1.5">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('pass');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-[#1E1D1A] border border-[#CC5A36]/40 text-[#CC5A36] font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Founder Pass</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playSuccess();
                    onOpenApply();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-claude-terracotta text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Apply Now</span>
                </button>
              </div>

              {/* Minimal organizer trigger */}
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenOrganizer();
                }}
                className="text-[10px] font-mono text-claude-muted hover:text-[#CC5A36] underline cursor-pointer"
              >
                Organizer Command Desk →
              </button>
            </motion.div>
          )}

          {/* TAB 2: MINI PVC FOUNDER PASS (ZERO SCROLL) */}
          {activeTab === 'pass' && (
            <motion.div
              key="tab-pass"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm flex flex-col items-center justify-center my-auto space-y-3"
            >
              {/* Card Title Header */}
              <div className="flex items-center justify-between w-full px-1">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#CC5A36]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-claude-text dark:text-claude-darkText">
                    Landscape PVC Card
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                  {isUnlocked ? 'VERIFIED' : 'KEY LOCKED'}
                </span>
              </div>

              {/* THE MINI PVC CARD CONTAINER */}
              <div className="w-full rounded-2xl p-4 bg-gradient-to-br from-[#FAF8F5] via-[#F6F3EC] to-[#EFEAE1] dark:from-[#23221E] dark:via-[#1D1C19] dark:to-[#161513] border border-[#CC5A36]/40 dark:border-[#CC5A36]/30 shadow-xl relative overflow-hidden select-none">
                
                {/* Hologram Foil Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#CC5A36]/15 via-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />

                {/* Card Top Strip */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E0DCD3] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/c3_emblem_trans.png"
                      alt="C3"
                      className="w-6 h-6 object-contain"
                    />
                    <div>
                      <div className="font-mono font-bold text-[10px] text-[#B8431E] leading-tight">
                        C3 COLLECTIVE
                      </div>
                      <div className="text-[8px] text-claude-muted">
                        ISLEC UGC Autonomous
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-claude-muted">
                    BATCH 01
                  </span>
                </div>

                {/* Card Main Body */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div>
                      <div className="text-[8px] font-mono text-claude-muted uppercase">
                        FOUNDING BUILDER
                      </div>
                      <div className="font-serif font-bold text-sm truncate text-claude-text dark:text-claude-darkText">
                        {memberName}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-claude-muted">
                      <span className="px-1.5 py-0.5 rounded bg-[#CC5A36]/10 text-[#CC5A36] font-semibold truncate max-w-[130px]">
                        {memberRole}
                      </span>
                      <span>·</span>
                      <span className="truncate">{memberBranch}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="text-[8px] font-mono text-claude-muted">KEY:</span>
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 tracking-wider">
                        FND-{founderKey}
                      </span>
                    </div>
                  </div>

                  {/* Scannable Live QR */}
                  <div className="shrink-0 p-1 rounded-xl bg-white dark:bg-white/90 border border-[#E0DCD3] shadow-xs">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Pass QR" className="w-16 h-16 object-contain" />
                    ) : (
                      <div className="w-16 h-16 bg-stone-100 flex items-center justify-center text-[9px] font-mono text-stone-400">
                        QR
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Strip */}
                <div className="mt-2.5 pt-2 border-t border-[#E0DCD3] dark:border-white/10 flex items-center justify-between text-[8px] font-mono text-claude-muted">
                  <span>Lab 3 · Mon–Thu · 10 AM</span>
                  <span className="text-[#CC5A36] font-bold">Show at desk on Monday</span>
                </div>

              </div>

              {/* CARD CONTROLS (UNLOCKED VS LOCKED) */}
              {isUnlocked ? (
                <div className="w-full flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#1E1D1A] border border-[#E0DCD3] dark:border-white/10 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      window.print();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-claude-terracotta text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print / Save</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUnlockKey} className="w-full space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={inputKey}
                        onChange={(e) => {
                          setInputKey(e.target.value);
                          setKeyError('');
                        }}
                        placeholder="ENTER 4-CHAR KEY"
                        maxLength={8}
                        className="w-full pl-8 pr-2 py-2 rounded-xl bg-white dark:bg-[#1E1D1A] border border-[#E0DCD3] dark:border-white/10 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-[#CC5A36]"
                      />
                      <Key className="w-3.5 h-3.5 text-claude-muted absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-[#CC5A36] text-white font-mono text-xs font-bold shadow-xs active:scale-95 shrink-0"
                    >
                      Unlock
                    </button>
                  </div>

                  {keyError ? (
                    <div className="text-[10px] font-mono text-rose-600 flex items-center gap-1 justify-center">
                      <AlertCircle className="w-3 h-3" />
                      <span>{keyError}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] font-mono px-1">
                      <span className="text-claude-muted">Need a key?</span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          onOpenApply();
                        }}
                        className="text-[#CC5A36] hover:underline font-bold"
                      >
                        Apply for Admission →
                      </button>
                    </div>
                  )}
                </form>
              )}
            </motion.div>
          )}

          {/* TAB 3: 4 PILLARS CAROUSEL (ZERO SCROLL) */}
          {activeTab === 'pillars' && (
            <motion.div
              key="tab-pillars"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm flex flex-col items-center justify-center my-auto space-y-3"
            >
              {/* Segmented Switcher Pills */}
              <div className="w-full flex items-center justify-between gap-1 p-1 rounded-xl bg-white/60 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10">
                {pillars.map((p, idx) => {
                  const isCurrent = idx === activePillarIndex;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        sounds.playClick();
                        setActivePillarIndex(idx);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#CC5A36] text-white shadow-xs'
                          : 'text-claude-muted hover:text-claude-text'
                      }`}
                    >
                      0{p.id}
                    </button>
                  );
                })}
              </div>

              {/* Active Pillar Card */}
              {(() => {
                const current = pillars[activePillarIndex];
                const IconComponent = current.icon;
                return (
                  <div className="w-full rounded-2xl p-4 bg-white dark:bg-[#1E1D1A] border border-[#E0DCD3] dark:border-white/10 shadow-sm space-y-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#CC5A36]/10 border border-[#CC5A36]/20 flex items-center justify-center text-[#CC5A36]">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-claude-muted font-bold">
                        {current.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-serif text-lg font-bold text-claude-text dark:text-claude-darkText leading-snug">
                        {current.title}
                      </h2>
                      <p className="text-[11px] font-mono text-[#CC5A36] font-semibold">
                        {current.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-claude-muted dark:text-claude-darkMuted leading-relaxed">
                      {current.desc}
                    </p>

                    <div className="pt-2 border-t border-[#E0DCD3] dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        ✓ {current.highlight}
                      </span>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setActivePillarIndex((prev) => (prev + 1) % pillars.length);
                        }}
                        className="text-[#CC5A36] font-bold flex items-center gap-0.5 hover:underline"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 4: ROADMAP WEEK 1 (ZERO SCROLL) */}
          {activeTab === 'roadmap' && (
            <motion.div
              key="tab-roadmap"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm flex flex-col items-center justify-center my-auto space-y-3"
            >
              {/* Day Segmented Switcher */}
              <div className="w-full flex items-center justify-between gap-1 p-1 rounded-xl bg-white/60 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10">
                {roadmapDays.map((d, idx) => {
                  const isCurrent = idx === activeDayIndex;
                  return (
                    <button
                      key={d.day}
                      onClick={() => {
                        sounds.playClick();
                        setActiveDayIndex(idx);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#CC5A36] text-white shadow-xs'
                          : 'text-claude-muted hover:text-claude-text'
                      }`}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>

              {/* Active Roadmap Day Card */}
              {(() => {
                const current = roadmapDays[activeDayIndex];
                return (
                  <div className="w-full rounded-2xl p-4 bg-white dark:bg-[#1E1D1A] border border-[#E0DCD3] dark:border-white/10 shadow-sm space-y-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#CC5A36] px-2 py-0.5 rounded-md bg-[#CC5A36]/10">
                        {current.date}
                      </span>
                      <span className="text-[10px] font-mono text-claude-muted">
                        Lab 3 · In-Person
                      </span>
                    </div>

                    <div>
                      <h2 className="font-serif text-lg font-bold text-claude-text dark:text-claude-darkText leading-snug">
                        {current.title}
                      </h2>
                      <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                        Sprint Focus: {current.focus}
                      </p>
                    </div>

                    <p className="text-xs text-claude-muted dark:text-claude-darkMuted leading-relaxed">
                      {current.details}
                    </p>

                    <div className="pt-2 border-t border-[#E0DCD3] dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
                      <button
                        onClick={() => {
                          sounds.playSuccess();
                          onOpenApply();
                        }}
                        className="text-[#CC5A36] font-bold hover:underline"
                      >
                        Reserve Your Seat →
                      </button>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setActiveDayIndex((prev) => (prev + 1) % roadmapDays.length);
                        }}
                        className="text-claude-muted font-bold flex items-center gap-0.5 hover:text-claude-text"
                      >
                        <span>Next Day</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 5: CLI TERMINAL SIMULATOR (ZERO SCROLL) */}
          {activeTab === 'terminal' && (
            <motion.div
              key="tab-terminal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm flex flex-col items-center justify-center my-auto space-y-2.5"
            >
              <div className="w-full flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#CC5A36]">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>CLAUDE CODE CLI</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  ● ACTIVE REPL
                </span>
              </div>

              {/* Terminal Box */}
              <div className="w-full rounded-2xl bg-[#1E1C1A] text-[#F5F2EB] p-3.5 font-mono text-[11px] shadow-xl border border-black/20 space-y-2 min-h-[220px] flex flex-col justify-between">
                {/* Traffic lights */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[9px] text-white/40">bash — 80x24</span>
                </div>

                {/* Animated output */}
                <div className="space-y-1.5 flex-1 pt-1">
                  {cliLines.slice(0, cliStep + 1).map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        idx === 0
                          ? 'text-[#E07A5F] font-bold'
                          : line.includes('PASS') || line.includes('production')
                          ? 'text-emerald-400 font-bold'
                          : 'text-stone-300'
                      }
                    >
                      {line}
                    </div>
                  ))}
                  {cliStep < cliLines.length && (
                    <span className="inline-block w-2 h-3.5 bg-[#E07A5F] animate-pulse ml-0.5 align-middle" />
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
                  <span>Speed: Autonomous Agent</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setCliStep(0);
                    }}
                    className="text-[#E07A5F] hover:underline"
                  >
                    Rerun Simulation
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR (~56px, ZERO SCROLL) */}
      <nav className="h-15 shrink-0 border-t border-[#E0DCD3] dark:border-claude-darkBorder bg-[#FAF8F5]/98 dark:bg-[#141210]/98 backdrop-blur-lg px-2 flex items-center justify-around z-30 shadow-2xl">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('home');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[9px] font-mono">Home</span>
        </button>

        {/* Tab 2: Pass */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('pass');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'pass'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-[9px] font-mono">Pass</span>
        </button>

        {/* Tab 3: Pillars */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('pillars');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'pillars'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[9px] font-mono">Pillars</span>
        </button>

        {/* Tab 4: Roadmap */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('roadmap');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'roadmap'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] font-mono">Roadmap</span>
        </button>

        {/* Tab 5: Terminal */}
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('terminal');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'terminal'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span className="text-[9px] font-mono">CLI</span>
        </button>

      </nav>

    </div>
  );
};
