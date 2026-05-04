import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      src?: string;
      alt?: string;
      ar?: boolean;
      'ar-modes'?: string;
      'ar-placement'?: string;
      'ar-scale'?: string;
      'camera-controls'?: boolean;
      poster?: string;
      loading?: string;
      reveal?: string;
      'touch-action'?: string;
      'interaction-prompt'?: string;
      'shadow-intensity'?: string;
      exposure?: string;
      'environment-image'?: string;
      'auto-rotate'?: boolean;
      scale?: string;
      style?: React.CSSProperties;
      onError?: (event: Event) => void;
      }, HTMLElement>;
    }
  }
}

export {};
