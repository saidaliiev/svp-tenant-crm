import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function StatementCalendar({ tenants = [], statements = [] }) {
  
  const months = useMemo(() => {
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      arr.push({
        label: format(d, 'MMM yyyy'),
        start: startOfMonth(d),
        end: endOfMonth(d)
      });
    }
    return arr;
  }, []);

  const grid = useMemo(() => {
    return tenants.map(tenant => {
      const tenantStatements = statements.filter(s => s.clientId === tenant.id);
      
      const monthStatus = months.map(m => {
        const hasStatement = tenantStatements.some(s => {
          if (!s.startDate || !s.endDate) return false;
          const sStart = new Date(s.startDate);
          const sEnd = new Date(s.endDate);
          // Simple check: does the statement overlap with the month?
          return sStart <= m.end && sEnd >= m.start;
        });
        return hasStatement;
      });

      return {
        tenant,
        monthStatus
      };
    }).sort((a, b) => a.tenant.fullName.localeCompare(b.tenant.fullName));
  }, [tenants, statements, months]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-violet-500" />
          Statement Calendar (Last 6 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead className="min-w-[150px]">Tenant</TableHead>
                {months.map(m => (
                  <TableHead key={m.label} className="text-center">{m.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {grid.map((row) => (
                <TableRow key={row.tenant.id}>
                  <TableCell className="font-medium">{row.tenant.fullName}</TableCell>
                  {row.monthStatus.map((status, i) => (
                    <TableCell key={i} className="text-center">
                      {status ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-200 dark:text-slate-700 mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {grid.length === 0 && (
                <TableRow>
                  <TableCell colSpan={months.length + 1} className="text-center py-6 text-slate-500">
                    No tenants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}