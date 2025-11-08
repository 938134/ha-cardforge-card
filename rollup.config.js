import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.js',  
  output: {
    file: 'ha-cardforge-card.js',
    format: 'es',
  },
  external: [
    /^lit/,
    /^@lit/,
    'lit-element',
    'lit-html', 
    'lit-html/is-server',
  ],
  plugins: [
    nodeResolve({ preferBuiltins: false }),
  ],
};