import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v ?? 0);

export default function ArrearsOverview({ tenants = [], statements = [] }) {
  const totalDebt = useMemo(() =>
    tenants.reduce((sum, t) => sum + (t.currentBalance > 0 ? t.currentBalance : 0), 0),
    [tenants]
  );
  const totalCredit = useMemo(() =>
    tenants.reduce((sum, t) => sum + (t.currentBalance < 0 ? Math.abs(t.currentBalance) : 0), 0),
    [tenants]
  );
  const inDebtCount = tenants.filter(t => t.currentBalance > 0).length;
  const inCreditCount = tenants.filter(t => t.currentBalance < 0).length;

  // Monthly trend: total debt recorded per month from statements
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const start = format(startOfMonth(d), 'yyyy-MM-dd');
      const end = format(endOfMonth(d), 'yyyy-MM-dd');
      const monthStmts = statements.filter(s => s.startDate >= start && s.endDate <= end);
      const debt = monthStmts.reduce((sum, s) => sum + (s.finalBalance > 0 ? s.finalBalance : 0), 0);
      months.push({ month: format(d, 'MMM'), debt });
    }
    return months;
  }, [statements]);

  // Top debtors
  const topDebtors = [...tenants]
    .filter(t => t.currentBalance > 0)
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-white dark:bg-gray-800 border-0 dark:border dark:border-gray-700 shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> Total Outstanding Debt
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-0 dark:border dark:border-gray-700 shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
              <TrendingDown className="w-3 h-3" /> Total Credit Balance
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-0 dark:border dark:border-gray-700 shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{inDebtCount}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Tenants in Debt
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-0 dark:border dark:border-gray-700 shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{inCreditCount}</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> Tenants in Credit
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart */}
        <Card className="bg-white dark:bg-gray-800 border-0 dark:border dark:border-gray-700 shadow">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-base dark:text-gray-100">Monthly Arrears Trend (6 months)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `€${v}`} tick={{ fontSize: 11 }} width={55} />
                <Tooltip formatter={v => [formatCurrency(v), 'Total Debt']} />
                <Bar dataKey="debt" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={index} fill={entry.debt > 0 ? '#f87171' : '#d1d5db'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Debtors */}
        <Card className="bg-white dark:bg-gray-800 border-0 dark:border dark:border-gray-700 shadow">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-base dark:text-gray-100">Top Debtors</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {topDebtors.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No tenants in debt 🎉</p>
            ) : topDebtors.map((t, i) => {
              const pct = totalDebt > 0 ? (t.currentBalance / totalDebt) * 100 : 0;
              return (
                <div key={t.id}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium text-slate-700 dark:text-gray-200 truncate">{t.fullName}</span>
                    <span className="font-bold text-red-600 shrink-0 ml-2">{formatCurrency(t.currentBalance)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-red-400 to-orange-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}