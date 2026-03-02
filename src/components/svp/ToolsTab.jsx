import React, { useState } from 'react';
import { Tag, ChevronRight } from 'lucide-react';
import AddressLabels from './AddressLabels';

const TOOLS = [
  {
    id: 'labels',
    icon: <Tag className="w-6 h-6 text-blue-500" />,
    bg: 'bg-blue-50',
    title: 'Address Labels',
    description: 'Print A4 sticker labels for tenant addresses',
  },
];

export default function ToolsTab({ tenants, settings }) {
  const [activeTool, setActiveTool] = useState(null);

  if (activeTool === 'labels') {
    return (
      <div>
        <button
          onClick={() => setActiveTool(null)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          ← Back to Tools
        </button>
        <AddressLabels tenants={tenants} settings={settings} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all text-left group"
          >
            <div className={`w-12 h-12 ${tool.bg} rounded-xl flex items-center justify-center shrink-0`}>
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 dark:text-gray-100">{tool.title}</div>
              <div className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{tool.description}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}