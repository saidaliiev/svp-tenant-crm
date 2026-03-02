import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ExportExcel({ tenants = [], statements = [] }) {
  
  const handleExportStatements = () => {
    // Generate CSV
    const headers = ['Receipt ID', 'Date Created', 'Tenant', 'Period Start', 'Period End', 'Rent Due', 'Tenant Paid', 'RAS Received', 'Final Balance'];
    
    const rows = statements.map(s => [
      s.receiptId || '',
      s.createdDate ? format(new Date(s.createdDate), 'yyyy-MM-dd') : '',
      `"${s.clientName || ''}"`,
      s.startDate || '',
      s.endDate || '',
      s.totalRentDue || 0,
      s.totalTenantPayments || 0,
      s.totalRasReceived || 0,
      s.finalBalance || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statements_export_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTenants = () => {
    const headers = ['Tenant Name', 'Address', 'Phone', 'Monthly Rent', 'Weekly Tenant', 'Weekly RAS', 'Current Balance'];
    
    const rows = tenants.map(t => [
      `"${t.fullName || ''}"`,
      `"${t.address || ''}"`,
      `"${t.phoneNumber || ''}"`,
      t.monthlyRent || 0,
      t.weeklyTenantPayment || 0,
      t.weeklyRasAmount || 0,
      t.currentBalance || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenants_export_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-teal-500" />
          Export to Excel (CSV)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Download your data as CSV files which can be opened directly in Microsoft Excel, Google Sheets, or Apple Numbers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExportStatements} className="bg-teal-600 hover:bg-teal-700">
            <Download className="w-4 h-4 mr-2" />
            Export Receipts & Transactions
          </Button>
          
          <Button onClick={handleExportTenants} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
            <Download className="w-4 h-4 mr-2" />
            Export Tenant Balances
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}