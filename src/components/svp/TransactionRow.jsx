import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

export default function TransactionRow({ transaction, index, onUpdate, onDelete, canDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-700/50 p-3 sm:p-4 shadow-sm hover:shadow-md dark:hover:shadow-gray-950/20 transition-shadow">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-gray-400">#{index + 1}</span>
        <div className="flex items-center gap-2">
          {/* Compact date on mobile */}
          <div className="sm:hidden">
            <Input
              type="date"
              value={transaction.date}
              onChange={(e) => onUpdate('date', e.target.value)}
              className="h-8 text-xs w-[130px]"
            />
          </div>
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-7 w-7 p-0">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-slate-500 dark:text-gray-400">Payment Date</Label>
          <Input type="date" value={transaction.date} onChange={(e) => onUpdate('date', e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500 dark:text-gray-400">Rent Due (€)</Label>
          <Input type="number" step="0.01" value={transaction.rentDue} onChange={(e) => onUpdate('rentDue', e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500 dark:text-gray-400">Tenant Payment (€)</Label>
          <div className="flex items-center gap-2">
            <Input type="number" step="0.01" value={transaction.tenantPayment} onChange={(e) => onUpdate('tenantPayment', e.target.value)} className="h-10 flex-1" />
            <div className="flex items-center gap-1.5">
              <Checkbox id={`tenant-paid-${transaction.id}`} checked={transaction.tenantPaid} onCheckedChange={(checked) => onUpdate('tenantPaid', checked)} />
              <Label htmlFor={`tenant-paid-${transaction.id}`} className="text-xs cursor-pointer">Paid</Label>
            </div>
          </div>
        </div>
        <div className="space-y-1 lg:col-span-2">
          <Label className="text-xs text-slate-500 dark:text-gray-400">RAS (€)</Label>
          <div className="flex items-center gap-2">
            <Input type="number" step="0.01" value={transaction.rasPayment} onChange={(e) => onUpdate('rasPayment', e.target.value)} className="h-10 flex-1" />
            <div className="flex items-center gap-1.5">
              <Checkbox id={`ras-received-${transaction.id}`} checked={transaction.rasReceived} onCheckedChange={(checked) => onUpdate('rasReceived', checked)} />
              <Label htmlFor={`ras-received-${transaction.id}`} className="text-xs cursor-pointer">Received</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile compact layout */}
      <div className="sm:hidden space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-400 dark:text-gray-500">Rent (€)</Label>
            <Input type="number" step="0.01" value={transaction.rentDue} onChange={(e) => onUpdate('rentDue', e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-400 dark:text-gray-500">Tenant (€)</Label>
            <Input type="number" step="0.01" value={transaction.tenantPayment} onChange={(e) => onUpdate('tenantPayment', e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-400 dark:text-gray-500">RAS (€)</Label>
            <Input type="number" step="0.01" value={transaction.rasPayment} onChange={(e) => onUpdate('rasPayment', e.target.value)} className="h-8 text-xs" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <Checkbox id={`m-tenant-paid-${transaction.id}`} checked={transaction.tenantPaid} onCheckedChange={(checked) => onUpdate('tenantPaid', checked)} />
            <Label htmlFor={`m-tenant-paid-${transaction.id}`} className="text-[11px] cursor-pointer text-slate-600 dark:text-gray-400">Tenant Paid</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <Checkbox id={`m-ras-received-${transaction.id}`} checked={transaction.rasReceived} onCheckedChange={(checked) => onUpdate('rasReceived', checked)} />
            <Label htmlFor={`m-ras-received-${transaction.id}`} className="text-[11px] cursor-pointer text-slate-600 dark:text-gray-400">RAS Received</Label>
          </div>
        </div>
      </div>
    </div>
  );
}