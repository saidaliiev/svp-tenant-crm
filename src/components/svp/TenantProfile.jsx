import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Home, CreditCard, TrendingDown, TrendingUp, Calendar, FileText } from 'lucide-react';
import { getRandomAvatar } from './avatars';

export default function TenantProfile({ tenant, statements, isOpen, onClose }) {
  if (!tenant) return null;

  // Get tenant statements history - sorted newest first
  const tenantStatements = statements
    ?.filter(s => s.clientId === tenant.id)
    ?.sort((a, b) => new Date(b.endDate || b.created_date || b.createdDate) - new Date(a.endDate || a.created_date || a.createdDate)) || [];

  const totalPaid = tenantStatements.reduce((sum, s) => 
    sum + (s.totalTenantPayments || 0), 0
  );

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-IE', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(num);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tenant Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-100 dark:border-blue-900/30">
            <div className="w-24 h-24 rounded-full shadow-xl shadow-blue-500/20 shrink-0 border-4 border-white dark:border-gray-800 overflow-hidden relative">
              <img 
                src={tenant.avatarUrl || getRandomAvatar(tenant.id)} 
                alt={tenant.fullName} 
                className="w-full h-full object-cover scale-[1.35]" 
              />
            </div>
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-gray-100 tracking-tight">{tenant.fullName}</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/80 dark:bg-gray-800/80 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-white dark:hover:bg-gray-800 shadow-sm">
                    ID: {tenant.displayId || tenant.id}
                  </Badge>
                  {tenant.lodgmentRange && (
                    <Badge variant="outline" className="bg-white/80 dark:bg-gray-800/80 font-mono shadow-sm">
                      Lodgment ID: {tenant.lodgmentRange}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                <p className="text-slate-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                  <span className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm shrink-0">
                    <Home className="w-4 h-4 text-blue-500" />
                  </span>
                  <span className="truncate" title={tenant.address}>{tenant.address}</span>
                </p>
                {tenant.phoneNumber && (
                  <p className="text-slate-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                    <span className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm shrink-0">
                      <Phone className="w-4 h-4 text-green-500" />
                    </span>
                    {tenant.phoneNumber}
                  </p>
                )}
                {tenant.moveInDate && (
                  <p className="text-slate-600 dark:text-gray-400 flex items-center gap-2 text-sm">
                    <span className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm shrink-0">
                      <Calendar className="w-4 h-4 text-purple-500" />
                    </span>
                    Moved in: {formatDate(tenant.moveInDate)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  Total Paid
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  Current Debt
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className={`text-xl font-bold ${tenant.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {tenant.currentBalance > 0 ? formatCurrency(tenant.currentBalance) : '€0.00'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Credit
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className={`text-xl font-bold text-green-600`}>
                  {formatCurrency(tenant.credit || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Receipts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xl font-bold text-blue-600">{tenantStatements.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400">Weekly Rent</p>
                  <p className="text-lg font-semibold dark:text-gray-100">{formatCurrency(tenant.monthlyRent || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400">Weekly Tenant Payment</p>
                  <p className="text-lg font-semibold dark:text-gray-100">{formatCurrency(tenant.weeklyTenantPayment || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400">Weekly RAS</p>
                  <p className="text-lg font-semibold dark:text-gray-100">{formatCurrency(tenant.weeklyRasAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400">Move-in Date</p>
                  <p className="text-lg font-semibold dark:text-gray-100">{tenant.moveInDate ? formatDate(tenant.moveInDate) : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tenantStatements.length === 0 ? (
                <p className="text-slate-500 dark:text-gray-500 text-center py-8">No payment history yet</p>
              ) : (
                <div className="space-y-4">
                  {tenantStatements.map((statement, stmtIndex) => (
                    <div key={statement.id} className={`rounded-lg border dark:border-gray-700 ${stmtIndex % 2 === 0 ? 'bg-white dark:bg-gray-800/40' : 'bg-slate-50 dark:bg-gray-800/60'}`}>
                      {/* Statement Header */}
                      <div className="p-3 border-b dark:border-gray-700 bg-slate-100 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-gray-200">
                              {formatDate(statement.startDate)} - {formatDate(statement.endDate)}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-gray-400">
                              Receipt: {statement.receiptId}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-gray-500">
                            {formatDate(statement.createdDate)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Weekly Breakdown */}
                      <div className="p-2">
                        {statement.transactions && statement.transactions.length > 0 ? (
                          <div className="space-y-1">
                            {statement.transactions
                              .filter(t => t.tenantPaid && (parseFloat(t.tenantPayment) || 0) > 0)
                              .map((transaction, txIndex) => (
                                <div 
                                  key={txIndex} 
                                  className="flex items-center justify-between py-2 px-3 text-sm hover:bg-slate-50 dark:hover:bg-gray-700/30 rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-slate-700 dark:text-gray-300">
                                      {formatDate(transaction.date)}
                                    </span>
                                  </div>
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(transaction.tenantPayment || 0)}
                                  </span>
                                </div>
                              ))}
                            
                            {/* Monthly Total */}
                            <div className="flex items-center justify-between py-2 px-3 mt-2 border-t dark:border-gray-700 bg-green-50 dark:bg-green-950/20 rounded font-semibold">
                              <span className="text-slate-800 dark:text-gray-200">Total for Month:</span>
                              <span className="text-green-600">
                                {formatCurrency(statement.totalTenantPayments || 0)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-slate-500 dark:text-gray-500">
                            No weekly transactions recorded
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {tenant.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{tenant.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}