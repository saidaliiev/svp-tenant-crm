import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateReceiptPDF(receiptData, settings) {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  
  const darkNavy = [17, 24, 39];
  const accentBlue = [59, 130, 246];
  const textGray = [75, 85, 99];
  const lightGray = [156, 163, 175];
  const borderGray = [229, 231, 235];
  const greenColor = [34, 197, 94];
  const redColor = [239, 68, 68];
  
  const receiptNum = 'SVP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const statementNum = receiptData.statementNumber || Math.floor(Math.random() * 1000);
  
  let yPos = 0;

  // Header
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, 4, 35, 16, 'F');
  
  const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/3aa602531_Logo-SVP-Vectorai-OFFICIAL.png';
  try {
    doc.addImage(logoUrl, 'PNG', margin + 2, 6, 31, 12);
  } catch (e) {
    console.log('Could not load logo');
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.organizationName || 'SOCIETY OF SAINT VINCENT DE PAUL', margin + 50, 15);
  
  yPos = 32;

  // Title
  doc.setTextColor(...darkNavy);
  doc.setFontSize(12);
  doc.text('RENT RECEIPT STATEMENT', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;

  // Info section
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 5;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  
  doc.text(receiptData.clientName || 'Tenant Name', margin, yPos);
  if (receiptData.clientId) {
    doc.text(`ID: ${receiptData.clientId}`, margin, yPos + 4);
  }
  
  const rightCol = pageWidth - margin - 55;
  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.text('Receipt:', rightCol, yPos);
  doc.text('Date:', rightCol, yPos + 4);
  doc.text('Statement #:', rightCol, yPos + 8);
  
  doc.setTextColor(...textGray);
  doc.text(receiptNum, rightCol + 20, yPos);
  doc.text(formatDate(receiptData.createdDate), rightCol + 20, yPos + 4);
  doc.text(String(statementNum), rightCol + 20, yPos + 8);
  
  yPos += 14;
  
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 6;

  // Period
  doc.setTextColor(...darkNavy);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Statement Period: ${formatDate(receiptData.startDate)} to ${formatDate(receiptData.endDate)}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;

  // Opening Balance
  const drawSectionHeader = (num, title, startY) => {
    doc.setFillColor(...accentBlue);
    doc.circle(margin + 3, startY - 1, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(String(num), margin + 3, startY, { align: 'center' });
    
    doc.setTextColor(...darkNavy);
    doc.setFontSize(9);
    doc.text(title, margin + 9, startY);
    
    return startY + 5;
  };
  
  yPos = drawSectionHeader(1, 'Opening Balance', yPos);
  
  doc.autoTable({
    startY: yPos,
    head: [['Date', 'Description', 'Rent Due', 'Payment', 'Balance']],
    body: [['-', 'Previous Balance', '-', '-', formatCurrency(receiptData.startingDebt)]],
    theme: 'plain',
    headStyles: {
      fillColor: [249, 250, 251],
      textColor: textGray,
      fontSize: 8,
      fontStyle: 'normal',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textGray,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 100 },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
    },
    tableLineColor: borderGray,
    tableLineWidth: 0.1,
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 5;

  // Income
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
  
  incomeData.push(['', '', 'Subtotal', formatCurrency(totalRentDue), formatCurrency(runningBalance)]);
  
  doc.autoTable({
    startY: yPos,
    body: incomeData,
    theme: 'plain',
    bodyStyles: {
      fontSize: 8,
      textColor: textGray,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 100 },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.row.index === incomeData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 5;

  // Tenant Payments
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
    paymentsData.push(['-', 'No tenant payments', '-', '-', formatCurrency(runningBalance)]);
  }
  
  paymentsData.push(['', '', 'Subtotal', formatCurrency(totalTenantPayments), formatCurrency(runningBalance)]);
  
  doc.autoTable({
    startY: yPos,
    body: paymentsData,
    theme: 'plain',
    bodyStyles: {
      fontSize: 8,
      textColor: textGray,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 100 },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.row.index === paymentsData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: margin, right: margin }
  });
  
  yPos = doc.lastAutoTable.finalY + 5;

  // RAS - subtract from balance
  const totalRasReceived = receiptData.totalRasReceived || 0;
  if (totalRasReceived > 0) {
    runningBalance -= totalRasReceived;
    
    yPos = drawSectionHeader(4, 'RAS Payments (Deducted from Tenant Balance)', yPos);
    
    const rasData = [];
    
    receiptData.transactions.forEach(t => {
      const rasPayment = parseFloat(t.rasPayment) || 0;
      if (rasPayment > 0 && t.rasReceived) {
        rasData.push([
          formatDate(t.date),
          'RAS Payment Received',
          '-',
          formatCurrency(rasPayment),
          '-'
        ]);
      }
    });
    
    rasData.push(['', '', 'Total RAS', formatCurrency(totalRasReceived), formatCurrency(runningBalance)]);
    
    doc.autoTable({
      startY: yPos,
      body: rasData,
      theme: 'plain',
      bodyStyles: {
        fontSize: 8,
        textColor: [34, 139, 34],
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 100 },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 45, halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function(data) {
        if (data.row.index === rasData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 6;
  }

  // Closing Balance
  const finalBalance = receiptData.finalBalance;
  const balanceColor = finalBalance <= 0 ? greenColor : redColor;
  
  const boxWidth = 90;
  const boxX = pageWidth - margin - boxWidth;
  
  doc.setFillColor(...balanceColor);
  doc.roundedRect(boxX, yPos, boxWidth, 16, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Closing Balance (Tenant Owes)', boxX + 5, yPos + 6);
  doc.setFontSize(12);
  doc.text(formatCurrency(finalBalance), boxX + boxWidth - 5, yPos + 12, { align: 'right' });
  
  yPos += 22;

  // Notes
  if (receiptData.notes) {
    doc.setTextColor(...textGray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    
    const splitNotes = doc.splitTextToSize(receiptData.notes, pageWidth - (margin * 2) - 100);
    doc.text(splitNotes, margin, yPos + 4);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkNavy);
  doc.text(settings.organizationName || 'Society of Saint Vincent de Paul', pageWidth - margin, pageHeight - 15, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textGray);
  doc.setFontSize(7);
  if (settings.contactPhone) {
    doc.text(`T: ${settings.contactPhone}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  }
  
  doc.setFontSize(6);
  doc.setTextColor(...lightGray);
  doc.text(`${settings.systemName || 'SVP Housing System'} | Generated ${formatDate(receiptData.createdDate)}`, margin, pageHeight - 6);

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