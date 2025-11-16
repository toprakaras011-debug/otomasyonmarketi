/**
 * Advanced Performance Monitoring System
 * Tracks Core Web Vitals and custom metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'score';
  timestamp: number;
  url?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, any>;
}

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

class PerformanceMonitoring {
  private static instance: PerformanceMonitoring;
  private static counter: number = 0;
  private sessionId: string;
  private metrics: PerformanceMetric[] = [];
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeCustomMetrics();
    }
  }

  static getInstance(): PerformanceMonitoring {
    if (!PerformanceMonitoring.instance) {
      PerformanceMonitoring.instance = new PerformanceMonitoring();
    }
    return PerformanceMonitoring.instance;
  }

  private generateSessionId(): string {
    // Use Date.now() and counter instead of Math.random() for Next.js 16 cacheComponents compatibility
    // Math.random() causes prerender issues in server components
    PerformanceMonitoring.counter = (PerformanceMonitoring.counter + 1) % 1000000;
    const timestamp = Date.now();
    const counter = PerformanceMonitoring.counter.toString(36).padStart(6, '0');
    return `perf_${timestamp}_${counter}`;
  }

  private initializeWebVitals(): void {
    // Dynamic import to avoid SSR issues
    // @ts-ignore - web-vitals types may not be available during build
    import('web-vitals').then((webVitals: any) => {
      const { onCLS, onFID, onFCP, onLCP, onTTFB } = webVitals;
      if (onCLS) onCLS(this.handleWebVital.bind(this));
      if (onFID) onFID(this.handleWebVital.bind(this));
      if (onFCP) onFCP(this.handleWebVital.bind(this));
      if (onLCP) onLCP(this.handleWebVital.bind(this));
      if (onTTFB) onTTFB(this.handleWebVital.bind(this));
    }).catch(error => {
      console.warn('Failed to load web-vitals:', error);
    });
  }

  private initializeCustomMetrics(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.measurePageLoadMetrics();
      }, 0);
    });

    // Monitor navigation performance
    this.observeNavigationTiming();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor long tasks
    this.observeLongTasks();
  }

  private handleWebVital(metric: WebVitalsMetric): void {
    const performanceMetric: PerformanceMetric = {
      name: `web_vital_${metric.name.toLowerCase()}`,
      value: metric.value,
      unit: metric.name === 'CLS' ? 'score' : 'ms',
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      additionalData: {
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      }
    };

    this.recordMetric(performanceMetric);

    // Alert on poor performance
    if (metric.rating === 'poor') {
      this.alertPoorPerformance(metric);
    }
  }

  private measurePageLoadMetrics(): void {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const navigation = window.performance.navigation;

    // Calculate key metrics
    const metrics = [
      {
        name: 'dns_lookup_time',
        value: timing.domainLookupEnd - timing.domainLookupStart,
      },
      {
        name: 'tcp_connection_time',
        value: timing.connectEnd - timing.connectStart,
      },
      {
        name: 'server_response_time',
        value: timing.responseStart - timing.requestStart,
      },
      {
        name: 'dom_processing_time',
        value: timing.domComplete - timing.domLoading,
      },
      {
        name: 'page_load_time',
        value: timing.loadEventEnd - timing.navigationStart,
      },
      {
        name: 'dom_content_loaded_time',
        value: timing.domContentLoadedEventEnd - timing.navigationStart,
      }
    ];

    metrics.forEach(metric => {
      if (metric.value > 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          unit: 'ms',
          timestamp: Date.now(),
          url: window.location.href,
          sessionId: this.sessionId,
          additionalData: {
            navigationType: navigation.type,
            redirectCount: navigation.redirectCount,
          }
        });
      }
    });
  }

  private observeNavigationTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            this.recordMetric({
              name: 'navigation_timing',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              unit: 'ms',
              timestamp: Date.now(),
              url: window.location.href,
              sessionId: this.sessionId,
              additionalData: {
                type: navEntry.type,
                redirectCount: navEntry.redirectCount,
                transferSize: navEntry.transferSize,
                encodedBodySize: navEntry.encodedBodySize,
                decodedBodySize: navEntry.decodedBodySize,
              }
            });
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.warn('Failed to observe navigation timing:', error);
    }
  }

  private observeResourceTiming(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Only track significant resources
            if (resourceEntry.duration > 100) {
              this.recordMetric({
                name: 'resource_load_time',
                value: resourceEntry.duration,
                unit: 'ms',
                timestamp: Date.now(),
                url: window.location.href,
                sessionId: this.sessionId,
                additionalData: {
                  resourceUrl: resourceEntry.name,
                  resourceType: this.getResourceType(resourceEntry.name),
                  transferSize: resourceEntry.transferSize,
                  encodedBodySize: resourceEntry.encodedBodySize,
                }
              });
            }
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Failed to observe resource timing:', error);
    }
  }

  private observeLongTasks(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.recordMetric({
              name: 'long_task',
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              url: window.location.href,
              sessionId: this.sessionId,
              additionalData: {
                startTime: entry.startTime,
              }
            });

            // Alert on very long tasks
            if (entry.duration > 100) {
              console.warn(`Long task detected: ${entry.duration}ms`);
            }
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Failed to observe long tasks:', error);
    }
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Log in development
    if (!this.isProduction) {
      console.log(`📊 Performance Metric: ${metric.name} = ${metric.value}${metric.unit}`);
    }

    // Send to analytics in production
    if (this.isProduction) {
      this.sendToAnalytics(metric);
    }

    // Keep only last 100 metrics in memory
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  private alertPoorPerformance(metric: WebVitalsMetric): void {
    const thresholds = {
      CLS: 0.25,
      FID: 300,
      FCP: 3000,
      LCP: 4000,
      TTFB: 800,
    };

    if (metric.value > thresholds[metric.name]) {
      console.warn(`🚨 Poor ${metric.name}: ${metric.value} (threshold: ${thresholds[metric.name]})`);
      
      // Send alert to monitoring service
      if (this.isProduction) {
        this.sendPerformanceAlert(metric);
      }
    }
  }

  private async sendToAnalytics(metric: PerformanceMetric): Promise<void> {
    try {
      // Send to your analytics service
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  private async sendPerformanceAlert(metric: WebVitalsMetric): Promise<void> {
    try {
      await fetch('/api/alerts/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'poor_web_vital',
          metric: metric.name,
          value: metric.value,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.warn('Failed to send performance alert:', error);
    }
  }

  /**
   * Manually track custom performance metrics
   */
  trackCustomMetric(name: string, value: number, unit: PerformanceMetric['unit'] = 'ms', additionalData?: Record<string, any>): void {
    this.recordMetric({
      name: `custom_${name}`,
      value,
      unit,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      sessionId: this.sessionId,
      additionalData,
    });
  }

  /**
   * Track API response times
   */
  trackAPICall(endpoint: string, duration: number, status: number, method: string = 'GET'): void {
    this.recordMetric({
      name: 'api_response_time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      sessionId: this.sessionId,
      additionalData: {
        endpoint,
        status,
        method,
      }
    });

    // Alert on slow API calls
    if (duration > 2000) {
      console.warn(`🐌 Slow API call: ${method} ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          unit: metric.unit,
        };
      }
      
      const stat = summary[metric.name];
      stat.count++;
      stat.total += metric.value;
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
      stat.average = stat.total / stat.count;
    });

    return summary;
  }
}

// Export singleton instance
export const performanceMonitoring = PerformanceMonitoring.getInstance();

// Export helper functions
export const trackCustomMetric = (name: string, value: number, unit?: PerformanceMetric['unit'], additionalData?: Record<string, any>) => {
  performanceMonitoring.trackCustomMetric(name, value, unit, additionalData);
};

export const trackAPICall = (endpoint: string, duration: number, status: number, method?: string) => {
  performanceMonitoring.trackAPICall(endpoint, duration, status, method);
};

export default performanceMonitoring;
