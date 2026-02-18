import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

const TUTORIALS = {
  tenants: {
    title: "Tenant Management",
    steps: [
      {
        title: "Your Tenants at a Glance",
        description: "This is where you manage all your tenants. You can see their names, addresses, and current balances in one place."
      },
      {
        title: "Adding Tenants",
        description: "Click '+ Add' to create a new tenant. Fill in their details like name, address, rent amount, and RAS payment info."
      },
      {
        title: "Import & Export",
        description: "Use 'Import CSV/Excel' to bulk-add tenants from a file, or 'Export to PDF' to generate a printable list of all tenants."
      },
      {
        title: "Tenant Actions",
        description: "For each tenant, you can view their Profile, Select them to create a receipt, Edit their details, or Delete the record."
      },
      {
        title: "Payment Keywords",
        description: "Set up payment keywords for each tenant — these help the automatic payment detection match bank transactions to the right tenant."
      }
    ]
  },
  receipt: {
    title: "Create Receipt",
    steps: [
      {
        title: "Two Modes Available",
        description: "Switch between Manual Mode (enter transactions by hand) and Automatic Mode (upload a bank statement to auto-detect payments)."
      },
      {
        title: "Manual Mode",
        description: "Select a tenant, set the period dates, and add weekly transactions. The system will calculate the final balance automatically."
      },
      {
        title: "Automatic Mode",
        description: "Upload a bank statement PDF and the system will extract payments, match them to tenants using keywords, and fill in the transactions."
      },
      {
        title: "Smart Notes",
        description: "The receipt automatically generates personalized notes for each tenant based on their payment status and balance."
      },
      {
        title: "Save & Print",
        description: "When ready, click 'Generate Receipt' — you can save it to the cloud for history tracking, or just print it directly."
      }
    ]
  },
  history: {
    title: "Receipt History",
    steps: [
      {
        title: "All Receipts in One Place",
        description: "View all previously generated receipts. Each entry shows the tenant, period, and final balance."
      },
      {
        title: "Filter by Tenant",
        description: "Use the dropdown filter to quickly find receipts for a specific tenant."
      },
      {
        title: "Reprint or Delete",
        description: "Click on any receipt to reprint it as a PDF, or delete it if it's no longer needed."
      }
    ]
  },
  settings: {
    title: "Settings",
    steps: [
      {
        title: "Organization Details",
        description: "Customize your organization name, receipt title, contact phone, and system name — these appear on printed receipts."
      },
      {
        title: "Save & Reset",
        description: "Don't forget to save after making changes. You can always reset to defaults if needed."
      },
      {
        title: "Danger Zone",
        description: "The 'Delete Account' option permanently removes all your data. Use with caution — this cannot be undone!"
      }
    ]
  }
};

const SESSION_KEY = 'svp_tutorial_shown_tabs';

export default function TutorialGuide({ activeTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  const tutorial = TUTORIALS[activeTab] || TUTORIALS.tenants;

  // Check if tutorial prompt should show for this tab in this session
  useEffect(() => {
    const shownTabs = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    if (!shownTabs.includes(activeTab)) {
      setIsGlowing(true);
      const promptTimer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);

      const glowTimer = setTimeout(() => {
        if (!isOpen) setIsGlowing(false);
      }, 8000);

      return () => {
        clearTimeout(promptTimer);
        clearTimeout(glowTimer);
      };
    }
  }, [activeTab]);

  const handleOpenTutorial = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setShowPrompt(false);
    setIsGlowing(false);

    // Mark this tab as shown in session
    const shownTabs = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    if (!shownTabs.includes(activeTab)) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...shownTabs, activeTab]));
    }
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    setIsGlowing(false);
    const shownTabs = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
    if (!shownTabs.includes(activeTab)) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify([...shownTabs, activeTab]));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(0);
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

  return (
    <>
      {/* Floating Lightbulb Button */}
      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
        <AnimatePresence>
          {showPrompt && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-purple-100 dark:border-purple-800 px-4 py-3 flex items-center gap-3 max-w-[220px]"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Need a quick tour?</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Learn how to use this page</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={handleOpenTutorial}
                  className="text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2.5 py-1 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Sure!
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-1"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleOpenTutorial}
          className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isGlowing
              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-300/50 dark:shadow-yellow-500/30'
              : 'bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={isGlowing ? {
            boxShadow: [
              "0 0 0 0 rgba(251, 191, 36, 0.4)",
              "0 0 0 12px rgba(251, 191, 36, 0)",
              "0 0 0 0 rgba(251, 191, 36, 0.4)"
            ]
          } : {}}
          transition={isGlowing ? { duration: 2, repeat: Infinity } : {}}
        >
          <Lightbulb className={`w-5 h-5 ${isGlowing ? 'text-white' : 'text-amber-500'}`} />
          {isGlowing && (
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-5 relative">
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-5 h-5 text-yellow-300" />
                  <span className="text-white/80 text-sm font-medium">Tutorial</span>
                </div>
                <h2 className="text-white text-xl font-bold">{tutorial.title}</h2>
                {/* Step indicator dots */}
                <div className="flex gap-1.5 mt-3">
                  {tutorial.steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? 'bg-white w-6'
                          : i < currentStep
                          ? 'bg-white/60 w-3'
                          : 'bg-white/30 w-3'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300 shrink-0">
                        {currentStep + 1}
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
                        {tutorial.steps[currentStep].title}
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed ml-11">
                      {tutorial.steps[currentStep].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {currentStep + 1} of {tutorial.steps.length}
                </span>
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg"
                  >
                    {currentStep < tutorial.steps.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      'Got it!'
                    )}
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