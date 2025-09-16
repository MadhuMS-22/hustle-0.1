import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 0, // Prevent inlining of assets as base64
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep SVG files in root for Vercel
          if (assetInfo.name && assetInfo.name.endsWith('.svg')) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
})
