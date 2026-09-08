import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, MotionValue, useMotionValue } from 'framer-motion';

interface SkeuomorphicShapeProps {
  x: number | string;
  y: MotionValue<string>;
  rot: MotionValue<number>;
  borderRadius: MotionValue<string>;
  baseColor: string;
  className: string;
  isDark: boolean;
}

// A solid shape with intense 3D skeuomorphic styling
const SolidShape = ({ y, rot, x, baseColor, className, borderRadius, isDark }: SkeuomorphicShapeProps) => {
  // Top-left highlight, bottom-right deep shadow
  const insets = isDark 
    ? `inset 8px 8px 15px rgba(255,255,255,0.15), inset -8px -8px 20px rgba(0,0,0,0.8)`
    : `inset 12px 12px 25px rgba(255,255,255,0.95), inset -12px -12px 25px rgba(0,0,0,0.15)`;
  
  const dropShadow = isDark
    ? `drop-shadow(20px 30px 25px rgba(0,0,0,0.7))`
    : `drop-shadow(20px 30px 25px rgba(0,0,0,0.25))`;

  return (
    <motion.div 
        style={{ x, y, filter: dropShadow, pointerEvents: 'none' }}
        className={`absolute ${className}`}
    >
      <motion.div
        style={{
          width: '100%', height: '100%',
          rotate: rot, 
          borderRadius, 
          boxShadow: insets,
          backgroundColor: baseColor,
          border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.5)'
        }}
      />
    </motion.div>
  );
};

