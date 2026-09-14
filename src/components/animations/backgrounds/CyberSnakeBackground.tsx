import React, { useEffect, useRef } from 'react';
import { sounds } from '../../../utils/audio';

interface SnakeSegment {
  x: number;
  y: number;
  angle: number;
}

export const CyberSnakeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const SEGMENT_COUNT = 36;
    const SEGMENT_LENGTH = 16;
    const segments: SnakeSegment[] = [];

    // Initialize snake spine
    let headX = width * 0.5;
    let headY = height * 0.5;
    let headAngle = 0;
    let speed = 4;
    let turbo = 1;

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      segments.push({
        x: headX - i * SEGMENT_LENGTH,
        y: headY,
        angle: 0,
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

    const handleMouseDown = () => {
      sounds.playBoing();
      // Turbo spin impulse!
      turbo = 2.8;
      headAngle += Math.PI * 0.7;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let undulateTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      undulateTime += 0.08 * turbo;

      if (turbo > 1) {
        turbo *= 0.97;
      }

      const isDark = document.documentElement.classList.contains('dark');

      // 1. Steering toward mouse target
      const targetX = mouse.active ? mouse.x : width * 0.5 + Math.cos(undulateTime * 0.5) * 200;
      const targetY = mouse.active ? mouse.y : height * 0.5 + Math.sin(undulateTime * 0.5) * 200;

      const dx = targetX - headX;
      const dy = targetY - headY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const targetAngle = Math.atan2(dy, dx);

      // Angle difference normalized to [-PI, PI]
      let angleDiff = targetAngle - headAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Smooth steering with body undulation wiggle
      const wiggle = Math.sin(undulateTime * 2.5) * 0.15;
      headAngle += angleDiff * 0.08 + wiggle;

      // Speed adapts: fast if far, gentle if orbiting near mouse
      const targetSpeed = Math.min(Math.max(dist * 0.03, 3), 9) * turbo;
      speed += (targetSpeed - speed) * 0.1;

      headX += Math.cos(headAngle) * speed;
      headY += Math.sin(headAngle) * speed;

      // 2. Inverse kinematics for body spine
      segments[0].x = headX;
      segments[0].y = headY;
      segments[0].angle = headAngle;

      for (let i = 1; i < SEGMENT_COUNT; i++) {
        const prev = segments[i - 1];
        const cur = segments[i];

        const segDx = cur.x - prev.x;
        const segDy = cur.y - prev.y;
        cur.angle = Math.atan2(segDy, segDx);

        cur.x = prev.x + Math.cos(cur.angle) * SEGMENT_LENGTH;
        cur.y = prev.y + Math.sin(cur.angle) * SEGMENT_LENGTH;
      }

      // 3. Draw Cyber Snake Ribbon Body
      // Draw left and right flanks
      const leftFlank: { x: number; y: number }[] = [];
      const rightFlank: { x: number; y: number }[] = [];

      for (let i = 0; i < SEGMENT_COUNT; i++) {
        const seg = segments[i];
        // Tapered body width (wider at head, needle at tail)
        const bodyRadius = (1 - i / SEGMENT_COUNT) * 16 + 2;
        const perp = seg.angle + Math.PI / 2;

        leftFlank.push({
          x: seg.x + Math.cos(perp) * bodyRadius,
          y: seg.y + Math.sin(perp) * bodyRadius,
        });
        rightFlank.push({
          x: seg.x - Math.cos(perp) * bodyRadius,
          y: seg.y - Math.sin(perp) * bodyRadius,
        });
      }

      // Fill body
      ctx.beginPath();
      ctx.moveTo(leftFlank[0].x, leftFlank[0].y);
      for (let i = 1; i < leftFlank.length; i++) {
        ctx.lineTo(leftFlank[i].x, leftFlank[i].y);
      }
      ctx.lineTo(segments[SEGMENT_COUNT - 1].x, segments[SEGMENT_COUNT - 1].y);
      for (let i = rightFlank.length - 1; i >= 0; i--) {
        ctx.lineTo(rightFlank[i].x, rightFlank[i].y);
      }
      ctx.closePath();

      ctx.fillStyle = isDark ? 'rgba(204, 90, 54, 0.12)' : 'rgba(204, 90, 54, 0.09)';
      ctx.fill();

      // Body outline
      ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.45)' : 'rgba(204, 90, 54, 0.38)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Draw Snake Head & Glowing Cute Eyes
      const eyeOffset = 7;
      const eyeForward = 8;
      const eyeLeftX = headX + Math.cos(headAngle) * eyeForward + Math.cos(headAngle + Math.PI / 2) * eyeOffset;
      const eyeLeftY = headY + Math.sin(headAngle) * eyeForward + Math.sin(headAngle + Math.PI / 2) * eyeOffset;
      const eyeRightX = headX + Math.cos(headAngle) * eyeForward - Math.cos(headAngle + Math.PI / 2) * eyeOffset;
      const eyeRightY = headY + Math.sin(headAngle) * eyeForward - Math.sin(headAngle + Math.PI / 2) * eyeOffset;

      ctx.beginPath();
      ctx.arc(eyeLeftX, eyeLeftY, 3, 0, Math.PI * 2);
      ctx.arc(eyeRightX, eyeRightY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#CC5A36';
      ctx.fill();

      // Eye pupil glints
      ctx.beginPath();
      ctx.arc(eyeLeftX, eyeLeftY, 1.2, 0, Math.PI * 2);
      ctx.arc(eyeRightX, eyeRightY, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // 5. Draw Target Crosshair Cursor Lure
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
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
