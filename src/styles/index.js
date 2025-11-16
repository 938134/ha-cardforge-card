// src/styles/index.js
import { css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from './foundation-styles.js';
import { themeStyles } from './theme-styles.js';
import { editorStyles } from './editor-styles.js';

// 完整的样式系统
export const cardForgeStyles = [
  foundationStyles,
  themeStyles,
  editorStyles
];

// 按需导入
export {
  foundationStyles,
  themeStyles,
  editorStyles
};

// 工具函数：生成动态主题预览样式
export const generateThemePreviewStyles = (themes) => {
  let styles = '';
  
  themes.forEach(theme => {
    const preview = theme.preview || {
      background: `linear-gradient(135deg, hsl(${theme.id.length * 50 % 360}, 70%, 50%) 0%, hsl(${(theme.id.length * 50 + 30) % 360}, 70%, 40%) 100%)`,
      color: '#ffffff',
      border: 'none'
    };
    
    styles += `
      .theme-preview-${theme.id} {
        background: ${preview.background} !important;
        color: ${preview.color} !important;
        border: ${preview.border || '1px solid var(--divider-color)'} !important;
        ${preview.boxShadow ? `box-shadow: ${preview.boxShadow} !important;` : ''}
      }
    `;
  });
  
  return css([styles]);
};

// 工具函数：生成响应式样式
export const generateResponsiveStyles = (config = {}) => {
  return css`
    .cf-custom-grid {
      grid-template-columns: repeat(auto-fill, minmax(${config.cardWidth || '110px'}, 1fr));
      gap: ${config.gridGap || '12px'};
    }
    
    .cf-custom-card {
      min-height: ${config.cardHeight || '80px'};
      padding: ${config.cardPadding || '16px 8px'};
    }
  `;
};