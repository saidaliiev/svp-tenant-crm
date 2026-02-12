import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ExportClientsPDF({ tenants = [], settings }) {
  const [showDialog, setShowDialog] = React.useState(false);
  const [orientation, setOrientation] = React.useState('landscape');

  const handleExportPDF = () => {
    if (!tenants || tenants.length === 0) {
      alert('No tenants to export');
      return;
    }
    setShowDialog(true);
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF(orientation, 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      const primaryBlue = [14, 86, 167];
      const lightGray = [240, 242, 245];
      
      let yPos = margin;

      // Add SVP Logo - aligned left with proper spacing
      const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/36ae01103_SVP-1200x675-Photoroom.png';
      try {
        doc.addImage(logoUrl, 'PNG', margin, yPos, 80, 27);
      } catch (e) {
        console.log('Could not load logo');
      }
      
      yPos += 38;
      
      // Title with spacing
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('TENANT LIST', margin, yPos);
      
      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      yPos += 14;
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      doc.text('Generated: ' + currentDate, pageWidth - margin, yPos, { align: 'right' });
      
      yPos += 6;

      // Prepare table data with debt column
      const tableData = tenants.map(tenant => {
        const balance = parseFloat(tenant.currentBalance) || 0;
        const credit = parseFloat(tenant.credit) || 0;
        const debt = balance > 0 ? balance : 0;
        
        return [
          tenant.displayId || tenant.id || '-',
          tenant.fullName || '-',
          tenant.address || '-',
          formatCurrency(balance),
          debt > 0 ? formatCurrency(debt) : '-',
          credit > 0 ? formatCurrency(credit) : '-',
          formatCurrency(tenant.monthlyRent),
          formatCurrency(tenant.weeklyTenantPayment),
          formatCurrency(tenant.weeklyRasAmount)
        ];
      });

      // Create table with dynamic column widths based on orientation
      const isLandscape = orientation === 'landscape';
      
      // Calculate centering for landscape
      const landscapeTableWidth = 256;
      const landscapeLeftMargin = (pageWidth - landscapeTableWidth) / 2;
      
      doc.autoTable({
        startY: yPos,
        head: [[
          'Client ID', 
          'Full Name', 
          'Address', 
          'Balance',
          'Debt',
          'Credit',
          'Weekly Rent',
          'Weekly Tenant',
          'Weekly RAS'
        ]],
        body: tableData,
        theme: 'plain',
        margin: isLandscape ? 
          { left: landscapeLeftMargin, right: landscapeLeftMargin } : 
          { left: margin, right: margin },
        tableWidth: 'auto',
        headStyles: {
          fillColor: lightGray,
          textColor: [60, 60, 60],
          fontSize: isLandscape ? 9 : 7,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: isLandscape ? 
            { top: 3, right: 2.5, bottom: 3, left: 2.5 } :
            { top: 2, right: 1.5, bottom: 2, left: 1.5 }
        },
        bodyStyles: {
          fontSize: isLandscape ? 8.5 : 6.5,
          cellPadding: isLandscape ? 
            { top: 2.5, right: 2.5, bottom: 2.5, left: 2.5 } :
            { top: 2, right: 1.5, bottom: 2, left: 1.5 },
          textColor: [60, 60, 60]
        },
        columnStyles: isLandscape ? {
          0: { cellWidth: 19 },
          1: { cellWidth: 42 },
          2: { cellWidth: 58 },
          3: { cellWidth: 23, halign: 'right' },
          4: { cellWidth: 21, halign: 'right' },
          5: { cellWidth: 21, halign: 'right' },
          6: { cellWidth: 24, halign: 'right' },
          7: { cellWidth: 24, halign: 'right' },
          8: { cellWidth: 24, halign: 'right' }
        } : {
          0: { cellWidth: 13 },
          1: { cellWidth: 25 },
          2: { cellWidth: 35 },
          3: { cellWidth: 16, halign: 'right' },
          4: { cellWidth: 14, halign: 'right' },
          5: { cellWidth: 14, halign: 'right' },
          6: { cellWidth: 17, halign: 'right' },
          7: { cellWidth: 17, halign: 'right' },
          8: { cellWidth: 18, halign: 'right' }
        },
        didParseCell: function(data) {
          // Right-align numeric column headers
          if (data.section === 'head' && data.column.index >= 3) {
            data.cell.styles.halign = 'right';
          }
          
          if (data.section === 'body') {
            // Balance column (index 3) - red if debt
            if (data.column.index === 3) {
              const value = parseFloat(data.cell.text[0].replace('€', '').replace(',', '').replace('-', ''));
              if (value > 0) {
                data.cell.styles.textColor = [220, 38, 38];
              }
            }
            // Debt column (index 4) - red
            if (data.column.index === 4 && data.cell.text[0] !== '-') {
              data.cell.styles.textColor = [220, 38, 38];
            }
            // Credit column (index 5) - green
            if (data.column.index === 5 && data.cell.text[0] !== '-') {
              data.cell.styles.textColor = [34, 139, 34];
            }
          }
        }
      });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const systemName = (settings && settings.systemName) || 'Society of Saint Vincent de Paul, Carndonagh';
      doc.text(systemName, margin, pageHeight - 10);
      doc.text('Total Tenants: ' + tenants.length, pageWidth - margin, pageHeight - 10, { align: 'right' });

      // Save
      doc.save('SVP_Clients_' + new Date().toISOString().split('T')[0] + '.pdf');
      setShowDialog(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
      setShowDialog(false);
    }
  };

  function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    if (num < 0) {
      return '-€' + Math.abs(num).toFixed(2);
    }
    return '€' + num.toFixed(2);
  }

  return (
    <>
      <Button
        onClick={handleExportPDF}
        variant="outline"
        className="bg-white hover:bg-slate-50"
      >
        <FileDown className="w-4 h-4 mr-2" />
        Export to PDF
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose PDF Orientation</AlertDialogTitle>
            <AlertDialogDescription>
              Select how you want the tenant list to be displayed:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <RadioGroup value={orientation} onValueChange={setOrientation} className="gap-4 py-4">
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-slate-50" onClick={() => setOrientation('landscape')}>
              <RadioGroupItem value="landscape" id="landscape" />
              <Label htmlFor="landscape" className="cursor-pointer flex-1">
                <div className="font-semibold">Landscape</div>
                <div className="text-sm text-slate-500">Horizontal layout - fits more columns</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-slate-50" onClick={() => setOrientation('portrait')}>
              <RadioGroupItem value="portrait" id="portrait" />
              <Label htmlFor="portrait" className="cursor-pointer flex-1">
                <div className="font-semibold">Portrait</div>
                <div className="text-sm text-slate-500">Vertical layout - standard format</div>
              </Label>
            </div>
          </RadioGroup>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={generatePDF}>
              Generate PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}