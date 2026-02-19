import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

/**
 * Mobile-only: sits below the bottom nav.
 * When user overscrolls down (pulls up past the end), 
 * a hidden "developer" section peeks out. Keep pulling → opens portfolio.
 */
export default function MobilePortfolioTrigger({ onReveal }) {
  const [pullProgress, setPullProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const touchStartY = useRef(null);
  const atBottom = useRef(false);
  const THRESHOLD = 100;

  const isAtBottom = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    return scrollTop + clientHeight >= scrollHeight - 5;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (isAtBottom()) {
      atBottom.current = true;
      touchStartY.current = e.touches[0].clientY;
    } else {
      atBottom.current = false;
      touchStartY.current = null;
    }
  }, [isAtBottom]);

  const handleTouchMove = useCallback((e) => {
    if (!atBottom.current || touchStartY.current === null) return;
    const deltaY = touchStartY.current - e.touches[0].clientY;
    if (deltaY > 0) {
      setPullProgress(Math.min(deltaY / THRESHOLD, 1));
    } else {
      setPullProgress(0);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullProgress >= 1) {
      setIsTriggered(true);
      setTimeout(() => {
        onReveal();
        setIsTriggered(false);
        setPullProgress(0);
      }, 200);
    } else {
      setPullProgress(0);
    }
    touchStartY.current = null;
    atBottom.current = false;
  }, [pullProgress, onReveal]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Only show on mobile
  return (
    <div className="sm:hidden">
      {/* Peek section that appears when overscrolling */}
      <AnimatePresence>
        {pullProgress > 0 && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[60] flex flex-col items-center justify-end pb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: 'none' }}
          >
            <motion.div 
              className="bg-gradient-to-t from-slate-900/95 to-slate-900/0 absolute inset-0"
              style={{ opacity: pullProgress * 0.6 }}
            />
            <div className="relative z-10 flex flex-col items-center gap-2 pb-2">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ChevronUp className="w-5 h-5 text-white/60" />
              </motion.div>
              <p className="text-white/70 text-xs font-medium">
                {pullProgress >= 1 ? '✨ Release to reveal' : 'Meet the developer'}
              </p>
              <p className="text-white/40 text-[10px]">
                Developed with ❤️ by Iskan
              </p>
              {/* Progress indicator */}
              <div className="w-16 h-0.5 rounded-full bg-white/10 overflow-hidden mt-1">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                  style={{ width: `${pullProgress * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}