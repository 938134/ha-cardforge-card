import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/ha-cardforge-card.js',
    format: 'es',
    inlineDynamicImports: true
  },
  external: [
    /^lit/,
    /^@lit/,
    'lit-element',
    'lit-html', 
    'lit-html/is-server',
  ],
  plugins: [
    nodeResolve({ preferBuiltins: false })
  ],
};