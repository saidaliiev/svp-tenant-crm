import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function SecretFooter({ onReveal }) {
  const [pullProgress, setPullProgress] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(null);
  const footerRef = useRef(null);
  const THRESHOLD = 80;

  const checkAtBottom = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    return scrollHeight - scrollTop - clientHeight < 5;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (checkAtBottom()) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [checkAtBottom]);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.touches[0].clientY;
    if (deltaY > 0) {
      const progress = Math.min(deltaY / THRESHOLD, 1);
      setPullProgress(progress);
    } else {
      setPullProgress(0);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullProgress >= 1) {
      onReveal();
    }
    setPullProgress(0);
    setIsPulling(false);
    touchStartY.current = null;
  }, [pullProgress, onReveal]);

  return (
    <footer
      ref={footerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="mt-12 py-5 px-4 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 text-center mb-safe relative select-none"
    >
      <p>Custom CRM for Society St. Vincent de Paul, Carndonagh</p>
      <p className="mt-1">
        Developed with ❤️ by{' '}
        <button
          onClick={onReveal}
          className="text-gray-600 dark:text-gray-400 underline hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          Iskan
        </button>
      </p>

      {/* Pull indicator */}
      <motion.div
        className="mt-3 flex flex-col items-center overflow-hidden"
        animate={{ height: isPulling ? 'auto' : 0, opacity: isPulling ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ y: pullProgress > 0 ? [0, -3, 0] : 0 }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <ChevronDown
            className="w-4 h-4 rotate-180 transition-colors"
            style={{ color: pullProgress >= 1 ? '#8b5cf6' : '#9ca3af' }}
          />
        </motion.div>
        <div className="w-16 h-0.5 rounded-full bg-gray-200 dark:bg-gray-700 mt-1 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            animate={{ width: `${pullProgress * 100}%` }}
          />
        </div>
        <span className="text-[9px] text-gray-400 mt-1">
          {pullProgress >= 1 ? 'Release to reveal ✨' : 'Pull up to discover'}
        </span>
      </motion.div>
    </footer>
  );
}