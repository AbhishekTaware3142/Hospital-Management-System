// Vite configuration file
// Vite is a modern build tool for creating optimized React applications

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Export configuration object
export default defineConfig({
  // Use React plugin to handle JSX and Hot Module Replacement
  plugins: [react()],
  
  // Development server configuration
  server: {
    // Run dev server on port 3000
    port: 3000,
    // Allow access from any origin during development
    cors: true,
  },
  
  // Build configuration
  build: {
    // Output directory where built files will be placed
    outDir: 'dist',
    // Source maps for debugging in production
    sourcemap: true,
  }
})
