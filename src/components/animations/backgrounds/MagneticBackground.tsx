import React, { useEffect, useRef } from 'react';

export const MagneticBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width * 0.5, y: height * 0.5, active: false };
    let polarity = 1; // 1 = attract, -1 = repel
    let pulseWave = 0;

    // Number of horizontal magnetic field lines
    const NUM_LINES = 28;
    const SEGMENTS = 90;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = () => {
      // Invert magnetic polarity with energy burst
      polarity = -polarity;
      pulseWave = 35;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      if (pulseWave > 0.1) {
        pulseWave *= 0.94;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const spacing = height / (NUM_LINES + 1);

      // Render smooth continuous vector magnetic flux lines
      for (let i = 1; i <= NUM_LINES; i++) {
        const baseY = i * spacing;
        ctx.beginPath();

        for (let j = 0; j <= SEGMENTS; j++) {
          const x = (j / SEGMENTS) * width;
          let y = baseY;

          // 1. Natural harmonic oscillation
          const harmonic = Math.sin(x * 0.003 + time + i * 0.2) * 6;
          y += harmonic;

          // 2. Magnetic Deflection by Mouse Pole
          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 280 + pulseWave * 4;

            if (dist < radius && dist > 1) {
              const strength = Math.pow(1 - dist / radius, 1.8);
              // Maxwell field distortion formula
              const angle = Math.atan2(dy, dx);
              const force = strength * 65 * polarity;
              y += Math.sin(angle) * force;
            }
          }

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Distance of line to mouse determines intensity
        let alpha = isDark ? 0.14 : 0.11;
        if (mouse.active) {
          const midDist = Math.abs(baseY - mouse.y);
          if (midDist < 200) {
            const proximity = 1 - midDist / 200;
            alpha += proximity * (isDark ? 0.38 : 0.32);
          }
        }

        ctx.strokeStyle = `rgba(204, 90, 54, ${alpha})`;
        ctx.lineWidth = 1.15;
        ctx.stroke();
      }

      // Draw active magnetic pole aura around cursor
      if (mouse.active) {
        const poleRadius = 38 + Math.sin(time * 3) * 4 + pulseWave;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, poleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = polarity > 0 ? 'rgba(204, 90, 54, 0.35)' : 'rgba(235, 100, 60, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Magnetic dipole axis cross
        ctx.beginPath();
        ctx.moveTo(mouse.x - 10, mouse.y);
        ctx.lineTo(mouse.x + 10, mouse.y);
        ctx.moveTo(mouse.x, mouse.y - 10);
        ctx.lineTo(mouse.x, mouse.y + 10);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
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
