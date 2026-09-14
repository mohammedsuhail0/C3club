import React, { useEffect, useRef } from 'react';
import { sounds } from '../../../utils/audio';

interface BouncyBadge {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  label: string;
  sub: string;
  color: string;
  colorIdx: number;
  scaleX: number;
  scaleY: number;
}

const PALETTE = [
  '#CC5A36', // Terracotta
  '#E07A5F', // Coral Amber
  '#D97706', // Warm Amber
  '#10B981', // Emerald
  '#8B5CF6', // Cyber Violet
];

export const BouncyBadgeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const badges: BouncyBadge[] = [
      {
        x: 100,
        y: 120,
        vx: 2.8,
        vy: 2.2,
        width: 140,
        height: 52,
        label: 'C3 // COLLECTIVE',
        sub: 'EST. 2026',
        color: PALETTE[0],
        colorIdx: 0,
        scaleX: 1,
        scaleY: 1,
      },
      {
        x: width - 260,
        y: 200,
        vx: -2.4,
        vy: 2.6,
        width: 130,
        height: 48,
        label: 'SHIP EVERY FRIDAY',
        sub: 'DEPT OF IT',
        color: PALETTE[1],
        colorIdx: 1,
        scaleX: 1,
        scaleY: 1,
      },
      {
        x: 220,
        y: height - 180,
        vx: 2.2,
        vy: -2.5,
        width: 135,
        height: 50,
        label: 'BUILD > SLIDES',
        sub: 'AUTONOMOUS LAB',
        color: PALETTE[2],
        colorIdx: 2,
        scaleX: 1,
        scaleY: 1,
      },
    ];

    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, prevX: -1000, prevY: -1000, active: false };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouse.prevX !== -1000) {
        mouse.vx = (e.clientX - mouse.prevX) * 0.5;
        mouse.vy = (e.clientY - mouse.prevY) * 0.5;
      }
      mouse.prevX = mouse.x = e.clientX;
      mouse.prevY = mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = () => {
      sounds.playBoing();
      // Scatter all badges with a speed burst
      badges.forEach((b) => {
        b.vx = (Math.random() - 0.5) * 8;
        b.vy = (Math.random() - 0.5) * 8;
        b.colorIdx = (b.colorIdx + 1) % PALETTE.length;
        b.color = PALETTE[b.colorIdx];
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');

      for (let i = 0; i < badges.length; i++) {
        const b = badges[i];

        b.x += b.vx;
        b.y += b.vy;

        // Speed limit / damping
        b.vx = Math.max(-6, Math.min(6, b.vx * 0.999));
        b.vy = Math.max(-6, Math.min(6, b.vy * 0.999));

        // Restore squash & stretch scale back to 1
        b.scaleX += (1 - b.scaleX) * 0.1;
        b.scaleY += (1 - b.scaleY) * 0.1;

        // Wall collisions (DVD screensaver bounce)
        let hit = false;
        if (b.x <= 10) {
          b.x = 10;
          b.vx = Math.abs(b.vx);
          b.scaleX = 0.75;
          b.scaleY = 1.25;
          hit = true;
        } else if (b.x + b.width >= width - 10) {
          b.x = width - 10 - b.width;
          b.vx = -Math.abs(b.vx);
          b.scaleX = 0.75;
          b.scaleY = 1.25;
          hit = true;
        }

        if (b.y <= 10) {
          b.y = 10;
          b.vy = Math.abs(b.vy);
          b.scaleY = 0.75;
          b.scaleX = 1.25;
          hit = true;
        } else if (b.y + b.height >= height - 10) {
          b.y = height - 10 - b.height;
          b.vy = -Math.abs(b.vy);
          b.scaleY = 0.75;
          b.scaleX = 1.25;
          hit = true;
        }

        if (hit) {
          b.colorIdx = (b.colorIdx + 1) % PALETTE.length;
          b.color = PALETTE[b.colorIdx];
          sounds.playBoing();
        }

        // Air hockey cursor collision (Bat the badge with mouse paddle!)
        if (mouse.active) {
          const centerX = b.x + b.width / 2;
          const centerY = b.y + b.height / 2;
          const dx = centerX - mouse.x;
          const dy = centerY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            const angle = Math.atan2(dy, dx);
            const force = (1 - dist / 85) * 5;
            b.vx += Math.cos(angle) * force + mouse.vx * 0.4;
            b.vy += Math.sin(angle) * force + mouse.vy * 0.4;
            b.scaleX = 1.2;
            b.scaleY = 0.8;
          }
        }

        // Draw Badge
        ctx.save();
        ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
        ctx.scale(b.scaleX, b.scaleY);
        ctx.translate(-(b.x + b.width / 2), -(b.y + b.height / 2));

        // Badge Pill Background
        ctx.beginPath();
        const r = 12;
        ctx.roundRect(b.x, b.y, b.width, b.height, r);
        ctx.fillStyle = isDark ? 'rgba(25, 23, 21, 0.75)' : 'rgba(255, 255, 255, 0.75)';
        ctx.fill();

        // Glowing border
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Badge Text
        ctx.fillStyle = b.color;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, b.x + b.width / 2, b.y + 22);

        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
        ctx.font = '8px monospace';
        ctx.fillText(b.sub, b.x + b.width / 2, b.y + 36);

        ctx.restore();
      }

      // Air Hockey Cursor Halo
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 42, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.25)';
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
