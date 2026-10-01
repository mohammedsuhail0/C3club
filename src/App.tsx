import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhatIsC3 } from './components/WhatIsC3';
import { AccreditationStrip } from './components/AccreditationStrip';
import { EventsWeek1 } from './components/EventsWeek1';
import { FoundingPass } from './components/FoundingPass';
import { ApplyModal } from './components/ApplyModal';
import { AcceptanceLetterModal } from './components/AcceptanceLetterModal';
import { CommandCenterPage } from './components/CommandCenterPage';
import { Footer } from './components/Footer';
import { ScrollProgress } from './components/animations/ScrollProgress';
import { CursorGlow } from './components/animations/CursorGlow';
import { Marquee } from './components/animations/Marquee';
import { EngineeringBackground } from './components/animations/EngineeringBackground';
import { sounds } from './utils/audio';
import { fetchMemberByKey, MemberRecord } from './utils/api';
import { useDeviceMode } from './hooks/useDeviceMode';
import { DeviceModeSwitcher } from './components/common/DeviceModeSwitcher';
import { MobileAppLayout } from './components/mobile/MobileAppLayout';
import { DesktopCommandStudio } from './components/desktop/DesktopCommandStudio';

export function App() {
  const { mode, setMode, isDesktop, isMobile } = useDeviceMode();
  const [desktopLayout, setDesktopLayout] = useState<'studio' | 'monumental'>('studio');

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

  // Ensure body and html overflow are clean when on desktop scrolling mode
  useEffect(() => {
    if (isDesktop && desktopLayout === 'monumental') {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [isDesktop, desktopLayout]);

  // Acceptance Letter & Pass state
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);
  const [letterMember, setLetterMember] = useState<MemberRecord | null>(null);
  const [letterType, setLetterType] = useState<'interview' | 'admission'>('admission');
  const [activePassKey, setActivePassKey] = useState<string>('');

  // Browser History & URL Navigation Sync
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      const shouldBeAdmin = path === '/admin' || path.startsWith('/admin') || hash === '#admin' || hash.startsWith('#admin') || search.includes('admin=');
      setIsAdminMode(shouldBeAdmin);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Subtle tactile keyboard typing audio listener (strictly disabled in admin mode or form inputs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAdminMode) return;
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      sounds.playKey();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminMode]);

  // Listen for ?letter=XXXX, ?admin=true, or ?apply=true
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const hashParams = new URLSearchParams(hashQuery);

    const letterKey = searchParams.get('letter') || hashParams.get('letter') || searchParams.get('acceptance') || hashParams.get('acceptance');
    const typeParam = searchParams.get('type') || hashParams.get('type');
    if (letterKey) {
      fetchMemberByKey(letterKey).then(member => {
        if (member) {
          setLetterMember(member);
          if (typeParam === 'interview') {
            setLetterType('interview');
          } else if (typeParam === 'admission') {
            setLetterType('admission');
          } else {
            setLetterType(member.status === 'interview' ? 'interview' : 'admission');
          }
          setIsLetterOpen(true);
        }
      });
    }

    const adminParam = searchParams.get('admin') || hashParams.get('admin');
    if (adminParam) {
      setIsAdminMode(true);
    }

    const applyParam = searchParams.get('apply') || hashParams.get('apply');
    if (applyParam) {
      setIsApplyOpen(true);
    }

    const codeParam = searchParams.get('code') || hashParams.get('code') || searchParams.get('fnd') || hashParams.get('fnd') || searchParams.get('key') || hashParams.get('key');
    if (codeParam) {
      setActivePassKey(codeParam);
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
      window.history.pushState(null, '', `/?code=${encodeURIComponent(founderKey)}`);
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
            window.history.pushState(null, '', '/');
          }}
          onViewLetter={(member, type) => {
            setLetterMember(member);
            setLetterType(type || (member.status === 'interview' ? 'interview' : 'admission'));
            setIsLetterOpen(true);
          }}
        />
        <AcceptanceLetterModal
          isOpen={isLetterOpen}
          onClose={() => setIsLetterOpen(false)}
          member={letterMember}
          initialType={letterType}
          onClaimPass={handleClaimFromLetter}
        />
      </>
    );
  }

  // 1. DEDICATED MOBILE VIEW: STRICTLY ZERO SCROLL NATIVE WEB APP
  if (isMobile) {
    return (
      <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full overflow-hidden select-none bg-[#FAF8F5] dark:bg-[#141210]">
        <EngineeringBackground />
        
        <MobileAppLayout
          onOpenApply={() => setIsApplyOpen(true)}
          onOpenOrganizer={() => {
            setIsAdminMode(true);
            window.history.pushState(null, '', '/admin');
          }}
          activePassKey={activePassKey}
        />

        {/* Floating View Mode Switcher: Toggle between Auto, Desktop, and Mobile */}
        <DeviceModeSwitcher
          mode={mode}
          onSetMode={setMode}
          isDesktop={isDesktop}
        />

        <ApplyModal
          isOpen={isApplyOpen}
          onClose={() => setIsApplyOpen(false)}
        />

        <AcceptanceLetterModal
          isOpen={isLetterOpen}
          onClose={() => setIsLetterOpen(false)}
          member={letterMember}
          initialType={letterType}
          onClaimPass={handleClaimFromLetter}
        />
      </div>
    );
  }

  // 2. DEDICATED DESKTOP VIEW
  return (
    <div className="min-h-screen bg-claude-bg dark:bg-claude-darkBg text-claude-text dark:text-claude-darkText transition-colors duration-200 bg-paper-pattern flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Interactive Cursor Spotlight */}
      <CursorGlow />

      {/* Modern Engineering Blueprint Grid (Zero Particles) */}
      <EngineeringBackground />

      {/* Floating View Mode Switcher: Toggle between Auto, Desktop, and Mobile */}
      <DeviceModeSwitcher
        mode={mode}
        onSetMode={setMode}
        isDesktop={isDesktop}
      />

      {desktopLayout === 'studio' ? (
        /* Widescreen Command Studio for Large Screens */
        <DesktopCommandStudio
          onOpenApply={() => setIsApplyOpen(true)}
          onOpenOrganizer={() => {
            setIsAdminMode(true);
            window.history.pushState(null, '', '/admin');
          }}
          activePassKey={activePassKey}
          onToggleFullSite={() => setDesktopLayout('monumental')}
        />
      ) : (
        /* Classic Monumental Scrolling Flow */
        <>
          <ScrollProgress />
          <Navbar onToggleStudio={() => setDesktopLayout('studio')} />

          <main className="relative z-10 w-full flex flex-col">
            <Hero onOpenApply={() => setIsApplyOpen(true)} />
            <WhatIsC3 />
            <Marquee />
            <AccreditationStrip />
            <EventsWeek1 />
            <FoundingPass 
              onOpenApply={() => setIsApplyOpen(true)} 
              externalKey={activePassKey}
            />
            <Footer 
              onOpenApply={() => setIsApplyOpen(true)}
              onOpenOrganizer={() => {
                setIsAdminMode(true);
                window.history.pushState(null, '', '/admin');
              }}
            />
          </main>
        </>
      )}

      {/* Quick Application Modal */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
      />

      {/* Official Collegiate Acceptance Letter Modal */}
      <AcceptanceLetterModal
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
        member={letterMember}
        initialType={letterType}
        onClaimPass={handleClaimFromLetter}
      />

    </div>
  );
}

export default App;
