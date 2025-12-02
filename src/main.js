// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { CardEditor } from './editors/card-editor.js';

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

// 注册到 Home Assistant 自定义卡片系统
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于统一卡片系统的卡片工坊',
    preview: true
  });
}