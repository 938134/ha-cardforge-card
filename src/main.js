// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './editors/ha-cardforge-editor.js';
import { EntityStrategyEditor } from './editors/entity-strategy-editor.js';
import { LayoutEditor } from './editors/layout-editor.js';

// 注册所有自定义元素
const elements = {
  'ha-cardforge-card': HaCardForgeCard,
  'ha-cardforge-editor': HaCardForgeEditor,
  'entity-strategy-editor': EntityStrategyEditor,
  'layout-editor': LayoutEditor
};

Object.entries(elements).forEach(([tag, constructor]) => {
  if (!customElements.get(tag)) {
    customElements.define(tag, constructor);
  }
});

if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊，支持自动发现和实时预览',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

console.log('🎉 卡片工坊初始化完成 - 新架构版本');