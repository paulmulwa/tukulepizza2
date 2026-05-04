'use client';

import Image from 'next/image';
import type { CSSProperties, ReactNode, Ref } from 'react';
import { useEffect, useRef, useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Type shim for <model-viewer> ────────────────────────────────────────────

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
  style?: CSSProperties & Record<string, string>;
  onError?: () => void;
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
};

const ModelViewer = 'model-viewer' as unknown as (props: ModelViewerProps) => ReactNode;

// ─── Device Detection ────────────────────────────────────────────────────────

function detectDevice(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  // iPads in desktop mode have platform === 'MacIntel' but maxTouchPoints > 1
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ARViewerProps {
  modelPath: string;
  thumbnailUrl: string;
  pizzaName: string;
  initialSize: 'small' | 'medium' | 'large';
  prices: { small: number; medium: number; large: number };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ARViewer({
  modelPath,
  thumbnailUrl,
  pizzaName,
  initialSize,
  prices,
}: ARViewerProps) {
  const [selectedSize, setSelectedSize] = useState(initialSize);
  /**
   * Viewer states:
   *  checking     → still figuring out capabilities
   *  ar           → device supports AR (iOS Quick Look / Android Scene Viewer)
   *  model-only   → device has WebGL but no AR (desktop, older phones)
   *  image-only   → no WebGL or model-viewer not available — show thumbnail
   */
  const [viewerState, setViewerState] = useState<
    'checking' | 'ar' | 'model-only' | 'image-only'
  >('checking');
  const [imageError, setImageError] = useState(false);
  const [iosPermissionPending, setIosPermissionPending] = useState(false);
  const mvRef = useRef<HTMLElement>(null);

  const currentPrice = prices[selectedSize];

  const handleClose = () => {
    if (typeof window !== 'undefined') window.history.back();
  };

  // ── Capability detection ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function detect() {
      // No WebGL → show image fallback immediately
      if (!hasWebGL() || !('customElements' in window)) {
        if (!cancelled) setViewerState('image-only');
        return;
      }

      // No model path → image fallback
      if (!modelPath) {
        if (!cancelled) setViewerState('image-only');
        return;
      }

      // Wait for model-viewer custom element to register (loaded via CDN script)
      try {
        if (!customElements.get('model-viewer')) {
          await Promise.race([
            customElements.whenDefined('model-viewer'),
            new Promise<never>((_, reject) =>
              window.setTimeout(() => reject(new Error('timeout')), 6000),
            ),
          ]);
        }
      } catch {
        // model-viewer didn't load in time → image fallback
        if (!cancelled) setViewerState('image-only');
        return;
      }

      if (cancelled) return;

      const device = detectDevice();

      if (device === 'ios') {
        // iOS 12+ supports Quick Look AR natively — always enable AR
        setViewerState('ar');
      } else if (device === 'android') {
        // Android supports Scene Viewer (ARCore) on most devices — always enable AR
        // Scene Viewer will gracefully tell the user if ARCore isn't installed
        setViewerState('ar');
      } else {
        // Desktop or unknown — show interactive 3D model without AR button
        setViewerState('model-only');
      }
    }

    detect();
    return () => { cancelled = true; };
  }, [modelPath]);

  // ── Sync scale attribute when size changes ────────────────────────────────
  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;
    mv.setAttribute('scale', SIZE_SCALES[selectedSize]);
  }, [selectedSize, viewerState]);

  // ── iOS motion permission (needed before activateAR on iOS 13+) ───────────
  const requestIOSPermission = async () => {
    const DevMotion = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DevMotion.requestPermission !== 'function') {
      (mvRef.current as unknown as { activateAR?: () => void })?.activateAR?.();
      return;
    }
    setIosPermissionPending(true);
    try {
      const result = await DevMotion.requestPermission();
      if (result === 'granted') {
        (mvRef.current as unknown as { activateAR?: () => void })?.activateAR?.();
      }
    } catch {
      // User dismissed — do nothing
    } finally {
      setIosPermissionPending(false);
    }
  };

  // ── Image-only fallback ───────────────────────────────────────────────────
  if (viewerState === 'image-only') {
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
            <div className="ar-fallback-placeholder">🍕</div>
          )}
          <div className="ar-fallback-scrim" />
          <div className="ar-fallback-copy">
            <p className="ar-fallback-kicker">Preview</p>
            <h2>{pizzaName}</h2>
            <p>AR is not available on this device, but you can still see the pizza here!</p>
            <button className="retry-btn" onClick={handleClose}>Back to menu</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Shared model-viewer style ─────────────────────────────────────────────
  const mvStyle: CSSProperties & Record<string, string> = {
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
    '--poster-color': '#111',
  };

  return (
    <div className="ar-overlay" role="dialog" aria-label="AR Pizza Viewer">
      <button className="ar-back-btn" onClick={handleClose} aria-label="Close AR viewer" id="ar-back-btn">
        &larr;
      </button>

      <div className="model-viewer-container">
        {viewerState === 'checking' ? (
          <div className="ar-loader">
            <div className="spinner" />
            <p>Preparing preview…</p>
          </div>

        ) : viewerState === 'model-only' ? (
          /* Desktop / unsupported AR — interactive 3D only */
          <>
            <ModelViewer
              ref={mvRef}
              src={modelPath}
              poster={thumbnailUrl}
              alt={`3D model of ${pizzaName}`}
              camera-controls
              touch-action="pan-y"
              shadow-intensity="0.5"
              exposure="1"
              environment-image="neutral"
              loading="eager"
              reveal="auto"
              interaction-prompt="auto"
              scale={SIZE_SCALES[selectedSize]}
              style={mvStyle}
              onError={() => setViewerState('image-only')}
            />
            <div className="ar-unsupported">
              <p>AR is not supported on this device — but here&apos;s your pizza in 3D!</p>
            </div>
          </>

        ) : (
          /* AR-capable device (iOS + Android) */
          <>
            <ModelViewer
              ref={mvRef}
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
              style={mvStyle}
              onError={() => setViewerState('image-only')}
            >
              {/* Native AR launch button — styled via CSS .native-ar-btn */}
              <button slot="ar-button" className="native-ar-btn" id="ar-native-btn">
                📷 View in your space
              </button>

              <div id="ar-prompt">
                <div className="ar-hand-animation" />
                <p>Move your phone slowly to detect a flat surface</p>
              </div>

              <div id="ar-failure">
                <p>AR is not available on this device</p>
              </div>
            </ModelViewer>

            {/* iOS 13+ needs a user-gesture to unlock motion/camera */}
            {iosPermissionPending && (
              <div className="permission-overlay" role="alertdialog" aria-live="polite">
                <h2>Allow Camera Access</h2>
                <p>Camera and motion access are required to view the pizza in your room.</p>
                <button className="retry-btn" onClick={requestIOSPermission}>
                  Allow & Launch AR
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Size + price controls */}
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
        <span className="ar-price-label">Ksh {currentPrice.toLocaleString()}</span>
      </div>
    </div>
  );
}
