import React, { useEffect, useRef } from 'react';

// 3D Vector Point
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Edge {
  p1: number;
  p2: number;
}

export const Wireframe3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Generate vertices for an Icosahedron (20-sided regular polyhedron)
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const scale = Math.min(width, height) * 0.32;

    const baseVertices: Point3D[] = [
      { x: -1, y: phi, z: 0 },
      { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi },
      { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi },
      { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 },
      { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: 1 },
    ].map((v) => ({
      x: (v.x / Math.sqrt(1 + phi * phi)) * scale,
      y: (v.y / Math.sqrt(1 + phi * phi)) * scale,
      z: (v.z / Math.sqrt(1 + phi * phi)) * scale,
    }));

    // Edges connecting vertices of icosahedron
    const edges: Edge[] = [];
    const edgeLength = (scale * 2) / Math.sqrt(1 + phi * phi);
    const tolerance = edgeLength * 0.15;

    for (let i = 0; i < baseVertices.length; i++) {
      for (let j = i + 1; j < baseVertices.length; j++) {
        const dx = baseVertices[i].x - baseVertices[j].x;
        const dy = baseVertices[i].y - baseVertices[j].y;
        const dz = baseVertices[i].z - baseVertices[j].z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (Math.abs(d - edgeLength) < tolerance) {
          edges.push({ p1: i, p2: j });
        }
      }
    }

    // Secondary inner concentric wireframe cube
    const cubeScale = scale * 0.55;
    const cubeVertices: Point3D[] = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          cubeVertices.push({
            x: x * cubeScale * 0.577,
            y: y * cubeScale * 0.577,
            z: z * cubeScale * 0.577,
          });
        }
      }
    }

    const cubeEdges: Edge[] = [
      { p1: 0, p2: 1 }, { p1: 1, p2: 3 }, { p1: 3, p2: 2 }, { p1: 2, p2: 0 },
      { p1: 4, p2: 5 }, { p1: 5, p2: 7 }, { p1: 7, p2: 6 }, { p1: 6, p2: 4 },
      { p1: 0, p2: 4 }, { p1: 1, p2: 5 }, { p1: 2, p2: 6 }, { p1: 3, p2: 7 },
    ];

    let rotX = 0.2;
    let rotY = 0.4;
    let rotZ = 0;
    let targetRotSpeedX = 0.003;
    let targetRotSpeedY = 0.005;
    let rotSpeedX = targetRotSpeedX;
    let rotSpeedY = targetRotSpeedY;

    let mouse = { x: width / 2, y: height / 2, active: false };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      // Mouse deflection imparts 3D torque
      const normX = (e.clientX - width / 2) / (width / 2);
      const normY = (e.clientY - height / 2) / (height / 2);
      rotSpeedY = targetRotSpeedY + normX * 0.02;
      rotSpeedX = targetRotSpeedX + normY * 0.02;
    };

    const handleMouseDown = () => {
      // Impulse spin acceleration
      rotSpeedY += 0.06;
      rotSpeedX += 0.04;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    const project = (p: Point3D, cx: number, cy: number) => {
      // Perspective projection
      const cameraDistance = 900;
      const fov = 750;
      const z = p.z + cameraDistance;
      const factor = fov / z;
      return {
        x: cx + p.x * factor,
        y: cy + p.y * factor,
        depth: z,
      };
    };

    const rotatePoint = (p: Point3D, ax: number, ay: number, az: number): Point3D => {
      // Rotate around X
      let y1 = p.y * Math.cos(ax) - p.z * Math.sin(ax);
      let z1 = p.y * Math.sin(ax) + p.z * Math.cos(ax);
      let x1 = p.x;

      // Rotate around Y
      let x2 = x1 * Math.cos(ay) + z1 * Math.sin(ay);
      let z2 = -x1 * Math.sin(ay) + z1 * Math.cos(ay);
      let y2 = y1;

      // Rotate around Z
      let x3 = x2 * Math.cos(az) - y2 * Math.sin(az);
      let y3 = x2 * Math.sin(az) + y2 * Math.cos(az);
      let z3 = z2;

      return { x: x3, y: y3, z: z3 };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotX += rotSpeedX;
      rotY += rotSpeedY;
      rotZ += 0.001;

      // Smooth decay back to idle rotation speed
      rotSpeedX += (targetRotSpeedX - rotSpeedX) * 0.04;
      rotSpeedY += (targetRotSpeedY - rotSpeedY) * 0.04;

      const isDark = document.documentElement.classList.contains('dark');
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw Outer Icosahedron Wireframe
      const transformedOuter = baseVertices.map((v) => rotatePoint(v, rotX, rotY, rotZ));
      const projectedOuter = transformedOuter.map((v) => project(v, centerX, centerY));

      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const p1 = projectedOuter[edge.p1];
        const p2 = projectedOuter[edge.p2];

        // Depth-based alpha
        const avgDepth = (transformedOuter[edge.p1].z + transformedOuter[edge.p2].z) / 2;
        const depthAlpha = ((avgDepth + scale) / (scale * 2)) * 0.35 + 0.12;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(204, 90, 54, ${depthAlpha * (isDark ? 1 : 0.85)})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      // 2. Draw Inner Counter-Rotating Cube Wireframe
      const transformedInner = cubeVertices.map((v) => rotatePoint(v, -rotX * 1.5, -rotY * 1.5, rotZ));
      const projectedInner = transformedInner.map((v) => project(v, centerX, centerY));

      for (let i = 0; i < cubeEdges.length; i++) {
        const edge = cubeEdges[i];
        const p1 = projectedInner[edge.p1];
        const p2 = projectedInner[edge.p2];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = isDark ? 'rgba(204, 90, 54, 0.22)' : 'rgba(204, 90, 54, 0.18)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Draw Perspective Crosshair Latitude Rings around the 3D core
      const ringRadius = scale * 1.25;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, ringRadius, ringRadius * 0.35, rotY * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(204, 90, 54, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dynamic cursor connection line
      if (mouse.active) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = 'rgba(204, 90, 54, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 5]);
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
