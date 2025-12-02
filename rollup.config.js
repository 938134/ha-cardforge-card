// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'ha-cardforge-card.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: false
  },
  plugins: [
    nodeResolve({ preferBuiltins: false })
  ]
};
