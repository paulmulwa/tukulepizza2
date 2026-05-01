'use client';

const CATEGORIES = ['All', 'Classic', 'Spicy', 'Meat Lovers', 'Veggie', "Chef's Special"];

interface CategoryTabsProps {
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Pizza categories">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          id={`tab-${cat.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')}`}
          role="tab"
          aria-selected={active === cat}
          className={`tab-btn${active === cat ? ' active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
