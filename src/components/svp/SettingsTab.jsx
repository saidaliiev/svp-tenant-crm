import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Save, RotateCcw } from 'lucide-react';

const DEFAULT_SETTINGS = {
  organizationName: "Society of Saint Vincent de Paul",
  receiptTitle: "Monthly Rent Statement",
  contactPhone: "086 7856869",
  systemName: "SVP Housing Support System"
};

// Note: Receipt title should always contain "Monthly" for monthly rent statements

export default function SettingsTab({ settings, setSettings }) {
  const [formData, setFormData] = useState(settings);
  const [success, setSuccess] = useState('');

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

        {/* Data Management Section */}
        <div className="mt-10 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Data Storage</h3>
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
            <p className="mb-2">
              <strong>All data is stored locally</strong> in your browser's localStorage:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="bg-slate-200 px-1 rounded">svp_clients</code> – Client/tenant records</li>
              <li><code className="bg-slate-200 px-1 rounded">svp_statements</code> – Receipt history</li>
              <li><code className="bg-slate-200 px-1 rounded">svp_settings</code> – App settings</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Data persists across browser sessions. Clearing browser data will remove all stored information.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}