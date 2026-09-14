import React, { useEffect, useRef } from 'react';

interface Point2D {
  x: number;
  y: number;
}

export const FourierBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let time = 0;
    const waveHistory: number[] = [];
    const MAX_HISTORY = 450;

    let numHarmonics = 7;
    let mouse = { x: width * 0.5, y: height * 0.5, active: false };

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
      // Toggle harmonics count (3 -> 5 -> 7 -> 11 -> 15)
      const harmonicCycle = [3, 5, 7, 11, 15];
      const nextIdx = (harmonicCycle.indexOf(numHarmonics) + 1) % harmonicCycle.length;
      numHarmonics = harmonicCycle[nextIdx];
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const speed = mouse.active ? 0.015 + ((mouse.x / width) * 0.03) : 0.025;
      time += speed;

      const isDark = document.documentElement.classList.contains('dark');
      const originX = width * 0.22;
      const originY = height * 0.5;
      const baseRadius = Math.min(width, height) * 0.16;

      let prevX = originX;
      let prevY = originY;

      // 1. Draw Fourier Epicycle Phasor Circles & Armatures
      for (let i = 0; i < numHarmonics; i++) {
        const n = i * 2 + 1; // Odd harmonics for classic square wave synthesis
        const radius = baseRadius * (4 / (n * Math.PI));

        const x = prevX + radius * Math.cos(n * time);
        const y = prevY + radius * Math.sin(n * time);

        // Draw phasor orbit circle
        ctx.beginPath();
        ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.12)' : 'rgba(204, 90, 54, 0.09)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw phasor arm vector
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.35)' : 'rgba(204, 90, 54, 0.28)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        prevX = x;
        prevY = y;
      }

      // 2. Add current tip Y to history buffer
      waveHistory.unshift(prevY);
      if (waveHistory.length > MAX_HISTORY) {
        waveHistory.pop();
      }

      // 3. Draw Connecting Filament from Phasor Tip to Wavefront
      const waveStartX = width * 0.45;
      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(waveStartX, prevY);
      ctx.strokeStyle = 'rgba(204, 90, 54, 0.25)';
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Draw Continuous Traced Fourier Output Wave
      ctx.beginPath();
      for (let i = 0; i < waveHistory.length; i++) {
        const wx = waveStartX + i * 1.6;
        const wy = waveHistory[i];
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.65)' : 'rgba(204, 90, 54, 0.55)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Axis center line
      ctx.beginPath();
      ctx.moveTo(waveStartX, originY);
      ctx.lineTo(width, originY);
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.1)' : 'rgba(204, 90, 54, 0.08)';
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
