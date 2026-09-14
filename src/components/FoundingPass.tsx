import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, CheckCircle2, Shield, Clock, MapPin, Copy, Key, Lock, Unlock, AlertCircle, ArrowRight, Printer } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { validateFounderKey, savePassToOrganizerQueue } from '../utils/founderAuth';
import { fetchMemberByKey, claimPassApi, verifyKeyApi } from '../utils/api';

interface FoundingPassProps {
  onOpenApply: () => void;
  externalKey?: string;
}

export const FoundingPass: React.FC<FoundingPassProps> = ({ onOpenApply, externalKey }) => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('IT');
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [customBranchText, setCustomBranchText] = useState('');

  const [year, setYear] = useState('3rd Year');
  const [isCustomYear, setIsCustomYear] = useState(false);
  const [customYearText, setCustomYearText] = useState('');

  const [rolePreset, setRolePreset] = useState('Vibe Coder / Shipper');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');
  const [isIdentityLocked, setIsIdentityLocked] = useState(false);

  const effectiveBranch = isCustomBranch ? (customBranchText.trim() || 'IT') : branch;
  const effectiveYear = isCustomYear ? (customYearText.trim() || '3rd Year') : year;
  
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

  const unlockWithKey = async (code: string, isFromUrlOrExternal: boolean = false) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase().replace(/^(C3-)?(FND-)?/i, '');

    // 1. Verify with backend API
    const apiRes = await verifyKeyApi(cleanCode);
    const localRes = validateFounderKey(cleanCode);
    const isValid = (apiRes && apiRes.isValid) || localRes.isValid;
    const finalKey = apiRes?.key || localRes.normalizedKey || cleanCode;

    if (isValid) {
      setFounderKey(finalKey);
      setIsUnlocked(true);
      setKeyError('');
      sounds.playSuccess();

      const triggerConfetti = () => {
        try {
          confetti({
            particleCount: 110,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#CC5A36', '#D97757', '#FAF8F5', '#1F1E1B', '#F59E0B']
          });
        } catch {}
      };

      if (isFromUrlOrExternal) {
        setTimeout(triggerConfetti, 700);
      } else {
        triggerConfetti();
      }

      // Look up member from backend to lock identity to official accepted applicant record
      const member = apiRes?.member || await fetchMemberByKey(finalKey);
      if (member) {
        if (member.name) {
          setName(member.name);
          setIsIdentityLocked(true); // Locked permanently to authentic applicant
        }
        if (member.branch) {
          const standardBranches = ['IT', 'CSE', 'AI/DS', 'ECE', 'MECH', 'CIVIL'];
          if (standardBranches.includes(member.branch)) {
            setBranch(member.branch);
            setIsCustomBranch(false);
          } else {
            setBranch('custom');
            setIsCustomBranch(true);
            setCustomBranchText(member.branch);
          }
        }
        if (member.year) {
          const standardYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
          if (standardYears.includes(member.year)) {
            setYear(member.year);
            setIsCustomYear(false);
          } else {
            setYear('custom');
            setIsCustomYear(true);
            setCustomYearText(member.year);
          }
        }
        if (member.customRole) {
          setIsCustomRole(true);
          setCustomRoleText(member.customRole);
        } else if (member.role) {
          setRolePreset(member.role);
        }
      }
    } else {
      setKeyError(localRes.message || 'Invalid or revoked Founder Key. Please check the key in your acceptance email.');
      sounds.playKey();
    }
  };

  // Watch for external key triggers (e.g. from Acceptance Letter)
  useEffect(() => {
    if (externalKey) {
      unlockWithKey(externalKey, true);
      const scrollToPass = () => {
        const el = document.getElementById('founding-pass');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      setTimeout(scrollToPass, 100);
      setTimeout(scrollToPass, 400);
    }
  }, [externalKey]);

  // Auto-detect ?code= or ?fnd= on mount and auto-scroll to the PASS section
  useEffect(() => {
    const parseCode = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
      const hashParams = new URLSearchParams(hashQuery);
      return searchParams.get('code') || hashParams.get('code') || searchParams.get('fnd') || hashParams.get('fnd') || searchParams.get('key') || hashParams.get('key');
    };

    const code = parseCode();
    if (code) {
      unlockWithKey(code, true);

      // Scroll smoothly to Founding Pass section
      const scrollToPass = () => {
        const el = document.getElementById('founding-pass');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      // Execute on initial render + after DOM/preloader settles
      scrollToPass();
      setTimeout(scrollToPass, 200);
      setTimeout(scrollToPass, 600);
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
    const str = `${name}-${effectiveBranch}-${effectiveYear}`;
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

      // Darker Orange Border with rounded corners
      ctx.strokeStyle = '#B8431E';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, 1140, 640);

      // Inner dashed accent line
      ctx.strokeStyle = 'rgba(184, 67, 30, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(45, 45, 1110, 610);
      ctx.setLineDash([]);

      // Top Header: Club Name & College
      ctx.fillStyle = '#B8431E';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('C3 // CLAUDE CODE & COWORK', 80, 100);

      ctx.fillStyle = '#6B6860';
      ctx.font = '600 20px sans-serif';
      ctx.fillText('ISL ENGINEERING COLLEGE · HYDERABAD', 80, 130);

      // Badge: FOUNDING PASS
      ctx.fillStyle = '#065F46';
      ctx.beginPath();
      ctx.roundRect(830, 70, 290, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('FOUNDING PASS', 890, 101);

      // Subtext: BATCH 01 (No core admission)
      ctx.fillStyle = '#6B6860';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('BATCH 01', 1030, 140);

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
      ctx.fillStyle = '#B8431E';
      ctx.font = '600 24px sans-serif';
      ctx.fillText(`${effectiveBranch} · ${effectiveYear} · ${effectiveRole}`, 80, 285);

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
      renderItem('FOUNDER ACCESS KEY', getSerial(), 80, 440);
      renderItem('ADMISSION STATUS', 'Verified Founding Builder', 540, 440);

      // Footer Bar
      ctx.fillStyle = '#12100E';
      ctx.fillRect(80, 520, 1040, 80);

      ctx.fillStyle = '#8C8275';
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
        branch: effectiveBranch,
        year: effectiveYear,
        role: effectiveRole,
        serial: getSerial(),
        founderKey: founderKey || getSerial(),
        dataUrl: passDataUrl
      });

      // Persist claim to backend database
      claimPassApi({
        key: founderKey || getSerial(),
        name: name || 'Anonymous Builder',
        branch: effectiveBranch,
        year: effectiveYear,
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
    const text = `🎟️ C3 Founding Builder Pass\nName: ${name}\nBranch: ${effectiveBranch} (${effectiveYear})\nRole: ${effectiveRole}\nKey: ${getSerial()}\nSchedule: Mon-Thu 10 AM - 1 PM @ C3 Campus Office, ISL Engineering College`;
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
                      placeholder="Enter Founder Key"
                      maxLength={8}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted uppercase">
                    Full Name
                  </label>
                  {isIdentityLocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                      <Lock className="w-2.5 h-2.5" />
                      Verified Identity · Locked
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    readOnly={isIdentityLocked}
                    disabled={isIdentityLocked}
                    onChange={(e) => {
                      if (!isIdentityLocked) setName(e.target.value);
                    }}
                    placeholder="Candidate Name"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-sans transition-colors ${
                      isIdentityLocked
                        ? 'bg-black/20 border-[#38332A] text-claude-text dark:text-claude-darkText font-semibold cursor-not-allowed select-none'
                        : 'bg-claude-bg dark:bg-claude-darkBg border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText focus:outline-none focus:border-claude-terracotta'
                    }`}
                  />
                  {isIdentityLocked && (
                    <Lock className="w-3.5 h-3.5 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>
                {isIdentityLocked && (
                  <p className="text-[10px] font-mono text-claude-muted dark:text-claude-darkMuted mt-1">
                    Official candidate identity bound to this key. Non-transferable.
                  </p>
                )}
              </div>

              {/* DEPT & Year Row - Fully Editable */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted uppercase">
                      DEPT (Department)
                    </label>
                  </div>
                  <select
                    value={isCustomBranch ? 'custom' : branch}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomBranch(true);
                      } else {
                        setIsCustomBranch(false);
                        setBranch(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border bg-claude-bg dark:bg-claude-darkBg border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-sans focus:outline-none focus:border-claude-terracotta transition-colors"
                  >
                    <option value="IT">IT (Information Tech)</option>
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="AI/DS">AI &amp; Data Science</option>
                    <option value="ECE">ECE (Electronics)</option>
                    <option value="MECH">Mechanical Engg</option>
                    <option value="CIVIL">Civil Engg</option>
                    <option value="custom">Custom DEPT...</option>
                  </select>
                  {isCustomBranch && (
                    <input
                      type="text"
                      value={customBranchText}
                      onChange={(e) => setCustomBranchText(e.target.value)}
                      placeholder="e.g. IT, CSBS, AIDS"
                      className="w-full mt-2 px-3 py-1.5 rounded-lg border bg-claude-bg dark:bg-claude-darkBg border-claude-terracotta text-claude-text dark:text-claude-darkText text-xs font-sans focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono font-medium text-claude-muted dark:text-claude-darkMuted uppercase">
                      Year of Study
                    </label>
                  </div>
                  <select
                    value={isCustomYear ? 'custom' : year}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomYear(true);
                      } else {
                        setIsCustomYear(false);
                        setYear(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border bg-claude-bg dark:bg-claude-darkBg border-claude-border dark:border-claude-darkBorder text-claude-text dark:text-claude-darkText text-sm font-sans focus:outline-none focus:border-claude-terracotta transition-colors"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="custom">Custom Year...</option>
                  </select>
                  {isCustomYear && (
                    <input
                      type="text"
                      value={customYearText}
                      onChange={(e) => setCustomYearText(e.target.value)}
                      placeholder="e.g. 3rd Year, Alumni"
                      className="w-full mt-2 px-3 py-1.5 rounded-lg border bg-claude-bg dark:bg-claude-darkBg border-claude-terracotta text-claude-text dark:text-claude-darkText text-xs font-sans focus:outline-none"
                    />
                  )}
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
            className="w-full max-w-xl rounded-3xl p-5 sm:p-8 bg-gradient-to-br from-[#FAF8F5] via-[#F6F3EC] to-[#EFEAE1] dark:from-[#23221E] dark:via-[#1D1C19] dark:to-[#161513] border-2 border-[#B8431E] shadow-2xl relative overflow-hidden select-none"
          >
            {/* Holographic Dynamic Sheen Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 350px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(184,67,30,0.35), rgba(217,119,87,0.15), transparent 70%)`,
              }}
            />

            {/* Darker Orange Ticket Notches on left & right beside DEPT/role */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-7 sm:h-8 bg-[#F5EBE6] dark:bg-[#2C1810] rounded-r-full border-r-2 border-y-2 border-[#B8431E]" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 sm:w-4 h-7 sm:h-8 bg-[#F5EBE6] dark:bg-[#2C1810] rounded-l-full border-l-2 border-y-2 border-[#B8431E]" />

            {/* Pass Header */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 border-b border-[#E0DCD3] dark:border-claude-darkBorder pb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/c3_emblem_trans.png"
                  alt="C3 Emblem"
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs sm:text-sm tracking-wider text-[#B8431E]">
                      C3 COLLECTIVE
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#B8431E]/15 text-[#B8431E] border border-[#B8431E]/30 font-semibold">
                      BATCH 01
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs font-sans text-claude-muted dark:text-claude-darkMuted">
                    ISL Engineering College · Autonomous
                  </div>
                </div>
              </div>

              <div className="text-left xs:text-right self-start xs:self-auto">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                  <Shield className="w-3 h-3" />
                  <span>FOUNDING PASS</span>
                </div>
                <div className="text-[10px] font-mono text-claude-muted font-semibold mt-0.5 sm:mt-1 tracking-wider uppercase">
                  BATCH 01
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#B8431E]/15 text-[#B8431E] dark:text-[#E07A5F] border border-[#B8431E]/30 text-xs font-mono font-bold">
                  {effectiveBranch} · {effectiveYear}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-claude-cardMuted dark:bg-claude-darkCard text-claude-text dark:text-claude-darkText text-xs font-sans border border-claude-border dark:border-claude-darkBorder">
                  {effectiveRole}
                </span>
              </div>
            </div>

            {/* Schedule & Location Box */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-claude-card/90 dark:bg-claude-darkCard/90 border border-[#E0DCD3] dark:border-claude-darkBorder">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-claude-muted mb-0.5">
                  <Clock className="w-3 h-3 text-[#B8431E]" />
                  <span>SESSION TIMINGS</span>
                </div>
                <div className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                  Mon – Thu · 10 AM – 1 PM
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-claude-muted mb-0.5">
                  <MapPin className="w-3 h-3 text-[#B8431E]" />
                  <span>CAMPUS VENUE</span>
                </div>
                <div className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                  C3 Campus Office
                </div>
              </div>
            </div>

            {/* Barcode & Serial Footer */}
            <div className="mt-4 sm:mt-5 pt-3 border-t border-dashed border-[#E0DCD3] dark:border-claude-darkBorder flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[9px] sm:text-[10px] text-claude-muted uppercase tracking-wider">
                  VERIFIED FOUNDER KEY
                </div>
                <div className="font-mono text-xs sm:text-xs font-bold text-[#B8431E] dark:text-[#E07A5F] truncate">
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
