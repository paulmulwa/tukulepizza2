'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'camera-controls'?: boolean;
        'shadow-intensity'?: string;
        'environment-image'?: string;
        'auto-rotate'?: boolean;
        scale?: string;
        style?: React.CSSProperties;
      }, HTMLElement>;
    }
  }
}

const SIZE_SCALES: Record<'small' | 'medium' | 'large', string> = {
  small: '0.20 0.20 0.20',
  medium: '0.30 0.30 0.30',
  large: '0.40 0.40 0.40',
};

const SIZES: Array<{ key: 'small' | 'medium' | 'large'; label: string }> = [
  { key: 'small', label: 'S' },
  { key: 'medium', label: 'M' },
  { key: 'large', label: 'L' },
];

interface ARViewerProps {
  modelPath: string;
  pizzaName: string;
  initialSize: 'small' | 'medium' | 'large';
  prices: { small: number; medium: number; large: number };
  onClose: () => void;
}

export default function ARViewer({
  modelPath,
  pizzaName,
  initialSize,
  prices,
  onClose,
}: ARViewerProps) {
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [modelError, setModelError] = useState(false);
  const mvRef = useRef<HTMLElement>(null);

  const currentPrice = prices[selectedSize];

  // Request device orientation permission on iOS
  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((state: string) => {
          if (state === 'denied') setPermissionDenied(true);
        })
        .catch(() => setPermissionDenied(true));
    }
  }, []);

  // Animate scale change smoothly
  useEffect(() => {
    const mv = mvRef.current as any;
    if (!mv) return;
    const newScale = SIZE_SCALES[selectedSize];
    // model-viewer exposes scale via attribute
    mv.setAttribute('scale', newScale);
  }, [selectedSize]);

  const handleSizeChange = (size: 'small' | 'medium' | 'large') => {
    setSelectedSize(size);
  };

  if (permissionDenied) {
    return (
      <div className="ar-overlay">
        <div className="permission-overlay">
          <div style={{ fontSize: 52 }}>📷</div>
          <h2>Camera Access Needed</h2>
          <p>
            Camera access is needed to view your pizza in AR. Please allow camera
            access in your browser settings and try again.
          </p>
          <button
            className="retry-btn"
            onClick={() => {
              setPermissionDenied(false);
            }}
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            style={{
              marginTop: 12,
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-overlay" role="dialog" aria-label="AR Pizza Viewer">
      {/* Back button */}
      <button className="ar-back-btn" onClick={onClose} aria-label="Close AR viewer" id="ar-back-btn">
        ←
      </button>

      {/* Model Viewer */}
      <div className="model-viewer-container">
        {modelError ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#fff',
              textAlign: 'center',
              padding: 40,
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 16 }}>🍕</div>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>3D Preview Unavailable</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              The 3D model could not be loaded. Please check your connection and try again.
            </p>
          </div>
        ) : (
          <model-viewer
            ref={mvRef as any}
            src={modelPath}
            alt={`3D model of ${pizzaName}`}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            camera-controls
            shadow-intensity="1"
            environment-image="neutral"
            scale={SIZE_SCALES[selectedSize]}
            style={{ width: '100%', height: '100%', background: '#1a1a1a' }}
            onError={() => setModelError(true)}
          />
        )}
      </div>

      {/* Size controls overlay */}
      <div className="ar-size-controls" role="group" aria-label="Pizza size selector">
        {SIZES.map(({ key, label }) => (
          <button
            key={key}
            id={`ar-size-${key}`}
            className={`ar-size-btn${selectedSize === key ? ' active' : ''}`}
            onClick={() => handleSizeChange(key)}
            aria-pressed={selectedSize === key}
          >
            {label}
          </button>
        ))}
        <span className="ar-price-label">
          Ksh {currentPrice.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
