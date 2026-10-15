import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Keep the Three.js/R3F payload in its own chunk so it can be fetched
    // during the loading screen (spec §28) instead of blocking first paint.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (
            id.includes('node_modules/three') ||
            id.includes('@react-three')
          ) {
            return 'three'
          }
          if (
            id.includes('node_modules/gsap') ||
            id.includes('node_modules/framer-motion') ||
            id.includes('node_modules/lenis') ||
            id.includes('node_modules/motion-dom') ||
            id.includes('node_modules/motion-utils')
          ) {
            return 'motion'
          }
          return undefined
        },
      },
    },
  },
})
