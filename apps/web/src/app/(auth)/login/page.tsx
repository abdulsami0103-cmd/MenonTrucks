'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push(data.user.role === 'SELLER' ? '/dashboard' : '/');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Truck className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold text-primary">
              Menon<span className="text-accent">Trucks</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary mt-6">Welcome Back</h1>
          <p className="text-text-secondary mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full gap-2">
            <LogIn className="w-4 h-4" /> Sign In
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent font-medium hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
