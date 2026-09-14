import React, { useEffect, useRef } from 'react';

interface HexCell {
  cx: number;
  cy: number;
  elevation: number;
  targetElevation: number;
}

interface HexShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  intensity: number;
}

export const HexGridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const HEX_RADIUS = 32;
    const HEX_WIDTH = Math.sqrt(3) * HEX_RADIUS;
    const HEX_HEIGHT = 2 * HEX_RADIUS;
    const VERT_SPACING = HEX_HEIGHT * 0.75;

    let hexes: HexCell[] = [];
    let shockwaves: HexShockwave[] = [];

    const initGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      hexes = [];

      const cols = Math.ceil(width / HEX_WIDTH) + 2;
      const rows = Math.ceil(height / VERT_SPACING) + 2;

      for (let r = 0; r < rows; r++) {
        const offset = (r % 2) * (HEX_WIDTH / 2);
        for (let c = 0; c < cols; c++) {
          const cx = c * HEX_WIDTH + offset;
          const cy = r * VERT_SPACING;
          hexes.push({
            cx,
            cy,
            elevation: 0,
            targetElevation: 0,
          });
        }
      }
    };

    initGrid();

    let mouse = { x: -1000, y: -1000, active: false };

    const handleResize = () => {
      initGrid();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = (e: MouseEvent) => {
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.7,
        intensity: 1.0,
      });
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);

    const drawHexagon = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const baseAlpha = isDark ? 0.08 : 0.06;

      // Update Shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 14;
        sw.intensity *= 0.965;
        if (sw.radius > sw.maxRadius || sw.intensity < 0.05) {
          shockwaves.splice(s, 1);
        }
      }

      // Update & Draw Hexagons
      const numHexes = hexes.length;
      for (let i = 0; i < numHexes; i++) {
        const hex = hexes[i];

        // Mouse proximity calculation
        let target = 0;
        if (mouse.active) {
          const dx = hex.cx - mouse.x;
          const dy = hex.cy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            target = Math.pow(1 - dist / 180, 2);
          }
        }

        // Shockwave impact
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const dx = hex.cx - sw.x;
          const dy = hex.cy - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const diff = Math.abs(dist - sw.radius);
          if (diff < 60) {
            const waveForce = Math.sin((diff / 60) * Math.PI) * sw.intensity;
            target = Math.max(target, waveForce);
          }
        }

        hex.targetElevation = target;
        hex.elevation += (hex.targetElevation - hex.elevation) * 0.12;

        const effectiveRadius = HEX_RADIUS - 2 + hex.elevation * 3;
        drawHexagon(hex.cx, hex.cy, effectiveRadius);

        let strokeAlpha = baseAlpha;
        if (hex.elevation > 0.02) {
          strokeAlpha = baseAlpha + hex.elevation * (isDark ? 0.5 : 0.4);
          ctx.lineWidth = 1 + hex.elevation * 1.5;
        } else {
          ctx.lineWidth = 1;
        }

        ctx.strokeStyle = `rgba(204, 90, 54, ${strokeAlpha})`;
        ctx.stroke();

        // If elevated, draw subtle center anchor dot/pip
        if (hex.elevation > 0.25) {
          ctx.fillStyle = `rgba(204, 90, 54, ${hex.elevation * 0.4})`;
          ctx.beginPath();
          ctx.arc(hex.cx, hex.cy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
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
