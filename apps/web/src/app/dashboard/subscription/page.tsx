'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  CreditCard,
  ArrowUpRight,
  Package,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Subscription {
  plan: string;
  status: string;
  maxListings: number;
  featuredListings: number;
  startDate: string | null;
  endDate: string | null;
  stripeCustomerId?: string;
}

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [listingCounts, setListingCounts] = useState({ active: 0, featured: 0 });

  useEffect(() => {
    fetchSubscription();
    fetchListingCounts();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/subscriptions/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubscription(data.subscription);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const fetchListingCounts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setListingCounts({
        active: data.stats?.activeListings || 0,
        featured: 0, // Will count from listings
      });
    } catch {
      // error
    }
  };

  const openBillingPortal = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/subscriptions/billing-portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch {
      // error
    } finally {
      setActionLoading(false);
    }
  };

  const cancelSub = async () => {
    if (!confirm('Are you sure you want to cancel? Your plan will remain active until the end of the billing period.')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscription();
    } catch {
      // error
    } finally {
      setActionLoading(false);
    }
  };

  const planConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
    FREE: { icon: Star, color: 'text-gray-500', bgColor: 'bg-gray-100' },
    BASIC: { icon: Zap, color: 'text-accent', bgColor: 'bg-accent/10' },
    PREMIUM: { icon: Crown, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  };

  if (loading) {
    return (
      <div className="bg-background-light min-h-screen">
        <div className="container-main py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  const plan = subscription?.plan || 'FREE';
  const conf = planConfig[plan] || planConfig.FREE;
  const PlanIcon = conf.icon;

  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <CreditCard className="w-6 h-6" /> My Subscription
        </h1>

        {/* Success/Cancel banners */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-medium text-green-800">Subscription activated!</p>
              <p className="text-sm text-green-600">Your plan has been upgraded successfully.</p>
            </div>
          </div>
        )}
        {cancelled && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">Checkout was cancelled. No charges were made.</p>
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${conf.bgColor}`}>
                <PlanIcon className={`w-7 h-7 ${conf.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-text-primary">{plan} Plan</h2>
                  <Badge
                    variant={subscription?.status === 'ACTIVE' ? 'accent' : 'default'}
                    className={subscription?.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : ''}
                  >
                    {subscription?.status || 'ACTIVE'}
                  </Badge>
                </div>
                {subscription?.startDate && (
                  <p className="text-sm text-text-secondary mt-1">
                    Active since {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                )}
                {subscription?.status === 'CANCELLED' && subscription?.endDate && (
                  <p className="text-sm text-red-500 mt-1">
                    Expires {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {plan !== 'FREE' && (
              <div className="text-right">
                <p className="text-2xl font-bold text-text-primary">
                  {plan === 'BASIC' ? '€29.99' : '€79.99'}
                </p>
                <p className="text-xs text-text-secondary">/month</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-text-primary text-sm">Active Listings</h3>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-text-primary">{listingCounts.active}</span>
              <span className="text-text-secondary text-sm mb-1">/ {subscription?.maxListings || 1}</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${Math.min(100, (listingCounts.active / (subscription?.maxListings || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-text-primary text-sm">Featured Listings</h3>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-text-primary">{listingCounts.featured}</span>
              <span className="text-text-secondary text-sm mb-1">/ {subscription?.featuredListings || 0}</span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-accent rounded-full h-2 transition-all"
                style={{ width: `${subscription?.featuredListings ? Math.min(100, (listingCounts.featured / subscription.featuredListings) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-border p-6 space-y-3">
          <h3 className="font-semibold text-text-primary mb-4">Manage Subscription</h3>

          {plan === 'FREE' ? (
            <Link href="/pricing">
              <Button variant="accent" className="w-full gap-2">
                <ArrowUpRight className="w-4 h-4" /> Upgrade Plan
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/pricing">
                <Button variant="accent" className="w-full gap-2">
                  <ArrowUpRight className="w-4 h-4" /> Change Plan
                </Button>
              </Link>
              {subscription?.stripeCustomerId && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={openBillingPortal}
                  loading={actionLoading}
                >
                  <CreditCard className="w-4 h-4" /> Manage Billing
                </Button>
              )}
              {subscription?.status === 'ACTIVE' && (
                <button
                  onClick={cancelSub}
                  disabled={actionLoading}
                  className="w-full text-sm text-red-500 hover:text-red-600 py-2"
                >
                  Cancel Subscription
                </button>
              )}
            </>
          )}

          <Link href="/dashboard/payments" className="block">
            <Button variant="ghost" className="w-full gap-2 mt-2">
              View Payment History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
