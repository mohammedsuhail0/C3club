import React, { useEffect, useRef } from 'react';

interface CodeCell {
  x: number;
  y: number;
  originalText: string;
  currentText: string;
  glow: number;
  scrambleCooldown: number;
}

const TOKENS = [
  '0x3C5B', 'ISLEC', 'C3_IT', 'fn_ship', 'vibe', '0x8391', 'BATCH01', 'tensor',
  'kernel', 'async', 'git_push', 'deploy', 'neural', 'prompt', 'FOUNDER', '0xDEAD',
  'socket', 'lambda', 'stdout', 'b_tech', 'hyd_17', 'payload', 'react', 'binary'
];

const SCRAMBLE_CHARS = '0123456789ABCDEF!@#$%&*';

export const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let cells: CodeCell[] = [];

    const initMatrix = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cells = [];

      const CELL_W = 100;
      const CELL_H = 45;
      const cols = Math.ceil(width / CELL_W) + 1;
      const rows = Math.ceil(height / CELL_H) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tok = TOKENS[(r * cols + c) % TOKENS.length];
          cells.push({
            x: c * CELL_W + 15,
            y: r * CELL_H + 25,
            originalText: tok,
            currentText: tok,
            glow: 0,
            scrambleCooldown: 0,
          });
        }
      }
    };

    initMatrix();

    let mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseDown = () => {
      // Scramble all cells in a circular cascade
      cells.forEach((cell) => {
        const dist = Math.sqrt((cell.x - mouse.x) ** 2 + (cell.y - mouse.y) ** 2);
        if (dist < 450) {
          cell.glow = 1.0;
          cell.scrambleCooldown = 25;
        }
      });
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', initMatrix);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseleave', handleMouseLeave);

    const isDarkMode = () => document.documentElement.classList.contains('dark');

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkMode();
      const baseAlpha = dark ? 0.08 : 0.07;

      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const dist = Math.sqrt((cell.x - mouse.x) ** 2 + (cell.y - mouse.y) ** 2);
        const isNear = mouse.active && dist < 170;

        if (isNear) {
          const proximity = 1 - dist / 170;
          cell.glow = Math.max(cell.glow, proximity);

          // Scramble characters under magnetic lens
          if (Math.random() > 0.6) {
            let scrambled = '';
            for (let ch = 0; ch < cell.originalText.length; ch++) {
              scrambled += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
            cell.currentText = scrambled;
          }
        } else {
          cell.glow *= 0.93; // Smooth fade back
          if (cell.scrambleCooldown > 0) {
            cell.scrambleCooldown--;
          } else {
            cell.currentText = cell.originalText;
          }
        }

        if (cell.glow > 0.05) {
          ctx.fillStyle = `rgba(204, 90, 54, ${baseAlpha + cell.glow * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(204, 90, 54, ${baseAlpha})`;
        }

        ctx.fillText(cell.currentText, cell.x, cell.y);
      }

      // Magnetic Decryptor Reticle
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 55, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', initMatrix);
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
