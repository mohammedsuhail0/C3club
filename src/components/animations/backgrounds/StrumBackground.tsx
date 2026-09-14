import React, { useEffect, useRef } from 'react';
import { sounds } from '../../../utils/audio';

interface GuitarString {
  id: number;
  baseY: number;
  freq: number;
  displacement: number; // Center amplitude
  velocity: number;
  pluckX: number;
  color: string;
}

const NOTES = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00, // A5
];

export const StrumBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let strings: GuitarString[] = [];

    const initStrings = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      strings = [];

      const count = NOTES.length;
      const margin = height * 0.12;
      const step = (height - margin * 2) / (count - 1);

      for (let i = 0; i < count; i++) {
        strings.push({
          id: i,
          baseY: margin + i * step,
          freq: NOTES[i],
          displacement: 0,
          velocity: 0,
          pluckX: width * 0.5,
          color: 'rgba(204, 90, 54, 0.45)',
        });
      }
    };

    initStrings();

    let prevMouseY = -1000;

    const handleResize = () => {
      initStrings();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      if (prevMouseY !== -1000) {
        // Check if mouse crossed any string's plane
        for (let i = 0; i < strings.length; i++) {
          const str = strings[i];
          const crossed =
            (prevMouseY <= str.baseY && mouseY >= str.baseY) ||
            (prevMouseY >= str.baseY && mouseY <= str.baseY);

          if (crossed) {
            // Pluck string!
            const pluckForce = Math.min(Math.abs(mouseY - prevMouseY) * 1.5, 35);
            str.displacement = (mouseY > prevMouseY ? 1 : -1) * pluckForce;
            str.pluckX = mouseX;
            sounds.playPluck(str.freq);
          }
        }
      }

      prevMouseY = mouseY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Arpeggio strum all strings from top to bottom
      strings.forEach((str, i) => {
        setTimeout(() => {
          str.displacement = (Math.random() > 0.5 ? 1 : -1) * 25;
          str.pluckX = e.clientX;
          sounds.playPluck(str.freq);
        }, i * 45);
      });
    };

    const handleMouseLeave = () => {
      prevMouseY = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);

    const DAMPING = 0.94;
    const TENSION = 0.18;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');

      for (let i = 0; i < strings.length; i++) {
        const str = strings[i];

        // Spring oscillation physics
        const accel = -TENSION * str.displacement;
        str.velocity += accel;
        str.velocity *= DAMPING;
        str.displacement += str.velocity;

        // Draw vibrating string curve
        ctx.beginPath();
        ctx.moveTo(0, str.baseY);

        // Cubic bezier to simulate standing wave pluck
        const midY = str.baseY + str.displacement;
        ctx.quadraticCurveTo(str.pluckX, midY, width, str.baseY);

        const energy = Math.abs(str.displacement);
        const normEnergy = Math.min(energy / 25, 1);

        const baseAlpha = isDark ? 0.12 : 0.09;
        const lineAlpha = baseAlpha + normEnergy * (isDark ? 0.65 : 0.55);

        ctx.strokeStyle = `rgba(204, 90, 54, ${lineAlpha})`;
        ctx.lineWidth = 1 + normEnergy * 2;
        ctx.stroke();

        // Draw tuning pegs at screen edges
        ctx.fillStyle = `rgba(204, 90, 54, ${lineAlpha * 0.8})`;
        ctx.fillRect(0, str.baseY - 2, 8, 4);
        ctx.fillRect(width - 8, str.baseY - 2, 8, 4);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-claude-bg/85 dark:to-claude-darkBg/85" />
    </div>
  );
};
