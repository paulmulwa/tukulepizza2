'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, Pizza, isSupabaseConfigured } from '@/lib/supabase';
import { LOCAL_PIZZAS } from '@/data/pizzas';
import BackButton from '@/components/BackButton';
import SizeSelector from '@/components/SizeSelector';
import ARViewer from '@/components/ARViewer';

const INGREDIENT_EMOJIS: Record<string, string> = {
  'Tomato Base': '🍅',
  'Mozzarella': '🧀',
  'Fresh Basil': '🌿',
  'Olive Oil': '🫒',
  'Spicy Salami': '🌶️',
  'Chili Flakes': '🔥',
  'BBQ Sauce': '🥫',
  'Beef Strips': '🥩',
  'Red Onion': '🧅',
  'Cheddar': '🧀',
  'Oregano': '🌿',
  'Double Pepperoni': '🍕',
  'Pepperoni': '🍕',
  'Roasted Peppers': '🫑',
  'Zucchini': '🥒',
  'Olives': '🫒',
  'Kalamata Olives': '🫒',
  'Feta Cheese': '🧀',
  'Truffle Oil': '✨',
  'Wild Mushrooms': '🍄',
  'Parmesan': '🧀',
  'Cream Base': '🥛',
  'Thyme': '🌿',
  'Grilled Chicken': '🍗',
  'Jalapeños': '🌶️',
  'Hot Sauce': '🔥',
  'Anchovies': '🐟',
  'Capers': '🫙',
};

const CATEGORY_BADGE: Record<string, string> = {
  Classic: 'badge-classic',
  Spicy: 'badge-spicy',
  'Meat Lovers': 'badge-meat',
  Veggie: 'badge-veggie',
  "Chef's Special": 'badge-chef',
};

function getEmoji(ingredient: string) {
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJIS)) {
    if (ingredient.toLowerCase().includes(key.toLowerCase())) return emoji;
  }
  return '🍕';
}

