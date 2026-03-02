import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';

const PRESETS = [
  { name: 'Avery L7163 (2×5, 99×57mm)', cols: 2, rows: 5, labelW: 99, labelH: 57, marginT: 15, marginB: 15, marginL: 5, marginR: 5 },
  { name: 'Avery L7160 (3×7, 63×38mm)', cols: 3, rows: 7, labelW: 63.5, labelH: 38.1, marginT: 15, marginB: 15, marginL: 5, marginR: 5 },
  { name: 'Avery L7159 (3×8, 63×34mm)', cols: 3, rows: 8, labelW: 63.5, labelH: 33.9, marginT: 13, marginB: 13, marginL: 5, marginR: 5 },
  { name: 'Custom', cols: 2, rows: 5, labelW: 99, labelH: 57, marginT: 15, marginB: 15, marginL: 5, marginR: 5 },
];

export default function AddressLabels({ tenants, settings }) {
  const [preset, setPreset] = useState(0);
  const [config, setConfig] = useState({ ...PRESETS[0] });
  const [selectedIds, setSelectedIds] = useState(() => tenants.map(t => t.id));

  const labelsPerPage = config.cols * config.rows;
  const selectedTenants = tenants.filter(t => selectedIds.includes(t.id));
  const totalPages = Math.ceil(selectedTenants.length / labelsPerPage);
  const usableW = 210 - config.marginL - config.marginR;
  const usableH = 297 - config.marginT - config.marginB;

  const handlePreset = (idx) => {
    setPreset(idx);
    if (idx < PRESETS.length - 1) {
      setConfig({ ...PRESETS[idx] });
    }
  };

  const updateConfig = (key, val) => {
    setPreset(PRESETS.length - 1); // switch to custom
    setConfig(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  const toggleTenant = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === tenants.length) setSelectedIds([]);
    else setSelectedIds(tenants.map(t => t.id));
  };

  const printLabels = () => {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const orgName = settings?.organizationName || 'Society of Saint Vincent de Paul';

    selectedTenants.forEach((tenant, idx) => {
      const pageIdx = Math.floor(idx / labelsPerPage);
      const posOnPage = idx % labelsPerPage;

      if (posOnPage === 0 && idx > 0) doc.addPage();

      const col = posOnPage % config.cols;
      const row = Math.floor(posOnPage / config.cols);

      const x = config.marginL + col * config.labelW;
      const y = config.marginT + row * config.labelH;

      // Label border (optional subtle)
      doc.setDrawColor(220, 220, 220);
      doc.rect(x, y, config.labelW, config.labelH);

      const padX = 4;
      const padY = 6;

      // Name
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(tenant.fullName || '', x + padX, y + padY);

      // Address
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const address = tenant.address || '';
      const addrLines = doc.splitTextToSize(address, config.labelW - padX * 2);
      addrLines.slice(0, 3).forEach((line, li) => {
        doc.text(line, x + padX, y + padY + 6 + li * 5);
      });

      // Org name at bottom
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(orgName, x + padX, y + config.labelH - 4);
    });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="bg-white dark:bg-gray-800 shadow border-0 dark:border dark:border-gray-700">
        <CardHeader className="border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg dark:text-gray-100">Tenant Address Labels</CardTitle>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  {config.cols} cols × {config.rows} rows — {config.labelW}mm × {config.labelH}mm per label
                </p>
              </div>
            </div>
            <Button
              onClick={printLabels}
              disabled={selectedTenants.length === 0}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Labels ({selectedTenants.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-5">
          {/* Preset Buttons */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Label Sheet Layout</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePreset(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    preset === i
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Config Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { key: 'cols', label: 'Columns' },
              { key: 'rows', label: 'Rows / page' },
              { key: 'labelW', label: 'Label width (mm)' },
              { key: 'labelH', label: 'Label height (mm)' },
              { key: 'marginT', label: 'Margin Top (mm)' },
              { key: 'marginB', label: 'Margin Bottom (mm)' },
              { key: 'marginL', label: 'Margin Left (mm)' },
              { key: 'marginR', label: 'Margin Right (mm)' },
            ].map(field => (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs text-slate-500">{field.label}</Label>
                <Input
                  type="number"
                  value={config[field.key]}
                  onChange={e => updateConfig(field.key, e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="text-sm text-slate-500 dark:text-gray-400">
            Labels per page: <strong>{labelsPerPage}</strong> &nbsp;|&nbsp; Usable area: <strong>{usableW.toFixed(0)}mm × {usableH.toFixed(0)}mm</strong>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Selection */}
      <Card className="bg-white dark:bg-gray-800 shadow border-0 dark:border dark:border-gray-700">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="selectAll"
              checked={selectedIds.length === tenants.length}
              onCheckedChange={toggleAll}
            />
            <Label htmlFor="selectAll" className="cursor-pointer font-medium">
              {selectedIds.length === tenants.length ? 'Deselect All' : 'Select All'} ({tenants.length} tenants)
            </Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {tenants.map(t => (
              <div
                key={t.id}
                onClick={() => toggleTenant(t.id)}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedIds.includes(t.id)
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <Checkbox
                  checked={selectedIds.includes(t.id)}
                  onCheckedChange={() => toggleTenant(t.id)}
                  onClick={e => e.stopPropagation()}
                />
                <div className="min-w-0">
                  <div className="font-medium text-sm text-slate-800 dark:text-gray-100 truncate">{t.fullName}</div>
                  <div className="text-xs text-slate-500 dark:text-gray-400 truncate">{t.address}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {selectedTenants.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 shadow border-0 dark:border dark:border-gray-700">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-slate-600 dark:text-gray-300 mb-3">
              Label preview ({selectedTenants.length} labels, {totalPages} page{totalPages > 1 ? 's' : ''}):
            </p>
            <div className="overflow-x-auto">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 relative"
                style={{ width: '210mm', maxWidth: '100%', minHeight: '100px', padding: `${config.marginT}mm ${config.marginR}mm ${config.marginB}mm ${config.marginL}mm` }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${config.cols}, ${config.labelW}mm)`,
                    gap: '0',
                  }}
                >
                  {selectedTenants.slice(0, labelsPerPage).map(t => (
                    <div
                      key={t.id}
                      className="border border-dashed border-gray-300 dark:border-gray-600 p-2 overflow-hidden"
                      style={{ width: `${config.labelW}mm`, height: `${config.labelH}mm` }}
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-gray-100 truncate">{t.fullName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 leading-tight line-clamp-3">{t.address}</div>
                      <div className="text-[8px] text-slate-400 dark:text-gray-500 mt-1">
                        {settings?.organizationName || 'Society of Saint Vincent de Paul'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {totalPages > 1 && (
              <p className="text-xs text-slate-400 mt-2">Showing page 1 of {totalPages} — remaining {selectedTenants.length - labelsPerPage} labels on next page{totalPages > 2 ? 's' : ''}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}