import './ha-cardforge-card.js';
import { HACardForgeEditor } from './visual-editor.js';
import { EntityPicker } from './entity-picker.js';
import { CardMarketplace } from './marketplace.js';
import { ThemeManager } from './themes.js';

// 暴露全局API
window.HACardForgeEditor = HACardForgeEditor;
window.EntityPicker = EntityPicker;
window.CardMarketplace = CardMarketplace;
window.ThemeManager = ThemeManager;

// 初始化主题管理器
window.ThemeManager.init();

console.log('ha-cardforge-card卡片工坊已加载！');