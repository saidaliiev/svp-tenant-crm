import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings, Save, RotateCcw, Trash2, AlertTriangle, Type, Droplets, Layers } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DEFAULT_SETTINGS = {
  organizationName: "Society of Saint Vincent de Paul",
  receiptTitle: "Monthly Rent Statement",
  contactPhone: "086 7856869",
  systemName: "Society of Saint Vincent de Paul, Carndonagh"
};

const FONT_SIZES = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export default function SettingsDrawer({ open, onClose, settings, setSettings }) {
  const [formData, setFormData] = useState(settings);
  const [success, setSuccess] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [designStyle, setDesignStyle] = useState('default');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const user = await base44.auth.me();
        if (user.fontSize) setFontSize(user.fontSize);
        if (user.designStyle) setDesignStyle(user.designStyle);
      } catch {}
    };
    loadPrefs();
  }, []);

  const handleFontSizeChange = async (newSize) => {
    setFontSize(newSize);
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    root.classList.add(newSize === 'small' ? 'text-sm' : newSize === 'large' ? 'text-lg' : 'text-base');
    try { await base44.auth.updateMe({ fontSize: newSize }); } catch {}
  };

  const handleDesignStyleChange = async (newStyle) => {
    setDesignStyle(newStyle);
    const root = document.documentElement;
    if (newStyle === 'liquid') {
      root.classList.add('theme-liquid');
    } else {
      root.classList.remove('theme-liquid');
    }
    try { await base44.auth.updateMe({ designStyle: newStyle }); } catch {}
  };

  const handleSave = () => {
    setSettings(formData);
    setSuccess('Saved!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const tenants = await base44.entities.Tenant.list();
      for (const t of tenants) await base44.entities.Tenant.delete(t.id);
      const statements = await base44.entities.Statement.list();
      for (const s of statements) await base44.entities.Statement.delete(s.id);
      localStorage.removeItem('svp_settings');
      await base44.auth.logout();
    } catch (error) {
      alert('Error deleting account. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-[420px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Settings
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Receipt Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide">Receipt Settings</h3>
              {[
                { id: 'organizationName', label: 'Organization Name' },
                { id: 'receiptTitle', label: 'Receipt Title' },
                { id: 'contactPhone', label: 'Contact Phone' },
                { id: 'systemName', label: 'System Name' },
              ].map(field => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={field.id} className="text-sm">{field.label}</Label>
                  <Input
                    id={field.id}
                    value={formData[field.id] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="h-10"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Save className="w-4 h-4 mr-1.5" />
                  {success || 'Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
                </Button>
              </div>
            </div>

            {/* Text Size */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <Type className="w-4 h-4" /> Text Size
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {FONT_SIZES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleFontSizeChange(opt.value)}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-center text-sm font-medium ${
                      fontSize === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Design Style */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-4 h-4" /> Design Style
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDesignStyleChange('default')}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    designStyle === 'default'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span>Default Solid</span>
                </button>
                <button
                  onClick={() => handleDesignStyleChange('liquid')}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    designStyle === 'liquid'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-400'
                  }`}
                >
                  <Droplets className="w-5 h-5" />
                  <span>Liquid Glass</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-3 border border-red-200 rounded-xl p-4 bg-red-50">
              <h3 className="font-semibold text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Danger Zone
              </h3>
              <p className="text-xs text-slate-600">Permanently delete your account and all data.</p>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete Account
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all tenants, receipts, and settings. This cannot be undone!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700">
              {deleteLoading ? 'Deleting...' : 'Yes, Delete Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}