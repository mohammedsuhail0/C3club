import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, GitBranch, Cpu, Rocket, ShieldCheck, Code2, Zap } from 'lucide-react';

export const Marquee: React.FC = () => {
  const items = [
    { label: 'Student Software Collective', icon: Sparkles },
    { label: 'Prompt Engineering & Vibe Coding', icon: Code2 },
    { label: 'Zero Cost Developer Tools', icon: ShieldCheck },
    { label: 'Web MVPs & Rapid Prototyping', icon: Rocket },
    { label: 'Git & GitHub Collaboration', icon: GitBranch },
    { label: 'Local Dev & Offline-First', icon: Terminal },
    { label: 'Weekly Live Shipping', icon: Zap },
    { label: 'Open to All Engineering Branches', icon: ShieldCheck },
  ];

  // Duplicate items for seamless infinite scroll
  const marqueeItems = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden py-5 border-y border-claude-border dark:border-claude-darkBorder bg-claude-bgWarm/40 dark:bg-claude-darkBgWarm/40 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-4 sm:gap-6 w-max"
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 22,
        }}
      >
        {marqueeItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder shadow-sm text-xs font-mono text-claude-text dark:text-claude-darkText hover:border-claude-terracotta transition-colors shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-claude-terracotta dark:text-claude-amber" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};
