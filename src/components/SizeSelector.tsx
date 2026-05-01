'use client';

interface SizeSelectorProps {
  selectedSize: 'small' | 'medium' | 'large';
  priceSmall: number;
  priceMedium: number;
  priceLarge: number;
  onChange: (size: 'small' | 'medium' | 'large') => void;
}

const SIZES = [
  { key: 'small' as const, label: 'Small', diameter: '20cm' },
  { key: 'medium' as const, label: 'Medium', diameter: '30cm' },
  { key: 'large' as const, label: 'Large', diameter: '40cm' },
];

export default function SizeSelector({
  selectedSize,
  priceSmall,
  priceMedium,
  priceLarge,
  onChange,
}: SizeSelectorProps) {
  const prices = { small: priceSmall, medium: priceMedium, large: priceLarge };

  return (
    <div>
      <div className="section-label">Choose Size</div>
      <div className="size-row">
        {SIZES.map(({ key, label, diameter }) => (
          <button
            key={key}
            id={`size-btn-${key}`}
            className={`size-btn${selectedSize === key ? ' active' : ''}`}
            onClick={() => onChange(key)}
            aria-pressed={selectedSize === key}
          >
            <span className="size-name">{label}</span>
            <span className="size-diameter">{diameter}</span>
            <span className="size-price">Ksh {prices[key].toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
