import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/audio';

export const SoundToggle: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('c3_audio_muted');
    if (saved !== null) {
      const muted = saved === 'true';
      setIsMuted(muted);
      sounds.enabled = !muted;
    }

    // Add keyboard audio listener when typing on the page
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't play on modifier keys alone
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      sounds.playKey();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.enabled = !nextState;
    localStorage.setItem('c3_audio_muted', String(nextState));
    if (!nextState) {
      sounds.playSuccess();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={toggleSound}
        title={isMuted ? 'Unmute Audio & Keyboard FX' : 'Mute Audio & Keyboard FX'}
        className={`group flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-md border shadow-lg transition-all duration-200 cursor-pointer ${
          isMuted
            ? 'bg-claude-card/80 dark:bg-claude-darkCard/80 border-claude-border dark:border-claude-darkBorder text-claude-muted opacity-80 hover:opacity-100'
            : 'bg-claude-card/90 dark:bg-claude-darkCard/90 border-claude-terracotta/40 text-claude-terracotta dark:text-claude-amber shadow-claude-glow/20'
        }`}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-claude-muted" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-claude-terracotta animate-pulse" />
          </div>
        )}
        <span className="text-[11px] font-mono font-medium hidden sm:inline-block">
          {isMuted ? 'Audio Off' : 'Sound FX'}
        </span>
      </button>
    </div>
  );
};
