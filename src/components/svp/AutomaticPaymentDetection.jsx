import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { parseBOIStatement, matchPaymentsToTenants, extractStatementDateRange } from '../../utils/pdfParser';
import { toast } from 'sonner';

export default function AutomaticPaymentDetection({ tenants, onApply }) {
  const [parsedPayments, setParsedPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [statementDateRange, setStatementDateRange] = useState(null);
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
      // Parse PDF
      const payments = await parseBOIStatement(file);
      
      if (payments.length === 0) {
        toast.error('No payments found in statement');
        setIsLoading(false);
        return;
      }

      // Match to tenants
      const matchedPayments = matchPaymentsToTenants(payments, tenants);
      
      setParsedPayments(matchedPayments.map(p => ({
        ...p,
        id: Date.now() + Math.random(),
        ignored: false
      })));

      toast.success(`Detected ${payments.length} payments from statement`);
      
      // Show tutorial toast on first use
      if (!localStorage.getItem('auto_detection_tutorial_shown')) {
        setTimeout(() => {
          toast.info('Review matches → adjust if needed → Apply to tenant', {
            duration: 5000
          });
          localStorage.setItem('auto_detection_tutorial_shown', 'true');
        }, 1000);
      }
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

  const handleApply = () => {
    const activePayments = parsedPayments.filter(p => !p.ignored && p.matchedTenant);
    
    if (activePayments.length === 0) {
      toast.error('No payments to apply. Please match payments to tenants first.');
      return;
    }

    // Group by tenant and type
    const tenantPayments = {};
    const rasPayments = {};
    
    activePayments.forEach(payment => {
      const tenantId = payment.matchedTenant.id;
      
      if (payment.type === 'RAS') {
        if (!rasPayments[tenantId]) rasPayments[tenantId] = [];
        rasPayments[tenantId].push(payment);
      } else {
        if (!tenantPayments[tenantId]) tenantPayments[tenantId] = [];
        tenantPayments[tenantId].push(payment);
      }
    });

    // Get most common tenant (if multiple)
    const tenantCounts = {};
    activePayments.forEach(p => {
      const id = p.matchedTenant.id;
      tenantCounts[id] = (tenantCounts[id] || 0) + 1;
    });
    
    const primaryTenantId = Object.keys(tenantCounts).reduce((a, b) => 
      tenantCounts[a] > tenantCounts[b] ? a : b
    );

    onApply({
      primaryTenantId,
      tenantPayments,
      rasPayments,
      statementDateRange
    });

    toast.success(`Applied ${activePayments.length} payments`);
    handleClearAll();
  };

  const activePayments = parsedPayments.filter(p => !p.ignored);
  const unmatchedCount = activePayments.filter(p => !p.matchedTenant).length;

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Automatic Payment Detection
        </CardTitle>
        <CardDescription>
          Upload BOI monthly statement PDF to auto-detect tenant and RAS payments
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        
        {/* Upload Section */}
        <div className="space-y-4">
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
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isLoading ? 'border-blue-300 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            {isLoading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-slate-600">Parsing PDF statement...</p>
              </div>
            ) : uploadedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 mx-auto text-green-600" />
                <p className="font-medium text-slate-700">{uploadedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {parsedPayments.length} payments detected
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 mx-auto text-slate-400" />
                <p className="font-medium text-slate-700">Click to upload PDF statement</p>
                <p className="text-sm text-slate-500">Bank of Ireland monthly statement</p>
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

        {/* Payments Table */}
        {parsedPayments.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Detected Payments ({activePayments.length})
                </h3>
                {unmatchedCount > 0 && (
                  <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" />
                    {unmatchedCount} unmatched payment{unmatchedCount > 1 ? 's' : ''} - review below
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Matched Tenant</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">Confidence</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">Type</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPayments.map((payment) => (
                      <tr 
                        key={payment.id}
                        className={`border-b hover:bg-slate-50 transition-colors ${
                          payment.ignored ? 'opacity-50 bg-slate-100' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm">{payment.date}</td>
                        <td className="py-3 px-4 text-sm max-w-xs truncate" title={payment.description}>
                          {payment.description}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          €{payment.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={payment.matchedTenant?.id || ''}
                            onValueChange={(value) => updateMatch(payment.id, value)}
                            disabled={payment.ignored}
                          >
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Select tenant..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>None</SelectItem>
                              {tenants.map(tenant => (
                                <SelectItem key={tenant.id} value={tenant.id}>
                                  {tenant.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              payment.confidence >= 85 ? 'bg-green-500' :
                              payment.confidence >= 70 ? 'bg-yellow-500' :
                              payment.confidence >= 50 ? 'bg-orange-500' :
                              'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium">{payment.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            payment.type === 'RAS' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {payment.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {!payment.ignored ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => ignorePayment(payment.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-500">Ignored</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-slate-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  €{activePayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-slate-600">Matched Payments</p>
                <p className="text-2xl font-bold text-green-600">
                  {activePayments.filter(p => p.matchedTenant).length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-slate-600">Unmatched</p>
                <p className="text-2xl font-bold text-orange-600">
                  {unmatchedCount}
                </p>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={handleApply}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                disabled={activePayments.filter(p => p.matchedTenant).length === 0}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Apply Payments to Receipt
              </Button>
            </div>
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