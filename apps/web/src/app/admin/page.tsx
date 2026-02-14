'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Package,
  Eye,
  Heart,
  MessageSquare,
  FolderTree,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  rejectedListings: number;
  totalMessages: number;
  totalFavorites: number;
  totalCategories: number;
  newUsersThisMonth: number;
  newListingsThisMonth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data.stats);
      setRecentUsers(data.recentUsers || []);
      setPendingListings(data.pendingModerationListings || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-600', sub: `${stats?.newUsersThisMonth || 0} this month` },
    { label: 'Total Listings', value: stats?.totalListings || 0, icon: Package, color: 'bg-primary/10 text-primary', sub: `${stats?.newListingsThisMonth || 0} this month` },
    { label: 'Active Listings', value: stats?.activeListings || 0, icon: CheckCircle, color: 'bg-green-50 text-green-600', sub: 'Published' },
    { label: 'Pending Review', value: stats?.pendingListings || 0, icon: Clock, color: 'bg-amber-50 text-amber-600', sub: 'Awaiting moderation' },
    { label: 'Sellers', value: stats?.totalSellers || 0, icon: UserPlus, color: 'bg-purple-50 text-purple-600', sub: 'Registered' },
    { label: 'Buyers', value: stats?.totalBuyers || 0, icon: Users, color: 'bg-cyan-50 text-cyan-600', sub: 'Registered' },
    { label: 'Messages', value: stats?.totalMessages || 0, icon: MessageSquare, color: 'bg-emerald-50 text-emerald-600', sub: 'Total sent' },
    { label: 'Categories', value: stats?.totalCategories || 0, icon: FolderTree, color: 'bg-orange-50 text-orange-600', sub: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-secondary mt-1">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{stat.label}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{stat.sub}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Moderation */}
        <div className="bg-white rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Pending Moderation ({stats?.pendingListings || 0})
            </h2>
            <Link href="/admin/listings?status=PENDING">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          {pendingListings.length === 0 ? (
            <div className="p-6 text-center text-text-secondary text-sm">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              No listings pending review
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingListings.slice(0, 5).map((listing: any) => (
                <div key={listing.id} className="p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{listing.title}</p>
                    <p className="text-xs text-text-secondary">
                      by {listing.seller?.companyName || listing.seller?.name} &middot; {listing.category?.name}
                    </p>
                  </div>
                  <Link href={`/admin/listings`}>
                    <Button variant="accent" size="sm">Review</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-text-primary flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Recent Users
            </h2>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.slice(0, 5).map((user: any) => (
              <div key={user.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {(user.companyName || user.name).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{user.companyName || user.name}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>
                <Badge variant={user.role === 'SELLER' ? 'accent' : 'default'}>
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
