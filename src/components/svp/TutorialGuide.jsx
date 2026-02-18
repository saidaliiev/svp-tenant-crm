import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
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
      { target: '[data-tutorial="receipt-modes"]', title: "Manual & Automatic", description: "Switch between Manual Mode (enter transactions by hand) and Automatic Mode (upload a bank statement PDF to auto-detect payments)." },
      { target: '[data-tutorial="receipt-tenant-select"]', title: "Select Tenant", description: "Pick which tenant to create a receipt for. Once selected, you'll see their details and can set the period dates." },
      { 
        target: '[data-tutorial="receipt-transactions"]', 
        title: "Transactions", 
        description: "Add weekly transactions — rent due, tenant payments, and RAS amounts. Each row represents one week.",
        fallbackPreview: {
          title: "Example: Weekly Transactions",
          rows: [
            { label: "Week 1 — 01 Jan", rent: "€143.40", tenant: "€40.00 ✓", ras: "€103.40 ✓" },
            { label: "Week 2 — 08 Jan", rent: "€143.40", tenant: "€40.00 ✓", ras: "€103.40 ✓" },
            { label: "Week 3 — 15 Jan", rent: "€143.40", tenant: "€40.00 ✗", ras: "€103.40 ✓" },
          ]
        }
      },
      { 
        target: '[data-tutorial="receipt-balance"]', 
        title: "Balance Preview", 
        description: "See the calculated final balance before generating the receipt.",
        fallbackPreview: {
          title: "Example: Balance Preview",
          rows: [
            { label: "Previous Debt:", value: "€95.00" },
            { label: "Total Rent Due:", value: "€430.20" },
            { label: "– Tenant Payments:", value: "€80.00", color: "green" },
            { label: "RAS Received:", value: "€310.20", color: "blue" },
            { label: "= Final Balance:", value: "€135.00", color: "red", bold: true },
          ]
        }
      },
      { 
        target: '[data-tutorial="receipt-generate"]', 
        title: "Generate Receipt", 
        description: "Click to generate a PDF receipt. You can save it to the cloud for history tracking or just print it directly.",
      },
    ]
  },
  history: {
    title: "Receipt History",
    steps: [
      { target: '[data-tutorial="history-header"]', title: "All Receipts", description: "View all previously generated and saved receipts sorted by date." },
      { target: '[data-tutorial="history-filter"]', title: "Filter by Tenant", description: "Use this dropdown to show receipts for a specific tenant." },
      { target: '[data-tutorial="history-actions"]', title: "Actions", description: "Reprint any receipt as PDF or delete it permanently." },
    ]
  },
  settings: {
    title: "Settings",
    steps: [
      { target: '[data-tutorial="settings-org"]', title: "Organization Details", description: "Customize your organization name, receipt title, and contact info — these appear on printed receipts." },
      { target: '[data-tutorial="settings-save"]', title: "Save & Reset", description: "Save your changes or reset everything back to defaults." },
      { target: '[data-tutorial="settings-danger"]', title: "Danger Zone", description: "Permanently delete your account and all data. This cannot be undone!" },
    ]
  }
};

const SESSION_KEY = 'svp_tutorial_shown_tabs';

function FallbackPreview({ preview }) {
  if (!preview) return null;
  
  // Balance-style preview
  if (preview.rows[0]?.value) {
    return (
      <div className="mt-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{preview.title}</p>
        <div className="space-y-1">
          {preview.rows.map((row, i) => (
            <div key={i} className={`flex justify-between text-xs ${row.bold ? 'font-bold border-t border-slate-300 dark:border-slate-600 pt-1 mt-1' : ''}`}>
              <span className={`${row.color === 'green' ? 'text-green-600' : row.color === 'blue' ? 'text-blue-600' : row.color === 'red' ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}`}>{row.label}</span>
              <span className={`font-medium ${row.color === 'green' ? 'text-green-600' : row.color === 'blue' ? 'text-blue-600' : row.color === 'red' ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Transaction-style preview
  return (
    <div className="mt-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{preview.title}</p>
      <div className="space-y-1.5">
        {preview.rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <span className="text-slate-500 w-24 shrink-0">{row.label}</span>
            <span className="text-slate-700 dark:text-slate-300">Rent {row.rent}</span>
            <span className="text-green-600">Paid {row.tenant}</span>
            <span className="text-blue-600">RAS {row.ras}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TutorialGuide({ activeTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shouldBlink, setShouldBlink] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);
  const [elementFound, setElementFound] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const overlayRef = useRef(null);
  const lastScrollY = useRef(0);

  // Hide button when scrolled past 40% of the page
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) { setHidden(false); return; }
      const pct = window.scrollY / scrollable;
      setHidden(pct > 0.4);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tutorial = TUTORIALS[activeTab] || TUTORIALS.tenants;

  useEffect(() => {
    const shownTabs = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    if (!shownTabs.includes(activeTab)) {
      setShouldBlink(true);
      const timer = setTimeout(() => setShouldBlink(false), 5000);
      return () => clearTimeout(timer);
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
    if (!step?.target) { setHighlightRect(null); setElementFound(false); return; }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect({
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
      });
      setElementFound(true);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setHighlightRect(null);
      setElementFound(false);
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

  const getTooltipStyle = () => {
    if (!highlightRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const tooltipW = Math.min(380, viewportW - 32);
    const tooltipH = 240;
    
    if (highlightRect.top + highlightRect.height + tooltipH + 20 < viewportH) {
      return {
        top: highlightRect.top + highlightRect.height + 16,
        left: Math.max(16, Math.min(highlightRect.left, viewportW - tooltipW - 16)),
        maxWidth: tooltipW,
      };
    }
    if (highlightRect.top - tooltipH - 20 > 0) {
      return {
        top: highlightRect.top - tooltipH - 16,
        left: Math.max(16, Math.min(highlightRect.left, viewportW - tooltipW - 16)),
        maxWidth: tooltipW,
      };
    }
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: tooltipW };
  };

  const currentStepData = tutorial.steps[currentStep];
  const showFallback = !elementFound && currentStepData?.fallbackPreview;

  return (
    <>
      {/* Fixed Tutorial Button — always small circle with ?, hides after 40% scroll */}
      <motion.button
        onClick={handleOpen}
        className="fixed top-3 right-3 z-[100] flex items-center justify-center w-8 h-8 rounded-full border-2 border-blue-500 bg-white text-blue-600 shadow-sm hover:shadow-md"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          opacity: hidden ? 0 : (shouldBlink ? [1, 0.15, 1, 0.15, 1, 1, 1, 1] : 1),
          pointerEvents: hidden ? 'none' : 'auto',
        }}
        transition={{
          opacity: shouldBlink && !hidden ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0.3 },
        }}
        style={{ pointerEvents: hidden ? 'none' : 'auto' }}
        title="Open Tutorial"
      >
        <span className="text-sm font-bold">?</span>
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

            {/* Click backdrop to close */}
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
              {/* Header */}
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
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
                    {currentStep + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{currentStepData.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-1">{currentStepData.description}</p>
                    
                    {/* Show fallback preview if element not visible */}
                    {showFallback && (
                      <>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 italic">
                          ↳ Select a tenant first to see this in action. Here's an example:
                        </p>
                        <FallbackPreview preview={currentStepData.fallbackPreview} />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between">
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