/// <reference types="vitest/config" />
import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

export default defineConfig((): UserConfig => {
  return {
    plugins: [
      react(),
      VitePWA({
        strategies: 'generateSW',
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'robots.txt'],
        manifest: {
          name: 'Screen Recorder',
          short_name: 'Recorder',
          description:
            'Professional privacy-first browser-based screen recorder. Records screen, tab, window, webcam, mic and system audio entirely in your browser.',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          lang: 'en',
          categories: ['productivity', 'utilities', 'video'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'New Recording',
              short_name: 'Record',
              url: '/record',
              icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
            },
            {
              name: 'Recording History',
              short_name: 'History',
              url: '/history',
              icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
            },
            {
              name: 'Settings',
              short_name: 'Settings',
              url: '/settings',
              icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /\.(?:wasm|js)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'ffmpeg-assets',
                expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      target: 'es2022',
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            state: ['zustand'],
            icons: ['lucide-react'],
            ffmpeg: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
            animation: ['motion'],
            forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
          },
        },
      },
    },
    worker: {
      format: 'es',
    },
    server: {
      port: 5173,
      strictPort: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/unit/setup.ts'],
      include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/main.tsx',
          'src/vite-env.d.ts',
          'src/config/**',
          'src/types/**',
          'src/workers/**',
        ],
        thresholds: {
          lines: 60,
          functions: 55,
          branches: 55,
          statements: 60,
        },
      },
    },
  };
});
