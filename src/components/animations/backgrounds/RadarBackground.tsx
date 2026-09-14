import React, { useEffect, useRef } from 'react';

interface SonarPing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  intensity: number;
}

export const RadarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let sweepAngle = 0;
    const sweepSpeed = 0.02;

    let mouse = { x: width / 2, y: height / 2, active: false };
    let pings: SonarPing[] = [];
    let lastSweepIntersect = 0;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Manual ping on click
      pings.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 280,
        intensity: 1.0,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      sweepAngle = (sweepAngle + sweepSpeed) % (Math.PI * 2);

      // 1. Check if sweep beam passes over cursor
      if (mouse.active) {
        const dx = mouse.x - centerX;
        const dy = mouse.y - centerY;
        let mouseAngle = Math.atan2(dy, dx);
        if (mouseAngle < 0) mouseAngle += Math.PI * 2;

        const diff = Math.abs(sweepAngle - mouseAngle);
        const now = Date.now();
        if (diff < 0.05 && now - lastSweepIntersect > 800) {
          lastSweepIntersect = now;
          pings.push({
            x: mouse.x,
            y: mouse.y,
            radius: 0,
            maxRadius: 220,
            intensity: 0.9,
          });
        }
      }

      // 2. Draw Concentric Radar Range Rings
      const ringStep = 90;
      const ringCount = Math.ceil(maxDist / ringStep);
      for (let i = 1; i <= ringCount; i++) {
        const r = i * ringStep;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.08)' : 'rgba(204, 90, 54, 0.07)';
        ctx.lineWidth = 1;
        if (i % 3 === 0) {
          ctx.setLineDash([4, 6]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 3. Draw Azimuth Radial Spokes
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(a) * maxDist, centerY + Math.sin(a) * maxDist);
        ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.07)' : 'rgba(204, 90, 54, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 4. Draw Rotating Phosphor Sweep Sector
      const sweepTailAngle = 0.45; // ~25 degrees
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxDist, sweepAngle - sweepTailAngle, sweepAngle, false);
      ctx.closePath();

      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxDist);
      sweepGradient.addColorStop(0, 'rgba(204, 90, 54, 0.12)');
      sweepGradient.addColorStop(1, 'rgba(204, 90, 54, 0.02)');
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Main sweep vector line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(sweepAngle) * maxDist, centerY + Math.sin(sweepAngle) * maxDist);
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.45)' : 'rgba(204, 90, 54, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 5. Update & Draw Expanding Sonar Pings
      for (let i = pings.length - 1; i >= 0; i--) {
        const ping = pings[i];
        ping.radius += 3.5;
        ping.intensity *= 0.96;

        if (ping.radius > ping.maxRadius || ping.intensity < 0.05) {
          pings.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ping.x, ping.y, ping.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204, 90, 54, ${ping.intensity * (isDark ? 0.6 : 0.45)})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ping.x, ping.y, Math.max(0, ping.radius - 15), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204, 90, 54, ${ping.intensity * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 6. Draw Bottom Engineering Oscilloscope Signal Ribbon
      const oscY = height - 55;
      const oscWidth = Math.min(width * 0.7, 800);
      const oscStartX = (width - oscWidth) / 2;

      ctx.beginPath();
      for (let x = 0; x <= oscWidth; x += 4) {
        const norm = x / oscWidth;
        const distToMouse = mouse.active ? Math.abs((oscStartX + x) - mouse.x) : 999;
        const excitation = distToMouse < 160 ? (1 - distToMouse / 160) * 18 : 0;
        const wave = Math.sin(x * 0.04 - sweepAngle * 6) * (4 + excitation);

        if (x === 0) {
          ctx.moveTo(oscStartX + x, oscY + wave);
        } else {
          ctx.lineTo(oscStartX + x, oscY + wave);
        }
      }
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.3)' : 'rgba(204, 90, 54, 0.25)';
      ctx.lineWidth = 1.2;
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
