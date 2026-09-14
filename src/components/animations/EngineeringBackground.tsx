import React, { useState, useEffect } from 'react';
// 1. Classic Blueprint & Technical Engines
import { MeshBackground } from './backgrounds/MeshBackground';
import { TopoBackground } from './backgrounds/TopoBackground';
import { CircuitBackground } from './backgrounds/CircuitBackground';
import { MatrixBackground } from './backgrounds/MatrixBackground';
import { VoronoiBackground } from './backgrounds/VoronoiBackground';
import { Wireframe3DBackground } from './backgrounds/Wireframe3DBackground';
import { MagneticBackground } from './backgrounds/MagneticBackground';
import { RadarBackground } from './backgrounds/RadarBackground';
import { HexGridBackground } from './backgrounds/HexGridBackground';
import { SineFlowBackground } from './backgrounds/SineFlowBackground';

// 2. Pure FUN, Playful & Game Engines (Zero Particles)
import { GooglyBackground } from './backgrounds/GooglyBackground';
import { StrumBackground } from './backgrounds/StrumBackground';
import { BouncyBadgeBackground } from './backgrounds/BouncyBadgeBackground';
import { JellyBlobBackground } from './backgrounds/JellyBlobBackground';
import { CyberSnakeBackground } from './backgrounds/CyberSnakeBackground';

import { sounds } from '../../utils/audio';
import {
  Eye,
  Music,
  Gamepad2,
  Smile,
  Zap,
  Grid,
  Waves,
  Cpu,
  Terminal,
  GitFork,
  Box,
  Compass,
  Radio,
  Hexagon,
  Activity,
  Check,
  ChevronUp,
  ChevronDown,
  Copy,
  Sparkles,
} from 'lucide-react';

export type BgMode =
  // Fun & Playful (5)
  | 'googly'
  | 'strum'
  | 'dvd'
  | 'jelly'
  | 'snake'
  // Technical & Blueprint (10)
  | 'mesh'
  | 'topo'
  | 'circuit'
  | 'matrix'
  | 'voronoi'
  | 'wireframe3d'
  | 'magnetic'
  | 'radar'
  | 'hex'
  | 'sineflow';

export interface BgOption {
  id: BgMode;
  num: string;
  name: string;
  tagline: string;
  category: 'fun' | 'tech';
  port: number;
  icon: React.ComponentType<{ className?: string }>;
}

export const BG_MODES: BgOption[] = [
  // --- 🎮 FUN & PLAYFUL SUITE ---
  {
    id: 'googly',
    num: '11',
    name: 'Cyber Googly Eyes',
    tagline: 'Cute robotic eyes watching and reacting to your cursor everywhere',
    category: 'fun',
    port: 5011,
    icon: Eye,
  },
  {
    id: 'strum',
    num: '12',
    name: 'Neon Guitar Harp',
    tagline: 'Taut vibrating neon strings you can strum with real melodic notes',
    category: 'fun',
    port: 5012,
    icon: Music,
  },
  {
    id: 'dvd',
    num: '13',
    name: 'Bouncy Badges',
    tagline: 'Retro DVD screensaver badges bouncing off walls; bat them with mouse',
    category: 'fun',
    port: 5013,
    icon: Gamepad2,
  },
  {
    id: 'jelly',
    num: '14',
    name: 'Squishy Jell-O',
    tagline: 'Soft-body gelatin blob pet that squashes, stretches and jiggles',
    category: 'fun',
    port: 5014,
    icon: Smile,
  },
  {
    id: 'snake',
    num: '15',
    name: 'Arcade Cyber Snake',
    tagline: 'Playful neon Tron snake that chases and orbits your mouse cursor',
    category: 'fun',
    port: 5015,
    icon: Zap,
  },

  // --- 📐 BLUEPRINT & TECHNICAL SUITE ---
  {
    id: 'mesh',
    num: '01',
    name: 'Vector Mesh',
    tagline: 'Kinetic elastic drafting grid with mouse shockwave warp',
    category: 'tech',
    port: 5001,
    icon: Grid,
  },
  {
    id: 'topo',
    num: '02',
    name: 'Topo Waves',
    tagline: 'Fluid topographic elevation contours with harmonic water ripples',
    category: 'tech',
    port: 5002,
    icon: Waves,
  },
  {
    id: 'circuit',
    num: '03',
    name: 'Silicon PCB',
    tagline: 'Conductive copper circuit traces with glowing pulse packets',
    category: 'tech',
    port: 5003,
    icon: Cpu,
  },
  {
    id: 'matrix',
    num: '04',
    name: 'Code Matrix',
    tagline: 'Monospace engineering glyphs with interactive cursor lens',
    category: 'tech',
    port: 5004,
    icon: Terminal,
  },
  {
    id: 'voronoi',
    num: '05',
    name: 'Voronoi Lattice',
    tagline: 'Kinetic organic Voronoi cellular nodes with spring physics',
    category: 'tech',
    port: 5005,
    icon: GitFork,
  },
  {
    id: 'wireframe3d',
    num: '06',
    name: '3D Wireframe',
    tagline: 'Rotating 3D icosahedron & tesseract responding to mouse torque',
    category: 'tech',
    port: 5006,
    icon: Box,
  },
  {
    id: 'magnetic',
    num: '07',
    name: 'Magnetic Flux',
    tagline: 'Maxwell magnetic field lines with polarity flip burst',
    category: 'tech',
    port: 5007,
    icon: Compass,
  },
  {
    id: 'radar',
    num: '08',
    name: 'Radar Sonar',
    tagline: 'Engineering polar range rings, phosphor sweep & oscilloscope',
    category: 'tech',
    port: 5008,
    icon: Radio,
  },
  {
    id: 'hex',
    num: '09',
    name: 'Hex Matrix',
    tagline: 'Honeycomb hexagonal tessellation with kinetic extrusion ripples',
    category: 'tech',
    port: 5009,
    icon: Hexagon,
  },
  {
    id: 'sineflow',
    num: '10',
    name: 'Sine Spectrum',
    tagline: 'Harmonic laser interferometry ribbons with envelope modulation',
    category: 'tech',
    port: 5010,
    icon: Activity,
  },
];

