import { HACardForge } from './cardforge-core.js';
import { HACardForgeEditor } from './visual-editor.js';
import { EntityPicker } from './entity-picker.js';
import { CardMarketplace } from './marketplace.js';
import { ThemeManager } from './themes.js';

// 注册自定义元素
if (!customElements.get('ha-cardforge')) {
  customElements.define('ha-cardforge', HACardForge);
}

// 暴露全局API
window.HACardForge = HACardForge;
window.HACardForgeEditor = HACardForgeEditor;
window.EntityPicker = EntityPicker;
window.CardMarketplace = CardMarketplace;
window.ThemeManager = ThemeManager;

// 初始化主题管理器
window.ThemeManager.init();

console.log('HA-CardForge loaded successfully!');
