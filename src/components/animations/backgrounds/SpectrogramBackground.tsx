import React, { useEffect, useRef } from 'react';

export const SpectrogramBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const BINS = 64;
    const historyFrames: number[][] = [];
    const MAX_FRAMES = 24;

    let mouse = { x: width * 0.5, y: height * 0.5, active: false };
    let impulse = 0;

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
      impulse = 1.0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      t += 0.05;

      if (impulse > 0.01) {
        impulse *= 0.94;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const targetBin = mouse.active ? Math.floor((mouse.x / width) * BINS) : Math.floor(BINS / 2);

      // Compute current FFT spectrum frame
      const currentFrame: number[] = [];
      for (let i = 0; i < BINS; i++) {
        // Log frequency distribution with resonance around mouse
        const baseNoise = Math.sin(t * 3 + i * 0.4) * 8 + Math.cos(t * 2 - i * 0.2) * 6;
        const distToTarget = Math.abs(i - targetBin);
        const peak = distToTarget < 8 ? Math.pow(1 - distToTarget / 8, 2) * 55 : 0;
        const dirac = impulse * (25 + Math.random() * 20);

        const val = Math.max(0, 15 + baseNoise + peak + dirac);
        currentFrame.push(val);
      }

      historyFrames.unshift(currentFrame);
      if (historyFrames.length > MAX_FRAMES) {
        historyFrames.pop();
      }

      const specStartY = height * 0.25;
      const binWidth = width / BINS;

      // 1. Draw Waterfall Frequency Trace Slices
      for (let f = historyFrames.length - 1; f >= 0; f--) {
        const frame = historyFrames[f];
        const yOffset = specStartY + f * 18;
        const frameAlpha = Math.max(0.04, 0.45 * (1 - f / MAX_FRAMES));

        ctx.beginPath();
        for (let i = 0; i < BINS; i++) {
          const x = i * binWidth + binWidth / 2;
          const y = yOffset - frame[i] * (1 - (f / MAX_FRAMES) * 0.5);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = isDark ? `rgba(204, 90, 54, ${frameAlpha})` : `rgba(204, 90, 54, ${frameAlpha * 0.8})`;
        ctx.lineWidth = f === 0 ? 1.8 : 1;
        ctx.stroke();
      }

      // 2. Frequency Bin Vertical Grid Marks
      ctx.beginPath();
      for (let i = 0; i < BINS; i += 8) {
        const x = i * binWidth;
        ctx.moveTo(x, specStartY - 80);
        ctx.lineTo(x, specStartY + MAX_FRAMES * 18);
      }
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.06)' : 'rgba(204, 90, 54, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Current Frequency Cursor Reticle
      if (mouse.active) {
        ctx.beginPath();
        ctx.moveTo(mouse.x, specStartY - 90);
        ctx.lineTo(mouse.x, specStartY + MAX_FRAMES * 18);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
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
