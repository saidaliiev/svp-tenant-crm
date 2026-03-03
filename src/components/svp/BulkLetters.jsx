import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { jsPDF } from 'jspdf';
import { Mail, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BulkLetters({ tenants, settings }) {
  const [minDebt, setMinDebt] = useState(100);

  const handleGenerate = () => {
    const debtors = tenants.filter(t => (t.currentBalance || 0) >= minDebt);
    if (debtors.length === 0) {
      alert("No tenants found with debt above the threshold.");
      return;
    }

    const doc = new jsPDF();
    const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/36ae01103_SVP-1200x675-Photoroom.png';
    const logoWidth = 70;
    const logoHeight = 23;

    debtors.forEach((tenant, index) => {
      if (index > 0) doc.addPage();
      
      doc.addImage(logoUrl, 'PNG', 20, 15, logoWidth, logoHeight);
      
      doc.setFontSize(12);
      doc.text(new Date().toLocaleDateString('en-IE'), 20, 55);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(tenant.fullName, 20, 70);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      if (tenant.address) {
        const addressLines = doc.splitTextToSize(tenant.address, 100);
        doc.text(addressLines, 20, 78);
      }
      
      doc.setFont("helvetica", "bold");
      doc.text("Re: Arrears Notification", 20, 110);
      
      doc.setFont("helvetica", "normal");
      const text = `Dear ${tenant.fullName},\n\nAccording to our records, your current rent arrears amount to €${(tenant.currentBalance || 0).toFixed(2)}.\n\nPlease contact us as soon as possible to arrange payment or discuss a repayment plan. It is important to address this to avoid further action.\n\nThank you,\n${settings?.organizationName || 'Society of Saint Vincent de Paul'}\nPhone: ${settings?.contactPhone || ''}`;
      
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 20, 130);
    });

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  const debtorsCount = tenants.filter(t => (t.currentBalance || 0) >= minDebt).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-orange-500" />
          Bulk Letters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-sm">
          <Label>Minimum Arrears Threshold (€)</Label>
          <Input 
            type="number" 
            value={minDebt} 
            onChange={(e) => setMinDebt(Number(e.target.value))} 
          />
          <p className="text-sm text-slate-500">
            Found {debtorsCount} tenant{debtorsCount !== 1 ? 's' : ''} above this threshold.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={debtorsCount === 0} className="bg-orange-600 hover:bg-orange-700">
          <Printer className="w-4 h-4 mr-2" />
          Generate Letters
        </Button>
      </CardContent>
    </Card>
  );
}