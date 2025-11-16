'use client';

import { useEffect } from 'react';
import { monitoring } from '@/lib/monitoring';
import { errorTracking } from '@/lib/error-tracking';

/**
 * Monitoring Initialization Component
 * 
 * Initializes error tracking and performance monitoring
 * Should be included in the root layout
 */
export function MonitoringInit() {
  useEffect(() => {
    // Initialize monitoring services
    monitoring.init();
    errorTracking.init().catch((error) => {
      console.error('[MONITORING] Failed to initialize error tracking:', error);
    });

    // Track page view
    if (typeof window !== 'undefined') {
      monitoring.trackEvent('page_view', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  return null; // This component doesn't render anything
}

