import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import shopxEditable from './vite-plugin-shopx-editable'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    shopxEditable({
      importSource: '@shopx/editable',
      configParamName: 'config',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shopx/editable': path.resolve(__dirname, 'src/shopxComponent/editable/runtime'),
    },
  },
})
