'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const SIZE_SCALES: Record<'small' | 'medium' | 'large', string> = {
  small: '0.20 0.20 0.20',
  medium: '0.30 0.30 0.30',
  large: '0.40 0.40 0.40',
};

const ModelViewer = 'model-viewer' as any;

const SIZES: Array<{ key: 'small' | 'medium' | 'large'; label: string }> = [
  { key: 'small', label: 'S' },
  { key: 'medium', label: 'M' },
  { key: 'large', label: 'L' },
];

interface ARViewerProps {
  modelPath: string;
  thumbnailUrl: string;
  pizzaName: string;
  initialSize: 'small' | 'medium' | 'large';
  prices: { small: number; medium: number; large: number };
  onClose: () => void;
}

function hasWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

export default function ARViewer({
  modelPath,
  thumbnailUrl,
  pizzaName,
  initialSize,
  prices,
  onClose,
}: ARViewerProps) {
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [viewerState, setViewerState] = useState<'checking' | 'ready' | 'fallback'>('checking');
  const [imageError, setImageError] = useState(false);
  const mvRef = useRef<HTMLElement>(null);

  const currentPrice = prices[selectedSize];

  useEffect(() => {
    let cancelled = false;

    if (!modelPath || !hasWebGLSupport() || !('customElements' in window)) {
      setViewerState('fallback');
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!cancelled) setViewerState('fallback');
    }, 5000);

    const markReady = () => {
      if (!cancelled) {
        window.clearTimeout(timeout);
        setViewerState('ready');
      }
    };

    if (customElements.get('model-viewer')) {
      markReady();
    } else {
      customElements
        .whenDefined('model-viewer')
        .then(markReady)
        .catch(() => {
          if (!cancelled) setViewerState('fallback');
        });
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [modelPath]);

  useEffect(() => {
    const mv = mvRef.current as any;
    if (!mv) return;
    mv.setAttribute('scale', SIZE_SCALES[selectedSize]);
  }, [selectedSize, viewerState]);

  if (viewerState === 'fallback') {
    return (
      <div className="ar-overlay" role="dialog" aria-label="Pizza preview">
        <button className="ar-back-btn" onClick={onClose} aria-label="Close preview" id="ar-back-btn">
          &larr;
        </button>

        <div className="ar-fallback-view">
          {!imageError && thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={pizzaName}
              fill
              unoptimized
              sizes="100vw"
              className="ar-fallback-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="ar-fallback-placeholder">Pizza</div>
          )}
          <div className="ar-fallback-scrim" />
          <div className="ar-fallback-copy">
            <p className="ar-fallback-kicker">Preview mode</p>
            <h2>{pizzaName}</h2>
            <p>3D AR is unavailable on this device or the model file is missing.</p>
            <button className="retry-btn" onClick={onClose}>Back to menu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-overlay" role="dialog" aria-label="AR Pizza Viewer">
      <button className="ar-back-btn" onClick={onClose} aria-label="Close AR viewer" id="ar-back-btn">
        &larr;
      </button>

      <div className="model-viewer-container">
        {viewerState === 'checking' ? (
          <div className="ar-loader">
            <div className="spinner"></div>
            <p>Preparing preview...</p>
          </div>
        ) : (
          <ModelViewer
            ref={mvRef as any}
            src={modelPath}
            poster={thumbnailUrl}
            alt={`3D model of ${pizzaName}`}
            ar
            ar-modes="scene-viewer webxr quick-look"
            ar-placement="floor"
            ar-scale="fixed"
            camera-controls
            touch-action="pan-y"
            shadow-intensity="0.5"
            exposure="1"
            environment-image="neutral"
            loading="eager"
            reveal="auto"
            interaction-prompt="auto"
            scale={SIZE_SCALES[selectedSize]}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#111',
              '--poster-color': '#111',
            }}
            onError={() => setViewerState('fallback')}
          >
            <button slot="ar-button" className="native-ar-btn">
              View in your space
            </button>
            <div id="ar-prompt">
              <div className="ar-hand-animation"></div>
              <p>Move your phone around to detect a surface</p>
            </div>

            <div id="ar-failure">
              <p>AR is not supported on this device</p>
            </div>
          </ModelViewer>
        )}
      </div>

      <div className="ar-size-controls" role="group" aria-label="Pizza size selector">
        {SIZES.map(({ key, label }) => (
          <button
            key={key}
            id={`ar-size-${key}`}
            className={`ar-size-btn${selectedSize === key ? ' active' : ''}`}
            onClick={() => setSelectedSize(key)}
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
