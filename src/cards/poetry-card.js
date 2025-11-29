// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置schema
const CONFIG_SCHEMA = {
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
};

// 统一的manifest
const MANIFEST = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '显示经典诗词，支持实体数据源',
  icon: '📜',
  category: '文化',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: CONFIG_SCHEMA
};

export class PoetryCard extends BaseCard {
  getDefaultConfig() {
    return {
      card_type: 'poetry-card',
      theme: 'inkwash',
      // 实体配置
      entity_title: '',
      entity_dynasty: '',
      entity_author: '',
      entity_content: '',
      entity_translation: '',
      // 显示配置
      ...Object.keys(CONFIG_SCHEMA).reduce((acc, key) => {
        acc[key] = CONFIG_SCHEMA[key].default;
        return acc;
      }, {}),
      // 块配置
      blocks: {
        poetry_content: {
          type: 'poetry',
          area: 'content'
        }
      }
    };
  }

  getManifest() {
    return MANIFEST;
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
    return `<div class="poetry-title">${poetryData.title}</div>`;
  }

  _renderPoetrySubtitle(poetryData) {
    if (!this.config.show_dynasty_author || (!poetryData.dynasty && !poetryData.author)) return '';
    
    const subtitleParts = [];
    if (poetryData.dynasty) subtitleParts.push(poetryData.dynasty);
    if (poetryData.author) subtitleParts.push(poetryData.author);
    
    if (subtitleParts.length === 0) return '';
    
    return `<div class="poetry-subtitle">${subtitleParts.join(' - ')}</div>`;
  }

  _renderPoetryContent(poetryData) {
    if (!poetryData.content) return '<div class="poetry-content">暂无诗词内容</div>';
    
    const lines = poetryData.content.split(/[，。！？]/).filter(line => line.trim());
    const contentHtml = lines.map(line => 
      `<div class="poetry-line">${line}</div>`
    ).join('');
    
    return `<div class="poetry-content">${contentHtml}</div>`;
  }

  _renderPoetryTranslation(poetryData) {
    if (!this.config.show_translation || !poetryData.translation) return '';
    return `<div class="poetry-translation">${poetryData.translation}</div>`;
  }

  _getPoetryData(hass) {
    return {
      title: this._getEntityState('entity_title', hass),
      dynasty: this._getEntityState('entity_dynasty', hass),
      author: this._getEntityState('entity_author', hass),
      content: this._getEntityState('entity_content', hass),
      translation: this._getEntityState('entity_translation', hass)
    };
  }

  _getEntityState(entityKey, hass) {
    const entityId = this.config[entityKey];
    if (!entityId || !hass?.states?.[entityId]) return '';
    
    const entity = hass.states[entityId];
    return entity.state || '';
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
      }
      
      .poetry-title {
        font-size: ${config.font_size === 'large' ? '1.4em' : 
                    config.font_size === 'medium' ? '1.2em' : '1em'};
        font-weight: bold;
        margin-bottom: 0.3em;
      }
      
      .poetry-subtitle {
        font-size: 0.9em;
        opacity: 0.8;
        margin-bottom: 1em;
        font-style: italic;
      }
      
      .poetry-content {
        font-size: ${selectedSize};
        line-height: 1.8;
        margin: 1em 0;
      }
      
      .poetry-line {
        margin: 0.2em 0;
      }
      
      .poetry-translation {
        font-size: 0.85em;
        opacity: 0.9;
        margin-top: 1.5em;
        padding-top: 1em;
        border-top: 1px solid ${selectedColor}30;
        text-align: left;
        line-height: 1.6;
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = MANIFEST;

export default PoetryCard;