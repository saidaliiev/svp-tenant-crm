import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ArrowRight } from 'lucide-react';

export default function SecretFooter({ onReveal }) {
  const [pullProgress, setPullProgress] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartY = useRef(null);
  const THRESHOLD = 80;

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.touches[0].clientY;
    if (deltaY > 0) {
      setPullProgress(Math.min(deltaY / THRESHOLD, 1));
    } else {
      setPullProgress(0);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullProgress >= 1) onReveal();
    setPullProgress(0);
    setIsPulling(false);
    touchStartY.current = null;
  }, [pullProgress, onReveal]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onReveal();
    }
  }, [onReveal]);

  return (
    <footer
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="mt-12 py-4 px-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 text-center mb-safe relative select-none"
    >
      {/* Mobile version */}
      <div className="md:hidden">
        <p className="text-gray-400 dark:text-gray-500 text-[11px]">Custom CRM for Society St. Vincent de Paul</p>
        
        {isPulling ? (
          <div className="mt-2 flex flex-col items-center">
            <div className="w-20 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                animate={{ width: `${pullProgress * 100}%` }}
              />
            </div>
            <span className="text-[9px] mt-1" style={{ color: pullProgress >= 1 ? '#00FF41' : '#9ca3af' }}>
              {pullProgress >= 1 ? 'Release to reveal ✨' : 'Keep pulling...'}
            </span>
          </div>
        ) : (
          <motion.div
            className="mt-2 flex items-center justify-center gap-1 text-[11px] text-gray-400 dark:text-gray-500"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span>☝️</span>
            <span>Swipe up to meet the developer</span>
            <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <ChevronUp className="w-3 h-3" />
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Desktop version */}
      <div className="hidden md:block">
        <p className="text-gray-400 dark:text-gray-500 text-[11px] mb-1">Custom CRM for Society St. Vincent de Paul, Carndonagh</p>
        <button
          onClick={onReveal}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="inline-flex items-center gap-1 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded-sm px-1"
          aria-label="Click to view developer portfolio"
        >
          <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            Developed with ❤️ by
          </span>
          <span className="relative font-medium text-gray-600 dark:text-gray-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-blue-500 transition-all underline underline-offset-2 decoration-gray-300 dark:decoration-gray-600 group-hover:decoration-green-400">
            Iskan
          </span>
          <motion.span
            animate={isHovered ? { x: [0, 4, 0] } : { x: 0 }}
            transition={isHovered ? { duration: 0.8, repeat: Infinity } : {}}
          >
            <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-green-400 transition-colors" />
          </motion.span>
        </button>
      </div>
    </footer>
  );
}