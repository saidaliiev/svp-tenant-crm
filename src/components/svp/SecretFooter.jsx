import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function SecretFooter({ onReveal }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onReveal();
  }, [onReveal]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onReveal();
    }
  }, [onReveal]);

  // Desktop only — clean clickable line
  return (
    <footer className="hidden sm:block py-3 px-4 text-center">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="inline-flex items-center gap-1 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm px-1 text-xs"
        aria-label="Click to view developer portfolio"
      >
        <span className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
          Developed with ❤️ by
        </span>
        <span className="relative font-medium text-gray-500 dark:text-gray-400 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all underline underline-offset-2 decoration-gray-300 dark:decoration-gray-600 group-hover:decoration-blue-400">
          Iskan
        </span>
        <motion.span
          animate={isHovered ? { x: [0, -4, 0] } : { x: 0 }}
          transition={isHovered ? { duration: 0.8, repeat: Infinity } : {}}
        >
          <ArrowLeft className="w-3 h-3 text-gray-400 group-hover:text-blue-400 transition-colors" />
        </motion.span>
      </button>
    </footer>
  );
}