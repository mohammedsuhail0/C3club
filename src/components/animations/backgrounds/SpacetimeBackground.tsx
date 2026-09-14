import React, { useEffect, useRef } from 'react';

interface GridNode {
  baseX: number;
  baseY: number;
}

export const SpacetimeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const SPACING = 48;
    let cols = Math.ceil(width / SPACING) + 2;
    let rows = Math.ceil(height / SPACING) + 2;
    let nodes: GridNode[][] = [];

    const initGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.ceil(width / SPACING) + 2;
      rows = Math.ceil(height / SPACING) + 2;
      nodes = [];

      for (let r = 0; r < rows; r++) {
        const rowNodes: GridNode[] = [];
        for (let c = 0; c < cols; c++) {
          rowNodes.push({
            baseX: (c - 1) * SPACING,
            baseY: (r - 1) * SPACING,
          });
        }
        nodes.push(rowNodes);
      }
    };

    initGrid();

    let mouse = { x: width * 0.5, y: height * 0.5, active: false };
    let massPulse = 0;

    const handleResize = () => {
      initGrid();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = () => {
      massPulse = 45;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      if (massPulse > 0.1) {
        massPulse *= 0.95;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const targetMassX = mouse.active ? mouse.x : width * 0.5;
      const targetMassY = mouse.active ? mouse.y : height * 0.5;
      const massRadius = 320 + massPulse * 3;

      // Helper to compute warped 2D position under Schwarzschild spacetime curvature
      const getWarped = (bx: number, by: number) => {
        const dx = bx - targetMassX;
        const dy = by - targetMassY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < massRadius && dist > 2) {
          // Curvature inward: delta ~ -M / (r + eps)
          const factor = Math.pow(1 - dist / massRadius, 2.2);
          const pull = factor * (65 + massPulse);
          const angle = Math.atan2(dy, dx);
          return {
            x: bx - Math.cos(angle) * pull,
            y: by - Math.sin(angle) * pull,
            depth: factor,
          };
        }
        return { x: bx, y: by, depth: 0 };
      };

      const lineAlpha = isDark ? 0.08 : 0.07;

      // 1. Draw Warped Horizontal Spacetime Geodesic Lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const node = nodes[r][c];
          const warped = getWarped(node.baseX, node.baseY);
          if (c === 0) ctx.moveTo(warped.x, warped.y);
          else ctx.lineTo(warped.x, warped.y);
        }
        ctx.strokeStyle = `rgba(204, 90, 54, ${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. Draw Warped Vertical Spacetime Geodesic Lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const node = nodes[r][c];
          const warped = getWarped(node.baseX, node.baseY);
          if (r === 0) ctx.moveTo(warped.x, warped.y);
          else ctx.lineTo(warped.x, warped.y);
        }
        ctx.strokeStyle = `rgba(204, 90, 54, ${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 3. Draw Concentric Gravitational Event Horizon & Photon Sphere Rings
      const photonRadii = [35, 75, 130, 210];
      photonRadii.forEach((pr, idx) => {
        const pulse = Math.sin(time * 2 + idx) * 3;
        ctx.beginPath();
        ctx.arc(targetMassX, targetMassY, pr + pulse + massPulse * 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204, 90, 54, ${0.35 / (idx + 1)})`;
        ctx.lineWidth = 1.2;
        if (idx % 2 === 1) ctx.setLineDash([4, 6]);
        else ctx.setLineDash([]);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 4. Central Gravitational Singularity Marker
      ctx.beginPath();
      ctx.arc(targetMassX, targetMassY, 6, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(204, 90, 54, 0.7)' : 'rgba(204, 90, 54, 0.6)';
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
