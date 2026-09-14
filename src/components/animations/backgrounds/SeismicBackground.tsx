import React, { useEffect, useRef } from 'react';

interface SeismicChannel {
  id: string;
  baseY: number;
  history: number[];
  needleY: number;
  sensitivity: number;
}

export const SeismicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const MAX_POINTS = Math.ceil(width / 3) + 10;
    const channels: SeismicChannel[] = [
      { id: 'CH-01 // PRIMARY_P', baseY: height * 0.28, history: [], needleY: 0, sensitivity: 1.0 },
      { id: 'CH-02 // SECONDARY_S', baseY: height * 0.50, history: [], needleY: 0, sensitivity: 1.6 },
      { id: 'CH-03 // SURFACE_RAYLEIGH', baseY: height * 0.72, history: [], needleY: 0, sensitivity: 2.2 },
    ];

    channels.forEach((ch) => {
      for (let i = 0; i < MAX_POINTS; i++) {
        ch.history.push(0);
      }
    });

    let mouse = { x: width * 0.5, y: height * 0.5, prevX: width * 0.5, prevY: height * 0.5, speed: 0 };
    let quakeImpulse = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      channels[0].baseY = height * 0.28;
      channels[1].baseY = height * 0.50;
      channels[2].baseY = height * 0.72;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.prevX;
      const dy = e.clientY - mouse.prevY;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);
      mouse.prevX = mouse.x = e.clientX;
      mouse.prevY = mouse.y = e.clientY;
    };

    const handleMouseDown = () => {
      quakeImpulse = 40;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.04;

      mouse.speed *= 0.92;
      if (quakeImpulse > 0.1) {
        quakeImpulse *= 0.95;
      }

      const isDark = document.documentElement.classList.contains('dark');

      // 1. Draw Seismograph Chart Paper Background Grid
      const vSpacing = 60;
      ctx.beginPath();
      for (let x = 0; x <= width; x += vSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.04)' : 'rgba(204, 90, 54, 0.03)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Update & Draw Seismic Channels
      channels.forEach((ch) => {
        // Compute new sample value
        const noise = (Math.random() - 0.5) * 2;
        const tremor = mouse.speed > 1 ? (Math.random() - 0.5) * mouse.speed * ch.sensitivity * 0.8 : 0;
        const quake = quakeImpulse > 0 ? (Math.sin(time * 18) + (Math.random() - 0.5) * 1.5) * quakeImpulse * ch.sensitivity : 0;

        const currentVal = noise + tremor + quake;
        ch.history.push(currentVal);
        if (ch.history.length > MAX_POINTS) {
          ch.history.shift();
        }

        // Draw Baseline Channel Reference Line
        ctx.beginPath();
        ctx.moveTo(0, ch.baseY);
        ctx.lineTo(width, ch.baseY);
        ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.12)' : 'rgba(204, 90, 54, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw Continuous Seismograph Needle Trace
        ctx.beginPath();
        for (let i = 0; i < ch.history.length; i++) {
          const x = i * 3;
          const y = ch.baseY + ch.history[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.6)' : 'rgba(204, 90, 54, 0.5)';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Channel Label on the right
        ctx.fillStyle = isDark ? 'rgba(204, 90, 54, 0.4)' : 'rgba(204, 90, 54, 0.35)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(ch.id, width - 20, ch.baseY - 8);
      });

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
