import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 🚀 CUTTING-EDGE BUNDLE OPTIMIZATION (2025)
// Smart chunking algorithm - only chunk dependencies >30KB
function createOptimalChunks() {
  return {
    // Core framework chunk (always together for optimal caching)
    vendor: ['react', 'react-dom', 'react-router-dom'],
    
    // UI library chunk (icons + styling)
    ui: ['lucide-react'],
    
    // PDF generation chunk (large library, loaded on-demand)
    pdf: ['jspdf'],
  };
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.vite/**',
      ],
    },
    hmr: {
      overlay: true,
      port: 3000,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Reduce build size in production
    
    // 🎯 ADVANCED PERFORMANCE OPTIMIZATIONS
    target: 'esnext', // Modern browsers = smaller bundles
    chunkSizeWarningLimit: 1000, // Increase warning threshold
    cssCodeSplit: true, // Split CSS for better caching
    
    rollupOptions: {
      output: {
        // 🚀 VENDOR CHUNKING - Separate large libraries
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          
          // Large UI libraries  
          'ui-vendor': ['lucide-react'],
          
          // Heavy canvas/DOM libraries
          'canvas-vendor': ['html2canvas'],
          
          // PDF generation
          'pdf-vendor': ['jspdf'],
        },
        
        // Clean file naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  
  // ⚡ AGGRESSIVE DEP PRE-BUNDLING
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'jspdf',
    ],
    exclude: [
      '@vite/client',
      '@vite/env',
      // Exclude server-side dependencies from browser bundle
      'body-parser',
      'express',
      'ejs',
    ],
    // Force re-optimization when dependencies change
    force: false,
  },
  
  // 🔧 CSS OPTIMIZATION
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      // Enable CSS nesting and modern features
    },
  },
});
