import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const TOUR_CONFIG = {
  Home_TenantManagement: [
    {
      selector: '[data-tour="btn-add-tenant"]',
      title: '➕ Add Tenant',
      description: 'Click to add a new tenant. Fill in their name, address, phone, and rent details.'
    },
    {
      selector: '[data-tour="btn-import"]',
      title: '📥 Import CSV/Excel',
      description: 'Bulk import tenants from a CSV or Excel file.'
    },
    {
      selector: '[data-tour="btn-export"]',
      title: '📤 Export to PDF',
      description: 'Generate a professional PDF report with all tenants and their balances.'
    },
    {
      selector: '[data-tour="tenant-table"]',
      title: '📋 Tenant Table',
      description: 'View all your tenants. Use the action buttons to manage each of them.'
    },
    {
      selector: '[data-tour="btn-profile"]',
      title: '👤 View Profile',
      description: 'Click to view detailed information, payment history, and notes.'
    },
    {
      selector: '[data-tour="btn-edit"]',
      title: '✏️ Edit',
      description: 'Update tenant details (phone, address, rent amount).'
    },
    {
      selector: '[data-tour="btn-delete"]',
      title: '🗑️ Delete',
      description: 'Completely delete a tenant. This action cannot be undone.'
    }
  ],
  Home_CreateReceipt: [
    {
      selector: '[data-tour="tenant-selector"]',
      title: '👥 Select Tenant',
      description: 'Choose the tenant you are creating a receipt for.'
    },
    {
      selector: '[data-tour="manual-mode"]',
      title: '✍️ Manual Mode',
      description: 'Manually enter all payment data week by week.'
    },
    {
      selector: '[data-tour="automatic-mode"]',
      title: '🤖 Automatic Mode',
      description: 'Upload a bank statement (PDF) and the system will automatically detect payments.'
    },
    {
      selector: '[data-tour="period-dates"]',
      title: '📅 Period Dates',
      description: 'Set the start and end dates for the receipt.'
    },
    {
      selector: '[data-tour="starting-debt"]',
      title: '💰 Starting Debt/Credit',
      description: 'Enter the previous balance (red = debt, green = credit).'
    },
    {
      selector: '[data-tour="add-transaction"]',
      title: '➕ Add Transaction',
      description: 'Add payment records for each week.'
    },
    {
      selector: '[data-tour="balance-preview"]',
      title: '📊 Balance Preview',
      description: 'Automatic calculation of the final balance.'
    },
    {
      selector: '[data-tour="receipt-notes"]',
      title: '📝 Notes',
      description: 'Add comments that will be printed on the receipt.'
    }
  ],
  Home_AutomaticMode: [
    {
      selector: '[data-tour="auto-upload"]',
      title: '📄 Upload Statement',
      description: 'Upload a bank statement PDF. The system will find the payments.'
    },
    {
      selector: '[data-tour="auto-payments"]',
      title: '✅ Detected Payments',
      description: 'A list of detected payments. The system will try to automatically link them to tenants.'
    },
    {
      selector: '[data-tour="auto-apply"]',
      title: '🚀 Apply Payments',
      description: 'Select a tenant and click Apply to transfer the payments into a new receipt.'
    }
  ],
  Home_ReceiptHistory: [
    {
      selector: '[data-tour="tenant-filter"]',
      title: '🔍 Filter',
      description: 'Filter receipts by a specific tenant.'
    },
    {
      selector: '[data-tour="receipt-row"]',
      title: '📄 Receipt Row',
      description: 'Each row represents a saved receipt.'
    },
    {
      selector: '[data-tour="btn-view-print"]',
      title: '🖨️ View & Print',
      description: 'Open the receipt to print or save it as a PDF.'
    },
    {
      selector: '[data-tour="btn-delete-receipt"]',
      title: '🗑️ Delete',
      description: 'Delete a receipt. You must provide a reason (minimum 6 characters).'
    }
  ],
  Home_Tools: [
    {
      selector: '[data-tour="tools-grid"]',
      title: '🛠️ Tools',
      description: 'Additional utilities for data analysis and management.'
    },
    {
      selector: '[data-tour="tool-card-labels"]',
      title: '🏷️ Address Labels',
      description: 'Print address labels on A4 sheets for mailing.'
    },
    {
      selector: '[data-tour="tool-card-rent-report"]',
      title: '📊 Rent Report',
      description: 'A summary PDF report for all tenants with payment and debt information.'
    },
    {
      selector: '[data-tour="tool-card-arrears-overview"]',
      title: '📈 Arrears Overview',
      description: 'Visual graphs showing total debt and monthly trends.'
    },
    {
      selector: '[data-tour="tool-card-arrears-alert"]',
      title: '🔔 Arrears Alert',
      description: 'A list of tenants whose debt exceeds the limit you set.'
    },
    {
      selector: '[data-tour="tool-card-bulk-letters"]',
      title: '✉️ Bulk Letters',
      description: 'Mass generation of personalized debt notification letters.'
    },
    {
      selector: '[data-tour="tool-card-payment-lookup"]',
      title: '🔍 Payment Lookup',
      description: 'Global search for a specific payment across all receipts.'
    },
    {
      selector: '[data-tour="tool-card-statement-calendar"]',
      title: '📅 Statement Calendar',
      description: 'A convenient table showing closed months for each tenant.'
    },
    {
      selector: '[data-tour="tool-card-export-excel"]',
      title: '📥 Export to Excel',
      description: 'Export all data (balances and transactions) to CSV/Excel format.'
    }
  ],
  Tool_labels: [
    { selector: '#active-tool-container', title: '🏷️ Address Labels', description: 'This tool lets you print mailing address stickers for all tenants. Select your preset and hit Print!' }
  ],
  'Tool_rent-report': [
    { selector: '#active-tool-container', title: '📊 Rent Report', description: 'Generate a comprehensive PDF report showing payment status and debts for all your tenants.' }
  ],
  'Tool_arrears-overview': [
    { selector: '#active-tool-container', title: '📈 Arrears Overview', description: 'View visual charts mapping total debt and trends across your organization.' }
  ],
  'Tool_arrears-alert': [
    { selector: '#active-tool-container', title: '🔔 Arrears Alert', description: 'Quickly find tenants whose debt has exceeded a specific threshold.' }
  ],
  'Tool_bulk-letters': [
    { selector: '#active-tool-container', title: '✉️ Bulk Letters', description: 'Generate and print personalized warning letters for tenants with outstanding balances.' }
  ],
  'Tool_payment-lookup': [
    { selector: '#active-tool-container', title: '🔍 Payment Lookup', description: 'Search for a specific payment by date, amount, or name across all receipts.' }
  ],
  'Tool_statement-calendar': [
    { selector: '#active-tool-container', title: '📅 Statement Calendar', description: 'A calendar view showing which months have been closed or receipted for each tenant.' }
  ],
  'Tool_export-excel': [
    { selector: '#active-tool-container', title: '📥 Export to Excel', description: 'Export all tenants and statement data to CSV files for use in Excel.' }
  ]
};

