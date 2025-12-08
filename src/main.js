// 主入口文件 - 注册所有自定义元素
import { HaCardForgeCard } from './components/ha-cardforge-card.js';
import { CardEditor } from './components/card-editor.js';
import { CardContainer } from './components/card-container.js';
import { FormBuilder } from './components/form-builder.js';
import { CardSelector } from './components/card-selector.js';
import { ThemeSelector } from './components/theme-selector.js';
import { BlockBase } from './blocks/block-base.js';
import { BlockManagement } from './blocks/block-management.js';
import { BlockEditForm } from './blocks/block-edit-form.js';

// 注册所有自定义元素
const elements = [
  { name: 'ha-cardforge-card', class: HaCardForgeCard },
  { name: 'card-editor', class: CardEditor },
  { name: 'card-container', class: CardContainer },
  { name: 'form-builder', class: FormBuilder },
  { name: 'card-selector', class: CardSelector },
  { name: 'theme-selector', class: ThemeSelector },
  { name: 'block-base', class: BlockBase },
  { name: 'block-management', class: BlockManagement },
  { name: 'block-edit-form', class: BlockEditForm }
];

// 延迟注册以避免冲突
setTimeout(() => {
  elements.forEach(({ name, class: ElementClass }) => {
    if (!customElements.get(name)) {
      customElements.define(name, ElementClass);
      console.log(`注册自定义元素: ${name}`);
    }
  });
}, 0);

// 注册到 Home Assistant 自定义卡片
if (window.customCards) {
  window.customCards.push({
    type: 'ha-cardforge-card',
    name: '卡片工坊',
    description: '基于统一卡片系统的卡片工坊',
    preview: true,
    documentationURL: 'https://github.com/your-repo/cardforge'
  });
}

// 导出主要组件供外部使用
export {
  HaCardForgeCard,
  CardEditor,
  CardContainer,
  FormBuilder,
  CardSelector,
  ThemeSelector,
  BlockBase,
  BlockManagement,
  BlockEditForm
};

console.log('CardForge 系统初始化完成');
