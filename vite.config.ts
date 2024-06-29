import { defineConfig } from 'vite'
import pkg from './package.json';

export default defineConfig({
  build: {
    copyPublicDir: false,
    minify: 'terser',
    terserOptions:{
      compress: {
        // drop_console: true,
        // drop_debugger: true,
        // ecma: 2015,
        // keep_fargs: false,
        // passes: 2,
        // toplevel: true,
        // unsafe: true,
        // unsafe_arrows: true,
        // unsafe_comps: true,
        // unsafe_Function: true,
        // unsafe_math: true,
        // unsafe_symbols: true,
        // unsafe_methods: true,
        // unsafe_proto: true,
        // unsafe_regexp: true,
        // unsafe_undefined: true,
        // unused: true,
      },
      // mangle: {
      //   properties: {
      //     // regex: /^_/,
      //     // debug: true,
      //   },
      //   reserved: ['setupConditionalFields', 'ConditionalField']
      // }
    },
    lib: {
      entry: './src/conditional-fields.ts',
      name: 'conditional-fields',
      fileName: (format) => `conditional-fields.${format}.js`,
      formats: ['es', 'umd', 'cjs'],
    },
    rollupOptions: {
      output: {
        banner: `/*! ${pkg.name} - v${pkg.version} */\n`,
      },
    }
  }
})