import React, { useState, useEffect } from 'react';
import TutorialGuide from '@/components/svp/TutorialGuide';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {activeTab && <TutorialGuide activeTab={activeTab} />}
      <div className="flex-1 pb-safe">
        <div className="pb-20 sm:pb-0">
          {children}
        </div>
      </div>
      <footer className="mt-12 py-5 px-4 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 text-center mb-safe">
        Custom CRM for Society St. Vincent de Paul, Carndonagh
        <br />
        Developed with ❤️ by <a href="https://linktr.ee/saidaliiev" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 underline">Iskan</a>
      </footer>
    </div>);

}