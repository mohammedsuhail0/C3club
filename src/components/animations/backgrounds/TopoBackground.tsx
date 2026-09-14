import React, { useEffect, useRef } from 'react';

interface WavePoint {
  x: number;
  y: number;
  originY: number;
  vy: number;
}

interface TopoRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  intensity: number;
}

export const TopoBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const NUM_LINES = 26;
    const SEGMENTS = 48;
    let lines: WavePoint[][] = [];

    const initLines = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      lines = [];

      const lineGap = height / (NUM_LINES + 1);
      const segWidth = width / SEGMENTS;

      for (let l = 0; l < NUM_LINES; l++) {
        const row: WavePoint[] = [];
        const baseCy = lineGap * (l + 1);

        for (let s = 0; s <= SEGMENTS; s++) {
          row.push({
            x: s * segWidth,
            y: baseCy,
            originY: baseCy,
            vy: 0,
          });
        }
        lines.push(row);
      }
    };

    initLines();

    let mouse = { x: -1000, y: -1000, active: false };
    let ripples: TopoRipple[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.8,
        speed: 16,
        intensity: 32,
      });
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', initLines);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);

    const isDarkMode = () => document.documentElement.classList.contains('dark');
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      const dark = isDarkMode();
      const baseAlpha = dark ? 0.08 : 0.07;
      const highlightAlpha = dark ? 0.5 : 0.4;

      // Update Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.radius += rp.speed;
        rp.intensity *= 0.97;
        if (rp.radius > rp.maxRadius || rp.intensity < 0.2) {
          ripples.splice(i, 1);
        }
      }

      // Update and Draw Topographic Contour Lines
      for (let l = 0; l < lines.length; l++) {
        const row = lines[l];
        ctx.beginPath();

        let lineNearMouse = false;
        let lineProximity = 0;

        for (let s = 0; s <= SEGMENTS; s++) {
          const pt = row[s];

          // Natural harmonic topographic wave
          const naturalWave = Math.sin(pt.x * 0.004 + time + l * 0.45) * 12 +
                              Math.cos(pt.x * 0.008 - time * 0.7 + l * 0.3) * 6;

          // Target elevation
          let targetY = pt.originY + naturalWave;

          // Mouse fluid depression & wave wake
          if (mouse.active) {
            const dx = pt.x - mouse.x;
            const dy = pt.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 220) {
              const force = (1 - dist / 220);
              targetY += Math.sin(force * Math.PI) * 45; // Dynamic fluid swell
              lineNearMouse = true;
              lineProximity = Math.max(lineProximity, force);
            }
          }

          // Click ripple effect
          for (let r = 0; r < ripples.length; r++) {
            const rp = ripples[r];
            const dx = pt.x - rp.x;
            const dy = pt.y - rp.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const delta = Math.abs(dist - rp.radius);

            if (delta < 70) {
              const waveForce = Math.sin((delta / 70) * Math.PI) * rp.intensity;
              targetY += waveForce;
            }
          }

          // Spring physics to smooth targetY
          pt.vy += (targetY - pt.y) * 0.06;
          pt.vy *= 0.85;
          pt.y += pt.vy;

          if (s === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            // Smooth bezier through points
            const prev = row[s - 1];
            const midX = (prev.x + pt.x) / 2;
            const midY = (prev.y + pt.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
          }
        }

        // Stroke styling
        if (lineNearMouse) {
          ctx.strokeStyle = `rgba(204, 90, 54, ${baseAlpha + lineProximity * highlightAlpha})`;
          ctx.lineWidth = 1 + lineProximity * 1.5;
        } else {
          ctx.strokeStyle = `rgba(204, 90, 54, ${baseAlpha})`;
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      // Mouse interactive focal aura
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', initLines);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
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
