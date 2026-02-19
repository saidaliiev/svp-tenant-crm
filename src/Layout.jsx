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

      {/* Clippy Agent */}
      {currentPageName !== 'Settings' && (
        <ClippyAgent 
          currentPage={currentTab} 
          onStartGuide={() => setShowGuide(true)} 
        />
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