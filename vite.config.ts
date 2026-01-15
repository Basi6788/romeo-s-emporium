import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // SWC hata kar standard plugin use kiya
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa"; // Ye naya import hai

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    strictPort: true,
  },
  plugins: [
    // Standard React plugin (Babel-based) jo Termux mein kabhi crash nahi hota
    react(),
    // Ye PWA plugin add kiya hai offline support ke liye
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'MIRAE Shop',
        short_name: 'MIRAE',
        description: 'My E-commerce Application',
        theme_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Ye files cache hongi taake baghair net ke app khule
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html', // Ye zaroori hai taake offline mein pages load hon
      }
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].${new Date().getTime()}.js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
      },
    },
    // Esbuild use karenge jo ke fast hai aur Termux mein stable hai
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
  },
}));

