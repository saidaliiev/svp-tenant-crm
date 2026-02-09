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
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      const primaryBlue = [14, 86, 167];
      const lightGray = [240, 242, 245];
      
      let yPos = margin;

      // Add SVP Logo
      const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/7a1906beb_SVP-1200x675-Photoroom.png';
      try {
        doc.addImage(logoUrl, 'PNG', margin, yPos, 60, 20);
      } catch (e) {
        console.log('Could not load logo');
      }
      
      yPos += 25;
      
      // Title
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CLIENT LIST', margin, yPos);
      
      yPos += 3;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      
      yPos += 10;
      
      // Date
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      doc.text('Generated: ' + currentDate, pageWidth - margin, yPos, { align: 'right' });
      
      yPos += 5;

      // Prepare table data
      const tableData = clients.map(client => [
        client.id || '-',
        client.fullName || '-',
        client.address || '-',
        formatCurrency(client.currentBalance),
        formatCurrency(client.credit),
        formatCurrency(client.monthlyRent),
        formatCurrency(client.weeklyTenantPayment),
        formatCurrency(client.weeklyRasAmount)
      ]);

      // Create table
      doc.autoTable({
        startY: yPos,
        head: [[
          'Client ID', 
          'Full Name', 
          'Address', 
          'Balance', 
          'Credit',
          'Monthly Rent',
          'Weekly Tenant',
          'Weekly RAS'
        ]],
        body: tableData,
        theme: 'plain',
        headStyles: {
          fillColor: lightGray,
          textColor: [60, 60, 60],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: { top: 3, right: 3, bottom: 3, left: 3 }
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
          textColor: [60, 60, 60]
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 45 },
          2: { cellWidth: 60 },
          3: { cellWidth: 22, halign: 'right' },
          4: { cellWidth: 22, halign: 'right' },
          5: { cellWidth: 25, halign: 'right' },
          6: { cellWidth: 25, halign: 'right' },
          7: { cellWidth: 25, halign: 'right' }
        },
        didParseCell: function(data) {
          if (data.column.index >= 3 && data.section === 'body') {
            const value = parseFloat(data.cell.text[0].replace('€', '').replace(',', ''));
            if (value < 0) {
              data.cell.styles.textColor = [220, 38, 38]; // red
            } else if (value > 0 && data.column.index === 3) {
              data.cell.styles.textColor = [220, 38, 38]; // red for positive balance (debt)
            }
          }
        }
      });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
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