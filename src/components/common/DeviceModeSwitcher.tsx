import React from 'react';
import { Monitor, Smartphone, SlidersHorizontal } from 'lucide-react';
import { DeviceMode } from '../../hooks/useDeviceMode';
import { sounds } from '../../utils/audio';

interface DeviceModeSwitcherProps {
  mode: DeviceMode;
  onSetMode: (mode: DeviceMode) => void;
  isDesktop: boolean;
}

export const DeviceModeSwitcher: React.FC<DeviceModeSwitcherProps> = ({
  mode,
  onSetMode,
  isDesktop,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 dark:bg-[#1E1D1A]/95 border-2 border-claude-terracotta/40 shadow-2xl backdrop-blur-md select-none font-mono text-xs">
      <div className="px-2 py-1 flex items-center gap-1.5 text-claude-muted dark:text-claude-darkMuted border-r border-black/10 dark:border-white/10 text-[11px]">
        <SlidersHorizontal className="w-3.5 h-3.5 text-claude-terracotta" />
        <span className="hidden sm:inline font-bold">VIEW MODE:</span>
      </div>

      {/* Auto Button */}
      <button
        onClick={() => {
          sounds.playClick();
          onSetMode('auto');
        }}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer text-[11px] font-semibold ${
          mode === 'auto'
            ? 'bg-claude-terracotta text-white shadow-sm'
            : 'text-claude-muted dark:text-claude-darkMuted hover:text-claude-text'
        }`}
        title="Auto-detect based on screen width (Desktop >= 1024px, Mobile < 1024px)"
      >
        <span>Auto</span>
        <span className="text-[9px] opacity-80">({isDesktop ? 'Desk' : 'Mob'})</span>
      </button>

      {/* Force Desktop Button */}
      <button
        onClick={() => {
          sounds.playClick();
          onSetMode('desktop');
        }}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer text-[11px] font-semibold ${
          mode === 'desktop'
            ? 'bg-claude-terracotta text-white shadow-sm'
            : 'text-claude-muted dark:text-claude-darkMuted hover:text-claude-text'
        }`}
        title="Force Widescreen Command Studio layout"
      >
        <Monitor className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Studio</span>
      </button>

      {/* Force Mobile Button */}
      <button
        onClick={() => {
          sounds.playClick();
          onSetMode('mobile');
        }}
        className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer text-[11px] font-semibold ${
          mode === 'mobile'
            ? 'bg-claude-terracotta text-white shadow-sm'
            : 'text-claude-muted dark:text-claude-darkMuted hover:text-claude-text'
        }`}
        title="Force Mobile Native App layout"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Mobile</span>
      </button>
    </div>
  );
};
