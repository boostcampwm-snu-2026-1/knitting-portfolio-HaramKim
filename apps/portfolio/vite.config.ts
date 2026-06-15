import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: '../../vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@knit-ui/core': fileURLToPath(
        new URL('../../packages/knit-ui/src', import.meta.url),
      ),
    },
  },
})
