import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { sounds } from '../utils/audio';

interface FooterProps {
  onOpenApply: () => void;
  onOpenOrganizer?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApply, onOpenOrganizer }) => {
  return (
    <footer className="border-t border-claude-border dark:border-claude-darkBorder bg-claude-bgWarm/40 dark:bg-claude-darkBgWarm/40 py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-claude-border dark:border-claude-darkBorder">
          
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder p-1 shadow-sm">
                <img src="/assets/c3_monogram.png" alt="C3 Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-serif font-bold text-xl text-claude-text dark:text-claude-darkText">
                C3 · Claude Code &amp; Cowork
              </span>
            </div>
            <p className="text-xs text-claude-muted dark:text-claude-darkMuted leading-relaxed max-w-md font-sans">
              A student-led developer collective at ISL Engineering College. Built for students who want to build real software, master prompt engineering, and ship weekly with zero friction.
            </p>
            <div className="text-[11px] font-mono text-claude-muted dark:text-claude-darkMuted">
              ISL Engineering College · Bandlaguda, Chandrayangutta, Hyderabad - 500005
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2 text-xs font-mono">
            <span className="font-bold text-claude-text dark:text-claude-darkText uppercase tracking-wider block mb-3">
              EXPLORE
            </span>
            <div>
              <a href="#hero" onClick={() => sounds.playClick()} className="text-claude-muted dark:text-claude-darkMuted hover:text-claude-terracotta">
                → The C3 Collective
              </a>
            </div>
            <div>
              <a href="#about" onClick={() => sounds.playClick()} className="text-claude-muted dark:text-claude-darkMuted hover:text-claude-terracotta">
                → What is C3?
              </a>
            </div>
            <div>
              <a href="#events" onClick={() => sounds.playClick()} className="text-claude-muted dark:text-claude-darkMuted hover:text-claude-terracotta">
                → Week 1 Kickoff Events
              </a>
            </div>
            <div>
              <a href="#founding-pass" onClick={() => sounds.playClick()} className="text-claude-muted dark:text-claude-darkMuted hover:text-claude-terracotta">
                → Forge Founding Pass
              </a>
            </div>
          </div>

          {/* Action Col */}
          <div className="md:col-span-3 space-y-3">
            <span className="font-bold text-xs font-mono text-claude-text dark:text-claude-darkText uppercase tracking-wider block mb-2">
              FOUNDING TEAM
            </span>
            <p className="text-xs text-claude-muted dark:text-claude-darkMuted">
              Batch 01 applications close prior to the Week 1 kickoff.
            </p>
            <a
              href="https://forms.gle/yHpq52h2rhREPtSa8"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sounds.playSuccess()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-claude-terracotta hover:bg-claude-terracottaHover rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <span>Apply to Batch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-claude-muted dark:text-claude-darkMuted text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} C3 Community · Student Software Collective. Originated in the Department of Information Technology, ISLEC.
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>No members, only founders. Ship every Friday.</span>
            {onOpenOrganizer && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenOrganizer();
                }}
                className="text-claude-muted hover:text-claude-terracotta transition-colors underline decoration-dotted cursor-pointer"
              >
                ⚡ Organizer Portal
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
