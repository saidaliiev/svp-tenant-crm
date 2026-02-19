import React, { useState, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

export default function SecretFooter({ onReveal }) {
  const [isHovered, setIsHovered] = useState(false);
  const heartControls = useAnimationControls();

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
      scale: [1, 1.4, 1],
      rotate: [0, -10, 10, -5, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
  }, [heartControls]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    heartControls.start({ scale: 1, rotate: 0, transition: { duration: 0.2 } });
  }, [heartControls]);

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
          className="inline-block text-sm leading-none"
          style={{ originX: 0.5, originY: 0.5 }}
        >
          ❤️
        </motion.span>
        <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
          by
        </span>
        <span className="relative font-medium text-gray-500 dark:text-gray-400 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all underline underline-offset-2 decoration-gray-300 dark:decoration-gray-600 group-hover:decoration-blue-400">
          Iskan
        </span>
      </button>
    </footer>
  );
}