// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { BlockEditor } from './editors/block-editor.js';

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', BlockEditor);
}

// 注册到 Home Assistant 自定义卡片系统
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于块系统的卡片工坊，支持自由布局和丰富的内容块',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

console.log('🎉 卡片工坊（块系统版）初始化完成');