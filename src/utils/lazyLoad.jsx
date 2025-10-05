import React, { Suspense } from 'react';

/**
 * Lazy Loading Utilities for Performance Optimization
 * 
 * Provides components and utilities for implementing lazy loading of heavy components,
 * which helps reduce the initial bundle size and improves app performance.
 */

/**
 * Loading Spinner Component
 * Default fallback component for lazy-loaded components
 */
export const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
      <p className="mt-2 text-sm text-gray-600">{message}</p>
    </div>
  );
};

/**
 * Error Boundary for Lazy Components
 * Handles errors that might occur during lazy loading
 */
export class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
    
    // Optionally report to error tracking service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load component
          </h3>
          <p className="text-gray-600 mb-4">
            {this.props.fallbackMessage || 'There was an error loading this component.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for lazy loading with enhanced error handling
 * @param {Function} importFn - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {React.Component} - Lazy-loaded component with error handling
 */
export const createLazyComponent = (importFn, options = {}) => {
  const {
    fallback = <LoadingSpinner />,
    errorFallbackMessage,
    onError
  } = options;

  const LazyComponent = React.lazy(importFn);
  
  return React.forwardRef((props, ref) => (
    <LazyErrorBoundary 
      fallbackMessage={errorFallbackMessage}
      onError={onError}
    >
      <Suspense fallback={fallback}>
        <LazyComponent {...props} ref={ref} />
      </Suspense>
    </LazyErrorBoundary>
  ));
};

/**
 * Hook for implementing progressive loading
 * Useful for loading components based on user interaction or viewport visibility
 */
export const useProgressiveLoad = (shouldLoad = false, delay = 0) => {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    if (shouldLoad) {
      if (delay > 0) {
        const timer = setTimeout(() => setIsReady(true), delay);
        return () => clearTimeout(timer);
      } else {
        setIsReady(true);
      }
    }
  }, [shouldLoad, delay]);

  return isReady;
};

/**
 * Component for progressive image loading with placeholder
 * Useful for heavy images that should load progressively
 */
export const LazyImage = React.memo(({ 
  src, 
  alt, 
  placeholder, 
  className = '',
  onLoad,
  onError 
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  }, [onLoad]);

  const handleError = React.useCallback((error) => {
    setHasError(true);
    if (onError) onError(error);
  }, [onError]);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {placeholder}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

/**
 * Example usage components for future heavy components
 * These will be used when SettingsPanel, StudioPage, etc. are implemented
 */

// Example: Lazy-loaded SettingsPanel (for future use)
// export const LazySettingsPanel = createLazyComponent(
//   () => import('../components/SettingsPanel.jsx'),
//   {
//     fallback: <LoadingSpinner message="Loading Settings..." />,
//     errorFallbackMessage: 'Failed to load settings panel.'
//   }
// );

// Example: Lazy-loaded StudioPage (for future use)  
// export const LazyStudioPage = createLazyComponent(
//   () => import('../components/StudioPage.jsx'),
//   {
//     fallback: <LoadingSpinner size="large" message="Loading Studio..." />,
//     errorFallbackMessage: 'Failed to load content studio.'
//   }
// );

export default {
  LoadingSpinner,
  LazyErrorBoundary,
  createLazyComponent,
  useProgressiveLoad,
  LazyImage
};