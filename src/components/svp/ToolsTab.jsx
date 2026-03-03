import React, { useState } from 'react';
import { Tag, BarChart2, Mail, TrendingUp, Search, CalendarDays, Download, Bell, ChevronRight, ArrowLeft, Construction } from 'lucide-react';
import AddressLabels from './AddressLabels';
import RentReport from './RentReport';
import ArrearsOverview from './ArrearsOverview';
import ArrearsAlert from './ArrearsAlert';
import BulkLetters from './BulkLetters';
import PaymentLookup from './PaymentLookup';
import StatementCalendar from './StatementCalendar';
import ExportExcel from './ExportExcel';

const TOOLS = [
  {
    id: 'labels',
    icon: <Tag className="w-6 h-6 text-blue-500" />,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    title: 'Address Labels',
    description: 'Print A4 sticker labels for tenant addresses',
    ready: true,
  },
  {
    id: 'rent-report',
    icon: <BarChart2 className="w-6 h-6 text-emerald-500" />,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    title: 'Rent Report',
    description: 'PDF report for all tenants — who paid, who owes',
    ready: true,
  },
  {
    id: 'arrears-overview',
    icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    title: 'Arrears Overview',
    description: 'Visual dashboard — total debt and monthly trends',
    ready: true,
  },
  {
    id: 'arrears-alert',
    icon: <Bell className="w-6 h-6 text-red-500" />,
    bg: 'bg-red-50 dark:bg-red-950/40',
    title: 'Arrears Alert',
    description: 'Tenants with debt above a threshold — quick review',
    ready: true,
  },
  {
    id: 'bulk-letters',
    icon: <Mail className="w-6 h-6 text-orange-500" />,
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    title: 'Bulk Letters',
    description: 'Generate debt notification letters for multiple tenants',
    ready: true,
  },
  {
    id: 'payment-lookup',
    icon: <Search className="w-6 h-6 text-cyan-500" />,
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    title: 'Payment Lookup',
    description: 'Search for a specific payment across all statements',
    ready: true,
  },
  {
    id: 'statement-calendar',
    icon: <CalendarDays className="w-6 h-6 text-violet-500" />,
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    title: 'Statement Calendar',
    description: 'See which months are closed for each tenant',
    ready: true,
  },
  {
    id: 'export-excel',
    icon: <Download className="w-6 h-6 text-teal-500" />,
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    title: 'Export to Excel',
    description: 'Export all receipts and transactions to .csv',
    ready: true,
  },
];

const TOOL_COMPONENTS = {
  labels: AddressLabels,
  'rent-report': RentReport,
  'arrears-overview': ArrearsOverview,
  'arrears-alert': ArrearsAlert,
  'bulk-letters': BulkLetters,
  'payment-lookup': PaymentLookup,
  'statement-calendar': StatementCalendar,
  'export-excel': ExportExcel,
};

export default function ToolsTab({ tenants, settings, statements }) {
  const [activeTool, setActiveTool] = useState(null);

  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null;
  const activeMeta = TOOLS.find(t => t.id === activeTool);

  if (activeTool && ActiveComponent) {
    return (
      <div>
        <button
          onClick={() => setActiveTool(null)}
          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </button>
        <ActiveComponent tenants={tenants} settings={settings} statements={statements} />
      </div>
    );
  }

  if (activeTool && !ActiveComponent) {
    return (
      <div>
        <button
          onClick={() => setActiveTool(null)}
          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 dark:text-gray-500">
          <Construction className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-lg font-medium">Coming Soon</p>
          <p className="text-sm mt-1">{activeMeta?.title} is currently under development.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-tour="tools-grid">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            data-tour={`tool-card-${tool.id}`}
            onClick={() => setActiveTool(tool.id)}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all text-left group relative"
          >
            {!tool.ready && (
              <span className="absolute top-2.5 right-2.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">SOON</span>
            )}
            <div className={`w-11 h-11 ${tool.bg} rounded-xl flex items-center justify-center shrink-0`}>
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="font-semibold text-slate-800 dark:text-gray-100 text-sm">{tool.title}</div>
              <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-tight">{tool.description}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 absolute right-3 bottom-3" />
          </button>
        ))}
      </div>
    </div>
  );
}