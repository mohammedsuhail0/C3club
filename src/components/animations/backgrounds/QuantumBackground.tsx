import React, { useEffect, useRef } from 'react';

export const QuantumBackground: React.FC = () => {
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
    let time = 0;
    let excitation = 0;

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
      excitation = 1.0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.03;

      if (excitation > 0.01) {
        excitation *= 0.96;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const centerY = height * 0.5;
      const barrierX = mouse.active ? mouse.x : width * 0.5;
      const barrierWidth = 14;

      // 1. Draw Potential Energy Barrier V(x)
      ctx.fillStyle = isDark ? 'rgba(204, 90, 54, 0.12)' : 'rgba(204, 90, 54, 0.08)';
      ctx.fillRect(barrierX - barrierWidth / 2, centerY - 140, barrierWidth, 280);

      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.45)' : 'rgba(204, 90, 54, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barrierX - barrierWidth / 2, centerY - 140, barrierWidth, 280);

      // 2. Real & Imaginary Schrödinger Wave Function Components
      // Real part Re(Psi)
      ctx.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const distToBarrier = x - barrierX;
        let amp = 0;

        if (x < barrierX) {
          // Incident + Reflected standing wave
          const envelope = Math.exp(-Math.pow((x - (barrierX - 250)) / 200, 2));
          const incident = Math.cos(x * 0.035 - time * 2);
          const reflected = 0.6 * Math.cos(x * 0.035 + time * 2);
          amp = (incident + reflected) * envelope * (48 + excitation * 30);
        } else {
          // Evanescent tunneling transmitted wave
          const tunnelDecay = Math.exp(-distToBarrier * 0.008);
          const transmitted = 0.4 * Math.cos(x * 0.035 - time * 2);
          amp = transmitted * tunnelDecay * (48 + excitation * 30);
        }

        const y = centerY + amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.6)' : 'rgba(204, 90, 54, 0.5)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. Probability Density |Psi|^2 Envelope
      ctx.beginPath();
      for (let x = 0; x <= width; x += 6) {
        const distToBarrier = x - barrierX;
        let prob = 0;

        if (x < barrierX) {
          const envelope = Math.exp(-Math.pow((x - (barrierX - 250)) / 200, 2));
          prob = envelope * (30 + excitation * 20);
        } else {
          prob = Math.exp(-distToBarrier * 0.008) * (14 + excitation * 10);
        }

        const yUpper = centerY - prob;
        if (x === 0) ctx.moveTo(x, yUpper);
        else ctx.lineTo(x, yUpper);
      }
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.25)' : 'rgba(204, 90, 54, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Baseline Energy Axis
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.12)' : 'rgba(204, 90, 54, 0.09)';
      ctx.lineWidth = 1;
      ctx.stroke();

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
