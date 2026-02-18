import React, { useState } from 'react';
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
import { Settings, Save, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DEFAULT_SETTINGS = {
  organizationName: "Society of Saint Vincent de Paul",
  receiptTitle: "Monthly Rent Statement",
  contactPhone: "086 7856869",
  systemName: "Society of Saint Vincent de Paul, Carndonagh"
};

// Note: Receipt title should always contain "Monthly" for monthly rent statements

export default function SettingsTab({ settings, setSettings }) {
  const [formData, setFormData] = useState(settings);
  const [success, setSuccess] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      // Get current user
      const user = await base44.auth.me();
      
      // Delete all user's tenants
      const tenants = await base44.entities.Tenant.list();
      for (const tenant of tenants) {
        await base44.entities.Tenant.delete(tenant.id);
      }
      
      // Delete all user's statements
      const statements = await base44.entities.Statement.list();
      for (const statement of statements) {
        await base44.entities.Statement.delete(statement.id);
      }
      
      // Clear localStorage
      localStorage.removeItem('svp_settings');
      
      // Logout
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
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-xl">Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
              placeholder="Enter organization name"
              className="h-11"
            />
            <p className="text-xs text-slate-500">Displayed in the header and on receipts</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptTitle">Receipt Title (Monthly Statements)</Label>
            <Input
              id="receiptTitle"
              value={formData.receiptTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, receiptTitle: e.target.value }))}
              placeholder="Monthly Rent Statement"
              className="h-11"
            />
            <p className="text-xs text-slate-500">Title for monthly rent statements (default: "Monthly Rent Statement")</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              placeholder="Enter contact phone"
              className="h-11"
            />
            <p className="text-xs text-slate-500">Phone number for tenant inquiries</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemName">System Name</Label>
            <Input
              id="systemName"
              value={formData.systemName}
              onChange={(e) => setFormData(prev => ({ ...prev, systemName: e.target.value }))}
              placeholder="Enter system name"
              className="h-11"
            />
            <p className="text-xs text-slate-500">Displayed in the app header and receipt footer</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-slate-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-10 pt-6 border-t border-red-200 dark:border-red-900">
          <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4">
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
        </div>
      </CardContent>

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
    </Card>
  );
}