export default function PizzaDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [pizza, setPizza] = useState<Pizza | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showAR, setShowAR] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function fetchPizza() {
      // Use local data if Supabase not configured
      if (!isSupabaseConfigured) {
        const local = LOCAL_PIZZAS.find((p) => p.slug === slug);
        if (local) setPizza(local);
        else setNotFound(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pizzas')
          .select('*, pizza_sizes(label, price)')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          const local = LOCAL_PIZZAS.find((p) => p.slug === slug);
          if (local) setPizza(local);
          else setNotFound(true);
        } else {
          const sizes = Array.isArray(data.pizza_sizes) ? data.pizza_sizes : [];
          const small = sizes.find((s: any) => s.label === 'Small');
          const medium = sizes.find((s: any) => s.label === 'Medium');
          const large = sizes.find((s: any) => s.label === 'Large');

          setPizza({
            id: data.id,
            name: data.name,
            slug: data.slug,
            category: data.category,
            description: data.description,
            ingredients: data.toppings || data.ingredients || [],
            tags: data.has_offer && data.offer_badge ? [data.offer_badge] : (data.tags || []),
            thumbnail_url: data.image_url || data.thumbnail_url || '',
            model_path: data.model3d_url || data.model_path || '',
            price_small: small ? Number(small.price) : (data.price_small || 750),
            price_medium: medium ? Number(medium.price) : (data.price_medium || 1000),
            price_large: large ? Number(large.price) : (data.price_large || 2300),
            created_at: data.created_at || new Date().toISOString(),
          });
        }
      } catch {
        const local = LOCAL_PIZZAS.find((p) => p.slug === slug);
        if (local) setPizza(local);
        else setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchPizza();
  }, [slug]);

  const currentPrice =
    pizza
      ? selectedSize === 'small'
        ? pizza.price_small
        : selectedSize === 'medium'
        ? pizza.price_medium
        : pizza.price_large
      : 0;

  const sizeLabel =
    selectedSize === 'small' ? 'Small' : selectedSize === 'medium' ? 'Medium' : 'Large';

  if (showAR && pizza) {
    return (
      <ARViewer
        modelPath={pizza.model_path}
        pizzaName={pizza.name}
        initialSize={selectedSize}
        prices={{
          small: pizza.price_small,
          medium: pizza.price_medium,
          large: pizza.price_large,
        }}
        onClose={() => setShowAR(false)}
      />
    );
  }

  if (loading) {
    return (
      <div className="app-container">
        <header className="detail-header">
          <BackButton href="/" />
          <Link href="/" className="logo" id="detail-logo">
            🍕 Pizza In
          </Link>
        </header>
        <main style={{ paddingTop: 57 }}>
          <div className="skeleton" style={{ width: '100%', height: 280 }} />
          <div style={{ padding: 20 }}>
            <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 16, width: '35%', marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '80%' }} />
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !pizza) {
    return (
      <div className="app-container">
        <header className="detail-header">
          <BackButton href="/" />
          <Link href="/" className="logo" id="detail-logo-notfound">
            🍕 Pizza In
          </Link>
        </header>
        <main style={{ paddingTop: 57 }}>
          <div className="not-found">
            <div style={{ fontSize: 64 }}>😢</div>
            <h1>Pizza Not Found</h1>
            <p>This pizza doesn&apos;t exist in our menu.</p>
            <Link href="/" className="btn-teal" id="back-to-menu">
              ← Back to Menu
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const badgeClass = CATEGORY_BADGE[pizza.category] || 'badge-classic';

  return (
    <div className="app-container">
      {/* Fixed Header */}
      <header className="detail-header">
        <BackButton href="/" />
        <Link href="/" className="logo" id="detail-logo-main">
          🍕 Pizza In
        </Link>
      </header>

      <main style={{ paddingTop: 57 }}>
        {/* Hero image / AR trigger */}
        <div
          className="pizza-hero"
          onClick={() => setShowAR(true)}
          role="button"
          tabIndex={0}
          aria-label={`View ${pizza.name} in Augmented Reality`}
          id="hero-ar-trigger"
          onKeyDown={(e) => e.key === 'Enter' && setShowAR(true)}
        >
          {!imgError && pizza.thumbnail_url ? (
            <Image
              src={pizza.thumbnail_url}
              alt={pizza.name}
              fill
              className="pizza-hero-img"
              unoptimized
              onError={() => setImgError(true)}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="pizza-hero-placeholder">🍕</div>
          )}
          <div className="hero-gradient" />
          <div className="ar-tap-label">👆 Tap to view in AR</div>
        </div>

        {/* Detail content */}
        <div className="pizza-detail-content">
          {/* Name & Category */}
          <h1 className="pizza-detail-name">{pizza.name}</h1>
          <span className={`category-badge ${badgeClass}`}>{pizza.category}</span>

          {/* Dietary Tags */}
          {pizza.tags && pizza.tags.length > 0 && (
            <div className="tags-row">
              {pizza.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="divider" />

          {/* Description */}
          <p className="pizza-description">{pizza.description}</p>

          <div className="divider" />

          {/* Ingredients */}
          {pizza.ingredients && pizza.ingredients.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div className="section-label">Includes</div>
              <div className="ingredients-row">
                {pizza.ingredients.map((ing) => (
                  <span key={ing} className="ingredient-chip">
                    {getEmoji(ing)} {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="divider" />

          {/* Size Selector */}
          <div style={{ marginBottom: 4 }}>
            <SizeSelector
              selectedSize={selectedSize}
              priceSmall={pizza.price_small}
              priceMedium={pizza.price_medium}
              priceLarge={pizza.price_large}
              onChange={setSelectedSize}
            />
          </div>

          {/* AR Button */}
          <button
            id="ar-launch-btn"
            className="ar-btn"
            onClick={() => setShowAR(true)}
            aria-label={`View ${pizza.name} in AR — ${sizeLabel} — Ksh ${currentPrice.toLocaleString()}`}
          >
            <span>👁️</span>
            <span>
              View in AR — {sizeLabel} — Ksh {currentPrice.toLocaleString()}
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
