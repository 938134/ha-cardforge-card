// ha-cardforge-card/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';

// 注册组件
customElements.define('ha-cardforge-card', HaCardForgeCard);
customElements.define('ha-cardforge-editor', HaCardForgeEditor);

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件市场的卡片系统',
    preview: true
  });
}

console.log('🎉 卡片工坊组件注册完成');