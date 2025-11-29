// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '显示经典诗词，支持块管理',
  icon: '📜',
  category: '文化',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
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
    },
    show_translation: {
      type: 'boolean',
      label: '显示译文',
      default: false
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
        poetry_title: {
          type: 'poetry_title',
          area: 'content',
          entity: '',
          content: '静夜思'
        },
        poetry_dynasty: {
          type: 'poetry_dynasty', 
          area: 'content',
          entity: '',
          content: '唐'
        },
        poetry_author: {
          type: 'poetry_author',
          area: 'content',
          entity: '',
          content: '李白'
        },
        poetry_content: {
          type: 'poetry_content',
          area: 'content',
          entity: '',
          content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。'
        },
        poetry_translation: {
          type: 'poetry_translation',
          area: 'content',
          entity: '',
          content: '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。'
        }
      }
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  _renderBlock(blockId, blockConfig, hass, entities) {
    // 所有诗词块都统一处理，不显示块标题
    if (blockConfig.type.startsWith('poetry_')) {
      return this._renderPoetryContent(blockConfig, hass);
    }
    return super._renderBlock(blockId, blockConfig, hass, entities);
  }

  _renderPoetryContent(blockConfig, hass) {
    const content = this._getBlockContent(blockConfig, hass);
    if (!content) return '';

    switch (blockConfig.type) {
      case 'poetry_title':
        return `<div class="poetry-title">${this._escapeHtml(content)}</div>`;
      case 'poetry_dynasty':
        return `<div class="poetry-dynasty">${this._escapeHtml(content)}</div>`;
      case 'poetry_author':
        return `<div class="poetry-author">${this._escapeHtml(content)}</div>`;
      case 'poetry_content':
        const lines = content.split(/[，。！？；]/).filter(line => line.trim());
        const contentHtml = lines.map(line => 
          `<div class="poetry-line">${this._escapeHtml(line)}</div>`
        ).join('');
        return `<div class="poetry-content">${contentHtml}</div>`;
      case 'poetry_translation':
        const showTranslation = this.config?.show_translation ?? CARD_CONFIG.config_schema.show_translation.default;
        if (!showTranslation) return '';
        return `<div class="poetry-translation">${this._escapeHtml(content)}</div>`;
      default:
        return '';
    }
  }

  _getBlockContent(blockConfig, hass) {
    // 优先从实体获取内容
    if (blockConfig.entity && hass?.states?.[blockConfig.entity]) {
      const entity = hass.states[blockConfig.entity];
      return entity.state || '';
    }
    
    // 回退到静态内容
    return blockConfig.content || '';
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
    // 安全地访问配置，提供默认值
    const safeConfig = config || {};
    const font_size = safeConfig.font_size || CARD_CONFIG.config_schema.font_size.default;
    const text_color = safeConfig.text_color || CARD_CONFIG.config_schema.text_color.default;
    
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
    
    const selectedColor = colorMap[text_color] || text_color;
    const selectedSize = fontSizeMap[font_size] || font_size;

    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      .poetry-title,
      .poetry-dynasty,
      .poetry-author,
      .poetry-content,
      .poetry-translation {
        text-align: center;
        color: ${selectedColor};
        font-family: 'Noto Serif SC', serif;
        margin: 0;
        padding: 0;
      }
      
      .poetry-title {
        font-size: ${font_size === 'large' ? '1.4em' : 
                    font_size === 'medium' ? '1.2em' : '1em'};
        font-weight: bold;
        line-height: 1.3;
        margin-bottom: var(--cf-spacing-xs);
      }
      
      /* 朝代和作者在同一行显示 */
      .poetry-dynasty-author-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-xs);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .poetry-dynasty,
      .poetry-author {
        font-size: 0.9em;
        opacity: 0.8;
        font-style: italic;
        line-height: 1.3;
        display: inline;
      }
      
      /* 在朝代和作者之间添加连接符 */
      .poetry-dynasty::after {
        content: " - ";
        margin: 0 var(--cf-spacing-xs);
      }
      
      .poetry-content {
        font-size: ${selectedSize};
        line-height: 1.8;
        margin: var(--cf-spacing-md) 0;
      }
      
      .poetry-line {
        margin: 0.2em 0;
        line-height: 1.6;
      }
      
      .poetry-translation {
        font-size: 0.85em;
        opacity: 0.9;
        text-align: left;
        line-height: 1.6;
        font-family: 'Noto Sans SC', sans-serif;
        padding: var(--cf-spacing-md);
        background: rgba(0, 0, 0, 0.05);
        border-radius: var(--cf-radius-sm);
        margin-top: var(--cf-spacing-md);
      }
      
      /* 移动端适配 */
      @container cardforge-container (max-width: 768px) {
        .poetry-title {
          font-size: ${font_size === 'large' ? '1.2em' : 
                      font_size === 'medium' ? '1.1em' : '0.95em'};
        }
        
        .poetry-content {
          font-size: ${font_size === 'large' ? '1.1em' : 
                      font_size === 'medium' ? '1em' : '0.9em'};
        }
        
        .poetry-dynasty-author-container {
          flex-direction: column;
          gap: 0;
        }
        
        .poetry-dynasty::after {
          content: "";
          margin: 0;
        }
        
        .poetry-dynasty,
        .poetry-author {
          display: block;
        }
      }
    `;
  }

  // 重写渲染区域方法，将朝代和作者组合在一起
  _renderArea(areaName, areaConfig, config, hass, entities) {
    const blocks = [];
    let currentIndex = 0;
    
    while (currentIndex < areaConfig.blocks.length) {
      const blockId = areaConfig.blocks[currentIndex];
      const blockConfig = config.blocks[blockId];
      
      if (blockConfig.type === 'poetry_dynasty') {
        // 找到朝代块，检查下一个是否是作者块
        const nextBlockId = areaConfig.blocks[currentIndex + 1];
        const nextBlockConfig = nextBlockId ? config.blocks[nextBlockId] : null;
        
        if (nextBlockConfig && nextBlockConfig.type === 'poetry_author') {
          // 将朝代和作者组合在一起
          const dynastyContent = this._getBlockContent(blockConfig, hass);
          const authorContent = this._getBlockContent(nextBlockConfig, hass);
          
          if (dynastyContent || authorContent) {
            blocks.push(`
              <div class="poetry-dynasty-author-container">
                ${dynastyContent ? `<div class="poetry-dynasty">${this._escapeHtml(dynastyContent)}</div>` : ''}
                ${authorContent ? `<div class="poetry-author">${this._escapeHtml(authorContent)}</div>` : ''}
              </div>
            `);
            currentIndex += 2; // 跳过两个块
            continue;
          }
        }
      }
      
      // 普通块渲染
      const blockHtml = this._renderBlock(blockId, blockConfig, hass, entities);
      if (blockHtml) {
        blocks.push(blockHtml);
      }
      currentIndex += 1;
    }
    
    const layout = areaConfig.layout || 'single';
    
    return `
      <div class="cardforge-area area-${areaName}">
        ${this._renderLayout(layout, blocks.join(''))}
      </div>
    `;
  }

  // 重写渲染方法，确保配置更新时重新渲染
  _renderTemplate(config, hass, entities) {
    // 强制重新计算样式
    this._currentConfig = config;
    
    const areas = this._renderAreas(config, hass, entities);
    
    return `
      <div class="cardforge-card ${config.card_type || ''}">
        ${areas.header}
        ${areas.content}
        ${areas.footer}
      </div>
    `;
  }

  // 重写样式渲染，确保配置更新时样式也更新
  _renderStyles(config, themeStyles) {
    // 调用父类方法获取基础样式
    const baseStyles = super._renderStyles(config, themeStyles);
    
    // 安全地访问配置，提供默认值
    const safeConfig = config || this._currentConfig || {};
    const font_size = safeConfig.font_size || CARD_CONFIG.config_schema.font_size.default;
    const text_color = safeConfig.text_color || CARD_CONFIG.config_schema.text_color.default;
    
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
    
    const selectedColor = colorMap[text_color] || text_color;
    const selectedSize = fontSizeMap[font_size] || font_size;

    const poetryStyles = `
      .poetry-title,
      .poetry-dynasty,
      .poetry-author,
      .poetry-content,
      .poetry-translation {
        color: ${selectedColor} !important;
      }
      
      .poetry-title {
        font-size: ${font_size === 'large' ? '1.4em' : 
                    font_size === 'medium' ? '1.2em' : '1em'} !important;
      }
      
      .poetry-content {
        font-size: ${selectedSize} !important;
      }
    `;

    return baseStyles + poetryStyles;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default PoetryCard;