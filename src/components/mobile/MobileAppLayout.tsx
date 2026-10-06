import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  CreditCard,
  Layers,
  Calendar,
  Mic,
  Scale,
  Search,
  Rocket,
  Sparkles,
  Shield,
  Clock,
  MapPin,
  Users2,
  CheckCircle2,
  Copy,
  Download,
  Key,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Code2,
  Terminal,
  ArrowRight,
  Zap
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { fetchMemberByKey, MemberRecord } from '../../utils/api';
import { validateFounderKey } from '../../utils/founderAuth';
import { requestMobileFullscreen, exitFullscreenIfActive } from '../../utils/fullscreen';

interface MobileAppLayoutProps {
  onOpenApply: () => void;
  onOpenOrganizer: () => void;
  activePassKey?: string;
}

type MobileTab = 'about' | 'pass' | 'structure' | 'roadmap' | 'events';

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
    return 'about';
  });

  // Ensure strictly zero body scroll while mobile app view is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Fullscreen management: 100% automatic strictly for mobile view
  useEffect(() => {
    // 1. Attempt immediately on mount
    requestMobileFullscreen();

    // 2. Trigger on any user gesture across window
    const handleGesture = () => {
      requestMobileFullscreen();
    };

    window.addEventListener('touchstart', handleGesture, { capture: true, passive: true });
    window.addEventListener('touchend', handleGesture, { capture: true, passive: true });
    window.addEventListener('pointerdown', handleGesture, { capture: true, passive: true });
    window.addEventListener('click', handleGesture, { capture: true, passive: true });
    window.addEventListener('wheel', handleGesture, { capture: true, passive: true });

    return () => {
      window.removeEventListener('touchstart', handleGesture, { capture: true });
      window.removeEventListener('touchend', handleGesture, { capture: true });
      window.removeEventListener('pointerdown', handleGesture, { capture: true });
      window.removeEventListener('click', handleGesture, { capture: true });
      window.removeEventListener('wheel', handleGesture, { capture: true });
      // When leaving mobile view, exit fullscreen automatically
      exitFullscreenIfActive();
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
          setMemberRole(member.role || 'Founding Builder');
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
      width: 170,
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
      return;
    }
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
    const url = `${window.location.origin}/?code=${encodeURIComponent(founderKey)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- TAB 1 (ABOUT): 100% AUTHENTIC CHARTER CONTENT FROM HTML ---
  const [aboutSubTab, setAboutSubTab] = useState<'ways' | 'beliefs' | 'give_ask'>('ways');

  const aboutWaysIn = [
    {
      title: 'I have a project',
      tag: 'PITCH & SCALE',
      desc: 'Pitch it. The club helps shape it, finds you collaborators and mentors, then helps you reach real users and scale.',
    },
    {
      title: 'I don’t have one yet',
      tag: 'IDEA POOL & BUILD',
      desc: 'Join idea sessions, get matched to a problem you care about or join another founder’s build, and commit to a project in your first month.',
    }
  ];

  const aboutBeliefs = [
    {
      title: 'No members, only founders',
      desc: 'Everyone owns a project or a clear role in someone else’s. Nobody sits on the sidelines.'
    },
    {
      title: 'Build, don’t just learn',
      desc: 'Knowledge counts once it ships. A tiny working version beats a big plan.'
    },
    {
      title: 'Nobody builds alone',
      desc: 'The club removes the confusion and loneliness that kills most student projects.'
    },
    {
      title: 'Help is given freely and returned later',
      desc: 'Today’s helped founder mentors the next cohort.'
    }
  ];

  const aboutTeaches = [
    { title: 'Prompt Engineering', desc: 'Getting real, reliable work out of AI models.' },
    { title: 'Git & GitHub', desc: 'How real teams build software together.' },
    { title: 'Claude & Claude Code', desc: 'Building faster with AI as a working partner.' }
  ];

  // --- TAB 3 (STRUCTURE): 100% AUTHENTIC CHARTER CONTENT FROM HTML ---
  const [structureSubTab, setStructureSubTab] = useState<'team' | 'infra' | 'timeline'>('team');

  const structureCoreTeam = [
    { role: 'Lead', icon: Compass, desc: 'Direction, and relations with faculty, college, and sponsors.' },
    { role: 'Build Lead', icon: Code2, desc: 'Projects, technical quality, and Prompt-to-Prod preparation.' },
    { role: 'Community Lead', icon: Users2, desc: 'Events, onboarding, and communications.' },
    { role: 'Archivist', icon: Shield, desc: 'Keeps the handbook, repos, and records current.' },
    { role: 'Faculty Advisor', icon: Sparkles, desc: 'Continuity and institutional access.' }
  ];

  const structureInfrastructure = [
    { name: 'github', desc: 'Organization with 2-3 owners, never a personal account' },
    { name: 'site', desc: 'And domain under a shared collegiate account' },
    { name: 'handbook', desc: 'Repo: charter, roles, playbooks, handover checklist' },
    { name: 'templates', desc: 'README, contribution guide, issue templates' },
    { name: 'access', desc: 'Access list held by the Archivist and advisor' }
  ];

  const structureFirst30Days = [
    'Write the one-page charter',
    'Create the GitHub org and handbook repo',
    'Move the website and domain to shared ownership',
    'Assign roles and deputies',
    'Open the project pool and pitch form',
    'Run the first full monthly cycle'
  ];

  const structureLearningPath = [
    'Git and GitHub basics',
    'Prompt engineering fundamentals',
    'Claude Code workflows',
    'Cowork and collaborative building',
    'Ship a small project end to end'
  ];

  // --- ROADMAP TAB STATE (5-STEP LEARNING PATH & CONTRIBUTION LADDER FROM C3 CHARTER) ---
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const roadmapStages = [
    {
      id: 0,
      stage: '01 GIT',
      badge: 'STAGE 01 · FOUNDATION',
      ladder: 'NEWCOMER → BUILDER',
      title: 'Git & GitHub Basics',
      subtitle: 'How real teams build software together',
      journeyCurrent: 'idea',
      journeyStep: 'Phase 1 · Setup',
      desc: 'Master branch hygiene, atomic commits, pull requests, and peer reviews. In C3, every line of code goes through a PR—nobody pushes directly to main.',
      breakdownTitle: 'Core Practices & Tooling:',
      phases: [
        { label: 'WORKFLOW', title: 'Branch & Pull Request', desc: 'Feature branches, meaningful commits & merge hygiene' },
        { label: 'REPOS', title: 'Shared Organization', desc: 'Multi-maintainer repos, issues backlog & milestones' },
        { label: 'REVIEWS', title: 'Peer Review Gates', desc: 'Code reviews before merges; learning by critiquing PRs' }
      ],
      deliverables: [
        'Configured SSH keys, local Git CLI & club org access',
        'First merged pull request in C3 starter template repo',
        'Unlocked "Builder" rank on C3 contribution ladder'
      ],
      belief: 'Every change is a pull request. Nobody pushes directly to main, and someone else reviews every PR.',
      outcome: 'Milestone Gate: Verified PR Merged · Builder Rank Earned'
    },
    {
      id: 1,
      stage: '02 PROMPT',
      badge: 'STAGE 02 · AI SYSTEMS',
      ladder: 'BUILDER → SHIPPER',
      title: 'Prompt Engineering',
      subtitle: 'Getting real, reliable work out of AI models',
      journeyCurrent: 'pitched',
      journeyStep: 'Phase 2 · Scoped',
      desc: 'Move beyond casual chatbots. Learn systematic prompting, structured JSON schemas, boundary constraints, and repeatable prompt architectures.',
      breakdownTitle: 'Prompt Systems & Disciplines:',
      phases: [
        { label: 'SPECS', title: 'Structured Context', desc: 'Markdown specs, task constraints & unambiguous boundaries' },
        { label: 'SCHEMAS', title: 'JSON Structured I/O', desc: 'Type-safe function calling, strict output validation' },
        { label: 'EVALS', title: 'Prompt Benchmarking', desc: 'Systematic testing of prompts against test edge cases' }
      ],
      deliverables: [
        'Written 1-page system prompt spec for an active campus tool',
        'Tested schema-validated agent task loop with 100% type safety',
        'Zero hallucination rate verified via synthetic test cases'
      ],
      belief: 'Build, don’t just learn. Knowledge counts once it ships. Deterministic outputs beat clever prompt tricks.',
      outcome: 'Standard: Deterministic Outputs · Zero Chat Fluff'
    },
    {
      id: 2,
      stage: '03 CLAUDE',
      badge: 'STAGE 03 · AGENT WORKFLOWS',
      ladder: 'SHIPPER → MAINTAINER',
      title: 'Claude Code Workflows',
      subtitle: 'Building faster with AI as a working partner',
      journeyCurrent: 'building',
      journeyStep: 'Phase 3 · Active Build',
      desc: 'Harness Claude Code directly in your terminal. Automate boilerplate, run autonomous test-repair loops, and scaffold full features in minutes.',
      breakdownTitle: 'Agentic Workflow Patterns:',
      phases: [
        { label: 'CLI LOOP', title: 'Terminal Agent Pairing', desc: 'Codebase indexing, architectural memory & command execution' },
        { label: 'TDD FIX', title: 'Self-Healing Test Cycles', desc: 'Autonomous bug tracing, stack trace diagnosis & automated tests' },
        { label: 'SPEED', title: 'Prompt-to-Code Scaffolding', desc: 'Generate complete database schemas, API routes & UI modules' }
      ],
      deliverables: [
        'Claude Code CLI installed and authenticated on builder machine',
        'Scaffolded complete full-stack module from scratch via CLI agent',
        'Passed automated test suite verified by terminal agent'
      ],
      belief: 'AI as an active working partner. Knowledge counts once it ships. 10x developer velocity in terminal.',
      outcome: 'Workflow: 10x Developer Velocity · Terminal-Native Sprints'
    },
    {
      id: 3,
      stage: '04 COWORK',
      badge: 'STAGE 04 · COLLABORATION',
      ladder: 'MAINTAINER → MENTOR',
      title: 'Morning Cowork Routine',
      subtitle: 'Nobody builds alone — Mon–Thu · Lab 3',
      journeyCurrent: 'building',
      journeyStep: 'Phase 4 · Coworking',
      desc: 'The club removes the confusion and loneliness that kills student projects. Pair up in Lab 3 every morning (Mon–Thu, 10 AM–1 PM) to build together.',
      breakdownTitle: 'Coworking Dynamics & Protocols:',
      phases: [
        { label: 'PAIRING', title: 'Co-Pilot Pairing', desc: 'Pair experienced builders with newcomers across 6 sub-teams' },
        { label: 'STANDUPS', title: 'Daily Unblocking', desc: '10-minute sync to remove dependency blockers and share breakthroughs' },
        { label: 'CULTURE', title: 'Free Help Returned Later', desc: 'Today’s helped founder mentors the next cohort. No sidelines' }
      ],
      deliverables: [
        'Active participation in 4 morning coworking sessions (Lab 3)',
        'Pair programmed and unblocked a peer founder’s module',
        'Resolution filed in the C3 handbook documentation repo'
      ],
      belief: 'Nobody builds alone. The club removes the confusion and loneliness that kills most student projects.',
      outcome: 'Culture: Help Given Freely & Returned Later · Lab 3'
    },
    {
      id: 4,
      stage: '05 SHIP',
      badge: 'STAGE 05 · PRODUCTION',
      ladder: 'FOUNDER MENTOR · GEN 1',
      title: 'Ship to Production',
      subtitle: 'Knowledge counts once it ships — live URLs only',
      journeyCurrent: 'shipped',
      journeyStep: 'Phase 5 · Live Ship',
      desc: 'Build your dream or campus startup. Take a real idea from Deconstruct or CTalk to a live URL with custom domain, SSL, database, auth, and real users.',
      breakdownTitle: 'Production Deployment Stack:',
      phases: [
        { label: 'DEPLOY', title: 'Live Cloud Infrastructure', desc: 'Vercel / Supabase / Cloudflare Workers production deploy' },
        { label: 'DOCS', title: 'README & Demo Video', desc: 'Architecture documentation, user guide & 2-minute demo showcase' },
        { label: 'TRACTION', title: 'Campus User Onboarding', desc: 'First 50 student users onboarded; feedback loop established' }
      ],
      deliverables: [
        'Live production URL with SSL verified by C3 Build Lead',
        'Public GitHub repo with comprehensive README & setup guide',
        'Delivered live demo to faculty & peers on Cohort Demo Day'
      ],
      belief: 'No members, only founders. A tiny working version beats a big plan. 100% deployed software on the internet.',
      outcome: 'Final Gate: 100% Deployed Software · Public Founder Record'
    }
  ];

  // --- EVENTS TAB STATE (4-WEEK MONTHLY CYCLE FROM AUTHENTIC C3 CHARTER) ---
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const events = [
    {
      id: 0,
      code: 'WEEK 01',
      name: 'CTALK',
      subtitle: 'The Student Council · A parliament, not a chat',
      time: 'Mon–Thu · 10:00 AM – 10:40 AM',
      duration: '40 mins',
      format: 'Parliamentary Council & Debate',
      icon: Mic,
      tagline: 'The whole club sits together like a council to debate one topic with real procedure.',
      mechanicsTitle: 'Rotating Council Roles (Monthly):',
      mechanics: [
        { label: 'SPEAKER', title: 'Chairs Session', desc: 'Presides over debate and keeps strict parliamentary order' },
        { label: 'PRO / OPP', title: 'Opens Debate', desc: 'Proposer and Opposer deliver opening speeches on the motion' },
        { label: 'CLERK', title: 'Files Resolution', desc: 'Records discussion and drafts binding written resolution' },
        { label: 'TIMEKEEPER', title: 'Enforces Limits', desc: 'Keeps speeches fair so every founder can speak from floor' }
      ],
      flow: 'Motion read & 1st vote → Opening speeches → Open floor → Final vote → Resolution read',
      charterRule: 'Topics can be tech & careers, club decisions, or campus issues. Passed resolution is binding.',
      outputBadge: 'Output: Written Resolution in Handbook · Binding on Club Decisions'
    },
    {
      id: 1,
      code: 'WEEK 02',
      name: 'THE VERDICT',
      subtitle: 'Will it help or damage your career?',
      time: 'Mon–Thu · 10:40 AM – 11:15 AM',
      duration: '35 mins',
      format: 'Live Tech Trial & Screen Audit',
      icon: Scale,
      tagline: 'Founders study incoming tech, judge career impact, and decide what the club learns.',
      mechanicsTitle: '5 Presenter Questions (Hands-on Rule):',
      mechanics: [
        { label: 'PLAIN WORDS', title: 'Core Definition', desc: 'What is it in plain words? Who benefits, and who is at risk?' },
        { label: 'CAREER IMPACT', title: 'Opportunity & Threat', desc: 'How could it help our careers, or how could it damage them?' },
        { label: 'TAKEAWAY', title: 'Monthly Action', desc: 'What should the club learn from it this month? Live demo test' }
      ],
      flow: 'Speaker intro → Presenter demo & stress test → Floor challenge → Final verdict vote',
      charterRule: 'Back every claim with hands-on tests or sources. Verdict cards are archived to judge track record.',
      outputBadge: 'Output: Verdict Card (Learn / Watch / Ignore) + 30-Day Action'
    },
    {
      id: 2,
      code: 'WEEK 03',
      name: 'DECONSTRUCT',
      subtitle: 'How great companies form & survive',
      time: 'Mon–Thu · 11:15 AM – 11:50 AM',
      duration: '35 mins',
      format: 'Startup Architecture Teardown',
      icon: Search,
      tagline: 'Founders research a successful company and teach the club how it was built.',
      mechanicsTitle: '6-Point Teardown Framework:',
      mechanics: [
        { label: 'ORIGIN & USERS', title: 'Day Zero Traction', desc: 'Who started it, the problem solved & how they won first users' },
        { label: 'MODEL & MOAT', title: 'Revenue & Defensibility', desc: 'How it makes money & why competitors cannot easily copy it' },
        { label: 'SURVIVAL', title: 'Near-Death Lessons', desc: 'What almost killed it & 3 actionable lessons C3 founders copy' }
      ],
      flow: 'Teardown presentation → Q&A challenge → Brainstorm project ideas → Add to pool',
      charterRule: 'Study Indian & global startups, and one that failed. Survival lessons are most useful.',
      outputBadge: 'Output: Teardown Doc in Handbook + Project Pool Ideas'
    },
    {
      id: 3,
      code: 'WEEK 04',
      name: 'PROMPT-TO-PROD',
      subtitle: 'The whole club, one team · Zero slides',
      time: 'Mon–Thu · 11:50 AM – 01:00 PM',
      duration: '70 mins',
      format: 'Whole-Club Live Build Sprint',
      icon: Rocket,
      tagline: 'Everyone works on a single project, idea to live product. Something you built.',
      mechanicsTitle: '6 Sub-Teams (Pairs Experienced + Newcomers):',
      mechanics: [
        { label: 'DESIGN & UI', title: 'Product & Frontend', desc: 'One-page specs, UX flows, React components & responsive styles' },
        { label: 'API & AI', title: 'Backend & Prompts', desc: 'Database schemas, serverless APIs, Claude prompts & agent loops' },
        { label: 'QA & DOCS', title: 'Testing & Live Demo', desc: 'Integration test suites, PR reviews, live Vercel URL & README' }
      ],
      flow: 'Brief & task assignment → Git branch build → PR reviews & merge → Live demo deploy',
      charterRule: 'Every change is a pull request. Nobody pushes directly to main. Unfinished work carries over.',
      outputBadge: 'Rule: 100% Pull Requests (No Main Push) · Output: Live URL'
    }
  ];

  const handleNextEvent = () => {
    setSlideDirection(1);
    setCurrentEventIndex((prev) => (prev + 1) % events.length);
  };

  const handlePrevEvent = () => {
    setSlideDirection(-1);
    setCurrentEventIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1));
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: 'easeOut' as const },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.96,
      transition: { duration: 0.2, ease: 'easeIn' as const },
    }),
  };

  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[#FAF8F5] dark:bg-[#141210] text-claude-text dark:text-claude-darkText select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      
      {/* 1. TOP HEADER (C3 · CLAUDE CODE & COWORK) */}
      <header className="h-12 shrink-0 border-b border-[#E0DCD3] dark:border-claude-darkBorder bg-[#FAF8F5]/95 dark:bg-[#141210]/95 backdrop-blur-md px-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <img
            src="/assets/c3_emblem_trans.png"
            alt="C3"
            className="w-7 h-7 object-contain drop-shadow-sm"
          />
          <div>
            <div className="font-mono font-bold text-xs text-[#B8431E] dark:text-[#E07A5F] leading-tight tracking-wider">
              C3
            </div>
            <div className="text-[9px] text-claude-muted dark:text-claude-darkMuted font-sans">
              Claude Code &amp; Cowork · Dept of IT
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold tracking-wider">
            BATCH 01
          </span>
          <button
            onClick={() => {
              onOpenApply();
            }}
            className="px-2.5 py-1 rounded-lg bg-claude-terracotta text-white font-mono text-[10px] font-bold shadow-xs active:scale-95 transition-transform"
          >
            Apply
          </button>
        </div>
      </header>

      {/* 2. CENTRAL VIEWPORT: STRICTLY ZERO SCROLL & FULL SCREEN UTILIZATION */}
      <main className="flex-1 min-h-0 w-full overflow-hidden flex flex-col px-3 py-2 relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ABOUT · 100% AUTHENTIC CHARTER CONTENT */}
          {activeTab === 'about' && (
            <motion.div
              key="tab-about"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* 1. Calm Masthead Header */}
              <div className="shrink-0 text-center pt-1 pb-1">
                <div className="text-[10px] font-mono tracking-[0.22em] text-[#CC5A36] uppercase font-semibold">
                  C3 · Claude Code &amp; Cowork · ISLEC
                </div>
                <h1 className="font-serif text-[1.65rem] xs:text-[1.85rem] font-normal tracking-tight text-claude-text dark:text-claude-darkText leading-[1.12] mt-0.5">
                  Build your dream.{' '}
                  <span className="italic text-[#CC5A36] font-medium block xs:inline">
                    Or your startup.
                  </span>
                </h1>
                <p className="text-[11px] font-serif italic text-claude-muted dark:text-claude-darkMuted mt-0.5 max-w-xs mx-auto leading-tight">
                  Every week, together.
                </p>
              </div>

              {/* Lead Quote */}
              <div className="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-[#1E1D1A]/80 border border-[#E0DCD3] dark:border-white/10 text-left mb-1">
                <p className="text-[10.5px] text-claude-text dark:text-claude-darkText leading-relaxed font-sans">
                  C3 is a builder-first club. Everyone who joins works on a real project. Bring an idea and we help you build it and scale it. No idea yet? We help you find one.
                </p>
              </div>

              {/* Segmented SubTab Switcher (NO PILLS: rounded-xl, rounded-lg) */}
              <div className="shrink-0 w-full flex items-center justify-between gap-1 p-1 rounded-xl bg-white/60 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10 mb-1">
                <button
                  onClick={() => setAboutSubTab('ways')}
                  className={`flex-1 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                    aboutSubTab === 'ways'
                      ? 'bg-[#CC5A36] text-white shadow-xs'
                      : 'text-claude-muted hover:text-claude-text'
                  }`}
                >
                  01 TWO WAYS IN
                </button>
                <button
                  onClick={() => setAboutSubTab('beliefs')}
                  className={`flex-1 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                    aboutSubTab === 'beliefs'
                      ? 'bg-[#CC5A36] text-white shadow-xs'
                      : 'text-claude-muted hover:text-claude-text'
                  }`}
                >
                  02 WHAT WE BELIEVE
                </button>
                <button
                  onClick={() => setAboutSubTab('give_ask')}
                  className={`flex-1 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                    aboutSubTab === 'give_ask'
                      ? 'bg-[#CC5A36] text-white shadow-xs'
                      : 'text-claude-muted hover:text-claude-text'
                  }`}
                >
                  03 GIVE &amp; ASK
                </button>
              </div>

              {/* Central Content Card based on SubTab */}
              <div className="flex-1 min-h-0 rounded-2xl bg-white/90 dark:bg-[#1E1D1A]/95 border border-[#E0DCD3] dark:border-white/10 p-2.5 xs:p-3 flex flex-col shadow-2xs overflow-hidden my-0.5">
                {aboutSubTab === 'ways' && (
                  <div className="flex-1 min-h-0 flex flex-col justify-start gap-2 overflow-y-auto no-scrollbar text-left pr-0.5">
                    <div className="space-y-1 shrink-0">
                      <div className="text-[9px] font-mono font-bold text-[#CC5A36] uppercase tracking-wider">
                        TWO WAYS IN
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {aboutWaysIn.map((way, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10">
                            <div className="flex items-center justify-between mb-0.5">
                              <h3 className="font-serif text-xs font-bold text-claude-text dark:text-claude-darkText">
                                {way.title}
                              </h3>
                              <span className="text-[8px] font-mono font-bold text-[#CC5A36] px-1.5 py-0.2 rounded-md bg-[#CC5A36]/10">
                                {way.tag}
                              </span>
                            </div>
                            <p className="text-[9.5px] text-claude-muted dark:text-claude-darkMuted leading-snug">
                              {way.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* The Project Journey Strip */}
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shrink-0">
                      <div className="flex items-center justify-between text-[8px] font-mono text-stone-500 uppercase mb-0.5">
                        <span>The Project Journey</span>
                        <span className="text-[#CC5A36] font-bold">5 Stages</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        {['idea', 'pitched', 'building', 'shipped', 'scaling'].map((st, i) => (
                          <React.Fragment key={st}>
                            <span className="px-1.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-claude-text dark:text-claude-darkText font-medium">
                              {st}
                            </span>
                            {i < 4 && <span className="text-stone-400 text-[8px]">&gt;</span>}
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="text-[8.5px] text-claude-muted mt-1 leading-tight">
                        A project board on the website shows every project and the stage it has reached.
                      </p>
                    </div>

                    {/* What We Teach */}
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shrink-0">
                      <div className="text-[8px] font-mono font-bold text-[#CC5A36] uppercase mb-0.5">
                        WHAT WE TEACH
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {aboutTeaches.map((t, i) => (
                          <div key={i} className="text-left">
                            <div className="text-[9px] font-bold text-claude-text dark:text-claude-darkText leading-tight">
                              {t.title}
                            </div>
                            <div className="text-[8px] text-claude-muted leading-tight mt-0.5 line-clamp-2">
                              {t.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {aboutSubTab === 'beliefs' && (
                  <div className="flex-1 min-h-0 flex flex-col justify-start gap-2 overflow-y-auto no-scrollbar text-left pr-0.5">
                    <div className="text-[9px] font-mono font-bold text-[#CC5A36] uppercase tracking-wider shrink-0">
                      WHAT WE BELIEVE
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 shrink-0">
                      {aboutBeliefs.map((b, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-stone-50 dark:bg-white/5 border-l-3 border-l-[#CC5A36] border-stone-200/80 dark:border-white/10 border-t border-r border-b">
                          <h3 className="font-serif text-xs font-bold text-claude-text dark:text-claude-darkText">
                            {b.title}
                          </h3>
                          <p className="text-[9.5px] text-claude-muted dark:text-claude-darkMuted leading-snug mt-0.5">
                            {b.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#CC5A36]/10 border border-[#CC5A36]/20 text-[9px] font-mono text-[#CC5A36] text-center font-medium shrink-0">
                      "no members, only founders · ISL Engineering College"
                    </div>
                  </div>
                )}

                {aboutSubTab === 'give_ask' && (
                  <div className="flex-1 min-h-0 flex flex-col justify-start gap-2.5 overflow-y-auto no-scrollbar text-left pr-0.5">
                    <div className="text-[9px] font-mono font-bold text-[#CC5A36] uppercase tracking-wider shrink-0">
                      WHAT WE GIVE, WHAT WE ASK
                    </div>
                    <div className="space-y-2 shrink-0">
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <h3 className="font-serif text-xs font-bold text-emerald-900 dark:text-emerald-300">
                            C3 gives you
                          </h3>
                        </div>
                        <p className="text-[10px] text-stone-700 dark:text-stone-300 leading-snug">
                          Teammates and mentors, a clear path from idea to launch, tools, honest feedback, and a public record of what you built.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Zap className="w-3.5 h-3.5 text-[#CC5A36] shrink-0" />
                          <h3 className="font-serif text-xs font-bold text-amber-900 dark:text-amber-300">
                            C3 asks of you
                          </h3>
                        </div>
                        <p className="text-[10px] text-stone-700 dark:text-stone-300 leading-snug">
                          Commit to one project, show progress regularly, help others, and share what you learn.
                        </p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex items-center justify-between text-[9px] font-mono shrink-0">
                      <span className="text-stone-500">Next Intake</span>
                      <span className="text-[#CC5A36] font-bold">Batch 01 · 30 Builder Seats</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Apply Action Bar */}
              <div className="shrink-0 pt-1 pb-0.5">
                <button
                  onClick={() => onOpenApply()}
                  className="w-full py-2.5 px-4 rounded-xl bg-claude-terracotta hover:bg-[#B34B2A] text-white font-mono font-medium text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                >
                  <Rocket className="w-3.5 h-3.5 text-amber-200" />
                  <span>Apply for Cohort · Commit to a Project</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AUTHENTIC C3 FOUNDING BUILDER PASS */}
          {activeTab === 'pass' && (
            <motion.div
              key="tab-pass"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* Card Title Header (Clean line, NO PILLS) */}
              <div className="shrink-0 flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#CC5A36]" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-claude-text dark:text-claude-darkText">
                    FOUNDER CREDENTIAL
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {isUnlocked ? 'OFFICIALLY VERIFIED' : 'KEY REQUIRED'}
                </span>
              </div>

              {/* AUTHENTIC C3 HOLOGRAPHIC PASS CARD */}
              <div className="flex-1 min-h-0 rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br from-[#FAF8F5] via-[#F6F3EC] to-[#EFEAE1] dark:from-[#23221E] dark:via-[#1D1C19] dark:to-[#161513] border-2 border-[#CC5A36]/40 dark:border-[#CC5A36]/30 shadow-2xl relative overflow-hidden flex flex-col justify-between select-none my-1">
                
                {/* Holographic Dynamic Sheen Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 mix-blend-overlay bg-gradient-to-tr from-[#CC5A36]/30 via-amber-500/20 to-transparent" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#CC5A36]/20 via-amber-500/15 to-transparent rounded-bl-full pointer-events-none" />

                {/* Left & Right Ticket Notches */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#FAF8F5] dark:bg-[#141210] rounded-r-full border-r border-y border-[#CC5A36]/40" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-6 bg-[#FAF8F5] dark:bg-[#141210] rounded-l-full border-l border-y border-[#CC5A36]/40" />

                {/* 1. Pass Top Header (Clean typography, NO PILLS) */}
                <div className="flex items-center justify-between pb-2 border-b border-[#E0DCD3] dark:border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <img
                      src="/assets/c3_emblem_trans.png"
                      alt="C3"
                      className="w-7 h-7 object-contain drop-shadow-sm"
                    />
                    <div>
                      <div className="font-mono font-bold text-xs text-[#B8431E] leading-tight tracking-wider">
                        C3 COLLECTIVE
                      </div>
                      <div className="text-[8px] text-claude-muted font-mono uppercase">
                        Claude Code &amp; Cowork · Dept of IT
                      </div>
                      <div className="text-[7.5px] text-claude-muted/80 font-sans">
                        ISL Engineering College · UGC Autonomous
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                      FOUNDING PASS
                    </span>
                    <span className="block text-[8px] font-mono text-claude-muted mt-0.5">
                      BATCH 01 CORE
                    </span>
                  </div>
                </div>

                {/* 2. Builder Identity Section */}
                <div className="py-1 shrink-0">
                  <div className="text-[8px] font-mono text-claude-muted uppercase tracking-wider">
                    BUILDER IDENTITY
                  </div>
                  <div className="font-serif font-bold text-lg text-claude-text dark:text-claude-darkText leading-tight truncate">
                    {memberName}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#CC5A36]/15 text-[#CC5A36] text-[9px] font-mono font-bold border border-[#CC5A36]/25">
                      {memberBranch}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-claude-text dark:text-claude-darkText text-[9px] font-sans border border-black/5 dark:border-white/10">
                      {memberRole}
                    </span>
                  </div>
                </div>

                {/* 3. Session Timings & Campus Venue Utility Box */}
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10 shrink-0">
                  <div>
                    <div className="flex items-center gap-1 text-[8px] font-mono text-claude-muted">
                      <Clock className="w-2.5 h-2.5 text-[#CC5A36]" />
                      <span>TIMINGS</span>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-claude-text dark:text-claude-darkText mt-0.5">
                      Mon–Thu · 10 AM – 1 PM
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[8px] font-mono text-claude-muted">
                      <MapPin className="w-2.5 h-2.5 text-[#CC5A36]" />
                      <span>VENUE</span>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-claude-text dark:text-claude-darkText mt-0.5">
                      Innovation Lab 3 · Office
                    </div>
                  </div>
                </div>

                {/* 4. Pass Code, Status, Barcode & Live Scannable QR */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E0DCD3] dark:border-white/10 shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[8px] font-mono text-claude-muted uppercase">
                          PASS CODE
                        </div>
                        <div className="font-mono font-bold text-xs text-[#CC5A36] tracking-wider flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          <span>FND-{founderKey}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[8px] font-mono text-claude-muted uppercase">
                          STATUS
                        </div>
                        <div className="text-[9px] font-mono font-bold text-emerald-600">
                          {isUnlocked ? '✓ VERIFIED' : 'PENDING'}
                        </div>
                      </div>
                    </div>

                    {/* Decorative SVG Barcode lines */}
                    <div className="flex items-center gap-0.5 h-4 mt-1 opacity-70">
                      {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 5, 2, 4, 1].map((w, idx) => (
                        <div
                          key={idx}
                          className="bg-claude-text dark:bg-claude-darkText h-full"
                          style={{ width: `${(w % 2) + 1}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* High contrast sharp QR code */}
                  <div className="shrink-0 p-1 rounded-xl bg-white dark:bg-white/95 border border-[#E0DCD3] shadow-xs flex flex-col items-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Pass QR" className="w-14 h-14 object-contain" />
                    ) : (
                      <div className="w-14 h-14 bg-stone-100 flex items-center justify-center text-[8px] font-mono text-stone-400">
                        QR
                      </div>
                    )}
                    <span className="text-[7px] font-mono text-stone-500 mt-0.5 leading-none">
                      SCAN TO VERIFY
                    </span>
                  </div>
                </div>

                {/* 5. Ticket Footer Strip */}
                <div className="rounded-lg bg-[#1F1E1B] text-[#FAF8F5] px-2.5 py-1 flex items-center justify-between text-[8px] font-mono shrink-0 mt-0.5">
                  <span className="tracking-wider">OFFICIAL ACCESS PASS · BATCH 01</span>
                  <span className="text-[#CC5A36] font-bold">BUILD OR SHIP</span>
                </div>
              </div>

              {/* CARD CONTROLS (UNLOCKED VS LOCKED) */}
              <div className="shrink-0 pt-0.5">
                {isUnlocked ? (
                  <div className="w-full flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white dark:bg-[#1E1D1A] border border-[#E0DCD3] dark:border-white/10 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
                    </button>

                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-claude-terracotta text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Print / Save</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUnlockKey} className="w-full space-y-1.5">
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
                        <span className="text-claude-muted">Need a founder key?</span>
                        <button
                          type="button"
                          onClick={() => {
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
              </div>
            </motion.div>
          )}

          {/* TAB 3: STRUCTURE · 100% AUTHENTIC CHARTER CONTENT */}
          {activeTab === 'structure' && (
            <motion.div
              key="tab-structure"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* 1. Masthead Header */}
              <div className="shrink-0 text-center pt-1 pb-1">
                <div className="text-[10px] font-mono tracking-[0.22em] text-[#CC5A36] uppercase font-semibold">
                  GOVERNANCE &amp; CONTINUITY
                </div>
                <h1 className="font-serif text-[1.65rem] xs:text-[1.85rem] font-normal tracking-tight text-claude-text dark:text-claude-darkText leading-[1.12] mt-0.5">
                  A club built to{' '}
                  <span className="italic text-[#CC5A36] font-medium">
                    outlast
                  </span>{' '}
                  its founders.
                </h1>
                <p className="text-[10.5px] font-serif italic text-claude-muted dark:text-claude-darkMuted mt-0.5 max-w-xs mx-auto leading-tight">
                  People graduate every year. Designed to survive a full change of leadership.
                </p>
              </div>

              {/* Segmented Switcher (NO PILLS: rounded-xl, rounded-lg) */}
              <div className="shrink-0 w-full flex items-center justify-between gap-1 p-1 rounded-xl bg-white/60 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10 mb-1">
                <button
                  onClick={() => setStructureSubTab('team')}
                  className={`flex-1 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                    structureSubTab === 'team'
                      ? 'bg-[#CC5A36] text-white shadow-xs'
                      : 'text-claude-muted hover:text-claude-text'
                  }`}
                >
                  01 CORE TEAM
                </button>
                <button
                  onClick={() => setStructureSubTab('infra')}
                  className={`flex-1 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                    structureSubTab === 'infra'
                      ? 'bg-[#CC5A36] text-white shadow-xs'
                      : 'text-claude-muted hover:text-claude-text'
                  }`}
                >
                  02 INFRASTRUCTURE
                </button>
                <button
                  onClick={() => setStructureSubTab('timeline')}
                  className={`flex-1 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${
                    structureSubTab === 'timeline'
                      ? 'bg-[#CC5A36] text-white shadow-xs'
                      : 'text-claude-muted hover:text-claude-text'
                  }`}
                >
                  03 FIRST 30 DAYS
                </button>
              </div>

              {/* Central Card with content based on SubTab */}
              <div className="flex-1 min-h-0 rounded-2xl bg-white/90 dark:bg-[#1E1D1A]/95 border border-[#E0DCD3] dark:border-white/10 p-2.5 xs:p-3 flex flex-col shadow-2xs overflow-hidden my-0.5">
                {structureSubTab === 'team' && (
                  <div className="flex-1 min-h-0 flex flex-col justify-start gap-2 overflow-y-auto no-scrollbar text-left pr-0.5">
                    {/* Charter block */}
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-white/5 border-l-3 border-l-[#CC5A36] border-stone-200/80 dark:border-white/10 border-t border-r border-b shrink-0">
                      <div className="text-[8.5px] font-mono font-bold text-[#CC5A36] uppercase tracking-wider">
                        CHARTER · ONE PAGE
                      </div>
                      <p className="text-[9.5px] text-claude-muted dark:text-claude-darkMuted leading-tight mt-0.5">
                        Purpose, the "only founders" philosophy, what C3 does and doesn't do, and how decisions are made. Changed only through a defined process.
                      </p>
                    </div>

                    {/* Core team · one-year terms */}
                    <div className="space-y-1 shrink-0">
                      <div className="text-[8.5px] font-mono font-bold text-claude-text dark:text-claude-darkText uppercase tracking-wider">
                        CORE TEAM · ONE-YEAR TERMS
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {structureCoreTeam.map((m, i) => {
                          const IconComponent = m.icon;
                          return (
                            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10">
                              <div className="w-5 h-5 rounded-md bg-[#CC5A36]/10 flex items-center justify-center text-[#CC5A36] shrink-0">
                                <IconComponent className="w-3 h-3" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-[9.5px] text-claude-text dark:text-claude-darkText mr-1">
                                  {m.role}:
                                </span>
                                <span className="text-[9px] text-claude-muted leading-tight">
                                  {m.desc}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deputy rule & Cohorts note */}
                    <div className="space-y-1 shrink-0 pt-0.5">
                      <div className="px-2.5 py-1 rounded-lg bg-[#CC5A36]/10 border border-[#CC5A36]/20 text-[8.5px] font-mono text-[#CC5A36] leading-tight">
                        <b>Deputy Rule:</b> Every role has a deputy who takes over next year. Nobody holds a role without someone shadowing them.
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 text-[8.5px] font-mono text-stone-600 dark:text-stone-300 leading-tight">
                        <b>Cohorts:</b> Each intake is a named generation: Founders Gen 1, Gen 2, etc. Everyone is a founder of their cohort.
                      </div>
                    </div>
                  </div>
                )}

                {structureSubTab === 'infra' && (
                  <div className="flex-1 min-h-0 flex flex-col justify-start gap-2.5 overflow-y-auto no-scrollbar text-left pr-0.5">
                    {/* Infrastructure the club owns */}
                    <div className="space-y-1 shrink-0">
                      <div className="text-[8.5px] font-mono font-bold text-[#CC5A36] uppercase tracking-wider">
                        INFRASTRUCTURE THE CLUB OWNS
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 space-y-1.5 font-mono text-[9px]">
                        {structureInfrastructure.map((inf, i) => (
                          <div key={i} className="flex items-start gap-2 leading-tight">
                            <b className="text-[#CC5A36] font-semibold w-24 shrink-0">{inf.name}</b>
                            <span className="text-claude-muted leading-tight">{inf.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alumni & faculty */}
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border-l-3 border-l-emerald-600 border-stone-200/80 dark:border-white/10 border-t border-r border-b shrink-0">
                      <div className="text-[8.5px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                        ALUMNI AND FACULTY
                      </div>
                      <p className="text-[9.5px] text-claude-muted dark:text-claude-darkMuted leading-tight mt-0.5">
                        Keep an alumni directory and invite alumni to demos and mentoring. Report results to faculty each semester: projects shipped and people trained.
                      </p>
                    </div>

                    {/* Contribution ladder */}
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shrink-0">
                      <div className="text-[8.5px] font-mono font-bold text-[#CC5A36] uppercase tracking-wider mb-1">
                        CONTRIBUTION LADDER
                      </div>
                      <div className="flex items-center justify-between text-[8.5px] font-mono">
                        {['newcomer', 'builder', 'shipper', 'maintainer', 'mentor'].map((lvl, i) => (
                          <React.Fragment key={lvl}>
                            <span className="px-1.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-claude-text dark:text-claude-darkText font-medium">
                              {lvl}
                            </span>
                            {i < 4 && <span className="text-stone-400 text-[8px]">&gt;</span>}
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="text-[8px] text-claude-muted mt-1 leading-tight">
                        Each level is earned by action, such as a first merged pull request, a first shipped project, or mentoring a newcomer.
                      </p>
                    </div>
                  </div>
                )}

                {structureSubTab === 'timeline' && (
                  <div className="flex-1 min-h-0 flex flex-col justify-start gap-2.5 overflow-y-auto no-scrollbar text-left pr-0.5">
                    {/* First 30 Days */}
                    <div className="space-y-1 shrink-0">
                      <div className="text-[8.5px] font-mono font-bold text-[#CC5A36] uppercase tracking-wider">
                        FIRST 30 DAYS · EXECUTION CHECKLIST
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {structureFirst30Days.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10">
                            <span className="font-mono font-bold text-[8.5px] text-[#CC5A36] w-4 shrink-0">
                              0{idx + 1}
                            </span>
                            <span className="text-[9.5px] text-claude-text dark:text-claude-darkText font-medium leading-tight">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Path */}
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shrink-0">
                      <div className="text-[8.5px] font-mono font-bold text-claude-text dark:text-claude-darkText uppercase tracking-wider mb-1">
                        5-STEP LEARNING PATH
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-[9px] text-claude-muted">
                        {structureLearningPath.map((item, idx) => (
                          <div key={idx} className="leading-tight">{idx + 1}. {item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Continuity Banner */}
              <div className="shrink-0 pt-1 pb-0.5">
                <div className="px-3 py-2 rounded-xl bg-[#CC5A36]/10 border border-[#CC5A36]/20 flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#CC5A36] font-bold">100% Shared Infrastructure</span>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className="text-claude-text dark:text-claude-darkText underline hover:text-[#CC5A36]"
                  >
                    Explore Learning Path →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: ROADMAP · 5-STEP LEARNING PATH & CONTRIBUTION LADDER */}
          {activeTab === 'roadmap' && (
            <motion.div
              key="tab-roadmap"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* Stage Segmented Switcher */}
              <div className="shrink-0 w-full flex items-center justify-between gap-1 p-1 rounded-xl bg-white/60 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10">
                {roadmapStages.map((stg, idx) => {
                  const isCurrent = idx === activeStageIndex;
                  return (
                    <button
                      key={stg.id}
                      onClick={() => {
                        setActiveStageIndex(idx);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all truncate px-0.5 ${
                        isCurrent
                          ? 'bg-[#CC5A36] text-white shadow-xs'
                          : 'text-claude-muted hover:text-claude-text'
                      }`}
                    >
                      {stg.stage}
                    </button>
                  );
                })}
              </div>

              {/* Active Roadmap Stage Card (Fills height without empty void) */}
              {(() => {
                const current = roadmapStages[activeStageIndex];
                return (
                  <div className="flex-1 min-h-0 rounded-2xl p-3 xs:p-3.5 bg-white dark:bg-[#1E1D1A] border border-[#E0DCD3] dark:border-white/10 shadow-sm flex flex-col justify-between my-1.5 text-left overflow-hidden">
                    <div className="flex-1 min-h-0 flex flex-col justify-start gap-1.5 overflow-y-auto no-scrollbar pr-0.5">
                      {/* Top Header Strip */}
                      <div className="flex items-center justify-between shrink-0">
                        <span className="text-[9px] font-mono font-bold text-[#CC5A36] px-2 py-0.5 rounded-md bg-[#CC5A36]/10 border border-[#CC5A36]/20">
                          {current.badge}
                        </span>
                        <span className="text-[9px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                          {current.ladder}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="shrink-0">
                        <h2 className="font-serif text-lg xs:text-xl font-bold text-claude-text dark:text-claude-darkText leading-tight">
                          {current.title}
                        </h2>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[11px] font-mono text-[#CC5A36] font-semibold truncate">
                            {current.subtitle}
                          </p>
                          <span className="text-[8.5px] font-mono text-stone-500 shrink-0">
                            {current.journeyStep}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-claude-muted dark:text-claude-darkMuted leading-snug shrink-0">
                        {current.desc}
                      </p>

                      {/* Structured Phased Breakdown Box */}
                      <div className="p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 space-y-1 shrink-0">
                        <div className="text-[9px] font-mono font-bold text-claude-text dark:text-claude-darkText uppercase">
                          {current.breakdownTitle}
                        </div>
                        <div className="space-y-1">
                          {current.phases.map((ph, i) => (
                            <div key={i} className="flex items-start gap-2 text-[10px] leading-tight">
                              <span className="font-mono font-bold text-[#CC5A36] shrink-0 text-[9px] w-14">
                                {ph.label}
                              </span>
                              <div className="min-w-0">
                                <span className="font-bold text-claude-text dark:text-claude-darkText mr-1">
                                  {ph.title}:
                                </span>
                                <span className="text-claude-muted">{ph.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Milestone Checklist */}
                      <div className="space-y-1 shrink-0">
                        <div className="text-[9px] font-mono font-bold text-claude-text uppercase">
                          Milestone Checklist:
                        </div>
                        <div className="grid grid-cols-1 gap-0.5">
                          {current.deliverables.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] text-claude-muted leading-tight">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Project Journey Progress Strip (From charter) */}
                      <div className="p-1.5 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shrink-0">
                        <div className="flex items-center justify-between text-[8px] font-mono text-stone-500 uppercase mb-0.5">
                          <span>Project Journey</span>
                          <span className="text-[#CC5A36] font-bold">{current.journeyStep}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          {['idea', 'pitched', 'building', 'shipped', 'scaling'].map((step, sIdx) => {
                            const isCurrentStep = step === current.journeyCurrent;
                            return (
                              <React.Fragment key={step}>
                                <span
                                  className={`px-1.5 py-0.5 rounded-md transition-colors ${
                                    isCurrentStep
                                      ? 'bg-[#CC5A36] text-white font-bold'
                                      : 'text-stone-400 dark:text-stone-500'
                                  }`}
                                >
                                  {step}
                                </span>
                                {sIdx < 4 && <span className="text-stone-300 dark:text-stone-600 text-[8px]">›</span>}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                      {/* Charter Belief Callout */}
                      <div className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#151412] border border-[#E0DCD3]/70 dark:border-white/10 text-[10px] font-serif italic text-claude-text dark:text-claude-darkText leading-snug shrink-0">
                        "{current.belief}"
                      </div>

                      {/* Milestone Outcome Strip (Sitting directly above nav) */}
                      <div className="px-2.5 py-1 rounded-lg bg-[#CC5A36]/10 border border-[#CC5A36]/20 text-[9px] font-mono text-[#CC5A36] font-medium text-center shrink-0">
                        {current.outcome}
                      </div>
                    </div>

                    {/* Bottom Nav Controls */}
                    <div className="pt-2 border-t border-[#E0DCD3] dark:border-white/10 flex items-center justify-between text-[11px] font-mono shrink-0 mt-1.5">
                      <button
                        onClick={() => {
                          setActiveStageIndex((prev) => (prev > 0 ? prev - 1 : roadmapStages.length - 1));
                        }}
                        className="text-claude-muted font-bold flex items-center gap-1 hover:text-[#CC5A36]"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>

                      {/* Micro-dashes indicator (NO pills) */}
                      <div className="flex items-center gap-1">
                        {roadmapStages.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1 rounded-xs transition-all ${
                              idx === activeStageIndex ? 'w-4 bg-[#CC5A36]' : 'w-2 bg-stone-300 dark:bg-stone-700'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setActiveStageIndex((prev) => (prev + 1) % roadmapStages.length);
                        }}
                        className="text-[#CC5A36] font-bold flex items-center gap-1 hover:underline"
                      >
                        <span>Next Stage</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}

          {/* TAB 5: EVENTS & SESSIONS (THE 4-WEEK MONTHLY CYCLE WITH SLIDE ANIMATION) */}
          {activeTab === 'events' && (
            <motion.div
              key="tab-events"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex flex-col justify-between"
            >
              {/* Event Switcher Tabs (4 Weeks) */}
              <div className="shrink-0 w-full flex items-center justify-between gap-1 p-1 rounded-xl bg-white/60 dark:bg-white/5 border border-[#E0DCD3] dark:border-white/10">
                {events.map((evt, idx) => {
                  const isCurrent = idx === currentEventIndex;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => {
                        setSlideDirection(idx > currentEventIndex ? 1 : -1);
                        setCurrentEventIndex(idx);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all truncate px-1 ${
                        isCurrent
                          ? 'bg-[#CC5A36] text-white shadow-xs'
                          : 'text-claude-muted hover:text-claude-text'
                      }`}
                    >
                      {evt.code}
                    </button>
                  );
                })}
              </div>

              {/* SLIDE CARD CONTAINER (ANIMATED WITH FRAMER MOTION + DRAG GESTURE) */}
              <div className="flex-1 min-h-0 relative my-2 overflow-hidden">
                <AnimatePresence custom={slideDirection} mode="wait">
                  {(() => {
                    const current = events[currentEventIndex];
                    const IconComponent = current.icon;
                    return (
                      <motion.div
                        key={current.id}
                        custom={slideDirection}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_e, { offset }) => {
                          if (offset.x < -40) handleNextEvent();
                          else if (offset.x > 40) handlePrevEvent();
                        }}
                        className="w-full h-full rounded-2xl p-3 xs:p-3.5 bg-white dark:bg-[#1E1D1A] border border-[#E0DCD3] dark:border-white/10 shadow-sm flex flex-col justify-between text-left touch-pan-y overflow-hidden my-0"
                      >
                        <div className="flex-1 min-h-0 flex flex-col justify-start gap-1.5 overflow-y-auto no-scrollbar pr-0.5">
                          {/* Event Header Strip */}
                          <div className="flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#CC5A36]/10 border border-[#CC5A36]/20 flex items-center justify-center text-[#CC5A36]">
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="text-[10px] font-mono font-bold text-[#CC5A36] block leading-none">
                                  {current.code} · {current.name}
                                </span>
                                <span className="text-[9px] font-mono text-claude-muted">
                                  {current.time}
                                </span>
                              </div>
                            </div>
                            <span className="text-[9px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                              {current.duration}
                            </span>
                          </div>

                          {/* Event Subtitle & Format */}
                          <div className="shrink-0">
                            <h2 className="font-serif text-lg xs:text-xl font-bold text-claude-text dark:text-claude-darkText leading-tight">
                              {current.subtitle}
                            </h2>
                            <p className="text-[10px] font-mono text-[#CC5A36] font-medium mt-0.5">
                              Format: {current.format} · Lab 3
                            </p>
                          </div>

                          {/* Tagline / Charter Quote */}
                          <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#151412] border border-[#E0DCD3]/60 dark:border-white/10 shrink-0">
                            <p className="text-[11px] text-claude-text dark:text-claude-darkText italic font-serif leading-snug">
                              "{current.tagline}"
                            </p>
                          </div>

                          {/* Structured Mechanics Box */}
                          <div className="p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 space-y-1 shrink-0">
                            <div className="text-[9px] font-mono font-bold text-claude-text dark:text-claude-darkText uppercase">
                              {current.mechanicsTitle}
                            </div>
                            <div className="space-y-1">
                              {current.mechanics.map((m, i) => (
                                <div key={i} className="flex items-start gap-2 text-[10px] leading-tight">
                                  <span className="font-mono font-bold text-[#CC5A36] shrink-0 text-[9px] w-16">
                                    {m.label}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="font-bold text-claude-text dark:text-claude-darkText mr-1">
                                      {m.title}:
                                    </span>
                                    <span className="text-claude-muted">{m.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Session Flow */}
                          <div className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-[9px] font-mono text-claude-muted leading-tight shrink-0">
                            <span className="font-bold text-claude-text mr-1">Flow:</span>
                            {current.flow}
                          </div>

                          {/* Charter Governance Rule Callout */}
                          <div className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#151412] border border-[#E0DCD3]/70 dark:border-white/10 text-[10px] font-serif italic text-claude-text dark:text-claude-darkText leading-snug shrink-0">
                            "{current.charterRule}"
                          </div>

                          {/* Binding Output Strip */}
                          <div className="px-2.5 py-1 rounded-lg bg-[#CC5A36]/10 border border-[#CC5A36]/20 text-[9px] font-mono text-[#CC5A36] font-medium text-center shrink-0">
                            {current.outputBadge}
                          </div>
                        </div>

                        {/* Slide Card Navigation Controls */}
                        <div className="pt-2 border-t border-[#E0DCD3] dark:border-white/10 flex items-center justify-between text-[11px] font-mono shrink-0 mt-1.5">
                          <button
                            onClick={handlePrevEvent}
                            className="text-claude-muted font-bold flex items-center gap-0.5 hover:text-[#CC5A36]"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Prev</span>
                          </button>

                          {/* Micro-dashes indicator (NO pills) */}
                          <div className="flex items-center gap-1">
                            {events.map((_, dotIdx) => (
                              <button
                                key={dotIdx}
                                onClick={() => {
                                  setSlideDirection(dotIdx > currentEventIndex ? 1 : -1);
                                  setCurrentEventIndex(dotIdx);
                                }}
                                className={`h-1 rounded-xs transition-all ${
                                  dotIdx === currentEventIndex
                                    ? 'bg-[#CC5A36] w-4'
                                    : 'bg-stone-300 dark:bg-stone-700 w-2'
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            onClick={handleNextEvent}
                            className="text-[#CC5A36] font-bold flex items-center gap-0.5 hover:underline"
                          >
                            <span>Next Week</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>

              {/* Bottom Event Action Banner */}
              <div className="shrink-0 py-1.5 px-2.5 rounded-xl bg-[#CC5A36]/5 border border-[#CC5A36]/20 flex items-center justify-between">
                <span className="text-[9px] font-mono text-claude-text dark:text-claude-darkText">
                  Monthly Cycle · In-Person in Lab 3
                </span>
                <button
                  onClick={() => {
                    onOpenApply();
                  }}
                  className="text-[9px] font-mono text-[#CC5A36] font-bold hover:underline shrink-0 ml-1"
                >
                  Join Next Cycle →
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION BAR (~56px, ZERO SCROLL) */}
      <nav className="h-14 shrink-0 border-t border-[#E0DCD3] dark:border-claude-darkBorder bg-[#FAF8F5]/98 dark:bg-[#141210]/98 backdrop-blur-lg px-2 flex items-center justify-around z-30 shadow-2xl">
        
        {/* Tab 1: About */}
        <button
          onClick={() => {
            setActiveTab('about');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'about'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[9px] font-mono">About</span>
        </button>

        {/* Tab 2: Pass */}
        <button
          onClick={() => {
            setActiveTab('pass');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pass'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-[9px] font-mono">Pass</span>
        </button>

        {/* Tab 3: Structure */}
        <button
          onClick={() => {
            setActiveTab('structure');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'structure'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[9px] font-mono">Structure</span>
        </button>

        {/* Tab 4: Roadmap */}
        <button
          onClick={() => {
            setActiveTab('roadmap');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'roadmap'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] font-mono">Roadmap</span>
        </button>

        {/* Tab 5: Events (Replaced AI Lab with slide card animation) */}
        <button
          onClick={() => {
            setActiveTab('events');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'text-[#CC5A36] font-bold scale-105'
              : 'text-claude-muted hover:text-claude-text'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span className="text-[9px] font-mono">Events</span>
        </button>

      </nav>

    </div>
  );
};
