/**
 * Application Configuration
 * Centralized configuration for the application
 */

// Admin emails - can be configured via environment variable
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'ftnakras01@gmail.com')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter((email: string) => email.length > 0);

// Site URL validation
export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  
  if (siteUrl) {
    // Validate URL format
    try {
      const url = new URL(siteUrl);
      // Only allow https in production
      if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
        throw new Error('Production requires HTTPS');
      }
      return url.origin;
    } catch {
      // Invalid URL, use fallback
    }
  }
  
  // Fallback: use window.location in browser, or default
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback
  return process.env.NODE_ENV === 'production' 
    ? 'https://otomasyonmagazasi.com' // Update with your production domain
    : 'http://localhost:3000';
}

// Email redirect URL builder
export function getEmailRedirectUrl(type: 'signup' | 'email' | 'recovery' = 'signup'): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/auth/callback?type=${type}`;
}

