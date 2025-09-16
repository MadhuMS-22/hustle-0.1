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
          // Put SVG files in assets folder for Vercel
          if (assetInfo.name && assetInfo.name.endsWith('.svg')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
})
