'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Pizza } from '@/lib/supabase';

const CATEGORY_BADGE: Record<string, string> = {
  Classic: 'badge-classic',
  Spicy: 'badge-spicy',
  'Meat Lovers': 'badge-meat',
  Veggie: 'badge-veggie',
  "Chef's Special": 'badge-chef',
};

interface PizzaCardProps {
  pizza: Pizza;
  index: number;
}

export default function PizzaCard({ pizza, index }: PizzaCardProps) {
  const badgeClass = CATEGORY_BADGE[pizza.category] || 'badge-classic';

  return (
    <Link
      href={`/pizza/${pizza.slug}`}
      className="pizza-card"
      id={`pizza-card-${pizza.slug}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {pizza.thumbnail_url ? (
        <Image
          src={pizza.thumbnail_url}
          alt={pizza.name}
          width={80}
          height={80}
          className="pizza-thumb"
          unoptimized
        />
      ) : (
        <div className="pizza-thumb-placeholder">🍕</div>
      )}

      <div className="pizza-info">
        <div className="pizza-name">{pizza.name}</div>
        <span className={`category-badge ${badgeClass}`}>{pizza.category}</span>
        <div className="pizza-price">
          Ksh {pizza.price_small.toLocaleString()}
        </div>
      </div>

      <span style={{ color: '#ccc', fontSize: 18 }}>›</span>
    </Link>
  );
}
