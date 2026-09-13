import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Shield, Users2, Clock, MapPin } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CohortBarProps {
  onOpenApply: () => void;
}

export const CohortBar: React.FC<CohortBarProps> = ({ onOpenApply }) => {
  return (
    <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#FAF8F5] via-[#F6F2EB] to-[#EFE8DD] dark:from-[#211F1C] dark:via-[#1A1816] dark:to-[#141311] border-2 border-claude-terracotta/40 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Pitch */}
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCard text-xs font-mono text-claude-terracotta dark:text-claude-amber font-semibold border border-claude-terracottaBorder dark:border-claude-terracotta/30">
            <Shield className="w-3.5 h-3.5" />
            <span>BATCH 01 · OFFICIAL FOUNDING TEAM</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-claude-text dark:text-claude-darkText tracking-tight leading-tight">
            Stop watching from the sidelines.{' '}
            <span className="italic text-claude-terracotta">Claim your desk.</span>
          </h2>

          <p className="text-sm sm:text-base text-claude-muted dark:text-claude-darkMuted leading-relaxed">
            Open to all branches and years (1st to 4th). We meet Monday through Thursday mornings in the C3 Campus Office. Zero club fees. You own 100% of everything you build.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-claude-muted pt-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-claude-terracotta" />
              <span>Mon – Thu · 10 AM – 1 PM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-claude-terracotta" />
              <span>C3 Campus Office · ISLEC</span>
            </div>
          </div>
        </div>

        {/* Right Side: Cohort Seat Counter & Big CTA */}
        <div className="shrink-0 flex flex-col items-center sm:items-start lg:items-end gap-3.5 w-full sm:w-auto">
          <div className="p-4 rounded-2xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder text-center w-full sm:w-64 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-claude-muted mb-1">
              <Users2 className="w-3.5 h-3.5 text-claude-terracotta" />
              <span>COHORT 01 CAPACITY</span>
            </div>
            <div className="font-serif text-3xl font-bold text-claude-text dark:text-claude-darkText">
              6 <span className="text-sm font-sans text-claude-muted font-normal">Seats Left</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
              ● 14 Builders Verified
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playSuccess();
              onOpenApply();
            }}
            className="w-full sm:w-64 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-claude-terracotta hover:bg-claude-terracottaHover text-white font-semibold text-base shadow-lg hover:shadow-claude-glow transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply for Founding Seat</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-mono text-claude-muted">
            ⚡ Takes 60 seconds · Official Admission
          </span>
        </div>

      </div>
    </section>
  );
};
