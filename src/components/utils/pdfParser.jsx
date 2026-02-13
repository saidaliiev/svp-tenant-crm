import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Parse Bank of Ireland statement PDF and extract payments
 */
export async function parseBOIStatement(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return extractPayments(fullText);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}

/**
 * Extract payment transactions from BOI statement text
 */
function extractPayments(text) {
  const payments = [];
  const lines = text.split('\n');
  
  // BOI statement patterns
  const datePattern = /(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip unwanted lines
    if (!line || 
        line.includes('Transaction details') || 
        line.includes('BALANCE FORWARD') || 
        line.includes('SUBTOTAL') ||
        line.includes('All Business') ||
        line.includes('Page ') ||
        line.includes('Balance') ||
        line.includes('Payments - out') ||
        line.includes('Payments - in') ||
        line.includes('Your Current Account Statement') ||
        line.includes('CARNDONAGH') ||
        line.includes('Bank of Ireland') ||
        line.includes('IBAN') ||
        line.includes('Account number')) {
      continue;
    }
    
    // Look for date at start of line (transaction line)
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;
    
    const [_, day, month, year] = dateMatch;
    const date = `${day} ${month} ${year}`;
    
    // Everything after date is description + amounts + balance
    let afterDate = line.substring(dateMatch.index + dateMatch[0].length).trim();
    
    // Extract all amounts (format: 12,345.67 or 123.45)
    const amountPattern = /\d{1,3}(?:,\d{3})*\.\d{2}/g;
    const amounts = [];
    let match;
    while ((match = amountPattern.exec(afterDate)) !== null) {
      amounts.push({
        value: parseFloat(match[0].replace(/,/g, '')),
        index: match.index,
        text: match[0]
      });
    }
    
    if (amounts.length === 0) continue;
    
    // In BOI statements: description, then payment-out (if any), then payment-in (if any), then balance
    // We want payments-in (positive, second or third from end typically)
    // Balance is always last
    // Look for payment-in: typically second from last if there are 2+ amounts
    
    let paymentAmount = null;
    let description = afterDate;
    
    if (amounts.length >= 2) {
      // Try second-to-last as payment-in
      paymentAmount = amounts[amounts.length - 2].value;
      // Description is everything before the payment amount
      const paymentIndex = amounts[amounts.length - 2].index;
      description = afterDate.substring(0, paymentIndex).trim();
    } else if (amounts.length === 1) {
      // Single amount could be payment or balance - skip if unsure
      continue;
    }
    
    // Skip if no valid payment amount or no description
    if (!paymentAmount || paymentAmount <= 0 || !description) continue;
    
    // Clean up description - remove trailing spaces and amounts
    description = description.replace(/\s+/g, ' ').trim();
    
    // Skip cheque out lines (negative amounts column)
    if (description.includes('CHEQUE') && line.includes('Payments - out')) {
      continue;
    }
    
    payments.push({
      date,
      description,
      amount: paymentAmount,
      rawLine: line
    });
  }
  
  return payments;
}

/**
 * Match payments to tenants
 */
export function matchPaymentsToTenants(payments, tenants) {
  return payments.map(payment => {
    const matches = tenants.map(tenant => ({
      tenant,
      score: calculateMatchScore(payment, tenant)
    }));
    
    // Sort by score descending
    matches.sort((a, b) => b.score.confidence - a.score.confidence);
    
    const bestMatch = matches[0];
    
    return {
      ...payment,
      matchedTenant: bestMatch.score.confidence >= 50 ? bestMatch.tenant : null,
      confidence: bestMatch.score.confidence,
      type: bestMatch.score.type,
      matchReason: bestMatch.score.reason
    };
  });
}

/**
 * Calculate match score for a payment and tenant
 */
