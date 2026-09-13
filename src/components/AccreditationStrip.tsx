import React from 'react';

export const AccreditationStrip: React.FC = () => {
  return (
    <section className="py-8 border-y border-claude-border dark:border-claude-darkBorder bg-claude-bgWarm/40 dark:bg-claude-darkBgWarm/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-claude-muted dark:text-claude-darkMuted font-semibold mb-3">
          Official Campus Chapter
        </span>

        {/* The Official College Logo & Accreditations Graphic */}
        <div className="w-full max-w-3xl p-3 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DA] shadow-sm flex items-center justify-center overflow-hidden">
          <img
            src="/assets/college_header.png"
            alt="ISL Engineering College Autonomous Accreditation Logo"
            className="w-full max-w-[560px] h-auto max-h-11 sm:max-h-16 object-contain filter contrast-[1.03] select-none"
          />
        </div>

      </div>
    </section>
  );
};
