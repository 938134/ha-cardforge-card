// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { BlockEditor } from './editors/block-editor.js';

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('block-editor')) {
  customElements.define('block-editor', BlockEditor);
}

if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于块系统的卡片工坊，支持拖拽布局',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

console.log('🎉 卡片工坊块系统初始化完成');