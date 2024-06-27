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
      entry: './src/conditional-fields.ts',
      name: 'conditional-fields',
      fileName: (format) => `conditional-fields.${format}.js`,
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