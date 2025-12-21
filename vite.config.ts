import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173, // Standard fast port, 8080 aksar busy hota hai
    strictPort: true, // Agar 5173 busy ho tu error dega, purana cache load nahi karega
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ye line hamesha naye filename generate karegi taake cache ka masla na ho
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].${new Date().getTime()}.js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
      },
    },
    // Performance optimization
    minify: 'esbuild', 
    sourcemap: false, // Production mein speed barhane ke liye map file off kar di
    reportCompressedSize: false, // Build fast karne ke liye
  },
}));
