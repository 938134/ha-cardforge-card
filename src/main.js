// ha-cardforge-card/src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HaCardForgeEditor } from './ha-cardforge-editor.js';
import { PluginManager } from './components/plugin.js';

// 全局变量，避免重复初始化
if (!window.cardForge) {
  window.cardForge = {
    pluginManager: new PluginManager(),
    initialized: false
  };
}

// 初始化函数
function initializeCardForge() {
  if (window.cardForge.initialized) {
    console.log('🔄 卡片工坊已初始化，跳过重复初始化');
    return;
  }

  // 注册组件
  if (!customElements.get('ha-cardforge-card')) {
    customElements.define('ha-cardforge-card', HaCardForgeCard);
  }
  
  if (!customElements.get('ha-cardforge-editor')) {
    customElements.define('ha-cardforge-editor', HaCardForgeEditor);
  }

  // 注册到 customCards
  if (window.customCards && !window.customCards.find(card => card.type === 'ha-cardforge-card')) {
    window.customCards.push({
      type: 'ha-cardforge-card',
      name: '卡片工坊',
      description: '基于插件市场的卡片系统',
      preview: true
    });
  }

  window.cardForge.initialized = true;
  console.log('🎉 卡片工坊初始化完成');
}

// 执行初始化
initializeCardForge();