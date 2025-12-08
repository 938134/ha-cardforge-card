// main.js - 主入口文件（更新）
import { HaCardForgeCard } from './components/ha-cardforge-card.js';
import { CardEditor } from './components/card-editor.js';
import { cardSystem } from './core/card-system.js';
import { themeSystem } from './core/theme-system.js';

// 注册自定义元素
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

// 注册到 Home Assistant
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于统一卡片系统的卡片工坊',
    preview: true
  });
}

// 初始化系统
(async function init() {
  try {
    await cardSystem.initialize();
    await themeSystem.initialize();
    console.debug('卡片工坊系统初始化完成');
  } catch (error) {
    console.error('卡片工坊初始化失败:', error);
  }
})();
