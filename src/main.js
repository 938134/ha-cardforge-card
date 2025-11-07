import './ha-cardforge-card.js';
import './ha-cardforge-editor.js';
import { EntityPicker } from './src/editors/entity-picker.js';
import { Marketplace } from './src/editors/marketplace.js';
import { ThemeSelector } from './src/editors/theme-selector.js';

// 暴露全局API
window.EntityPicker = EntityPicker;
window.Marketplace = Marketplace;
window.ThemeSelector = ThemeSelector;

console.log('ha-cardforge-card 卡片工坊已加载！');
