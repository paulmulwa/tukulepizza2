'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Pizza, isSupabaseConfigured } from '@/lib/supabase';
import { LOCAL_PIZZAS } from '@/data/pizzas';
import PizzaCard from '@/components/PizzaCard';
import CategoryTabs from '@/components/CategoryTabs';

export default function MenuPage() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    async function fetchPizzas() {
      // Use local data immediately if Supabase is not configured
      if (!isSupabaseConfigured) {
        setPizzas(LOCAL_PIZZAS);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pizzas')
          .select('*, pizza_sizes(label, price)')
          .order('id');
        if (error || !data || data.length === 0) {
          setPizzas(LOCAL_PIZZAS);
        } else {
          // Map to handle old schema (image_url, toppings) and new schema
          const mapped: Pizza[] = data.map((p: any) => {
            const sizes = Array.isArray(p.pizza_sizes) ? p.pizza_sizes : [];
            const small = sizes.find((s: any) => s.label === 'Small');
            const medium = sizes.find((s: any) => s.label === 'Medium');
            const large = sizes.find((s: any) => s.label === 'Large');

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              category: p.category,
              description: p.description,
              ingredients: p.toppings || p.ingredients || [],
              tags: p.has_offer && p.offer_badge ? [p.offer_badge] : (p.tags || []),
              thumbnail_url: p.image_url || p.thumbnail_url || '',
              model_path: p.model3d_url || p.model_path || '',
              price_small: small ? Number(small.price) : (p.price_small || 750),
              price_medium: medium ? Number(medium.price) : (p.price_medium || 1000),
              price_large: large ? Number(large.price) : (p.price_large || 2300),
              created_at: p.created_at || new Date().toISOString(),
            };
          });
          setPizzas(mapped);
        }
      } catch {
        setPizzas(LOCAL_PIZZAS);
      } finally {
        setLoading(false);
      }
    }
    fetchPizzas();
  }, []);

  const filtered =
    activeCategory === 'All'
      ? pizzas
      : pizzas.filter((p) => p.category === activeCategory);

  return (
    <div className="app-container">
      {offline && (
        <div className="offline-banner" role="alert">
          📡 You&apos;re offline. Please reconnect to view the menu.
        </div>
      )}

      {/* Fixed Header */}
      <header className="app-header" style={{ top: offline ? 40 : 0 }}>
        <Link href="/" className="logo" id="logo-home">
          🍕 Pizza In
        </Link>
      </header>

      {/* Main scroll area */}
      <main style={{ paddingTop: offline ? 97 : 57 }}>
        {/* Hero */}
        <div className="hero-section">
          <h1 className="hero-title">Fresh Pizzas,<br />Built for You</h1>
          <p className="hero-subtitle">Tap any pizza to view it in Augmented Reality 👆</p>
        </div>

        {/* Category Tabs */}
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

        {/* Pizza List */}
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                <div className="skeleton" style={{ width: 80, height: 80, borderRadius: 10 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '30%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '25%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="not-found" style={{ minHeight: '40vh' }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <h2 style={{ fontSize: 18, margin: '12px 0 8px' }}>No pizzas found</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
              Try selecting a different category.
            </p>
          </div>
        ) : (
          <div className="pizza-list" role="list">
            {filtered.map((pizza, i) => (
              <PizzaCard key={pizza.id} pizza={pizza} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
