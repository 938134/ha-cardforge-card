import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/main.js',  
  output: {
    file: 'dist/ha-cardforge-card.js',
    format: 'es',
  },
  inlineDynamicImports: true,  // 关键：内联所有动态导入
  external: [
    /^lit/,
    /^@lit/,
    'lit-element',
    'lit-html', 
    'lit-html/is-server',
  ],
  plugins: [
    nodeResolve({ preferBuiltins: false }),
    copy({
      targets: [
        { src: 'src/plugins/*', dest: 'dist/plugins/' }
      ]
    })
  ],
};