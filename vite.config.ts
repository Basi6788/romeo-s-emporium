import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      
      // --- CRITICAL FIX: Disable minification completely for Service Worker ---
      minify: false,
      
      // --- DISABLE TERSER for Service Worker generation ---
      workbox: {
        mode: 'development', // Force development mode to avoid minification
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/admin/],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        cleanupOutdatedCaches: true,
        
        // --- OPTIMIZE for Termux/limited memory ---
        disableDevLogs: true,
        
        // --- REDUCE Cache size ---
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        
        // --- ENABLE sourcemaps for debugging ---
        sourcemap: true,
        
        // --- DISABLE aggressive optimizations ---
        skipWaiting: true,
        clientsClaim: true,
      },
      
      // --- Manifest settings ---
      includeAssets: [
        'favicon.ico', 
        'apple-touch-icon.png', 
        'mask-icon.svg',
        'robots.txt',
        'sitemap.xml'
      ],
      
      manifest: {
        name: 'MIRAE Shop',
        short_name: 'MIRAE',
        description: 'My E-commerce Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        
        screenshots: [
          {
            src: 'screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot-mobile.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        
        categories: ['shopping', 'ecommerce', 'business'],
        shortcuts: [
          {
            name: 'Shop Now',
            short_name: 'Shop',
            description: 'Browse Products',
            url: '/products',
            icons: [{ src: 'shortcut-icon-96x96.png', sizes: '96x96' }]
          }
        ]
      },
      
      // --- Dev options ---
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
    emptyOutDir: true,
    
    // --- ADD memory optimization for Termux ---
    cssCodeSplit: true,
    reportCompressedSize: false,
    
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('three') || id.includes('@react-three') || id.includes('drei') || id.includes('ogl')) {
              return 'three-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('shadcn') || id.includes('class-variance-authority')) {
              return 'ui-vendor';
            }
            if (id.includes('tailwindcss') || id.includes('autoprefixer') || id.includes('postcss')) {
              return 'style-vendor';
            }
            if (id.includes('framer-motion') || id.includes('gsap')) {
              return 'animation-vendor';
            }
            if (id.includes('lucide') || id.includes('react-icons') || id.includes('tabler')) {
              return 'icons-vendor';
            }
            if (id.includes('firebase') || id.includes('supabase') || id.includes('clerk')) {
              return 'backend-vendor';
            }
            return 'vendor';
          }
        },
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
      },
    },
  },
  
  // --- ADD optimization for Termux ---
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  
  // --- CLEAR cache before build ---
  clearScreen: false,
}));
