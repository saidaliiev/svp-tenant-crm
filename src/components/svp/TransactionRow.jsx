import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

export default function TransactionRow({ transaction, index, onUpdate, onDelete, canDelete }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">Transaction #{index + 1}</span>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Payment Date */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Payment Date</Label>
          <Input
            type="date"
            value={transaction.date}
            onChange={(e) => onUpdate('date', e.target.value)}
            className="h-10"
          />
        </div>

        {/* Rent Due */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Rent Due (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={transaction.rentDue}
            onChange={(e) => onUpdate('rentDue', e.target.value)}
            className="h-10"
          />
        </div>

        {/* Tenant Payment */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Tenant Payment (€)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              value={transaction.tenantPayment}
              onChange={(e) => onUpdate('tenantPayment', e.target.value)}
              className="h-10 flex-1"
            />
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`tenant-paid-${transaction.id}`}
                checked={transaction.tenantPaid}
                onCheckedChange={(checked) => onUpdate('tenantPaid', checked)}
              />
              <Label 
                htmlFor={`tenant-paid-${transaction.id}`}
                className="text-xs cursor-pointer"
              >
                Paid
              </Label>
            </div>
          </div>
        </div>

        {/* RAS Payment */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Rent Assistance Support (€)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              value={transaction.rasPayment}
              onChange={(e) => onUpdate('rasPayment', e.target.value)}
              className="h-10 flex-1"
            />
            <div className="flex items-center gap-1.5">
              <Checkbox
                id={`ras-received-${transaction.id}`}
                checked={transaction.rasReceived}
                onCheckedChange={(checked) => onUpdate('rasReceived', checked)}
              />
              <Label 
                htmlFor={`ras-received-${transaction.id}`}
                className="text-xs cursor-pointer"
              >
                Received
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}