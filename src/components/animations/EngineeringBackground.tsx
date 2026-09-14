import React, { useState, useEffect } from 'react';
import { MeshBackground } from './backgrounds/MeshBackground';
import { TopoBackground } from './backgrounds/TopoBackground';
import { CircuitBackground } from './backgrounds/CircuitBackground';
import { MatrixBackground } from './backgrounds/MatrixBackground';
import { VoronoiBackground } from './backgrounds/VoronoiBackground';
import { sounds } from '../../utils/audio';
import { Grid, Waves, Cpu, Terminal, GitFork, Check, ChevronUp, ChevronDown, Copy } from 'lucide-react';

export type BgMode = 'mesh' | 'topo' | 'circuit' | 'matrix' | 'voronoi';

export interface BgOption {
  id: BgMode;
  num: string;
  name: string;
  tagline: string;
  port: number;
  icon: React.ComponentType<{ className?: string }>;
}

export const BG_MODES: BgOption[] = [
  {
    id: 'mesh',
    num: '01',
    name: 'Vector Mesh',
    tagline: 'Kinetic elastic drafting grid with mouse shockwave warp',
    port: 5001,
    icon: Grid,
  },
  {
    id: 'topo',
    num: '02',
    name: 'Topo Waves',
    tagline: 'Fluid topographic elevation contours with harmonic water ripples',
    port: 5002,
    icon: Waves,
  },
  {
    id: 'circuit',
    num: '03',
    name: 'Silicon PCB',
    tagline: 'Conductive copper circuit traces with glowing pulse packets',
    port: 5003,
    icon: Cpu,
  },
  {
    id: 'matrix',
    num: '04',
    name: 'Code Matrix',
    tagline: 'Monospace engineering glyphs with interactive cursor lens',
    port: 5004,
    icon: Terminal,
  },
  {
    id: 'voronoi',
    num: '05',
    name: 'Voronoi Lattice',
    tagline: 'Kinetic organic Voronoi cellular nodes with spring physics',
    port: 5005,
    icon: GitFork,
  },
];

function resolveInitialBg(): BgMode {
  if (typeof window === 'undefined') return 'mesh';

  // 1. URL search param takes highest priority (?bg=topo, etc.)
  const params = new URLSearchParams(window.location.search);
  const qBg = params.get('bg') as BgMode | null;
  if (qBg && ['mesh', 'topo', 'circuit', 'matrix', 'voronoi'].includes(qBg)) {
    return qBg;
  }

  // 2. Port-specific mapping for individual preview instances
  const port = window.location.port;
  if (port === '5001') return 'mesh';
  if (port === '5002') return 'topo';
  if (port === '5003') return 'circuit';
  if (port === '5004') return 'matrix';
  if (port === '5005') return 'voronoi';

  // 3. Saved user preference in localStorage
  const saved = localStorage.getItem('c3_bg_mode') as BgMode | null;
  if (saved && ['mesh', 'topo', 'circuit', 'matrix', 'voronoi'].includes(saved)) {
    return saved;
  }

  return 'mesh';
}

export const EngineeringBackground: React.FC = () => {
  const [activeBg, setActiveBg] = useState<BgMode>(resolveInitialBg);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync state if URL changes externally
  useEffect(() => {
    const handlePopState = () => {
      setActiveBg(resolveInitialBg());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Quick keyboard shortcuts [1] to [5] to jump between backgrounds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        const targetOption = BG_MODES[index];
        if (targetOption) {
          switchBackground(targetOption.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const switchBackground = (newMode: BgMode) => {
    setActiveBg(newMode);
    sounds.playClick();
    localStorage.setItem('c3_bg_mode', newMode);

    // Update URL param dynamically without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('bg', newMode);
    window.history.replaceState({}, '', url.toString());
  };

  const handleCopyLink = () => {
    sounds.playClick();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentOption = BG_MODES.find((b) => b.id === activeBg) || BG_MODES[0];
  const CurrentIcon = currentOption.icon;

  return (
    <>
      {/* 1. Active Interactive Background Engine (Zero Particles) */}
      {activeBg === 'mesh' && <MeshBackground />}
      {activeBg === 'topo' && <TopoBackground />}
      {activeBg === 'circuit' && <CircuitBackground />}
      {activeBg === 'matrix' && <MatrixBackground />}
      {activeBg === 'voronoi' && <VoronoiBackground />}

      {/* 2. Floating High-Tech "BG Studio" Comparison Switcher Pill */}
      <aside 
        aria-label="C3 Background Studio Switcher"
        className="fixed bottom-5 left-5 z-40 pointer-events-auto select-none font-mono tracking-tight"
      >
        {/* Expanded HUD Controller */}
        {isOpen ? (
          <div className="w-80 rounded-2xl bg-white/95 dark:bg-[#141210]/95 backdrop-blur-xl border border-stone-200 dark:border-stone-800 shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#CC5A36] animate-pulse" />
                <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 tracking-wider uppercase">
                  BG Studio Lab
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                  Zero Particles
                </span>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsOpen(false);
                }}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                title="Collapse Studio"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* List of 5 Backgrounds */}
            <div className="mt-3 space-y-1.5">
              {BG_MODES.map((option) => {
                const Icon = option.icon;
                const isCurrent = activeBg === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => switchBackground(option.id)}
                    className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between group ${
                      isCurrent
                        ? 'bg-[#CC5A36] text-white shadow-md'
                        : 'bg-stone-50/70 dark:bg-stone-900/60 hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isCurrent
                            ? 'bg-white/20 text-white'
                            : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 group-hover:text-[#CC5A36]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold ${
                              isCurrent ? 'text-white/80' : 'text-stone-400'
                            }`}
                          >
                            [{option.num}]
                          </span>
                          <span className="text-xs font-semibold truncate">
                            {option.name}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] truncate max-w-[170px] ${
                            isCurrent ? 'text-white/80' : 'text-stone-400 dark:text-stone-500'
                          }`}
                        >
                          {option.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 flex-shrink-0">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isCurrent
                            ? 'bg-white/20 text-white'
                            : 'bg-stone-200/50 dark:bg-stone-800/80 text-stone-500'
                        }`}
                      >
                        :{option.port}
                      </span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer Utilities */}
            <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px]">
              <span className="text-stone-400">Keys: [1] to [5]</span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-[#CC5A36] hover:underline cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed Pill Button */
          <button
            onClick={() => {
              sounds.playClick();
              setIsOpen(true);
            }}
            className="group flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-[#141210]/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800/90 shadow-lg hover:shadow-xl hover:border-[#CC5A36]/60 transition-all text-xs font-medium text-stone-800 dark:text-stone-200"
            title="Open Background Comparison Studio"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#CC5A36] animate-ping" />
            <CurrentIcon className="w-3.5 h-3.5 text-[#CC5A36]" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              BG: {currentOption.name}
            </span>
            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
              (:{currentOption.port})
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200 transition" />
          </button>
        )}
      </aside>
    </>
  );
};
