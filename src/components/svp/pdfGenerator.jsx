import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generateReceiptPDF(receiptData, settings) {
  try {
    const doc = new jsPDF('portrait');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    const primaryBlue = [14, 86, 167];
    const lightGray = [240, 242, 245];
    
    const receiptNum = receiptData.id || 'RCP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    let yPos = margin;

  // Add SVP Logo
  const logoUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/3aa602531_Logo-SVP-Vectorai-OFFICIAL.png';
  try {
    doc.addImage(logoUrl, 'PNG', margin, yPos, 40, 25);
  } catch (e) {
    console.log('Could not load logo');
  }
  
  yPos += 28;
  
  // Organization Name
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Society of St Vincent de Paul', margin, yPos);
  
  yPos += 10;
  
  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 10;
  
  // RECEIPT STATEMENT title
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT STATEMENT', margin, yPos);
  
  yPos += 12;

  // Left column: Tenant Info
  const leftCol = margin;
  const rightCol = pageWidth / 2 + 10;
  
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Tenant', leftCol, yPos);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(receiptData.clientName, leftCol, yPos + 5);
  
  const addressLines = receiptData.clientAddress ? receiptData.clientAddress.split('\n') : [];
  let addressY = yPos + 10;
  addressLines.forEach(line => {
    doc.text(line.trim(), leftCol, addressY);
    addressY += 4;
  });
  
  // Right column: Statement info
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  doc.text('Statement Period:', rightCol, yPos);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatDate(receiptData.startDate)} – ${formatDate(receiptData.endDate)}`, rightCol + 40, yPos, { align: 'right', maxWidth: 55 });
  
  doc.setTextColor(...primaryBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No:', rightCol, yPos + 6);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(receiptNum, rightCol + 40, yPos + 6, { align: 'right', maxWidth: 55 });
  
  doc.setTextColor(...primaryBlue);
  doc.setFont('helvetica', 'bold');
  doc.text('Date Issued:', rightCol, yPos + 12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(receiptData.createdDate), rightCol + 40, yPos + 12, { align: 'right', maxWidth: 55 });
  
  yPos = Math.max(addressY, yPos + 18) + 8;

  // Charges & Payments section title
  doc.setTextColor(...primaryBlue);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Charges & Payments', margin, yPos);
  
  yPos += 8;

    // Transactions Table
    const tableData = [];
    let runningBalance = parseFloat(receiptData.startingDebt) || 0;
    
    // Starting balance
    tableData.push([
      '',
      'Previous Balance Carried Forward',
      '-',
      '-',
      formatCurrency(runningBalance)
    ]);
    
    receiptData.transactions.forEach(t => {
      const rentDue = parseFloat(t.rentDue) || 0;
      const tenantPayment = parseFloat(t.tenantPayment) || 0;
      const rasPayment = parseFloat(t.rasPayment) || 0;
      const dateFormatted = formatDateShort(t.date);
      
      // Tenant Payment row
      const tenantDesc = t.tenantPaid ? 'Tenant Payment' : 'Tenant Payment (NOT PAID)';
      const newBalance = runningBalance + rentDue - (t.tenantPaid ? tenantPayment : 0);
      
      tableData.push([
        dateFormatted,
        tenantDesc,
        formatCurrency(rentDue),
        t.tenantPaid ? formatCurrency(tenantPayment) : '-',
        formatCurrency(newBalance)
      ]);
      
      runningBalance = newBalance;
      
      // RAS row 
      if (rasPayment > 0) {
        const rasDesc = t.rasReceived ? 'RAS Payment' : 'RAS Payment (NOT PAID)';
        tableData.push([
          dateFormatted,
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
        fontSize: 8.5,
        cellPadding: { top: 2.5, right: 3, bottom: 2.5, left: 3 },
        textColor: [60, 60, 60]
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 72 },
        2: { cellWidth: 24, halign: 'right' },
        3: { cellWidth: 24, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' }
      },
      didParseCell: function(data) {
        if (data.row.index === 0 && data.section === 'body') {
          data.cell.styles.fillColor = [250, 250, 250];
        }
      }
    });
    
    yPos = doc.lastAutoTable.finalY + 3;

    // Final Balance Box - directly in table
    const finalBalanceBox = pageWidth - margin - 60;
    doc.setFillColor(lightGray);
    doc.rect(finalBalanceBox, yPos, 60, 10, 'F');
    
    doc.setTextColor(...primaryBlue);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FINAL TENANT BALANCE:', finalBalanceBox + 3, yPos + 6.5);
    doc.text(formatCurrency(receiptData.finalBalance), finalBalanceBox + 57, yPos + 6.5, { align: 'right' });
    
    yPos += 20;

    // Notes/Contact info
    if (receiptData.notes || settings.contactPhone) {
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      
      if (settings.contactPhone) {
        doc.text(`For assistance, please contact SVP: ${settings.contactPhone}`, margin, yPos);
        yPos += 5;
      }
      
      if (receiptData.notes) {
        const splitNotes = doc.splitTextToSize(receiptData.notes, pageWidth - (margin * 2));
        doc.text(splitNotes, margin, yPos);
      }
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const footerLeft = `${settings.systemName} | Generated: ${formatDate(receiptData.createdDate)}`;
    const footerRight = receiptNum;
    
    doc.text(footerLeft, margin, pageHeight - 10);
    doc.text(footerRight, pageWidth - margin, pageHeight - 10, { align: 'right' });

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
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  if (num < 0) {
    return '-€' + Math.abs(num).toFixed(2);
  }
  return '€' + num.toFixed(2);
}