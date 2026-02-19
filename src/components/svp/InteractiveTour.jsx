import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const TOUR_CONFIG = {
  Home: [
    {
      selector: '[data-tour="tab-tenants"]',
      title: '👥 Tenant Management',
      description: 'Manage all your tenants. Add new tenants, edit their details, track payments, and view their current balance.'
    },
    {
      selector: '[data-tour="tab-receipt"]',
      title: '📄 Create Receipt',
      description: 'Generate rent statements for tenants. Track payments, RAS amounts, and calculate final balances.'
    },
    {
      selector: '[data-tour="tab-history"]',
      title: '📋 Receipt History',
      description: 'View all previously generated receipts and statements. Download or delete as needed.'
    }
  ],
  Home_TenantManagement: [
    {
      selector: '[data-tour="btn-add-tenant"]',
      title: '➕ Add New Tenant',
      description: 'Click to add a new tenant to the system. Fill in their details: name, address, phone, rent amount, and move-in date.'
    },
    {
      selector: '[data-tour="btn-import"]',
      title: '📥 Import CSV/Excel',
      description: 'Bulk import multiple tenants from a CSV or Excel file. Great for migrating existing tenant data.'
    },
    {
      selector: '[data-tour="btn-export"]',
      title: '📤 Export to PDF',
      description: 'Generate a professional PDF report with all tenant information and current balances.'
    },
    {
      selector: '[data-tour="tenant-table"]',
      title: '📋 Tenant Table',
      description: 'View all your tenants with their ID, name, address, and current balance. Use the action buttons to manage each tenant.'
    },
    {
      selector: '[data-tour="btn-profile"]',
      title: '👤 View Profile',
      description: 'Click to view detailed tenant information including full history and notes.'
    },
    {
      selector: '[data-tour="btn-select"]',
      title: '✅ Select Tenant',
      description: 'Quick select a tenant to create a receipt for them. Takes you directly to the Create Receipt tab.'
    },
    {
      selector: '[data-tour="btn-edit"]',
      title: '✏️ Edit Tenant',
      description: 'Update tenant details like phone, address, rent amount, or any other information.'
    },
    {
      selector: '[data-tour="btn-delete"]',
      title: '🗑️ Delete Tenant',
      description: 'Permanently remove a tenant from the system. Use with caution - this action cannot be undone.'
    }
  ],
  Home_CreateReceipt: [
    {
      selector: '[data-tour="tenant-selector"]',
      title: '👥 Select Tenant',
      description: 'Choose which tenant you\'re creating a receipt for. Click on any tenant to select them.'
    },
    {
      selector: '[data-tour="manual-mode"]',
      title: '✍️ Manual Mode',
      description: 'Manually enter all payment data, transaction details, and calculate balances. Use this for custom statements.'
    },
    {
      selector: '[data-tour="automatic-mode"]',
      title: '🤖 Automatic Mode',
      description: 'Upload a bank statement and automatically detect payments. The system will match payments to tenants for you.'
    },
    {
      selector: '[data-tour="period-dates"]',
      title: '📅 Period Dates',
      description: 'Set the start and end dates for the statement period. This defines the billing period for the rent statement.'
    },
    {
      selector: '[data-tour="starting-debt"]',
      title: '💰 Starting Debt/Credit',
      description: 'Enter the previous balance. Red numbers = debt, green = credit. Toggle "Include" to add/subtract from final balance.'
    },
    {
      selector: '[data-tour="add-transaction"]',
      title: '➕ Add Transaction',
      description: 'Add payment records: rent due, tenant payments, and RAS amounts. Each row represents one week or period.'
    },
    {
      selector: '[data-tour="balance-preview"]',
      title: '📊 Balance Preview',
      description: 'Real-time calculation showing final balance based on all entries. Red = debt, green = credit.'
    },
    {
      selector: '[data-tour="receipt-notes"]',
      title: '📝 Notes',
      description: 'Add any additional notes that will appear on the printed receipt. Optional but useful for special instructions.'
    }
  ],
  Home_ReceiptHistory: [
    {
      selector: '[data-tour="tenant-filter"]',
      title: '🔍 Tenant Filter',
      description: 'Filter receipts by tenant. Select "All Tenants" to see receipts for everyone, or choose a specific tenant.'
    },
    {
      selector: '[data-tour="receipt-row"]',
      title: '📄 Receipt Row',
      description: 'Each row shows a receipt with tenant name, receipt date, period covered, and final balance.'
    },
    {
      selector: '[data-tour="btn-view-print"]',
      title: '🖨️ View/Print',
      description: 'Open the receipt to view it on screen or print it directly. You can also save as PDF.'
    },
    {
      selector: '[data-tour="btn-delete-receipt"]',
      title: '🗑️ Delete Receipt',
      description: 'Remove a receipt from history. A confirmation dialog will appear before deletion.'
    }
  ]
};

export default function InteractiveTour({ isOpen, onClose, currentPage, currentTab }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [showTabsTour, setShowTabsTour] = useState(true);

  // Determine which tour to show
  let tourKey = currentPage;
  if (currentPage === 'Home' && !showTabsTour && currentTab) {
    tourKey = `Home_${currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace(/([A-Z])/g, m => m)}`;
    if (currentTab === 'tenants') tourKey = 'Home_TenantManagement';
    if (currentTab === 'receipt') tourKey = 'Home_CreateReceipt';
    if (currentTab === 'history') tourKey = 'Home_ReceiptHistory';
  }

  const tourSteps = TOUR_CONFIG[tourKey] || TOUR_CONFIG[currentPage] || [];
  const currentTourStep = tourSteps[currentStep];

  useEffect(() => {
    if (!isOpen || !currentTourStep) return;

    const element = document.querySelector(currentTourStep.selector);
    setHighlightedElement(element);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isOpen, currentTourStep]);

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

  if (!isOpen || !currentTourStep) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 pointer-events-none" />

      {/* Spotlight on Element */}
      {highlightedElement && (
        <div
          className="fixed z-41 pointer-events-none"
          style={{
            left: highlightedElement.getBoundingClientRect().left - 8,
            top: highlightedElement.getBoundingClientRect().top - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            boxShadow: '0 0 0 4000px rgba(0, 0, 0, 0.4)',
            borderRadius: '8px',
            border: '2px solid rgb(59, 130, 246)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl p-5 max-w-sm"
        style={{
          left: '50%',
          top: highlightedElement
            ? Math.min(highlightedElement.getBoundingClientRect().bottom + 20, window.innerHeight - 250)
            : '50%',
          transform: 'translateX(-50%)',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-lg">{currentTourStep.title}</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition"
            aria-label="Close tour"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-4">{currentTourStep.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm rounded transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-xs text-gray-500 font-medium">
            {currentStep + 1} / {tourSteps.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentStep === tourSteps.length - 1}
            className="flex items-center gap-1 px-3 py-2 text-sm rounded transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}