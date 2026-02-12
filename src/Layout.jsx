import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer style={{ marginTop: '50px', padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#666', borderTop: '1px solid #ddd' }}>
        Developed with ❤️ by Iskan - Custom offline rent management system for Society of Saint Vincent de Paul • 2026
      </footer>
    </div>);

}