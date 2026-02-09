import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer className="py-3 px-4 text-center text-xs text-gray-400 border-t border-gray-100">
        <p>Developed by Said Aliiev | Contact: <a href="mailto:saidaliiev@hotmail.com" className="hover:text-gray-600 transition-colors">saidaliiev@hotmail.com</a></p>
      </footer>
    </div>
  );
}