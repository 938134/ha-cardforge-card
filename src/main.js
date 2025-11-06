// src/main.js
import { HaCardForgeCard } from './ha-cardforge-card.js';
import { HACardForgeEditor } from './visual-editor.js';
import { EntityPicker } from './entity-picker.js';
import { CardMarketplace } from './marketplace.js';
import { ThemeManager } from './themes.js';
import { CardForgeUtils } from './utils.js';

// 确保卡片类已注册
if (!customElements.get('ha-cardforge-card')) {
  customElements.define('ha-cardforge-card', HaCardForgeCard);
}

// 暴露全局API
window.HACardForgeEditor = HACardForgeEditor;
window.EntityPicker = EntityPicker;
window.CardMarketplace = CardMarketplace;
window.ThemeManager = ThemeManager;
window.CardForgeUtils = CardForgeUtils;

// 初始化主题管理器
window.ThemeManager.init();

console.log('🎉 ha-cardforge-card 卡片工坊已加载！');