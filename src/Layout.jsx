import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
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