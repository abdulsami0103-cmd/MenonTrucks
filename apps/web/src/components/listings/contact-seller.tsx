'use client';

import { useState } from 'react';
import { Phone, MessageCircle, Mail, Send, MapPin, Building2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

interface ContactSellerProps {
  seller: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    companyName?: string;
    companyLogo?: string;
    city?: string;
    country?: string;
    avatar?: string;
  };
  listingTitle: string;
}

export function ContactSeller({ seller, listingTitle }: ContactSellerProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi, I'm interested in "${listingTitle}". Is it still available?`,
  });

  const location = [seller.city, seller.country].filter(Boolean).join(', ');
  const whatsappUrl = seller.whatsapp
    ? `https://wa.me/${seller.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in "${listingTitle}". Is it still available?`)}`
    : null;

  return (
    <div className="bg-white rounded-xl border border-border p-5 sticky top-24">
      {/* Seller Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {seller.companyLogo || seller.avatar ? (
            <Image src={seller.companyLogo || seller.avatar!} alt={seller.name} width={48} height={48} className="object-cover" />
          ) : (
            <Building2 className="w-6 h-6 text-primary" />
          )}
        </div>
        <div>
          <Link href={`/seller/${seller.id}`} className="font-semibold text-text-primary hover:text-primary transition-colors">
            {seller.companyName || seller.name}
          </Link>
          {location && (
            <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {location}
            </p>
          )}
        </div>
      </div>

      <Link
        href={`/seller/${seller.id}`}
        className="text-xs text-accent hover:underline flex items-center gap-1 mb-5"
      >
        View all listings <ExternalLink className="w-3 h-3" />
      </Link>

      {/* Contact Buttons */}
      <div className="space-y-2.5">
        {seller.phone && (
          <a href={`tel:${seller.phone}`} className="w-full">
            <Button variant="primary" size="lg" className="w-full gap-2">
              <Phone className="w-4 h-4" />
              Call Seller
            </Button>
          </a>
        )}

        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="accent" size="lg" className="w-full gap-2 bg-green-600 hover:bg-green-700 focus:ring-green-500">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </a>
        )}

        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          <Mail className="w-4 h-4" />
          Send Message
        </Button>
      </div>

      {/* Contact Form */}
      {showForm && (
        <form className="mt-5 space-y-3 pt-5 border-t border-border">
          <Input
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Textarea
            placeholder="Your message"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          <Button variant="accent" size="lg" className="w-full gap-2">
            <Send className="w-4 h-4" />
            Send Message
          </Button>
        </form>
      )}
    </div>
  );
}
