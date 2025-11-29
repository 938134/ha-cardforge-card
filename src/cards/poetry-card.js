// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

class PoetryCard extends BaseCard {
  getDefaultConfig() {
    return {
      card_type: 'poetry-card',
      theme: 'auto',
      blocks: {
        poetry_title: {
          type: 'text',
          content: '静夜思',
          area: 'header',
          style: 'font-size: 1.4em; font-weight: 600; text-align: center; color: var(--cf-primary-color);'
        },
        poetry_dynasty_author: {
          type: 'text',
          content: '唐 — 李白',
          area: 'header',
          style: 'font-size: 0.95em; color: var(--cf-text-secondary); text-align: center; margin-top: 4px;'
        },
        poetry_content: {
          type: 'text',
          content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
          area: 'content',
          style: 'font-family: "楷体", "STKaiti", serif; font-size: 1.2em; line-height: 1.8; text-align: center; white-space: pre-line;'
        },
        poetry_translation: {
          type: 'text',
          content: '',
          area: 'content',
          style: 'margin-top: 1em; padding-top: 1em; border-top: 1px solid var(--cf-border); font-size: 0.9em; color: var(--cf-text-secondary); line-height: 1.6; white-space: pre-line;'
        }
      },
      show_title: true,
      show_dynasty_author: true,
      show_translation: false,
      font_family: '楷体',
      font_size: '中号',
      text_color: '#212121',
      text_align: '居中'
    };
  }

  getManifest() {
    return PoetryCard.manifest;
  }

  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    this._applyDynamicConfig(dynamicConfig, hass, entities);
    return super.render(dynamicConfig, hass, entities);
  }

  _applyDynamicConfig(config, hass, entities) {
    const blocks = config.blocks;
    // 朝代+作者
    if (config.show_dynasty_author && blocks.poetry_dynasty_author) {
      const dynasty = hass?.states[entities?.poetry_dynasty]?.state || '唐';
      const author = hass?.states[entities?.poetry_author]?.state || '李白';
      blocks.poetry_dynasty_author.content = `${dynasty} — ${author}`;
    }
    // 标题
    if (config.show_title && blocks.poetry_title) {
      blocks.poetry_title.content = hass?.states[entities?.poetry_title]?.state || '静夜思';
    }
    // 正文
    if (blocks.poetry_content) {
      blocks.poetry_content.content = hass?.states[entities?.poetry_content]?.state || blocks.poetry_content.content;
    }
    // 译文
    if (config.show_translation && blocks.poetry_translation) {
      blocks.poetry_translation.content = hass?.states[entities?.poetry_translation]?.state || '';
    } else {
      blocks.poetry_translation.style += '; display: none;';
    }
    // 外观
    this._applyDisplayConfig(config);
  }

  _applyDisplayConfig(config) {
    const blocks = config.blocks;
    if (!config.show_title && blocks.poetry_title) {
      blocks.poetry_title.style += '; display: none;';
    }
    if (!config.show_dynasty_author && blocks.poetry_dynasty_author) {
      blocks.poetry_dynasty_author.style += '; display: none;';
    }
    const fontFamily = { '楷体': '"楷体","STKaiti",serif', '宋体': '"宋体",serif', '系统默认': 'inherit' }[config.font_family] || '"楷体",serif';
    const fontSize = { '小号': '1em', '中号': '1.2em', '大号': '1.5em' }[config.font_size] || '1.2em';
    const textAlign = { '左对齐': 'left', '居中': 'center', '右对齐': 'right' }[config.text_align] || 'center';
    blocks.poetry_content.style = blocks.poetry_content.style
      .replace(/font-family:[^;]+;/, `font-family: ${fontFamily};`)
      .replace(/font-size:[^;]+;/, `font-size: ${fontSize};`)
      .replace(/text-align:[^;]+;/, `text-align: ${textAlign};`)
      .replace(/color:[^;]+;/, `color: ${config.text_color};`);
  }

  static styles(config) {
    return `
      .poetry-card .cardforge-area{padding: var(--cf-spacing-lg);}
      .poetry-card .area-header{display: flex; flex-direction: column; align-items: center; gap: var(--cf-spacing-sm); margin-bottom: var(--cf-spacing-lg);}
      @container cardforge-container (max-width: 400px) {
        .poetry-card .cardforge-area{padding: var(--cf-spacing-md);}
        .poetry-card .block-content{font-size: 0.9em;}
      }
    `;
  }
}

PoetryCard.manifest = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '显示经典诗词，支持动态内容',
  icon: '📜',
  category: '文化',
  version: '1.1.0',
  author: 'CardForge',
  config_schema: {
    show_title: { type: 'boolean', label: '显示标题', default: true },
    show_dynasty_author: { type: 'boolean', label: '显示朝代作者', default: true },
    show_translation: { type: 'boolean', label: '显示译文', default: false },
    font_family: { type: 'select', label: '字体', options: ['楷体', '宋体', '系统默认'], default: '楷体' },
    font_size: { type: 'select', label: '文字大小', options: ['小号', '中号', '大号'], default: '中号' },
    text_color: { type: 'color', label: '文字颜色', default: '#212121' },
    text_align: { type: 'select', label: '对齐方式', options: ['左对齐', '居中', '右对齐'], default: '居中' }
  },
  entity_requirements: {
    poetry_title: { name: '诗词标题实体', required: false },
    poetry_dynasty: { name: '朝代实体', required: false },
    poetry_author: { name: '作者实体', required: false },
    poetry_content: { name: '正文实体', required: false },
    poetry_translation: { name: '译文实体', required: false }
  },
  styles: PoetryCard.styles
};

export { PoetryCard as default, PoetryCard };
export const manifest = PoetryCard.manifest;