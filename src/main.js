// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';

console.log('🚀 开始注册卡片工坊...');

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
  console.log('✅ 注册卡片元素: ha-cardforge-card');
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
  console.log('✅ 注册编辑器元素: ha-cardforge-editor');
}

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊',
    preview: true
  });
  console.log('✅ 注册到 customCards');
}

console.log('🎉 卡片工坊加载完成');
