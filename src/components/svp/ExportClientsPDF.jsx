import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ExportClientsPDF({ clients }) {
  const handleExportPDF = () => {
    if (!clients || clients.length === 0) {
      alert('No clients to export');
      return;
    }

    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
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
      const tableData = clients.map(client => {
        const balance = parseFloat(client.currentBalance) || 0;
        const credit = parseFloat(client.credit) || 0;
        const debt = balance > 0 ? balance : 0;
        
        return [
          client.id || '-',
          client.fullName || '-',
          client.address || '-',
          formatCurrency(balance),
          debt > 0 ? formatCurrency(debt) : '-',
          credit > 0 ? formatCurrency(credit) : '-',
          formatCurrency(client.monthlyRent),
          formatCurrency(client.weeklyTenantPayment),
          formatCurrency(client.weeklyRasAmount)
        ];
      });

      // Create table
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
        headStyles: {
          fillColor: lightGray,
          textColor: [60, 60, 60],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: { top: 4, right: 4, bottom: 4, left: 4 }
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: { top: 3.5, right: 4, bottom: 3.5, left: 4 },
          textColor: [60, 60, 60]
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 55 },
          3: { cellWidth: 22, halign: 'right' },
          4: { cellWidth: 20, halign: 'right' },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 23, halign: 'right' },
          7: { cellWidth: 23, halign: 'right' },
          8: { cellWidth: 23, halign: 'right' }
        },
        didParseCell: function(data) {
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
      doc.text('SVP Housing Support System', margin, pageHeight - 10);
      doc.text('Total Clients: ' + clients.length, pageWidth - margin, pageHeight - 10, { align: 'right' });

      // Save
      doc.save('SVP_Clients_' + new Date().toISOString().split('T')[0] + '.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
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
    <Button
      onClick={handleExportPDF}
      variant="outline"
      className="bg-white hover:bg-slate-50"
    >
      <FileDown className="w-4 h-4 mr-2" />
      Export to PDF
    </Button>
  );
}