// A hollow frame shape with acrylic/glass center and skeuomorphic bevels
const FrameShape = ({ y, rot, x, bw, baseColor, className, borderRadius, isDark }: SkeuomorphicShapeProps & { bw: number }) => {
  const insets = isDark 
    ? `inset 5px 5px 15px rgba(255,255,255,0.2), inset -5px -5px 15px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1)`
    : `inset 5px 5px 20px rgba(255,255,255,1), inset -5px -5px 15px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.8)`;
    
  const dropShadow = isDark
    ? `drop-shadow(20px 30px 25px rgba(0,0,0,0.7))`
    : `drop-shadow(20px 30px 25px rgba(0,0,0,0.25))`;

  return (
    <motion.div 
        style={{ x, y, filter: dropShadow, pointerEvents: 'none' }}
        className={`absolute ${className}`}
    >
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        style={{
          border: `${bw}px solid ${baseColor}`,
          rotate: rot,
          borderRadius,
          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: insets
        }}
      >
         <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

interface BackgroundElementsProps {
  stageIndex: number;
}

export const BackgroundElements: React.FC<BackgroundElementsProps> = ({ stageIndex }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark') || document.body.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Use a motion value that tracks the incoming prop, then spring it
  const progressValue = useMotionValue(stageIndex);
  useEffect(() => {
    progressValue.set(stageIndex);
  }, [stageIndex, progressValue]);

  // Low damping and mass for an elegant, physical drift feeling
  const smoothProgress = useSpring(progressValue, { damping: 30, stiffness: 50, mass: 1.2 });

  const primaryColor = isDark ? '#4c1d95' : '#a78bfa'; // Violet
  const secondaryColor = isDark ? '#db2777' : '#f472b6'; // Pink
  const tertiaryColor = isDark ? '#059669' : '#34d399'; // Emerald

  // --- Map progress (0 to 4) to Y offsets, rotations, and border-radius (Shapeshifting) ---

  // Item 1: Starts visible at Upload (0). Morphs from Circle to Square. Drifts upwards.
  const y1 = useTransform(smoothProgress, [0, 4], ['-10vh', '-150vh']);
  const rot1 = useTransform(smoothProgress, [0, 4], [0, 90]);
  const br1 = useTransform(smoothProgress, [0, 1, 2, 3, 4], ['50%', '30%', '0%', '20%', '50%']);

  // Item 2: Starts slightly lower, morphs from Square to Circle.
  const y2 = useTransform(smoothProgress, [0, 4], ['10vh', '-120vh']);
  const rot2 = useTransform(smoothProgress, [0, 4], [45, 180]);
  const br2 = useTransform(smoothProgress, [0, 1, 2, 3, 4], ['15%', '50%', '30%', '0%', '15%']);

  // Item 3: A Frame. Drifts fast. Triangle to Circle.
  const y3 = useTransform(smoothProgress, [0, 4], ['50vh', '-200vh']);
  const rot3 = useTransform(smoothProgress, [0, 4], [0, -180]);
  const br3 = useTransform(smoothProgress, [0, 2, 4], ['0%', '50%', '0%']); 
  // Custom triangle shape by rotating a square
  
  // Item 4: Starts off-screen bottom, enters at Stage 1, exits Stage 4.
  const y4 = useTransform(smoothProgress, [0, 4], ['100vh', '-80vh']);
  const rot4 = useTransform(smoothProgress, [0, 4], [-45, 90]);
  const br4 = useTransform(smoothProgress, [0, 4], ['50%', '0%']);

  // Item 5: Starts off-screen bottom, enters at Stage 2. Frame shape.
  const y5 = useTransform(smoothProgress, [0, 4], ['120vh', '-30vh']);
  const rot5 = useTransform(smoothProgress, [0, 4], [30, 210]);
  const br5 = useTransform(smoothProgress, [0, 4], ['0%', '50%']);

  // Item 6: Starts way off-screen bottom, enters at Stage 3. Very fast.
  const y6 = useTransform(smoothProgress, [0, 4], ['180vh', '10vh']);
  const rot6 = useTransform(smoothProgress, [0, 4], [-20, -100]);
  const br6 = useTransform(smoothProgress, [0, 4], ['50%', '20%']);

  // Item 7: Enters right at Stage 4 (Results).
  const y7 = useTransform(smoothProgress, [0, 4], ['200vh', '30vh']);
  const rot7 = useTransform(smoothProgress, [0, 4], [0, 45]);
  const br7 = useTransform(smoothProgress, [0, 4], ['0%', '50%']);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none transition-colors duration-500">
      
      {/* 1. Deep Primary Morphing Shape */}
      <SolidShape 
        y={y1} rot={rot1} x="-10vw" isDark={isDark}
        borderRadius={br1} baseColor={primaryColor} 
        className="top-0 left-0 w-80 h-80 sm:w-96 sm:h-96 opacity-80" 
      />

      {/* 2. Secondary Pink Shape */}
      <SolidShape 
        y={y2} rot={rot2} x="10vw" isDark={isDark}
        borderRadius={br2} baseColor={secondaryColor} 
        className="top-1/4 right-0 w-64 h-64 sm:w-80 sm:h-80 opacity-70" 
      />

      {/* 3. Emerald Frame (Hollow) */}
      <FrameShape 
        y={y3} rot={rot3} x="-5vw" isDark={isDark}
        bw={24} baseColor={tertiaryColor} borderRadius={br3}
        className="top-1/2 left-[15%] w-56 h-56 sm:w-72 sm:h-72 opacity-90" 
      />

      {/* 4. Primary Circle (Enters stage 1) */}
      <SolidShape 
        y={y4} rot={rot4} x="20vw" isDark={isDark}
        borderRadius={br4} baseColor={primaryColor} 
        className="bottom-0 right-[25%] w-48 h-48 sm:w-64 sm:h-64 opacity-85" 
      />

      {/* 5. Pink Frame (Enters stage 2) */}
      <FrameShape 
        y={y5} rot={rot5} x="-15vw" isDark={isDark}
        bw={16} baseColor={secondaryColor} borderRadius={br5}
        className="bottom-0 left-[20%] w-40 h-40 sm:w-56 sm:h-56 opacity-95" 
      />

      {/* 6. Emerald Triangle/Square (Enters stage 3) */}
      <SolidShape 
        y={y6} rot={rot6} x="5vw" isDark={isDark}
        borderRadius={br6} baseColor={tertiaryColor} 
        className="-bottom-[20%] right-[10%] w-60 h-60 sm:w-72 sm:h-72 opacity-80" 
      />

      {/* 7. Primary Frame (Enters stage 4) */}
      <FrameShape 
        y={y7} rot={rot7} x="-5vw" isDark={isDark}
        bw={32} baseColor={primaryColor} borderRadius={br7}
        className="-bottom-[30%] left-[40%] w-64 h-64 sm:w-80 sm:h-80 opacity-80" 
      />

    </div>
  );
};
