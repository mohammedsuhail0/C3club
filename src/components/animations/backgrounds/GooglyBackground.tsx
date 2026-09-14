import React, { useEffect, useRef } from 'react';
import { sounds } from '../../../utils/audio';

interface Eye {
  x: number;
  y: number;
  radius: number;
  pupilRadius: number;
  blinkProgress: number; // 0 = open, 1 = shut
  blinkSpeed: number;
  isBlinking: boolean;
}

export const GooglyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let eyes: Eye[] = [];

    const initEyes = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      eyes = [];

      const SPACING = 110;
      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING + (r % 2 === 1 ? SPACING * 0.5 : 0);
          const y = r * SPACING * 0.9;
          eyes.push({
            x,
            y,
            radius: 20,
            pupilRadius: 8,
            blinkProgress: 0,
            blinkSpeed: 0.15,
            isBlinking: false,
          });
        }
      }
    };

    initEyes();

    let mouse = { x: width * 0.5, y: height * 0.5, active: false };

    const handleResize = () => {
      initEyes();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = (e: MouseEvent) => {
      sounds.playBoing();
      // Wave blink across all eyes based on distance from click
      eyes.forEach((eye) => {
        const dx = eye.x - e.clientX;
        const dy = eye.y - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        setTimeout(() => {
          eye.isBlinking = true;
          eye.blinkProgress = 0;
        }, dist * 0.8);
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const eyeBorderAlpha = isDark ? 0.22 : 0.18;
      const pupilColor = isDark ? 'rgba(204, 90, 54, 0.85)' : 'rgba(204, 90, 54, 0.75)';

      for (let i = 0; i < eyes.length; i++) {
        const eye = eyes[i];

        // Blink animation
        if (eye.isBlinking) {
          eye.blinkProgress += eye.blinkSpeed;
          if (eye.blinkProgress >= Math.PI) {
            eye.blinkProgress = 0;
            eye.isBlinking = false;
          }
        } else if (Math.random() < 0.001) {
          // Random natural blink
          eye.isBlinking = true;
        }

        const blinkScale = 1 - Math.sin(eye.blinkProgress) * 0.92;

        // Calculate direction to mouse
        const targetX = mouse.active ? mouse.x : width * 0.5;
        const targetY = mouse.active ? mouse.y : height * 0.5;
        const dx = targetX - eye.x;
        const dy = targetY - eye.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // Surprise widening if cursor is near!
        const isNear = mouse.active && dist < 120;
        const currentEyeRadius = isNear ? eye.radius * 1.25 : eye.radius;
        const maxOffset = currentEyeRadius - eye.pupilRadius - 3;
        const offset = Math.min(dist * 0.15, maxOffset);

        const pupilX = eye.x + Math.cos(angle) * offset;
        const pupilY = eye.y + Math.sin(angle) * offset;

        ctx.save();
        ctx.translate(eye.x, eye.y);
        ctx.scale(1, Math.max(0.08, blinkScale));
        ctx.translate(-eye.x, -eye.y);

        // 1. Draw Outer Eyeball Socket
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, currentEyeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204, 90, 54, ${isNear ? 0.55 : eyeBorderAlpha})`;
        ctx.lineWidth = isNear ? 2 : 1.2;
        ctx.stroke();

        // 2. Draw Pupil
        ctx.beginPath();
        ctx.arc(pupilX, pupilY, isNear ? eye.pupilRadius * 1.2 : eye.pupilRadius, 0, Math.PI * 2);
        ctx.fillStyle = pupilColor;
        ctx.fill();

        // 3. Highlight Glint inside Pupil
        ctx.beginPath();
        ctx.arc(pupilX - 2.5, pupilY - 2.5, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-claude-bg/85 dark:to-claude-darkBg/85" />
    </div>
  );
};
