import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateReceiptPDF(receiptData, settings) {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  
  // Colors - matching the professional design
  const darkNavy = [17, 24, 39]; // #111827 - dark navy header
  const accentBlue = [59, 130, 246]; // #3B82F6 - bright blue for logo bg
  const textGray = [75, 85, 99]; // #4B5563
  const lightGray = [156, 163, 175]; // #9CA3AF
  const borderGray = [229, 231, 235]; // #E5E7EB
  const greenColor = [34, 197, 94]; // #22C55E
  const redColor = [239, 68, 68]; // #EF4444
  
  // Generate receipt number
  const receiptNum = 'SVP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const statementNum = receiptData.statementNumber || Math.floor(Math.random() * 1000);
  
  let yPos = 0;

  // ==================== HEADER ====================
  // Dark navy header bar
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 32, 'F');
  
  // Blue square for logo
  doc.setFillColor(...accentBlue);
  doc.rect(margin, 6, 20, 20, 'F');
  
  // SVP text in blue box
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SVP', margin + 10, 18, { align: 'center' });
  
  // Organization name
  doc.setFontSize(16);
  doc.text(settings.organizationName || 'SOCIETY OF SAINT VINCENT DE PAUL', margin + 30, 18);
  
  yPos = 45;

  // ==================== TITLE ====================
  doc.setTextColor(...darkNavy);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RENT RECEIPT STATEMENT', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // ==================== INFO SECTION ====================
  // Horizontal line
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 8;
  
  // Left side - Tenant info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  
  doc.text(receiptData.clientName || 'Tenant Name', margin, yPos);
  if (receiptData.clientId) {
    doc.text(`ID: ${receiptData.clientId}`, margin, yPos + 5);
  }
  if (receiptData.clientAddress) {
    const addressLines = doc.splitTextToSize(receiptData.clientAddress, 80);
    doc.text(addressLines, margin, yPos + 10);
  }
  
  // Right side - Receipt details
  const rightCol = pageWidth - margin - 60;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...lightGray);
  
  doc.text('Receipt No:', rightCol, yPos);
  doc.text('Date:', rightCol, yPos + 5);
  doc.text('Reference:', rightCol, yPos + 10);
  doc.text('Statement Number:', rightCol, yPos + 15);
  
  doc.setTextColor(...textGray);
  doc.text(receiptNum, rightCol + 45, yPos);
  doc.text(formatDate(receiptData.createdDate), rightCol + 45, yPos + 5);
  doc.text(receiptData.clientId || '-', rightCol + 45, yPos + 10);
  doc.text(String(statementNum), rightCol + 45, yPos + 15);
  
  yPos += 30;
  
  // Horizontal line
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 10;

  // ==================== STATEMENT INFO ====================
  doc.setTextColor(...darkNavy);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rent Statement to ${formatDate(receiptData.endDate)}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${formatDate(receiptData.startDate)} to ${formatDate(receiptData.endDate)}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 12;

  // ==================== OPENING BALANCE ====================
  // Section header with circle number
  const drawSectionHeader = (num, title, startY) => {
    doc.setFillColor(...accentBlue);
    doc.circle(margin + 4, startY - 1, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(String(num), margin + 4, startY, { align: 'center' });
    
    doc.setTextColor(...darkNavy);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 12, startY);
    
    return startY + 6;
  };
  
  // Opening Balance section
  yPos = drawSectionHeader(1, 'Opening Balance', yPos);
  
  // Table for opening balance
  doc.autoTable({
    startY: yPos,
    head: [['Date', 'Description', 'Rent Due', 'Payment', 'Balance']],
    body: [['-', 'Previous Balance Carried Forward', '-', '-', formatCurrency(receiptData.startingDebt)]],
    theme: 'plain',
    headStyles: {
      fillColor: [249, 250, 251],
      textColor: textGray,
      fontSize: 9,
      fontStyle: 'normal',
      cellPadding: 3
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textGray,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 90 },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
    },
    tableLineColor: borderGray,
    tableLineWidth: 0.1
  });
  
  yPos = doc.lastAutoTable.finalY + 8;

  // ==================== INCOME (Rent Due) ====================
  yPos = drawSectionHeader(2, 'Income (Rent Due)', yPos);
  
  let runningBalance = parseFloat(receiptData.startingDebt) || 0;
  const incomeData = [];
  let totalRentDue = 0;
  
  receiptData.transactions.forEach(t => {
    const rentDue = parseFloat(t.rentDue) || 0;
    totalRentDue += rentDue;
    runningBalance += rentDue;
    
    incomeData.push([
      formatDate(t.date),
      `Rent from ${formatDate(receiptData.startDate)} to ${formatDate(t.date)}`,
      formatCurrency(rentDue),
      '-',
      formatCurrency(runningBalance)
    ]);
  });
  
  // Add subtotal row
  incomeData.push([
    '', '', 'Subtotal', formatCurrency(totalRentDue), formatCurrency(runningBalance)
  ]);
  
  doc.autoTable({
    startY: yPos,
    body: incomeData,
    theme: 'plain',
    bodyStyles: {
      fontSize: 9,
      textColor: textGray,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 90 },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      // Style subtotal row
      if (data.row.index === incomeData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;

  // ==================== TENANT PAYMENTS ====================
  yPos = drawSectionHeader(3, 'Tenant Payments', yPos);
  
  const paymentsData = [];
  let totalTenantPayments = 0;
  
  receiptData.transactions.forEach(t => {
    const tenantPayment = parseFloat(t.tenantPayment) || 0;
    if (t.tenantPaid && tenantPayment > 0) {
      totalTenantPayments += tenantPayment;
      runningBalance -= tenantPayment;
      
      paymentsData.push([
        formatDate(t.date),
        'Tenant Payment',
        '-',
        formatCurrency(tenantPayment),
        formatCurrency(runningBalance)
      ]);
    }
  });
  
  if (paymentsData.length === 0) {
    paymentsData.push(['-', 'No tenant payments this period', '-', '-', formatCurrency(runningBalance)]);
  }
  
  paymentsData.push([
    '', '', 'Subtotal', formatCurrency(totalTenantPayments), formatCurrency(runningBalance)
  ]);
  
  doc.autoTable({
    startY: yPos,
    body: paymentsData,
    theme: 'plain',
    bodyStyles: {
      fontSize: 9,
      textColor: textGray,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 90 },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.row.index === paymentsData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 8;

  // ==================== RAS PAYMENTS (Info Only) ====================
  yPos = drawSectionHeader(4, 'RAS Payments (Information Only - Does Not Affect Balance)', yPos);
  
  const rasData = [];
  let totalRasPayments = 0;
  
  receiptData.transactions.forEach(t => {
    const rasPayment = parseFloat(t.rasPayment) || 0;
    if (rasPayment > 0) {
      totalRasPayments += rasPayment;
      const status = t.rasReceived ? 'RAS Payment Received' : 'RAS Payment (Pending)';
      rasData.push([
        formatDate(t.date),
        status,
        '-',
        formatCurrency(rasPayment),
        '-'
      ]);
    }
  });
  
  if (rasData.length === 0) {
    rasData.push(['-', 'No RAS payments this period', '-', '-', '-']);
  }
  
  rasData.push([
    '', '', 'Total RAS', formatCurrency(totalRasPayments), '-'
  ]);
  
  doc.autoTable({
    startY: yPos,
    body: rasData,
    theme: 'plain',
    bodyStyles: {
      fontSize: 9,
      textColor: lightGray,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 90 },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 45, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.row.index === rasData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });
  
  yPos = doc.lastAutoTable.finalY + 10;

  // ==================== CLOSING BALANCE BOX ====================
  const finalBalance = receiptData.finalBalance;
  const balanceColor = finalBalance <= 0 ? greenColor : redColor;
  
  // Draw closing balance box
  const boxWidth = 120;
  const boxX = pageWidth - margin - boxWidth;
  
  doc.setFillColor(...balanceColor);
  doc.roundedRect(boxX, yPos, boxWidth, 20, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Closing Balance (Tenant Owes)', boxX + 10, yPos + 8);
  doc.setFontSize(14);
  doc.text(formatCurrency(finalBalance), boxX + boxWidth - 10, yPos + 16, { align: 'right' });
  
  yPos += 30;

  // ==================== NOTES SECTION ====================
  if (receiptData.notes) {
    doc.setTextColor(...textGray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    
    const splitNotes = doc.splitTextToSize(receiptData.notes, pageWidth - (margin * 2));
    doc.text(splitNotes, margin, yPos + 5);
    yPos += 10 + (splitNotes.length * 4);
  }
  
  // ==================== RENT DETAILS NOTE ====================
  yPos += 5;
  doc.setTextColor(...textGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const weeklyRent = receiptData.weeklyRent || 0;
  const weeklyRas = receiptData.weeklyRas || 0;
  const tenantWeeklyPayment = weeklyRent - weeklyRas;
  
  if (weeklyRent > 0) {
    doc.text(`Weekly Rent: ${formatCurrency(weeklyRent)} | Weekly RAS: ${formatCurrency(weeklyRas)} | Tenant Weekly Payment: ${formatCurrency(tenantWeeklyPayment)}`, margin, yPos);
  }

  // ==================== FOOTER ====================
  // Right-aligned organization info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(settings.organizationName || 'Society of Saint Vincent de Paul', pageWidth - margin, pageHeight - 25, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.text('Local Housing Support Office', pageWidth - margin, pageHeight - 20, { align: 'right' });
  if (settings.contactPhone) {
    doc.text(`T: ${settings.contactPhone}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
  }
  
  // Left footer - small print
  doc.setFontSize(7);
  doc.setTextColor(...lightGray);
  doc.text(`${settings.systemName || 'SVP Housing Support System'} | Generated ${formatDate(receiptData.createdDate)}`, margin, pageHeight - 10);

  // Open print dialog
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '€' + num.toFixed(2);
}