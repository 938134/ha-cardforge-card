import './ha-cardforge-card.js';
import './ha-cardforge-editor.js';
import { EntityPicker } from './components/entity-picker.js';
import { Marketplace } from './components/marketplace.js';
import { ThemeSelector } from './components/theme-selector.js';

// 暴露全局API
window.EntityPicker = EntityPicker;
window.Marketplace = Marketplace;
window.ThemeSelector = ThemeSelector;

console.log('ha-cardforge-card 卡片工坊已加载！');
