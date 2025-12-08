// main.js - 完整修复版
import { HaCardForgeCard } from './components/ha-cardforge-card.js';
import { CardEditor } from './components/card-editor.js';

// 注册到 Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ha-cardforge-card',
  name: '卡片工坊',
  description: '基于统一卡片系统的卡片工坊',
  preview: true,
  documentationURL: 'https://github.com/your-repo/cardforge'
});

// 等待 DOM 加载完成
window.addEventListener('load', () => {
  // 注册自定义元素
  if (!customElements.get('ha-cardforge-card')) {
    customElements.define('ha-cardforge-card', HaCardForgeCard);
  }
  
  if (!customElements.get('card-editor')) {
    customElements.define('card-editor', CardEditor);
  }
  
  console.log('🎉 卡片工坊已加载！');
});