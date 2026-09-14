import React, { useEffect, useRef } from 'react';

export const FibonacciBackground: React.FC = () => {
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
    let rotation = 0;
    let pulse = 0;

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
      pulse = 1.0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const PHI = 1.61803398875;
    const NUM_ARMS = 14;
    const MAX_RADIUS = Math.max(width, height) * 0.75;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotation += 0.003;

      if (pulse > 0.01) {
        pulse *= 0.95;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const originX = mouse.active ? mouse.x : width * 0.5;
      const originY = mouse.active ? mouse.y : height * 0.5;

      // Draw Logarithmic Golden Spiral Arms
      for (let i = 0; i < NUM_ARMS; i++) {
        const armOffset = (i / NUM_ARMS) * Math.PI * 2;
        ctx.beginPath();

        const b = 0.17 + pulse * 0.04;
        let isFirst = true;

        for (let theta = 0; theta < Math.PI * 6; theta += 0.08) {
          const r = 8 * Math.exp(b * theta);
          if (r > MAX_RADIUS) break;

          const angle = theta + armOffset + rotation;
          const x = originX + r * Math.cos(angle);
          const y = originY + r * Math.sin(angle);

          if (isFirst) {
            ctx.moveTo(x, y);
            isFirst = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        const alphaNorm = 1 - (i % 2 === 0 ? 0.2 : 0.5);
        ctx.strokeStyle = isDark ? `rgba(204, 90, 54, ${0.15 * alphaNorm + pulse * 0.2})` : `rgba(204, 90, 54, ${0.12 * alphaNorm + pulse * 0.2})`;
        ctx.lineWidth = i % 2 === 0 ? 1.4 : 0.9;
        ctx.stroke();
      }

      // Reverse Helices for Interlocking Lattice
      for (let i = 0; i < NUM_ARMS; i++) {
        const armOffset = (i / NUM_ARMS) * Math.PI * 2;
        ctx.beginPath();

        const b = 0.17 + pulse * 0.04;
        let isFirst = true;

        for (let theta = 0; theta < Math.PI * 6; theta += 0.08) {
          const r = 8 * Math.exp(b * theta);
          if (r > MAX_RADIUS) break;

          const angle = -theta + armOffset - rotation;
          const x = originX + r * Math.cos(angle);
          const y = originY + r * Math.sin(angle);

          if (isFirst) {
            ctx.moveTo(x, y);
            isFirst = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.07)' : 'rgba(204, 90, 54, 0.05)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Golden Section Center Concentric Rings
      const goldenRings = [12, 12 * PHI, 12 * PHI * PHI, 12 * Math.pow(PHI, 3)];
      goldenRings.forEach((gr, idx) => {
        ctx.beginPath();
        ctx.arc(originX, originY, gr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204, 90, 54, ${0.3 / (idx + 1)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
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
