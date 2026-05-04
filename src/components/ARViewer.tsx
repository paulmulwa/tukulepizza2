'use client';

import Image from 'next/image';
import type { CSSProperties, ReactNode, Ref } from 'react';
import { useEffect, useRef, useState } from 'react';

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

type ModelViewerProps = {
  src?: string;
  poster?: string;
  alt?: string;
  ar?: boolean;
  'ar-modes'?: string;
  'ar-placement'?: string;
  'ar-scale'?: string;
  'camera-controls'?: boolean;
  'touch-action'?: string;
  'shadow-intensity'?: string;
  exposure?: string;
  'environment-image'?: string;
  loading?: string;
  reveal?: string;
  'interaction-prompt'?: string;
  scale?: string;
  style?: CSSProperties & Record<'--poster-color', string>;
  onError?: () => void;
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
};

const ModelViewer = 'model-viewer' as unknown as (props: ModelViewerProps) => ReactNode;

interface ARViewerProps {
  modelPath: string;
  thumbnailUrl: string;
  pizzaName: string;
  initialSize: 'small' | 'medium' | 'large';
  prices: { small: number; medium: number; large: number };
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

async function sameOriginModelExists(modelPath: string) {
  const url = new URL(modelPath, window.location.href);

  if (url.origin !== window.location.origin) {
    return true;
  }

  const response = await fetch(url, {
    method: 'HEAD',
    cache: 'no-store',
  });

  return response.ok;
}

export default function ARViewer({
  modelPath,
  thumbnailUrl,
  pizzaName,
  initialSize,
  prices,
}: ARViewerProps) {
  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [viewerState, setViewerState] = useState<
    'checking' | 'ready' | 'fallback-3d' | 'fallback-image'
  >('checking');
  const [imageError, setImageError] = useState(false);
  const [permissionState, setPermissionState] = useState<'unknown' | 'granted' | 'denied'>(
    'unknown',
  );
  const mvRef = useRef<HTMLElement>(null);

  const currentPrice = prices[selectedSize];
  const motionPermissionRequired =
    typeof window !== 'undefined' &&
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })
      .requestPermission === 'function';

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  useEffect(() => {
    let cancelled = false;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!modelPath || !hasWebGLSupport() || !('customElements' in window)) {
      queueMicrotask(() => {
        if (!cancelled) setViewerState('fallback-image');
      });
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!cancelled) setViewerState('fallback-image');
    }, 5000);

    const resolveSupport = async () => {
      try {
        if (!customElements.get('model-viewer')) {
          await customElements.whenDefined('model-viewer');
        }

        const modelExists = await sameOriginModelExists(modelPath);
        if (!modelExists) {
          throw new Error('Model file is missing');
        }

        let arSupported = isIOS;
        const xr = (navigator as Navigator & {
          xr?: { isSessionSupported?: (mode: string) => Promise<boolean> };
        }).xr;

        if (!arSupported && xr?.isSessionSupported) {
          arSupported = await xr.isSessionSupported('immersive-ar');
        }

        if (!cancelled) {
          window.clearTimeout(timeout);
          setViewerState(arSupported ? 'ready' : 'fallback-3d');
        }
      } catch {
        if (!cancelled) {
          window.clearTimeout(timeout);
          setViewerState('fallback-image');
        }
      }
    };

    resolveSupport();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [modelPath]);

  const requestMotionPermission = async () => {
    if (!motionPermissionRequired) {
      setPermissionState('granted');
      (mvRef.current as unknown as { activateAR?: () => void })?.activateAR?.();
      return;
    }

    try {
      const result = await (
        DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }
      ).requestPermission();
      const granted = result === 'granted';
      setPermissionState(granted ? 'granted' : 'denied');

      if (granted) {
        (mvRef.current as unknown as { activateAR?: () => void })?.activateAR?.();
      }
    } catch {
      setPermissionState('denied');
    }
  };

  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;
    mv.setAttribute('scale', SIZE_SCALES[selectedSize]);
  }, [selectedSize, viewerState]);

  if (viewerState === 'fallback-image') {
    return (
      <div className="ar-overlay" role="dialog" aria-label="Pizza preview">
        <button className="ar-back-btn" onClick={handleClose} aria-label="Close preview" id="ar-back-btn">
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
            <button className="retry-btn" onClick={handleClose}>Back to pizza</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-overlay" role="dialog" aria-label="AR Pizza Viewer">
      <button className="ar-back-btn" onClick={handleClose} aria-label="Close AR viewer" id="ar-back-btn">
        &larr;
      </button>

      <div className="model-viewer-container">
        {viewerState === 'checking' ? (
          <div className="ar-loader">
            <div className="spinner"></div>
            <p>Preparing preview...</p>
          </div>
        ) : viewerState === 'fallback-3d' ? (
          <>
            <ModelViewer
              ref={mvRef}
              src={modelPath}
              poster={thumbnailUrl}
              alt={`3D model of ${pizzaName}`}
              camera-controls
              touch-action="pan-y"
              shadow-intensity="1"
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
              } as CSSProperties & Record<'--poster-color', string>}
              onError={() => setViewerState('fallback-image')}
            />
            <div className="ar-unsupported">
              <p>AR is not supported on your device, but here&apos;s your pizza in 3D.</p>
            </div>
          </>
        ) : (
          <>
            <ModelViewer
              ref={mvRef}
              src={modelPath}
              poster={thumbnailUrl}
              alt={`3D model of ${pizzaName}`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-placement="floor"
              ar-scale="fixed"
              camera-controls
              touch-action="pan-y"
              shadow-intensity="1"
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
              } as CSSProperties & Record<'--poster-color', string>}
              onError={() => setViewerState('fallback-image')}
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

            {motionPermissionRequired && permissionState !== 'granted' && (
              <div className="permission-overlay" role="alertdialog" aria-live="polite">
                <h2>Enable camera access</h2>
                <p>
                  Camera access is needed to view your pizza in AR. Please allow camera and motion
                  access in your browser settings.
                </p>
                <button className="retry-btn" onClick={requestMotionPermission}>
                  Try Again
                </button>
              </div>
            )}
          </>
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
