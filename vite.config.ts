import { defineConfig } from 'vite'
import { name, version } from './package.json';
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      entry: './src/lib/index.ts',
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
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})