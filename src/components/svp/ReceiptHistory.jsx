import React, { useState } from 'react';
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

export default function ReceiptHistory({ clients, statements, setStatements, settings }) {
  const [filterClientId, setFilterClientId] = useState('all');
  const [deleteReceipt, setDeleteReceipt] = useState(null);

  const filteredStatements = filterClientId === 'all' 
    ? statements 
    : statements.filter(s => s.clientId === filterClientId);

  const sortedStatements = [...filteredStatements].sort(
    (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
  );

  const handleViewPDF = (receipt) => {
    generateReceiptPDF(receipt, settings);
  };

  const handleDeleteReceipt = () => {
    if (deleteReceipt) {
      setStatements(prev => prev.filter(s => s.id !== deleteReceipt.id));
      setDeleteReceipt(null);
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
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl">Receipt History</CardTitle>
          </div>
          
          <div className="w-full sm:w-64">
            <Select value={filterClientId} onValueChange={setFilterClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {sortedStatements.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No receipts yet</p>
            <p className="text-sm">Create your first receipt to see it here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Tenant Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Receipt Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden sm:table-cell">Period</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Final Balance</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStatements.map((receipt, index) => (
                  <tr 
                    key={receipt.id} 
                    className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-800">{receipt.clientName}</p>
                        <p className="text-xs text-slate-500">{receipt.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(receipt.createdDate)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 hidden sm:table-cell">
                      {formatDate(receipt.startDate)} – {formatDate(receipt.endDate)}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${receipt.finalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(receipt.finalBalance)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleViewPDF(receipt)}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1">View/Print</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteReceipt(receipt)}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteReceipt} onOpenChange={(open) => !open && setDeleteReceipt(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Receipt</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete receipt <strong>{deleteReceipt?.id}</strong> for {deleteReceipt?.clientName}? This action cannot be undone.
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