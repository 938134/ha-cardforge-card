// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';
import { ThemeManager } from './core/theme-manager.js';

// 确保主题管理器初始化
console.log('🎉 卡片工坊初始化 - 加载主题:', ThemeManager.getAllThemes().length);

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊',
    preview: true
  });
}

// 导出全局对象用于调试
window.CardForge = {
  ThemeManager,
  version: '1.0.0'
};