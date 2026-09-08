import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const SceneryLayer = ({ mouseX, mouseY, depth, colorClass, pathD, opacity, gradientId }: any) => {
  const x = useTransform(mouseX, [0, 1], [-depth, depth]);
  const y = useTransform(mouseY, [0, 1], [-depth * 0.3, depth * 0.3]);

  return (
    <motion.div
      style={{ x, y }}
      className={`absolute bottom-[-10%] left-[-5%] right-[-5%] w-[110%] h-[110%] origin-bottom pointer-events-none`}
    >
      <svg preserveAspectRatio="none" viewBox="0 0 1440 1000" className="w-full h-full absolute bottom-0">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={opacity} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={opacity * 1.5} />
          </linearGradient>
        </defs>
        <path d={pathD} className={`text-current ${colorClass}`} fill={`url(#${gradientId})`} />
      </svg>
    </motion.div>
  );
};

export default function BackgroundEffects() {
  const [isCapableDesktop, setIsCapableDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mouseX = useSpring(0.5, { stiffness: 40, damping: 25 });
  const mouseY = useSpring(0.5, { stiffness: 40, damping: 25 });

  useEffect(() => {
    setMounted(true);
    const checkDevice = () => {
      // Capable desktop: has mouse, fine pointer, wide screen, and allows motion.
      const capable = 
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        window.innerWidth > 768 &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      
      setIsCapableDesktop(capable);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth <= 768) return;
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const layers = [
    {
      id: "layer1",
      depth: 15,
      colorClass: "text-brand-accent-3",
      opacity: 0.2,
      pathD: "M0,1000 L0,300 C240,220 480,450 720,380 C960,310 1200,250 1440,300 L1440,1000 Z"
    },
    {
      id: "layer2",
      depth: 35,
      colorClass: "text-brand-primary",
      opacity: 0.15,
      pathD: "M0,1000 L0,450 C300,550 600,400 900,450 C1200,500 1350,400 1440,450 L1440,1000 Z"
    },
    {
      id: "layer3",
      depth: 65,
      colorClass: "text-brand-secondary",
      opacity: 0.25,
      pathD: "M0,1000 L0,600 C400,480 800,680 1100,600 C1300,540 1400,650 1440,600 L1440,1000 Z"
    },
    {
      id: "layer4",
      depth: 100,
      colorClass: "text-surface-panel dark:text-surface-tonal",
      opacity: 0.9,
      pathD: "M0,1000 L0,750 C350,850 700,700 1050,780 C1250,820 1350,720 1440,750 L1440,1000 Z"
    }
  ];

  const sunX = useTransform(mouseX, [0, 1], [-20, 20]);
  const sunY = useTransform(mouseY, [0, 1], [-10, 10]);

  // Avoid hydration mismatch by waiting for mount
  if (!mounted) return <div className="fixed inset-0 z-[-1] bg-surface-bg" />;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-surface-bg transition-colors duration-500">
      
      {/* Sun / Moon */}
      <motion.div 
        style={{ x: sunX, y: sunY }}
        className="absolute top-[10%] right-[20%] w-48 h-48 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-brand-accent-1/60 to-brand-primary/40 blur-3xl shadow-[0_0_120px_rgba(255,100,100,0.4)] mix-blend-screen"
      />
      
      <motion.div 
        style={{ x: sunX, y: sunY }}
        className="absolute top-[15%] right-[25%] w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/20 dark:bg-white/40 blur-md shadow-[0_0_40px_rgba(255,255,255,0.8)]"
      />

      {/* Parallax Mountain/Wave Layers */}
      {layers.map((layer) => (
        <SceneryLayer
          key={layer.id}
          gradientId={layer.id}
          depth={layer.depth}
          colorClass={layer.colorClass}
          opacity={layer.opacity}
          pathD={layer.pathD}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
      
      {/* Physical texture grain overlay */}
      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
    </div>
  );
}
