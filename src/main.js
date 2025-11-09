// src/main.js - 确保注册正确
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';

console.log('🚀 开始注册自定义元素...');

// 确保元素名称正确
const CARD_ELEMENT = 'ha-cardforge-card';
const EDITOR_ELEMENT = 'ha-cardforge-editor';

console.log('🔧 检查元素是否已存在:', {
  card: !!customElements.get(CARD_ELEMENT),
  editor: !!customElements.get(EDITOR_ELEMENT)
});

if (!customElements.get(CARD_ELEMENT)) {
  customElements.define(CARD_ELEMENT, HaCardForgeCard);
  console.log('✅ 注册卡片元素:', CARD_ELEMENT);
} else {
  console.log('⚠️ 卡片元素已注册:', CARD_ELEMENT);
}

if (!customElements.get(EDITOR_ELEMENT)) {
  customElements.define(EDITOR_ELEMENT, HaCardForgeEditor);
  console.log('✅ 注册编辑器元素:', EDITOR_ELEMENT);
} else {
  console.log('⚠️ 编辑器元素已注册:', EDITOR_ELEMENT);
}

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: CARD_ELEMENT,
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊',
    preview: true
  });
  console.log('✅ 注册到 customCards');
} else {
  console.log('⚠️ window.customCards 不存在');
}

console.log('🎉 卡片工坊加载完成');