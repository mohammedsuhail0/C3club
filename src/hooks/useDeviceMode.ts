import { useState, useEffect } from 'react';

export type DeviceMode = 'auto' | 'desktop' | 'mobile';

export function useDeviceMode() {
  const [mode, setMode] = useState<DeviceMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('c3_device_mode');
      if (stored === 'desktop' || stored === 'mobile' || stored === 'auto') {
        return stored;
      }
    }
    return 'auto';
  });

  const [isDesktopScreen, setIsDesktopScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSetMode = (newMode: DeviceMode) => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('c3_device_mode', newMode);
    }
  };

  const isDesktop = mode === 'desktop' ? true : mode === 'mobile' ? false : isDesktopScreen;
  const isMobile = !isDesktop;

  return {
    mode,
    setMode: handleSetMode,
    isDesktop,
    isMobile,
    isDesktopScreen
  };
}
