import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/cardforge.js',
    format: 'es'
  },
  plugins: [nodeResolve()]
};
