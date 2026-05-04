'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Pizza, isSupabaseConfigured } from '@/lib/supabase';
import PizzaCard from '@/components/PizzaCard';
import CategoryTabs from '@/components/CategoryTabs';

type PizzaRow = Partial<Pizza> & {
  toppings?: string[];
  image_url?: string;
  model3d_url?: string;
  has_offer?: boolean;
  offer_badge?: string;
};

const SUPABASE_TIMEOUT_MS = 3500;

function withTimeout<T>(request: PromiseLike<T>) {
  return Promise.race([
    request,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Supabase request timed out')), SUPABASE_TIMEOUT_MS);
    }),
  ]);
}

export default function MenuPage() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [offline, setOffline] = useState(() =>
    typeof navigator === 'undefined' ? false : !navigator.onLine,
  );

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    async function fetchPizzas() {
      if (!isSupabaseConfigured) {
        setLoadError('Supabase is not configured. Add your keys to .env.local.');
        setPizzas([]);
        setLoading(false);
        return;
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setLoadError('You are offline. Please reconnect to load the menu.');
        setPizzas([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await withTimeout(
          supabase
            .from('pizzas')
            .select('*')
            .order('id'),
        );
        if (error || !data) {
          setLoadError('Menu is unavailable right now. Please try again shortly.');
          setPizzas([]);
        } else {
          // Map to handle old schema (image_url, toppings) and new schema
          const mapped: Pizza[] = (data as PizzaRow[]).map((p) => {
            return {
              id: p.id ?? 0,
              name: p.name ?? 'Pizza',
              slug: p.slug ?? String(p.id ?? 'pizza'),
              category: p.category ?? 'Classic',
              description: p.description ?? '',
              ingredients: p.toppings || p.ingredients || [],
              tags: p.has_offer && p.offer_badge ? [p.offer_badge] : (p.tags || []),
              thumbnail_url: p.image_url || p.thumbnail_url || '',
              model_path: p.model3d_url || p.model_path || '',
              price_small: Number(p.price_small ?? 750),
              price_medium: Number(p.price_medium ?? 1000),
              price_large: Number(p.price_large ?? 2300),
              created_at: p.created_at || new Date().toISOString(),
            };
          });
          setPizzas(mapped);
        }
      } catch {
        setLoadError('Menu is unavailable right now. Please try again shortly.');
        setPizzas([]);
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
        ) : loadError ? (
          <div className="not-found" style={{ minHeight: '40vh' }}>
            <div style={{ fontSize: 48 }}>⚠️</div>
            <h2 style={{ fontSize: 18, margin: '12px 0 8px' }}>Menu unavailable</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
              {loadError}
            </p>
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
