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
import { Plus, Upload, Pencil, Trash2, UserCheck, Users, AlertCircle, User } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Papa from 'papaparse';
import ExportClientsPDF from './ExportClientsPDF';
import TenantProfile from './TenantProfile';
import TenantCardMobile from './TenantCardMobile';
import { TENANT_AVATARS, getRandomAvatar } from './avatars';

export default function ClientManagement({ tenants = [], tenantsLoading, statements, onSelectTenant, settings }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [deleteTenant, setDeleteTenant] = useState(null);
  const [profileTenant, setProfileTenant] = useState(null);
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
    city: '',
    county: '',
    eircode: '',
    phoneNumber: '',
    moveInDate: '',
    previousDebt: 0,
    credit: 0,
    monthlyRent: 143.40,
    weeklyRasAmount: 103.40,
    weeklyTenantPayment: 40,
    lodgmentRange: '',
    paymentKeywords: '',
    expectedMonthlyTenantPayment: 0,
    avatarUrl: ''
  });

  const generateDisplayId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      fullName: '',
      address: '',
      city: '',
      county: '',
      eircode: '',
      phoneNumber: '',
      moveInDate: '',
      previousDebt: 0,
      credit: 0,
      monthlyRent: 143.40,
      weeklyRasAmount: 103.40,
      weeklyTenantPayment: 40,
      lodgmentRange: '',
      paymentKeywords: '',
      expectedMonthlyTenantPayment: 0,
      avatarUrl: ''
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
      city: tenant.city || '',
      county: tenant.county || '',
      eircode: tenant.eircode || '',
      phoneNumber: tenant.phoneNumber || '',
      moveInDate: tenant.moveInDate || '',
      previousDebt: tenant.currentBalance ?? 0,
      credit: tenant.credit ?? 0,
      monthlyRent: tenant.monthlyRent ?? 143.40,
      weeklyRasAmount: tenant.weeklyRasAmount ?? 103.40,
      weeklyTenantPayment: tenant.weeklyTenantPayment ?? 40,
      lodgmentRange: tenant.lodgmentRange ?? '',
      paymentKeywords: (tenant.paymentKeywords || []).join(', '),
      expectedMonthlyTenantPayment: tenant.expectedMonthlyTenantPayment ?? (tenant.weeklyTenantPayment * 4.3) ?? 0,
      avatarUrl: tenant.avatarUrl || ''
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
      city: formData.city.trim() || null,
      county: formData.county.trim() || null,
      eircode: formData.eircode.trim() || null,
      phoneNumber: formData.phoneNumber.trim() || null,
      moveInDate: formData.moveInDate || null,
      currentBalance: parseFloat(formData.previousDebt) || 0,
      credit: parseFloat(formData.credit) || 0,
      monthlyRent: parseFloat(formData.monthlyRent) || 0,
      weeklyRasAmount: formData.weeklyRasAmount === '' ? 0 : parseFloat(formData.weeklyRasAmount),
      weeklyTenantPayment: parseFloat(formData.weeklyTenantPayment) || 0,
      lodgmentRange: formData.lodgmentRange.trim() || null,
      paymentKeywords: formData.paymentKeywords ? formData.paymentKeywords.split(',').map(k => k.trim()).filter(k => k) : [],
      expectedMonthlyTenantPayment: parseFloat(formData.expectedMonthlyTenantPayment) || 0,
      avatarUrl: formData.avatarUrl || null
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

  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleDeleteTenant = async () => {
    if (deleteTenant) {
      if (deleteConfirmation.length < 6) {
        setError('Please provide a reason (at least 6 characters) to delete the tenant.');
        return;
      }
      try {
        await deleteTenantMutation.mutateAsync(deleteTenant.id);
        setDeleteTenant(null);
        setDeleteConfirmation('');
        setError('');
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
          const tenantName = findColumn(row, ['full name', 'full_name', 'fullname', 'name', 'tenant']);
          const accountNumber = findColumn(row, ['client id', 'client_id', 'id', 'account', 'number']);
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
              monthlyRent: 0,
              weeklyRasAmount: 0,
              weeklyTenantPayment: 0
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
    <Card className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl dark:shadow-gray-950/20 border-0 dark:border dark:border-gray-700/50">
      <CardHeader className="border-b dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3" data-tutorial="tenant-header">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Tenant Management</CardTitle>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Button 
              onClick={handleOpenAdd}
              size="sm"
              data-tour="btn-add-tenant"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Add Tenant</span>
              <span className="xs:hidden">Add</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              data-tour="btn-import"
              onClick={() => fileInputRef.current?.click()}
              className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs sm:text-sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Import CSV/Excel</span>
              <span className="sm:hidden">Import</span>
            </Button>
            <ExportClientsPDF tenants={tenants} settings={settings} />
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
      <CardContent className="p-3 sm:p-4 md:p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
            <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {tenantsLoading ? (
          <div className="text-center py-12 text-slate-500 dark:text-gray-400">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No tenants yet</p>
            <p className="text-sm">Add your first tenant or import from a file</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="sm:hidden space-y-2.5" data-tour="tenant-table">
              {tenants.map((tenant, index) => (
                <TenantCardMobile
                  key={tenant.id}
                  tenant={tenant}
                  index={index}
                  onProfile={(t) => setProfileTenant(t)}
                  onSelect={onSelectTenant}
                  onEdit={handleOpenEdit}
                  onDelete={(t) => setDeleteTenant(t)}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
            {/* Desktop: Table layout */}
             <div className="hidden sm:block overflow-x-auto" data-tour="tenant-table">
               <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm whitespace-nowrap">Full Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm whitespace-nowrap">Address</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm whitespace-nowrap">Balance</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant, index) => (
                    <tr 
                      key={tenant.id} 
                      className={`border-b border-slate-100 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/50 dark:bg-gray-800/30'}`}
                      onClick={() => setProfileTenant(tenant)}
                    >
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-gray-200 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 shadow-sm relative">
                            <img src={tenant.avatarUrl || getRandomAvatar(tenant.id)} alt="" className="w-full h-full object-cover scale-[1.35]" />
                          </div>
                          {tenant.fullName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-gray-400 text-sm whitespace-nowrap">{tenant.address}</td>
                      <td className={`py-3 px-4 text-right font-semibold text-sm whitespace-nowrap ${(tenant.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(tenant.currentBalance || 0)}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" onClick={() => setProfileTenant(tenant)} data-tour={index === 0 ? "btn-profile" : undefined} className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white h-8 px-3 text-xs">
                            <User className="w-4 h-4" />
                            <span className="hidden lg:inline ml-1">Profile</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(tenant)} data-tour={index === 0 ? "btn-edit" : undefined} className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 h-8 px-3">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteTenant(tenant)} data-tour={index === 0 ? "btn-delete" : undefined} className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 px-3">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowAddDialog(open); }}>
          <DialogContent className="sm:max-w-4xl max-h-[95vh] p-4 sm:p-6 overflow-hidden flex flex-col">
            <DialogHeader className="shrink-0 mb-2">
              <DialogTitle>{editingTenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                {error && (
                  <Alert variant="destructive" className="md:col-span-3 py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Left Column - Personal Info */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="moveInDate">Move-in Date</Label>
                    <Input
                      id="moveInDate"
                      type="date"
                      value={formData.moveInDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, moveInDate: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Avatar (Optional)</Label>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, avatarUrl: '' }))}
                        className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center border-2 transition-all ${!formData.avatarUrl ? 'border-blue-500 bg-blue-50 text-blue-500 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:border-blue-300'}`}
                      >
                        <User className="w-4 h-4" />
                      </button>
                      {TENANT_AVATARS.map((url, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                          className={`w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer border-2 transition-all hover:scale-105 relative ${formData.avatarUrl === url ? 'border-blue-500 shadow-md scale-105' : 'border-transparent'}`}
                        >
                          <img
                            src={url}
                            alt={`Avatar ${idx}`}
                            className="w-full h-full object-cover scale-[1.35]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle Column - Address */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">Town / City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      value={formData.county}
                      onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="eircode">Eircode</Label>
                    <Input
                      id="eircode"
                      value={formData.eircode}
                      onChange={(e) => setFormData(prev => ({ ...prev, eircode: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Right Column - Financials */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="previousDebt">Prev Debt</Label>
                      <Input
                        id="previousDebt"
                        type="number"
                        step="0.01"
                        value={formData.previousDebt}
                        onChange={(e) => setFormData(prev => ({ ...prev, previousDebt: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="credit">Credit</Label>
                      <Input
                        id="credit"
                        type="number"
                        step="0.01"
                        value={formData.credit}
                        onChange={(e) => setFormData(prev => ({ ...prev, credit: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="monthlyRent">W. Rent</Label>
                      <Input
                        id="monthlyRent"
                        type="number"
                        step="0.01"
                        value={formData.monthlyRent}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthlyRent: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="weeklyRasAmount">W. RAS</Label>
                      <Input
                        id="weeklyRasAmount"
                        type="number"
                        step="0.01"
                        value={formData.weeklyRasAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, weeklyRasAmount: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="weeklyTenantPayment">Weekly Tenant Payment</Label>
                    <Input
                      id="weeklyTenantPayment"
                      type="number"
                      step="0.01"
                      value={formData.weeklyTenantPayment}
                      onChange={(e) => setFormData(prev => ({ ...prev, weeklyTenantPayment: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                  
                  {/* Auto Detection in right column to save space */}
                  <div className="pt-2 border-t mt-1">
                    <h4 className="font-semibold text-[11px] text-slate-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Payment Matching</h4>
                    <div className="space-y-2">
                      <Input
                        id="lodgmentRange"
                        value={formData.lodgmentRange}
                        onChange={(e) => setFormData(prev => ({ ...prev, lodgmentRange: e.target.value }))}
                        placeholder="Lodgment (e.g. 3251-3300)"
                        className="h-9 text-xs"
                      />
                      <Input
                        id="paymentKeywords"
                        value={formData.paymentKeywords}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentKeywords: e.target.value }))}
                        placeholder="Keywords (e.g. M BARR)"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="shrink-0 mt-4 pt-4 border-t">
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
        <AlertDialog open={!!deleteTenant} onOpenChange={(open) => {
          if (!open) {
            setDeleteTenant(null);
            setDeleteConfirmation('');
            setError('');
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deleteTenant?.fullName}</strong>? This action cannot be undone.
                <div className="mt-4">
                  <Label htmlFor="deleteConfirmation" className="text-red-500">Reason for deletion (min 6 characters):</Label>
                  <Input
                    id="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="e.g. Moved out"
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteTenant}
                disabled={deleteConfirmation.length < 6}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Tenant Profile Modal */}
        <TenantProfile
          tenant={profileTenant}
          statements={statements}
          isOpen={!!profileTenant}
          onClose={() => setProfileTenant(null)}
        />
      </CardContent>
    </Card>
  );
}