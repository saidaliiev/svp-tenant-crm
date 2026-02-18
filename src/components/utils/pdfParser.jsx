import { base44 } from '@/api/base44Client';

/**
 * Parse bank statement PDF using AI extraction for reliable results
 */
export async function parseBOIStatement(file) {
  try {
    // Upload file first
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Use AI to extract structured payment data
    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: "object",
        properties: {
          statement_start_date: {
            type: "string",
            description: "Earliest transaction date in the statement (format: DD Mon YYYY, e.g. 02 Jan 2026)"
          },
          statement_end_date: {
            type: "string",
            description: "Latest transaction date in the statement (format: DD Mon YYYY, e.g. 30 Jan 2026)"
          },
          payments_in: {
            type: "array",
            description: "All 'Payments - in' transactions (incoming payments/lodgments). Do NOT include 'Payments - out' or BALANCE FORWARD or SUBTOTAL.",
            items: {
              type: "object",
              properties: {
                date: {
                  type: "string",
                  description: "Transaction date (format: DD Mon YYYY)"
                },
                description: {
                  type: "string",
                  description: "Full transaction description exactly as shown (e.g. 'CSH APO 02JAN 0913-02', 'MARGARET BARR SP', '34771 RONAN RENT', 'LODGMENT 2243', 'Claire Crumlish\\'s SO')"
                },
                amount: {
                  type: "number",
                  description: "Payment amount in EUR from the 'Payments - in' column"
                }
              },
              required: ["date", "description", "amount"]
            }
          }
        },
        required: ["payments_in", "statement_start_date", "statement_end_date"]
      }
    });

    if (result.status === 'error') {
      throw new Error(result.details || 'Failed to extract data from PDF');
    }

    const data = result.output;

    // Store date range for later use
    parseBOIStatement._lastDateRange = null;
    if (data.statement_start_date && data.statement_end_date) {
      parseBOIStatement._lastDateRange = {
        startDate: new Date(data.statement_start_date),
        endDate: new Date(data.statement_end_date)
      };
    }

    // Convert to expected format
    const payments = (data.payments_in || [])
      .filter(p => p.amount > 0)
      .map(p => ({
        date: p.date,
        description: p.description,
        amount: p.amount,
        rawLine: `${p.date} ${p.description} ${p.amount}`
      }));

    return payments;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}

/**
 * Match payments to tenants using name, keywords, lodgment ranges, and amounts
 */
export function matchPaymentsToTenants(payments, tenants) {
  return payments.map(payment => {
    const matches = tenants.map(tenant => ({
      tenant,
      score: calculateMatchScore(payment, tenant)
    }));

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

  // 1. Lodgment number match (highest confidence)
  if (desc.includes('LODG')) {
    const lodgmentNumbers = extractLodgmentNumbers(desc);
    if (tenant.lodgmentRange) {
      for (const num of lodgmentNumbers) {
        if (isInLodgmentRange(num, tenant.lodgmentRange)) {
          confidence = 100;
          reason = `Lodgment ${num} matches range ${tenant.lodgmentRange}`;
          return { confidence, type, reason };
        }
      }
    }
  }

  // 2. Name fuzzy match
  const nameMatch = fuzzyMatchName(desc, tenant);
  if (nameMatch.matched) {
    confidence = nameMatch.confidence;
    reason = nameMatch.reason;

    // Boost if amount matches expected weekly payment
    const weeklyPayment = tenant.weeklyTenantPayment || 0;
    if (weeklyPayment > 0 && Math.abs(amount - weeklyPayment) <= 2) {
      confidence = Math.min(confidence + 15, 98);
      reason += ` + amount matches weekly (€${weeklyPayment})`;
    }

    return { confidence, type, reason };
  }

  // 3. Check for RAS-like payments (large amounts, specific keywords)
  if (desc.includes('RENT') || amount > 100) {
    // Check if description contains tenant reference number like "34771"
    const refNumbers = desc.match(/\d{4,5}/g) || [];
    // This could be a rent/RAS payment
    if (amount > 100 && (desc.includes('RENT') || desc.includes('RAS') || desc.includes('HAP'))) {
      type = 'RAS';
      const weeklyRas = tenant.weeklyRasAmount || 0;
      if (weeklyRas > 0) {
        const expectedMonthlyRas = weeklyRas * 4.3;
        if (Math.abs(amount - expectedMonthlyRas) < 50) {
          confidence = 80;
          reason = `Amount ~matches expected monthly RAS`;
          return { confidence, type, reason };
        }
      }
    }
  }

  // 4. Amount-only match (last resort)
  const weeklyPayment = tenant.weeklyTenantPayment || 0;
  if (weeklyPayment > 0 && Math.abs(amount - weeklyPayment) <= 2) {
    confidence = 40;
    reason = `Amount matches weekly payment (€${weeklyPayment})`;
    return { confidence, type, reason };
  }

  return { confidence: 0, type, reason: 'No match found' };
}

function extractLodgmentNumbers(description) {
  const numbers = [];
  const patterns = [
    /LODG\w*\s+(\d{4,6})/gi
  ];

  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(description)) !== null) {
      numbers.push(parseInt(match[1]));
    }
  }

  return numbers;
}

function isInLodgmentRange(number, range) {
  if (!range) return false;

  if (!range.includes('-')) {
    return parseInt(range) === number;
  }

  const [start, end] = range.split('-').map(n => parseInt(n.trim()));
  return number >= start && number <= end;
}

function fuzzyMatchName(description, tenant) {
  const desc = description.toUpperCase();
  const fullName = tenant.fullName.toUpperCase();
  const keywords = (tenant.paymentKeywords || []).map(k => k.toUpperCase());

  // Check full name parts
  const nameParts = fullName.split(' ').filter(p => p.length > 2);
  let matchedParts = 0;

  for (const part of nameParts) {
    if (desc.includes(part)) {
      matchedParts++;
    }
  }

  if (matchedParts >= 2 || (nameParts.length === 1 && matchedParts === 1)) {
    return { matched: true, confidence: 90, reason: `Name match: "${fullName}"` };
  }

  if (matchedParts === 1 && nameParts.length >= 2) {
    // Check if the matched part is a surname (more unique)
    const matchedPart = nameParts.find(p => desc.includes(p));
    return { matched: true, confidence: 70, reason: `Partial name match: "${matchedPart}"` };
  }

  // Check keywords
  for (const keyword of keywords) {
    if (keyword && desc.includes(keyword)) {
      return { matched: true, confidence: 85, reason: `Keyword match: "${keyword}"` };
    }
  }

  return { matched: false, confidence: 0, reason: '' };
}

/**
 * Extract date range from statement (now uses stored data from parse)
 */
export function extractStatementDateRange() {
  return parseBOIStatement._lastDateRange || null;
}