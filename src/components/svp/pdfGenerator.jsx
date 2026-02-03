import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateReceiptPDF(receiptData, settings) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  // Colors
  const primaryBlue = [0, 123, 255]; // #007bff
  const greenColor = [40, 167, 69]; // #28a745
  const redColor = [220, 53, 69]; // #dc3545
  
  // Generate receipt number
  const receiptNum = 'RCP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  let yPos = margin;

  // Add SVP Logo
  const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/3aa602531_Logo-SVP-Vectorai-OFFICIAL.png';
  try {
    doc.addImage(logoUrl, 'PNG', margin, yPos, 35, 12);
  } catch (e) {
    console.log('Could not load logo');
  }
  yPos += 2;

  // Header Bar - full width blue bar
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Organization Name (centered)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.organizationName, pageWidth / 2, 15, { align: 'center' });
  
  // Receipt # and Date (right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${receiptNum}`, pageWidth - 20, 10, { align: 'right' });
  doc.text(`Date: ${formatDate(receiptData.createdDate)}`, pageWidth - 20, 18, { align: 'right' });
  
  yPos = 40;

  // Tenant Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`To: ${receiptData.clientName} (${receiptData.clientId})`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  if (receiptData.clientAddress) {
    doc.text(receiptData.clientAddress, margin, yPos + 6);
    yPos += 6;
  }
  
  yPos += 10;

  // Period
  doc.text(`Period: ${formatDate(receiptData.startDate)} to ${formatDate(receiptData.endDate)}`, margin, yPos);
  
  yPos += 10;

  // Transactions Table
  const tableData = [];
  let runningBalance = parseFloat(receiptData.startingDebt) || 0;
  
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
    const rentDue = parseFloat(t.rentDue) || 0;
    const tenantPayment = parseFloat(t.tenantPayment) || 0;
    const rasPayment = parseFloat(t.rasPayment) || 0;
    
    // Tenant payment row - add rent due, subtract payment if paid, subtract RAS if received
    if (t.tenantPaid) {
      runningBalance = runningBalance + rentDue - tenantPayment;
    } else {
      runningBalance = runningBalance + rentDue;
    }
    
    // Subtract RAS from running balance if received
    if (rasPayment > 0 && t.rasReceived) {
      runningBalance = runningBalance - rasPayment;
    }
    
    tableData.push([
      formatDate(t.date),
      'Tenant Payment',
      formatCurrency(rentDue),
      t.tenantPaid ? formatCurrency(tenantPayment) : '-',
      t.tenantPaid ? '' : 'NOT PAID',
      formatCurrency(runningBalance)
    ]);
    
    // RAS row (only if RAS amount > 0, does not affect balance)
    if (rasPayment > 0) {
      tableData.push([
        formatDate(t.date),
        'RAS Payment',
        '-',
        t.rasReceived ? formatCurrency(rasPayment) : '-',
        t.rasReceived ? '' : 'NOT RECEIVED',
        '€0.00'
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
      0: { cellWidth: 22 },
      1: { cellWidth: 35 },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 54, halign: 'right' }
    },
    didParseCell: function(data) {
      // Color status cells red for NOT PAID / NOT RECEIVED
      if (data.column.index === 4 && data.section === 'body') {
        if (data.cell.raw === 'NOT PAID' || data.cell.raw === 'NOT RECEIVED') {
          data.cell.styles.textColor = [255, 0, 0];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 10;

  // Financial Summary Section
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 45, 'F');
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Financial Summary', margin + 5, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const totalTenantPayments = Math.abs(receiptData.totalTenantPayments) || 0;
  
  // Left column
  doc.text(`Total Rent Due:`, margin + 5, yPos);
  doc.text(formatCurrency(receiptData.totalRentDue), margin + 60, yPos, { align: 'right' });
  
  doc.text(`Total Tenant Payments:`, margin + 5, yPos + 6);
  doc.text(formatCurrency(totalTenantPayments), margin + 60, yPos + 6, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Net Tenant Obligation:`, margin + 5, yPos + 14);
  doc.text(formatCurrency(receiptData.netTenantObligation), margin + 60, yPos + 14, { align: 'right' });
  
  // Right column
  const rightColX = pageWidth / 2 + 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Previous Debt:`, rightColX, yPos);
  doc.text(formatCurrency(receiptData.startingDebt), rightColX + 55, yPos, { align: 'right' });
  
  doc.text(`Net Obligation:`, rightColX, yPos + 6);
  doc.text(formatCurrency(receiptData.netTenantObligation), rightColX + 55, yPos + 6, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`= Final Tenant Balance:`, rightColX, yPos + 14);
  doc.text(formatCurrency(receiptData.finalBalance), rightColX + 55, yPos + 14, { align: 'right' });
  
  // RAS info
  yPos += 24;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 123, 255);
  doc.text(`Total RAS Received (information only): ${formatCurrency(receiptData.totalRasReceived)}`, margin + 5, yPos);
  
  yPos += 15;

  // Final Balance Box
  const balanceBoxHeight = 30;
  const balanceColor = receiptData.finalBalance <= 0 ? greenColor : redColor;
  doc.setFillColor(...balanceColor);
  doc.rect(margin, yPos, pageWidth - (margin * 2), balanceBoxHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FINAL TENANT BALANCE', pageWidth / 2, yPos + 12, { align: 'center' });
  doc.setFontSize(30);
  doc.text(formatCurrency(receiptData.finalBalance), pageWidth / 2, yPos + 26, { align: 'center' });
  
  yPos += balanceBoxHeight + 10;

  // Notes
  if (receiptData.notes) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    
    const splitNotes = doc.splitTextToSize(receiptData.notes, pageWidth - (margin * 2));
    doc.text(splitNotes, margin, yPos + 5);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `This is an automatically generated receipt from ${settings.systemName}. Created ${formatDate(receiptData.createdDate)}. For assistance contact your local SVP office.`,
    pageWidth / 2, pageHeight - 10, { align: 'center', maxWidth: pageWidth - (margin * 2) }
  );

  // Open print dialog
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '€' + num.toFixed(2);
}