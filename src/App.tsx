import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScrollZoomPreloader } from './components/animations/ScrollZoomPreloader';
import { Hero } from './components/Hero';
import { WhatIsC3 } from './components/WhatIsC3';
import { AccreditationStrip } from './components/AccreditationStrip';
import { EventsWeek1 } from './components/EventsWeek1';
import { FoundingPass } from './components/FoundingPass';
import { ApplyModal } from './components/ApplyModal';
import { AcceptanceLetterModal } from './components/AcceptanceLetterModal';
import { OrganizerPortalModal } from './components/OrganizerPortalModal';
import { CommandCenterPage } from './components/CommandCenterPage';
import { Footer } from './components/Footer';
import { ScrollProgress } from './components/animations/ScrollProgress';
import { CursorGlow } from './components/animations/CursorGlow';
import { Marquee } from './components/animations/Marquee';
import { EngineeringBackground } from './components/animations/EngineeringBackground';
import { sounds } from './utils/audio';
import { fetchMemberByKey, MemberRecord } from './utils/api';

export function App() {
  const [isApplyOpen, setIsApplyOpen] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      if (path === '/admin' || path.startsWith('/admin') || hash === '#admin' || hash.startsWith('#admin') || search.includes('admin=')) {
        return true;
      }
    }
    return false;
  });
  const [isPreloaderDone, setIsPreloaderDone] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      const path = window.location.pathname;
      const params = new URLSearchParams(search || (hash.includes('?') ? hash.split('?')[1] : ''));
      return !!(path === '/admin' || hash === '#admin' || params.get('letter') || params.get('acceptance') || params.get('code') || params.get('fnd') || params.get('admin') || params.get('apply'));
    }
    return false;
  });

  // Acceptance Letter & Organizer Command Center state
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);
  const [letterMember, setLetterMember] = useState<MemberRecord | null>(null);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState<boolean>(false);
  const [activePassKey, setActivePassKey] = useState<string>('');

  // Subtle tactile keyboard typing audio listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      sounds.playKey();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for ?letter=XXXX, ?admin=true, or ?apply=true
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);

    const letterKey = searchParams.get('letter') || hashParams.get('letter') || searchParams.get('acceptance') || hashParams.get('acceptance');
    if (letterKey) {
      fetchMemberByKey(letterKey).then(member => {
        if (member) {
          setLetterMember(member);
          setIsLetterOpen(true);
        }
      });
    }

    const adminParam = searchParams.get('admin') || hashParams.get('admin');
    if (adminParam) {
      setIsOrganizerOpen(true);
    }

    const applyParam = searchParams.get('apply') || hashParams.get('apply');
    if (applyParam) {
      setIsApplyOpen(true);
    }

    const codeParam = searchParams.get('code') || hashParams.get('code') || searchParams.get('fnd') || hashParams.get('fnd') || searchParams.get('key') || hashParams.get('key');
    if (codeParam) {
      const scrollPass = () => {
        document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      setTimeout(scrollPass, 200);
      setTimeout(scrollPass, 600);
    }
  }, []);

  const handleClaimFromLetter = (founderKey: string) => {
    setActivePassKey(founderKey);
    setIsLetterOpen(false);
    if (isAdminMode) {
      setIsAdminMode(false);
      window.history.replaceState(null, '', `/?code=${encodeURIComponent(founderKey)}`);
    }
    const scrollPass = () => {
      document.getElementById('founding-pass')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    setTimeout(scrollPass, 150);
    setTimeout(scrollPass, 450);
  };

  if (isAdminMode) {
    return (
      <>
        <CommandCenterPage
          onNavigateHome={() => {
            setIsAdminMode(false);
            setIsOrganizerOpen(false);
            window.history.replaceState(null, '', '/');
          }}
          onViewLetter={(member) => {
            setLetterMember(member);
            setIsLetterOpen(true);
          }}
        />
        <AcceptanceLetterModal
          isOpen={isLetterOpen}
          onClose={() => setIsLetterOpen(false)}
          member={letterMember}
          onClaimPass={handleClaimFromLetter}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-claude-bg dark:bg-claude-darkBg text-claude-text dark:text-claude-darkText transition-colors duration-200 bg-paper-pattern flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Dynamic Scroll Progress Bar */}
      <ScrollProgress />

      {/* Interactive Cursor Spotlight */}
      <CursorGlow />

      {/* Modern Engineering Blueprint Grid (Zero Particles) */}
      <EngineeringBackground />

      {/* Ultra-Minimal Transparent Header (ONLY the C3 Logo) */}
      <Navbar />

      {/* Scroll-Driven Zoom Preloader: Activates on page load / refresh */}
      {!isPreloaderDone && (
        <ScrollZoomPreloader onComplete={() => setIsPreloaderDone(true)} />
      )}

      {/* Main Site Content: Clean, Story-Driven Flow */}
      <main className="relative z-10 w-full flex flex-col">
        {/* 1. Fullscreen Monumental Hero Hook */}
        <Hero onOpenApply={() => setIsApplyOpen(true)} />

        {/* 2. What is C3? The 4 Core Pillars & Routine */}
        <WhatIsC3 />

        {/* 3. Tech Stack Marquee */}
        <Marquee />

        {/* 4. Official Accreditation Strip */}
        <AccreditationStrip />

        {/* 5. Week 1 Kickoff Sessions */}
        <EventsWeek1 />

        {/* 6. Climax: Interactive 3D Founding Pass Generator */}
        <FoundingPass 
          onOpenApply={() => setIsApplyOpen(true)} 
          externalKey={activePassKey}
        />

        {/* 7. Minimal Footer with Organizer Command Link */}
        <Footer 
          onOpenApply={() => setIsApplyOpen(true)}
          onOpenOrganizer={() => {
            setIsAdminMode(true);
            window.location.hash = 'admin';
          }}
        />
      </main>

      {/* Quick Application Modal with QR Code */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
      />

      {/* Official Collegiate Acceptance Letter Modal */}
      <AcceptanceLetterModal
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
        member={letterMember}
        onClaimPass={handleClaimFromLetter}
      />

      {/* Organizer Command Center Portal */}
      <OrganizerPortalModal
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
        onViewLetter={(member) => {
          setLetterMember(member);
          setIsLetterOpen(true);
        }}
      />

    </div>
  );
}

export default App;
