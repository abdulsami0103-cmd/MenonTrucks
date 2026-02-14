'use client';

import { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  parentId: string | null;
  parent: { name: string } | null;
  _count: { listings: number; children: number };
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  parentId: string;
}

const emptyForm: CategoryForm = { name: '', slug: '', description: '', icon: '', order: 0, parentId: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openCreateForm = (parentId?: string) => {
    setEditingId(null);
    setForm({ ...emptyForm, parentId: parentId || '' });
    setShowForm(true);
  };

  const openEditForm = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      order: cat.order,
      parentId: cat.parentId || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description || undefined,
        icon: form.icon || undefined,
        order: form.order,
        parentId: form.parentId || undefined,
      };

      if (editingId) {
        await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchCategories();
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat && cat._count.listings > 0) {
      alert(`Cannot delete: this category has ${cat._count.listings} listings.`);
      return;
    }
    if (cat && cat._count.children > 0) {
      alert('Cannot delete: this category has subcategories. Delete those first.');
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;

    setActionLoading(id);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FolderTree className="w-6 h-6" /> Category Management
          </h1>
          <p className="text-text-secondary mt-1">{categories.length} categories total</p>
        </div>
        <Button variant="accent" className="gap-2" onClick={() => openCreateForm()}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : generateSlug(e.target.value) })}
                required
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Icon (emoji/code)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="e.g. truck, forklift"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Sort Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Parent Category</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">None (Top-level)</option>
                {parentCategories.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === editingId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" className="gap-2" disabled={saving}>
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Tree */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : parentCategories.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No categories found</div>
        ) : (
          <div className="divide-y divide-border">
            {parentCategories.map((parent) => {
              const children = childCategories(parent.id);
              const isExpanded = expanded.has(parent.id);
              return (
                <div key={parent.id}>
                  {/* Parent */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <button
                      onClick={() => toggleExpand(parent.id)}
                      className="p-1 rounded hover:bg-gray-200"
                      disabled={children.length === 0}
                    >
                      {children.length > 0 ? (
                        isExpanded ? <ChevronDown className="w-4 h-4 text-text-secondary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                      {parent.icon || '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm">{parent.name}</p>
                      <p className="text-xs text-text-secondary">
                        /{parent.slug} &middot; {parent._count.listings} listings &middot; {parent._count.children} subcategories
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openCreateForm(parent.id)}
                        className="p-1.5 rounded-lg text-accent hover:bg-accent/10"
                        title="Add subcategory"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditForm(parent)}
                        className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(parent.id)}
                        disabled={actionLoading === parent.id}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  {isExpanded && children.length > 0 && (
                    <div className="bg-gray-50/50">
                      {children.map((child) => (
                        <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 pl-14 hover:bg-gray-100/50 border-t border-border/50">
                          <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs">
                            {child.icon || '📄'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary">{child.name}</p>
                            <p className="text-xs text-text-secondary">
                              /{child.slug} &middot; {child._count.listings} listings
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditForm(child)}
                              className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-200"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteCategory(child.id)}
                              disabled={actionLoading === child.id}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 disabled:opacity-30"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
