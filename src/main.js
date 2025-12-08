// main.js - 兼容模式主入口
import { HaCardForgeCard } from './components/ha-cardforge-card.js';
import { CardEditor } from './components/card-editor.js';

// 全局注册函数
function registerCardForge() {
  console.log('正在注册 CardForge 卡片...');
  
  // 注册主卡片组件
  if (!customElements.get('ha-cardforge-card')) {
    customElements.define('ha-cardforge-card', HaCardForgeCard);
    console.log('✅ 注册 ha-cardforge-card');
  }

  // 注册编辑器组件
  if (!customElements.get('card-editor')) {
    customElements.define('card-editor', CardEditor);
    console.log('✅ 注册 card-editor');
  }

  // 注册到 Home Assistant 自定义卡片
  if (window.customCards) {
    window.customCards = window.customCards || [];
    window.customCards.push({
      type: 'custom:ha-cardforge-card',
      name: '卡片工坊',
      description: '基于统一卡片系统的卡片工坊',
      preview: true
    });
    console.log('✅ 注册到 Home Assistant 自定义卡片');
  } else {
    console.warn('❌ window.customCards 未定义，请确保已加载自定义卡片插件');
  }
}

// 等待 Home Assistant 加载完成
if (window.customCards) {
  // 如果已加载，立即注册
  registerCardForge();
} else {
  // 否则监听加载事件
  window.addEventListener('load', registerCardForge);
  // 设置超时备用
  setTimeout(registerCardForge, 1000);
}

// 导出供外部使用
window.CardForge = {
  HaCardForgeCard,
  CardEditor,
  registerCardForge
};

console.log('CardForge 主入口加载完成');
