import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, CheckCircle2, Shield, ShieldCheck, Clock, MapPin, Copy, Key, Lock, Unlock, AlertCircle, ArrowRight, Printer } from 'lucide-react';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Mouse tilt tracking state
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Computed builder role
  const effectiveRole = isCustomRole ? (customRoleText.trim() || 'Founding Builder') : rolePreset;

  // Generate crisp scannable QR code linking to verified pass on c3club.vercel.app
  useEffect(() => {
    const currentKey = founderKey || '3C5B';
    const verifyUrl = `https://c3club.vercel.app/?code=${encodeURIComponent(currentKey)}`;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: '#1F1E1B',
        light: '#FAF8F5'
      }
    }).then(url => setQrCodeUrl(url)).catch(() => {});
  }, [founderKey]);

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
  const handleDownload = async () => {
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
    canvas.height = 750;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Background gradient (warm paper)
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 750);
      bgGrad.addColorStop(0, '#FAF8F5');
      bgGrad.addColorStop(0.5, '#F5F2EC');
      bgGrad.addColorStop(1, '#EDE7DF');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(30, 30, 1140, 690, 24);
      } else {
        ctx.rect(30, 30, 1140, 690);
      }
      ctx.fill();

      // Outer border: crisp terracotta stroke (no notches, no dashed lines)
      ctx.strokeStyle = '#CC5A36';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(30, 30, 1140, 690, 24);
      } else {
        ctx.rect(30, 30, 1140, 690);
      }
      ctx.stroke();

      // Subtle inner hairline ring
      ctx.strokeStyle = 'rgba(204, 90, 54, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(42, 42, 1116, 666, 18);
      } else {
        ctx.rect(42, 42, 1116, 666);
      }
      ctx.stroke();

      // Top Header: Club Name & College
      ctx.fillStyle = '#B8431E';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('C3 COLLECTIVE', 70, 95);

      ctx.fillStyle = '#6B6860';
      ctx.font = '600 18px sans-serif';
      ctx.fillText('ISL ENGINEERING COLLEGE · UGC AUTONOMOUS', 70, 126);

      // Badge: FOUNDING PASS
      ctx.fillStyle = '#065F46';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(840, 66, 290, 44, 22);
      } else {
        ctx.rect(840, 66, 290, 44);
      }
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('FOUNDING PASS · BATCH 01', 866, 94);

      // Divider Line
      ctx.strokeStyle = '#E0DCD3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, 150);
      ctx.lineTo(1130, 150);
      ctx.stroke();

      // Left Column: Builder Identity
      ctx.fillStyle = '#8C887B';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('BUILDER IDENTITY', 70, 205);

      ctx.fillStyle = '#1F1E1B';
      ctx.font = 'bold 44px serif';
      ctx.fillText(name || 'Anonymous Builder', 70, 260);

      // Branch & Year Tag
      ctx.fillStyle = '#B8431E';
      ctx.font = '600 22px sans-serif';
      ctx.fillText(`${effectiveBranch} · ${effectiveYear}`, 70, 305);

      // Role
      ctx.fillStyle = '#4B4842';
      ctx.font = '500 20px sans-serif';
      ctx.fillText(effectiveRole, 70, 340);

      // Access Key Box
      ctx.fillStyle = 'rgba(204, 90, 54, 0.08)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(70, 420, 260, 85, 14);
      } else {
        ctx.rect(70, 420, 260, 85);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(204, 90, 54, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(70, 420, 260, 85, 14);
      } else {
        ctx.rect(70, 420, 260, 85);
      }
      ctx.stroke();

      ctx.fillStyle = '#8C887B';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('FOUNDER KEY', 90, 450);

      ctx.fillStyle = '#CC5A36';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(founderKey || getSerial(), 90, 485);

      // Credential Status
      ctx.fillStyle = '#8C887B';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('CREDENTIAL STATUS', 360, 450);

      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('OFFICIALLY VERIFIED', 360, 485);

      // Micro bottom label
      ctx.fillStyle = '#9C988B';
      ctx.font = '500 13px monospace';
      ctx.fillText('OFFICIAL C3 COLLECTIVE CREDENTIAL · DEPARTMENT OF CSE · ISLEC', 70, 680);

      // Right Column: Utility Box (Schedule, Venue, QR)
      const utilX = 720;
      const utilY = 175;
      const utilW = 410;
      const utilH = 500;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(utilX, utilY, utilW, utilH, 18);
      } else {
        ctx.rect(utilX, utilY, utilW, utilH);
      }
      ctx.fill();
      ctx.strokeStyle = '#E0DCD3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(utilX, utilY, utilW, utilH, 18);
      } else {
        ctx.rect(utilX, utilY, utilW, utilH);
      }
      ctx.stroke();

      // Session Timings
      ctx.fillStyle = '#8C887B';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('SESSION TIMINGS', utilX + 28, utilY + 45);

      ctx.fillStyle = '#1F1E1B';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Mon – Thu · 10:00 AM – 1:00 PM', utilX + 28, utilY + 75);

      // Campus Venue
      ctx.fillStyle = '#8C887B';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('CAMPUS VENUE', utilX + 28, utilY + 135);

      ctx.fillStyle = '#1F1E1B';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('C3 Campus Office · Innovation Lab 3', utilX + 28, utilY + 165);

      // Utility horizontal divider
      ctx.strokeStyle = '#E8E4DB';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(utilX + 28, utilY + 205);
      ctx.lineTo(utilX + utilW - 28, utilY + 205);
      ctx.stroke();

      // QR Code rendering
      const currentKey = founderKey || getSerial();
      const verifyUrl = `https://c3club.vercel.app/?code=${encodeURIComponent(currentKey)}`;
      try {
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: 240,
          color: { dark: '#1F1E1B', light: '#FFFFFF' }
        });
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImg.onload = () => resolve(true);
          qrImg.onerror = () => resolve(false);
        });
        ctx.drawImage(qrImg, utilX + 28, utilY + 235, 140, 140);
      } catch {}

      // QR Code Labels
      ctx.fillStyle = '#8C887B';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SCAN TO VERIFY', utilX + 185, utilY + 270);

      ctx.fillStyle = '#CC5A36';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('c3club.vercel.app', utilX + 185, utilY + 295);

      ctx.fillStyle = '#6B6860';
      ctx.font = '500 12px monospace';
      ctx.fillText('PHYSICAL PVC BADGE', utilX + 185, utilY + 335);
      ctx.fillText('BATCH 01 ACCESS', utilX + 185, utilY + 355);

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
    const text = `🎟️ C3 Founding Builder Pass\nName: ${name}\nDEPT: ${effectiveBranch} (${effectiveYear})\nRole: ${effectiveRole}\nStatus: Verified Founding Member\nSchedule: Mon-Thu 10 AM - 1 PM @ C3 Campus Office, ISL Engineering College`;
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
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Member</span>
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
            className="w-full max-w-2xl rounded-2xl p-5 sm:p-7 bg-gradient-to-br from-[#FAF8F5] via-[#F6F3EC] to-[#EFEAE1] dark:from-[#23221E] dark:via-[#1D1C19] dark:to-[#161513] border border-[#CC5A36]/40 dark:border-[#CC5A36]/30 shadow-2xl relative overflow-hidden select-none ring-1 ring-black/5 dark:ring-white/5"
          >
            {/* Holographic Dynamic Sheen Overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 mix-blend-overlay transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 420px at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(204,90,54,0.35), rgba(217,119,87,0.15), transparent 70%)`,
              }}
            />

            {/* Pass Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#E0DCD3] dark:border-claude-darkBorder/80 pb-3 sm:pb-4 mb-4 sm:mb-5">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/c3_emblem_trans.png"
                  alt="C3 Emblem"
                  className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-sm shrink-0"
                />
                <div>
                  <div className="font-mono font-bold text-xs sm:text-sm tracking-wider text-[#B8431E] dark:text-[#E07A5F] flex items-center gap-1.5">
                    <span>C3 COLLECTIVE</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#B8431E]/10 text-[#B8431E] dark:text-[#E07A5F] font-mono font-semibold">PVC PASS</span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-sans text-claude-muted dark:text-claude-darkMuted">
                    ISL Engineering College · UGC Autonomous
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-[11px] font-mono font-bold">
                  <Shield className="w-3 h-3" />
                  <span>FOUNDING PASS</span>
                </div>
                <span className="hidden xs:inline-block text-[10px] font-mono text-claude-muted font-bold tracking-wider px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                  BATCH 01
                </span>
              </div>
            </div>

            {/* Pass Body: Landscape 2-Column Deck */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
              
              {/* Left Column: Builder Identity & Access Key (7 cols) */}
              <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[9px] sm:text-[10px] font-mono text-claude-muted uppercase tracking-wider mb-1">
                    BUILDER IDENTITY
                  </div>
                  <div className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-claude-text dark:text-claude-darkText truncate leading-tight">
                    {isUnlocked ? (name || 'Anonymous Builder') : 'Founder Key Pending'}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#B8431E]/15 text-[#B8431E] dark:text-[#E07A5F] border border-[#B8431E]/30 text-xs font-mono font-bold">
                      {effectiveBranch} · {effectiveYear}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-claude-cardMuted dark:bg-claude-darkCard text-claude-text dark:text-claude-darkText text-xs font-sans border border-claude-border dark:border-claude-darkBorder">
                      {effectiveRole}
                    </span>
                  </div>
                </div>

                {/* Key and Credential Verification Status */}
                <div className="pt-3 border-t border-[#E0DCD3] dark:border-claude-darkBorder/60 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[9px] text-claude-muted uppercase tracking-wider">
                      FOUNDER KEY
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-bold text-claude-terracotta dark:text-claude-amber tracking-widest flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" />
                      <span>{founderKey || '••••'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-[9px] text-claude-muted uppercase tracking-wider">
                      STATUS
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isUnlocked ? 'OFFICIALLY VERIFIED' : 'KEY REQUIRED'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Utility Bay (Schedule, Venue, Scannable QR) (5 cols) */}
              <div className="sm:col-span-5 bg-white/75 dark:bg-black/30 rounded-xl p-3 sm:p-3.5 border border-[#E0DCD3] dark:border-white/10 flex flex-col justify-between gap-3 shadow-sm">
                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-claude-muted mb-0.5">
                      <Clock className="w-3 h-3 text-[#B8431E]" />
                      <span>SESSION TIMINGS</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                      Mon – Thu · 10 AM – 1 PM
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-claude-muted mb-0.5">
                      <MapPin className="w-3 h-3 text-[#B8431E]" />
                      <span>CAMPUS VENUE</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-claude-text dark:text-claude-darkText">
                      C3 Office · Innovation Lab 3
                    </div>
                  </div>
                </div>

                {/* Scannable Verification QR Code */}
                <div className="pt-2.5 border-t border-[#E0DCD3]/80 dark:border-white/10 flex items-center justify-between gap-2">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 shadow-sm border border-black/5 shrink-0 flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="Verification QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 rounded animate-pulse" />
                    )}
                  </div>
                  <div className="text-right leading-tight">
                    <span className="block text-[8px] sm:text-[9px] font-mono text-claude-muted uppercase tracking-wider">
                      SCAN TO VERIFY
                    </span>
                    <span className="font-mono text-[9px] font-bold text-claude-terracotta">
                      c3club.vercel.app
                    </span>
                    <span className="block text-[8px] font-mono text-slate-400">
                      SECURE PVC CHIPLESS
                    </span>
                  </div>
                </div>
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
