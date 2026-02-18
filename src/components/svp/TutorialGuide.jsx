import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const TUTORIALS = {
  tenants: {
    title: "Tenant Management",
    steps: [
      { target: '[data-tutorial="tenant-header"]', title: "Tenant List", description: "View all your tenants — their IDs, names, addresses, and current balances." },
      { target: '[data-tutorial="btn-add-tenant"]', title: "Add Tenant", description: "Click here to add a new tenant with their personal and payment details." },
      { target: '[data-tutorial="btn-import"]', title: "Import Data", description: "Bulk-import tenants from a CSV or Excel file." },
      { target: '[data-tutorial="btn-export"]', title: "Export to PDF", description: "Download a PDF list of all tenants for printing or sharing." },
      { target: '[data-tutorial="tenant-actions"]', title: "Tenant Actions", description: "For each tenant: view Profile, Select for receipt, Edit details, or Delete." },
    ]
  },
  receipt: {
    title: "Create Receipt",
    steps: [
      { target: '[data-tutorial="receipt-modes"]', title: "Manual & Automatic", description: "Switch between Manual Mode (enter by hand) and Automatic Mode (upload bank statement)." },
      { target: '[data-tutorial="receipt-tenant-select"]', title: "Select Tenant", description: "Pick which tenant to create a receipt for." },
      { target: '[data-tutorial="receipt-transactions"]', title: "Transactions", description: "Add weekly transactions — rent due, tenant payments, and RAS amounts." },
      { target: '[data-tutorial="receipt-balance"]', title: "Balance Preview", description: "See the calculated final balance before generating the receipt." },
      { target: '[data-tutorial="receipt-generate"]', title: "Generate Receipt", description: "Print the receipt and optionally save it to the cloud." },
    ]
  },
  history: {
    title: "Receipt History",
    steps: [
      { target: '[data-tutorial="history-header"]', title: "All Receipts", description: "View all previously generated and saved receipts." },
      { target: '[data-tutorial="history-filter"]', title: "Filter by Tenant", description: "Use this dropdown to show receipts for a specific tenant." },
      { target: '[data-tutorial="history-actions"]', title: "Actions", description: "Reprint any receipt as PDF or delete it permanently." },
    ]
  },
  settings: {
    title: "Settings",
    steps: [
      { target: '[data-tutorial="settings-org"]', title: "Organization Details", description: "Customize your organization name, receipt title, and contact info." },
      { target: '[data-tutorial="settings-save"]', title: "Save & Reset", description: "Save your changes or reset everything back to defaults." },
      { target: '[data-tutorial="settings-danger"]', title: "Danger Zone", description: "Permanently delete your account and all data. Use with extreme caution!" },
    ]
  }
};

const SESSION_KEY = 'svp_tutorial_shown_tabs';

export default function TutorialGuide({ activeTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shouldBlink, setShouldBlink] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);
  const overlayRef = useRef(null);

  const tutorial = TUTORIALS[activeTab] || TUTORIALS.tenants;

  // Check if should blink for this tab
  useEffect(() => {
    const shownTabs = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    if (!shownTabs.includes(activeTab)) {
      setShouldBlink(true);
    } else {
      setShouldBlink(false);
    }
  }, [activeTab]);

  const markTabShown = useCallback(() => {
    const shownTabs = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    if (!shownTabs.includes(activeTab)) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...shownTabs, activeTab]));
    }
    setShouldBlink(false);
  }, [activeTab]);

  const updateHighlight = useCallback(() => {
    if (!isOpen) { setHighlightRect(null); return; }
    const step = tutorial.steps[currentStep];
    if (!step?.target) { setHighlightRect(null); return; }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect({
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setHighlightRect(null);
    }
  }, [isOpen, currentStep, tutorial]);

  useEffect(() => {
    updateHighlight();
    if (isOpen) {
      const interval = setInterval(updateHighlight, 500);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentStep, updateHighlight]);

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentStep(0);
    markTabShown();
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(0);
    setHighlightRect(null);
  };

  const nextStep = () => {
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  // Calculate tooltip position based on highlighted element
  const getTooltipStyle = () => {
    if (!highlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const tooltipW = Math.min(360, viewportW - 32);
    const tooltipH = 200;
    
    // Try below the element
    if (highlightRect.top + highlightRect.height + tooltipH + 20 < viewportH) {
      return {
        top: highlightRect.top + highlightRect.height + 16,
        left: Math.max(16, Math.min(highlightRect.left, viewportW - tooltipW - 16)),
        maxWidth: tooltipW,
      };
    }
    // Try above
    if (highlightRect.top - tooltipH - 20 > 0) {
      return {
        top: highlightRect.top - tooltipH - 16,
        left: Math.max(16, Math.min(highlightRect.left, viewportW - tooltipW - 16)),
        maxWidth: tooltipW,
      };
    }
    // Fallback: center
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: tooltipW };
  };

  return (
    <>
      {/* Fixed Tutorial Button */}
      <motion.button
        onClick={handleOpen}
        className="fixed top-3 right-3 z-[100] w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={shouldBlink ? { opacity: [1, 0.2, 1, 0.2, 1, 1, 1, 1] } : { opacity: 1 }}
        transition={shouldBlink ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
        title="Tutorial"
      >
        <GraduationCap className="w-5 h-5" />
      </motion.button>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90]"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Dark overlay with cutout */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <defs>
                <mask id="tutorial-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {highlightRect && (
                    <rect
                      x={highlightRect.left}
                      y={highlightRect.top}
                      width={highlightRect.width}
                      height={highlightRect.height}
                      rx="8"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                x="0" y="0" width="100%" height="100%"
                fill="rgba(0,0,0,0.5)"
                mask="url(#tutorial-mask)"
              />
            </svg>

            {/* Highlight border */}
            {highlightRect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute rounded-lg border-2 border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Click-through backdrop to close */}
            <div className="absolute inset-0" onClick={handleClose} />

            {/* Tooltip Card */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{ ...getTooltipStyle(), pointerEvents: 'auto', zIndex: 95 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header bar */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-white/80" />
                  <span className="text-white text-xs font-medium">{tutorial.title}</span>
                </div>
                <button onClick={handleClose} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
                    {currentStep + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{tutorial.steps[currentStep].title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-1">{tutorial.steps[currentStep].description}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between">
                {/* Step dots */}
                <div className="flex gap-1">
                  {tutorial.steps.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentStep ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {currentStep > 0 && (
                    <Button variant="ghost" size="sm" onClick={prevStep} className="h-7 px-2 text-xs">
                      <ChevronLeft className="w-3 h-3 mr-0.5" /> Back
                    </Button>
                  )}
                  <Button size="sm" onClick={nextStep} className="h-7 px-3 text-xs bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    {currentStep < tutorial.steps.length - 1 ? (
                      <>Next <ChevronRight className="w-3 h-3 ml-0.5" /></>
                    ) : 'Done'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}