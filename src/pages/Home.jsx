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
          <div className="hidden sm:flex items-center gap-2 mb-4 sm:mb-6">
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
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg dark:shadow-gray-950/30 border-0 dark:border dark:border-gray-700/50 text-slate-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
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

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50 pb-safe">
        <div className="grid grid-cols-5 h-16">
          <button onClick={() => handleTabChange('tenants')} className={`flex flex-col items-center justify-center gap-1 transition-colors select-none ${activeTab === 'tenants' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tenants</span>
          </button>
          <button onClick={() => handleTabChange('receipt')} className={`flex flex-col items-center justify-center gap-1 transition-colors select-none ${activeTab === 'receipt' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium">Receipt</span>
          </button>
          <button onClick={() => handleTabChange('history')} className={`flex flex-col items-center justify-center gap-1 transition-colors select-none ${activeTab === 'history' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">History</span>
          </button>
          <button onClick={() => handleTabChange('tools')} className={`flex flex-col items-center justify-center gap-1 transition-colors select-none ${activeTab === 'tools' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Wrench className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tools</span>
          </button>
          <button onClick={() => setShowSettings(true)} className="flex flex-col items-center justify-center gap-1 transition-colors select-none text-gray-500 dark:text-gray-400 hover:text-blue-600">
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}