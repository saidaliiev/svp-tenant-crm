import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home, FileText, History, Settings } from 'lucide-react';
import ClientManagement from '@/components/svp/ClientManagement';
import CreateReceipt from '@/components/svp/CreateReceipt';
import ReceiptHistory from '@/components/svp/ReceiptHistory';
import SettingsTab from '@/components/svp/SettingsTab';

const DEFAULT_SETTINGS = {
  organizationName: "Society of Saint Vincent de Paul",
  receiptTitle: "Monthly Rent Statement",
  contactPhone: "084 7834665",
  systemName: "SVP Housing Support System"
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [statements, setStatements] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClients = localStorage.getItem('svp_clients');
    const savedStatements = localStorage.getItem('svp_statements');
    const savedSettings = localStorage.getItem('svp_settings');
    
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedStatements) setStatements(JSON.parse(savedStatements));
    if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('svp_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('svp_statements', JSON.stringify(statements));
  }, [statements]);

  useEffect(() => {
    localStorage.setItem('svp_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSelectClient = (clientId) => {
    setSelectedClientId(clientId);
    setActiveTab("receipt");
  };

  const handleReceiptCreated = (receipt) => {
    setStatements(prev => [receipt, ...prev]);
    // Update client's last receipt date
    setClients(prev => prev.map(c => 
      c.id === receipt.clientId 
        ? { ...c, lastReceiptDate: receipt.createdDate, currentBalance: receipt.finalBalance }
        : c
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6981d4cc4b4335396c2fe553/7a1906beb_SVP-1200x675-Photoroom.png" 
              alt="SVP Logo" 
              className="h-32 md:h-40 object-contain w-full max-w-2xl px-4"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="clients" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Client Management</span>
              <span className="sm:hidden">Clients</span>
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

          <TabsContent value="clients">
            <ClientManagement 
              clients={clients}
              setClients={setClients}
              statements={statements}
              onSelectClient={handleSelectClient}
            />
          </TabsContent>

          <TabsContent value="receipt">
            <CreateReceipt 
              clients={clients}
              statements={statements}
              settings={settings}
              selectedClientId={selectedClientId}
              onReceiptCreated={handleReceiptCreated}
            />
          </TabsContent>

          <TabsContent value="history">
            <ReceiptHistory 
              clients={clients}
              statements={statements}
              setStatements={setStatements}
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