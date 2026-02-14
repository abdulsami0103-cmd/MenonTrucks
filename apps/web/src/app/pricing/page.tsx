'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  maxListings: number;
  featuredListings: number;
  features: string[];
  popular?: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/subscriptions/plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/pricing');
      return;
    }

    if (planId === 'FREE') return;

    setSubscribing(planId);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.error) {
        alert(data.error);
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const planIcons: Record<string, any> = { FREE: Star, BASIC: Zap, PREMIUM: Crown };

  return (
    <div className="bg-background-light min-h-screen">
      {/* Hero */}
      <div className="bg-primary text-white py-16">
        <div className="container-main text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Scale your business with the right plan. Start free and upgrade as you grow.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container-main py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const Icon = planIcons[plan.id] || Star;
              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border-2 p-6 flex flex-col relative ${
                    plan.popular
                      ? 'border-accent shadow-lg scale-[1.02]'
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-white text-xs font-bold px-4 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                      plan.id === 'PREMIUM' ? 'bg-purple-100 text-purple-600' :
                      plan.id === 'BASIC' ? 'bg-accent/10 text-accent' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">{plan.name}</h2>
                    <div className="mt-3">
                      <span className="text-4xl font-bold text-text-primary">
                        {plan.price === 0 ? 'Free' : `€${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-text-secondary text-sm">/{plan.interval}</span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-2">
                      {plan.maxListings} listing{plan.maxListings > 1 ? 's' : ''} &middot; {plan.featuredListings} featured
                    </p>
                  </div>

                  <ul className="space-y-3 flex-1 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                          plan.popular ? 'text-accent' : 'text-green-500'
                        }`} />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? 'accent' : plan.id === 'FREE' ? 'outline' : 'primary'}
                    className="w-full gap-2"
                    onClick={() => handleSubscribe(plan.id)}
                    loading={subscribing === plan.id}
                    disabled={plan.id === 'FREE'}
                  >
                    {plan.id === 'FREE' ? 'Current Plan' : 'Get Started'}
                    {plan.id !== 'FREE' && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Can I change my plan later?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards through our secure payment partner Stripe.' },
              { q: 'Is there a contract or commitment?', a: 'No. All plans are month-to-month with no long-term commitment. Cancel anytime.' },
              { q: 'What happens when I cancel?', a: 'Your plan remains active until the end of the current billing period. After that, you\'ll be moved to the Free plan.' },
              { q: 'What are featured listings?', a: 'Featured listings appear at the top of search results and category pages with a special badge, getting more visibility.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-semibold text-text-primary text-sm">{faq.q}</h3>
                <p className="text-sm text-text-secondary mt-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
