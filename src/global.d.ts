declare namespace JSX {
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
      onError?: (event: Event) => void;
    }, HTMLElement>;
  }
}