const VALID_MODES: BgMode[] = BG_MODES.map((b) => b.id);

function resolveInitialBg(): BgMode {
  if (typeof window === 'undefined') return 'googly';

  // 1. URL search param
  const params = new URLSearchParams(window.location.search);
  const qBg = params.get('bg') as BgMode | null;
  if (qBg && VALID_MODES.includes(qBg)) {
    return qBg;
  }

  // 2. Port-specific mapping (Ports 5001-5015)
  const port = parseInt(window.location.port, 10);
  const matched = BG_MODES.find((m) => m.port === port);
  if (matched) return matched.id;

  // 3. Stored user preference
  const saved = localStorage.getItem('c3_bg_mode') as BgMode | null;
  if (saved && VALID_MODES.includes(saved)) {
    return saved;
  }

  // Default to the first ultra-fun one!
  return 'googly';
}

export const EngineeringBackground: React.FC = () => {
  const [activeBg, setActiveBg] = useState<BgMode>(resolveInitialBg);
  const [activeTab, setActiveTab] = useState<'fun' | 'tech'>('fun');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setActiveBg(resolveInitialBg());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const switchBackground = (newMode: BgMode) => {
    setActiveBg(newMode);
    sounds.playClick();
    localStorage.setItem('c3_bg_mode', newMode);

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

  const filteredOptions = BG_MODES.filter((b) => b.category === activeTab);

  return (
    <>
      {/* 1. Fun & Playful Background Engines (Strictly Zero Particles) */}
      {activeBg === 'googly' && <GooglyBackground />}
      {activeBg === 'strum' && <StrumBackground />}
      {activeBg === 'dvd' && <BouncyBadgeBackground />}
      {activeBg === 'jelly' && <JellyBlobBackground />}
      {activeBg === 'snake' && <CyberSnakeBackground />}

      {/* 2. Blueprint & Technical Background Engines */}
      {activeBg === 'mesh' && <MeshBackground />}
      {activeBg === 'topo' && <TopoBackground />}
      {activeBg === 'circuit' && <CircuitBackground />}
      {activeBg === 'matrix' && <MatrixBackground />}
      {activeBg === 'voronoi' && <VoronoiBackground />}
      {activeBg === 'wireframe3d' && <Wireframe3DBackground />}
      {activeBg === 'magnetic' && <MagneticBackground />}
      {activeBg === 'radar' && <RadarBackground />}
      {activeBg === 'hex' && <HexGridBackground />}
      {activeBg === 'sineflow' && <SineFlowBackground />}

      {/* 3. Floating High-Tech "BG Studio" Comparison Switcher Pill */}
      <aside
        aria-label="C3 Background Studio Switcher"
        className="fixed bottom-5 left-5 z-40 pointer-events-auto select-none font-mono tracking-tight"
      >
        {isOpen ? (
          <div className="w-88 max-h-[82vh] flex flex-col rounded-2xl bg-white/95 dark:bg-[#141210]/95 backdrop-blur-xl border border-stone-200 dark:border-stone-800 shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#CC5A36] animate-pulse" />
                <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 tracking-wider uppercase">
                  C3 BG Studio
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-[#CC5A36] font-semibold">
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

            {/* Category Toggle Tabs (FUN vs TECH) */}
            <div className="flex items-center gap-1.5 my-2.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl flex-shrink-0">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('fun');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'fun'
                    ? 'bg-white dark:bg-stone-800 text-[#CC5A36] shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎮 FUN & PLAYFUL (5)</span>
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('tech');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'tech'
                    ? 'bg-white dark:bg-stone-800 text-[#CC5A36] shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>📐 TECH (10)</span>
              </button>
            </div>

            {/* Scrollable list of current category */}
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-[46vh] scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
              {filteredOptions.map((option) => {
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
                        className={`p-1.5 rounded-lg flex-shrink-0 ${
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
            <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] flex-shrink-0">
              <span className="text-stone-400">15 Zero-Particle Engines</span>
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
          <button
            onClick={() => {
              sounds.playClick();
              setIsOpen(true);
            }}
            className="group flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-[#141210]/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800/90 shadow-lg hover:shadow-xl hover:border-[#CC5A36]/60 transition-all text-xs font-medium text-stone-800 dark:text-stone-200"
            title="Open Background Comparison Studio (15 Engines)"
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
