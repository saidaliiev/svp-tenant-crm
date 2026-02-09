import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
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
import { format } from 'date-fns';

export default function CreateReceipt({ clients, statements, settings, selectedClientId, onReceiptCreated }) {
  const [clientId, setClientId] = useState('');
  const [startingDebt, setStartingDebt] = useState(0);
  const [credit, setCredit] = useState(0);
  const [includeDebt, setIncludeDebt] = useState(true);
  const [includeCredit, setIncludeCredit] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingReceiptData, setPendingReceiptData] = useState(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [lastStatement, setLastStatement] = useState(null);
  const [daysToLoad, setDaysToLoad] = useState(30);

  const selectedClient = clients.find(c => c.id === clientId);

  // When selectedClientId prop changes (from client management)
  useEffect(() => {
    if (selectedClientId) {
      setClientId(selectedClientId);
    }
  }, [selectedClientId]);

  // When client is selected, load last statement and ask if user wants to load data
  useEffect(() => {
    if (clientId && selectedClient) {
      loadLastStatement();
      setCredit(selectedClient.credit || 0);

      // Generate notes with payment info
      const weeklyTenant = selectedClient.weeklyTenantPayment || 40;
      const weeklyRas = selectedClient.weeklyRasAmount || 103.40;
      setNotes(`Your monthly rent statement is shown above. You should pay €${weeklyTenant.toFixed(2)} per week (RAS covers €${weeklyRas.toFixed(2)} per week). Contact SVP at 086 7856869 if you need assistance.`);

      initializeTransaction();
    }
  }, [clientId]);
  
  const loadLastStatement = async () => {
    try {
      const allStatements = await base44.entities.Statement.filter({ clientId }, '-created_date', 1);
      if (allStatements.length > 0) {
        setLastStatement(allStatements[0]);
        setShowLoadDialog(true);
      } else {
        setStartingDebt(selectedClient.currentBalance || 0);
      }
    } catch (err) {
      console.error('Error loading last statement:', err);
      setStartingDebt(selectedClient.currentBalance || 0);
    }
  };
  
  const handleLoadStatementData = () => {
    if (lastStatement) {
      const endDate = new Date(lastStatement.endDate);
      const newStartDate = new Date(endDate);
      newStartDate.setDate(newStartDate.getDate() + 1);
      
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + daysToLoad - 1);
      
      setStartDate(newStartDate.toISOString().split('T')[0]);
      setEndDate(newEndDate.toISOString().split('T')[0]);
      setStartingDebt(lastStatement.finalBalance || 0);
    }
    setShowLoadDialog(false);
  };
  
  const handleSkipLoadStatement = () => {
    setStartingDebt(selectedClient.currentBalance || 0);
    setShowLoadDialog(false);
  };

  const initializeTransaction = () => {
    const client = clients.find(c => c.id === clientId);
    setTransactions([{
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      rentDue: client?.monthlyRent || 143.40,
      tenantPayment: client?.weeklyTenantPayment || 40,
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
      tenantPayment: client?.weeklyTenantPayment || 40,
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
  const debtAmount = includeDebt ? (parseFloat(startingDebt) || 0) : 0;
  const creditAmount = includeCredit ? (parseFloat(credit) || 0) : 0;
  const finalTenantBalance = debtAmount - creditAmount + netTenantObligation;

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    const formatted = new Intl.NumberFormat('en-IE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(Math.abs(num));
    return num < 0 ? '-' + formatted : formatted;
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
      credit: parseFloat(credit) || 0,
      includeDebt,
      includeCredit,
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

    setPendingReceiptData(receiptData);
    setShowSaveDialog(true);
  };
  
  const handleConfirmGenerate = async (shouldSave) => {
    if (!pendingReceiptData) return;
    
    // Generate PDF
    generateReceiptPDF(pendingReceiptData, settings);
    
    // Save to cloud if requested
    if (shouldSave) {
      try {
        await base44.entities.Statement.create({
          receiptId: pendingReceiptData.id,
          clientId: pendingReceiptData.clientId,
          clientName: pendingReceiptData.clientName,
          clientAddress: pendingReceiptData.clientAddress,
          startDate: pendingReceiptData.startDate,
          endDate: pendingReceiptData.endDate,
          startingDebt: pendingReceiptData.startingDebt,
          credit: pendingReceiptData.credit,
          includeDebt: pendingReceiptData.includeDebt,
          includeCredit: pendingReceiptData.includeCredit,
          transactions: pendingReceiptData.transactions,
          totalRentDue: pendingReceiptData.totalRentDue,
          totalTenantPayments: pendingReceiptData.totalTenantPayments,
          totalRasReceived: pendingReceiptData.totalRasReceived,
          finalBalance: pendingReceiptData.finalBalance,
          notes: pendingReceiptData.notes
        });
        setSuccess('Receipt generated and saved to cloud!');
      } catch (err) {
        console.error('Error saving to cloud:', err);
        setError('Receipt generated but failed to save to cloud');
      }
    } else {
      setSuccess('Receipt generated successfully!');
    }
    
    // Save to local history
    onReceiptCreated(pendingReceiptData);
    
    setTimeout(() => setSuccess(''), 3000);
    setShowSaveDialog(false);
    setPendingReceiptData(null);
    
    // Reset form
    setClientId('');
    setStartDate('');
    setEndDate('');
    setTransactions([]);
    setStartingDebt(0);
    setCredit(0);
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

            {/* Starting Debt and Credit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starting Debt (Previous Balance)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    step="0.01"
                    value={startingDebt}
                    onChange={(e) => setStartingDebt(e.target.value)}
                    className="h-11"
                  />
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Checkbox
                      id="includeDebt"
                      checked={includeDebt}
                      onCheckedChange={setIncludeDebt}
                    />
                    <Label htmlFor="includeDebt" className="cursor-pointer text-sm">Include</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Credit</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    step="0.01"
                    value={credit}
                    onChange={(e) => setCredit(e.target.value)}
                    className="h-11"
                  />
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Checkbox
                      id="includeCredit"
                      checked={includeCredit}
                      onCheckedChange={setIncludeCredit}
                    />
                    <Label htmlFor="includeCredit" className="cursor-pointer text-sm">Include</Label>
                  </div>
                </div>
              </div>
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
                    {includeDebt && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Previous Debt:</span>
                        <span className="font-medium">{formatCurrency(startingDebt)}</span>
                      </div>
                    )}
                    {includeCredit && (
                      <div className="flex justify-between text-green-600">
                        <span>– Credit:</span>
                        <span className="font-medium">{formatCurrency(credit)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Rent Due:</span>
                      <span className="font-medium">{formatCurrency(totalRentDue)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span>– Tenant Payments (paid):</span>
                        <span className="font-medium">{formatCurrency(totalTenantPayments)}</span>
                      </div>
                      <div className="flex justify-between text-blue-600">
                        <span>RAS Received (info only):</span>
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

        {/* Load Statement Dialog */}
        <AlertDialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Load Previous Statement Data?</AlertDialogTitle>
              <AlertDialogDescription>
                Found previous statement ending on {lastStatement ? format(new Date(lastStatement.endDate), 'dd MMM yyyy') : ''}. 
                Would you like to load data from the last statement?
                <div className="mt-4 space-y-2">
                  <Label>Period Duration (days)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={daysToLoad}
                    onChange={(e) => setDaysToLoad(parseInt(e.target.value) || 30)}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleSkipLoadStatement}>Start Fresh</AlertDialogCancel>
              <AlertDialogAction onClick={handleLoadStatementData}>
                Load Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save Confirmation Dialog */}
        <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Statement to Cloud?</AlertDialogTitle>
              <AlertDialogDescription>
                Do you want to save this statement period to the cloud database? This will allow you to access it later and track history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleConfirmGenerate(false)}>
                Just Print
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handleConfirmGenerate(true)}>
                Save & Print
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardContent>
    </Card>
  );
}