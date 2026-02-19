import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

const TUTORIALS = {
  tenants: {
    title: "Tenant Management",
    steps: [
      { target: '[data-tutorial="tenant-header"]', title: "Tenant List", description: "This is your main tenant dashboard. Here you can see all tenants with their IDs, names, addresses, and current account balances." },
      { target: '[data-tutorial="btn-add-tenant"]', title: "Add a New Tenant", description: "Click this button to add a new tenant. You'll enter their name, address, rent amount, weekly payments, and RAS details." },
      { target: '[data-tutorial="btn-import"]', title: "Import from File", description: "Need to add many tenants at once? Upload a CSV or Excel file to bulk-import tenant data automatically." },
      { target: '[data-tutorial="btn-export"]', title: "Export to PDF", description: "Generate a professional PDF document with the full list of all your tenants for printing or sharing." },
      { target: '[data-tutorial="tenant-actions"]', title: "Tenant Actions", description: "Each tenant has action buttons:\n• Profile — view full details and history\n• Select — choose for receipt creation\n• Edit — update information\n• Delete — remove permanently" },
    ]
  },
  receipt: {
    title: "Create Receipt",
    steps: [
      { target: '[data-tutorial="receipt-modes"]', title: "Manual & Automatic Modes", description: "Two ways to create receipts:\n• Manual — enter transactions by hand\n• Automatic — upload a bank statement PDF to auto-detect payments" },
      { target: '[data-tutorial="receipt-tenant-select"]', title: "Select a Tenant", description: "Choose which tenant to create a receipt for. Once selected, their details appear and you can set the statement period." },
      { target: '[data-tutorial="receipt-transactions"]', title: "Weekly Transactions", description: "Add one row per week with rent due, tenant payment, and RAS amount. Mark each as received or not." },
      { target: '[data-tutorial="receipt-balance"]', title: "Balance Preview", description: "See the calculated final balance in real-time — previous debt, credit, rent, payments, and RAS amounts." },
      { target: '[data-tutorial="receipt-generate"]', title: "Generate & Print", description: "Generate the receipt PDF. You can save it to the cloud for history or just print directly." },
    ]
  },
  history: {
    title: "Receipt History",
    steps: [
      { target: '[data-tutorial="history-header"]', title: "All Saved Receipts", description: "Every receipt you've saved is listed here, sorted by date with the most recent on top." },
      { target: '[data-tutorial="history-filter"]', title: "Filter by Tenant", description: "Use the dropdown to show receipts for a specific tenant only." },
      { target: '[data-tutorial="history-actions"]', title: "Receipt Actions", description: "For each receipt:\n• Print — re-open as PDF for printing\n• Delete — permanently remove from cloud" },
    ]
  },
  settings: {
    title: "Settings",
    steps: [
      { target: '[data-tutorial="settings-org"]', title: "Receipt Settings", description: "Configure your organization name, receipt title, contact phone, and system name. These appear on all printed receipts." },
      { target: '[data-tutorial="settings-appearance"]', title: "Appearance", description: "Switch between light and dark mode, and adjust text size to your preference." },
      { target: '[data-tutorial="settings-save"]', title: "Save & Reset", description: "Save your changes or reset everything back to defaults." },
      { target: '[data-tutorial="settings-danger"]', title: "Danger Zone", description: "Permanently delete your account and ALL data. This cannot be undone!" },
    ]
  }
};

const SESSION_KEY = 'svp_tutorial_shown_tabs';

