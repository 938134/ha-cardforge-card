import { HACardForge } from './cardforge-core.js';
import { HACardForgeEditor } from './visual-editor.js';
import { EntityPicker } from './entity-picker.js';
import { CardMarketplace } from './marketplace.js';
import { ThemeManager } from './themes.js';

// 确保自定义元素正确注册
console.log('HA-CardForge: Starting registration...');

class HaCardForgeElement extends HACardForge {
  constructor() {
    super();
    console.log('HA-CardForge: Element created');
  }
}

// 注册自定义元素
if (!customElements.get('ha-cardforge')) {
  customElements.define('ha-cardforge', HaCardForgeElement);
  console.log('HA-CardForge: Custom element registered successfully');
} else {
  console.log('HA-CardForge: Custom element already registered');
}

// 暴露全局API
window.HACardForge = HACardForge;
window.HACardForgeEditor = HACardForgeEditor;
window.EntityPicker = EntityPicker;
window.CardMarketplace = CardMarketplace;
window.ThemeManager = ThemeManager;

// 初始化主题管理器
if (window.ThemeManager) {
  window.ThemeManager.init();
}

console.log('HA-CardForge: Loaded successfully!');

// 添加调试信息
window.addEventListener('load', () => {
  console.log('HA-CardForge: Window loaded, checking registration...');
  console.log('Custom elements defined:', customElements.get('ha-cardforge') ? 'YES' : 'NO');
});
