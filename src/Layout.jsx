import React, { useState, useEffect, useCallback } from 'react';
import SecretFooter from '@/components/svp/SecretFooter';
import DevPortfolio from '@/components/svp/DevPortfolio';
import MobilePortfolioTrigger from '@/components/svp/MobilePortfolioTrigger';
import GuideDrawer from '@/components/svp/GuideDrawer';
import { base44 } from '@/api/base44Client';
import { HelpCircle } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

      <div className="flex-1 pb-safe">
        <div className="pb-20 sm:pb-0">
          {children}
        </div>
      </div>

      {/* Help Button - Bottom Right */}
      <button
        onClick={() => setShowGuide(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-30"
        aria-label="Open user guide"
        title="Help"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      <SecretFooter onReveal={handleReveal} />
      <MobilePortfolioTrigger onReveal={handleReveal} />
      <DevPortfolio isOpen={showPortfolio} onClose={handleClose} />
      <GuideDrawer isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}