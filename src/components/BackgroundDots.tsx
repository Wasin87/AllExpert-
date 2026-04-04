import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function BackgroundDots() {
  const [dots, setDots] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const newDots = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10,
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="bg-dots">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="dot"
          initial={{ 
            left: `${dot.x}%`, 
            top: `${dot.y}%`, 
            opacity: 0.1 
          }}
          animate={{
            top: ['-10%', '110%'],
            left: [`${dot.x}%`, `${dot.x + (Math.random() * 10 - 5)}%`],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "linear",
            delay: -Math.random() * dot.duration
          }}
          style={{
            width: dot.size,
            height: dot.size,
          }}
        />
      ))}
    </div>
  );
}