export default function TutorialGuide({ activeTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shouldBlink, setShouldBlink] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);
  const [elementFound, setElementFound] = useState(true);
  const tooltipRef = useRef(null);

  const tutorial = TUTORIALS[activeTab] || TUTORIALS.tenants;
  const currentStepData = tutorial.steps[currentStep];

  useEffect(() => {
    setIsOpen(false);
    setCurrentStep(0);
    setHighlightRect(null);
  }, [activeTab]);

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

  const scrollToElement = useCallback((el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vH = window.innerHeight;
    if (rect.top < 100 || rect.bottom > vH - 200) {
      const y = window.scrollY + rect.top - vH * 0.3;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, []);

  const updateHighlight = useCallback(() => {
    if (!isOpen) { setHighlightRect(null); return; }
    const step = tutorial.steps[currentStep];
    if (!step?.target) { setHighlightRect(null); setElementFound(false); return; }
    const el = document.querySelector(step.target);
    if (el) {
      const r = el.getBoundingClientRect();
      setHighlightRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
      setElementFound(true);
    } else {
      setHighlightRect(null);
      setElementFound(false);
    }
  }, [isOpen, currentStep, tutorial]);

  useEffect(() => {
    if (!isOpen) return;
    const step = tutorial.steps[currentStep];
    if (!step?.target) { updateHighlight(); return; }
    const el = document.querySelector(step.target);
    if (el) scrollToElement(el);
    updateHighlight();
    const t1 = setTimeout(updateHighlight, 350);
    const t2 = setTimeout(updateHighlight, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isOpen, currentStep, tutorial, scrollToElement, updateHighlight]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = () => updateHighlight();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler, { passive: true });
    return () => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler); };
  }, [isOpen, updateHighlight]);

  const handleOpen = () => { setIsOpen(true); setCurrentStep(0); markTabShown(); };
  const handleClose = () => { setIsOpen(false); setCurrentStep(0); setHighlightRect(null); };
  const nextStep = (e) => { e.stopPropagation(); if (currentStep < tutorial.steps.length - 1) setCurrentStep(s => s + 1); else handleClose(); };
  const prevStep = (e) => { e.stopPropagation(); if (currentStep > 0) setCurrentStep(s => s - 1); };

  const getTooltipPosition = () => {
    const vW = window.innerWidth;
    const vH = window.innerHeight;

    if (vW < 640) {
      return { position: 'fixed', bottom: 72, left: 8, right: 8, width: 'auto', maxHeight: '45vh' };
    }

    const tooltipW = Math.min(380, vW - 24);

    if (!highlightRect || !elementFound) {
      return { position: 'fixed', top: 80, left: (vW - tooltipW) / 2, width: tooltipW, maxHeight: vH - 160 };
    }

    let left = highlightRect.left;
    if (left + tooltipW > vW - 12) left = vW - tooltipW - 12;
    if (left < 12) left = 12;

    const gap = 14;
    const hlBottom = highlightRect.top + highlightRect.height;
    const spaceBelow = vH - hlBottom - gap;
    const spaceAbove = highlightRect.top - gap;

    if (spaceBelow >= 150) {
      return { position: 'fixed', top: hlBottom + gap, left, width: tooltipW, maxHeight: Math.min(spaceBelow, 380) };
    }
    if (spaceAbove >= 150) {
      const h = Math.min(spaceAbove, 380);
      return { position: 'fixed', top: highlightRect.top - gap - h, left, width: tooltipW, maxHeight: h };
    }
    return { position: 'fixed', top: 12, left, width: tooltipW, maxHeight: vH - 24 };
  };

  const tooltipPos = isOpen ? getTooltipPosition() : {};

  return (
    <>
      {!isOpen && (
        <motion.button
          onClick={handleOpen}
          className="fixed top-3 right-3 z-[9999] sm:top-[18px] sm:right-5 flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 border-blue-500/60 bg-white/90 dark:bg-gray-800/90 text-blue-600 dark:text-blue-400 shadow-md hover:shadow-lg hover:border-blue-500 backdrop-blur-sm"
          animate={{ opacity: shouldBlink ? [1, 0.15, 1, 0.15, 1, 1, 1, 1] : 1 }}
          transition={{ opacity: shouldBlink ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0.4 } }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Open Tutorial"
        >
          <span className="text-sm font-bold">?</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9998]">
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <defs>
                <mask id="tut-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {highlightRect && (
                    <rect x={highlightRect.left} y={highlightRect.top} width={highlightRect.width} height={highlightRect.height} rx="8" fill="black" />
                  )}
                </mask>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.45)" mask="url(#tut-mask)" />
            </svg>

            {highlightRect && elementFound && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="fixed rounded-lg border-2 border-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
                style={{ top: highlightRect.top, left: highlightRect.left, width: highlightRect.width, height: highlightRect.height, pointerEvents: 'none' }}
              />
            )}

            <div className="absolute inset-0" onClick={handleClose} />

            <motion.div
              ref={tooltipRef}
              key={`${activeTab}-${currentStep}`}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
              style={{ ...tooltipPos, zIndex: 9999, pointerEvents: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-white/80" />
                  <span className="text-white text-sm font-medium">{tutorial.title}</span>
                  <span className="text-white/50 text-xs ml-1">({currentStep + 1}/{tutorial.steps.length})</span>
                </div>
                <button onClick={handleClose} className="text-white/60 hover:text-white p-1 -mr-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 py-3 overflow-y-auto flex-1 min-h-0">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300 shrink-0 mt-0.5">
                    {currentStep + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">{currentStepData.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-1.5 whitespace-pre-line">{currentStepData.description}</p>
                    {!elementFound && (
                      <p className="text-xs text-amber-500 mt-2 italic">↳ This element is not visible right now. You may need to select a tenant first.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2.5 flex items-center justify-between shrink-0">
                <div className="flex gap-1.5">
                  {tutorial.steps.map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentStep ? 'bg-blue-500 scale-110' : i < currentStep ? 'bg-blue-300 dark:bg-blue-700' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="ghost" size="sm" onClick={prevStep} className="h-9 px-3 text-sm">
                      <ChevronLeft className="w-4 h-4 mr-0.5" /> Back
                    </Button>
                  )}
                  <Button size="sm" onClick={nextStep} className="h-9 px-5 text-sm bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                    {currentStep < tutorial.steps.length - 1 ? (<>Next <ChevronRight className="w-4 h-4 ml-0.5" /></>) : 'Done ✓'}
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