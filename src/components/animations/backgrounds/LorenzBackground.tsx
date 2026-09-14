import React, { useEffect, useRef } from 'react';

// 3D Point in Phase Space
interface State3D {
  x: number;
  y: number;
  z: number;
}

export const LorenzBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Lorenz Attractor differential equations parameters:
    // dx/dt = sigma * (y - x)
    // dy/dt = x * (rho - z) - y
    // dz/dt = x * y - beta * z
    const SIGMA = 10;
    let RHO = 28;
    const BETA = 8 / 3;
    const DT = 0.008;

    // Precompute a smooth trajectory of points
    const MAX_POINTS = 900;
    const trajectory: State3D[] = [];

    let current: State3D = { x: 0.1, y: 0.0, z: 0.0 };
    for (let i = 0; i < MAX_POINTS; i++) {
      const dx = SIGMA * (current.y - current.x);
      const dy = current.x * (RHO - current.z) - current.y;
      const dz = current.x * current.y - BETA * current.z;

      current = {
        x: current.x + dx * DT,
        y: current.y + dy * DT,
        z: current.z + dz * DT,
      };
      trajectory.push({ ...current });
    }

    let rotY = 0;
    let rotX = 0.3;
    let rotSpeedY = 0.004;

    let mouse = { x: width / 2, y: height / 2, active: false };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      rotSpeedY = 0.004 + (e.clientX - width / 2) * 0.00003;
      rotX = 0.3 + (e.clientY - height / 2) * 0.001;
    };

    const handleMouseDown = () => {
      // Perturb chaos parameter RHO
      RHO = RHO === 28 ? 36 : 28;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotY += rotSpeedY;

      // Integrate newest step and slide buffer
      const last = trajectory[trajectory.length - 1];
      const dx = SIGMA * (last.y - last.x);
      const dy = last.x * (RHO - last.z) - last.y;
      const dz = last.x * last.y - BETA * last.z;
      trajectory.push({
        x: last.x + dx * DT,
        y: last.y + dy * DT,
        z: last.z + dz * DT,
      });
      if (trajectory.length > MAX_POINTS) {
        trajectory.shift();
      }

      const isDark = document.documentElement.classList.contains('dark');
      const centerX = width / 2;
      const centerY = height / 2 + 30;
      const scale = Math.min(width, height) * 0.022;

      ctx.beginPath();
      for (let i = 0; i < trajectory.length; i++) {
        const p = trajectory[i];

        // Center Z around median ~25
        const pz = p.z - 25;

        // 3D rotation around Y & X
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        const x1 = p.x * cosY + pz * sinY;
        const z1 = -p.x * sinY + pz * cosY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective
        const cameraDist = 80;
        const factor = 900 / (z2 + cameraDist);
        const screenX = centerX + x1 * scale * factor * 0.09;
        const screenY = centerY + y1 * scale * factor * 0.09;

        if (i === 0) {
          ctx.moveTo(screenX, screenY);
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }

      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.45)' : 'rgba(204, 90, 54, 0.35)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Axis crosshairs in 3D center
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(204, 90, 54, 0.5)';
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
