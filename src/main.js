// src/main.js
import './ha-cardforge-card.js';
import './ha-cardforge-editor.js';

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于插件系统的卡片工坊，支持自动发现和实时预览',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge-card'
  });
}

console.log('🎉 卡片工坊初始化完成');
