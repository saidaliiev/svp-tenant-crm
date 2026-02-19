import React, { useState, useEffect, useCallback } from 'react';
import TutorialGuide from '@/components/svp/TutorialGuide';
import SecretFooter from '@/components/svp/SecretFooter';
import DevPortfolio from '@/components/svp/DevPortfolio';
import MobilePortfolioTrigger from '@/components/svp/MobilePortfolioTrigger';
import { base44 } from '@/api/base44Client';

function useActiveTab(pageName) {
  const [tab, setTab] = useState(() => {
    if (pageName === 'Home') {
      return new URLSearchParams(window.location.search).get('tab') || 'tenants';
    }
    return null;
  });

  useEffect(() => {
    if (pageName !== 'Home') { setTab(null); return; }
    const update = () => setTab(new URLSearchParams(window.location.search).get('tab') || 'tenants');
    update();
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function() { origPush.apply(this, arguments); update(); };
    history.replaceState = function() { origReplace.apply(this, arguments); update(); };
    window.addEventListener('popstate', update);
    return () => {
      history.pushState = origPush;
      history.replaceState = origReplace;
      window.removeEventListener('popstate', update);
    };
  }, [pageName]);

  return tab;
}

export default function Layout({ children, currentPageName }) {
  const activeTab = useActiveTab(currentPageName);
  const [showPortfolio, setShowPortfolio] = useState(false);

  // Load user appearance prefs on mount
  useEffect(() => {
    const loadUserPrefs = async () => {
      try {
        const user = await base44.auth.me();
        const root = document.documentElement;
        
        // Apply theme
        const theme = user.theme || 'system';
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }

        // Apply font size
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
      {activeTab && !showPortfolio && <TutorialGuide activeTab={activeTab} />}
      <div className="flex-1 pb-safe">
        <div className="pb-20 sm:pb-0">
          {children}
        </div>
      </div>
      <SecretFooter onReveal={handleReveal} />
      <MobilePortfolioTrigger onReveal={handleReveal} />
      <DevPortfolio isOpen={showPortfolio} onClose={handleClose} />
    </div>
  );
}