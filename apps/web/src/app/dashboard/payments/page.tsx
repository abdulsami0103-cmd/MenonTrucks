'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Payment {
  id: string;
  amount: string;
  currency: string;
  status: string;
  description: string | null;
  stripePaymentId: string | null;
  createdAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [pagination.page]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/payments?page=${pagination.page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPayments(data.payments || []);
      setPagination(data.pagination || pagination);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    COMPLETED: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Completed' },
    PENDING: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Pending' },
    FAILED: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Failed' },
    REFUNDED: { icon: ArrowLeft, color: 'text-blue-600 bg-blue-50', label: 'Refunded' },
  };

  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/subscription" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Receipt className="w-6 h-6" /> Payment History
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">{pagination.total} transactions</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-text-secondary/20 mx-auto mb-3" />
              <h3 className="font-semibold text-text-primary mb-1">No payments yet</h3>
              <p className="text-sm text-text-secondary mb-4">Payments will appear here after you subscribe to a plan</p>
              <Link href="/pricing">
                <Button variant="accent" size="sm">View Plans</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((payment) => {
                const conf = statusConfig[payment.status] || statusConfig.PENDING;
                const StatusIcon = conf.icon;
                return (
                  <div key={payment.id} className="p-4 flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${conf.color}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm">
                        {payment.description || 'Payment'}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-text-primary">
                        &euro;{Number(payment.amount).toFixed(2)}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conf.color}`}>
                        {conf.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-text-secondary">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
