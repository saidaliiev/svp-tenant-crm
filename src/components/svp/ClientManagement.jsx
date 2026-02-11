import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
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
import { Plus, Upload, Pencil, Trash2, UserCheck, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Papa from 'papaparse';
import ExportClientsPDF from './ExportClientsPDF';

export default function ClientManagement({ tenants = [], tenantsLoading, statements, onSelectTenant }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [deleteTenant, setDeleteTenant] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const createTenantMutation = useMutation({
    mutationFn: (data) => base44.entities.Tenant.create(data),
    onSuccess: () => queryClient.invalidateQueries(['tenants'])
  });

  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tenant.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['tenants'])
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (id) => base44.entities.Tenant.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['tenants'])
  });

  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    address: '',
    previousDebt: 0,
    credit: 0,
    monthlyRent: 143.40,
    weeklyRasAmount: 103.40,
    weeklyTenantPayment: 40
  });

  const generateDisplayId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      fullName: '',
      address: '',
      previousDebt: 0,
      credit: 0,
      monthlyRent: 143.40,
      weeklyRasAmount: 103.40,
      weeklyTenantPayment: 40
    });
    setEditingTenant(null);
    setError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEdit = (tenant) => {
    setFormData({
      id: tenant.id,
      fullName: tenant.fullName,
      address: tenant.address,
      previousDebt: tenant.currentBalance || 0,
      credit: tenant.credit || 0,
      monthlyRent: tenant.monthlyRent || 143.40,
      weeklyRasAmount: tenant.weeklyRasAmount || 103.40,
      weeklyTenantPayment: tenant.weeklyTenantPayment || 40
    });
    setEditingTenant(tenant);
    setShowAddDialog(true);
  };

  const handleSaveTenant = async () => {
    if (!formData.fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    const tenantData = {
      displayId: editingTenant ? editingTenant.displayId : generateDisplayId(),
      fullName: formData.fullName.trim(),
      address: formData.address.trim(),
      currentBalance: parseFloat(formData.previousDebt) || 0,
      credit: parseFloat(formData.credit) || 0,
      monthlyRent: parseFloat(formData.monthlyRent) || 143.40,
      weeklyRasAmount: parseFloat(formData.weeklyRasAmount) || 103.40,
      weeklyTenantPayment: parseFloat(formData.weeklyTenantPayment) || 40
    };
    
    try {
      if (editingTenant) {
        await updateTenantMutation.mutateAsync({ id: editingTenant.id, data: tenantData });
        setSuccess('Tenant updated successfully');
      } else {
        await createTenantMutation.mutateAsync(tenantData);
        setSuccess('Tenant added successfully');
      }
      setShowAddDialog(false);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error saving tenant: ' + err.message);
    }
  };

  const handleDeleteTenant = async () => {
    if (deleteTenant) {
      try {
        await deleteTenantMutation.mutateAsync(deleteTenant.id);
        setDeleteTenant(null);
        setSuccess('Tenant deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error deleting tenant: ' + err.message);
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      setError('Please upload a CSV or Excel file');
      return;
    }

    setError('');
    setSuccess('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error parsing file: ' + results.errors[0].message);
          return;
        }

        const data = results.data;
        if (data.length === 0) {
          setError('No data found in file');
          return;
        }

        // Flexible column detection using keywords
        const findColumn = (row, keywords) => {
          const keys = Object.keys(row);
          for (const key of keys) {
            const lowerKey = key.toLowerCase();
            if (keywords.some(kw => lowerKey.includes(kw))) {
              return row[key];
            }
          }
          return null;
        };

        // Group payments by ID or normalized name
        const clientsMap = new Map();
        let totalRows = 0;

        data.forEach(row => {
          totalRows++;
          const tenantName = findColumn(row, ['name', 'tenant', 'client', 'full_name', 'fullname']);
          const accountNumber = findColumn(row, ['id', 'account', 'number', 'acc']);
          const paymentAmount = parseFloat(findColumn(row, ['amount', 'payment', 'sum', 'total']) || 0);

          if (!tenantName && !accountNumber) return;

          // Normalize name for matching
          const normalizedName = tenantName ? tenantName.trim().toLowerCase() : '';
          const key = accountNumber || normalizedName;
          
          if (clientsMap.has(key)) {
            const existing = clientsMap.get(key);
            existing.totalPayments += paymentAmount || 0;
          } else {
            clientsMap.set(key, {
              id: accountNumber || null,
              fullName: tenantName ? tenantName.trim() : 'Unknown',
              normalizedName,
              address: findColumn(row, ['address', 'addr', 'location']) || '',
              totalPayments: paymentAmount || 0,
              monthlyRent: 143.40,
              weeklyRasAmount: 103.40,
              weeklyTenantPayment: 40
            });
          }
        });

        let newCount = 0;
        let updatedCount = 0;
        let totalCreditAdded = 0;

        clientsMap.forEach((value) => {
          // Check if client already exists by ID or normalized name
          const existingTenant = tenants.find(t => 
            (value.id && t.id === value.id) || 
            t.fullName.toLowerCase() === value.normalizedName
          );

          if (existingTenant) {
            // Update existing tenant - add payment as credit (reduce debt)
            const newBalance = (existingTenant.currentBalance || 0) - value.totalPayments;
            updateTenantMutation.mutate({ id: existingTenant.id, data: { currentBalance: newBalance } });
            updatedCount++;
            totalCreditAdded += value.totalPayments;
          } else {
            // Create new tenant
            const newTenant = {
              displayId: generateDisplayId(),
              fullName: value.fullName,
              address: value.address,
              currentBalance: -value.totalPayments,
              monthlyRent: 143.40,
              weeklyRasAmount: 103.40,
              weeklyTenantPayment: 40
            };
            createTenantMutation.mutate(newTenant);
            newCount++;
            totalCreditAdded += value.totalPayments;
          }
        });

        if (newCount > 0 || updatedCount > 0) {
          const creditMsg = totalCreditAdded > 0 ? ` (+€${totalCreditAdded.toFixed(2)} credit added total)` : '';
          setSuccess(`Processed ${totalRows} rows: ${newCount} new tenants created, ${updatedCount} updated${creditMsg}`);
        } else {
          setError('No valid tenant data found in file');
        }
        
        setTimeout(() => {
          setSuccess('');
          setError('');
        }, 5000);
      },
      error: (error) => {
        setError('Error reading file: ' + error.message);
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const getLastReceiptDate = (clientId) => {
    const clientStatements = statements.filter(s => s.clientId === clientId);
    if (clientStatements.length === 0) return null;
    return clientStatements.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))[0].createdDate;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-IE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(num);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl">Tenant Management</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleOpenAdd}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV/Excel
            </Button>
            <ExportClientsPDF tenants={tenants} />
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {tenantsLoading ? (
          <div className="text-center py-12 text-slate-500">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No tenants yet</p>
            <p className="text-sm">Add your first tenant or import from a file</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Full Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Address</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden sm:table-cell">Last Receipt</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant, index) => (
                  <tr 
                    key={tenant.id} 
                    className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    <td className="py-3 px-4 font-mono text-sm text-slate-600">{tenant.displayId || tenant.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{tenant.fullName}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm max-w-xs truncate">{tenant.address}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${(tenant.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(tenant.currentBalance || 0)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 hidden sm:table-cell">
                      {formatDate(getLastReceiptDate(tenant.id))}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          onClick={() => onSelectTenant(tenant.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">Select</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(tenant)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTenant(tenant)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowAddDialog(open); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
              <DialogDescription>
                {editingTenant ? 'Update the tenant information below.' : 'Enter the tenant details below.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="previousDebt">Previous Debt (€)</Label>
                    <Input
                      id="previousDebt"
                      type="number"
                      step="0.01"
                      value={formData.previousDebt}
                      onChange={(e) => setFormData(prev => ({ ...prev, previousDebt: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit">Credit (€)</Label>
                    <Input
                      id="credit"
                      type="number"
                      step="0.01"
                      value={formData.credit}
                      onChange={(e) => setFormData(prev => ({ ...prev, credit: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyRent">Weekly Rent (€)</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      step="0.01"
                      value={formData.monthlyRent}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyTenantPayment">Weekly Tenant Payment (€)</Label>
                    <Input
                      id="weeklyTenantPayment"
                      type="number"
                      step="0.01"
                      value={formData.weeklyTenantPayment}
                      onChange={(e) => setFormData(prev => ({ ...prev, weeklyTenantPayment: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weeklyRasAmount">Weekly RAS (€)</Label>
                  <Input
                    id="weeklyRasAmount"
                    type="number"
                    step="0.01"
                    value={formData.weeklyRasAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, weeklyRasAmount: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { resetForm(); setShowAddDialog(false); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTenant}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {editingTenant ? 'Update' : 'Add'} Tenant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTenant} onOpenChange={(open) => !open && setDeleteTenant(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deleteTenant?.fullName}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteTenant}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}