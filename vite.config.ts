import { defineConfig } from 'vite'
import { name, version } from './package.json';

export default defineConfig({
  build: {
    copyPublicDir: false,
    minify: 'terser',
    terserOptions:{
      compress:{
        // keep_fnames: true,
        // keep_classnames: true,
      },
      mangle: {
        // properties: {
        //   // regex: /^_/,
        //   debug: false,
        // },
        reserved: ['setupConditionalFields', 'ConditionalField'],
        // keep_classnames: true,
        // keep_fnames: true,
      }
    },
    lib: {
      entry: './src/conditional-fields.ts',
      name: 'conditional-fields',
      fileName: (format) => `conditional-fields.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        banner: `/*! ${name} - v${version} */\n`,
        globals: {
          'setupConditionalFields': 'setupConditionalFields',
          'ConditionalField': 'ConditionalField',
        },
      },
    }
  }
})