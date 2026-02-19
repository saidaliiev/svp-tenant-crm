import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { History, Printer, Trash2, FileText } from 'lucide-react';
import { generateReceiptPDF } from './pdfGenerator';

export default function ReceiptHistory({ tenants = [], statements, settings }) {
  const queryClient = useQueryClient();
  const [filterClientId, setFilterClientId] = useState('all');
  const [deleteReceipt, setDeleteReceipt] = useState(null);

  const filteredStatements = filterClientId === 'all' 
    ? statements 
    : statements.filter(s => s.clientId === filterClientId);

  const sortedStatements = [...filteredStatements].sort(
    (a, b) => new Date(b.created_date || b.createdDate) - new Date(a.created_date || a.createdDate)
  );

  const handleViewPDF = (receipt) => {
    generateReceiptPDF(receipt, settings);
  };

  const deleteStatementMutation = useMutation({
    mutationFn: (id) => base44.entities.Statement.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['statements'])
  });

  const handleDeleteReceipt = async () => {
    if (deleteReceipt) {
      try {
        await deleteStatementMutation.mutateAsync(deleteReceipt.id);
        setDeleteReceipt(null);
      } catch (err) {
        console.error('Error deleting statement:', err);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount);
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl dark:shadow-gray-950/20 border-0 dark:border dark:border-gray-700/50">
      <CardHeader className="border-b dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3" data-tutorial="history-header">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <CardTitle className="text-lg sm:text-xl dark:text-gray-100">Receipt History</CardTitle>
          </div>
          
          <div className="w-full sm:w-64" data-tour="tenant-filter">
             <Select value={filterClientId} onValueChange={setFilterClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenants</SelectItem>
                {tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6">
        {sortedStatements.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No receipts yet</p>
            <p className="text-sm">Create your first receipt to see it here</p>
          </div>
        ) : (
          <>
            {/* Mobile: Card layout */}
            <div className="sm:hidden space-y-2.5">
              {sortedStatements.map((receipt, index) => (
                <div key={receipt.id} className="bg-white dark:bg-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-700/50 p-3 shadow-sm" data-tour={index === 0 ? "receipt-row" : undefined}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 dark:text-gray-200 text-sm truncate">{receipt.clientName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-gray-500">{receipt.receiptId} · {formatDate(receipt.created_date || receipt.createdDate)}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ml-2 ${receipt.finalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(receipt.finalBalance)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-gray-500 mb-2">{formatDate(receipt.startDate)} – {formatDate(receipt.endDate)}</p>
                  <div className="flex gap-1.5">
                    <Button size="sm" onClick={() => handleViewPDF(receipt)} data-tour={index === 0 ? "btn-view-print" : undefined} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs">
                      <Printer className="w-3.5 h-3.5 mr-1" /> Print
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleteReceipt(receipt)} data-tour={index === 0 ? "btn-delete-receipt" : undefined} className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 h-8 w-8 p-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: Table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm">Tenant Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm hidden md:table-cell">Receipt Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm hidden lg:table-cell">Period</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm">Final Balance</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-gray-300 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStatements.map((receipt, index) => (
                    <tr key={receipt.id} className={`border-b border-slate-100 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/50 dark:bg-gray-800/30'}`}>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 dark:text-gray-200 text-sm">{receipt.clientName}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">{receipt.receiptId}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-gray-400 text-sm hidden md:table-cell">{formatDate(receipt.created_date || receipt.createdDate)}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-gray-400 text-sm hidden lg:table-cell">{formatDate(receipt.startDate)} – {formatDate(receipt.endDate)}</td>
                      <td className={`py-3 px-4 text-right font-semibold text-sm ${receipt.finalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(receipt.finalBalance)}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" onClick={() => handleViewPDF(receipt)} data-tour={index === 0 ? "btn-view-print" : undefined} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-8 px-3 text-xs">
                            <Printer className="w-4 h-4" />
                            <span className="hidden lg:inline ml-1">View/Print</span>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteReceipt(receipt)} data-tour={index === 0 ? "btn-delete-receipt" : undefined} className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 px-3">
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteReceipt} onOpenChange={(open) => !open && setDeleteReceipt(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete receipt <strong>{deleteReceipt?.receiptId}</strong> for {deleteReceipt?.clientName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteReceipt}
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