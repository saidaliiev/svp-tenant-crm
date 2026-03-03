import React from 'react';
import { Button } from "@/components/ui/button";
import { User, UserCheck, Pencil, Trash2 } from 'lucide-react';
import { getRandomAvatar } from './avatars';

export default function TenantCardMobile({ tenant, index, onProfile, onSelect, onEdit, onDelete, formatCurrency }) {
  return (
    <div
      className="bg-white dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-700/50 p-3 shadow-sm active:bg-blue-50 dark:active:bg-blue-950/30 transition-colors"
      onClick={() => onProfile(tenant)}
      {...(index === 0 ? { 'data-tour': 'tenant-actions' } : {})}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-sm border border-gray-100 dark:border-gray-700 relative">
            <img src={tenant.avatarUrl || getRandomAvatar(tenant.id)} alt={tenant.fullName} className="w-full h-full object-cover scale-[1.35]" />
          </div>
          <div>
            <span className="font-medium text-slate-800 dark:text-gray-200 text-sm block truncate">{tenant.fullName}</span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500">
              ID: {tenant.displayId || tenant.id}
            </span>
          </div>
        </div>
        <span className={`text-sm font-bold shrink-0 ml-2 ${(tenant.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(tenant.currentBalance || 0)}
        </span>
      </div>
      <p className={`text-xs text-slate-500 dark:text-gray-500 truncate ${tenant.lodgmentRange ? 'mb-1' : 'mb-2.5'}`}>{tenant.address}</p>
      {tenant.lodgmentRange && (
        <p className="text-[10px] font-mono text-slate-400 dark:text-gray-500 truncate mb-2.5">Lodgment ID: {tenant.lodgmentRange}</p>
      )}
      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" onClick={() => onProfile(tenant)} data-tour={index === 0 ? "btn-profile" : undefined} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white h-8 text-xs">
          <User className="w-3.5 h-3.5 mr-1" /> Profile
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