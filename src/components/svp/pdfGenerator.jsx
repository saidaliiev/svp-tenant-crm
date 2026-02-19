import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateReceiptPDF(receiptData, settings) {
  try {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10; // Minimal margin for full-width table
    
    const primaryBlue = [14, 86, 167];
    const lightGray = [240, 242, 245];
    
    const receiptNum = receiptData.receiptId || 'RCP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    let yPos = margin;

    // Add SVP Logo - aligned left
    const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/36ae01103_SVP-1200x675-Photoroom.png';
    const logoWidth = 70;
    const logoHeight = 23;
    doc.addImage(logoUrl, 'PNG', margin, yPos, logoWidth, logoHeight);
    
    yPos += 28;
    
    // Horizontal line (removed duplicate organization name)
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 10;
    
    // RECEIPT STATEMENT title
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT STATEMENT', margin, yPos);
    
    yPos += 12;

    // Left column: Tenant Info
    const leftCol = margin;
    const rightColLabel = pageWidth / 2 + 10;
    const rightColValue = pageWidth - margin;
    
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Tenant', leftCol, yPos);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(receiptData.clientName || '', leftCol, yPos + 5);
    
    const addressLines = receiptData.clientAddress ? receiptData.clientAddress.split('\n') : [];
    let addressY = yPos + 10;
    addressLines.forEach(line => {
      doc.text(line.trim(), leftCol, addressY);
      addressY += 4;
    });
    
    // Right column: Statement info
    let rightY = yPos;
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Statement Period:', rightColLabel, rightY);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formatDate(receiptData.startDate)} - ${formatDate(receiptData.endDate)}`, rightColValue, rightY, { align: 'right' });
    
    rightY += 6;
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt No:', rightColLabel, rightY);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptNum, rightColValue, rightY, { align: 'right' });
    
    rightY += 6;
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Date Issued:', rightColLabel, rightY);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(receiptData.createdDate), rightColValue, rightY, { align: 'right' });
    
    yPos = Math.max(addressY, rightY) + 8;

    // Charges & Payments section title
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Charges & Payments', leftCol, yPos);
    
    yPos += 8;

    // Transactions Table - without previous balance row
    const tableData = [];
    const startDebt = receiptData.includeDebt ? parseFloat(receiptData.startingDebt || 0) : 0;
    const creditAmount = receiptData.includeCredit ? parseFloat(receiptData.credit || 0) : 0;
    
    if (receiptData.transactions && receiptData.transactions.length > 0) {
      receiptData.transactions.forEach(t => {
        const rentDue = parseFloat(t.rentDue);
        const tenantPayment = parseFloat(t.tenantPayment);
        const rasPayment = parseFloat(t.rasPayment);
        
        const rentDueVal = isNaN(rentDue) ? 0 : rentDue;
        const tenantPaymentVal = isNaN(tenantPayment) ? 0 : tenantPayment;
        const rasPaymentVal = isNaN(rasPayment) ? 0 : rasPayment;
        
        const dateFormatted = formatDateShort(t.date) || '-';
        
        tableData.push([
          dateFormatted,
          rentDueVal > 0 ? formatCurrency(rentDueVal) : '-',
          t.tenantPaid ? formatCurrency(tenantPaymentVal) : '-',
          rasPaymentVal > 0 && t.rasReceived ? formatCurrency(rasPaymentVal) : '-'
        ]);
      });
    }

    doc.autoTable({
      startY: yPos,
      margin: { left: margin, right: margin },
      head: [['Date', 'Description', 'Rent Due', 'Payment', 'Balance']],
      body: tableData,
      theme: 'plain',
      tableWidth: 'auto',
      headStyles: {
        fillColor: lightGray,
        textColor: [60, 60, 60],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 }
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
        textColor: [60, 60, 60]
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.row.index % 2 === 1) {
          data.cell.styles.fillColor = [245, 245, 245];
        }
      }
    });
    
    yPos = doc.lastAutoTable.finalY + 3;

    // Final Balance Box with breakdown inside
    const totalRentDue = receiptData.totalRentDue || 0;
    const totalTenantPaid = receiptData.totalTenantPayments || 0;
    const totalRasReceived = receiptData.totalRasReceived || 0;
    
    const boxWidth = pageWidth - (margin * 2);
    const boxHeight = 18;
    
    // Determine color based on balance
    const isDebt = receiptData.finalBalance > 0;
    const balanceColor = isDebt ? [220, 53, 69] : [40, 167, 69]; // Red or Green
    
    // Draw rectangle (no rounding)
    doc.setFillColor(balanceColor[0], balanceColor[1], balanceColor[2]);
    doc.rect(margin, yPos, boxWidth, boxHeight, 'F');
    
    // White text inside - properly aligned
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // First line - label and amount
    const firstLineY = yPos + 7;
    doc.text('FINAL TENANT BALANCE:', margin + 4, firstLineY);
    doc.setFontSize(12);
    doc.text(formatCurrency(receiptData.finalBalance), pageWidth - margin - 4, firstLineY, { align: 'right' });
    
    // Second line - breakdown
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    let breakdownParts = [];
    if (startDebt !== 0) {
      breakdownParts.push(`Previous Debt: ${formatCurrency(startDebt)}`);
    }
    if (creditAmount !== 0) {
      breakdownParts.push(`Credit: ${formatCurrency(creditAmount)}`);
    }
    breakdownParts.push(`Rent Due: ${formatCurrency(totalRentDue)}`);
    breakdownParts.push(`Tenant Paid: ${formatCurrency(totalTenantPaid)}`);
    if (totalRasReceived > 0) {
      breakdownParts.push(`RAS: ${formatCurrency(totalRasReceived)}`);
    }
    
    const breakdownText = breakdownParts.join('  |  ');
    const secondLineY = yPos + 14;
    doc.text(breakdownText, margin + 4, secondLineY);
    
    yPos += boxHeight + 8;

    // Notes with paragraph breaks
    if (receiptData.notes) {
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');

      // Remove (!!) and other special characters
      const cleanedNotes = receiptData.notes
        .replace(/\(!\!\)/g, '')
        .replace(/⚠️/g, '')
        .replace(/[^\x00-\x7F€]/g, '');

      // Split by double newlines for paragraphs
      const paragraphs = cleanedNotes.split('\n\n').filter(p => p.trim());
      paragraphs.forEach((para, idx) => {
        const splitText = doc.splitTextToSize(para.trim(), pageWidth - (margin * 2));
        doc.text(splitText, margin, yPos);
        yPos += (splitText.length * 4) + 4; // Add extra space between paragraphs
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const systemName = (settings && settings.systemName) || 'SVP System';
    const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const footerLeft = systemName + ' | Generated: ' + currentDate;
    
    doc.text(footerLeft, margin, pageHeight - 10);
    doc.text(receiptNum, pageWidth - margin, pageHeight - 10, { align: 'right' });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF: ' + error.message);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch (e) {
    return '';
  }
}

function formatCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '€0.00';
  if (num < 0) {
    return '-€' + Math.abs(num).toFixed(2);
  }
  return '€' + num.toFixed(2);
}