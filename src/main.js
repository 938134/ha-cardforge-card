// ha-cardforge-card/src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';

// 安全的组件注册函数
function safeDefine(elementName, elementClass) {
  if (!customElements.get(elementName)) {
    customElements.define(elementName, elementClass);
    console.log(`✅ 注册组件: ${elementName}`);
  } else {
    console.log(`⚠️ 组件已注册: ${elementName}`);
  }
}

// 注册组件
safeDefine('ha-cardforge-card', HaCardForgeCard);
safeDefine('ha-cardforge-editor', HaCardForgeEditor);

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件市场的卡片系统',
    preview: true
  });
}

console.log('🎉 卡片工坊插件市场初始化完成');