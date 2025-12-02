// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';

// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/ha-cardforge-card.js',
    format: 'es',
    inlineDynamicImports: false,  // 关键：不要内联动态导入
    sourcemap: false
  },
  external: [
    'https://unpkg.com/lit@2.8.0/index.js?module',
    'https://unpkg.com/lit-html/directives/unsafe-html.js?module'
  ]
};
