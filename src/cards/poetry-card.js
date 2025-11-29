// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '显示经典诗词，支持实体数据源',
  icon: '📜',
  category: '文化',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    entity_title: {
      type: 'entity',
      label: '诗词标题实体',
      default: ''
    },
    entity_dynasty: {
      type: 'entity',
      label: '诗词朝代实体',
      default: ''
    },
    entity_author: {
      type: 'entity',
      label: '诗词作者实体',
      default: ''
    },
    entity_content: {
      type: 'entity',
      label: '诗词内容实体',
      default: ''
    },
    entity_translation: {
      type: 'entity',
      label: '诗词译文实体',
      default: ''
    },
    show_title: {
      type: 'boolean',
      label: '显示标题',
      default: true
    },
    show_dynasty_author: {
      type: 'boolean',
      label: '显示朝代作者',
      default: true
    },
    show_translation: {
      type: 'boolean',
      label: '显示译文',
      default: false
    },
    font_size: {
      type: 'select',
      label: '字体大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    },
    text_color: {
      type: 'color',
      label: '文字颜色',
      options: [
        { value: 'blue', label: '蓝色' },
        { value: 'red', label: '红色' },
        { value: 'green', label: '绿色' },
        { value: 'yellow', label: '黄色' },
        { value: 'purple', label: '紫色' }
      ],
      default: 'blue'
    }
  }
};

export class PoetryCard extends BaseCard {
  getDefaultConfig() {
    // 从config_schema生成默认配置
    const defaultConfig = {};
    Object.entries(CARD_CONFIG.config_schema).forEach(([key, field]) => {
      defaultConfig[key] = field.default !== undefined ? field.default : '';
    });

    return {
      card_type: CARD_CONFIG.id,
      theme: 'inkwash',
      ...defaultConfig,
      blocks: {
        poetry_content: {
          type: 'poetry',
          area: 'content'
        }
      }
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  _renderBlock(blockId, blockConfig, hass, entities) {
    if (blockConfig.type === 'poetry') {
      return this._renderPoetryBlock(hass);
    }
    return super._renderBlock(blockId, blockConfig, hass, entities);
  }

  _renderPoetryBlock(hass) {
    const poetryData = this._getPoetryData(hass);
    
    return `
      <div class="cardforge-block poetry-block">
        ${this._renderPoetryTitle(poetryData)}
        ${this._renderPoetrySubtitle(poetryData)}
        ${this._renderPoetryContent(poetryData)}
        ${this._renderPoetryTranslation(poetryData)}
      </div>
    `;
  }

  _renderPoetryTitle(poetryData) {
    if (!this.config.show_title || !poetryData.title) return '';
    return `<div class="poetry-title">${this._escapeHtml(poetryData.title)}</div>`;
  }

  _renderPoetrySubtitle(poetryData) {
    if (!this.config.show_dynasty_author || (!poetryData.dynasty && !poetryData.author)) return '';
    
    const subtitleParts = [];
    if (poetryData.dynasty) subtitleParts.push(this._escapeHtml(poetryData.dynasty));
    if (poetryData.author) subtitleParts.push(this._escapeHtml(poetryData.author));
    
    if (subtitleParts.length === 0) return '';
    
    return `<div class="poetry-subtitle">${subtitleParts.join(' - ')}</div>`;
  }

  _renderPoetryContent(poetryData) {
    if (!poetryData.content) {
      return '<div class="poetry-content">暂无诗词内容</div>';
    }
    
    const lines = poetryData.content.split(/[，。！？；]/).filter(line => line.trim());
    const contentHtml = lines.map(line => 
      `<div class="poetry-line">${this._escapeHtml(line)}</div>`
    ).join('');
    
    return `<div class="poetry-content">${contentHtml}</div>`;
  }

  _renderPoetryTranslation(poetryData) {
    if (!this.config.show_translation || !poetryData.translation) return '';
    return `<div class="poetry-translation">${this._escapeHtml(poetryData.translation)}</div>`;
  }

  _getPoetryData(hass) {
    const entityData = {
      title: this._getEntityState('entity_title', hass),
      dynasty: this._getEntityState('entity_dynasty', hass),
      author: this._getEntityState('entity_author', hass),
      content: this._getEntityState('entity_content', hass),
      translation: this._getEntityState('entity_translation', hass)
    };

    if (entityData.title || entityData.content) {
      return entityData;
    }

    return this._getSamplePoetryData();
  }

  _getEntityState(entityKey, hass) {
    const entityId = this.config[entityKey];
    if (!entityId || !hass?.states?.[entityId]) return '';
    
    const entity = hass.states[entityId];
    return entity.state || '';
  }

  _getSamplePoetryData() {
    const poems = [
      {
        title: '静夜思',
        content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
        dynasty: '唐',
        author: '李白',
        translation: '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。'
      },
      {
        title: '春晓',
        content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
        dynasty: '唐',
        author: '孟浩然',
        translation: '春日里贪睡不知不觉天已破晓，搅乱我酣眠的是那啁啾的小鸟。昨天夜里风声雨声一直不断，那娇美的春花不知被吹落了多少？'
      },
      {
        title: '登鹳雀楼',
        content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
        dynasty: '唐',
        author: '王之涣',
        translation: '夕阳依傍着西山慢慢地沉没，滔滔黄河朝着东海汹涌奔流。若想把千里的风光景物看够，那就要登上更高的一层城楼。'
      }
    ];
    
    const now = new Date();
    const poemIndex = now.getHours() % poems.length;
    return poems[poemIndex];
  }

  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  _renderStyles(config, themeStyles) {
    const colorMap = {
      blue: '#4285f4',
      red: '#ea4335',
      green: '#34a853',
      yellow: '#fbbc05',
      purple: '#a142f4'
    };
    
    const fontSizeMap = {
      small: '0.9em',
      medium: '1.1em',
      large: '1.3em'
    };
    
    const selectedColor = colorMap[config.text_color] || config.text_color;
    const selectedSize = fontSizeMap[config.font_size] || config.font_size;

    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      .poetry-block {
        text-align: center;
        color: ${selectedColor};
        font-family: 'Noto Serif SC', serif;
        padding: var(--cf-spacing-md);
      }
      
      .poetry-title {
        font-size: ${config.font_size === 'large' ? '1.4em' : 
                    config.font_size === 'medium' ? '1.2em' : '1em'};
        font-weight: bold;
        margin-bottom: 0.3em;
        line-height: 1.3;
      }
      
      .poetry-subtitle {
        font-size: 0.9em;
        opacity: 0.8;
        margin-bottom: 1em;
        font-style: italic;
        line-height: 1.3;
      }
      
      .poetry-content {
        font-size: ${selectedSize};
        line-height: 1.8;
        margin: 1em 0;
      }
      
      .poetry-line {
        margin: 0.2em 0;
        line-height: 1.6;
      }
      
      .poetry-translation {
        font-size: 0.85em;
        opacity: 0.9;
        margin-top: 1.5em;
        padding-top: 1em;
        border-top: 1px solid ${selectedColor}30;
        text-align: left;
        line-height: 1.6;
        font-family: 'Noto Sans SC', sans-serif;
      }
      
      @container cardforge-container (max-width: 768px) {
        .poetry-block {
          padding: var(--cf-spacing-sm);
        }
        
        .poetry-title {
          font-size: ${config.font_size === 'large' ? '1.2em' : 
                      config.font_size === 'medium' ? '1.1em' : '0.95em'};
        }
        
        .poetry-content {
          font-size: ${config.font_size === 'large' ? '1.1em' : 
                      config.font_size === 'medium' ? '1em' : '0.9em'};
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default PoetryCard;