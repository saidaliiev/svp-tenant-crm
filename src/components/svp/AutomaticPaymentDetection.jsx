import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, X, ChevronRight } from 'lucide-react';
import { parseBOIStatement, matchPaymentsToTenants, extractStatementDateRange } from '@/components/utils/pdfParser';
import { toast } from 'sonner';

export default function AutomaticPaymentDetection({
  tenants,
  onApply,
  // Lifted state from parent
  uploadedFile,
  setUploadedFile,
  parsedPayments,
  setParsedPayments,
  statementDateRange,
  setStatementDateRange,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsLoading(true);
    setUploadedFile(file);

    try {
      const payments = await parseBOIStatement(file);
      
      if (payments.length === 0) {
        toast.error('No payments found in statement');
        setIsLoading(false);
        return;
      }

      const dateRange = extractStatementDateRange();
      if (dateRange) {
        setStatementDateRange(dateRange);
      }

      const matchedPayments = matchPaymentsToTenants(payments, tenants);
      
      setParsedPayments(matchedPayments.map(p => ({
        ...p,
        id: Date.now() + Math.random(),
        ignored: false
      })));

      toast.success(`Detected ${payments.length} payments from statement`);
    } catch (error) {
      toast.error('Failed to parse PDF: ' + error.message);
      console.error('PDF parsing error:', error);
    }

    setIsLoading(false);
    event.target.value = '';
  };

  const updateMatch = (id, tenantId) => {
    setParsedPayments(prev => prev.map(p => {
      if (p.id === id) {
        const tenant = tenants.find(t => t.id === tenantId);
        return { ...p, matchedTenant: tenant, confidence: tenantId ? 100 : 0 };
      }
      return p;
    }));
  };

  const ignorePayment = (id) => {
    setParsedPayments(prev => prev.map(p => 
      p.id === id ? { ...p, ignored: true } : p
    ));
  };

  const handleClearAll = () => {
    setParsedPayments([]);
    setUploadedFile(null);
    setStatementDateRange(null);
    setShowClearDialog(false);
    toast.success('Cleared all detected payments');
  };

  const handleApplyForTenant = (tenantId, groupPayments) => {
    const tenantPaymentsMap = {};
    const rasPaymentsMap = {};

    groupPayments.forEach(payment => {
      if (payment.type === 'RAS') {
        if (!rasPaymentsMap[tenantId]) rasPaymentsMap[tenantId] = [];
        rasPaymentsMap[tenantId].push(payment);
      } else {
        if (!tenantPaymentsMap[tenantId]) tenantPaymentsMap[tenantId] = [];
        tenantPaymentsMap[tenantId].push(payment);
      }
    });

    onApply({
      primaryTenantId: tenantId,
      tenantPayments: tenantPaymentsMap,
      rasPayments: rasPaymentsMap,
      statementDateRange
    });
  };

  const activePayments = parsedPayments.filter(p => !p.ignored);
  const unmatchedPayments = activePayments.filter(p => !p.matchedTenant);
  const matchedPayments = activePayments.filter(p => p.matchedTenant);
  
  const groupedPayments = Object.values(matchedPayments.reduce((acc, p) => {
    const tid = p.matchedTenant.id;
    if (!acc[tid]) acc[tid] = { tenant: p.matchedTenant, payments: [], total: 0 };
    acc[tid].payments.push(p);
    acc[tid].total += p.amount;
    return acc;
  }, {})).sort((a, b) => a.tenant.fullName.localeCompare(b.tenant.fullName));

  const unmatchedCount = unmatchedPayments.length;

  return (
    <Card className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl dark:shadow-gray-950/20 border-0 dark:border dark:border-gray-700/50">
      <CardHeader className="border-b dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl dark:text-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Automatic Payment Detection
        </CardTitle>
        <CardDescription>
          Upload Bank Statement monthly PDF to auto-detect tenant payments
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        
        {/* Upload Section */}
        <div className="space-y-4" data-tour="auto-upload">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Upload Bank Statement</Label>
            {uploadedFile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change File
              </Button>
            )}
          </div>

          <div 
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center cursor-pointer transition-all ${
              isLoading ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20' : 'border-slate-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-gray-800/50'
            }`}
          >
            {isLoading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-slate-600 dark:text-gray-400">Parsing PDF statement...</p>
              </div>
            ) : uploadedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto text-green-600" />
                <p className="font-medium text-slate-700 dark:text-gray-200">{uploadedFile.name}</p>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  {parsedPayments.length} payments detected
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-slate-400" />
                <p className="font-medium text-slate-700 dark:text-gray-200">Click to upload PDF statement</p>
                <p className="text-sm text-slate-500 dark:text-gray-400">Bank statement (monthly)</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Payments Section */}
        {parsedPayments.length > 0 && (
          <div className="space-y-6" data-tour="auto-payments">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Detected Payments ({activePayments.length})
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2.5 sm:p-4 border border-blue-200 dark:border-blue-800/50">
                <p className="text-[10px] sm:text-sm text-slate-600 dark:text-gray-400">Total</p>
                <p className="text-base sm:text-2xl font-bold text-blue-600">
                  €{activePayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2.5 sm:p-4 border border-green-200 dark:border-green-800/50">
                <p className="text-[10px] sm:text-sm text-slate-600 dark:text-gray-400">Matched</p>
                <p className="text-base sm:text-2xl font-bold text-green-600">
                  {matchedPayments.length}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-2.5 sm:p-4 border border-orange-200 dark:border-orange-800/50">
                <p className="text-[10px] sm:text-sm text-slate-600 dark:text-gray-400">Unmatched</p>
                <p className="text-base sm:text-2xl font-bold text-orange-600">
                  {unmatchedCount}
                </p>
              </div>
            </div>

            {/* Matched Tenants Grouped */}
            {groupedPayments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Ready for Receipt ({groupedPayments.length} Tenants)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedPayments.map(group => (
                    <div key={group.tenant.id} className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800/50 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col">
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-gray-100">{group.tenant.fullName}</h4>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                            {group.payments.length} payment{group.payments.length !== 1 ? 's' : ''} ({group.payments.length} weeks)
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-green-600">€{group.total.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 mb-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg p-2 flex-1">
                        {group.payments.map(p => (
                          <div key={p.id} className="flex justify-between text-xs items-center group/item">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-slate-500 whitespace-nowrap">{p.date}</span>
                              <span className="text-slate-700 dark:text-gray-300 truncate max-w-[150px]" title={p.description}>{p.description}</span>
                            </div>
                            <div className="font-medium whitespace-nowrap ml-2">€{p.amount.toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                        onClick={() => handleApplyForTenant(group.tenant.id, group.payments)}
                      >
                        Generate Statement
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unmatched Payments Table */}
            {unmatchedPayments.length > 0 && (
              <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                <h3 className="text-base font-semibold flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  Unmatched Payments ({unmatchedCount})
                </h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Please select the correct tenant for these payments to include them in receipts.
                </p>

                <div className="border dark:border-gray-700/50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-slate-50 dark:bg-gray-800/60 border-b dark:border-gray-700">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
                          <th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-sm">Match To...</th>
                          <th className="text-center py-3 px-4 font-semibold text-sm">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unmatchedPayments.map((payment) => (
                          <tr key={payment.id} className="border-b dark:border-gray-700/50 hover:bg-slate-50 dark:hover:bg-gray-800/30">
                            <td className="py-3 px-4 text-sm">{payment.date}</td>
                            <td className="py-3 px-4 text-sm max-w-[200px] truncate" title={payment.description}>{payment.description}</td>
                            <td className="py-3 px-4 text-sm text-right font-medium">€{payment.amount.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <Select value={payment.matchedTenant?.id || ''} onValueChange={(value) => updateMatch(payment.id, value)}>
                                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select tenant..." /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">None</SelectItem>
                                  {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button variant="ghost" size="sm" onClick={() => ignorePayment(payment.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <X className="w-4 h-4 mr-1" /> Ignore
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Clear Confirmation Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Detected Payments?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all detected payments. You'll need to upload the statement again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll} className="bg-red-500 hover:bg-red-600">
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}