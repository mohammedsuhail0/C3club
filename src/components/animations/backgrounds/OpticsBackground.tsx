import React, { useEffect, useRef } from 'react';

interface Prism {
  cx: number;
  cy: number;
  size: number;
  angle: number;
}

export const OpticsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width * 0.6, y: height * 0.5, active: false };
    let prismRotation = 0;
    let beamPulse = 0;

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
      beamPulse = 1.0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      prismRotation += 0.005;

      if (beamPulse > 0.01) {
        beamPulse *= 0.94;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const prismX = mouse.active ? mouse.x : width * 0.55;
      const prismY = mouse.active ? mouse.y : height * 0.5;
      const prismSize = 85;

      // 1. Draw Optical Prism Geometry (Equilateral Triangle)
      const p1 = {
        x: prismX + prismSize * Math.cos(prismRotation),
        y: prismY + prismSize * Math.sin(prismRotation),
      };
      const p2 = {
        x: prismX + prismSize * Math.cos(prismRotation + (2 * Math.PI) / 3),
        y: prismY + prismSize * Math.sin(prismRotation + (2 * Math.PI) / 3),
      };
      const p3 = {
        x: prismX + prismSize * Math.cos(prismRotation + (4 * Math.PI) / 3),
        y: prismY + prismSize * Math.sin(prismRotation + (4 * Math.PI) / 3),
      };

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();

      ctx.fillStyle = isDark ? 'rgba(204, 90, 54, 0.06)' : 'rgba(204, 90, 54, 0.04)';
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.4)' : 'rgba(204, 90, 54, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Incident Laser Ray Emitters from Left
      const numRays = 7;
      const raySpacing = 28;
      const startY = prismY - ((numRays - 1) * raySpacing) / 2;

      for (let i = 0; i < numRays; i++) {
        const sourceY = startY + i * raySpacing;
        const sourceX = 0;

        // Incident beam to prism surface
        const hitX = prismX - prismSize * 0.45;
        const hitY = sourceY + (sourceY - prismY) * 0.15;

        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(hitX, hitY);
        ctx.strokeStyle = `rgba(204, 90, 54, ${0.35 + beamPulse * 0.4})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Refracted beam inside prism
        const exitX = prismX + prismSize * 0.4;
        const exitY = hitY + 12;
        ctx.beginPath();
        ctx.moveTo(hitX, hitY);
        ctx.lineTo(exitX, exitY);
        ctx.strokeStyle = `rgba(220, 100, 60, ${0.5 + beamPulse * 0.4})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // Dispersed chromatic rays fanning out to the right
        const spreadAngles = [-0.18, -0.09, 0, 0.09, 0.18];
        spreadAngles.forEach((ang, sIdx) => {
          const rayAngle = ang + (i - 3) * 0.04 + prismRotation * 0.2;
          const endX = width;
          const endY = exitY + (endX - exitX) * Math.tan(rayAngle);

          ctx.beginPath();
          ctx.moveTo(exitX, exitY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(204, 90, 54, ${0.18 - Math.abs(ang) * 0.3 + beamPulse * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Reflected ray bouncing upward (Fresnel reflection)
        const reflectEndX = hitX + 180;
        const reflectEndY = hitY - 260;
        ctx.beginPath();
        ctx.moveTo(hitX, hitY);
        ctx.lineTo(reflectEndX, reflectEndY);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.12)';
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      // Normal angle reference at prism center
      ctx.beginPath();
      ctx.arc(prismX, prismY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#CC5A36';
      ctx.fill();

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
