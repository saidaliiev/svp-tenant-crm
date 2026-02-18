import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ArrowRight } from 'lucide-react';

export default function SecretFooter({ onReveal }) {
  const [pullProgress, setPullProgress] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const touchStartY = useRef(null);
  const THRESHOLD = 80;

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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
      className="mt-12 py-5 px-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 text-center mb-safe relative select-none"
    >
      <p className="text-gray-400 dark:text-gray-500">Custom CRM for Society St. Vincent de Paul, Carndonagh</p>

      {/* Desktop footer */}
      <div className="hidden md:block mt-1.5">
        <button
          onClick={onReveal}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="inline-flex items-center gap-1 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm px-1"
          aria-label="Click to view developer portfolio"
        >
          <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            Developed with ❤️ by
          </span>
          <span className="relative font-medium text-gray-600 dark:text-gray-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all underline underline-offset-2 decoration-gray-300 dark:decoration-gray-600 group-hover:decoration-purple-400">
            Iskan
            {isHovered && (
              <motion.span
                className="absolute -inset-1 rounded bg-blue-500/5"
                layoutId="glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </span>
          <motion.span
            animate={isHovered ? { x: [0, 4, 0] } : { x: 0 }}
            transition={isHovered ? { duration: 0.8, repeat: Infinity } : {}}
          >
            <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </motion.span>
        </button>
      </div>

      {/* Mobile footer */}
      <div className="md:hidden mt-1.5">
        <button
          onClick={onReveal}
          className="text-gray-500 dark:text-gray-400 focus:outline-none"
          aria-label="Tap to view developer portfolio"
        >
          Developed with ❤️ by <span className="underline underline-offset-2">Iskan</span>
        </button>
        
        {/* Swipe hint */}
        <motion.div
          className="mt-2.5 flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {isPulling ? (
            <>
              <div className="w-16 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  animate={{ width: `${pullProgress * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-gray-400 mt-1">
                {pullProgress >= 1 ? 'Release to reveal ✨' : 'Keep pulling...'}
              </span>
            </>
          ) : (
            <motion.div
              className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ChevronUp className="w-3 h-3" />
              </motion.span>
              <span>Swipe up to meet the developer</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </footer>
  );
}