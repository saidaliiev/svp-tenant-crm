import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer style={{ marginTop: '50px', padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#666', borderTop: '1px solid #ddd' }}>
        Custom CRM for Society St. Vincent de Paul, Carndonagh
        <br />
        Developed with ❤️ by Iskan (<a href="mailto:saidaliiev@hotmail.com" style={{ color: '#666', textDecoration: 'underline' }}>saidaliiev@hotmail.com</a>)
      </footer>
    </div>);

}