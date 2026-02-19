import React from 'react';
import { Button } from "@/components/ui/button";
import { User, UserCheck, Pencil, Trash2 } from 'lucide-react';

export default function TenantCardMobile({ tenant, index, onProfile, onSelect, onEdit, onDelete, formatCurrency }) {
  return (
    <div
      className="bg-white dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-700/50 p-3 shadow-sm active:bg-blue-50 dark:active:bg-blue-950/30 transition-colors"
      onClick={() => onProfile(tenant)}
      {...(index === 0 ? { 'data-tutorial': 'tenant-actions' } : {})}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-700 px-1.5 py-0.5 rounded shrink-0">
            {tenant.displayId || tenant.id}
          </span>
          <span className="font-medium text-slate-800 dark:text-gray-200 text-sm truncate">{tenant.fullName}</span>
        </div>
        <span className={`text-sm font-bold shrink-0 ml-2 ${(tenant.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(tenant.currentBalance || 0)}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-gray-500 truncate mb-2.5">{tenant.address}</p>
      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" onClick={() => onProfile(tenant)} data-tour={index === 0 ? "btn-profile" : undefined} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white h-8 text-xs">
          <User className="w-3.5 h-3.5 mr-1" /> Profile
        </Button>
        <Button size="sm" onClick={() => onSelect(tenant.id)} data-tour={index === 0 ? "btn-select" : undefined} className="flex-1 bg-green-500 hover:bg-green-600 text-white h-8 text-xs">
          <UserCheck className="w-3.5 h-3.5 mr-1" /> Select
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(tenant)} data-tour={index === 0 ? "btn-edit" : undefined} className="h-8 w-8 p-0 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(tenant)} data-tour={index === 0 ? "btn-delete" : undefined} className="h-8 w-8 p-0 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}