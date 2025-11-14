// src/main.js
import './ha-cardforge-card.js';
import './editors/ha-cardforge-editor.js';
import './core/smart-input.js';

// 导入样式系统
import './styles/shared-styles.js';
import './styles/layout-styles.js'; 
import './styles/component-styles.js';
import './styles/theme-styles.js';
import './styles/responsive-styles.js';

if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊，支持灵活数据源配置和主题系统',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

console.log('🎉 卡片工坊初始化完成 - 增强版');
