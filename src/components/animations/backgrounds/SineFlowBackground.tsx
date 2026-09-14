import React, { useEffect, useRef } from 'react';

export const SineFlowBackground: React.FC = () => {
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
    let clickPulse = 0;

    const NUM_WAVES = 16;
    const STEP = 8; // Horizontal resolution

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
      clickPulse = 28;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      phase += 0.018;

      if (clickPulse > 0.1) {
        clickPulse *= 0.95;
      }

      const isDark = document.documentElement.classList.contains('dark');
      const centerY = height * 0.5;

      for (let i = 0; i < NUM_WAVES; i++) {
        const layerOffset = (i / NUM_WAVES) * Math.PI * 2;
        const waveSpeed = 0.002 + (i % 3) * 0.001;
        const baseAmplitude = 35 + (i % 5) * 12 + clickPulse;

        ctx.beginPath();

        for (let x = 0; x <= width; x += STEP) {
          // Compound harmonic frequency
          const k1 = 0.0035;
          const k2 = 0.007;
          let yOffset =
            Math.sin(x * k1 + phase + layerOffset) * baseAmplitude +
            Math.cos(x * k2 - phase * 0.8 + layerOffset) * (baseAmplitude * 0.45);

          // Cursor interactive envelope deformation
          if (mouse.active) {
            const distX = Math.abs(x - mouse.x);
            if (distX < 240) {
              const proximity = Math.pow(1 - distX / 240, 2);
              const distY = (centerY + yOffset) - mouse.y;
              yOffset -= (distY * proximity * 0.4);
            }
          }

          const currentY = centerY + yOffset + (i - NUM_WAVES / 2) * 18;

          if (x === 0) {
            ctx.moveTo(x, currentY);
          } else {
            ctx.lineTo(x, currentY);
          }
        }

        const alphaNorm = Math.sin((i / NUM_WAVES) * Math.PI);
        const alpha = (isDark ? 0.09 : 0.07) + alphaNorm * (isDark ? 0.28 : 0.22);

        ctx.strokeStyle = `rgba(204, 90, 54, ${alpha})`;
        ctx.lineWidth = 1.1 + (i % 2) * 0.4;
        ctx.stroke();
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
