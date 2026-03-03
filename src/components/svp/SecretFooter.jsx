import React, { useState, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeartSVG = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export default function SecretFooter({ onReveal }) {
  const [isHovered, setIsHovered] = useState(false);
  const heartControls = useAnimationControls();
  const arrowControls = useAnimationControls();

  const handleClick = useCallback(() => {
    onReveal();
  }, [onReveal]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onReveal();
    }
  }, [onReveal]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    heartControls.start({
      scale: [1, 1.4, 1.1, 1.3, 1],
      rotate: [0, -10, 10, -5, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
    arrowControls.start({
      x: [0, 4, 0],
      transition: { duration: 0.6, ease: "easeInOut", repeat: Infinity }
    });
  }, [heartControls, arrowControls]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    heartControls.start({ scale: 1, rotate: 0, transition: { duration: 0.2 } });
    arrowControls.start({ x: 0, transition: { duration: 0.2 } });
  }, [heartControls, arrowControls]);

  // Desktop only — beautiful modern pill
  return (
    <footer className="hidden sm:flex justify-center py-6">
      <motion.button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative group flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 overflow-hidden"
        aria-label="Click to view developer portfolio"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 relative z-10 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-300">
          Developed with
        </span>
        
        <motion.span
          animate={heartControls}
          className="relative z-10 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]"
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <HeartSVG className="w-3.5 h-3.5" />
        </motion.span>
        
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 relative z-10 transition-colors group-hover:text-gray-700 dark:group-hover:text-gray-300">
          by
        </span>
        
        <span className="relative z-10 text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 group-hover:from-blue-500 group-hover:to-purple-500 transition-all">
          Iskan
        </span>
        
        <motion.div animate={arrowControls} className="relative z-10 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-full p-1 ml-1 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
          <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        </motion.div>
      </motion.button>
    </footer>
  );
}