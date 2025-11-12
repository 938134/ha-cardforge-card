// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';

// 安全的自定义元素注册
const safeDefine = (tagName, elementClass) => {
  if (!customElements.get(tagName)) {
    try {
      customElements.define(tagName, elementClass);
      console.log(`✅ 注册自定义元素: ${tagName}`);
    } catch (error) {
      console.error(`❌ 注册自定义元素失败 ${tagName}:`, error);
    }
  }
};

// 注册自定义元素
safeDefine('ha-cardforge-card', HaCardForgeCard);
safeDefine('ha-cardforge-editor', HaCardForgeEditor);

// 优雅的 customCards 集成
if (window.customCards) {
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊，支持自动发现和实时预览',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

// 错误边界
window.addEventListener('error', (event) => {
  console.error('卡片工坊全局错误:', event.error);
});

console.log('🎉 卡片工坊初始化完成 - 现代化版本');
