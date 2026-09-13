import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CursorGlow: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const mouseX = useSpring(-500, springConfig);
  const mouseY = useSpring(-500, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, visible]);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        x: mouseX,
        y: mouseY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      className="pointer-events-none fixed top-0 left-0 w-[550px] h-[550px] rounded-full bg-gradient-to-r from-claude-terracotta/8 via-amber-500/5 to-rose-500/0 blur-[130px] -z-10 transition-opacity duration-500"
    />
  );
};
