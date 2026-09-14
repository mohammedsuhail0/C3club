import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Shield, 
  Clock, 
  MapPin, 
  Copy, 
  ArrowRight,
  ArrowDown,
  ChevronDown,
  Command,
  Zap,
  Users2,
  Terminal,
  Code2
} from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

interface PassHeroProps {
  onOpenApply: () => void;
}

export const PassHero: React.FC<PassHeroProps> = ({ onOpenApply }) => {
  const [name, setName] = useState('Syed Farhan');
  const [branch, setBranch] = useState('IT');
  const [year, setYear] = useState('3rd Year');
  const [role, setRole] = useState('Vibe Coder / Shipper');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Mouse tilt tracking state
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate unique serial number based on inputs
  const getSerial = () => {
    let hash = 0;
    const str = `${name}-${branch}-${year}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const num = Math.abs(hash % 900) + 100;
    return `C3-ISLEC-2026-#${num}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0.5, y: 0.5 });
  };

  // Export card to PNG using pure HTML5 Canvas for crisp, instant download
  const handleDownload = () => {
    sounds.playSuccess();
    setIsExporting(true);

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#CC5A36', '#D97757', '#FAF8F5', '#1F1E1B']
      });
    } catch {}

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Background gradient (warm paper)
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 700);
      bgGrad.addColorStop(0, '#FAF8F5');
      bgGrad.addColorStop(0.5, '#F5F2EC');
      bgGrad.addColorStop(1, '#EDE7DF');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 700);

      // Border with rounded corners
      ctx.strokeStyle = '#D97757';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 1140, 640);

      // Inner dashed accent line
      ctx.strokeStyle = 'rgba(204, 90, 54, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(45, 45, 1110, 610);
      ctx.setLineDash([]);

      // Top Header: Club Name & College
      ctx.fillStyle = '#CC5A36';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('C3 // CLAUDE CODE & COWORK', 80, 100);

      ctx.fillStyle = '#6B6860';
      ctx.font = '600 20px sans-serif';
      ctx.fillText('ISL ENGINEERING COLLEGE · HYDERABAD', 80, 130);

      // Badge: FOUNDING BUILDER PASS
      ctx.fillStyle = '#CC5A36';
      ctx.beginPath();
      ctx.roundRect(850, 70, 270, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('FOUNDING BUILDER', 890, 101);

      // Divider Line
      ctx.strokeStyle = '#E0DCD3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 160);
      ctx.lineTo(1120, 160);
      ctx.stroke();

      // Builder Name
      ctx.fillStyle = '#1F1E1B';
      ctx.font = 'bold 54px serif';
      ctx.fillText(name || 'Anonymous Builder', 80, 240);

      // Branch & Year Tag
      ctx.fillStyle = '#CC5A36';
      ctx.font = '600 24px sans-serif';
      ctx.fillText(`${branch} · ${year} · ${role}`, 80, 285);

      // Details Grid
      const renderItem = (label: string, value: string, x: number, y: number) => {
        ctx.fillStyle = '#8C887B';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(label.toUpperCase(), x, y);
        ctx.fillStyle = '#1F1E1B';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(value, x, y + 28);
      };

      renderItem('SESSION TIMINGS', 'Mon – Thu · 10:00 AM – 1:00 PM', 80, 350);
      renderItem('LOCATION / VENUE', 'C3 Campus Office · ISL Campus', 540, 350);
      renderItem('SERIAL NUMBER', getSerial(), 80, 440);
      renderItem('ELIGIBILITY STATUS', 'Verified · Founding Builder', 540, 440);

      // Footer Bar
      ctx.fillStyle = '#1F1E1B';
      ctx.fillRect(80, 520, 1040, 80);

      ctx.fillStyle = '#FAF8F5';
      ctx.font = '600 20px monospace';
      ctx.fillText('OFFICIAL FOUNDING TEAM ACCESS PASS · BATCH 01', 120, 568);

      ctx.fillStyle = '#CC5A36';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('BUILD OR SHIP', 950, 568);

      // Download trigger
      const link = document.createElement('a');
      link.download = `${(name || 'Builder').replace(/\s+/g, '_')}_C3_Founding_Pass.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    setTimeout(() => setIsExporting(false), 800);
  };

  const handleCopy = () => {
    sounds.playClick();
    const text = `🎟️ C3 Founding Builder Pass\nName: ${name}\nBranch: ${branch} (${year})\nSerial: ${getSerial()}\nSchedule: Mon-Thu 10 AM - 1 PM @ C3 Campus Office, ISL Engineering College`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const rotateX = (mousePos.y - 0.5) * -14;
  const rotateY = (mousePos.x - 0.5) * 14;

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 45]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);

  return (
    <>
      {/* 1. Fullscreen Monumental Hero Section - BIG TEXT, ZERO PILLS, PASS OFF-SCREEN */}
      <section 
        id="hero" 
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 z-10 select-none pt-16 pb-12"
      >
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-6xl mx-auto flex flex-col items-center justify-center my-auto"
        >
          {/* Plain, clean typography line for College - NO PILLS */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs sm:text-sm font-mono tracking-[0.25em] text-claude-terracotta dark:text-claude-amber uppercase font-semibold mb-6"
          >
            ISL Engineering College · Autonomous · Hyderabad
          </motion.div>

          {/* MASSIVE DISPLAY HEADLINE */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif font-normal text-6xl sm:text-8xl md:text-9xl lg:text-[7.5rem] xl:text-[8.5rem] tracking-tight leading-[0.98] text-claude-text dark:text-claude-darkText mb-6"
          >
            The Claude Code
            <span className="block mt-2 italic text-transparent bg-clip-text bg-gradient-to-r from-claude-terracotta via-amber-600 to-rose-600">
              &amp; Cowork.
            </span>
          </motion.h1>

          {/* Punchy Subhead - Clean typography */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl font-serif italic text-claude-muted dark:text-claude-darkMuted max-w-3xl mx-auto mb-3"
          >
            Ship real software every week. Zero slides.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xs sm:text-sm font-mono text-claude-muted dark:text-claude-darkMuted mb-10"
          >
            Mon–Thu 10:00 AM – 1:00 PM · Open to all branches &amp; all years (1st to 4th) · Batch 01 Core
          </motion.p>

          {/* BOLD "FORGE YOUR PASS" BUTTON - Sleek, prominent, not a pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              onClick={() => {
                sounds.playClick();
                document.getElementById('pass-studio')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-sans font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span className="tracking-wide">Forge Your Pass</span>
              <ArrowDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
            </button>
            <span className="font-mono text-xs text-claude-muted/70 dark:text-claude-darkMuted/70">
              ↓ Scroll to enter workbench
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. The Central Pass Studio Workbench (Dedicated full section below the fold) */}
      <section 
        id="pass-studio" 
        className="relative py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 scroll-mt-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Pass Form Controls & Cohort Stats */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-5 bg-claude-card dark:bg-claude-darkCard p-6 sm:p-7 rounded-3xl border border-claude-border dark:border-claude-darkBorder shadow-claude-card space-y-4"
        >
          <div className="flex items-center justify-between border-b border-claude-border dark:border-claude-darkBorder pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-claude-text dark:text-claude-darkText">
                Customize Your Pass
              </h2>
              <p className="text-xs text-claude-muted dark:text-claude-darkMuted">
                Live generates your credential in real time.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
              BATCH 01
            </span>
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted mb-1.5 uppercase">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Syed Farhan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-claude-bg dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-sans focus:outline-none focus:border-claude-terracotta transition-colors"
            />
          </div>

          {/* Branch & Year Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted mb-1.5 uppercase">
                Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-claude-bg dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-sans focus:outline-none focus:border-claude-terracotta transition-colors"
              >
                <option value="IT">IT (Information Tech)</option>
                <option value="CSE">CSE (Computer Science)</option>
                <option value="AI/DS">AI &amp; Data Science</option>
                <option value="ECE">ECE (Electronics)</option>
                <option value="MECH">Mechanical Engg</option>
                <option value="CIVIL">Civil Engg</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted mb-1.5 uppercase">
                Year of Study
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-claude-bg dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-sans focus:outline-none focus:border-claude-terracotta transition-colors"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
              </select>
            </div>
          </div>

          {/* Builder Track */}
          <div>
            <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted mb-1.5 uppercase">
              Builder Track
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-claude-bg dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-sans focus:outline-none focus:border-claude-terracotta transition-colors"
            >
              <option value="Vibe Coder / Shipper">Vibe Coder (Zero Code to Working MVP)</option>
              <option value="CLI Agent Hacker">CLI Agent Hacker (Claude Code CLI &amp; Git)</option>
              <option value="Campus Problem Solver">Campus Problem Solver (Academic Utilities)</option>
              <option value="Autonomous Systems Lead">Autonomous Systems Lead (MCP &amp; APIs)</option>
            </select>
          </div>

          {/* Buttons: Download Pass + Claim Seat */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-medium text-sm shadow-md hover:shadow-claude-glow transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Download Pass (PNG)'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playSuccess();
                onOpenApply();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-claude-cardMuted dark:bg-claude-darkCard hover:bg-claude-border/50 border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-claude-terracotta" />
              <span>Claim Seat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cohort Live Capacity Ticker */}
          <div className="pt-3 border-t border-claude-border dark:border-claude-darkBorder flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-claude-muted">
              <Users2 className="w-3.5 h-3.5 text-claude-terracotta" />
              <span>Cohort Capacity:</span>
            </div>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              ● 14 Claimed · 6 Seats Left
            </span>
          </div>
        </motion.div>

        {/* Right Side: 3D Holographic Card Front & Center */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-7 flex flex-col items-center justify-center"
          style={{ perspective: 1200 }}
        >
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
            className="w-full max-w-xl rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FAF8F5] via-[#F6F3EC] to-[#EFEAE1] dark:from-[#23221E] dark:via-[#1D1C19] dark:to-[#161513] border-2 border-claude-terracotta/40 shadow-2xl relative overflow-hidden select-none"
          >
            {/* Holographic Dynamic Sheen Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 350px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(204,90,54,0.4), rgba(217,119,87,0.2), transparent 70%)`,
              }}
            />

            {/* Subtle Ticket Notches */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-claude-bg dark:bg-claude-darkBg rounded-r-full border-r border-y border-claude-terracotta/40" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-claude-bg dark:bg-claude-darkBg rounded-l-full border-l border-y border-claude-terracotta/40" />

            {/* Pass Header */}
            <div className="flex items-start justify-between border-b border-claude-border/80 dark:border-claude-darkBorder pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/c3_emblem_trans.png"
                  alt="C3 Emblem"
                  className="w-12 h-12 object-contain drop-shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm tracking-wider text-claude-terracotta dark:text-claude-amber">
                      C3 COLLECTIVE
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-claude-terracotta/10 text-claude-terracotta font-semibold">
                      BATCH 01
                    </span>
                  </div>
                  <div className="text-xs font-sans text-claude-muted dark:text-claude-darkMuted">
                    ISL Engineering College · UGC Autonomous
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold">
                  <Shield className="w-3 h-3" />
                  <span>FOUNDING PASS</span>
                </div>
                <div className="text-[10px] font-mono text-claude-muted mt-1">
                  BATCH 01 · OFFICIAL ADMISSION
                </div>
              </div>
            </div>

            {/* Pass Body: Builder Name & Details */}
            <div className="my-5">
              <div className="text-xs font-mono text-claude-muted uppercase tracking-wider mb-1">
                BUILDER IDENTITY
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-claude-text dark:text-claude-darkText truncate">
                {name || 'Anonymous Builder'}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-claude-terracotta/10 text-claude-terracotta dark:text-claude-amber text-xs font-mono font-semibold">
                  {branch} · {year}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-claude-cardMuted dark:bg-claude-darkCard text-claude-text dark:text-claude-darkText text-xs font-sans">
                  {role}
                </span>
              </div>
            </div>

            {/* Schedule & Location Box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-claude-card/80 dark:bg-claude-darkCard/80 border border-claude-border dark:border-claude-darkBorder">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-claude-muted mb-0.5">
                  <Clock className="w-3 h-3 text-claude-terracotta" />
                  <span>SESSION TIMINGS</span>
                </div>
                <div className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                  Mon – Thu · 10 AM – 1 PM
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-claude-muted mb-0.5">
                  <MapPin className="w-3 h-3 text-claude-terracotta" />
                  <span>CAMPUS VENUE</span>
                </div>
                <div className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                  C3 Campus Office
                </div>
              </div>
            </div>

            {/* Barcode & Serial Footer */}
            <div className="mt-5 pt-3 border-t border-dashed border-claude-border dark:border-claude-darkBorder flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] text-claude-muted uppercase">
                  VERIFIED PASS CODE
                </div>
                <div className="font-mono text-xs font-bold text-claude-terracotta dark:text-claude-amber">
                  {getSerial()}
                </div>
              </div>

              {/* Decorative SVG Barcode */}
              <div className="flex items-center gap-0.5 h-7">
                {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-claude-text dark:bg-claude-darkText h-full opacity-60"
                    style={{ width: `${(w % 3) + 1.5}px` }}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Quick Actions underneath */}
          <div className="mt-4 flex items-center gap-4 text-xs font-mono">
            <button
              onClick={handleCopy}
              className="text-claude-muted hover:text-claude-text flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Pass Copied' : 'Copy Pass Info'}</span>
            </button>

            <span className="text-claude-border">|</span>

            <button
              onClick={() => {
                sounds.playClick();
                onOpenApply();
              }}
              className="font-bold text-claude-terracotta hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Submit Registration Form</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </motion.div>

        </div>
      </section>
    </>
  );
};
