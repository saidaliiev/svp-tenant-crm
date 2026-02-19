import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
const TOOLTIP_W = 340;
const PAD = 12;
const GAP = 16;

export default function TutorialGuide({ activeTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shouldBlink, setShouldBlink] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);
  const [elementFound, setElementFound] = useState(true);
  const overlayRef = useRef(null);

  const tutorial = TUTORIALS[activeTab] || TUTORIALS.tenants;
  const totalSteps = tutorial.steps.length;
  const currentStepData = tutorial.steps[currentStep];

  // Reset on tab change
  useEffect(() => {
    setIsOpen(false);
    setCurrentStep(0);
    setHighlightRect(null);
  }, [activeTab]);

  // Blink logic
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

  // Measure target element
  const measureTarget = useCallback(() => {
    if (!isOpen) { setHighlightRect(null); return; }
    const step = tutorial.steps[currentStep];
    if (!step?.target) { setHighlightRect(null); setElementFound(false); return; }
    const el = document.querySelector(step.target);
    if (el) {
      const r = el.getBoundingClientRect();
      setHighlightRect({
        top: r.top - 8,
        left: r.left - 8,
        width: r.width + 16,
        height: r.height + 16,
        // raw element center for positioning
        elCenterY: r.top + r.height / 2,
        elRight: r.right,
        elLeft: r.left,
        elTop: r.top,
        elBottom: r.bottom,
      });
      setElementFound(true);
    } else {
      setHighlightRect(null);
      setElementFound(false);
    }
  }, [isOpen, currentStep, tutorial]);

  // Scroll target into view + measure
  useEffect(() => {
    if (!isOpen) return;
    const step = tutorial.steps[currentStep];
    if (!step?.target) { measureTarget(); return; }
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const vH = window.innerHeight;
      if (rect.top < 80 || rect.bottom > vH - 120) {
        const y = window.scrollY + rect.top - vH * 0.35;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
    measureTarget();
    const t1 = setTimeout(measureTarget, 300);
    const t2 = setTimeout(measureTarget, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isOpen, currentStep, tutorial, measureTarget]);

  // Re-measure on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const handler = () => measureTarget();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler, { passive: true });
    return () => { window.removeEventListener('scroll', handler); window.removeEventListener('resize', handler); };
  }, [isOpen, measureTarget]);

  const handleOpen = () => { setIsOpen(true); setCurrentStep(0); markTabShown(); };
  const handleClose = () => { setIsOpen(false); setCurrentStep(0); setHighlightRect(null); };
  const nextStep = (e) => { e.stopPropagation(); if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1); else handleClose(); };
  const prevStep = (e) => { e.stopPropagation(); if (currentStep > 0) setCurrentStep(s => s - 1); };

  // Compute tooltip style — tries: right of element, left, below, above, then center
  const tooltipStyle = useMemo(() => {
    const vW = window.innerWidth;
    const vH = window.innerHeight;
    const isMobile = vW < 640;

    // Mobile: bottom panel
    if (isMobile) {
      return { position: 'fixed', bottom: 16, left: 12, right: 12, maxHeight: '50vh' };
    }

    const tw = Math.min(TOOLTIP_W, vW - PAD * 2);

    // No element found — center
    if (!highlightRect || !elementFound) {
      return { position: 'fixed', top: 100, left: (vW - tw) / 2, width: tw };
    }

    const hlCenterY = highlightRect.top + highlightRect.height / 2;
    const estimatedTooltipH = 220;

    // Try RIGHT of element
    const rightX = highlightRect.left + highlightRect.width + GAP;
    if (rightX + tw + PAD <= vW) {
      let topY = hlCenterY - estimatedTooltipH / 2;
      topY = Math.max(PAD, Math.min(topY, vH - estimatedTooltipH - PAD));
      return { position: 'fixed', top: topY, left: rightX, width: tw };
    }

    // Try LEFT of element
    const leftX = highlightRect.left - GAP - tw;
    if (leftX >= PAD) {
      let topY = hlCenterY - estimatedTooltipH / 2;
      topY = Math.max(PAD, Math.min(topY, vH - estimatedTooltipH - PAD));
      return { position: 'fixed', top: topY, left: leftX, width: tw };
    }

    // Try BELOW element
    const belowY = highlightRect.top + highlightRect.height + GAP;
    if (belowY + estimatedTooltipH + PAD <= vH) {
      let leftPos = highlightRect.left;
      leftPos = Math.max(PAD, Math.min(leftPos, vW - tw - PAD));
      return { position: 'fixed', top: belowY, left: leftPos, width: tw };
    }

    // Try ABOVE element
    const aboveY = highlightRect.top - GAP - estimatedTooltipH;
    if (aboveY >= PAD) {
      let leftPos = highlightRect.left;
      leftPos = Math.max(PAD, Math.min(leftPos, vW - tw - PAD));
      return { position: 'fixed', top: aboveY, left: leftPos, width: tw };
    }

    // Fallback: center of screen
    return { position: 'fixed', top: (vH - estimatedTooltipH) / 2, left: (vW - tw) / 2, width: tw };
  }, [highlightRect, elementFound]);

  return (
    <>
      {/* Trigger button */}
      {!isOpen && (
        <motion.button
          onClick={handleOpen}
          className="fixed top-3 right-3 z-[9999] sm:top-[18px] sm:right-5 flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 border-blue-500/60 bg-white/95 dark:bg-gray-900/95 text-blue-600 dark:text-blue-400 shadow-lg hover:shadow-xl hover:border-blue-500 backdrop-blur-sm transition-shadow"
          animate={{ opacity: shouldBlink ? [1, 0.15, 1, 0.15, 1, 1, 1, 1] : 1 }}
          transition={{ opacity: shouldBlink ? { duration: 2, repeat: Infinity, ease: "linear" } : { duration: 0.4 } }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Open Tutorial"
        >
          <span className="text-sm font-bold">?</span>
        </motion.button>
      )}

      {/* Tutorial overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998]"
          >
            {/* SVG mask overlay */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <defs>
                <mask id="tut-cutout">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {highlightRect && elementFound && (
                    <rect
                      x={highlightRect.left}
                      y={highlightRect.top}
                      width={highlightRect.width}
                      height={highlightRect.height}
                      rx="10"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                x="0" y="0" width="100%" height="100%"
                fill="rgba(0,0,0,0.5)"
                mask="url(#tut-cutout)"
              />
            </svg>

            {/* Highlight border */}
            {highlightRect && elementFound && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed rounded-[10px] ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent"
                style={{
                  top: highlightRect.top,
                  left: highlightRect.left,
                  width: highlightRect.width,
                  height: highlightRect.height,
                  pointerEvents: 'none',
                  boxShadow: '0 0 0 4px rgba(59,130,246,0.2), 0 0 20px rgba(59,130,246,0.15)',
                }}
              />
            )}

            {/* Click to close */}
            <div className="absolute inset-0" onClick={handleClose} />

            {/* Tooltip card */}
            <motion.div
              key={`${activeTab}-${currentStep}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md border"
              style={{
                ...tooltipStyle,
                zIndex: 9999,
                pointerEvents: 'auto',
                background: 'var(--tutorial-bg, rgba(255,255,255,0.97))',
                borderColor: 'var(--tutorial-border, rgba(226,232,240,0.8))',
              }}
              onClick={e => e.stopPropagation()}
            >
              <style>{`
                .dark { --tutorial-bg: rgba(30,34,44,0.97); --tutorial-border: rgba(55,65,81,0.7); }
                :root { --tutorial-bg: rgba(255,255,255,0.97); --tutorial-border: rgba(226,232,240,0.8); }
              `}</style>

              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-white/80" />
                  <span className="text-white text-sm font-semibold">{tutorial.title}</span>
                  <span className="text-white/40 text-xs ml-1">{currentStep + 1}/{totalSteps}</span>
                </div>
                <button onClick={handleClose} className="text-white/50 hover:text-white transition-colors p-1 -mr-1 rounded-md hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-4 py-3.5 overflow-y-auto flex-1 min-h-0">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0 mt-0.5">
                    {currentStep + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-[15px] leading-snug">
                      {currentStepData.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-[13px] leading-relaxed mt-1.5 whitespace-pre-line">
                      {currentStepData.description}
                    </p>
                    {!elementFound && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic flex items-center gap-1">
                        <span>↳</span> This element isn't visible now. You may need to scroll or select a tenant first.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200/60 dark:border-gray-700/60 px-4 py-2.5 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
                {/* Step dots */}
                <div className="flex gap-1.5">
                  {tutorial.steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? 'w-5 bg-blue-500'
                          : i < currentStep
                            ? 'w-2 bg-blue-400/50 dark:bg-blue-600/50'
                            : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Nav buttons */}
                <div className="flex gap-1.5">
                  {currentStep > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={prevStep}
                      className="h-8 px-2.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={nextStep}
                    className="h-8 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm"
                  >
                    {currentStep < totalSteps - 1
                      ? (<>Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" /></>)
                      : 'Done ✓'}
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