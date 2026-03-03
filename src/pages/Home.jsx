import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home, FileText, History, Settings, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ClientManagement from '@/components/svp/ClientManagement';
import CreateReceipt from '@/components/svp/CreateReceipt';
import ReceiptHistory from '@/components/svp/ReceiptHistory';
import SettingsDrawer from '@/components/svp/SettingsDrawer';
import ToolsTab from '@/components/svp/ToolsTab';


const DEFAULT_SETTINGS = {
  organizationName: "Society of Saint Vincent de Paul",
  receiptTitle: "Monthly Rent Statement",
  contactPhone: "086 7856869",
  systemName: "Society of Saint Vincent de Paul, Carndonagh"
};

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'tenants';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  
  const queryClient = useQueryClient();

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'tenants';
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const params = { tab: newTab };
    // Preserve other params if needed, but for now just set tab
    setSearchParams(params);
  };

  // Fetch tenants from cloud
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list('-created_date'),
  });

  // Fetch statements from cloud
  const { data: statements = [], isLoading: statementsLoading } = useQuery({
    queryKey: ['statements'],
    queryFn: () => base44.entities.Statement.list('-created_date'),
  });

  // Load settings from localStorage (can be migrated later if needed)
  useEffect(() => {
    const savedSettings = localStorage.getItem('svp_settings');
    if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
  }, []);

  useEffect(() => {
    localStorage.setItem('svp_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSelectTenant = (tenantId) => {
    setSelectedTenantId(tenantId);
    setActiveTab("receipt");
    setSearchParams({ tab: 'receipt' });
  };

  const handleReceiptCreated = async (receipt) => {
    // Refresh statements
    queryClient.invalidateQueries(['statements']);
    // Update tenant's balance in cloud
    try {
      const tenant = tenants.find(t => t.id === receipt.clientId);
      if (tenant) {
        await base44.entities.Tenant.update(tenant.id, {
          currentBalance: receipt.finalBalance
        });
        queryClient.invalidateQueries(['tenants']);
      }
    } catch (err) {
      console.error('Error updating tenant balance:', err);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Desktop Tab Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="hidden sm:flex items-stretch gap-2 mb-4 sm:mb-6">
            <TabsList className="flex-1 grid grid-cols-4 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg dark:shadow-gray-950/30 rounded-lg sm:rounded-xl p-0.5 sm:p-1 h-auto select-none border-0 dark:border dark:border-gray-700/50">
              <TabsTrigger
                value="tenants"
                data-tour="tab-tenants"
                className="flex flex-row items-center gap-2 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-sm"
              >
                <Home className="w-4 h-4" />
                <span>Tenants</span>
              </TabsTrigger>
              <TabsTrigger
                value="receipt"
                data-tour="tab-receipt"
                className="flex flex-row items-center gap-2 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Create Receipt</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                data-tour="tab-history"
                className="flex flex-row items-center gap-2 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-sm"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger
                value="tools"
                className="flex flex-row items-center gap-2 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-sm"
              >
                <Wrench className="w-4 h-4" />
                <span>Tools</span>
              </TabsTrigger>
            </TabsList>
            {/* Settings Icon */}
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 sm:px-5 flex-shrink-0 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg dark:shadow-gray-950/30 border-0 dark:border dark:border-gray-700/50 text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="tenants" className="mt-0">
                <ClientManagement 
                  tenants={tenants}
                  tenantsLoading={tenantsLoading}
                  statements={statements}
                  onSelectTenant={handleSelectTenant}
                  settings={settings}
                />
              </TabsContent>

              <TabsContent value="receipt" className="mt-0">
                <CreateReceipt 
                  tenants={tenants}
                  statements={statements}
                  settings={settings}
                  selectedTenantId={selectedTenantId}
                  onReceiptCreated={handleReceiptCreated}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <ReceiptHistory 
                  tenants={tenants}
                  statements={statements}
                  settings={settings}
                />
              </TabsContent>

              <TabsContent value="tools" className="mt-0">
                <ToolsTab tenants={tenants} settings={settings} statements={statements} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        <SettingsDrawer
          open={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          setSettings={setSettings}
        />
      </div>

      {/* Mobile Bottom Navigation - optimized for Liquid Glass */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-t border-gray-200/40 dark:border-gray-800/40 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="grid grid-cols-5 h-[3.5rem] items-center">
          <button onClick={() => handleTabChange('tenants')} className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-all duration-300 select-none ${activeTab === 'tenants' ? 'text-blue-600 dark:text-blue-400 -translate-y-1' : 'text-slate-500 dark:text-slate-400'}`}>
            {activeTab === 'tenants' && <motion.div layoutId="mobileNavIndicator" className="absolute -top-3 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-full shadow-[0_2px_8px_rgba(59,130,246,0.5)]" />}
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'tenants' ? 'bg-blue-100/50 dark:bg-blue-900/30' : ''}`}>
              <Home className={`w-5 h-5 ${activeTab === 'tenants' ? 'fill-blue-500/20' : ''}`} />
            </div>
            <span className="text-[10px] font-semibold">Tenants</span>
          </button>
          <button onClick={() => handleTabChange('receipt')} className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-all duration-300 select-none ${activeTab === 'receipt' ? 'text-purple-600 dark:text-purple-400 -translate-y-1' : 'text-slate-500 dark:text-slate-400'}`}>
            {activeTab === 'receipt' && <motion.div layoutId="mobileNavIndicator" className="absolute -top-3 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-full shadow-[0_2px_8px_rgba(168,85,247,0.5)]" />}
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'receipt' ? 'bg-purple-100/50 dark:bg-purple-900/30' : ''}`}>
              <FileText className={`w-5 h-5 ${activeTab === 'receipt' ? 'fill-purple-500/20' : ''}`} />
            </div>
            <span className="text-[10px] font-semibold">Receipt</span>
          </button>
          <button onClick={() => handleTabChange('history')} className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-all duration-300 select-none ${activeTab === 'history' ? 'text-blue-600 dark:text-blue-400 -translate-y-1' : 'text-slate-500 dark:text-slate-400'}`}>
            {activeTab === 'history' && <motion.div layoutId="mobileNavIndicator" className="absolute -top-3 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-full shadow-[0_2px_8px_rgba(59,130,246,0.5)]" />}
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'history' ? 'bg-blue-100/50 dark:bg-blue-900/30' : ''}`}>
              <History className={`w-5 h-5 ${activeTab === 'history' ? 'fill-blue-500/20' : ''}`} />
            </div>
            <span className="text-[10px] font-semibold">History</span>
          </button>
          <button onClick={() => handleTabChange('tools')} className={`relative flex flex-col items-center justify-center gap-1 py-1 transition-all duration-300 select-none ${activeTab === 'tools' ? 'text-purple-600 dark:text-purple-400 -translate-y-1' : 'text-slate-500 dark:text-slate-400'}`}>
            {activeTab === 'tools' && <motion.div layoutId="mobileNavIndicator" className="absolute -top-3 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-full shadow-[0_2px_8px_rgba(168,85,247,0.5)]" />}
             <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'tools' ? 'bg-purple-100/50 dark:bg-purple-900/30' : ''}`}>
              <Wrench className={`w-5 h-5 ${activeTab === 'tools' ? 'fill-purple-500/20' : ''}`} />
            </div>
            <span className="text-[10px] font-semibold">Tools</span>
          </button>
          <button onClick={() => setShowSettings(true)} className="relative flex flex-col items-center justify-center gap-1 py-1 transition-all duration-300 select-none text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <div className="p-1.5 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}