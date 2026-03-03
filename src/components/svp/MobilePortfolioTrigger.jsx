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
    <div className="sm:hidden flex justify-center py-5 mb-4">
      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.96 }}
        className="relative group flex items-center gap-1.5 px-4 py-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)] text-xs transition-all overflow-hidden"
        aria-label="View developer portfolio"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-500/10 dark:to-purple-500/10" />
        <span className="text-gray-500 dark:text-gray-400 relative z-10 font-medium">Developed with</span>
        <motion.span animate={heartControls} className="inline-block text-red-500 relative z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">
          <HeartSVG className="w-3.5 h-3.5" />
        </motion.span>
        <span className="text-gray-500 dark:text-gray-400 relative z-10 font-medium">by</span>
        <div className="w-5 h-5 rounded-full border border-gray-200/60 dark:border-gray-700/60 relative z-10 overflow-hidden shrink-0">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/4eb575439_IMG_7239.jpeg"
            alt="Avatar"
            className="w-full h-full object-cover scale-[1.35]"
          />
        </div>
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 relative z-10">
          Iskan
        </span>
        <div className="relative z-10 flex items-center justify-center bg-gray-50/80 dark:bg-gray-700/80 rounded-full p-1 ml-0.5 group-active:bg-blue-100 transition-colors">
          <ArrowRight className="w-3 h-3 text-gray-400 group-active:text-blue-600" />
        </div>
      </motion.button>
    </div>
  );
}