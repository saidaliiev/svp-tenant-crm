import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Plus, Trash2, Printer, AlertCircle, Calculator, User } from 'lucide-react';
import TransactionRow from './TransactionRow';
import { generateReceiptPDF } from './pdfGenerator';

export default function CreateReceipt({ clients, statements, settings, selectedClientId, onReceiptCreated }) {
  const [clientId, setClientId] = useState('');
  const [startingDebt, setStartingDebt] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('Your monthly rent statement is shown above. Contact SVP at 084 7834665 if you need assistance.');
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedClient = clients.find(c => c.id === clientId);

  // When selectedClientId prop changes (from client management)
  useEffect(() => {
    if (selectedClientId) {
      setClientId(selectedClientId);
    }
  }, [selectedClientId]);

  // When client is selected, automatically load previous balance
  useEffect(() => {
    if (clientId && selectedClient) {
      const clientStatements = statements.filter(s => s.clientId === clientId);
      if (clientStatements.length > 0) {
        const latest = clientStatements.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))[0];
        setStartingDebt(latest.finalBalance || 0);
      } else {
        setStartingDebt(selectedClient.currentBalance || 0);
      }
      initializeTransaction();
    }
  }, [clientId]);

  const initializeTransaction = () => {
    const client = clients.find(c => c.id === clientId);
    setTransactions([{
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      rentDue: client?.monthlyRent || 143.40,
      tenantPayment: 40,
      tenantPaid: true,
      rasPayment: client?.weeklyRasAmount || 103.40,
      rasReceived: true
    }]);
  };



  const addTransaction = () => {
    const client = clients.find(c => c.id === clientId);
    setTransactions(prev => [...prev, {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      rentDue: client?.monthlyRent || 143.40,
      tenantPayment: 40,
      tenantPaid: true,
      rasPayment: client?.weeklyRasAmount || 103.40,
      rasReceived: true
    }]);
  };

  const updateTransaction = (id, field, value) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const deleteTransaction = (id) => {
    if (transactions.length > 1) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Calculate totals
  const totalRentDue = transactions.reduce((sum, t) => sum + (parseFloat(t.rentDue) || 0), 0);
  const totalTenantPayments = transactions
    .filter(t => t.tenantPaid)
    .reduce((sum, t) => sum + (parseFloat(t.tenantPayment) || 0), 0);
  const totalRasReceived = transactions
    .filter(t => t.rasReceived)
    .reduce((sum, t) => sum + (parseFloat(t.rasPayment) || 0), 0);
  const netTenantObligation = totalRentDue - totalTenantPayments - totalRasReceived;
  const finalTenantBalance = (parseFloat(startingDebt) || 0) + netTenantObligation;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  const handleGenerateReceipt = async () => {
    setError('');
    
    // Validation
    if (!clientId) {
      setError('Please select a client');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please enter start and end dates');
      return;
    }
    if (transactions.length === 0) {
      setError('Please add at least one transaction');
      return;
    }

    const client = clients.find(c => c.id === clientId);
    
    const receiptData = {
      id: 'RCP-' + Date.now().toString(36).toUpperCase(),
      clientId,
      clientName: client.fullName,
      clientAddress: client.address,
      startDate,
      endDate,
      startingDebt: parseFloat(startingDebt) || 0,
      transactions: transactions.map(t => ({
        ...t,
        rentDue: parseFloat(t.rentDue) || 0,
        tenantPayment: parseFloat(t.tenantPayment) || 0,
        rasPayment: parseFloat(t.rasPayment) || 0
      })),
      totalRentDue,
      totalTenantPayments,
      totalRasReceived,
      netTenantObligation,
      finalBalance: finalTenantBalance,
      notes,
      createdDate: new Date().toISOString()
    };

    // Generate PDF
    generateReceiptPDF(receiptData, settings);
    
    // Save to history
    onReceiptCreated(receiptData);
    
    setSuccess('Receipt generated successfully!');
    setTimeout(() => setSuccess(''), 3000);
    
    // Reset form
    setClientId('');
    setStartDate('');
    setEndDate('');
    setTransactions([]);
    setStartingDebt(0);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-xl">Create Receipt</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Client Selection */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Select Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Choose a client..." />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.fullName} ({client.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Info Display */}
        {selectedClient && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{selectedClient.fullName}</h3>
                <p className="text-sm text-slate-600">ID: {selectedClient.id}</p>
                <p className="text-sm text-slate-600">{selectedClient.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Period Selection */}
        {selectedClient && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Period End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Starting Debt */}
            <div className="space-y-2">
              <Label>Starting Debt (Previous Balance)</Label>
              <Input
                type="number"
                step="0.01"
                value={startingDebt}
                onChange={(e) => setStartingDebt(e.target.value)}
                className="h-11 max-w-xs"
              />
            </div>

            {/* Transactions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Transactions</Label>
                <Button
                  onClick={addTransaction}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Transaction
                </Button>
              </div>

              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                    onUpdate={(field, value) => updateTransaction(transaction.id, field, value)}
                    onDelete={() => deleteTransaction(transaction.id)}
                    canDelete={transactions.length > 1}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes for Receipt</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Balance Preview */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Balance Preview</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Previous Debt:</span>
                    <span className="font-medium">{formatCurrency(startingDebt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Rent Due:</span>
                    <span className="font-medium">{formatCurrency(totalRentDue)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>– Tenant Payments (paid):</span>
                    <span className="font-medium">{formatCurrency(totalTenantPayments)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>– RAS (received):</span>
                    <span className="font-medium">{formatCurrency(totalRasReceived)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className={`flex justify-between text-lg font-bold ${finalTenantBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <span>= Tenant Final Balance:</span>
                    <span>{formatCurrency(finalTenantBalance)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateReceipt}
              size="lg"
              className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
            >
              <Printer className="w-5 h-5 mr-2" />
              Generate and Print Receipt
            </Button>
          </>
        )}


      </CardContent>
    </Card>
  );
}