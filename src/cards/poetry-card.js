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
          class: 'poetry-title'
        },
        poetry_dynasty_author: {
          type: 'text',
          content: '唐 — 李白',
          area: 'header',
          class: 'poetry-dynasty-author'
        },
        poetry_content: {
          type: 'text',
          content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
          area: 'content',
          class: 'poetry-content'
        },
        poetry_translation: {
          type: 'text',
          content: '',
          area: 'content',
          class: 'poetry-translation'
        }
      },
      show_title: true,
      show_dynasty_author: true,
      show_translation: false,
      font_family: '楷体',
      font_size: '中号',
      text_color: '#212121',
      text_align: 'center'
    };
  }

  getManifest() {
    return PoetryCard.manifest;
  }

  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    this._applyDynamicConfig(dynamicConfig, hass, entities);

    // ① 计算外观类 + 颜色变量
    const { font_family, font_size, text_align, text_color } = dynamicConfig;
    const classStr = [
      'poetry-card',
      { '楷体': 'kf-kai', '宋体': 'kf-song', '系统默认': '' }[font_family] || 'kf-kai',
      { '小号': 'kf-small', '中号': 'kf-medium', '大号': 'kf-large' }[font_size] || 'kf-medium',
      { '左对齐': 'kf-left', '居中': 'kf-center', '右对齐': 'kf-right' }[text_align] || 'kf-center'
    ].filter(Boolean).join(' ');

    const styleStr = `color:${text_color};`;

    // ② 构建根节点字符串（无 html 标签）
    const areas = this._renderAreas(dynamicConfig, hass, entities);
    const template = `
      <div class="${classStr}" style="${styleStr}">
        ${areas.header}
        ${areas.content}
        ${areas.footer}
      </div>
    `;

    return {
      template,
      styles: PoetryCard.styles(dynamicConfig)
    };
  }

  _applyDynamicConfig(config, hass, entities) {
    const blocks = config.blocks;

    if (config.show_title && blocks.poetry_title) {
      blocks.poetry_title.content = hass?.states[entities?.poetry_title]?.state || '静夜思';
    }

    if (config.show_dynasty_author && blocks.poetry_dynasty_author) {
      const dynasty = hass?.states[entities?.poetry_dynasty]?.state || '唐';
      const author  = hass?.states[entities?.poetry_author]?.state   || '李白';
      blocks.poetry_dynasty_author.content = `${dynasty} — ${author}`;
    }

    if (blocks.poetry_content) {
      blocks.poetry_content.content = hass?.states[entities?.poetry_content]?.state || blocks.poetry_content.content;
    }

    if (config.show_translation && blocks.poetry_translation) {
      blocks.poetry_translation.content = hass?.states[entities?.poetry_translation]?.state || '';
    } else {
      blocks.poetry_translation.class += ' hidden';
    }
  }

  static styles(config) {
    return `
      .poetry-card{
        --poetry-text-color:#212121;
        display:flex;
        flex-direction:column;
        gap:var(--cf-spacing-md);
      }
      .poetry-card.kf-kai .poetry-content{font-family:"楷体","STKaiti",serif;}
      .poetry-card.kf-song .poetry-content{font-family:"宋体","SimSun",serif;}
      .poetry-card.kf-small .poetry-content{font-size:1em;}
      .poetry-card.kf-medium .poetry-content{font-size:1.2em;}
      .poetry-card.kf-large .poetry-content{font-size:1.5em;}
      .poetry-card.kf-left  .poetry-content{text-align:left;}
      .poetry-card.kf-center .poetry-content{text-align:center;}
      .poetry-card.kf-right .poetry-content{text-align:right;}

      .poetry-title{color:var(--cf-primary-color);font-size:1.4em;font-weight:600;text-align:center;}
      .poetry-dynasty-author{color:var(--cf-text-secondary);font-size:0.95em;text-align:center;margin-top:4px;}
      .poetry-content{color:var(--poetry-text-color);line-height:1.8;white-space:pre-line;}
      .poetry-translation{border-top:1px solid var(--cf-border);margin-top:1em;padding-top:1em;font-size:0.9em;color:var(--cf-text-secondary);line-height:1.6;white-space:pre-line;}
      .poetry-translation.hidden{display:none;}

      .poetry-card .area-header{display:flex;flex-direction:column;align-items:center;gap:4px;margin-bottom:var(--cf-spacing-lg);}
      @container cardforge-container (max-width: 400px) {
        .poetry-card .area-header{margin-bottom:var(--cf-spacing-md);}
      }
    `;
  }
}

PoetryCard.manifest = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '双实体朝代作者，无标签，样式类控制',
  icon: '📜',
  category: '文化',
  version: '1.4.0',
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