import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Mic, Scale, Search, Rocket, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { TiltCard } from './animations/TiltCard';

export const EventsWeek1: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<number>(0);

  const events = [
    {
      id: 0,
      code: 'EVENT 01',
      name: 'CTALK',
      subtitle: 'The Unfiltered Panel & Debate',
      time: '10:00 AM – 10:40 AM',
      duration: '40 mins',
      format: 'Live Open Mic Debate',
      icon: Mic,
      color: '#CC5A36',
      tagline: 'Zero sugarcoating. Hot takes, hard truths, and the future of engineering.',
      takeaway: 'Form sharp opinions on AI agents vs degrees and spot real startup opportunities.'
    },
    {
      id: 1,
      code: 'EVENT 02',
      name: 'THE VERDICT',
      subtitle: 'AI Tools on Trial',
      time: '10:40 AM – 11:15 AM',
      duration: '35 mins',
      format: 'Live Screen Audit & Stress Test',
      icon: Scale,
      color: '#D97757',
      tagline: 'Benchmarking free AI developer tools & prompt workflows live on screen.',
      takeaway: 'Learn what developer tasks are 100% automated vs. what skills get you hired.'
    },
    {
      id: 2,
      code: 'EVENT 03',
      name: 'DECONSTRUCT',
      subtitle: 'Dismantling Billion-Dollar Startups',
      time: '11:15 AM – 11:50 AM',
      duration: '35 mins',
      format: 'Architecture Teardown',
      icon: Search,
      color: '#B54C2B',
      tagline: 'Dissecting Day Zero: Zerodha, Postman, and real startup MVPs.',
      takeaway: 'Steal proven startup playbooks and realize how simple initial MVPs truly were.'
    },
    {
      id: 3,
      code: 'EVENT 04',
      name: 'PROMPT-TO-PROD',
      subtitle: '60-Minute Shipathon',
      time: '11:50 AM – 01:00 PM',
      duration: '70 mins',
      format: 'Hands-on Lab Sprint · Zero Slides',
      icon: Rocket,
      color: '#CC5A36',
      tagline: 'From blank prompt to live deployed software in a single sitting.',
      takeaway: 'Leave the room with a live, running product on the internet with your name on it.'
    }
  ];

  return (
    <section id="events" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <span className="font-mono text-xs tracking-[0.25em] text-claude-terracotta dark:text-claude-amber uppercase font-semibold block mb-3">
          Week 01 Kickoff Sessions · Agenda
        </span>
        
        <h2 className="font-serif font-normal text-4xl sm:text-6xl text-claude-text dark:text-claude-darkText tracking-tight mb-3">
          Four high-voltage sessions.{' '}
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-claude-terracotta via-amber-600 to-rose-600">
            One morning.
          </span>
        </h2>
        
        <p className="text-sm sm:text-base text-claude-muted dark:text-claude-darkMuted leading-relaxed font-sans">
          From fiery debates to live deployed software. Held in the C3 Campus Office.
        </p>

        {/* Location & Time - Clean line, NO PILLS */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-claude-muted dark:text-claude-darkMuted">
          <span>Mon–Thu 10:00 AM – 01:00 PM IST</span>
          <span>·</span>
          <span>C3 Campus Office · In-Person</span>
        </div>
      </motion.div>

      {/* Grid of the 4 Event Cards with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {events.map((evt) => {
          const Icon = evt.icon;
          const isSelected = selectedEvent === evt.id;

          return (
            <TiltCard
              key={evt.id}
              onClick={() => {
                sounds.playClick();
                setSelectedEvent(evt.id);
              }}
              className={`p-5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                isSelected
                  ? 'bg-claude-card dark:bg-claude-darkCard border-claude-terracotta shadow-md ring-2 ring-claude-terracotta/20 scale-[1.02]'
                  : 'bg-claude-card/80 dark:bg-claude-darkCard/80 border-claude-border dark:border-claude-darkBorder hover:border-claude-terracotta/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] text-claude-terracotta dark:text-claude-amber font-bold">
                    {evt.code}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-claude-terracotta/10 flex items-center justify-center text-claude-terracotta dark:text-claude-amber">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-serif font-bold text-xl text-claude-text dark:text-claude-darkText tracking-tight mb-1">
                  {evt.name}
                </h3>
                <p className="text-xs text-claude-muted dark:text-claude-darkMuted font-sans mb-3">
                  {evt.subtitle}
                </p>
                <span className="text-[11px] font-mono text-claude-terracotta dark:text-claude-amber bg-claude-terracottaLight dark:bg-claude-darkCard px-2 py-1 rounded-md inline-block">
                  {evt.time}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-claude-border dark:border-claude-darkBorder flex items-center justify-between text-xs font-mono text-claude-muted">
                <span>{evt.duration}</span>
                <span className="text-claude-terracotta font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Selected Event Quick Drawer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedEvent}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-5 sm:p-6 rounded-2xl bg-claude-card dark:bg-claude-darkCard border border-claude-border dark:border-claude-darkBorder shadow-claude-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-claude-terracotta font-bold">
              <span>{events[selectedEvent].code}</span>
              <span>·</span>
              <span>{events[selectedEvent].format}</span>
            </div>
            <p className="font-serif text-base text-claude-text dark:text-claude-darkText italic">
              &ldquo;{events[selectedEvent].tagline}&rdquo;
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Takeaway: {events[selectedEvent].takeaway}</span>
            </div>
          </div>

          <div className="shrink-0 font-mono text-xs text-claude-muted self-start sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-claude-cardMuted dark:bg-claude-darkBg border border-claude-border dark:border-claude-darkBorder">
              {events[selectedEvent].time}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

    </section>
  );
};
