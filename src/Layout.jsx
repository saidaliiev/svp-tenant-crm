import React, { useState, useEffect } from 'react';
import TutorialGuide from '@/components/svp/TutorialGuide';
import SecretFooter from '@/components/svp/SecretFooter';
import DevPortfolio from '@/components/svp/DevPortfolio';

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
    // Listen for pushState/replaceState and popstate
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {activeTab && <TutorialGuide activeTab={activeTab} />}
      <div className="flex-1 pb-safe">
        <div className="pb-20 sm:pb-0">
          {children}
        </div>
      </div>
      <SecretFooter onReveal={() => setShowPortfolio(true)} />
      <DevPortfolio isOpen={showPortfolio} onClose={() => setShowPortfolio(false)} />
    </div>
  );
}