export default function InteractiveTour({ isOpen, onClose, currentPage, currentTab, currentMode, currentTool }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [elementRect, setElementRect] = useState(null);

  // Determine which tour to show
  let tourKey = currentPage;
  if (currentPage === 'Home') {
    if (currentTab === 'tenants') tourKey = 'Home_TenantManagement';
    else if (currentTab === 'receipt') {
      tourKey = currentMode === 'automatic' ? 'Home_AutomaticMode' : 'Home_CreateReceipt';
    }
    else if (currentTab === 'history') tourKey = 'Home_ReceiptHistory';
    else if (currentTab === 'tools') {
      if (currentTool) tourKey = `Tool_${currentTool}`;
      else tourKey = 'Home_Tools';
    }
  }

  const tourSteps = TOUR_CONFIG[tourKey] || [];
  const currentTourStep = tourSteps[currentStep];

  // Update highlighted element and its position
  useEffect(() => {
    if (!isOpen || !currentTourStep || currentPage === 'Settings') return;

    const getVisibleElement = (selector) => {
      const elements = Array.from(document.querySelectorAll(selector));
      return elements.find(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    };

    const updateRect = () => {
      if (highlightedElement) {
        setElementRect(highlightedElement.getBoundingClientRect());
      }
    };

    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    const findElement = () => {
      let element = getVisibleElement(currentTourStep.selector);
      
      // Smart detection for CreateReceipt (Steps 4+ need a tenant selected)
      if (!element && tourKey === 'Home_CreateReceipt' && currentStep >= 3) {
        const firstTenantBtn = getVisibleElement('[data-tour="tenant-selector"] button');
        if (firstTenantBtn) {
          firstTenantBtn.click(); // Auto-select to demonstrate
          setTimeout(() => {
            const newElement = getVisibleElement(currentTourStep.selector);
            if (newElement) {
              setHighlightedElement(newElement);
              setElementRect(newElement.getBoundingClientRect());
              newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              setHighlightedElement(null);
              setElementRect(null);
            }
          }, 200);
          return;
        }
      }

      if (element) {
        setHighlightedElement(element);
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setHighlightedElement(null);
        setElementRect(null);
      }
    };

    findElement();
    const timer = setTimeout(findElement, 250); // wait a bit longer for layouts to settle
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [currentStep, isOpen, currentTourStep, currentPage, currentTab, tourKey, highlightedElement]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  // Don't show if not open, on Settings page, or no tour steps
  if (!isOpen || currentPage === 'Settings' || tourSteps.length === 0 || !currentTourStep) return null;

  // Calculate tooltip position
  const isElementMissing = !elementRect;
  
  let tooltipTop = window.innerHeight / 2 - 100;
  if (!isElementMissing) {
    const spaceBelow = window.innerHeight - elementRect.bottom;
    const spaceAbove = elementRect.top;
    
    // Prefer placing below, but if not enough space and more space above, place above
    if (spaceBelow < 250 && spaceAbove > 250) {
      tooltipTop = elementRect.top - 200; // approximate height + padding
    } else {
      tooltipTop = elementRect.bottom + 20;
    }
    
    // Final clamp to keep it on screen
    tooltipTop = Math.max(20, Math.min(tooltipTop, window.innerHeight - 250));
  }

  return (
    <>
      {/* Global Overlay (Only if spotlight is missing to avoid double darkening) */}
      {isElementMissing && (
        <div className="fixed inset-0 bg-black/50 z-[9990] pointer-events-none" />
      )}

      {/* Spotlight - highlight the element (provides its own darkness via box-shadow) */}
      {!isElementMissing && (
        <div
          className="fixed z-[9990] pointer-events-none"
          style={{
            left: `${elementRect.left - 4}px`,
            top: `${elementRect.top - 4}px`,
            width: `${elementRect.width + 8}px`,
            height: `${elementRect.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            borderRadius: '8px',
            border: '2px solid #3B82F6',
            animation: 'tourPulse 2s ease-in-out infinite'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[9999] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 sm:p-6 w-[90%] max-w-sm border border-gray-100/50 backdrop-blur-xl"
        style={{
          left: '50%',
          top: `${tooltipTop}px`,
          transform: 'translateX(-50%)',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="flex items-start justify-between mb-4 relative">
          <h3 className="font-bold text-gray-900 text-lg sm:text-xl leading-tight pr-8">{currentTourStep.title}</h3>
        </div>

        <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">{currentTourStep.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:active:scale-100 hover:bg-gray-100 text-gray-700"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            Back
          </button>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              STEP
            </span>
            <span className="text-sm font-bold text-gray-900 bg-gray-100/80 px-2.5 py-0.5 rounded-full">
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>

          {currentStep === tourSteps.length - 1 ? (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20"
            >
              Close
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all active:scale-95 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              Next
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        @keyframes tourPulse {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 2px #3B82F6; }
          50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 0 4px #3B82F6; }
        }
      `}</style>
    </>
  );
}