import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    copyPublicDir: false,
    minify: 'terser',
    terserOptions:{
      compress: {

      },
      mangle: {
        properties: {
          regex: /^_/,
        },
        reserved: ['setupConditionalFields']
      }
    },
    lib: {
      entry: './src/conditionalFields.ts',
      name: 'conditionalFields',
      fileName: (format) => `dynamic-fields.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  }
})