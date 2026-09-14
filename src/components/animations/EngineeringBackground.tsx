import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  intensity: number;
}

export const EngineeringBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [telemetry, setTelemetry] = useState({ x: 0, y: 0, isHovering: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Spacing between grid lines
    const SPACING = 56;
    let cols = Math.ceil(width / SPACING) + 2;
    let rows = Math.ceil(height / SPACING) + 2;

    // Grid points array
    let points: Point[] = [];

    const initGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.ceil(width / SPACING) + 2;
      rows = Math.ceil(height / SPACING) + 2;
      points = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const originX = (c - 1) * SPACING;
          const originY = (r - 1) * SPACING;
          points.push({
            x: originX,
            y: originY,
            originX,
            originY,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    initGrid();

    // Mouse & Physics state
    let mouse = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      active: false,
    };

    let shockwaves: Shockwave[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      mouse.vx = (x - mouse.prevX) * 0.4;
      mouse.vy = (y - mouse.prevY) * 0.4;
      mouse.prevX = mouse.x = x;
      mouse.prevY = mouse.y = y;
      mouse.active = true;

      setTelemetry({ x: Math.round(x), y: Math.round(y), isHovering: true });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        mouse.vx = (x - mouse.prevX) * 0.4;
        mouse.vy = (y - mouse.prevY) * 0.4;
        mouse.prevX = mouse.x = x;
        mouse.prevY = mouse.y = y;
        mouse.active = true;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Trigger interactive elastic shockwave pulse
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.75,
        speed: 18,
        intensity: 24,
      });
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
      setTelemetry((prev) => ({ ...prev, isHovering: false }));
    };

    window.addEventListener('resize', initGrid);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Physics constants
    const MOUSE_RADIUS = 180;
    const MOUSE_STRENGTH = 0.38;
    const SPRING_K = 0.045;
    const DAMPING = 0.88;

    // Detect dark mode from html class
    const isDarkMode = () => document.documentElement.classList.contains('dark');

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkMode();
      const baseLineAlpha = dark ? 0.09 : 0.08;
      const highlightAlpha = dark ? 0.45 : 0.38;

      // 1. Update Shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += sw.speed;
        sw.intensity *= 0.965; // Gradual decay
        if (sw.radius > sw.maxRadius || sw.intensity < 0.2) {
          shockwaves.splice(s, 1);
        }
      }

      // 2. Physics Simulation on Grid Points
      const numPoints = points.length;
      for (let i = 0; i < numPoints; i++) {
        const p = points[i];

        // Spring force returning point to its origin
        const dx = p.originX - p.x;
        const dy = p.originY - p.y;
        p.vx += dx * SPRING_K;
        p.vy += dy * SPRING_K;

        // Mouse displacement force (Elastic warp field)
        if (mouse.active) {
          const distX = p.x - mouse.x;
          const distY = p.y - mouse.y;
          const dist = Math.sqrt(distX * distX + distY * distY);

          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
            const angle = Math.atan2(distY, distX);

            // Push points away smoothly
            p.vx += Math.cos(angle) * force * 14;
            p.vy += Math.sin(angle) * force * 14;

            // Impart mouse velocity swirl
            p.vx += mouse.vx * force * 0.6;
            p.vy += mouse.vy * force * 0.6;
          }
        }

        // Shockwave ripple displacement
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const swDistX = p.x - sw.x;
          const swDistY = p.y - sw.y;
          const swDist = Math.sqrt(swDistX * swDistX + swDistY * swDistY);
          const delta = Math.abs(swDist - sw.radius);

          if (delta < 55) {
            const waveForce = Math.sin((delta / 55) * Math.PI) * sw.intensity;
            const angle = Math.atan2(swDistY, swDistX);
            p.vx += Math.cos(angle) * waveForce * 0.4;
            p.vy += Math.sin(angle) * waveForce * 0.4;
          }
        }

        // Apply velocity & damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Decay mouse velocity
      mouse.vx *= 0.8;
      mouse.vy *= 0.8;

      // 3. Draw Horizontal Elastic Grid Lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        const startIdx = r * cols;
        ctx.moveTo(points[startIdx].x, points[startIdx].y);

        for (let c = 1; c < cols; c++) {
          const p = points[r * cols + c];
          ctx.lineTo(p.x, p.y);
        }

        // Check if line passes near mouse to dynamically illuminate
        const midPoint = points[r * cols + Math.floor(cols / 2)];
        const distToMouseY = Math.abs(midPoint.y - mouse.y);
        const isNear = mouse.active && distToMouseY < 120;

        if (isNear) {
          const norm = 1 - distToMouseY / 120;
          ctx.strokeStyle = `rgba(204, 90, 54, ${baseLineAlpha + norm * highlightAlpha})`;
          ctx.lineWidth = 1 + norm * 0.8;
        } else {
          ctx.strokeStyle = `rgba(204, 90, 54, ${baseLineAlpha})`;
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      // 4. Draw Vertical Elastic Grid Lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(points[c].x, points[c].y);

        for (let r = 1; r < rows; r++) {
          const p = points[r * cols + c];
          ctx.lineTo(p.x, p.y);
        }

        const midPoint = points[Math.floor(rows / 2) * cols + c];
        const distToMouseX = Math.abs(midPoint.x - mouse.x);
        const isNear = mouse.active && distToMouseX < 120;

        if (isNear) {
          const norm = 1 - distToMouseX / 120;
          ctx.strokeStyle = `rgba(204, 90, 54, ${baseLineAlpha + norm * highlightAlpha})`;
          ctx.lineWidth = 1 + norm * 0.8;
        } else {
          ctx.strokeStyle = `rgba(204, 90, 54, ${baseLineAlpha})`;
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      // 5. Draw Precision Drafting Crosshairs (+) at Intersections
      // Draw crosshairs at every 2nd column/row to keep aesthetic ultra-clean
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          const p = points[r * cols + c];
          if (!p) continue;

          let crossSize = 3;
          let alpha = dark ? 0.22 : 0.18;

          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 220) {
              const proximity = 1 - dist / 220;
              crossSize = 3 + proximity * 5;
              alpha = dark ? 0.3 + proximity * 0.6 : 0.25 + proximity * 0.55;

              // Draw subtle connection filament toward cursor if very close
              if (dist < 110) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(204, 90, 54, ${proximity * 0.2})`;
                ctx.lineWidth = 0.75;
                ctx.stroke();
              }
            }
          }

          ctx.strokeStyle = `rgba(204, 90, 54, ${alpha})`;
          ctx.lineWidth = 1.2;

          ctx.beginPath();
          // Horizontal tick
          ctx.moveTo(p.x - crossSize, p.y);
          ctx.lineTo(p.x + crossSize, p.y);
          // Vertical tick
          ctx.moveTo(p.x, p.y - crossSize);
          ctx.lineTo(p.x, p.y + crossSize);
          ctx.stroke();
        }
      }

      // 6. Draw Interactive Cursor Focal Ring (Aura without particles)
      if (mouse.active) {
        const pulse = Math.sin(Date.now() * 0.003) * 3;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 45 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.22)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initGrid);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      {/* 1. Interactive 60fps Elastic Canvas Mesh (Zero Particles) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
      />

      {/* 2. Soft Ambient Vignette ensuring text contrast remains crystalline */}
      <div 
        className="absolute inset-0 bg-radial from-transparent via-transparent to-claude-bg/85 dark:to-claude-darkBg/85"
      />

      {/* 3. Real-Time Telemetry HUD Overlay (Top-Left) */}
      <div className="absolute top-8 left-8 hidden md:flex items-center gap-2.5 font-mono text-[10px] text-claude-terracotta/40 dark:text-claude-terracotta/50 tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#CC5A36] animate-pulse" />
        <span>C3 // DEPT_OF_IT // HYD_17.36°N</span>
        {telemetry.isHovering && (
          <span className="text-[9px] text-[#CC5A36] border border-[#CC5A36]/30 px-1.5 py-0.5 rounded bg-[#CC5A36]/5">
            X:{telemetry.x} Y:{telemetry.y}
          </span>
        )}
      </div>

      {/* 4. Top-Right Batch Designation */}
      <div className="absolute top-8 right-8 hidden md:block font-mono text-[10px] text-claude-terracotta/40 dark:text-claude-terracotta/50 tracking-wider">
        BATCH 01 // KINETIC_FIELD_ACTIVE
      </div>

      {/* 5. Bottom Interactive Prompt Hint (Discreet) */}
      <div className="absolute bottom-6 right-8 hidden sm:flex items-center gap-2 font-mono text-[9px] text-[#8C8275]/50 tracking-widest uppercase">
        <span>Click to trigger vector shockwave</span>
        <span className="text-[#CC5A36]">⚡</span>
      </div>
    </div>
  );
};
