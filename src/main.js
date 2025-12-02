// src/main.js - 简化版
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { CardEditor } from './editors/card-editor.js';

if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于统一卡片系统的卡片工坊',
    preview: true,
    documentationURL: 'https://github.com/938134/ha-cardforge-card'
  });
}