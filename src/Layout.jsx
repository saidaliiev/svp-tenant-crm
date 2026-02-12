import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer style={{ marginTop: '50px', padding: '20px', fontSize: '0.8rem', color: '#666', borderTop: '1px solid #ddd' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            Custom CRM for Society St. Vincent de Paul, Carndonagh
            <br />
            Developed with ❤️ by Iskan (<a href="mailto:saidaliiev@hotmail.com" style={{ color: '#666', textDecoration: 'underline' }}>saidaliiev@hotmail.com</a>)
          </div>
          <a href="https://linktr.ee/saidaliiev" target="_blank" rel="noopener noreferrer" title="Linktree QR Code">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/20cf5b746_saidaliiev.png" 
              alt="Linktree QR Code" 
              style={{ width: '50px', height: '50px', border: '2px solid #666', borderRadius: '8px', cursor: 'pointer' }} 
            />
          </a>
        </div>
      </footer>
    </div>);

}