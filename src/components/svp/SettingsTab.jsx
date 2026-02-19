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
import { Settings, Save, RotateCcw, Trash2, AlertTriangle, Sun, Moon, Monitor, Type } from 'lucide-react';
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

  // Appearance prefs — loaded from user entity
  const [theme, setTheme] = useState('system');
  const [fontSize, setFontSize] = useState('medium');
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load preferences from user entity on mount
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const user = await base44.auth.me();
        if (user.theme) setTheme(user.theme);
        if (user.fontSize) setFontSize(user.fontSize);
      } catch {}
      setPrefsLoaded(true);
    };
    loadPrefs();
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!prefsLoaded) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, prefsLoaded]);

  // Apply font size
  useEffect(() => {
    if (!prefsLoaded) return;
    const root = document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    const sizeClass = FONT_SIZES.find(f => f.value === fontSize)?.class || 'text-base';
    root.classList.add(sizeClass);
  }, [fontSize, prefsLoaded]);

  const saveAppearance = async (newTheme, newFontSize) => {
    try {
      await base44.auth.updateMe({ theme: newTheme, fontSize: newFontSize });
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    saveAppearance(newTheme, fontSize);
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    saveAppearance(theme, newSize);
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
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
          <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Receipt Settings */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Receipt Settings</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure what appears on printed receipts</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-5" data-tutorial="settings-org">
              <div className="space-y-1.5">
                <Label htmlFor="organizationName" className="text-sm font-medium">Organization Name</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  placeholder="Enter organization name"
                  className="h-11"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Displayed in the header and on receipts</p>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Title for monthly rent statements</p>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Phone number for tenant inquiries</p>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Displayed in the app header and receipt footer</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-3" data-tutorial="settings-save">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline" onClick={handleReset} className="border-slate-300 dark:border-slate-600 w-full sm:w-auto">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Appearance + Danger Zone */}
        <div className="space-y-6">
          {/* Appearance Card */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0" data-tutorial="settings-appearance">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize how the app looks</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-6">
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'system', icon: Monitor, label: 'System' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleThemeChange(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                        theme === opt.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <opt.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Type className="w-4 h-4" /> Text Size
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {FONT_SIZES.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleFontSizeChange(opt.value)}
                      className={`py-2.5 px-3 rounded-xl border-2 transition-all text-center ${
                        fontSize === opt.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <span className={`font-medium ${opt.value === 'small' ? 'text-xs' : opt.value === 'medium' ? 'text-sm' : 'text-base'}`}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Card */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0 border-t-2 border-t-red-400" data-tutorial="settings-danger">
            <CardHeader className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Irreversible actions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
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