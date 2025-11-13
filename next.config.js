/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
      // Supabase storage
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || 'localhost',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Optimize images for better performance (mobile & desktop)
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days cache for better performance
    dangerouslyAllowSVG: true,
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable image optimization
    unoptimized: false,
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      'framer-motion', 
      'sonner', 
      '@radix-ui/react-dropdown-menu', 
      '@radix-ui/react-dialog', 
      '@radix-ui/react-select',
      '@radix-ui/react-avatar',
      '@radix-ui/react-tabs',
      'recharts',
      'date-fns'
    ],
    optimizeCss: false, // Disabled - requires 'critters' package
    // Optimize server components
    serverActions: {
      bodySizeLimit: '100mb',
    },
    optimizeServerReact: true,
    memoryBasedWorkersCount: true,
  },
  // Turbopack configuration (Next.js 16+)
  // Turbopack automatically handles code splitting and optimization
  // No need for manual webpack config - Turbopack is faster and handles this automatically
  // Note: Turbopack root is automatically detected from package.json location
  // Enable route prefetching
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    // React compiler optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.supabase.co https://*.supabase.in https://va.vercel-scripts.com; connect-src 'self' https://*.supabase.co https://*.supabase.in https://vitals.vercel-insights.com https://va.vercel-scripts.com; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self' https://challenges.cloudflare.com;"
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  // CSS and JS optimization is handled automatically by Next.js 16 + Turbopack
  // Critical CSS is automatically inlined, non-critical is deferred
  // JavaScript is automatically code-split and optimized
  // Bundle analyzer configuration moved to separate plugin
  // Use: npm run analyze to enable bundle analysis
};

module.exports = nextConfig;
