import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'ha-cardforge.js',
    format: 'es'
  },
  plugins: [nodeResolve()]
};
