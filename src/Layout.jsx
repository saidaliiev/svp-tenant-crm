import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer className="py-3 px-4 text-center text-xs text-gray-400 border-t border-gray-100">
        <p className="">Developed by Iskan | Contact: saidaliiev@hotmail.com</p>
      </footer>
    </div>);

}