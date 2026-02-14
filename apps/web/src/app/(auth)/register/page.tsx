'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
    phone: '',
    companyName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push(formData.role === 'SELLER' ? '/dashboard' : '/');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Truck className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold text-primary">
              Menon<span className="text-accent">Trucks</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mt-6">Create Account</h1>
          <p className="text-text-secondary mt-2">Join MenonTrucks marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'BUYER', label: 'Buy Vehicles', desc: 'Browse & purchase' },
                { value: 'SELLER', label: 'Sell Vehicles', desc: 'List & manage ads' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: opt.value })}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    formData.role === opt.value
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <p className="font-medium text-sm text-text-primary">{opt.label}</p>
                  <p className="text-xs text-text-secondary">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Full Name *"
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          {formData.role === 'SELLER' && (
            <Input
              label="Company Name"
              id="companyName"
              placeholder="Your company name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          )}

          <Input
            label="Email *"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            id="phone"
            type="tel"
            placeholder="+31 6 1234 5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Password *"
            id="password"
            type="password"
            placeholder="Min 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full gap-2">
            <UserPlus className="w-4 h-4" /> Create Account
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
