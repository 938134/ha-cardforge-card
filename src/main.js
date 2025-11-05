import { CardForge } from './cardforge-core.js';
import { CardForgeEditor } from './visual-editor.js';
import { EntityPicker } from './entity-picker.js';

// 注册自定义元素
if (!customElements.get('cardforge')) {
  customElements.define('cardforge', CardForge);
}

// 暴露全局API
window.CardForge = CardForge;
window.CardForgeEditor = CardForgeEditor;
window.EntityPicker = EntityPicker;

console.log('CardForge loaded successfully!');
