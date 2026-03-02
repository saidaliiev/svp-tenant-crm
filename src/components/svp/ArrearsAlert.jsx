import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, AlertTriangle, Phone } from 'lucide-react';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(v ?? 0);

export default function ArrearsAlert({ tenants = [] }) {
  const [threshold, setThreshold] = useState(100);

  const alertTenants = tenants
    .filter(t => (t.currentBalance ?? 0) >= threshold)
    .sort((a, b) => b.currentBalance - a.currentBalance);

  const getSeverity = (balance) => {
    if (balance >= 500) return { label: 'Critical', classes: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400', bar: 'bg-red-500' };
    if (balance >= 200) return { label: 'High', classes: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400', bar: 'bg-orange-500' };
    return { label: 'Medium', classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400', bar: 'bg-yellow-500' };
  };

  return (
    <div className="space-y-5">
      <Card className="bg-white dark:bg-gray-800 border-0 dark:border dark:border-gray-700 shadow">
        <CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg dark:text-gray-100">Arrears Alert</CardTitle>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  {alertTenants.length} tenant{alertTenants.length !== 1 ? 's' : ''} above threshold
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-48">
              <Label className="text-sm text-slate-600 dark:text-gray-300 shrink-0">Threshold €</Label>
              <Input
                type="number"
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value) || 0)}
                className="h-9 w-28"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {alertTenants.length === 0 ? (
            <div className="text-center py-14 text-slate-400 dark:text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No tenants above threshold</p>
              <p className="text-sm mt-1">All tenants are below €{threshold}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alertTenants.map(t => {
                const severity = getSeverity(t.currentBalance);
                return (
                  <div key={t.id} className="flex items-center gap-4 bg-slate-50 dark:bg-gray-700/40 rounded-xl p-3.5 border border-slate-100 dark:border-gray-700/50">
                    <div className="w-9 h-9 bg-red-100 dark:bg-red-950/40 rounded-xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 dark:text-gray-100 text-sm">{t.fullName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${severity.classes}`}>{severity.label}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 truncate">{t.address}</div>
                      {t.phoneNumber && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                          <Phone className="w-3 h-3" /> {t.phoneNumber}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-red-600">{formatCurrency(t.currentBalance)}</div>
                      <div className="text-xs text-slate-400 dark:text-gray-500">outstanding</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}