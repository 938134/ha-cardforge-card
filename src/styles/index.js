// src/styles/index.js
export { sharedStyles } from './shared-styles.js';
export { layoutStyles } from './layout-styles.js';
export { componentStyles } from './component-styles.js';
export { responsiveStyles } from './responsive-styles.js';

// 导出所有样式作为一个集合
export const allStyles = [
  sharedStyles,
  layoutStyles, 
  componentStyles,
  responsiveStyles
];
