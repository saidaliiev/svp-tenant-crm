import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings, Save, RotateCcw, Trash2, AlertTriangle, Type, Layers, Droplets } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DEFAULT_SETTINGS = {
  organizationName: "Society of Saint Vincent de Paul",
  receiptTitle: "Monthly Rent Statement",
  contactPhone: "086 7856869",
  systemName: "Society of Saint Vincent de Paul, Carndonagh"
};

const FONT_SIZES = [
  { value: 'small', label: 'Small', class: 'text-sm' },
  { value: 'medium', label: 'Medium', class: 'text-base' },
  { value: 'large', label: 'Large', class: 'text-lg' },
];

export default function SettingsTab({ settings, setSettings }) {
  const [formData, setFormData] = useState(settings);
  const [success, setSuccess] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [fontSize, setFontSize] = useState('medium');
  const [designStyle, setDesignStyle] = useState('default');
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const user = await base44.auth.me();
        if (user.fontSize) setFontSize(user.fontSize);
        if (user.designStyle) setDesignStyle(user.designStyle);
      } catch {}
      setPrefsLoaded(true);
    };
    loadPrefs();
  }, []);

  useEffect(() => {
    if (!prefsLoaded) return;
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    const sizeClass = FONT_SIZES.find(f => f.value === fontSize)?.class || 'text-base';
    root.classList.add(sizeClass);
  }, [fontSize, prefsLoaded]);

  const handleFontSizeChange = async (newSize) => {
    setFontSize(newSize);
    try {
      await base44.auth.updateMe({ fontSize: newSize });
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  };

  const handleDesignStyleChange = async (newStyle) => {
    setDesignStyle(newStyle);
    const root = document.documentElement;
    if (newStyle === 'liquid') {
      root.classList.add('theme-liquid');
    } else {
      root.classList.remove('theme-liquid');
    }
    try {
      await base44.auth.updateMe({ designStyle: newStyle });
    } catch (e) {}
  };

  const handleSave = () => {
    setSettings(formData);
    setSuccess('Settings saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
    setSuccess('Settings reset to defaults');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const tenants = await base44.entities.Tenant.list();
      for (const tenant of tenants) {
        await base44.entities.Tenant.delete(tenant.id);
      }
      const statements = await base44.entities.Statement.list();
      for (const statement of statements) {
        await base44.entities.Statement.delete(statement.id);
      }
      localStorage.removeItem('svp_settings');
      await base44.auth.logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Receipt Settings */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Receipt Settings</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Configure what appears on printed receipts</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="organizationName" className="text-sm font-medium">Organization Name</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  placeholder="Enter organization name"
                  className="h-11"
                />
                <p className="text-xs text-slate-500">Displayed in the header and on receipts</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receiptTitle" className="text-sm font-medium">Receipt Title</Label>
                <Input
                  id="receiptTitle"
                  value={formData.receiptTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, receiptTitle: e.target.value }))}
                  placeholder="Monthly Rent Statement"
                  className="h-11"
                />
                <p className="text-xs text-slate-500">Title for monthly rent statements</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactPhone" className="text-sm font-medium">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="Enter contact phone"
                  className="h-11"
                />
                <p className="text-xs text-slate-500">Phone number for tenant inquiries</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="systemName" className="text-sm font-medium">System Name</Label>
                <Input
                  id="systemName"
                  value={formData.systemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemName: e.target.value }))}
                  placeholder="Enter system name"
                  className="h-11"
                />
                <p className="text-xs text-slate-500">Displayed in the app header and receipt footer</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline" onClick={handleReset} className="border-slate-300 w-full sm:w-auto">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Text Size + Danger Zone */}
        <div className="space-y-6">
          {/* Text Size Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Type className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Text Size</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Adjust the text size to your preference</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-3 gap-2">
                {FONT_SIZES.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleFontSizeChange(opt.value)}
                    className={`py-2.5 px-3 rounded-xl border-2 transition-all text-center ${
                      fontSize === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <span className={`font-medium ${opt.value === 'small' ? 'text-xs' : opt.value === 'medium' ? 'text-sm' : 'text-base'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 border-t-2 border-t-red-400">
            <CardHeader className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Irreversible actions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-slate-700 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All tenant records</li>
                <li>All receipt history</li>
                <li>All settings</li>
                <li>Your user account</li>
              </ul>
              <p className="mt-3 font-semibold text-red-600">This action cannot be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}