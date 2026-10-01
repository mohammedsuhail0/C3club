import React from 'react';
import { sounds } from '../utils/audio';

interface NavbarProps {
  onToggleStudio?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleStudio }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-transparent border-none py-5 px-6 sm:px-10 pointer-events-none flex items-center justify-between">
      <a
        href="#"
        onClick={() => sounds.playClick()}
        aria-label="C3 Logo Home"
        className="pointer-events-auto block transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <img
          src="/assets/c3_emblem_trans.png"
          alt="C3 Logo"
          className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-sm"
        />
      </a>

      {onToggleStudio && (
        <button
          onClick={() => {
            sounds.playClick();
            onToggleStudio();
          }}
          className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#1E1D1A]/90 backdrop-blur-md border border-[#E0DCD3] dark:border-white/10 hover:border-[#CC5A36] text-xs font-mono text-claude-text dark:text-claude-darkText shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          title="Switch to Widescreen Command Studio"
        >
          <span className="w-2 h-2 rounded-full bg-[#CC5A36] animate-pulse" />
          <span>Studio Workspace 🖥️</span>
        </button>
      )}
    </header>
  );
};
