import React, { useState, useEffect } from 'react';
// 20 Rigorous Scientific & Engineering Background Engines (Strictly Zero Particles)
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
import { LorenzBackground } from './backgrounds/LorenzBackground';
import { SpacetimeBackground } from './backgrounds/SpacetimeBackground';
import { FourierBackground } from './backgrounds/FourierBackground';
import { OpticsBackground } from './backgrounds/OpticsBackground';
import { QuantumBackground } from './backgrounds/QuantumBackground';
import { SeismicBackground } from './backgrounds/SeismicBackground';
import { FibonacciBackground } from './backgrounds/FibonacciBackground';
import { AerodynamicsBackground } from './backgrounds/AerodynamicsBackground';
import { OrbitalBackground } from './backgrounds/OrbitalBackground';
import { SpectrogramBackground } from './backgrounds/SpectrogramBackground';

import { sounds } from '../../utils/audio';
import {
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
  Infinity as InfinityIcon,
  Globe,
  CircleDot,
  Zap,
  Atom,
  LineChart,
  Layers,
  Wind,
  Orbit,
  BarChart3,
  Check,
  ChevronUp,
  ChevronDown,
  Copy,
  X,
} from 'lucide-react';

export type BgMode =
  | 'mesh'
  | 'topo'
  | 'circuit'
  | 'matrix'
  | 'voronoi'
  | 'wireframe3d'
  | 'magnetic'
  | 'radar'
  | 'hex'
  | 'sineflow'
  | 'lorenz'
  | 'spacetime'
  | 'fourier'
  | 'optics'
  | 'quantum'
  | 'seismic'
  | 'fibonacci'
  | 'aerodynamics'
  | 'orbital'
  | 'spectrogram';

export interface BgOption {
  id: BgMode;
  num: string;
  name: string;
  tagline: string;
  port: number;
  icon: React.ComponentType<{ className?: string }>;
}

export const SCIENTIFIC_BG_MODES: BgOption[] = [
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
  {
    id: 'wireframe3d',
    num: '06',
    name: '3D Wireframe',
    tagline: 'Rotating 3D icosahedron & tesseract responding to mouse torque',
    port: 5006,
    icon: Box,
  },
  {
    id: 'magnetic',
    num: '07',
    name: 'Magnetic Flux',
    tagline: 'Maxwell magnetic field lines with polarity flip burst',
    port: 5007,
    icon: Compass,
  },
  {
    id: 'radar',
    num: '08',
    name: 'Radar Sonar',
    tagline: 'Engineering polar range rings, phosphor sweep & oscilloscope',
    port: 5008,
    icon: Radio,
  },
  {
    id: 'hex',
    num: '09',
    name: 'Hex Matrix',
    tagline: 'Honeycomb hexagonal tessellation with kinetic extrusion ripples',
    port: 5009,
    icon: Hexagon,
  },
  {
    id: 'sineflow',
    num: '10',
    name: 'Sine Spectrum',
    tagline: 'Harmonic laser interferometry ribbons with envelope modulation',
    port: 5010,
    icon: Activity,
  },
  {
    id: 'lorenz',
    num: '11',
    name: 'Lorenz Attractor',
    tagline: '3D chaotic strange attractor differential phase space trajectories',
    port: 5011,
    icon: InfinityIcon,
  },
  {
    id: 'spacetime',
    num: '12',
    name: 'Einstein Spacetime',
    tagline: 'Schwarzschild metric curvature geodesics and photon sphere',
    port: 5012,
    icon: Globe,
  },
  {
    id: 'fourier',
    num: '13',
    name: 'Fourier Epicycles',
    tagline: 'Harmonic revolving phasor decomposition synthesizing waveforms',
    port: 5013,
    icon: CircleDot,
  },
  {
    id: 'optics',
    num: '14',
    name: 'Prism Optics',
    tagline: "Snell's Law laser ray tracing, refraction, dispersion & reflection",
    port: 5014,
    icon: Zap,
  },
  {
    id: 'quantum',
    num: '15',
    name: 'Quantum Tunneling',
    tagline: 'Schrödinger wavepacket probability amplitude & evanescent waves',
    port: 5015,
    icon: Atom,
  },
  {
    id: 'seismic',
    num: '16',
    name: 'Seismograph',
    tagline: '3-Channel tectonic accelerometer recording P, S & surface waves',
    port: 5016,
    icon: LineChart,
  },
  {
    id: 'fibonacci',
    num: '17',
    name: 'Golden Spiral',
    tagline: 'Logarithmic phyllotaxis helices based on the golden ratio Phi',
    port: 5017,
    icon: Layers,
  },
  {
    id: 'aerodynamics',
    num: '18',
    name: 'Wind Tunnel',
    tagline: 'Navier-Stokes laminar flow around a NACA airfoil with Mach cone',
    port: 5018,
    icon: Wind,
  },
  {
    id: 'orbital',
    num: '19',
    name: 'Kepler Orbit',
    tagline: 'Celestial orbital mechanics ellipses and radius vectors',
    port: 5019,
    icon: Orbit,
  },
  {
    id: 'spectrogram',
    num: '20',
    name: 'DSP Spectrogram',
    tagline: 'FFT frequency waterfall spectrum analyzer with cursor filter tuning',
    port: 5020,
    icon: BarChart3,
  },
];

