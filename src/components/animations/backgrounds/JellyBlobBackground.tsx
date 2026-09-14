import React, { useEffect, useRef } from 'react';
import { sounds } from '../../../utils/audio';

interface BlobVertex {
  angle: number;
  radius: number;
  targetRadius: number;
  velocity: number;
}

export const JellyBlobBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let blobX = width * 0.5;
    let blobY = height * 0.5;
    let blobVx = 0;
    let blobVy = 0;

    const BASE_RADIUS = Math.min(width, height) * 0.22;
    const NUM_VERTICES = 24;
    const vertices: BlobVertex[] = [];

    for (let i = 0; i < NUM_VERTICES; i++) {
      const angle = (i / NUM_VERTICES) * Math.PI * 2;
      vertices.push({
        angle,
        radius: BASE_RADIUS,
        targetRadius: BASE_RADIUS,
        velocity: 0,
      });
    }

    let mouse = { x: width * 0.5, y: height * 0.5, active: false };

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
      sounds.playBoing();
      // Jiggle impulse across all vertices
      vertices.forEach((v, i) => {
        v.velocity += (i % 2 === 0 ? 1 : -1) * (25 + Math.random() * 20);
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let wobbleTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      wobbleTime += 0.02;

      const isDark = document.documentElement.classList.contains('dark');

      // 1. Follow cursor with fluid lag
      const targetX = mouse.active ? mouse.x : width * 0.5;
      const targetY = mouse.active ? mouse.y : height * 0.5;

      const dx = targetX - blobX;
      const dy = targetY - blobY;
      blobVx += dx * 0.015;
      blobVy += dy * 0.015;
      blobVx *= 0.88;
      blobVy *= 0.88;
      blobX += blobVx;
      blobY += blobVy;

      // 2. Squash and stretch from motion
      const speed = Math.sqrt(blobVx * blobVx + blobVy * blobVy);
      const moveAngle = Math.atan2(blobVy, blobVx);

      // 3. Update vertices physics (Spring + Gelatin Jiggle)
      for (let i = 0; i < NUM_VERTICES; i++) {
        const v = vertices[i];

        // Base breathing motion
        const breath = Math.sin(wobbleTime * 2 + i * 0.5) * 6;

        // Motion deformation (squash in direction of travel)
        const angleDiff = v.angle - moveAngle;
        const motionDistort = Math.cos(angleDiff * 2) * Math.min(speed * 3.5, BASE_RADIUS * 0.35);

        v.targetRadius = BASE_RADIUS + breath + motionDistort;

        // Spring acceleration
        const force = -0.15 * (v.radius - v.targetRadius);
        v.velocity += force;
        v.velocity *= 0.92; // Damping
        v.radius += v.velocity;
      }

      // 4. Draw smooth organic bezier curve through vertices
      const points = vertices.map((v) => ({
        x: blobX + Math.cos(v.angle) * v.radius,
        y: blobY + Math.sin(v.angle) * v.radius,
      }));

      ctx.beginPath();
      ctx.moveTo((points[0].x + points[NUM_VERTICES - 1].x) / 2, (points[0].y + points[NUM_VERTICES - 1].y) / 2);

      for (let i = 0; i < NUM_VERTICES; i++) {
        const next = (i + 1) % NUM_VERTICES;
        const midX = (points[i].x + points[next].x) / 2;
        const midY = (points[i].y + points[next].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      ctx.closePath();

      // Soft translucent jelly fill
      const grad = ctx.createRadialGradient(blobX, blobY, BASE_RADIUS * 0.1, blobX, blobY, BASE_RADIUS * 1.3);
      grad.addColorStop(0, isDark ? 'rgba(204, 90, 54, 0.22)' : 'rgba(204, 90, 54, 0.16)');
      grad.addColorStop(1, 'rgba(204, 90, 54, 0.02)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Elastic border stroke
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.5)' : 'rgba(204, 90, 54, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner concentric highlight loop
      ctx.beginPath();
      for (let i = 0; i < NUM_VERTICES; i++) {
        const v = vertices[i];
        const innerRadius = v.radius * 0.55;
        const px = blobX + Math.cos(v.angle) * innerRadius;
        const py = blobY + Math.sin(v.angle) * innerRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(204, 90, 54, 0.18)';
      ctx.lineWidth = 1;
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
