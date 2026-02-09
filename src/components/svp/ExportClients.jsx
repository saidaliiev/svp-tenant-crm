import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import Papa from 'papaparse';

export default function ExportClients({ clients }) {
  const handleExport = () => {
    if (clients.length === 0) {
      alert('No clients to export');
      return;
    }

    // Prepare data for export
    const exportData = clients.map(client => ({
      'Client ID': client.id,
      'Full Name': client.fullName,
      'Address': client.address,
      'Current Balance (€)': client.currentBalance || 0,
      'Credit (€)': client.credit || 0,
      'Weekly Rent (€)': client.monthlyRent || 143.40,
      'Weekly Tenant Payment (€)': client.weeklyTenantPayment || 40,
      'Weekly RAS Amount (€)': client.weeklyRasAmount || 103.40,
      'Created Date': client.createdDate ? new Date(client.createdDate).toLocaleDateString('en-GB') : '',
      'Last Receipt Date': client.lastReceiptDate ? new Date(client.lastReceiptDate).toLocaleDateString('en-GB') : 'Never'
    }));

    // Convert to CSV
    const csv = Papa.unparse(exportData);

    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      variant="outline"
      onClick={handleExport}
      className="border-green-300 text-green-700 hover:bg-green-50"
    >
      <Download className="w-4 h-4 mr-2" />
      Export All Clients
    </Button>
  );
}