function calculateMatchScore(payment, tenant) {
  const desc = payment.description.toUpperCase();
  const amount = payment.amount;
  
  let confidence = 0;
  let type = 'Tenant Payment';
  let reason = '';
  
  // 1. Check for RAS/Government payment (highest priority for type detection)
  if (amount > 200 || desc.includes('GOVT') || desc.includes('HAP') || desc.includes('RAS') || 
      desc.includes('DEPARTMENT') || desc.includes('HOUSING') || desc.includes('SOCIAL')) {
    type = 'RAS';
    
    // Try to match by amount to tenant's RAS
    const weeklyRas = tenant.weeklyRasAmount || 0;
    const expectedMonthlyRas = weeklyRas * 4.3;
    
    if (weeklyRas > 0 && Math.abs(amount - expectedMonthlyRas) < 50) {
      confidence = 85;
      reason = `Large payment (€${amount}) matches expected RAS (€${expectedMonthlyRas.toFixed(2)})`;
      return { confidence, type, reason };
    }
    
    confidence = 60;
    reason = `Large payment or government keyword detected`;
    return { confidence, type, reason };
  }
  
  // 2. Lodgment number match (highest confidence for tenant payments)
  if ((desc.includes('LODGEMENT') || desc.includes('LODGMENT')) && tenant.lodgmentRange) {
    const lodgmentNumbers = extractLodgmentNumbers(desc);
    
    for (const num of lodgmentNumbers) {
      if (isInLodgmentRange(num, tenant.lodgmentRange)) {
        confidence = 100;
        reason = `Lodgment ${num} matches range ${tenant.lodgmentRange}`;
        return { confidence, type, reason };
      }
    }
  }
  
  // 3. Name fuzzy match
  const nameMatch = fuzzyMatchName(desc, tenant, payment);
  if (nameMatch.matched) {
    confidence = nameMatch.confidence;
    reason = nameMatch.reason;
    
    // 4. Amount match boosts confidence
    const expectedPayment = tenant.expectedMonthlyTenantPayment || (tenant.weeklyTenantPayment * 4.3) || 0;
    if (expectedPayment > 0 && Math.abs(amount - expectedPayment) <= 5) {
      confidence = Math.min(confidence + 20, 95);
      reason += ` + amount matches expected (€${expectedPayment.toFixed(2)})`;
    }
    
    return { confidence, type, reason };
  }
  
  // 5. Amount-only match (last resort)
  const expectedPayment = tenant.expectedMonthlyTenantPayment || (tenant.weeklyTenantPayment * 4.3) || 0;
  if (expectedPayment > 0 && Math.abs(amount - expectedPayment) <= 5) {
    confidence = 50;
    reason = `Amount matches expected payment (€${expectedPayment.toFixed(2)})`;
    return { confidence, type, reason };
  }
  
  return { confidence: 0, type, reason: 'No match found' };
}

/**
 * Extract lodgment numbers from description
 */
function extractLodgmentNumbers(description) {
  const numbers = [];
  
  // Pattern: LODGEMENT/LODGMENT followed by number or range
  // Examples: "LODGEMENT 3251", "LODGMENT 3251-3300", "LODGEMENT 349701"
  const patterns = [
    /LODG[E]?MENT\s+(\d{4,6})-(\d{4,6})/gi,  // Range: 3251-3300
    /LODG[E]?MENT\s+(\d{4,6})/gi             // Single: 3251 or 349701
  ];
  
  // First try to match ranges
  let match;
  const rangePattern = patterns[0];
  rangePattern.lastIndex = 0; // Reset regex
  while ((match = rangePattern.exec(description)) !== null) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    // Don't expand huge ranges, just add start and end for matching
    if (end - start <= 100) {
      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }
    } else {
      numbers.push(start);
      numbers.push(end);
    }
  }
  
  // Then try single numbers (if no range found)
  if (numbers.length === 0) {
    const singlePattern = patterns[1];
    singlePattern.lastIndex = 0;
    while ((match = singlePattern.exec(description)) !== null) {
      numbers.push(parseInt(match[1]));
    }
  }
  
  return numbers;
}

/**
 * Check if a number is in a lodgment range
 */
function isInLodgmentRange(number, range) {
  if (!range) return false;
  
  // Single number: "3251"
  if (!range.includes('-')) {
    return parseInt(range) === number;
  }
  
  // Range: "3251-3300"
  const [start, end] = range.split('-').map(n => parseInt(n.trim()));
  return number >= start && number <= end;
}

/**
 * Fuzzy match name and keywords
 */
function fuzzyMatchName(description, tenant, payment) {
  const desc = description.toUpperCase();
  const fullName = tenant.fullName.toUpperCase();
  const keywords = (tenant.paymentKeywords || []).map(k => k.toUpperCase());
  
  // Check full name parts
  const nameParts = fullName.split(' ').filter(p => p.length > 2); // Skip short words
  let matchedParts = 0;
  
  for (const part of nameParts) {
    if (desc.includes(part)) {
      matchedParts++;
    }
  }
  
  if (matchedParts >= 2 || (nameParts.length === 1 && matchedParts === 1)) {
    return {
      matched: true,
      confidence: 90,
      reason: `Name match: "${fullName}"`
    };
  }
  
  if (matchedParts === 1 && nameParts.length >= 2) {
    return {
      matched: true,
      confidence: 70,
      reason: `Partial name match: "${nameParts.find(p => desc.includes(p))}"`
    };
  }
  
  // Check keywords
  for (const keyword of keywords) {
    if (desc.includes(keyword)) {
      return {
        matched: true,
        confidence: 85,
        reason: `Keyword match: "${keyword}"`
      };
    }
  }
  
  return { matched: false, confidence: 0, reason: '' };
}

/**
 * Extract date range from statement text
 */
export function extractStatementDateRange(text) {
  const datePattern = /(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/gi;
  const dates = [];
  
  let match;
  while ((match = datePattern.exec(text)) !== null) {
    const [_, day, month, year] = match;
    dates.push(new Date(`${day} ${month} ${year}`));
  }
  
  if (dates.length === 0) return null;
  
  const sortedDates = dates.sort((a, b) => a - b);
  return {
    startDate: sortedDates[0],
    endDate: sortedDates[sortedDates.length - 1]
  };
}