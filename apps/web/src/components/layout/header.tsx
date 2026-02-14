'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Truck, User, Heart, LogIn } from 'lucide-react';

const navLinks = [
  { name: 'Trucks', href: '/category/trucks' },
  { name: 'Trailers', href: '/category/semi-trailers' },
  { name: 'Construction', href: '/category/construction-machinery' },
  { name: 'Equipment', href: '/category/material-handling' },
  { name: 'Vans', href: '/category/vans-lcv-buses' },
  { name: 'Parts', href: '/category/parts-accessories' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-white sticky top-0 z-50">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="container-main flex items-center justify-between h-10 text-sm text-gray-300">
          <span>Europe&apos;s Vehicle Marketplace</span>
          <div className="flex items-center gap-4">
            <select className="bg-transparent text-gray-300 text-sm focus:outline-none cursor-pointer">
              <option value="en">English</option>
              <option value="nl">Nederlands</option>
              <option value="de">Deutsch</option>
              <option value="fr">Fran&ccedil;ais</option>
            </select>
            <select className="bg-transparent text-gray-300 text-sm focus:outline-none cursor-pointer">
              <option value="EUR">EUR &euro;</option>
              <option value="USD">USD $</option>
              <option value="GBP">GBP &pound;</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-main flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Truck className="w-8 h-8 text-accent" />
          <span className="text-xl font-bold">
            Menon<span className="text-accent">Trucks</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-300 hover:text-accent transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/favorites" className="p-2 hover:text-accent transition-colors">
            <Heart className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
          <Link
            href="/register"
            className="bg-accent hover:bg-accent-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Post Ad
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10">
          <nav className="container-main py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-300 hover:text-accent py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 flex gap-3">
              <Link
                href="/login"
                className="flex-1 text-center py-2 border border-white/20 rounded-lg text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 text-center py-2 bg-accent rounded-lg text-sm font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Post Ad
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
