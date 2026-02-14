import Link from 'next/link';
import { Truck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-gray-300">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Truck className="w-7 h-7 text-accent" />
              <span className="text-lg font-bold text-white">
                Menon<span className="text-accent">Trucks</span>
              </span>
            </Link>
            <p className="text-sm">
              Europe&apos;s growing marketplace for trucks, trailers,
              construction machinery, and commercial vehicles.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/trucks" className="hover:text-accent transition-colors">Trucks</Link></li>
              <li><Link href="/category/semi-trailers" className="hover:text-accent transition-colors">Trailers</Link></li>
              <li><Link href="/category/construction-machinery" className="hover:text-accent transition-colors">Construction</Link></li>
              <li><Link href="/category/agricultural-machinery" className="hover:text-accent transition-colors">Agricultural</Link></li>
              <li><Link href="/category/vans-lcv-buses" className="hover:text-accent transition-colors">Vans & Buses</Link></li>
              <li><Link href="/category/parts-accessories" className="hover:text-accent transition-colors">Parts</Link></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-accent transition-colors">Register as Seller</Link></li>
              <li><Link href="/pricing" className="hover:text-accent transition-colors">Pricing Plans</Link></li>
              <li><Link href="/dashboard" className="hover:text-accent transition-colors">Seller Dashboard</Link></li>
              <li><Link href="/bulk-upload" className="hover:text-accent transition-colors">Bulk Upload</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>&copy; {new Date().getFullYear()} MenonTrucks. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built with Next.js, TypeScript & PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}
