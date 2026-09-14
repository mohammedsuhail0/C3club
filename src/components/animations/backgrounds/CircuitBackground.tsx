import React, { useEffect, useRef } from 'react';

interface Trace {
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  pulseProgress: number;
  pulseSpeed: number;
  active: boolean;
}

interface NodePad {
  x: number;
  y: number;
  radius: number;
  lit: number;
}

export const CircuitBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let traces: Trace[] = [];
    let pads: NodePad[] = [];

    const initCircuit = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      traces = [];
      pads = [];

      const GRID = 80;
      const cols = Math.ceil(width / GRID) + 1;
      const rows = Math.ceil(height / GRID) + 1;

      // Create grid-aligned micro-via pads
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c) % 3 === 0) {
            pads.push({
              x: c * GRID,
              y: r * GRID,
              radius: (r + c) % 6 === 0 ? 4 : 2.5,
              lit: 0,
            });
          }
        }
      }

      // Generate PCB traces connecting nearby pads with 45-degree chamfers
      for (let i = 0; i < pads.length; i++) {
        const p1 = pads[i];
        // Connect to 1 or 2 neighboring pads
        for (let j = i + 1; j < Math.min(i + 8, pads.length); j++) {
          const p2 = pads[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 40 && dist < 180 && Math.random() > 0.4) {
            // 45 degree routing bend
            const midX = p1.x + (dx > 0 ? Math.min(dx, 40) : Math.max(dx, -40));
            const midY = p1.y;

            traces.push({
              startX: p1.x,
              startY: p1.y,
              midX,
              midY,
              endX: p2.x,
              endY: p2.y,
              pulseProgress: Math.random(),
              pulseSpeed: 0.008 + Math.random() * 0.015,
              active: false,
            });
          }
        }
      }
    };

    initCircuit();

    let mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = () => {
      // Fire electric burst across all nearby traces
      traces.forEach((t) => {
        const dx = (t.startX + t.endX) / 2 - mouse.x;
        const dy = (t.startY + t.endY) / 2 - mouse.y;
        if (Math.sqrt(dx * dx + dy * dy) < 400) {
          t.active = true;
          t.pulseSpeed = 0.035;
        }
      });
      pads.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        if (Math.sqrt(dx * dx + dy * dy) < 350) {
          p.lit = 1.0;
        }
      });
    };

    const handleKeyDown = () => {
      // Tactical keypress data burst
      traces.forEach((t) => {
        if (Math.random() > 0.6) {
          t.active = true;
          t.pulseSpeed = 0.025;
        }
      });
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', initCircuit);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseleave', handleMouseLeave);

    const isDarkMode = () => document.documentElement.classList.contains('dark');

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkMode();
      const baseAlpha = dark ? 0.07 : 0.06;
      const highlightAlpha = dark ? 0.5 : 0.45;

      // Draw PCB copper circuit traces
      for (let i = 0; i < traces.length; i++) {
        const t = traces[i];
        const midPointX = (t.startX + t.endX) / 2;
        const midPointY = (t.startY + t.endY) / 2;
        const dist = Math.sqrt((midPointX - mouse.x) ** 2 + (midPointY - mouse.y) ** 2);
        const isNear = mouse.active && dist < 180;

        ctx.beginPath();
        ctx.moveTo(t.startX, t.startY);
        ctx.lineTo(t.midX, t.midY);
        ctx.lineTo(t.endX, t.endY);

        if (isNear || t.active) {
          const prox = isNear ? 1 - dist / 180 : 0.5;
          ctx.strokeStyle = `rgba(204, 90, 54, ${baseAlpha + prox * highlightAlpha})`;
          ctx.lineWidth = 1 + prox * 1.5;
        } else {
          ctx.strokeStyle = `rgba(204, 90, 54, ${baseAlpha})`;
          ctx.lineWidth = 1;
        }
        ctx.stroke();

        // Draw electric signal pulse traveling down the trace
        t.pulseProgress += t.pulseSpeed;
        if (t.pulseProgress > 1) {
          t.pulseProgress = 0;
          if (t.active && Math.random() > 0.3) t.active = false;
        }

        if (isNear || t.active) {
          let curX = 0;
          let curY = 0;
          if (t.pulseProgress < 0.5) {
            const p = t.pulseProgress * 2;
            curX = t.startX + (t.midX - t.startX) * p;
            curY = t.startY + (t.midY - t.startY) * p;
          } else {
            const p = (t.pulseProgress - 0.5) * 2;
            curX = t.midX + (t.endX - t.midX) * p;
            curY = t.midY + (t.endY - t.midY) * p;
          }

          ctx.beginPath();
          ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(204, 90, 54, ${0.4 + (isNear ? 0.5 : 0.2)})`;
          ctx.fill();
        }
      }

      // Draw solder pads / micro-vias
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        const dist = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
        const isNear = mouse.active && dist < 160;

        if (isNear) {
          p.lit = Math.max(p.lit, 1 - dist / 160);
        } else {
          p.lit *= 0.94; // Fade out
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + p.lit * 2, 0, Math.PI * 2);

        if (p.lit > 0.05) {
          ctx.fillStyle = `rgba(204, 90, 54, ${0.15 + p.lit * 0.7})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(204, 90, 54, ${0.4 + p.lit * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(204, 90, 54, ${baseAlpha * 1.5})`;
          ctx.fill();
        }
      }

      // Cursor electromagnetic focal ring
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 48, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', initCircuit);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
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
