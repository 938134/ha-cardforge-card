// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { CardEditor } from './editors/card-editor.js';

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('card-forge-editor')) {
  customElements.define('card-forge-editor', CardEditor);
}

// 注册到Home Assistant自定义卡片库
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于块系统的可视化卡片编辑器',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

console.log('🎉 卡片工坊初始化完成');
