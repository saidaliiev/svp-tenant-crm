import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag, Printer, Save, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

const PRESETS = [
  { name: 'Avery L7163 (2×5, 99×57mm)', cols: 2, rows: 5, labelW: 99, labelH: 57, marginT: 15, marginB: 15, marginL: 5, marginR: 5 },
  { name: 'Avery L7160 (3×7, 63×38mm)', cols: 3, rows: 7, labelW: 63.5, labelH: 38.1, marginT: 15, marginB: 15, marginL: 5, marginR: 5 },
  { name: 'Avery L7159 (3×8, 63×34mm)', cols: 3, rows: 8, labelW: 63.5, labelH: 33.9, marginT: 13, marginB: 13, marginL: 5, marginR: 5 }
];

export default function AddressLabels({ tenants, settings }) {
  const [savedPresets, setSavedPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('svp_custom_label_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allPresets = [...PRESETS, ...savedPresets];

  const [preset, setPreset] = useState(0);
  const [config, setConfig] = useState({ ...PRESETS[0] });
  const [selectedIds, setSelectedIds] = useState(() => tenants.map(t => t.id));
  const [newPresetName, setNewPresetName] = useState('');

  const labelsPerPage = config.cols * config.rows;
  let selectedTenants = tenants.filter(t => selectedIds.includes(t.id));
  
  if (selectedTenants.length > 0) {
    const remainder = selectedTenants.length % labelsPerPage;
    if (remainder !== 0) {
      const needed = labelsPerPage - remainder;
      const originalLength = selectedTenants.length;
      for (let i = 0; i < needed; i++) {
        selectedTenants.push(selectedTenants[i % originalLength]);
      }
    }
  }

  const totalPages = Math.ceil(selectedTenants.length / labelsPerPage);
  const usableW = 210 - config.marginL - config.marginR;
  const usableH = 297 - config.marginT - config.marginB;

  const handlePreset = (idx) => {
    setPreset(idx);
    setConfig({ ...allPresets[idx] });
  };

  const updateConfig = (key, val) => {
    setPreset(-1); // switch to custom
    setConfig(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset = { ...config, name: newPresetName.trim() };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem('svp_custom_label_presets', JSON.stringify(updated));
    setNewPresetName('');
    setPreset(PRESETS.length + updated.length - 1);
  };

  const deleteCustomPreset = (index) => {
    const customIndex = index - PRESETS.length;
    const updated = savedPresets.filter((_, i) => i !== customIndex);
    setSavedPresets(updated);
    localStorage.setItem('svp_custom_label_presets', JSON.stringify(updated));
    setPreset(0);
    setConfig({ ...PRESETS[0] });
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
      // doc.setDrawColor(240, 240, 240); // Optional: disabled to prevent printing borders on actual labels
      // doc.rect(x, y, config.labelW, config.labelH);

      const isSmallLabel = config.labelW < 80;
      const padX = isSmallLabel ? 4 : 5;
      const padY = config.labelH < 45 ? 5 : 8;

      const nameFontSize = isSmallLabel ? 11 : 14;
      const addressFontSize = isSmallLabel ? 9 : 12;
      const orgFontSize = isSmallLabel ? 6 : 8;
      const lineSpacing = isSmallLabel ? 4.5 : 5.5;

      // Name
      doc.setFontSize(nameFontSize);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(tenant.fullName || '', x + padX, y + padY);

      // Address
      doc.setFontSize(addressFontSize);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      
      const stAddress = tenant.address || '';
      const townCounty = [tenant.city, tenant.county].filter(Boolean).join(', ');
      const eircode = tenant.eircode || '';
      
      const addressLines = [stAddress, townCounty, eircode].filter(Boolean);
      
      // Fallback: if they only have 'address' field and no others, it might be a long string
      const linesToPrint = addressLines.length > 1 ? addressLines : doc.splitTextToSize(stAddress, config.labelW - padX * 2);

      linesToPrint.slice(0, 4).forEach((line, li) => {
        doc.text(line, x + padX, y + padY + (isSmallLabel ? 5 : 7) + li * lineSpacing);
      });

      // Org name at bottom
      doc.setFontSize(orgFontSize);
      doc.setTextColor(150, 150, 150);
      doc.text(orgName, x + padX, y + config.labelH - (isSmallLabel ? 3 : 4));
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
              {allPresets.map((p, i) => (
                <div key={i} className="flex items-stretch">
                  <button
                    onClick={() => handlePreset(i)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                      preset === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                    } ${i >= PRESETS.length ? 'rounded-l-full border-r-0' : 'rounded-full'}`}
                  >
                    {p.name}
                  </button>
                  {i >= PRESETS.length && (
                    <button
                      onClick={() => deleteCustomPreset(i)}
                      className={`px-2 py-1.5 border transition-all rounded-r-full flex items-center justify-center ${
                        preset === i
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 border-l-blue-500'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                      }`}
                      title="Delete preset"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setPreset(-1)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  preset === -1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Config Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
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
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-gray-400 whitespace-nowrap">{field.label}</Label>
                <Input
                  type="number"
                  value={config[field.key]}
                  onChange={e => updateConfig(field.key, e.target.value)}
                  className="h-9 text-sm w-full"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-slate-500 dark:text-gray-400">
              Labels per page: <strong>{labelsPerPage}</strong> &nbsp;|&nbsp; Usable area: <strong>{usableW.toFixed(0)}mm × {usableH.toFixed(0)}mm</strong>
            </div>
            
            {preset === -1 && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Custom preset name..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="h-8 text-sm w-48"
                />
                <Button 
                  size="sm" 
                  onClick={saveCustomPreset} 
                  disabled={!newPresetName.trim()}
                  variant="outline"
                  className="h-8"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save
                </Button>
              </div>
            )}
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
            <div className="overflow-x-auto bg-slate-100 dark:bg-gray-950 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-gray-800 shadow-inner">
              <div className="flex justify-center min-w-min">
                <div
                  className="bg-white relative shadow-md"
                  style={{ 
                    minWidth: '210mm', 
                    width: 'max-content',
                    minHeight: '297mm', 
                    height: 'max-content',
                    padding: `${config.marginT}mm ${config.marginR}mm ${config.marginB}mm ${config.marginL}mm`, 
                    boxSizing: 'border-box' 
                  }}
                >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${config.cols}, ${config.labelW}mm)`,
                    gridAutoRows: `${config.labelH}mm`,
                    gap: '0',
                    width: 'max-content'
                  }}
                >
                  {selectedTenants.slice(0, labelsPerPage).map((t, i) => {
                    const isSmall = config.labelW < 80;
                    return (
                      <div
                        key={`${t.id}-${i}`}
                        className="border border-dashed border-gray-200 overflow-hidden relative flex flex-col justify-center"
                        style={{ 
                          width: `${config.labelW}mm`, 
                          height: `${config.labelH}mm`,
                          padding: isSmall ? '4mm 4mm' : '5mm 5mm' 
                        }}
                      >
                        <div 
                          className="font-bold text-slate-900 leading-tight truncate"
                          style={{ fontSize: isSmall ? '13px' : '16px' }}
                        >
                          {t.fullName}
                        </div>
                        <div 
                          className="text-slate-700 leading-snug flex flex-col gap-0.5"
                          style={{ 
                            fontSize: isSmall ? '11px' : '14px',
                            marginTop: isSmall ? '4px' : '6px'
                          }}
                        >
                          {t.address && <span>{t.address}</span>}
                          {(t.city || t.county) && <span>{[t.city, t.county].filter(Boolean).join(', ')}</span>}
                          {t.eircode && <span>{t.eircode}</span>}
                        </div>
                        <div 
                          className="text-slate-400 absolute"
                          style={{ 
                            fontSize: isSmall ? '8px' : '10px',
                            bottom: isSmall ? '3mm' : '4mm',
                            left: isSmall ? '4mm' : '5mm'
                          }}
                        >
                          {settings?.organizationName || 'Society of Saint Vincent de Paul'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}