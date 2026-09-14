import React, { useEffect, useRef } from 'react';

export const AerodynamicsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width * 0.45, y: height * 0.5, active: false };
    let machShock = 0;

    const NUM_STREAMLINES = 32;
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
      machShock = 1.0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let flowTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      flowTime += 0.02;

      if (machShock > 0.01) {
        machShock *= 0.95;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const foilX = mouse.active ? mouse.x : width * 0.45;
      const foilY = mouse.active ? mouse.y : height * 0.5;
      const spacing = height / (NUM_STREAMLINES + 1);

      // 1. Draw Laminar Wind Tunnel Streamlines
      for (let i = 1; i <= NUM_STREAMLINES; i++) {
        const baseY = i * spacing;
        ctx.beginPath();

        for (let j = 0; j <= SEGMENTS; j++) {
          const x = (j / SEGMENTS) * width;
          let y = baseY;

          // Airfoil potential flow deflection around (foilX, foilY)
          const dx = x - foilX;
          const dy = y - foilY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const r0 = 110;

          if (dist < r0 * 2.8 && dist > 1) {
            // Potential dipole doublet flow field: y_deflect = y * (1 - r0^2 / dist^2)
            const factor = Math.pow(r0 / Math.max(dist, r0 * 0.6), 2);
            const sign = dy >= 0 ? 1 : -1;
            const deflection = sign * factor * 38;

            // Downwash wake behind the airfoil (x > foilX)
            const wakeDownwash = dx > 0 ? Math.exp(-dx * 0.003) * 12 : 0;
            y += deflection + wakeDownwash;
          }

          // Ambient fluid wave undulation
          y += Math.sin(x * 0.004 + flowTime * 2 + i * 0.1) * 3;

          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const distToFoil = Math.abs(baseY - foilY);
        const nearFoil = distToFoil < 160;
        const lineAlpha = (isDark ? 0.09 : 0.07) + (nearFoil ? 0.35 * (1 - distToFoil / 160) : 0);

        ctx.strokeStyle = `rgba(204, 90, 54, ${lineAlpha + machShock * 0.25})`;
        ctx.lineWidth = nearFoil ? 1.4 : 1;
        ctx.stroke();
      }

      // 2. Draw NACA Airfoil Profile at (foilX, foilY)
      ctx.save();
      ctx.translate(foilX, foilY);
      const angleOfAttack = -0.12;
      ctx.rotate(angleOfAttack);

      ctx.beginPath();
      const chord = 90;
      // Symmetric NACA 4-digit upper & lower camber
      ctx.moveTo(-chord * 0.5, 0);
      ctx.bezierCurveTo(-chord * 0.3, -22, chord * 0.2, -18, chord * 0.5, 0);
      ctx.bezierCurveTo(chord * 0.2, 10, -chord * 0.3, 12, -chord * 0.5, 0);
      ctx.closePath();

      ctx.fillStyle = isDark ? 'rgba(204, 90, 54, 0.15)' : 'rgba(204, 90, 54, 0.1)';
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.8)' : 'rgba(204, 90, 54, 0.7)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();

      // 3. Supersonic Mach Angle Shock Cone on click
      if (machShock > 0.05) {
        ctx.beginPath();
        ctx.moveTo(foilX - chord * 0.5, foilY);
        ctx.lineTo(foilX + 400, foilY - 260);
        ctx.moveTo(foilX - chord * 0.5, foilY);
        ctx.lineTo(foilX + 400, foilY + 260);
        ctx.strokeStyle = `rgba(204, 90, 54, ${machShock * 0.6})`;
        ctx.lineWidth = 2;
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
