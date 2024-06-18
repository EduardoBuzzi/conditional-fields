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
        reserved: ['setupDynamicFields']
      }
    },
    lib: {
      entry: './src/dynamicFields.ts',
      name: 'DynamicFields',
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