import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home, FileText, History, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [activeTab, setActiveTab] = useState("tenants");
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  const queryClient = useQueryClient();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/36ae01103_SVP-1200x675-Photoroom.png" 
              alt="SVP Logo" 
              className="h-24 md:h-28 object-contain w-full max-w-xl"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="tenants" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Tenant Management</span>
              <span className="sm:hidden">Tenants</span>
            </TabsTrigger>
            <TabsTrigger 
              value="receipt" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Create Receipt</span>
              <span className="sm:hidden">Receipt</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Receipt History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tenants">
            <ClientManagement 
              tenants={tenants}
              tenantsLoading={tenantsLoading}
              statements={statements}
              onSelectTenant={handleSelectTenant}
              settings={settings}
            />
          </TabsContent>

          <TabsContent value="receipt">
            <CreateReceipt 
              tenants={tenants}
              statements={statements}
              settings={settings}
              selectedTenantId={selectedTenantId}
              onReceiptCreated={handleReceiptCreated}
            />
          </TabsContent>

          <TabsContent value="history">
            <ReceiptHistory 
              tenants={tenants}
              statements={statements}
              settings={settings}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab 
              settings={settings}
              setSettings={setSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}