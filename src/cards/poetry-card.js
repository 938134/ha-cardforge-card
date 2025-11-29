// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

class PoetryCard extends BaseCard {
  /* ① 一份表 = 默认 blocks + 编辑器下拉 */
  static get entityMap() {
    return {
      poetry_title: {
        name: '诗词标题',
        default_entity: '',
        area: 'header',
        block_class: 'poetry-title'
      },
      poetry_dynasty: {
        name: '朝代',
        default_entity: '',
        area: 'header',
        block_class: 'poetry-dynasty-author',
        join: ' — ',
        join_target: 'poetry_author'
      },
      poetry_author: {
        name: '作者',
        default_entity: '',
        area: 'header',
        block_class: 'poetry-dynasty-author'
      },
      poetry_content: {
        name: '正文',
        default_entity: '',
        area: 'content',
        block_class: 'poetry-content'
      },
      poetry_translation: {
        name: '译文',
        default_entity: '',
        area: 'content',
        block_class: 'poetry-translation'
      }
    };
  }

  /* ② 自动生成默认配置 */
  getDefaultConfig() {
    const blocks = {};
    const areas = { header: [], content: [], footer: [] };
    for (const [key, meta] of Object.entries(this.constructor.entityMap)) {
      blocks[key] = {
        type: 'text',
        content: '',
        area: meta.area,
        class: meta.block_class
      };
      areas[meta.area].push(key);
    }
    return {
      card_type: 'poetry-card',
      theme: 'auto',
      areas: {
        header: { layout: 'single', blocks: areas.header },
        content: { layout: 'single', blocks: areas.content },
        footer: { layout: 'single', blocks: areas.footer }
      },
      blocks,
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
    return {
      id: 'poetry-card',
      name: '诗词卡片',
      description: 'entityMap 一份表生成默认块与下拉',
      icon: '📜',
      category: '文化',
      version: '2.1.0',
      author: 'CardForge',
      entity_map: this.constructor.entityMap,
      config_schema: {
        show_title: { type: 'boolean', label: '显示标题', default: true },
        show_dynasty_author: { type: 'boolean', label: '显示朝代作者', default: true },
        show_translation: { type: 'boolean', label: '显示译文', default: false },
        font_family: { type: 'select', label: '字体', options: ['楷体', '宋体', '系统默认'], default: '楷体' },
        font_size: { type: 'select', label: '文字大小', options: ['小号', '中号', '大号'], default: '中号' },
        text_color: { type: 'color', label: '文字颜色', default: '#212121' },
        text_align: { type: 'select', label: '对齐方式', options: ['左对齐', '居中', '右对齐'], default: '居中' }
      },
      styles: PoetryCard.styles
    };
  }

  /* ③ 渲染：只填内容，不改结构 */
  _applyDynamicConfig(config, hass, entities) {
    const blocks = config.blocks;
    if (config.show_title && blocks.poetry_title) {
      blocks.poetry_title.content = hass?.states[entities?.poetry_title]?.state || '静夜思';
    }
    if (config.show_dynasty_author && blocks.poetry_dynasty_author) {
      const dynasty = hass?.states[entities?.poetry_dynasty]?.state || '唐';
      const author = hass?.states[entities?.poetry_author]?.state || '李白';
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

  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    this._applyDynamicConfig(dynamicConfig, hass, entities);

    /* ④ 外观类 + 颜色变量写进根元素字符串 */
    const { font_family, font_size, text_align, text_color } = dynamicConfig;
    const classStr = [
      'poetry-card',
      { '楷体': 'kf-kai', '宋体': 'kf-song', '系统默认': '' }[font_family] || 'kf-kai',
      { '小号': 'kf-small', '中号': 'kf-medium', '大号': 'kf-large' }[font_size] || 'kf-medium',
      { '左对齐': 'kf-left', '居中': 'kf-center', '右对齐': 'kf-right' }[text_align] || 'kf-center'
    ].filter(Boolean).join(' ');
    const styleStr = `color:${text_color};`;

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

export { PoetryCard as default, PoetryCard };
export const manifest = PoetryCard.manifest;