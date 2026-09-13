import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, CheckCircle2, Shield, Clock, MapPin, Copy, Key, Lock, Unlock, AlertCircle, ArrowRight, Printer } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { validateFounderKey, savePassToOrganizerQueue } from '../utils/founderAuth';
import { fetchMemberByKey, claimPassApi } from '../utils/api';

interface FoundingPassProps {
  onOpenApply: () => void;
  externalKey?: string;
}

export const FoundingPass: React.FC<FoundingPassProps> = ({ onOpenApply, externalKey }) => {
  const [name, setName] = useState('Syed Farhan');
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState('3rd Year');
  const [rolePreset, setRolePreset] = useState('Vibe Coder / Shipper');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');
  
  // Access control state
  const [founderKey, setFounderKey] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [keyError, setKeyError] = useState('');

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [printSavedNotice, setPrintSavedNotice] = useState(false);

  // Mouse tilt tracking state
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Computed builder role
  const effectiveRole = isCustomRole ? (customRoleText.trim() || 'Founding Builder') : rolePreset;

  const unlockWithKey = async (code: string) => {
    const res = validateFounderKey(code);
    if (res.isValid) {
      setFounderKey(res.normalizedKey);
      setIsUnlocked(true);
      setKeyError('');
      sounds.playSuccess();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#CC5A36', '#D97757', '#FAF8F5', '#1F1E1B']
        });
      } catch {}

      // Look up member from backend to pre-populate their official name & details
      const member = await fetchMemberByKey(res.normalizedKey);
      if (member) {
        if (member.name) setName(member.name);
        if (member.branch) setBranch(member.branch);
        if (member.year) setYear(member.year);
        if (member.customRole) {
          setIsCustomRole(true);
          setCustomRoleText(member.customRole);
        } else if (member.role) {
          setRolePreset(member.role);
        }
      }
    } else {
      setKeyError(res.message || 'Invalid Founder Key. Please check the key in your acceptance email.');
      sounds.playKey();
    }
  };

  // Watch for external key triggers (e.g. from Acceptance Letter)
  useEffect(() => {
    if (externalKey) {
      unlockWithKey(externalKey);
    }
  }, [externalKey]);

  // Auto-detect ?code= or ?fnd= on mount
  useEffect(() => {
    const parseCode = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const hashParams = new URLSearchParams(hashQuery);
      return searchParams.get('code') || hashParams.get('code') || searchParams.get('fnd') || hashParams.get('fnd') || searchParams.get('key') || hashParams.get('key');
    };

    const code = parseCode();
    if (code) {
      unlockWithKey(code);
    }
  }, []);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sounds.playClick();
    unlockWithKey(inputKey);
  };

  const getSerial = () => {
    if (founderKey) return founderKey;
    let hash = 0;
    const str = `${name}-${branch}-${year}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const num = Math.abs(hash % 9000) + 1000;
    return num.toString();
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

  // Export card to PNG using pure HTML5 Canvas for crisp, print-ready download
  const handleDownload = () => {
    sounds.playSuccess();
    setIsExporting(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
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
      ctx.roundRect(830, 70, 290, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('FOUNDING BUILDER', 870, 101);

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
      ctx.fillText(`${branch} · ${year} · ${effectiveRole}`, 80, 285);

      // Details Grid (Zero mentions of ₹0)
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
      renderItem('FOUNDER ACCESS KEY', getSerial(), 80, 440);
      renderItem('ADMISSION STATUS', 'Verified Founding Builder', 540, 440);

      // Footer Bar
      ctx.fillStyle = '#1F1E1B';
      ctx.fillRect(80, 520, 1040, 80);

      ctx.fillStyle = '#FAF8F5';
      ctx.font = '600 20px monospace';
      ctx.fillText('OFFICIAL FOUNDING TEAM ACCESS PASS · BATCH 01', 120, 568);

      ctx.fillStyle = '#CC5A36';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('BUILD OR SHIP', 950, 568);

      const passDataUrl = canvas.toDataURL('image/png');

      // 1. Download pass locally for student
      const link = document.createElement('a');
      link.download = `${(name || 'Builder').replace(/\s+/g, '_')}_C3_Founding_Pass.png`;
      link.href = passDataUrl;
      link.click();

      // 2. Automatically dispatch copy to organizer's print queue for physical badge printing
      savePassToOrganizerQueue({
        name: name || 'Anonymous Builder',
        branch,
        year,
        role: effectiveRole,
        serial: getSerial(),
        founderKey: founderKey || getSerial(),
        dataUrl: passDataUrl
      });

      // Persist claim to backend database
      claimPassApi({
        key: founderKey || getSerial(),
        name: name || 'Anonymous Builder',
        branch,
        year,
        role: effectiveRole,
        customRole: isCustomRole ? customRoleText : ''
      });

      setPrintSavedNotice(true);
      setTimeout(() => setPrintSavedNotice(false), 5000);
    }

    setTimeout(() => setIsExporting(false), 800);
  };

  const handleCopy = () => {
    sounds.playClick();
    const text = `🎟️ C3 Founding Builder Pass\nName: ${name}\nBranch: ${branch} (${year})\nRole: ${effectiveRole}\nKey: ${getSerial()}\nSchedule: Mon-Thu 10 AM - 1 PM @ C3 Campus Office, ISL Engineering College`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const rotateX = (mousePos.y - 0.5) * -16;
  const rotateY = (mousePos.x - 0.5) * 16;

  return (
    <section id="founding-pass" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-12">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <span className="font-mono text-xs tracking-[0.25em] text-claude-terracotta dark:text-claude-amber uppercase font-semibold block mb-3">
          Official Digital Credential · Batch 01
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-claude-text dark:text-claude-darkText tracking-tight mb-4">
          Claim Your <span className="italic text-claude-terracotta">Founding Builder Pass</span>
        </h2>
        <p className="text-sm sm:text-base text-claude-muted dark:text-claude-darkMuted leading-relaxed">
          Restricted to accepted Batch 01 members. Enter your unique <span className="font-mono font-semibold text-claude-terracotta">Founder Key</span> from your acceptance email to claim your digital pass and physical campus badge.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Gate or Live Form Controls */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 bg-claude-card dark:bg-claude-darkCard p-5 sm:p-7 rounded-2xl border border-claude-border dark:border-claude-darkBorder shadow-claude-card space-y-4"
        >
          {!isUnlocked ? (
            /* LOCKED SECURITY GATE */
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2.5 pb-2 border-b border-claude-border dark:border-claude-darkBorder">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-claude-text dark:text-claude-darkText">
                    Founder Key Required
                  </h3>
                  <p className="text-xs text-claude-muted dark:text-claude-darkMuted">
                    Enter the exclusive key from your acceptance email
                  </p>
                </div>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted mb-1.5 uppercase">
                    Founder Access Key
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputKey}
                      onChange={(e) => {
                        setInputKey(e.target.value);
                        setKeyError('');
                      }}
                      placeholder="Enter Founder Key (e.g. ZZRF)"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-claude-bg dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-claude-terracotta transition-colors"
                    />
                    <Key className="w-4 h-4 text-claude-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {keyError && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{keyError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-medium text-sm shadow-md transition-all cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Founding Pass</span>
                </button>
              </form>

              <div className="pt-2 border-t border-claude-border dark:border-claude-darkBorder text-center">
                <span className="text-xs text-claude-muted font-sans block mb-1">
                  Haven't received your acceptance key yet?
                </span>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenApply();
                  }}
                  className="text-xs font-mono font-bold text-claude-terracotta hover:underline cursor-pointer"
                >
                  Submit Official Application Form →
                </button>
              </div>
            </div>
          ) : (
            /* UNLOCKED CUSTOMIZATION FORM */
            <div className="space-y-4">
              <div className="border-b border-claude-border dark:border-claude-darkBorder pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-claude-text dark:text-claude-darkText">
                    Customize Your Pass
                  </h3>
                  <p className="text-xs text-claude-muted dark:text-claude-darkMuted mt-0.5">
                    Updates your 3D ticket in real time.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[11px] font-mono font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{founderKey}</span>
                </div>
              </div>

              {/* Full Name */}
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
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted mb-1.5 uppercase">
                    Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-claude-bg dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-sans focus:outline-none focus:border-claude-terracotta transition-colors"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="IT">IT (Information Tech)</option>
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

              {/* Builder Archetype (Presets + Custom Type) */}
              <div>
                <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted mb-1.5 uppercase">
                  Builder Role
                </label>
                <select
                  value={isCustomRole ? 'custom' : rolePreset}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomRole(true);
                    } else {
                      setIsCustomRole(false);
                      setRolePreset(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-claude-bg dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-sans focus:outline-none focus:border-claude-terracotta transition-colors"
                >
                  <option value="Vibe Coder / Shipper">Vibe Coder / Shipper (Zero Code to MVP)</option>
                  <option value="CLI Agent Hacker">CLI Agent Hacker (Claude Code CLI)</option>
                  <option value="Product Architect">Product Architect (Campus Problem Solver)</option>
                  <option value="Autonomous Systems Lead">Autonomous Systems Lead (MCP &amp; APIs)</option>
                  <option value="custom">Custom Role (Type your own title...)</option>
                </select>

                {isCustomRole && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <input
                      type="text"
                      value={customRoleText}
                      onChange={(e) => setCustomRoleText(e.target.value)}
                      placeholder="Type custom role (e.g. Prompt Engineer)"
                      className="w-full px-3.5 py-2 rounded-xl bg-claude-bg dark:bg-claude-darkBg border border-claude-terracotta text-claude-text dark:text-claude-darkText text-xs font-sans focus:outline-none"
                    />
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-medium text-sm shadow-md hover:shadow-claude-glow transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating...' : 'Download Pass (PNG)'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl bg-claude-bg dark:bg-claude-darkBg hover:bg-claude-cardMuted dark:hover:bg-claude-darkCardMuted border border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-medium transition-all"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {printSavedNotice && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-600 flex items-center gap-1.5 animate-fadeIn">
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>Pass copy automatically dispatched for campus badge printing!</span>
                </div>
              )}

              <p className="text-[11px] text-center text-claude-muted dark:text-claude-darkMuted pt-1">
                ⚡ Save your pass and show it at the C3 Office desk on Monday!
              </p>
            </div>
          )}
        </motion.div>

        {/* Right Side: 3D Holographic Interactive Ticket */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
            className="w-full max-w-xl rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-[#FAF8F5] via-[#F6F3EC] to-[#EFEAE1] dark:from-[#23221E] dark:via-[#1D1C19] dark:to-[#161513] border-2 border-claude-terracotta/40 shadow-2xl relative overflow-hidden select-none"
          >
            {/* Holographic Dynamic Sheen Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 350px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(204,90,54,0.4), rgba(217,119,87,0.2), transparent 70%)`,
              }}
            />

            {/* Subtle Ticket Notches on left & right */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-7 sm:h-8 bg-claude-bg dark:bg-claude-darkBg rounded-r-full border-r border-y border-claude-terracotta/40" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-7 sm:h-8 bg-claude-bg dark:bg-claude-darkBg rounded-l-full border-l border-y border-claude-terracotta/40" />

            {/* Pass Header */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 border-b border-claude-border/80 dark:border-claude-darkBorder pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/c3_emblem_trans.png"
                  alt="C3 Emblem"
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs sm:text-sm tracking-wider text-claude-terracotta dark:text-claude-amber">
                      C3 COLLECTIVE
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-claude-terracotta/10 text-claude-terracotta font-semibold">
                      BATCH 01
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-sans text-claude-muted dark:text-claude-darkMuted">
                    ISL Engineering College · Autonomous
                  </div>
                </div>
              </div>

              <div className="text-left xs:text-right self-start xs:self-auto">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold">
                  <Shield className="w-3 h-3" />
                  <span>FOUNDING PASS</span>
                </div>
                <div className="text-[10px] font-mono text-claude-muted mt-0.5 sm:mt-1">
                  BATCH 01 · CORE ADMISSION
                </div>
              </div>
            </div>

            {/* Pass Body: Builder Name & Details */}
            <div className="my-4 sm:my-5">
              <div className="text-[10px] sm:text-xs font-mono text-claude-muted uppercase tracking-wider mb-1">
                BUILDER IDENTITY
              </div>
              <div className="font-serif text-xl xs:text-2xl sm:text-3xl font-bold text-claude-text dark:text-claude-darkText truncate">
                {isUnlocked ? (name || 'Anonymous Builder') : 'Founder Key Pending'}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-claude-terracotta/10 text-claude-terracotta dark:text-claude-amber text-xs font-mono font-semibold">
                  {branch} · {year}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-claude-cardMuted dark:bg-claude-darkCard text-claude-text dark:text-claude-darkText text-xs font-sans">
                  {effectiveRole}
                </span>
              </div>
            </div>

            {/* Schedule & Location Box */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-claude-card/80 dark:bg-claude-darkCard/80 border border-claude-border dark:border-claude-darkBorder">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-claude-muted mb-0.5">
                  <Clock className="w-3 h-3 text-claude-terracotta" />
                  <span>SESSION TIMINGS</span>
                </div>
                <div className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                  Mon – Thu · 10 AM – 1 PM
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-claude-muted mb-0.5">
                  <MapPin className="w-3 h-3 text-claude-terracotta" />
                  <span>CAMPUS VENUE</span>
                </div>
                <div className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                  C3 Campus Office
                </div>
              </div>
            </div>

            {/* Barcode & Serial Footer */}
            <div className="mt-4 sm:mt-5 pt-3 border-t border-dashed border-claude-border dark:border-claude-darkBorder flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[9px] sm:text-[10px] text-claude-muted uppercase">
                  VERIFIED FOUNDER KEY
                </div>
                <div className="font-mono text-xs sm:text-xs font-bold text-claude-terracotta dark:text-claude-amber truncate">
                  {isUnlocked ? getSerial() : '••••••••'}
                </div>
              </div>

              {/* Decorative SVG Barcode */}
              <div className="flex items-center gap-0.5 h-6 sm:h-7 shrink-0 overflow-hidden">
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

          {/* Quick Apply Callout underneath Pass */}
          <div className="mt-4 flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2.5 text-center">
            <span className="text-xs text-claude-muted dark:text-claude-darkMuted font-mono">
              Ready to claim your seat?
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenApply();
              }}
              className="text-xs font-mono font-bold text-claude-terracotta hover:underline cursor-pointer"
            >
              Submit Official Application Form →
            </button>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
