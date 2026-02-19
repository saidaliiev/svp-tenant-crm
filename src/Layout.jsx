import React, { useState, useEffect, useCallback } from 'react';
import SecretFooter from '@/components/svp/SecretFooter';
import DevPortfolio from '@/components/svp/DevPortfolio';
import MobilePortfolioTrigger from '@/components/svp/MobilePortfolioTrigger';
import InteractiveTour from '@/components/svp/InteractiveTour';
import ClippyAgent from '@/components/svp/ClippyAgent';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

export default function Layout({ children, currentPageName }) {
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const location = useLocation();
  const controls = useAnimation();

  // Load user font size pref on mount
  useEffect(() => {
    const loadUserPrefs = async () => {
      try {
        const user = await base44.auth.me();
        const root = document.documentElement;
        root.classList.remove('dark');
        const fontSize = user.fontSize || 'medium';
        root.classList.remove('text-sm', 'text-base', 'text-lg');
        root.classList.add(fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base');
      } catch {}
    };
    loadUserPrefs();
  }, []);

  const handleReveal = useCallback(() => {
    if (showPortfolio) return;
    setShowPortfolio(true);
  }, [showPortfolio]);

  const handleClose = useCallback(() => {
    setShowPortfolio(false);
  }, []);

  const currentTab = new URLSearchParams(location.search).get('tab') || 'tenants';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Toaster position="bottom-center" />
      <div className="flex-1 pb-safe">
        <div className="pb-20 sm:pb-0">
          {children}
        </div>
      </div>

      {/* Help Button - Bottom Right */}
      {currentPageName !== 'Settings' && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end pointer-events-none">
          <AnimatePresence>
            {showClippy && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="mb-4 bg-[#ffffe1] text-black p-4 rounded-xl shadow-xl border border-gray-400 max-w-[250px] relative origin-bottom-right pointer-events-auto"
                style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif' }}
              >
                <div className="absolute -bottom-2 right-4 w-4 h-4 bg-[#ffffe1] border-b border-r border-gray-400 transform rotate-45"></div>
                <p className="text-sm font-medium leading-relaxed text-center">
                  Похоже, вы ищете гайд по настройкам?<br/><br/>
                  Здесь его нет! 📎<br/>
                  Попробуйте на других страницах.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            animate={controls}
            onClick={handleGuideClick}
            className={`pointer-events-auto w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
              showClippy ? 'bg-yellow-100 text-black border-2 border-yellow-400' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            aria-label="Start interactive tour"
            title="Help"
          >
            {showClippy ? <Paperclip className="w-6 h-6 animate-pulse" /> : <HelpCircle className="w-6 h-6" />}
          </motion.button>
        </div>
      )}

      <SecretFooter onReveal={handleReveal} />
      <MobilePortfolioTrigger onReveal={handleReveal} />
      <DevPortfolio isOpen={showPortfolio} onClose={handleClose} />
      <InteractiveTour 
        isOpen={showGuide} 
        onClose={() => setShowGuide(false)} 
        currentPage={currentPageName}
        currentTab={new URLSearchParams(location.search).get('tab') || 'tenants'}
        currentMode={new URLSearchParams(location.search).get('mode') || 'manual'}
      />
    </div>
  );
}