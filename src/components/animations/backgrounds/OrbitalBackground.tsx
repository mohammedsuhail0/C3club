import React, { useEffect, useRef } from 'react';

interface OrbitPlane {
  a: number; // semi-major axis
  e: number; // eccentricity
  omega: number; // argument of periapsis
  period: number;
  theta: number;
}

export const OrbitalBackground: React.FC = () => {
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

    const orbits: OrbitPlane[] = [
      { a: 90, e: 0.15, omega: 0.2, period: 0.03, theta: 0 },
      { a: 155, e: 0.22, omega: 0.7, period: 0.02, theta: 1 },
      { a: 230, e: 0.35, omega: 1.4, period: 0.013, theta: 2 },
      { a: 320, e: 0.28, omega: 2.1, period: 0.009, theta: 3 },
      { a: 420, e: 0.42, omega: 2.8, period: 0.006, theta: 4 },
    ];

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
      // Advance true anomaly
      orbits.forEach((o) => (o.theta += 0.8));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const focusX = mouse.active ? mouse.x : width * 0.5;
      const focusY = mouse.active ? mouse.y : height * 0.5;

      // 1. Central Focal Star Marker
      ctx.beginPath();
      ctx.arc(focusX, focusY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#CC5A36';
      ctx.fill();

      // Concentric focal crosshairs
      ctx.beginPath();
      ctx.moveTo(focusX - 18, focusY);
      ctx.lineTo(focusX + 18, focusY);
      ctx.moveTo(focusX, focusY - 18);
      ctx.lineTo(focusX, focusY + 18);
      ctx.strokeStyle = 'rgba(204, 90, 54, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2. Draw Keplerian Ellipses & Orbital Radius Vectors
      orbits.forEach((orbit, i) => {
        orbit.theta += orbit.period;
        const b = orbit.a * Math.sqrt(1 - orbit.e * orbit.e);
        const c = orbit.a * orbit.e; // distance from center to focus

        // Draw Complete Orbital Ellipse
        ctx.save();
        ctx.translate(focusX, focusY);
        ctx.rotate(orbit.omega);
        // Shift center by linear eccentricity -c
        ctx.beginPath();
        ctx.ellipse(-c, 0, orbit.a, b, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? `rgba(204, 90, 54, ${0.12 + i * 0.03})` : `rgba(204, 90, 54, ${0.1 + i * 0.02})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Major Axis Line (Apsidal line connecting perihelion and aphelion)
        ctx.beginPath();
        ctx.moveTo(-c - orbit.a, 0);
        ctx.lineTo(-c + orbit.a, 0);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.06)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Calculate Position on Orbit using Polar Kepler Equation:
        // r = a(1 - e^2) / (1 + e*cos(theta))
        const r = (orbit.a * (1 - orbit.e * orbit.e)) / (1 + orbit.e * Math.cos(orbit.theta));
        const bodyX = r * Math.cos(orbit.theta);
        const bodyY = r * Math.sin(orbit.theta);

        // Radius Vector from Focus to Orbital Body
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(bodyX, bodyY);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.22)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Orbital Body Position Ring
        ctx.beginPath();
        ctx.arc(bodyX, bodyY, 3.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#CC5A36';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
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
