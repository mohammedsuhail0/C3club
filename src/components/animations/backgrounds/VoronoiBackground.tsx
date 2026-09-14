import React, { useEffect, useRef } from 'react';

interface VoronoiNode {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

export const VoronoiBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let nodes: VoronoiNode[] = [];

    const initNodes = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      nodes = [];

      const CELL_SIZE = 95;
      const cols = Math.ceil(width / CELL_SIZE) + 2;
      const rows = Math.ceil(height / CELL_SIZE) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Hexagonal jitter offset
          const offsetX = (r % 2) * (CELL_SIZE / 2);
          const jitterX = (Math.random() - 0.5) * 25;
          const jitterY = (Math.random() - 0.5) * 25;
          const ox = (c - 1) * CELL_SIZE + offsetX + jitterX;
          const oy = (r - 1) * (CELL_SIZE * 0.866) + jitterY;

          nodes.push({
            x: ox,
            y: oy,
            originX: ox,
            originY: oy,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    initNodes();

    let mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = () => {
      // Kinetic shockwave displacement
      nodes.forEach((n) => {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 380) {
          const force = (1 - dist / 380) * 35;
          const angle = Math.atan2(dy, dx);
          n.vx += Math.cos(angle) * force;
          n.vy += Math.sin(angle) * force;
        }
      });
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', initNodes);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);

    const isDarkMode = () => document.documentElement.classList.contains('dark');
    const SPRING = 0.05;
    const DAMP = 0.86;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkMode();
      const baseAlpha = dark ? 0.08 : 0.07;
      const highlightAlpha = dark ? 0.45 : 0.38;

      // Update node physics
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Return spring
        const dx = n.originX - n.x;
        const dy = n.originY - n.y;
        n.vx += dx * SPRING;
        n.vy += dy * SPRING;

        // Mouse repelling
        if (mouse.active) {
          const mdx = n.x - mouse.x;
          const mdy = n.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 190 && mdist > 0) {
            const force = (1 - mdist / 190) * 0.6;
            const angle = Math.atan2(mdy, mdx);
            n.vx += Math.cos(angle) * force * 15;
            n.vy += Math.sin(angle) * force * 15;
          }
        }

        n.vx *= DAMP;
        n.vy *= DAMP;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Draw Delaunay triangulation / polygonal bonds
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < Math.min(i + 12, nodes.length); j++) {
          const n2 = nodes[j];
          const dist = Math.sqrt((n2.x - n1.x) ** 2 + (n2.y - n1.y) ** 2);

          if (dist < 125) {
            const midX = (n1.x + n2.x) / 2;
            const midY = (n1.y + n2.y) / 2;
            const mouseDist = Math.sqrt((midX - mouse.x) ** 2 + (midY - mouse.y) ** 2);
            const isNear = mouse.active && mouseDist < 180;

            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);

            if (isNear) {
              const prox = 1 - mouseDist / 180;
              ctx.strokeStyle = `rgba(204, 90, 54, ${baseAlpha + prox * highlightAlpha})`;
              ctx.lineWidth = 1 + prox * 1.5;
            } else {
              ctx.strokeStyle = `rgba(204, 90, 54, ${baseAlpha})`;
              ctx.lineWidth = 1;
            }
            ctx.stroke();
          }
        }
      }

      // Draw node junctions
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const mdist = Math.sqrt((n.x - mouse.x) ** 2 + (n.y - mouse.y) ** 2);
        const isNear = mouse.active && mdist < 160;

        ctx.beginPath();
        ctx.arc(n.x, n.y, isNear ? 2.8 : 1.6, 0, Math.PI * 2);
        if (isNear) {
          const p = 1 - mdist / 160;
          ctx.fillStyle = `rgba(204, 90, 54, ${0.4 + p * 0.6})`;
        } else {
          ctx.fillStyle = `rgba(204, 90, 54, ${baseAlpha * 1.6})`;
        }
        ctx.fill();
      }

      // Cursor halo
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 50, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', initNodes);
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
