// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';

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
    description: '基于插件系统的动态卡片工坊',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge'
  });
}

console.log('🎉 卡片工坊动态插件系统初始化完成');