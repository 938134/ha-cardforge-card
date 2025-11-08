// ha-cardforge-card/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';
import './components/entity.js';
import './components/registry.js';
import './components/template.js';
import './components/theme.js';

// 注册组件
customElements.define('ha-cardforge-card', HaCardForgeCard);
customElements.define('ha-cardforge-editor', HaCardForgeEditor);

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于 button-card 的多种卡片样式',
    preview: true
  });
}

console.log('🎉 卡片工坊所有组件初始化完成');