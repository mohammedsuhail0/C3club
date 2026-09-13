import React, { useState } from 'react';
import { Copy, Check, Lightbulb } from 'lucide-react';
import { sounds } from '../utils/audio';

export const VibePlayground: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);

  const presets = [
    {
      title: 'Exam RAG Brain',
      query: 'AI Exam Prep Engine trained on past 5 years of Osmania Univ. question papers with answer schemes',
      stack: 'React (Vite) · FastAPI / Python · ChromaDB / PgVector · Claude 3.7 Sonnet',
      mvpPlan: [
        'Ingest 20 previous exam PDFs using PyMuPDF & generate semantic chunks.',
        'Build search endpoint to find repeated questions by topic & frequency.',
        'Use Claude to synthesize model 10-mark answers with diagrams in KaTeX markdown.'
      ],
      prompt: 'You are an elite academic tutor for Osmania University B.Tech exams. Given the syllabus and past questions, generate a high-yield study sheet focusing on 80/20 topics with structured answers.'
    },
    {
      title: 'Hostel Late-Night Bite',
      query: 'WhatsApp automated ordering bot for campus late-night canteens with UPI QR generation',
      stack: 'Next.js 14 · Supabase Realtime · WhatsApp Cloud API · Razorpay UPI QR',
      mvpPlan: [
        'Set up lightweight menu database with item availability toggle.',
        'Automated webhook parsing incoming customer orders via simple WhatsApp keywords.',
        'Live kitchen display screen showing live order queue with sound alerts.'
      ],
      prompt: 'Act as a WhatsApp order assistant. Present a 4-item late night snack menu, take delivery room number, compute total, and generate a payment UPI link.'
    },
    {
      title: 'Campus Lost & Found Vision',
      query: 'Smart photo-based Lost & Found portal where students snap a picture and AI matches it automatically',
      stack: 'React · Cloudflare Workers / R2 · CLIP Vision Embeddings · Tailwind CSS',
      mvpPlan: [
        'Mobile web camera interface to snap found keys, IDs, or calculators.',
        'Vector similarity search to alert matching loss reports instantly.',
        'Secure verification question before owner claims location.'
      ],
      prompt: 'Analyze this photo of a lost item on college campus. Extract item category, brand, color, distinguishing marks, and create a structured searchable index entry.'
    }
  ];

  const current = presets[selectedPreset];

  const handleCopy = () => {
    sounds.playSuccess();
    navigator.clipboard.writeText(current.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="playground" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>VIBE-TO-MVP SIMULATOR</span>
        </div>
        <h2 className="font-serif font-normal text-3xl sm:text-5xl text-claude-text dark:text-claude-darkText tracking-tight">
          Turn an idea into a weekend MVP.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-claude-muted dark:text-claude-darkMuted font-sans">
          In C3, you never stare at an empty code file. We use structured prompt architectures to break down any startup concept into a 90-minute ship roadmap.
        </p>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
        {presets.map((p, idx) => (
          <button
            key={p.title}
            onClick={() => {
              sounds.playClick();
              setSelectedPreset(idx);
            }}
            className={`px-4 py-2 text-xs font-mono rounded-xl border transition-all duration-200 ${
              selectedPreset === idx
                ? 'bg-claude-terracotta text-white border-claude-terracotta shadow-sm'
                : 'bg-claude-card dark:bg-claude-darkCard text-claude-text dark:text-claude-darkText border-claude-border dark:border-claude-darkBorder hover:border-claude-terracotta'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Interactive Blueprint Card */}
      <div className="rounded-2xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder shadow-claude-card p-6 sm:p-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-claude-border dark:border-claude-darkBorder">
          <div>
            <span className="text-xs font-mono text-claude-terracotta dark:text-claude-amber font-bold block mb-1">
              CAMPUS STARTUP CONCEPT #{selectedPreset + 1}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-claude-text dark:text-claude-darkText">
              {current.title}
            </h3>
            <p className="text-xs sm:text-sm text-claude-muted dark:text-claude-darkMuted mt-1">
              &ldquo;{current.query}&rdquo;
            </p>
          </div>

          <div className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-claude-cardMuted dark:bg-claude-darkCardMuted border border-claude-border dark:border-claude-darkBorder text-xs font-mono text-claude-text dark:text-claude-darkText">
            <span className="text-claude-muted dark:text-claude-darkMuted">Recommended Stack: </span>
            <span className="font-bold text-claude-terracotta">{current.stack}</span>
          </div>
        </div>

        {/* 2-Column Details: MVP Roadmap + System Prompt */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left: 90-min MVP Plan */}
          <div className="md:col-span-6 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-claude-muted dark:text-claude-darkMuted font-bold">
              90-Minute Lab Sprint Plan:
            </h4>
            <div className="space-y-2.5">
              {current.mvpPlan.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-3 p-3 rounded-xl bg-claude-bgWarm/60 dark:bg-claude-darkBgWarm/60 border border-claude-borderSubtle dark:border-claude-darkBorder text-xs text-claude-text dark:text-claude-darkText">
                  <span className="w-5 h-5 rounded-md bg-claude-terracotta text-white font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                    0{sIdx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Copyable System Prompt */}
          <div className="md:col-span-6 flex flex-col justify-between p-5 rounded-xl bg-claude-bgWarm/80 dark:bg-claude-darkBgWarm/80 border border-claude-borderSubtle dark:border-claude-darkBorder font-mono">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-claude-terracotta uppercase">
                  Seed System Prompt:
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-claude-muted hover:text-claude-terracotta transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-claude-text dark:text-claude-darkText leading-relaxed bg-claude-card dark:bg-claude-darkCard p-3.5 rounded-lg border border-claude-border dark:border-claude-darkBorder">
                {current.prompt}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-claude-border/50 dark:border-claude-darkBorder flex items-center justify-between text-[11px] text-claude-muted">
              <span>Ready to paste into Claude Code or Claude 3.7</span>
              <span className="text-claude-terracotta">Open Stack Ready</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
