import React from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeartSVG = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export default function MobilePortfolioTrigger({ onReveal }) {
  const heartControls = useAnimationControls();

  const handleTap = () => {
    heartControls.start({
      scale: [1, 1.4, 1],
      transition: { duration: 0.3 }
    });
    setTimeout(() => onReveal(), 150);
  };

  return (
    <div className="sm:hidden flex justify-center py-4">
      <button
        onClick={handleTap}
        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-sm text-xs text-gray-500 dark:text-gray-400 active:scale-95 transition-all"
        aria-label="View developer portfolio"
      >
        <span>Developed with</span>
        <motion.span animate={heartControls} className="inline-block text-red-500">
          <HeartSVG className="w-3 h-3" />
        </motion.span>
        <span>by</span>
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          Iskan
        </span>
        <ArrowRight className="w-3 h-3 ml-0.5 text-gray-400" />
      </button>
    </div>
  );
}