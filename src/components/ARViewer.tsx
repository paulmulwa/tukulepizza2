'use client';

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
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [modelError, setModelError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const mvRef = useRef<HTMLElement>(null);

  const currentPrice = prices[selectedSize];

  // Handle camera permissions and orientation
  useEffect(() => {
    async function checkPermissions() {
      try {
        // 1. Check Camera Permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop()); // Release the camera
            setCameraPermission('granted');
          } catch (err: any) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              setCameraPermission('denied');
            } else {
              setCameraPermission('granted');
            }
          }
        }

        // 2. iOS Motion Permission
        if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          await (DeviceOrientationEvent as any).requestPermission();
        }
      } catch (err) {
        console.warn('Permission request failed:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    checkPermissions();
  }, []);

  // Update scale when size changes
  useEffect(() => {
    const mv = mvRef.current as any;
    if (!mv) return;
    const newScale = SIZE_SCALES[selectedSize];
    mv.setAttribute('scale', newScale);
  }, [selectedSize]);

  const handleSizeChange = (size: 'small' | 'medium' | 'large') => {
    setSelectedSize(size);
  };

  if (cameraPermission === 'denied') {
    return (
      <div className="ar-overlay">
        <div className="permission-overlay">
          <div style={{ fontSize: 52 }}>📷</div>
          <h2>Camera Access Denied</h2>
          <p>
            To view this pizza in your room, we need camera access. 
            Please enable camera permissions in your browser settings and try again.
          </p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Refresh Page
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
            Go back to menu
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

      {/* Model Viewer Container */}
      <div className="model-viewer-container">
        {isInitializing ? (
          <div className="ar-loader">
            <div className="spinner"></div>
            <p>Initializing Camera...</p>
          </div>
        ) : modelError ? (
          <div className="ar-error-view">
            <div style={{ fontSize: 64, marginBottom: 16 }}>🍕</div>
            <h2>3D Preview Unavailable</h2>
            <p>The 3D model could not be loaded. Please check your connection.</p>
            <button className="retry-btn" onClick={onClose}>Return to Menu</button>
          </div>
        ) : (
          <ModelViewer
            ref={mvRef as any}
            src={modelPath}
            alt={`3D model of ${pizzaName}`}
            ar
            ar-modes="scene-viewer webxr quick-look"
            ar-placement="floor"
            ar-scale="fixed"
            camera-controls
            touch-action="none"
            shadow-intensity="0.5"
            exposure="1"
            environment-image="neutral"
            scale={SIZE_SCALES[selectedSize]}
            style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: 'transparent',
              '--poster-color': 'transparent' 
            }}
            onError={() => setModelError(true)}
          >
            {/* Hit-test reticle for surface detection */}
            <div slot="ar-button" style={{ display: 'none' }}></div>
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
