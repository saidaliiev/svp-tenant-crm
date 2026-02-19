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
  ]
};

export default function InteractiveTour({ isOpen, onClose, currentPage }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);

  const tourSteps = TOUR_CONFIG[currentPage] || [];
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