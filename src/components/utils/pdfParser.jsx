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
 * Improved parsing for real-world BOI formats
 */
function extractPayments(text) {
  const payments = [];
  const lines = text.split('\n');
  
  // BOI statement patterns
  const datePattern = /^(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i;
  
  // Build a full line by joining consecutive non-date lines
  let currentTransaction = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip headers and footers
    if (!line || 
        line.includes('Transaction details') || 
        line.includes('BALANCE FORWARD') || 
        line.includes('SUBTOTAL') ||
        line.includes('All Business') ||
        line.includes('Page ') ||
        line.includes('Payments - out') ||
        line.includes('Payments - in') ||
        line.includes('Your Current Account Statement') ||
        line.includes('CARNDONAGH') ||
        line.includes('Bank of Ireland') ||
        line.includes('IBAN') ||
        line.includes('Account number') ||
        line.includes('Date') ||
        line.includes('eligible deposit')) {
      continue;
    }
    
    // Check if line starts with a date
    const dateMatch = line.match(datePattern);
    
    if (dateMatch) {
      // Process previous transaction if exists
      if (currentTransaction) {
        const payment = parseTransaction(currentTransaction);
        if (payment) payments.push(payment);
      }
      // Start new transaction
      currentTransaction = line;
    } else if (currentTransaction) {
      // Continue building current transaction
      currentTransaction += ' ' + line;
    }
  }
  
  // Process last transaction
  if (currentTransaction) {
    const payment = parseTransaction(currentTransaction);
    if (payment) payments.push(payment);
  }
  
  return payments;
}

/**
 * Parse a single transaction line
 */
function parseTransaction(line) {
  // Extract date
  const datePattern = /^(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i;
  const dateMatch = line.match(datePattern);
  if (!dateMatch) return null;
  
  const [_, day, month, year] = dateMatch;
  const date = `${day} ${month} ${year}`;
  
  // Everything after date
  let rest = line.substring(dateMatch[0].length).trim();
  
  // Extract all amounts from the line
  const amountPattern = /\d{1,3}(?:,\d{3})*\.\d{2}/g;
  const amounts = [];
  let match;
  while ((match = amountPattern.exec(rest)) !== null) {
    amounts.push({
      value: parseFloat(match[0].replace(/,/g, '')),
      index: match.index,
      text: match[0]
    });
  }
  
  if (amounts.length < 2) return null; // Need at least payment + balance
  
  // In BOI format: description [payment-out] [payment-in] balance
  // Payment-in is typically second-to-last, balance is last
  const paymentAmount = amounts[amounts.length - 2].value;
  const paymentIndex = amounts[amounts.length - 2].index;
  
  // Description is everything before the payment amount
  let description = rest.substring(0, paymentIndex).trim();
  
  // Clean description
  description = description.replace(/\s+/g, ' ').trim();
  
  // Skip if no description or payment amount <= 0
  if (!description || paymentAmount <= 0) return null;
  
  // Skip obvious outgoings (CHEQUE lines typically)
  if (description.toUpperCase().startsWith('CHEQUE') && amounts.length >= 3) {
    // If first amount (payment-out) exists and is larger, this is an outgoing
    if (amounts[0].value > paymentAmount) return null;
  }
  
  return {
    date,
    description,
    amount: paymentAmount,
    rawLine: line
  };
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