const VALID_MODES: BgMode[] = SCIENTIFIC_BG_MODES.map((b) => b.id);

function resolveInitialBg(): BgMode {
  if (typeof window === 'undefined') return 'topo';

  // 1. URL search param (?bg=topo, ?bg=lorenz, etc.) for testing/demos
  const params = new URLSearchParams(window.location.search);
  const qBg = params.get('bg') as BgMode | null;
  if (qBg && VALID_MODES.includes(qBg)) {
    return qBg;
  }

  // 2. Port-specific mapping (Ports 5001 - 5020) for local multi-port testing
  const port = parseInt(window.location.port, 10);
  const matched = SCIENTIFIC_BG_MODES.find((m) => m.port === port);
  if (matched) return matched.id;

  // Official Permanent Production Default
  return 'topo';
}

export const EngineeringBackground: React.FC = () => {
  const [activeBg, setActiveBg] = useState<BgMode>(resolveInitialBg);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Studio UI is strictly hidden on the main website / production.
  // It ONLY renders if explicitly requested with ?studio=true in the URL.
  const isStudioAllowed = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('studio') === 'true' ||
    (parseInt(window.location.port, 10) >= 5001 && parseInt(window.location.port, 10) <= 5020)
  );

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('c3_bg_studio_dismissed') === 'true';
  });

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

  const currentOption = SCIENTIFIC_BG_MODES.find((b) => b.id === activeBg) || SCIENTIFIC_BG_MODES[1];
  const CurrentIcon = currentOption.icon;

  const filteredModes = SCIENTIFIC_BG_MODES.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.num.includes(searchQuery)
  );

  return (
    <>
      {/* 20 Pure Scientific Interactive Background Engines (Strictly Zero Particles) */}
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
      {activeBg === 'lorenz' && <LorenzBackground />}
      {activeBg === 'spacetime' && <SpacetimeBackground />}
      {activeBg === 'fourier' && <FourierBackground />}
      {activeBg === 'optics' && <OpticsBackground />}
      {activeBg === 'quantum' && <QuantumBackground />}
      {activeBg === 'seismic' && <SeismicBackground />}
      {activeBg === 'fibonacci' && <FibonacciBackground />}
      {activeBg === 'aerodynamics' && <AerodynamicsBackground />}
      {activeBg === 'orbital' && <OrbitalBackground />}
      {activeBg === 'spectrogram' && <SpectrogramBackground />}

      {/* Floating Scientific BG Studio Comparison Switcher - strictly hidden on production unless ?studio=true */}
      {isStudioAllowed && (
        <aside
          aria-label="C3 Background Studio Switcher"
          className="fixed bottom-5 left-5 z-40 pointer-events-auto select-none font-mono tracking-tight"
        >
        {isDismissed ? (
          <button
            onClick={() => {
              sounds.playClick();
              setIsDismissed(false);
              localStorage.removeItem('c3_bg_studio_dismissed');
            }}
            className="p-1.5 rounded-full bg-stone-900/40 hover:bg-stone-900/80 text-stone-500 hover:text-[#CC5A36] backdrop-blur-sm border border-stone-800/40 hover:border-stone-700 transition opacity-40 hover:opacity-100"
            title="Open BG Comparison Studio"
          >
            <Waves className="w-3.5 h-3.5" />
          </button>
        ) : isOpen ? (
          <div className="w-92 max-h-[82vh] flex flex-col rounded-2xl bg-white/95 dark:bg-[#141210]/95 backdrop-blur-xl border border-stone-200 dark:border-stone-800 shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#CC5A36] animate-pulse" />
                <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 tracking-wider uppercase">
                  Background Studio
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[#CC5A36] font-semibold">
                  20 Engines
                </span>
              </div>
              <div className="flex items-center gap-1">
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
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsOpen(false);
                    setIsDismissed(true);
                    localStorage.setItem('c3_bg_studio_dismissed', 'true');
                  }}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  title="Hide Switcher"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Filter Search Input */}
            <div className="my-2 flex-shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engine by name, concept..."
                className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-[#CC5A36]"
              />
            </div>

            {/* Scrollable list of 20 scientific engines */}
            <div className="space-y-1 overflow-y-auto pr-1 flex-1 max-h-[50vh] scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
              {filteredModes.map((option) => {
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
                          className={`text-[10px] truncate max-w-[190px] ${
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
              <span className="text-stone-400">Ports 5001 - 5020</span>
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playClick();
                setIsOpen(true);
              }}
              className="group flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-[#141210]/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800/90 shadow-lg hover:shadow-xl hover:border-[#CC5A36]/60 transition-all text-xs font-medium text-stone-800 dark:text-stone-200"
              title="Open Background Comparison Studio (20 Engines)"
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
            <button
              onClick={() => {
                sounds.playClick();
                setIsDismissed(true);
                localStorage.setItem('c3_bg_studio_dismissed', 'true');
              }}
              className="p-2 rounded-full bg-white/90 dark:bg-[#141210]/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800/90 shadow-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:border-stone-400 transition"
              title="Hide Switcher"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </aside>
      )}
    </>
  );
};
