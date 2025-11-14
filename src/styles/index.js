// src/styles/index.js
import { sharedStyles } from './shared-styles.js';
import { layoutStyles } from './layout-styles.js';
import { componentStyles } from './component-styles.js';
import { responsiveStyles } from './responsive-styles.js';

// 直接导出所有样式
export {
  sharedStyles,
  layoutStyles,
  componentStyles,
  responsiveStyles
};

// 导出所有样式作为一个集合
export const allStyles = [
  sharedStyles,
  layoutStyles, 
  componentStyles,
  responsiveStyles
];
