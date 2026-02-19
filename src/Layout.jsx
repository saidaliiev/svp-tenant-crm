import React, { useState, useEffect, useCallback } from 'react';
import TutorialGuide from '@/components/svp/TutorialGuide';
import SecretFooter from '@/components/svp/SecretFooter';
import DevPortfolio from '@/components/svp/DevPortfolio';
import MobilePortfolioTrigger from '@/components/svp/MobilePortfolioTrigger';

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