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
          title: '诗词标题',
          entity: '',
          content: '静夜思'
        },
        poetry_dynasty: {
          type: 'poetry_dynasty',
          area: 'content',
          title: '朝代',
          entity: '',
          content: '唐'
        },
        poetry_author: {
          type: 'poetry_author',
          area: 'content',
          title: '作者',
          entity: '',
          content: '李白'
        },
        poetry_content: {
          type: 'poetry_content',
          area: 'content',
          title: '诗词内容',
          entity: '',
          content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。'
        },
        poetry_translation: {
          type: 'poetry_translation',
          area: 'content',
          title: '诗词译文',
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
    switch (blockConfig.type) {
      case 'poetry_title':
        return this._renderPoetryTitle(blockConfig, hass);
      case 'poetry_dynasty':
        return this._renderPoetryDynasty(blockConfig, hass);
      case 'poetry_author':
        return this._renderPoetryAuthor(blockConfig, hass);
      case 'poetry_content':
        return this._renderPoetryContent(blockConfig, hass);
      case 'poetry_translation':
        return this._renderPoetryTranslation(blockConfig, hass);
      default:
        return super._renderBlock(blockId, blockConfig, hass, entities);
    }
  }

  _renderPoetryTitle(blockConfig, hass) {
    const content = this._getBlockContent(blockConfig, hass);
    if (!content) return '';

    return `
      <div class="cardforge-block poetry-title-block">
        <div class="poetry-title">${this._escapeHtml(content)}</div>
      </div>
    `;
  }

  _renderPoetryDynasty(blockConfig, hass) {
    const content = this._getBlockContent(blockConfig, hass);
    if (!content) return '';

    return `
      <div class="cardforge-block poetry-dynasty-block">
        <div class="poetry-dynasty">${this._escapeHtml(content)}</div>
      </div>
    `;
  }

  _renderPoetryAuthor(blockConfig, hass) {
    const content = this._getBlockContent(blockConfig, hass);
    if (!content) return '';

    return `
      <div class="cardforge-block poetry-author-block">
        <div class="poetry-author">${this._escapeHtml(content)}</div>
      </div>
    `;
  }

  _renderPoetryContent(blockConfig, hass) {
    const content = this._getBlockContent(blockConfig, hass);
    if (!content) return '';

    const lines = content.split(/[，。！？；]/).filter(line => line.trim());
    const contentHtml = lines.map(line => 
      `<div class="poetry-line">${this._escapeHtml(line)}</div>`
    ).join('');

    return `
      <div class="cardforge-block poetry-content-block">
        <div class="poetry-content">${contentHtml}</div>
      </div>
    `;
  }

  _renderPoetryTranslation(blockConfig, hass) {
    // 安全地访问配置，防止undefined错误
    const showTranslation = this.config?.show_translation ?? CARD_CONFIG.config_schema.show_translation.default;
    if (!showTranslation) return '';
    
    const content = this._getBlockContent(blockConfig, hass);
    if (!content) return '';

    return `
      <div class="cardforge-block poetry-translation-block">
        <div class="poetry-translation">${this._escapeHtml(content)}</div>
      </div>
    `;
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
      
      .poetry-title-block,
      .poetry-content-block,
      .poetry-translation-block {
        text-align: center;
        color: ${selectedColor};
        font-family: 'Noto Serif SC', serif;
        padding: var(--cf-spacing-sm) 0;
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
        text-align: center;
        margin-bottom: var(--cf-spacing-md);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--cf-spacing-xs);
        flex-wrap: wrap;
      }
      
      .poetry-dynasty-block,
      .poetry-author-block {
        display: inline-block;
        margin: 0;
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
        margin: 0.5em 0;
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
          blocks.push(this._renderDynastyAuthorGroup(blockConfig, nextBlockConfig, hass));
          currentIndex += 2; // 跳过两个块
          continue;
        }
      }
      
      // 普通块渲染
      blocks.push(this._renderBlock(blockId, blockConfig, hass, entities));
      currentIndex += 1;
    }
    
    const layout = areaConfig.layout || 'single';
    
    return `
      <div class="cardforge-area area-${areaName}">
        ${this._renderLayout(layout, blocks.join(''))}
      </div>
    `;
  }

  // 渲染朝代和作者组合
  _renderDynastyAuthorGroup(dynastyBlock, authorBlock, hass) {
    const dynastyContent = this._getBlockContent(dynastyBlock, hass);
    const authorContent = this._getBlockContent(authorBlock, hass);
    
    if (!dynastyContent && !authorContent) return '';
    
    return `
      <div class="cardforge-block poetry-dynasty-author-container">
        ${dynastyContent ? `
          <div class="poetry-dynasty-block">
            <div class="poetry-dynasty">${this._escapeHtml(dynastyContent)}</div>
          </div>
        ` : ''}
        ${authorContent ? `
          <div class="poetry-author-block">
            <div class="poetry-author">${this._escapeHtml(authorContent)}</div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default PoetryCard;