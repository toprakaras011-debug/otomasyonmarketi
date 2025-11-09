const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
<<<<<<< HEAD
=======
  swcMinify: true,
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
  output: 'standalone',
  productionBrowserSourceMaps: false,
  
  // Compiler optimizations (only in production)
  ...(process.env.NODE_ENV === 'production' && {
    modularizeImports: {
      'lucide-react': {
        transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      },
    },
  }),
  
  // Image optimizations
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'otomasyonmagazasi.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'www.otomasyonmagazasi.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Experimental features for performance
  experimental: {
<<<<<<< HEAD
    optimizePackageImports: ['lucide-react', '@radix-ui/react-select', '@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-popover'],
=======
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-select', '@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-popover'],
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
    scrollRestoration: true,
    optimizeCss: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
<<<<<<< HEAD
=======
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
  },
  
<<<<<<< HEAD
=======
  // Font optimization
  optimizeFonts: true,
  
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
