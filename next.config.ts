import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// Bundle analyzer for production bundle analysis
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  output: 'standalone',
  compress: true,
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons', 
      'lucide-react', 
      '@tabler/icons-react',
      'framer-motion',
      'date-fns',
      'lodash',
      '@react-google-maps/api',
      'recharts',
      'lottie-react',
      'gsap',
    ],
    // Enable optimistic client cache for faster navigations
    optimisticClientCache: true,
    // Enable modern bundler optimizations
    webpackBuildWorker: true,
  },

  images: {
    unoptimized: true,
    // the custom loader added below is required to make next/image work with cloudfront and google photos
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], 
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], 
    formats: ['image/webp', 'image/avif'],  
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bandyscars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.bandyscars.com", 
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/images/**",
      },
       {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a-/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bandys-public.s3.eu-west-3.amazonaws.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "d2twk0nccgfyqu.cloudfront.net", 
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bandys-emails-attachements.s3.eu-west-3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.thiings.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lftz25oez4aqbxpq.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 604800, // 1 week
  },
  
  // Enable webpack 5 polling for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }

     // Optimizing bundle splitting in both dev and production
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // React core, keep together for better caching
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react-core',
              priority: 40,
              enforce: true,
            },
            // Next.js core
            nextCore: {
              test: /[\\/]node_modules[\\/](next)[\\/]/,
              name: 'next-core',
              priority: 35,
              enforce: true,
            },
            // Radix UI, lazy loaded but keep together
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'vendor-radix',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Framer Motion, heavy animation library
            framer: {
              test: /[\\/]node_modules[\\/](framer-motion|motion)[\\/]/,
              name: 'vendor-framer',
              priority: 30,
              reuseExistingChunk: true,
            },
            // GSAP animations
            gsap: {
              test: /[\\/]node_modules[\\/]gsap[\\/]/,
              name: 'vendor-gsap',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Google Maps, very heavy
            maps: {
              test: /[\\/]node_modules[\\/](@googlemaps|@react-google-maps)[\\/]/,
              name: 'vendor-maps',
              priority: 30,
              reuseExistingChunk: true,
            },
            // PDF libraries
            pdf: {
              test: /[\\/]node_modules[\\/](pdf-lib|jspdf|html2pdf|pdf-parse)[\\/]/,
              name: 'vendor-pdf',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Lottie animations
            lottie: {
              test: /[\\/]node_modules[\\/]lottie-react[\\/]/,
              name: 'vendor-lottie',
              priority: 30,
              reuseExistingChunk: true,
            },
            // heavy particle library
            tsparticles: {
              test: /[\\/]node_modules[\\/]@?tsparticles[\\/]/,
              name: 'vendor-tsparticles',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Charts library
            charts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: 'vendor-charts',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Icon libraries
            icons: {
              test: /[\\/]node_modules[\\/](react-icons|lucide-react|@tabler\/icons-react)[\\/]/,
              name: 'vendor-icons',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Date utilities
            dateUtils: {
              test: /[\\/]node_modules[\\/](date-fns|date-fns-tz)[\\/]/,
              name: 'vendor-date',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Form libraries
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform)[\\/]/,
              name: 'vendor-forms',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Remaining vendor code, split by size
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module, chunks, cacheGroupKey) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1];
                return `vendor-${packageName?.replace('@', '')}`;
              },
              priority: 10,
              minSize: 20000,
              maxSize: 244000, // Split if over ~244KB
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              enforce: true,
            },
            // CSS
            styles: {
              name: 'styles',
              test: /\.(css|scss)$/,
              chunks: 'all',
              enforce: true,
              priority: 20,
            },
          },
        },
        // Split runtime into smaller chunk
        runtimeChunk: {
          name: 'runtime',
        },
      };
    }
    
    return config
  },
  
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
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
          {
            key: 'Link',
            value: '<https://www.bandyscars.com>; rel="canonical"'
          }
        ],
      },
      // Block indexing of private pages
      {
        source: '/:locale(en-US|fr-FR|es-ES|ar-MA)?/(user-dashboard|mybookings|mydocuments|favorites|loyalty-program|booking-confirmation|booking-success|stripe-booking-confirmation)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/:locale(en-US|fr-FR|es-ES|ar-MA)?/(admin-dashboard|admin-bookings|admin-careers|admin-cronjob-booking|calendar-overview|document-verification|email-tracking|manage-bookings-admin|manage-document-admin|manage-enterprise-admin|manage-fleet-admin|manage-support-admin|manage-users-admin|vehicle-tracking)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/:locale(en-US|fr-FR|es-ES|ar-MA)?/(manage-document-manager|manage-fleet-manager|manage-support-manager|manage-users-manager)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/:locale(en-US|fr-FR|es-ES|ar-MA)?/(staff-dashboard|staff|handle-contracts|handle-maintenance|handle-payments|handle-rentals)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/:locale(en-US|fr-FR|es-ES|ar-MA)?/(lessor-dashboard|lessor|lessor-bookings|lessor-maintenance|lessor-management|lessor-application|lessor-calendar|lessor-contracts|lessor-revenue|lessor-support)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/:locale(en-US|fr-FR|es-ES|ar-MA)?/(after-login|booking|vehicles|accounting|contracts)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/.well-known/apple-developer-domain-association.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain'
          }
        ]
      },
      // Cache headers for static images
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year
          },
        ],
      },
      // Cache headers for static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable', // 1 week
          },
        ],
      },
      // RSC data endpoints - Use no-cache but allow bfcache
      {
        source: '/_next/data/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Cache-Control',
            // Changed from no-store to no-cache to allow bfcache
            value: 'private, no-cache, max-age=0, must-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      // RSC payload for client-side navigation - Allow bfcache
      {
        source: '/(en-US|fr-FR|es-ES|ar-MA)/(.*)',
        has: [
          {
            type: 'header',
            key: 'RSC',
            value: '1',
          },
        ],
        headers: [
          {
            key: 'Content-Type',
            value: 'text/x-component',
          },
          {
            key: 'Cache-Control',
            // Changed from no-store to no-cache to allow bfcache
            value: 'private, no-cache, max-age=0, must-revalidate',
          },
        ],
      },
      // Cache HTML pages (excluding _next/data to prevent RSC payload caching)
      {
        source: '/(en-US|fr-FR|es-ES|ar-MA)/((?!_next/data).*)',
        missing: [
          {
            type: 'header',
            key: 'RSC',
            value: '1',
          },
        ],
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-store', // Prevent cached HTML from leaking user data
          },
          {
            key: 'Vary',
            value: 'Accept-Language, Accept-Encoding, RSC'
          },
          {
            key: 'Link',
            value: '</globals.css>; rel=preload; as=style; crossorigin',
          },
        ],
      },
       
    ];
  },
  
  async rewrites() {
    return [
      {
        source: '/.well-known/apple-developer-domain-association.txt',
        destination: '/apple-developer-domain-association.txt'
      }
    ];
  }
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
