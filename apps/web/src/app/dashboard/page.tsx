'use client';

import Link from 'next/link';
import { Package, Plus, Eye, Heart, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Total Listings', value: '0', icon: Package, color: 'bg-primary/10 text-primary' },
  { label: 'Total Views', value: '0', icon: Eye, color: 'bg-accent/10 text-accent' },
  { label: 'Favorites', value: '0', icon: Heart, color: 'bg-red-50 text-red-500' },
  { label: 'Messages', value: '0', icon: MessageSquare, color: 'bg-green-50 text-green-600' },
];

export default function DashboardPage() {
  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Seller Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage your listings and track performance</p>
          </div>
          <Link href="/dashboard/listings/new">
            <Button variant="accent" className="gap-2">
              <Plus className="w-4 h-4" /> Create Listing
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                    <p className="text-xs text-text-secondary">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/listings" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <Package className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-text-primary">My Listings</h3>
            <p className="text-sm text-text-secondary mt-1">Manage all your vehicle listings</p>
          </Link>
          <Link href="/dashboard/listings/new" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <Plus className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold text-text-primary">Post New Ad</h3>
            <p className="text-sm text-text-secondary mt-1">Create a new vehicle listing</p>
          </Link>
          <Link href="/dashboard/messages" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <MessageSquare className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-text-primary">Messages</h3>
            <p className="text-sm text-text-secondary mt-1">View buyer inquiries</p>
          </Link>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-xl border border-border">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Recent Listings</h2>
            <Link href="/dashboard/listings" className="text-sm text-accent hover:underline">View All</Link>
          </div>
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
            <p className="text-text-secondary">No listings yet</p>
            <Link href="/dashboard/listings/new">
              <Button variant="accent" size="sm" className="mt-3 gap-1">
                <Plus className="w-3.5 h-3.5" /> Create your first listing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
