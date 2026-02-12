import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer style={{ marginTop: '50px', padding: '20px', fontSize: '0.8rem', color: '#666', borderTop: '1px solid #ddd', textAlign: 'center' }}>
        Custom CRM for Society St. Vincent de Paul, Carndonagh
        <br />
        Developed with ❤️ by <a href="https://linktr.ee/saidaliiev" target="_blank" rel="noopener noreferrer" style={{ color: '#666', textDecoration: 'underline' }}>Iskan</a>
      </footer>
    </div>);

}