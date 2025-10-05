import React from 'react';

/**
 * Performance Monitoring and Profiling Utilities
 * 
 * Provides tools for monitoring React app performance, tracking render cycles,
 * and identifying performance bottlenecks in development and production.
 */

/**
 * Performance measurement utility
 * Tracks timing of operations and renders
 */
export class PerformanceTracker {
  constructor(enabled = process.env.NODE_ENV === 'development') {
    this.enabled = enabled;
    this.measurements = new Map();
  }

  /**
   * Start measuring an operation
   * @param {string} name - Name of the operation
   */
  start(name) {
    if (!this.enabled) return;
    
    this.measurements.set(name, {
      startTime: performance.now(),
      startMark: `${name}-start`
    });
    
    // Use Performance API for precise measurements
    if (performance.mark) {
      performance.mark(`${name}-start`);
    }
  }

  /**
   * End measuring an operation and log results
   * @param {string} name - Name of the operation
   * @param {boolean} log - Whether to log the result
   */
  end(name, log = true) {
    if (!this.enabled) return;

    const measurement = this.measurements.get(name);
    if (!measurement) {
      console.warn(`Performance measurement '${name}' was never started`);
      return;
    }

    const duration = performance.now() - measurement.startTime;
    
    // Use Performance API
    if (performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    if (log) {
      console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
    }

    this.measurements.delete(name);
    return duration;
  }

  /**
   * Measure a function execution time
   * @param {string} name - Name of the measurement
   * @param {Function} fn - Function to measure
   */
  async measure(name, fn) {
    if (!this.enabled) return fn();

    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all performance entries
   */
  getEntries() {
    if (!performance.getEntriesByType) return [];
    return performance.getEntriesByType('measure');
  }

  /**
   * Clear all performance measurements
   */
  clear() {
    this.measurements.clear();
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
    if (performance.clearMarks) {
      performance.clearMarks();
    }
  }
}

// Global performance tracker instance
export const perf = new PerformanceTracker();

/**
 * React Hook for measuring component render performance
 * @param {string} componentName - Name of the component
 * @param {Array} dependencies - Dependencies to track
 */
export const useRenderPerformance = (componentName, dependencies = []) => {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} render #${renderCount.current} (${timeSinceLastRender.toFixed(2)}ms since last)`);
      
      if (renderCount.current > 1 && timeSinceLastRender < 16) {
        console.warn(`⚠️  ${componentName} rendered quickly (${timeSinceLastRender.toFixed(2)}ms) - possible unnecessary re-render`);
      }
    }
    
    lastRenderTime.current = now;
  });

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && dependencies.length > 0) {
      console.log(`📊 ${componentName} dependencies changed:`, dependencies);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};

/**
 * Higher-order component for performance monitoring
 * @param {React.Component} WrappedComponent - Component to monitor
 * @param {string} displayName - Optional display name
 */
export const withPerformanceMonitoring = (WrappedComponent, displayName) => {
  const ComponentWithPerf = React.forwardRef((props, ref) => {
    const componentName = displayName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
    
    useRenderPerformance(componentName, Object.values(props));
    
    return <WrappedComponent {...props} ref={ref} />;
  });
  
  ComponentWithPerf.displayName = `withPerformanceMonitoring(${displayName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ComponentWithPerf;
};

/**
 * Hook for measuring API call performance
 * @param {string} apiName - Name of the API
 */
export const useApiPerformance = (apiName) => {
  const measureApiCall = React.useCallback(async (apiCall) => {
    return perf.measure(`API: ${apiName}`, apiCall);
  }, [apiName]);

  return { measureApiCall };
};

/**
 * Bundle size analyzer utility
 * Helps identify large dependencies
 */
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  // Analyze loaded modules (approximation)
  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;

  scripts.forEach(script => {
    fetch(script.src, { method: 'HEAD' })
      .then(response => {
        const size = response.headers.get('Content-Length');
        if (size) {
          totalSize += parseInt(size);
          console.log(`📦 ${script.src}: ${(parseInt(size) / 1024).toFixed(2)} KB`);
        }
      })
      .catch(() => {}); // Ignore CORS errors
  });

  setTimeout(() => {
    console.log(`📦 Total estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
  }, 1000);
};

/**
 * Memory usage monitoring
 */
export const monitorMemoryUsage = () => {
  if (!performance.memory || process.env.NODE_ENV !== 'development') return;

  const formatBytes = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
  
  const logMemoryUsage = () => {
    const memory = performance.memory;
    console.log('🧠 Memory Usage:', {
      used: formatBytes(memory.usedJSHeapSize),
      allocated: formatBytes(memory.totalJSHeapSize),
      limit: formatBytes(memory.jsHeapSizeLimit)
    });
  };

  // Log memory usage every 30 seconds
  const interval = setInterval(logMemoryUsage, 30000);
  
  // Log initial usage
  logMemoryUsage();

  // Return cleanup function
  return () => clearInterval(interval);
};

/**
 * React DevTools Profiler integration
 * @param {string} id - Profiler ID
 * @param {Function} onRender - Render callback
 */
export const ProfilerWrapper = ({ id, children, onRender }) => {
  const handleRender = React.useCallback((id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚛️  Profiler ${id} [${phase}]:`, {
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        startTime: `${startTime.toFixed(2)}ms`,
        commitTime: `${commitTime.toFixed(2)}ms`
      });
    }
    
    if (onRender) {
      onRender(id, phase, actualDuration, baseDuration, startTime, commitTime);
    }
  }, [onRender]);

  if (process.env.NODE_ENV !== 'production') {
    return (
      <React.Profiler id={id} onRender={handleRender}>
        {children}
      </React.Profiler>
    );
  }

  return children;
};

/**
 * Intersection Observer hook for lazy loading performance
 * @param {Object} options - Intersection observer options
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const targetRef = React.useRef(null);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [options]);

  return [targetRef, isIntersecting];
};

/**
 * Performance recommendations
 */
export const getPerformanceRecommendations = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const recommendations = [];

  // Check for React StrictMode
  if (!document.querySelector('[data-reactroot]')?.closest('[data-react-strict-mode]')) {
    recommendations.push('Consider enabling React.StrictMode for better development warnings');
  }

  // Check bundle size
  const scripts = document.querySelectorAll('script[src*="index"]');
  if (scripts.length > 0) {
    // This is a rough estimation
    recommendations.push('Monitor bundle size - consider code splitting for large applications');
  }

  // Check for console.log in production
  if (typeof console.log.toString === 'function' && console.log.toString().includes('native')) {
    recommendations.push('Remove console.log statements in production builds');
  }

  console.group('🚀 Performance Recommendations');
  recommendations.forEach(rec => console.log(`• ${rec}`));
  console.groupEnd();
};

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Auto-analyze bundle size
  setTimeout(analyzeBundleSize, 2000);
  
  // Show performance recommendations
  setTimeout(getPerformanceRecommendations, 3000);
  
  // Start memory monitoring (cleanup handled by the function)
  monitorMemoryUsage();
}

export default {
  PerformanceTracker,
  perf,
  useRenderPerformance,
  withPerformanceMonitoring,
  useApiPerformance,
  ProfilerWrapper,
  useIntersectionObserver,
  analyzeBundleSize,
  monitorMemoryUsage,
  getPerformanceRecommendations
};