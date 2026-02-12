import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
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
            Developed with ❤️ by Iskan
          </div>
          <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="link" 
                className="text-gray-600 hover:text-gray-800 text-xs underline"
                style={{ fontSize: '0.8rem', padding: 0 }}
              >
                Developer Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs p-8 flex flex-col items-center justify-center">
              <h2 className="text-lg font-semibold mb-4 text-center">Developer Profile</h2>
              <a href="https://linktr.ee/saidaliiev" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/f687d31df_saidaliiev1.png"
                  alt="Linktree QR Code"
                  style={{ width: '128px', height: '128px', border: '2px solid #666', borderRadius: '8px' }}
                />
              </a>
              <p className="mt-4 text-sm text-gray-500 text-center">Click the QR code to open Linktree</p>
            </DialogContent>
          </Dialog>
        </div>
      </footer>
    </div>);

}