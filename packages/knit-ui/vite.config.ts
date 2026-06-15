import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: '../../vitest.setup.ts',
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'KnitUi',
      fileName: 'knit-ui',
      cssFileName: 'styles',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
