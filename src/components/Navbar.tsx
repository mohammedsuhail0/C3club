import React from 'react';
import { sounds } from '../utils/audio';

export const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-transparent border-none py-5 px-6 sm:px-10 pointer-events-none flex items-center">
      <a
        href="#"
        onClick={() => sounds.playClick()}
        aria-label="C3 Logo Home"
        className="pointer-events-auto block transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        <img
          src="/assets/c3_emblem_trans.png"
          alt="C3 Logo"
          className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-sm"
        />
      </a>
    </header>
  );
};
