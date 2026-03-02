import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from 'date-fns';

export default function PaymentLookup({ statements = [], tenants = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    const matches = [];

    statements.forEach(stmt => {
      if (!stmt.transactions) return;
      stmt.transactions.forEach(tx => {
        const amountStr = String(tx.tenantPayment || 0);
        const dateStr = tx.date ? format(new Date(tx.date), 'dd MMM yyyy').toLowerCase() : '';
        const clientName = (stmt.clientName || '').toLowerCase();
        
        if (amountStr.includes(term) || dateStr.includes(term) || clientName.includes(term)) {
          matches.push({
            id: tx.id || Math.random().toString(),
            clientName: stmt.clientName,
            date: tx.date,
            amount: tx.tenantPayment,
            receiptId: stmt.receiptId
          });
        }
      });
    });
    
    return matches.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [searchTerm, statements]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-500" />
          Payment Lookup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by amount, tenant name, or date..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {searchTerm && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Receipt ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length > 0 ? results.map((res, i) => (
                  <TableRow key={`${res.id}-${i}`}>
                    <TableCell>{res.date ? format(new Date(res.date), 'dd MMM yyyy') : '-'}</TableCell>
                    <TableCell className="font-medium">{res.clientName}</TableCell>
                    <TableCell>€{parseFloat(res.amount || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-slate-500">{res.receiptId}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                      No payments found matching "{searchTerm}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}