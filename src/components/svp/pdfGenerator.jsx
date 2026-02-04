import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateReceiptPDF(receiptData, settings) {
  const doc = new jsPDF('portrait');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  
  const primaryBlue = [0, 123, 255];
  const greenColor = [40, 167, 69];
  const redColor = [220, 53, 69];
  
  const receiptNum = 'RCP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  let yPos = margin;

  // Header Bar
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // White box for logo
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, 5, 35, 20, 'F');
  
  // Add SVP Logo
  const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/3aa602531_Logo-SVP-Vectorai-OFFICIAL.png';
  try {
    doc.addImage(logoUrl, 'PNG', margin + 2, 7, 30, 16);
  } catch (e) {
    console.log('Could not load logo');
  }
  
  // Organization Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.organizationName, pageWidth / 2 + 10, 18, { align: 'center' });
  
  // Receipt # and Date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${receiptNum}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`Date: ${formatDate(receiptData.createdDate)}`, pageWidth - margin, 20, { align: 'right' });
  
  yPos = 40;

  // Tenant Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`To: ${receiptData.clientName} (${receiptData.clientId})`, margin, yPos);
  doc.setFont('helvetica', 'normal');
  if (receiptData.clientAddress) {
    doc.text(receiptData.clientAddress, margin, yPos + 5);
    yPos += 5;
  }
  
  yPos += 8;

  // Period
  doc.text(`Period: ${formatDate(receiptData.startDate)} to ${formatDate(receiptData.endDate)}`, margin, yPos);
  
  yPos += 10;

  // Transactions Table
  const tableData = [];
  let runningBalance = parseFloat(receiptData.startingDebt) || 0;
  
  // Starting balance
  tableData.push([
    '-',
    'Previous Balance Carried Forward',
    '-',
    '-',
    formatCurrency(runningBalance)
  ]);
  
  receiptData.transactions.forEach(t => {
    const rentDue = parseFloat(t.rentDue) || 0;
    const tenantPayment = parseFloat(t.tenantPayment) || 0;
    
    // Add rent due
    runningBalance += rentDue;
    
    // Subtract tenant payment if paid
    if (t.tenantPaid) {
      runningBalance -= tenantPayment;
    }
    
    const tenantDesc = t.tenantPaid ? 'Tenant Payment' : 'Tenant Payment (NOT PAID)';
    tableData.push([
      formatDate(t.date),
      tenantDesc,
      formatCurrency(rentDue),
      t.tenantPaid ? formatCurrency(tenantPayment) : '-',
      formatCurrency(runningBalance)
    ]);
    
    // RAS row (information only - does NOT affect balance)
    const rasPayment = parseFloat(t.rasPayment) || 0;
    if (rasPayment > 0) {
      const rasDesc = t.rasReceived ? 'RAS Payment' : 'RAS Payment (NOT RECEIVED)';
      tableData.push([
        formatDate(t.date),
        rasDesc,
        '-',
        t.rasReceived ? formatCurrency(rasPayment) : '-',
        '-'
      ]);
    }
  });

  doc.autoTable({
    startY: yPos,
    head: [['Date', 'Description', 'Rent Due', 'Payment', 'Balance']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;

  // Financial Summary
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPos, pageWidth - (margin * 2), 35, 'F');
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Financial Summary', margin + 5, yPos);
  
  yPos += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const totalTenantPayments = Math.abs(receiptData.totalTenantPayments) || 0;
  
  doc.text(`Total Rent Due:`, margin + 5, yPos);
  doc.text(formatCurrency(receiptData.totalRentDue), margin + 80, yPos, { align: 'right' });
  
  doc.text(`Total Tenant Payments:`, margin + 5, yPos + 5);
  doc.text(formatCurrency(totalTenantPayments), margin + 80, yPos + 5, { align: 'right' });
  
  doc.text(`Previous Debt:`, margin + 5, yPos + 10);
  doc.text(formatCurrency(receiptData.startingDebt), margin + 80, yPos + 10, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`= Final Tenant Balance:`, margin + 5, yPos + 16);
  doc.text(formatCurrency(receiptData.finalBalance), margin + 80, yPos + 16, { align: 'right' });
  
  yPos += 22;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 123, 255);
  doc.setFontSize(7);
  doc.text(`(Note: Total RAS Received this period: ${formatCurrency(receiptData.totalRasReceived)} - Information Only)`, margin + 5, yPos);
  
  yPos += 10;

  // Final Balance Box
  const balanceBoxHeight = 20;
  const balanceColor = receiptData.finalBalance <= 0 ? greenColor : redColor;
  doc.setFillColor(...balanceColor);
  doc.rect(margin, yPos, pageWidth - (margin * 2), balanceBoxHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FINAL TENANT BALANCE', pageWidth / 2, yPos + 8, { align: 'center' });
  doc.setFontSize(16);
  doc.text(formatCurrency(receiptData.finalBalance), pageWidth / 2, yPos + 16, { align: 'center' });
  
  yPos += balanceBoxHeight + 8;

  // Notes
  if (receiptData.notes) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    
    const splitNotes = doc.splitTextToSize(receiptData.notes, pageWidth - (margin * 2));
    doc.text(splitNotes, margin, yPos + 4);
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  const footerText = settings.contactPhone 
    ? `${settings.systemName} | Generated ${formatDate(receiptData.createdDate)} | Contact: ${settings.contactPhone}`
    : `${settings.systemName} | Generated ${formatDate(receiptData.createdDate)}`;
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

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
  if (num < 0) {
    return '-€' + Math.abs(num).toFixed(2);
  }
  return '€' + num.toFixed(2);
}