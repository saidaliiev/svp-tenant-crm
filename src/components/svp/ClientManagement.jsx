import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function ClientManagement({ clients, setClients, statements, onSelectClient }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteClient, setDeleteClient] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

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

  const generateId = () => {
    return 'SVP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
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
    setEditingClient(null);
    setError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEdit = (client) => {
    setFormData({
      id: client.id,
      fullName: client.fullName,
      address: client.address,
      previousDebt: client.currentBalance || 0,
      credit: client.credit || 0,
      monthlyRent: client.monthlyRent || 143.40,
      weeklyRasAmount: client.weeklyRasAmount || 103.40,
      weeklyTenantPayment: client.weeklyTenantPayment || 40
    });
    setEditingClient(client);
    setShowAddDialog(true);
  };

  const handleSaveClient = () => {
    if (!formData.fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    const clientId = formData.id.trim() || generateId();
    
    if (editingClient) {
      setClients(prev => prev.map(c => 
        c.id === editingClient.id 
          ? { 
              ...c, 
              id: clientId,
              fullName: formData.fullName.trim(),
              address: formData.address.trim(),
              currentBalance: parseFloat(formData.previousDebt) || 0,
              credit: parseFloat(formData.credit) || 0,
              monthlyRent: parseFloat(formData.monthlyRent) || 143.40,
              weeklyRasAmount: parseFloat(formData.weeklyRasAmount) || 103.40,
              weeklyTenantPayment: parseFloat(formData.weeklyTenantPayment) || 40
            }
          : c
      ));
      setSuccess('Client updated successfully');
    } else {
      // Check for duplicate ID
      if (clients.some(c => c.id === clientId)) {
        setError('A client with this ID already exists');
        return;
      }
      
      const newClient = {
        id: clientId,
        fullName: formData.fullName.trim(),
        address: formData.address.trim(),
        currentBalance: parseFloat(formData.previousDebt) || 0,
        credit: parseFloat(formData.credit) || 0,
        monthlyRent: parseFloat(formData.monthlyRent) || 143.40,
        weeklyRasAmount: parseFloat(formData.weeklyRasAmount) || 103.40,
        weeklyTenantPayment: parseFloat(formData.weeklyTenantPayment) || 40,
        createdDate: new Date().toISOString(),
        lastReceiptDate: null
      };
      setClients(prev => [...prev, newClient]);
      setSuccess('Client added successfully');
    }

    setShowAddDialog(false);
    resetForm();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteClient = () => {
    if (deleteClient) {
      setClients(prev => prev.filter(c => c.id !== deleteClient.id));
      setDeleteClient(null);
      setSuccess('Client deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
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
          const existingClient = clients.find(c => 
            (value.id && c.id === value.id) || 
            c.fullName.toLowerCase() === value.normalizedName
          );

          if (existingClient) {
            // Update existing client - add payment as credit (reduce debt)
            setClients(prev => prev.map(c => {
              if (c.id === existingClient.id) {
                const newBalance = (c.currentBalance || 0) - value.totalPayments;
                return { ...c, currentBalance: newBalance };
              }
              return c;
            }));
            updatedCount++;
            totalCreditAdded += value.totalPayments;
          } else {
            // Create new client
            const newClient = {
              id: value.id || generateId(),
              fullName: value.fullName,
              address: value.address,
              currentBalance: -value.totalPayments, // Negative = credit
              monthlyRent: 143.40,
              weeklyRasAmount: 103.40,
              weeklyTenantPayment: 40,
              createdDate: new Date().toISOString(),
              lastReceiptDate: null
            };
            setClients(prev => [...prev, newClient]);
            newCount++;
            totalCreditAdded += value.totalPayments;
          }
        });

        if (newCount > 0 || updatedCount > 0) {
          const creditMsg = totalCreditAdded > 0 ? ` (+€${totalCreditAdded.toFixed(2)} credit added total)` : '';
          setSuccess(`Processed ${totalRows} rows: ${newCount} new clients created, ${updatedCount} updated${creditMsg}`);
        } else {
          setError('No valid client data found in file');
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
            <CardTitle className="text-xl">Client Management</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleOpenAdd}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV/Excel
            </Button>
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

        {clients.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No clients yet</p>
            <p className="text-sm">Add your first client or import from a file</p>
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
                {clients.map((client, index) => (
                  <tr 
                    key={client.id} 
                    className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    <td className="py-3 px-4 font-mono text-sm text-slate-600">{client.id}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{client.fullName}</td>
                    <td className="py-3 px-4 text-slate-600 text-sm max-w-xs truncate">{client.address}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${(client.currentBalance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(client.currentBalance || 0)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 hidden sm:table-cell">
                      {formatDate(getLastReceiptDate(client.id) || client.lastReceiptDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          onClick={() => onSelectClient(client.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">Select</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(client)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteClient(client)}
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
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
              <DialogDescription>
                {editingClient ? 'Update the client information below.' : 'Enter the client details below.'}
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
                <Label htmlFor="id">Client ID (auto-generated if empty)</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="SVP-XXXXX"
                  className="font-mono"
                />
              </div>
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
                onClick={handleSaveClient}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {editingClient ? 'Update' : 'Add'} Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteClient} onOpenChange={(open) => !open && setDeleteClient(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deleteClient?.fullName}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteClient}
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