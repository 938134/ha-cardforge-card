// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

export class PoetryCard extends BaseCard {
  getDefaultConfig() {
    return {
      show_title: true,
      show_dynasty: true,
      show_author: true,
      show_content: true,
      show_translation: false,
      font_family: 'default',
      font_size: 'medium',
      text_color: '#333333',
      text_align: 'center'
    };
  }

  getManifest() {
    const defaultConfig = this.getDefaultConfig();
    
    // 自动从 defaultConfig 生成配置架构
    const configSchema = {
      show_title: {
        type: 'boolean',
        label: '显示标题',
        default: defaultConfig.show_title
      },
      show_dynasty: {
        type: 'boolean', 
        label: '显示朝代',
        default: defaultConfig.show_dynasty
      },
      show_author: {
        type: 'boolean',
        label: '显示作者', 
        default: defaultConfig.show_author
      },
      show_content: {
        type: 'boolean',
        label: '显示全文',
        default: defaultConfig.show_content
      },
      show_translation: {
        type: 'boolean',
        label: '显示译文',
        default: defaultConfig.show_translation
      },
      font_family: {
        type: 'select',
        label: '诗词字体',
        options: ['default', '书法字体', '宋体', '楷体', '黑体'],
        default: defaultConfig.font_family
      },
      font_size: {
        type: 'select',
        label: '文字大小', 
        options: ['small', 'medium', 'large'],
        default: defaultConfig.font_size
      },
      text_color: {
        type: 'color',
        label: '文字颜色',
        default: defaultConfig.text_color
      },
      text_align: {
        type: 'select',
        label: '对齐方式',
        options: ['left', 'center', 'right'],
        default: defaultConfig.text_align
      }
    };

    return {
      id: 'poetry-card',
      name: '诗词卡片',
      description: '显示经典诗词，支持多种样式配置',
      icon: '📜',
      category: '文化',
      author: 'CardForge',
      version: '1.0.0',
      config_schema: configSchema,
      styles: (config) => this._generateStyles(config)
    };
  }

  _generateStyles(config) {
    return `
      .poetry-card {
        font-family: ${config.font_family === 'default' ? 'inherit' : config.font_family};
        font-size: ${config.font_size === 'small' ? '0.9em' : config.font_size === 'large' ? '1.2em' : '1em'};
        color: ${config.text_color};
        text-align: ${config.text_align};
        line-height: 1.6;
      }
      
      .poetry-title {
        font-size: 1.3em;
        font-weight: bold;
        margin-bottom: 0.5em;
      }
      
      .poetry-meta {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: 1em;
      }
      
      .poetry-content {
        white-space: pre-line;
        margin-bottom: 1em;
      }
      
      .poetry-translation {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        border-top: 1px solid var(--cf-border);
        padding-top: 1em;
        white-space: pre-line;
      }
    `;
  }

  _renderTemplate(config, hass, entities) {
    const blocks = config.blocks || {};
    
    // 获取各个实体的状态值
    const titleBlock = this._findBlockByUsage(blocks, 'title');
    const dynastyBlock = this._findBlockByUsage(blocks, 'dynasty');
    const authorBlock = this._findBlockByUsage(blocks, 'author');
    const contentBlock = this._findBlockByUsage(blocks, 'content');
    const translationBlock = this._findBlockByUsage(blocks, 'translation');

    const title = titleBlock ? this._getBlockContent(titleBlock, hass, entities) : '';
    const dynasty = dynastyBlock ? this._getBlockContent(dynastyBlock, hass, entities) : '';
    const author = authorBlock ? this._getBlockContent(authorBlock, hass, entities) : '';
    const content = contentBlock ? this._getBlockContent(contentBlock, hass, entities) : '';
    const translation = translationBlock ? this._getBlockContent(translationBlock, hass, entities) : '';

    return `
      <div class="cardforge-card poetry-card">
        <div class="cardforge-area area-content">
          <div class="layout-single">
            ${config.show_title && title ? `<div class="poetry-title">《${title}》</div>` : ''}
            ${(config.show_dynasty || config.show_author) && (dynasty || author) ? `
              <div class="poetry-meta">
                ${config.show_dynasty ? dynasty : ''}
                ${config.show_dynasty && config.show_author && dynasty && author ? ' - ' : ''}
                ${config.show_author ? author : ''}
              </div>
            ` : ''}
            ${config.show_content && content ? `<div class="poetry-content">${content}</div>` : ''}
            ${config.show_translation && translation ? `<div class="poetry-translation">${translation}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _findBlockByUsage(blocks, usage) {
    return Object.values(blocks).find(block => block.usage === usage);
  }

  _getBlockContent(blockConfig, hass, entities) {
    // 优先从实体获取内容
    if (blockConfig.entity && hass?.states[blockConfig.entity]) {
      const entity = hass.states[blockConfig.entity];
      return entity.state || '';
    }
    
    // 从实体映射获取内容
    if (entities && blockConfig.id && entities[blockConfig.id] && hass?.states[entities[blockConfig.id]]) {
      const entity = hass.states[entities[blockConfig.id]];
      return entity.state || '';
    }
    
    // 回退到静态内容
    return blockConfig.content || '';
  }
}

// 导出 manifest 用于旧版注册系统
export const manifest = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '显示经典诗词，支持多种样式配置',
  icon: '📜',
  category: '文化',
  author: 'CardForge',
  version: '1.0.0'
};

export default PoetryCard;