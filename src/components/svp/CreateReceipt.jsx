import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import AutomaticPaymentDetection from './AutomaticPaymentDetection';
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
import { FileText, Plus, Trash2, Printer, AlertCircle, Calculator, User, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionRow from './TransactionRow';
import { generateReceiptPDF } from './pdfGenerator';
import { format } from 'date-fns';

export default function CreateReceipt({ tenants = [], statements, settings, selectedTenantId, onReceiptCreated }) {
  const [mode, setMode] = useState('manual');
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
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Lifted state for AutomaticPaymentDetection (persists across tab switches)
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedPayments, setParsedPayments] = useState([]);
  const [autoStatementDateRange, setAutoStatementDateRange] = useState(null);

  const selectedTenant = tenants.find(t => t.id === clientId);
  const tenantInfoRef = React.useRef(null);

  // When selectedTenantId prop changes (from tenant management)
  useEffect(() => {
    if (selectedTenantId) {
      setClientId(selectedTenantId);
    }
  }, [selectedTenantId]);

  // When tenant is selected, load last statement and ask if user wants to load data
  useEffect(() => {
    if (clientId && selectedTenant) {
      loadLastStatement();
      setCredit(selectedTenant.credit || 0);
      initializeTransaction();
      // Auto-scroll to tenant info section
      setTimeout(() => {
        tenantInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [clientId]);
  
  const loadLastStatement = async () => {
    try {
      const allStatements = await base44.entities.Statement.filter({ clientId }, '-created_date', 1);
      if (allStatements.length > 0) {
        const lastStmt = allStatements[0];
        setLastStatement(lastStmt);
        
        const lastEndDate = new Date(lastStmt.endDate);
        const nextMonth = new Date(lastEndDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        
        const yearMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(yearMonth);
        
        setShowLoadDialog(true);
      } else {
        setStartingDebt(selectedTenant.currentBalance || 0);
      }
    } catch (err) {
      console.error('Error loading last statement:', err);
      setStartingDebt(selectedTenant.currentBalance || 0);
    }
  };
  
  const handleLoadStatementData = () => {
    if (lastStatement && selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      
      const newStartDate = new Date(year, month - 1, 1);
      const newEndDate = new Date(year, month, 0);
      
      setStartDate(newStartDate.toISOString().split('T')[0]);
      setEndDate(newEndDate.toISOString().split('T')[0]);
      setStartingDebt(lastStatement.finalBalance || 0);

      const daysInMonth = newEndDate.getDate();
      const weeks = Math.ceil(daysInMonth / 7);
      
      const tenant = tenants.find(t => t.id === clientId);
      const newTransactions = [];

      for (let i = 0; i < weeks; i++) {
        const transactionDate = new Date(newStartDate);
        transactionDate.setDate(transactionDate.getDate() + (i * 7));

        newTransactions.push({
          id: Date.now() + i,
          date: transactionDate.toISOString().split('T')[0],
          rentDue: tenant?.monthlyRent || 0,
          tenantPayment: tenant?.weeklyTenantPayment || 0,
          tenantPaid: true,
          rasPayment: tenant?.weeklyRasAmount || 0,
          rasReceived: (tenant?.weeklyRasAmount || 0) > 0
        });
      }

      setTransactions(newTransactions);
    }
    setShowLoadDialog(false);
  };

  const handleSkipLoadStatement = () => {
    setStartingDebt(selectedTenant.currentBalance || 0);
    setShowLoadDialog(false);
  };

  const initializeTransaction = () => {
    const tenant = tenants.find(t => t.id === clientId);
    setTransactions([{
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      rentDue: tenant?.monthlyRent || 0,
      tenantPayment: tenant?.weeklyTenantPayment || 0,
      tenantPaid: true,
      rasPayment: tenant?.weeklyRasAmount || 0,
      rasReceived: (tenant?.weeklyRasAmount || 0) > 0
    }]);
  };

  const addTransaction = () => {
    const tenant = tenants.find(t => t.id === clientId);
    setTransactions(prev => [...prev, {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      rentDue: tenant?.monthlyRent || 0,
      tenantPayment: tenant?.weeklyTenantPayment || 0,
      tenantPaid: true,
      rasPayment: tenant?.weeklyRasAmount || 0,
      rasReceived: (tenant?.weeklyRasAmount || 0) > 0
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

  const generateSmartNotes = () => {
    const tenant = tenants.find(t => t.id === clientId);
    const weeklyTenant = tenant?.weeklyTenantPayment || 40;
    const weeklyRas = tenant?.weeklyRasAmount || 103.40;

    const endDateObj = new Date(endDate);
    const monthName = endDateObj.toLocaleDateString('en-US', { month: 'long' });
    const nextMonth = new Date(endDateObj);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthName = nextMonth.toLocaleDateString('en-US', { month: 'long' });

    const debtAmt = includeDebt ? (parseFloat(startingDebt) || 0) : 0;

    let smartNote = `Your monthly rent statement is shown above. You should pay €${weeklyTenant.toFixed(2)} per week`;
    if (weeklyRas > 0) {
      smartNote += ` (RAS covers €${weeklyRas.toFixed(2)} per week)`;
    }
    smartNote += `. Contact SVP at 086 7856869 if you need assistance.\n\n`;

    if (finalTenantBalance < 0) {
      const creditAmt = Math.abs(finalTenantBalance);
      smartNote += `Your credit balance is now €${creditAmt.toFixed(2)}, this amount will be carried forward to ${nextMonthName}.`;
    } else if (finalTenantBalance > 0) {
      // Tenant portion = total rent due minus RAS portion
      const tenantPortionRent = totalRentDue - totalRasReceived;
      const totalRentWithRas = totalRentDue;

      smartNote += `You have paid €${totalTenantPayments.toFixed(2)} this month, your rent for the month of ${monthName} is €${tenantPortionRent.toFixed(2)} (with RAS €${totalRentWithRas.toFixed(2)}).\nYour arrears at the start of ${monthName} is €${debtAmt.toFixed(2)}.\n\n`;

      if (finalTenantBalance > 200) {
        const extraPayment = Math.round(weeklyTenant * 0.15);
        const repaymentAmount = weeklyTenant + extraPayment;

        smartNote += `(!!) Your arrears are €${finalTenantBalance.toFixed(2)}. You have a repayment plan in place to pay €${repaymentAmount.toFixed(2)} each week.\n\nIt is important to stick to the agreement you signed up to, otherwise your arrears will increase again and your tenancy will be affected.`;
      }
    }

    return smartNote;
  };

  const handleGenerateReceipt = async () => {
    setError('');
    
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

    // Start magic animation
    setIsGenerating(true);

    const tenant = tenants.find(t => t.id === clientId);
    const smartNotes = generateSmartNotes();

    const nameParts = tenant.fullName.trim().split(' ');
    const firstInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : 'X';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : 'X';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const receiptId = `${firstInitial}${lastInitial}${randomDigits}`;

    const receiptData = {
      id: receiptId,
      clientId,
      clientName: tenant.fullName,
      clientAddress: tenant.address,
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
      notes: smartNotes,
      createdDate: (() => {
        const end = new Date(endDate);
        const today = new Date();
        today.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        return end < today ? new Date(endDate + 'T12:00:00').toISOString() : new Date().toISOString();
      })()
    };

    // Wait for animation to show before opening dialog
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsGenerating(false);

    setPendingReceiptData(receiptData);
    setShowSaveDialog(true);
  };
  
  const handleConfirmGenerate = async (shouldSave) => {
    if (!pendingReceiptData) return;
    
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
          notes: pendingReceiptData.notes,
          createdDate: pendingReceiptData.createdDate
        });
        
        onReceiptCreated(pendingReceiptData);
        
        setSuccess('Receipt saved to cloud and opened in new window!');
      } catch (err) {
        console.error('Error saving to cloud:', err);
        setError('Receipt opened but failed to save to cloud');
      }
    } else {
      setSuccess('Receipt opened in new window!');
    }
    
    generateReceiptPDF(pendingReceiptData, settings);
    
    setTimeout(() => setSuccess(''), 3000);
    setShowSaveDialog(false);
    setPendingReceiptData(null);
  };

  const handleApplyAutomatic = (data) => {
    const { primaryTenantId, tenantPayments, rasPayments, statementDateRange } = data;
    
    // Set primary tenant
    setClientId(primaryTenantId);
    
    const tenant = tenants.find(t => t.id === primaryTenantId);
    
    // Set date range from statement dates
    if (statementDateRange) {
      setStartDate(statementDateRange.startDate.toISOString().split('T')[0]);
      setEndDate(statementDateRange.endDate.toISOString().split('T')[0]);
    }

    // Collect all payments for this tenant
    const tPayments = (tenantPayments[primaryTenantId] || []).map(p => ({
      ...p, paymentType: 'tenant'
    }));
    const rPayments = (rasPayments[primaryTenantId] || []).map(p => ({
      ...p, paymentType: 'ras'
    }));
    
    const allPayments = [...tPayments, ...rPayments];

    if (statementDateRange && tenant) {
      const start = new Date(statementDateRange.startDate);
      const end = new Date(statementDateRange.endDate);
      const daysInPeriod = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const weeksInPeriod = Math.ceil(daysInPeriod / 7);

      const weeklyRent = (tenant.weeklyTenantPayment || 0) + (tenant.weeklyRasAmount || 0);
      const newTransactions = [];
      const usedPaymentIds = new Set();

      // Create weekly slots and match payments to each week
      for (let i = 0; i < weeksInPeriod; i++) {
        const weekStart = new Date(start);
        weekStart.setDate(weekStart.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        let tenantPaidAmount = 0;
        let rasPaidAmount = 0;
        let tenantPaidFlag = false;
        let rasReceivedFlag = false;

        // Find payments that fall within this week
        allPayments.forEach(p => {
          if (usedPaymentIds.has(p.id)) return;
          const pDate = new Date(p.date);
          if (pDate >= weekStart && pDate <= weekEnd) {
            if (p.paymentType === 'tenant') {
              tenantPaidAmount += p.amount;
              tenantPaidFlag = true;
            } else {
              rasPaidAmount += p.amount;
              rasReceivedFlag = true;
            }
            usedPaymentIds.add(p.id);
          }
        });

        newTransactions.push({
          id: Date.now() + Math.random() + i,
          date: weekStart.toISOString().split('T')[0],
          rentDue: weeklyRent,
          tenantPayment: tenantPaidAmount,
          tenantPaid: tenantPaidFlag,
          rasPayment: rasPaidAmount,
          rasReceived: rasReceivedFlag
        });
      }

      // Any remaining payments that didn't fall into a week slot
      allPayments.forEach(p => {
        if (!usedPaymentIds.has(p.id)) {
          newTransactions.push({
            id: Date.now() + Math.random(),
            date: new Date(p.date).toISOString().split('T')[0],
            rentDue: 0,
            tenantPayment: p.paymentType === 'tenant' ? p.amount : 0,
            tenantPaid: p.paymentType === 'tenant',
            rasPayment: p.paymentType === 'ras' ? p.amount : 0,
            rasReceived: p.paymentType === 'ras'
          });
        }
      });

      newTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
      setTransactions(newTransactions);
    } else {
      // Fallback: create one transaction per payment
      const newTransactions = allPayments.map((payment, i) => ({
        id: Date.now() + Math.random() + i,
        date: new Date(payment.date).toISOString().split('T')[0],
        rentDue: 0,
        tenantPayment: payment.paymentType === 'tenant' ? payment.amount : 0,
        tenantPaid: payment.paymentType === 'tenant',
        rasPayment: payment.paymentType === 'ras' ? payment.amount : 0,
        rasReceived: payment.paymentType === 'ras'
      }));
      setTransactions(newTransactions);
    }

    // Also load last statement debt for this tenant
    base44.entities.Statement.filter({ clientId: primaryTenantId }, '-created_date', 1).then(stmts => {
      if (stmts.length > 0) {
        setStartingDebt(stmts[0].finalBalance || 0);
      } else {
        setStartingDebt(tenant?.currentBalance || 0);
      }
    }).catch(() => {
      setStartingDebt(tenant?.currentBalance || 0);
    });

    setCredit(tenant?.credit || 0);
    
    // Switch to manual mode to review
    setMode('manual');
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <CardTitle className="text-lg sm:text-xl">Create Receipt</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        
        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2" data-tutorial="receipt-modes">
            <TabsTrigger value="manual">Manual Mode</TabsTrigger>
            <TabsTrigger value="automatic">Automatic Mode</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 sm:space-y-6 mt-6">
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

        {/* Client Selection — grid of tenant cards */}
        <div className="space-y-2" data-tutorial="receipt-tenant-select">
          <Label className="text-base font-semibold">Select Tenant</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tenants.map(t => (
              <button
                key={t.id}
                onClick={() => setClientId(t.id)}
                className={`p-3 rounded-lg border text-left transition-all text-sm ${
                  clientId === t.id
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <div className="font-medium text-slate-800 truncate">{t.fullName}</div>
                {t.address && <div className="text-xs text-slate-500 truncate">{t.address}</div>}
              </button>
            ))}
          </div>
        </div>

        {/* Tenant Info Display */}
        {selectedTenant && (
            <div ref={tenantInfoRef} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{selectedTenant.fullName}</h3>
                <p className="text-sm text-slate-600">{selectedTenant.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Period Selection */}
        {selectedTenant && (
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
            <div className="space-y-4" data-tutorial="receipt-transactions">
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
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border" data-tutorial="receipt-balance">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h3 className="font-semibold text-base sm:text-lg">Balance Preview</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
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
            <motion.div
              whileTap={{ scale: 0.97 }}
              className="w-full"
            >
              <Button
                onClick={handleGenerateReceipt}
                size="lg"
                disabled={isGenerating}
                data-tutorial="receipt-generate"
                className="w-full h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-200 transition-all duration-300 relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      <span>Creating Magic...</span>
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Wand2 className="w-5 h-5" />
                      <span>Print Receipt</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </>
        )}

          </TabsContent>

          <TabsContent value="automatic" className="space-y-6 mt-6">
            <AutomaticPaymentDetection 
              tenants={tenants}
              onApply={handleApplyAutomatic}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              parsedPayments={parsedPayments}
              setParsedPayments={setParsedPayments}
              statementDateRange={autoStatementDateRange}
              setStatementDateRange={setAutoStatementDateRange}
            />
          </TabsContent>
        </Tabs>

        {/* Load Statement Dialog */}
        <AlertDialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Load Previous Statement Data?</AlertDialogTitle>
              <AlertDialogDescription>
                Previous statement ended on {lastStatement ? format(new Date(lastStatement.endDate), 'dd MMM yyyy') : ''}. 
                <div className="mt-4 space-y-2">
                  <Label>Create statement for which month?</Label>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    The new statement will start from the day after the previous one ended and will automatically include all weeks in the selected month.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleSkipLoadStatement}>Start Fresh</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLoadStatementData}
                disabled={!selectedMonth}
              >
                Create Statement for {selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Selected Month'}
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