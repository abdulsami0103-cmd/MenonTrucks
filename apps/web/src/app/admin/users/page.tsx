'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Ban,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  companyName: string | null;
  avatar: string | null;
  isSuspended: boolean;
  isVerified: boolean;
  city: string | null;
  country: string | null;
  createdAt: string;
  _count: { listings: number; sentMessages: number; receivedMessages: number; favorites: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [suspendedFilter, setSuspendedFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter, suspendedFilter]);

  const fetchUsers = async (searchQuery?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ page: String(pagination.page), limit: '20' });
      if (roleFilter) params.set('role', roleFilter);
      if (suspendedFilter) params.set('suspended', suspendedFilter);
      if (searchQuery ?? search) params.set('search', searchQuery ?? search);

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination || pagination);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers(search);
  };

  const toggleSuspend = async (userId: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isSuspended: data.user.isSuspended } : u))
      );
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const changeRole = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const roleBadgeVariant = (role: string) => {
    if (role === 'ADMIN') return 'default';
    if (role === 'SELLER') return 'accent';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users className="w-6 h-6" /> User Management
          </h1>
          <p className="text-text-secondary mt-1">{pagination.total} users total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users by name, email, company..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button type="submit" variant="accent" size="sm">Search</Button>
          </form>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="BUYER">Buyers</option>
            <option value="SELLER">Sellers</option>
            <option value="ADMIN">Admins</option>
          </select>
          <select
            value={suspendedFilter}
            onChange={(e) => { setSuspendedFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">User</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Listings</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {(user.companyName || user.name).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-text-primary truncate">{user.companyName || user.name}</p>
                          <p className="text-xs text-text-secondary truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        disabled={user.role === 'ADMIN' || actionLoading === user.id}
                        className="text-xs px-2 py-1 rounded border border-border bg-white focus:outline-none disabled:opacity-50"
                      >
                        <option value="BUYER">BUYER</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-text-secondary">
                      {user._count.listings}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-text-secondary">
                      {[user.city, user.country].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {user.isSuspended ? (
                        <Badge className="bg-red-100 text-red-600 text-xs">Suspended</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-600 text-xs">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-text-secondary text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleSuspend(user.id)}
                          disabled={user.role === 'ADMIN' || actionLoading === user.id}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                            user.isSuspended
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={user.isSuspended ? 'Unsuspend' : 'Suspend'}
                        >
                          {user.isSuspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={user.role === 'ADMIN' || actionLoading === user.id}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
  );
}
