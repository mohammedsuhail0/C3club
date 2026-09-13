import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, GitPullRequest, Cpu, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { TiltCard } from './animations/TiltCard';

export const Pillars: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState(0);

  const pillars = [
    {
      num: '01',
      title: 'Prompt Craft & Evals',
      badge: 'Frontier AI Steering',
      icon: Terminal,
      headline: 'Stop asking ChatGPT trivial questions. Master systematic AI steering.',
      summary: 'Prompt engineering in 2026 is real systems engineering. We teach structured system architecture, multi-shot conditioning, dynamic tool use, XML schema structuring, and automated prompt evaluation.',
      skills: [
        'Structured XML & System Prompt Design',
        'Model Evaluation & Output Benchmarks',
        'Chain-of-Thought & Reasoning Steering',
        'Anthropic API & Context Window Management'
      ],
      weeklyShip: 'An automated AI evaluation pipeline comparing model responses on specific technical test-suites.'
    },
    {
      num: '02',
      title: 'Git & Real Engineering',
      badge: 'Team Collaboration',
      icon: GitPullRequest,
      headline: 'Code that stays on localhost does not exist. Learn how real teams ship.',
      summary: 'No solo zip files sent over WhatsApp. You learn production Git workflows: semantic branching, conventional commits, pull requests, automated GitHub Actions, code reviews, and resolving scary merge conflicts without panic.',
      skills: [
        'Feature Branching & Trunk-Based Git',
        'Peer Code Reviews & PR Conventions',
        'GitHub Actions & CI/CD Pipelines',
        'Vercel / Cloudflare Automated Deployments'
      ],
      weeklyShip: 'A public GitHub repository with automated test checks, pull request templates, and 1-click preview deployments.'
    },
    {
      num: '03',
      title: 'Claude Code & AI Agents',
      badge: 'Autonomous Workflows',
      icon: Cpu,
      headline: 'Build full-stack software at the speed of thought with terminal agents.',
      summary: 'Move beyond chat windows. We explore terminal-first agentic coding: Claude Code CLI, Model Context Protocol (MCP) servers, background multi-agent orchestrations, and automated debugging workflows.',
      skills: [
        'Claude Code CLI & Terminal Agent Workflows',
        'Model Context Protocol (MCP) Tool Building',
        'Database & API Schema Auto-generation',
        'Vibe-Coding Full-Stack MVPs in 90 Minutes'
      ],
      weeklyShip: 'A fully functional full-stack web application with database and live auth, built and shipped in a single session.'
    }
  ];

  return (
    <section id="pillars" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Header with Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-14"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder text-xs font-mono text-claude-terracotta dark:text-claude-amber mb-3 shadow-sm">
          <Cpu className="w-3.5 h-3.5" />
          <span>THE CURRICULUM</span>
        </div>
        <h2 className="font-serif font-normal text-3xl sm:text-5xl text-claude-text dark:text-claude-darkText tracking-tight">
          Three pillars. Zero fluff.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-claude-muted dark:text-claude-darkMuted font-sans leading-relaxed">
          Everything we do traces back to these three core competencies. If it doesn&apos;t help you build, test, or deploy software faster, we don&apos;t spend time on it.
        </p>
      </motion.div>

      {/* 3 Interactive Cards with 3D Tilt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          const isSelected = selectedPillar === idx;

          return (
            <TiltCard
              key={p.num}
              onClick={() => {
                sounds.playClick();
                setSelectedPillar(idx);
              }}
              className={`p-6 sm:p-8 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all duration-300 ${
                isSelected
                  ? 'bg-claude-card dark:bg-claude-darkCard border-claude-terracotta shadow-claude-hover ring-2 ring-claude-terracotta/20'
                  : 'bg-claude-card dark:bg-claude-darkCard border-claude-border dark:border-claude-darkBorder shadow-claude-card hover:border-claude-terracotta/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-claude-terracottaLight dark:bg-claude-darkCardMuted text-claude-terracotta dark:text-claude-amber border border-claude-terracottaBorder dark:border-claude-terracotta/30">
                    PILLAR {p.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-claude-cardMuted dark:bg-claude-darkCardMuted flex items-center justify-center text-claude-terracotta dark:text-claude-amber shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-serif font-bold text-xl sm:text-2xl text-claude-text dark:text-claude-darkText mb-1.5">
                  {p.title}
                </h3>
                <p className="text-xs font-mono text-claude-muted dark:text-claude-darkMuted mb-4">
                  {p.badge}
                </p>

                <p className="text-sm text-claude-muted dark:text-claude-darkMuted leading-relaxed mb-6 font-sans">
                  {p.summary}
                </p>

                {/* Skills checklist */}
                <div className="space-y-2.5 mb-6">
                  {p.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2.5 text-xs text-claude-text dark:text-claude-darkText">
                      <CheckCircle2 className="w-4 h-4 text-claude-terracotta dark:text-claude-amber shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Ship Callout */}
              <div className="pt-4 border-t border-claude-border dark:border-claude-darkBorder">
                <span className="text-[10px] font-mono uppercase tracking-widest text-claude-muted dark:text-claude-darkMuted block mb-1">
                  WEEKLY DELIVERABLE:
                </span>
                <p className="text-xs font-mono text-claude-text dark:text-claude-darkText bg-claude-cardMuted dark:bg-claude-darkCardMuted p-3 rounded-xl border border-claude-borderSubtle dark:border-claude-darkBorder">
                  🚀 {p.weeklyShip}
                </p>
              </div>
            </TiltCard>
          );
        })}
      </div>

    </section>
  );
};
