import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home, FileText, History, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import ClientManagement from '@/components/svp/ClientManagement';
import CreateReceipt from '@/components/svp/CreateReceipt';
import ReceiptHistory from '@/components/svp/ReceiptHistory';
import SettingsTab from '@/components/svp/SettingsTab';

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
  
  const queryClient = useQueryClient();

  // Sync tab with URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'tenants';
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 select-none">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            Society of St. Vincent de Paul
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Carndonagh</p>
        </div>

        {/* Desktop Tab Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="hidden sm:grid w-full grid-cols-4 mb-4 sm:mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-lg sm:rounded-xl p-0.5 sm:p-1 h-auto select-none">
            <TabsTrigger 
              value="tenants" 
              className="flex flex-row items-center gap-2 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-sm"
            >
              <Home className="w-4 h-4" />
              <span>Tenant Management</span>
            </TabsTrigger>
            <TabsTrigger 
              value="receipt" 
              className="flex flex-row items-center gap-2 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Create Receipt</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex flex-row items-center gap-2 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-sm"
            >
              <History className="w-4 h-4" />
              <span>Receipt History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex flex-row items-center gap-2 py-3 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

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

              <TabsContent value="settings" className="mt-0">
                <SettingsTab 
                  settings={settings}
                  setSettings={setSettings}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50 pb-safe">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => handleTabChange('tenants')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors select-none ${
              activeTab === 'tenants' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tenants</span>
          </button>
          <button
            onClick={() => handleTabChange('receipt')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors select-none ${
              activeTab === 'receipt' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-medium">Receipt</span>
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors select-none ${
              activeTab === 'history' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">History</span>
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors select-none ${
              activeTab === 'settings' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}