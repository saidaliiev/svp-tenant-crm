import React, { useState, useEffect, useCallback } from 'react';
import SecretFooter from '@/components/svp/SecretFooter';
import DevPortfolio from '@/components/svp/DevPortfolio';
import MobilePortfolioTrigger from '@/components/svp/MobilePortfolioTrigger';
import InteractiveTour from '@/components/svp/InteractiveTour';
import { base44 } from '@/api/base44Client';
import { HelpCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
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

  const handleGuideClick = () => {
    if (currentTab === 'settings') {
      controls.start({
        x: [0, -15, 15, -10, 10, -5, 5, 0],
        rotate: [0, -10, 10, -10, 10, -5, 5, 0],
        transition: { duration: 0.5 }
      });
      toast.custom((t) => (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <span className="text-2xl">😂</span>
          <div>
            <h4 className="font-bold text-sm">Seriously?</h4>
            <p className="text-xs text-slate-300 mt-0.5">Did you really think I wrote a guide for the Settings page? Just click the buttons!</p>
          </div>
        </div>
      ), { duration: 3000 });
    } else {
      setShowGuide(true);
    }
  };

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
        <button
          onClick={() => setShowGuide(true)}
          className="fixed bottom-6 right-6 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-30"
          aria-label="Start interactive tour"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
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