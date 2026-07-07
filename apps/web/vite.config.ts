import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite"
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  // Read VITE_* env vars (e.g. VITE_MOCKERY_API_BASE_URL) from the monorepo root.
  envDir: new URL('../..', import.meta.url).pathname,
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    // react-router v7 ships transitive deps (cookie, set-cookie-parser, scheduler)
    // that must resolve to a single copy in a hoisted monorepo, otherwise the
    // data router throws at runtime.
    dedupe: ['react', 'react-dom', 'react-router', 'cookie', 'set-cookie-parser', 'scheduler'],
    alias: {
      '@': path.resolve(__dirname, '../../packages/console-core/src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router',
      'cookie',
      'set-cookie-parser',
      'react-router > cookie',
      'react-router > set-cookie-parser',
    ],
  },
})
