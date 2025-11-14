// src/main.js
import './ha-cardforge-card.js';
import './editors/ha-cardforge-editor.js';
import './core/smart-input.js';
import './styles/index.js';
import './themes/index.js';

// 注册组件
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊，支持灵活数据源配置和主题系统',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

console.log('🎉 卡片工坊初始化完成 - 模块化版本');
