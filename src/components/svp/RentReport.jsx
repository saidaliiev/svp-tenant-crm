import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart2, Printer, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

function getPeriodOptions() {
  const options = [];
  for (let i = 0; i < 12; i++) {
    const d = subMonths(new Date(), i);
    options.push({
      label: format(d, 'MMMM yyyy'),
      start: format(startOfMonth(d), 'yyyy-MM-dd'),
      end: format(endOfMonth(d), 'yyyy-MM-dd'),
    });
  }
  return options;
}

export default function RentReport({ tenants = [], statements = [], settings }) {
  const periods = getPeriodOptions();
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const period = periods[selectedPeriod];

  const tenantRows = tenants.map(t => {
    const stmt = statements.find(s =>
      s.clientId === t.id &&
      s.startDate >= period.start &&
      s.endDate <= period.end
    );
    const balance = stmt ? stmt.finalBalance : (t.currentBalance ?? null);
    const hasPaid = stmt !== undefined;
    return { tenant: t, stmt, balance, hasPaid };
  });

  const paidCount = tenantRows.filter(r => r.hasPaid && r.balance <= 0).length;
  const debtCount = tenantRows.filter(r => r.balance > 0).length;
  const noRecordCount = tenantRows.filter(r => !r.hasPaid).length;
  const totalDebt = tenantRows.reduce((sum, r) => sum + (r.balance > 0 ? r.balance : 0), 0);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(v ?? 0);

  const printReport = () => {
    const doc = new jsPDF();
    const orgName = settings?.organizationName || 'Society of Saint Vincent de Paul';

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Rent Report', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${orgName} — ${period.label}`, 14, 26);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')}`, 14, 32);
    doc.setTextColor(0, 0, 0);

    doc.autoTable({
      startY: 40,
      head: [['Tenant', 'Address', 'Monthly Rent', 'Balance', 'Status']],
      body: tenantRows.map(r => [
        r.tenant.fullName || '',
        r.tenant.address || '',
        formatCurrency(r.tenant.monthlyRent),
        formatCurrency(r.balance),
        !r.hasPaid ? 'No Record' : r.balance > 0 ? 'In Debt' : 'Paid Up',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
      columnStyles: { 3: { halign: 'right' } },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Outstanding Debt: ${formatCurrency(totalDebt)}`, 14, finalY);

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="space-y-5">
      <Card className="bg-white dark:bg-gray-800 shadow border-0 dark:border dark:border-gray-700">
        <CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg dark:text-gray-100">Rent Report</CardTitle>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Summary for all tenants by period</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-48">
                <Select value={String(selectedPeriod)} onValueChange={v => setSelectedPeriod(Number(v))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p, i) => (
                      <SelectItem key={i} value={String(i)}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={printReport} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 gap-2 h-9">
                <Printer className="w-4 h-4" /> Print PDF
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{paidCount}</div>
              <div className="text-xs text-green-700 dark:text-green-400 mt-0.5">Paid Up</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{debtCount}</div>
              <div className="text-xs text-red-700 dark:text-red-400 mt-0.5">In Debt</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-500">{noRecordCount}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">No Record</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-orange-600">{formatCurrency(totalDebt)}</div>
              <div className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">Total Debt</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-gray-700">
                  <th className="text-left py-2.5 px-3 font-semibold text-slate-600 dark:text-gray-300">Tenant</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-slate-600 dark:text-gray-300 hidden md:table-cell">Address</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-slate-600 dark:text-gray-300">Rent</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-slate-600 dark:text-gray-300">Balance</th>
                  <th className="text-center py-2.5 px-3 font-semibold text-slate-600 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenantRows.map(({ tenant, balance, hasPaid }) => (
                  <tr key={tenant.id} className="border-b border-slate-100 dark:border-gray-700/50 hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-gray-200">{tenant.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-gray-400 hidden md:table-cell text-xs">{tenant.address}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-gray-300">{formatCurrency(tenant.monthlyRent)}</td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {balance !== null ? formatCurrency(balance) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {!hasPaid ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400"><AlertCircle className="w-3.5 h-3.5" /> No Record</span>
                      ) : balance > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-500"><XCircle className="w-3.5 h-3.5" /> In Debt</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-green-500"><CheckCircle className="w-3.5 h-3.5" /> Paid Up</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}