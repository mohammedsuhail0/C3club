import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Sparkles, Check, Copy, ArrowRight, ShieldCheck } from 'lucide-react';
import { MemberRecord } from '../utils/api';
import { sounds } from '../utils/audio';

interface AcceptanceLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberRecord | null;
  onClaimPass: (founderKey: string) => void;
}

export const AcceptanceLetterModal: React.FC<AcceptanceLetterModalProps> = ({
  isOpen,
  onClose,
  member,
  onClaimPass
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  const handleCopyLink = () => {
    sounds.playSuccess();
    const url = `${window.location.origin}/?letter=${member.founderKey}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaim = () => {
    sounds.playSuccess();
    onClaimPass(member.founderKey);
    onClose();
  };

  const refNumber = `ISLEC/C3/B01/ADM/2026/${member.founderKey.replace('C3-FND-', '')}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
        
        {/* Backdrop click to close (disabled in print) */}
        <div className="fixed inset-0 print:hidden" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl bg-[#FAF8F5] text-[#1F1E1B] rounded-2xl shadow-2xl border border-[#E8E3DA] overflow-hidden my-4 z-10 print:shadow-none print:border-none print:m-0 print:w-full print:rounded-none"
        >
          
          {/* Top Actions Bar (Hidden on Print) */}
          <div className="bg-[#F0EBE1] border-b border-[#E3DCCE] px-5 py-3 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-[#666055] font-semibold">
                Official Admission Document · Batch 01
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-xs font-mono text-[#554F43] border border-[#DDD6C9] shadow-sm transition-all cursor-pointer"
                title="Copy shareable link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-claude-terracotta" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#CC5A36] hover:bg-[#B34826] text-white text-xs font-mono font-medium shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center text-[#666055] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PRINTABLE LETTER CONTENT */}
          <div className="p-6 sm:p-10 space-y-6 print:p-8 print:space-y-5 text-[#1F1E1B]">
            
            {/* Header / Letterhead */}
            <div className="text-center pb-5 border-b-2 border-[#D97757]/30 space-y-3">
              <div className="flex justify-center">
                <img
                  src="/assets/college_header.png"
                  alt="ISL Engineering College Autonomous"
                  className="max-h-12 sm:max-h-16 w-auto object-contain filter contrast-[1.03]"
                />
              </div>

              <div className="space-y-0.5 pt-1">
                <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[#8C8275] uppercase font-bold">
                  Office of the C3 Collective Admissions Council
                </p>
                <p className="text-[11px] sm:text-xs font-sans text-[#5A5449]">
                  Department of Computer Science & Engineering · ISL Engineering College (Autonomous)
                </p>
                <p className="text-[10px] font-mono text-[#8C8275]">
                  Bandlaguda, Chandrayangutta, Hyderabad, Telangana 500005
                </p>
              </div>
            </div>

            {/* Reference Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#6B6355] border-b border-[#E8E2D5] pb-3 gap-1">
              <div>
                <span className="font-bold text-[#1F1E1B]">Ref:</span> {refNumber}
              </div>
              <div>
                <span className="font-bold text-[#1F1E1B]">Date:</span> September 14, 2026
              </div>
            </div>

            {/* Recipient Box */}
            <div className="bg-[#F5F1E9] p-4 rounded-xl border border-[#E3DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8C8275] block">
                  ADMITTED FOUNDING BUILDER
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1E1B]">
                  {member.name}
                </h2>
                <p className="text-xs font-mono text-[#666055] mt-0.5">
                  {member.phone} · {member.email}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase text-[#8C8275] block">
                  EXCLUSIVE FOUNDER KEY
                </span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#CC5A36]/10 border border-[#CC5A36]/30 text-[#CC5A36] font-mono font-bold text-sm tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{member.founderKey}</span>
                </div>
              </div>
            </div>

            {/* Letter Subject */}
            <div className="pt-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F1E1B] tracking-tight">
                SUBJECT: OFFICIAL NOTICE OF ADMISSION & SELECTION · C3 FOUNDING COHORT (BATCH 01)
              </h3>
            </div>

            {/* Letter Body */}
            <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-[#38342E] font-sans">
              <p>
                Dear <strong>{member.name}</strong>,
              </p>
              
              <p>
                On behalf of the <strong>C3 (Claude Code & Cowork) Collective</strong> and the Department of Computer Science & Engineering at ISL Engineering College, we are pleased to inform you that your application for <strong>Batch 01</strong> has been officially approved.
              </p>

              <p>
                Out of all departmental submissions, your responses demonstrated the technical aptitude, problem-solving mindset, and dedication required to spearhead autonomous AI engineering on our campus. As an inducted Founding Builder, you are granted provisional core membership into the collective with full access to our inaugural workspace.
              </p>

              <div className="bg-white p-4 rounded-xl border border-[#E0D8C8] space-y-2.5 my-3 shadow-xs">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#CC5A36] font-bold">
                  Cohort Details & Privileges:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-[13px] text-[#423C32]">
                  <li><strong>Assigned Role:</strong> {member.customRole || member.role || 'Founding Builder'}</li>
                  <li><strong>Dedicated Workstation:</strong> C3 Campus Office / Innovation Lab 3</li>
                  <li><strong>Weekly Routine:</strong> Monday to Thursday · 10:00 AM – 1:00 PM</li>
                  <li><strong>Tooling Access:</strong> Full Claude Code CLI terminal ecosystem, MCP server suites, and production deployment pipeline.</li>
                  <li><strong>Physical Credential:</strong> Your physical NFC campus badge will be handed to you at the registration desk upon verification of your digital pass.</li>
                </ul>
              </div>

              <p>
                To secure your seat, you must claim your digital 3D Founding Builder Pass before the kickoff session. Use your unique Founder Key <strong>({member.founderKey})</strong> via the portal link below.
              </p>

              <p className="pt-1">
                We look forward to building, shipping, and defining the future of software with you.
              </p>
            </div>

            {/* Signatures */}
            <div className="pt-6 border-t border-[#E3DCCF] grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <div className="font-serif italic font-bold text-base text-[#CC5A36] pb-1">
                  Mohammed Suhail &amp; Mohammad Bilal
                </div>
                <p className="font-semibold text-[#1F1E1B]">Founding Co-Leads (Flat Collective)</p>
                <p className="text-[#8C8275] text-[11px] font-mono">C3 Collective · ISLEC</p>
              </div>

              <div className="text-right">
                <div className="font-serif italic font-bold text-base text-[#4D473C] pb-1">
                  Faculty Advisory Board
                </div>
                <p className="font-semibold text-[#1F1E1B]">Department of CSE</p>
                <p className="text-[#8C8275] text-[11px] font-mono">ISL Engineering College (Autonomous)</p>
              </div>
            </div>

            {/* Action Bar (Hidden on Print) */}
            <div className="pt-4 border-t border-[#E8E2D5] flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <span className="text-xs text-[#8C8275] font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#CC5A36]" />
                Present this letter or your digital pass at the C3 desk
              </span>

              <button
                onClick={handleClaim}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#CC5A36] hover:bg-[#B34826] text-white font-medium text-xs font-mono shadow-md transition-all cursor-pointer"
              >
                <span>Claim & Customize 3D Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
