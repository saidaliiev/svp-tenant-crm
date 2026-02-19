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
      transition: { duration: 0.5, ease: "easeInOut" }
    });
  }, [heartControls, arrowControls]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    heartControls.start({ scale: 1, rotate: 0, transition: { duration: 0.2 } });
    arrowControls.start({ x: 0, transition: { duration: 0.2 } });
  }, [heartControls, arrowControls]);

  // Desktop only — clean clickable line
  return (
    <footer className="hidden sm:block py-3 px-4 text-center">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center gap-1.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm px-1 text-xs"
        aria-label="Click to view developer portfolio"
      >
        <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
          Developed with
        </span>
        <motion.span
          animate={heartControls}
          className="inline-block leading-none text-red-500"
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <HeartSVG className="w-3.5 h-3.5" />
        </motion.span>
        <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
          by
        </span>
        <span className="relative font-medium text-gray-500 dark:text-gray-400 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all underline underline-offset-2 decoration-gray-300 dark:decoration-gray-600 group-hover:decoration-blue-400">
          Iskan
        </span>
        <motion.span animate={arrowControls}>
          <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-400 transition-colors" />
        </motion.span>
      </button>
    </footer>
  );
}