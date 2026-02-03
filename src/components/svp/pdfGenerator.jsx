import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateReceiptPDF(receiptData, settings) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryBlue = [59, 130, 246];
  const darkBlue = [30, 64, 175];
  const green = [16, 185, 129];
  const red = [239, 68, 68];
  
  let yPos = 15;

  // Header Bar
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Organization Name (left)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.organizationName, 14, 15);
  
  // Receipt Title (center)
  doc.setFontSize(18);
  doc.text(settings.receiptTitle, pageWidth / 2, 15, { align: 'center' });
  
  // Receipt # and Date (right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${receiptData.id}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Date: ${formatDate(receiptData.createdDate)}`, pageWidth - 14, 20, { align: 'right' });
  
  yPos = 45;

  // Tenant Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`To: ${receiptData.clientName} (${receiptData.clientId})`, 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptData.clientAddress, 14, yPos + 6);
  
  yPos += 18;

  // Period
  doc.setFont('helvetica', 'bold');
  doc.text(`Period: ${formatDate(receiptData.startDate)} to ${formatDate(receiptData.endDate)}`, 14, yPos);
  
  yPos += 12;

  // Transactions Table
  const tableData = [];
  let runningBalance = receiptData.startingDebt;
  
  // Add starting balance row
  tableData.push([
    '-',
    'Previous Balance Carried Forward',
    '-',
    '-',
    '-',
    formatCurrency(runningBalance)
  ]);
  
  receiptData.transactions.forEach(t => {
    // Tenant payment row
    if (t.tenantPayment > 0) {
      if (t.tenantPaid) {
        runningBalance = runningBalance + t.rentDue - t.tenantPayment;
      } else {
        runningBalance = runningBalance + t.rentDue;
      }
      
      tableData.push([
        formatDate(t.date),
        'Tenant Payment',
        formatCurrency(t.rentDue),
        t.tenantPaid ? formatCurrency(t.tenantPayment) : '-',
        t.tenantPaid ? 'PAID' : 'NOT PAID',
        formatCurrency(runningBalance)
      ]);
    }
    
    // RAS row (separate, does not affect balance)
    if (t.rasPayment > 0) {
      tableData.push([
        formatDate(t.date),
        'Government RAS Support',
        '-',
        t.rasReceived ? formatCurrency(t.rasPayment) : '-',
        t.rasReceived ? 'RECEIVED' : 'NOT RECEIVED',
        '(Gov Support)'
      ]);
    }
  });

  doc.autoTable({
    startY: yPos,
    head: [['Date', 'Description', 'Rent Due', 'Payment', 'Status', 'Balance']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 28, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' }
    },
    didParseCell: function(data) {
      // Color status cells
      if (data.column.index === 4 && data.section === 'body') {
        if (data.cell.raw === 'NOT PAID' || data.cell.raw === 'NOT RECEIVED') {
          data.cell.styles.textColor = red;
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.raw === 'PAID' || data.cell.raw === 'RECEIVED') {
          data.cell.styles.textColor = green;
        }
      }
      // Style Gov Support text
      if (data.column.index === 5 && data.cell.raw === '(Gov Support)') {
        data.cell.styles.textColor = [100, 100, 100];
        data.cell.styles.fontStyle = 'italic';
        data.cell.styles.fontSize = 8;
      }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 10;

  // Summary Section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, yPos, pageWidth - 28, 50, 3, 3, 'F');
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkBlue);
  doc.text('Financial Summary', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Left column
  doc.text(`Total Rent Due:`, 20, yPos);
  doc.text(formatCurrency(receiptData.totalRentDue), 70, yPos, { align: 'right' });
  
  doc.text(`Total Tenant Payments:`, 20, yPos + 6);
  doc.text(`- ${formatCurrency(receiptData.totalTenantPayments)}`, 70, yPos + 6, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Net Tenant Obligation:`, 20, yPos + 14);
  doc.text(formatCurrency(receiptData.netTenantObligation), 70, yPos + 14, { align: 'right' });
  
  // Right column
  doc.setFont('helvetica', 'normal');
  doc.text(`Previous Debt:`, 110, yPos);
  doc.text(formatCurrency(receiptData.startingDebt), 170, yPos, { align: 'right' });
  
  doc.text(`+ Net Obligation:`, 110, yPos + 6);
  doc.text(formatCurrency(receiptData.netTenantObligation), 170, yPos + 6, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`= Final Balance:`, 110, yPos + 14);
  doc.text(formatCurrency(receiptData.finalBalance), 170, yPos + 14, { align: 'right' });
  
  // RAS info
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(59, 130, 246);
  doc.text(`Total RAS Received (information only): ${formatCurrency(receiptData.totalRasReceived)}`, 20, yPos + 26);
  
  yPos += 42;

  // Final Balance Box
  const balanceColor = receiptData.finalBalance <= 0 ? green : red;
  doc.setFillColor(...balanceColor);
  doc.roundedRect(14, yPos, pageWidth - 28, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FINAL TENANT BALANCE', pageWidth / 2, yPos + 10, { align: 'center' });
  doc.setFontSize(16);
  doc.text(formatCurrency(receiptData.finalBalance), pageWidth / 2, yPos + 20, { align: 'center' });
  
  yPos += 35;

  // Notes
  if (receiptData.notes) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Notes:', 14, yPos);
    
    const splitNotes = doc.splitTextToSize(receiptData.notes, pageWidth - 28);
    doc.text(splitNotes, 14, yPos + 5);
    yPos += 5 + (splitNotes.length * 4);
  }

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `This is an automatically generated receipt from ${settings.systemName}. Created ${formatDate(receiptData.createdDate)}. For assistance contact your local SVP office.`,
    pageWidth / 2, yPos, { align: 'center', maxWidth: pageWidth - 28 }
  );

  // Open print dialog
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(num);
}