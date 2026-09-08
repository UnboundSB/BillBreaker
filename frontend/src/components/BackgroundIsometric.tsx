import { motion } from 'framer-motion';
import { Database, Shield, Handshake, Rocket } from 'lucide-react';

export default function BackgroundIsometric() {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-surface-bg transition-colors duration-500 flex items-center justify-center">
      {/* 
        The Isometric Board 
        rotateX(60deg) tilts it back
        rotateZ(-45deg) turns it into a diamond shape
      */}
      <div 
        className="relative w-[150vw] h-[150vw] sm:w-[150vw] sm:h-[150vw] md:w-[120vw] md:h-[120vw] transform-gpu pointer-events-none"
        style={{
          transform: 'perspective(1200px) rotateX(60deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Subtle Theme-Aware Grid (Optional, heavily muted so it's not restrictive) */}
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-10 transition-opacity duration-500"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-brand-primary) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-brand-primary) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />

        {/* 
          SVG Layer for Glowing Connecting Lines 
          Placed exactly on the board so it shares the isometric transform
        */}
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Theme-aware gradient for the lines */}
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-brand-accent-3)" />
              <stop offset="100%" stopColor="var(--color-brand-secondary)" />
            </linearGradient>
          </defs>

          {/* Example Manhattan routing line connecting Node 1 to Node 2 */}
          <motion.path
            d="M 30% 40% L 30% 60% L 50% 60%"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="4"
            filter="url(#glow)"
            className="opacity-70"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
          />

          {/* Line connecting Node 2 to Node 3 */}
          <motion.path
            d="M 50% 60% L 70% 60% L 70% 80%"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="4"
            filter="url(#glow)"
            className="opacity-70"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
          />
        </svg>

        {/* 
          Nodes (3D Blocks)
          Positioned using percentages to scale with the board
        */}
        
        {/* Node 1: Database */}
        <div className="absolute left-[30%] top-[40%] -translate-x-1/2 -translate-y-1/2">
          <IsometricNode icon={<Database size={32} />} delay={0} />
        </div>

        {/* Node 2: Shield */}
        <div className="absolute left-[50%] top-[60%] -translate-x-1/2 -translate-y-1/2">
          <IsometricNode icon={<Shield size={32} />} delay={0.2} />
        </div>

        {/* Node 3: Handshake */}
        <div className="absolute left-[70%] top-[80%] -translate-x-1/2 -translate-y-1/2">
          <IsometricNode icon={<Handshake size={32} />} delay={0.4} />
        </div>

        {/* Node 4: Rocket */}
        <div className="absolute left-[20%] top-[70%] -translate-x-1/2 -translate-y-1/2">
          <IsometricNode icon={<Rocket size={32} />} delay={0.6} />
        </div>

      </div>
    </div>
  );
}

function IsometricNode({ icon, delay }: { icon: React.ReactNode, delay: number }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [-10, 10, -10] }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay }}
      className="relative group"
    >
      {/* 
        The 3D Block 
        We use thick bottom/right borders to simulate isometric depth 
      */}
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-surface-panel border border-brand-primary/20 transition-colors duration-500 shadow-2xl flex items-center justify-center relative z-10 rounded-xl overflow-hidden"
           style={{
             boxShadow: '15px 15px 0px 0px rgba(0,0,0,0.2), inset 0px 0px 20px 0px rgba(var(--color-brand-primary-rgb), 0.1)',
           }}
      >
        {/* Icon container counter-rotated so it faces the camera flat */}
        <div 
          className="text-text-primary transition-colors duration-500 drop-shadow-[0_0_10px_rgba(var(--color-brand-primary-rgb),0.5)]"
          style={{
            transform: 'rotateZ(45deg) rotateX(-60deg) scale(1.5)',
          }}
        >
          {icon}
        </div>

        {/* Glowing base plate inside the block */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-accent-3 to-brand-primary opacity-50 blur-md" />
      </div>

      {/* Glow underneath the block on the floor */}
      <div className="absolute -inset-4 bg-brand-primary/30 blur-2xl rounded-full z-0 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.div>
  );
}
