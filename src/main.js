// 主入口文件 - 统一注册所有组件
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';

// 注册卡片组件
console.log('🔧 注册卡片组件...');
customElements.define('ha-cardforge-card', HaCardForgeCard);

// 注册编辑器组件
console.log('🔧 注册编辑器组件...');
customElements.define('ha-cardforge-editor', HaCardForgeEditor);

// 注册到 customCards
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '多种美观的卡片样式',
    preview: true,
    documentationURL: 'https://github.com/your-repo/ha-cardforge'
  });
  console.log('✅ 已注册到 customCards');
}

console.log('🎉 卡片工坊所有组件已注册完成！');
console.log('📦 可用组件:', {
  card: customElements.get('ha-cardforge-card'),
  editor: customElements.get('ha-cardforge-editor')
});