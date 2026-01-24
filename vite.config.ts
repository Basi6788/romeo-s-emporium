import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { qrcode } from 'vite-plugin-qrcode'; 

// Hacker Style Console Banner (Ye wese hi rahega, ye crash nahi kar raha)
const hackerBanner = () => {
  return {
    name: 'hacker-banner',
    configureServer(server) {
      const _printUrls = server.printUrls;
      server.printUrls = () => {
        const colorGreen = '\x1b[32m%s\x1b[0m';
        const colorCyan = '\x1b[36m%s\x1b[0m';
        
        console.clear();
        console.log(colorGreen, '┌──────────────────────────────────────────────────┐');
        console.log(colorGreen, '│  ★  SYSTEM ONLINE: PROTOCOL ROMEO INITIATED  ★   │');
        console.log(colorGreen, '└──────────────────────────────────────────────────┘');
        console.log(colorCyan, '\n►  Status:         Active & Secure');
        console.log(colorCyan, '►  Environment:    Termux / Android');
        
        _printUrls();
      }
    }
  }
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173, 
    strictPort: false, 
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    qrcode(), // QR Code abhi bhi chalega
    hackerBanner()
    // Terminal plugin hata diya kyunke wo Termux pe unstable tha
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Build settings optimized for Termux
    minify: 'esbuild', 
    sourcemap: false, 
  },
}));

