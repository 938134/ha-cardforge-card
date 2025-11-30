// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '显示经典诗词，支持译文显示',
  icon: '📜',
  category: '文化',
  version: '1.0.0',
  author: 'CardForge',
  block_mode: 'preset',
  config_schema: {
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
          content: '静夜思',
          name: '诗词标题'
        },
        poetry_dynasty: {
          type: 'poetry_dynasty', 
          area: 'content',
          entity: '',
          content: '唐',
          name: '诗词朝代'
        },
        poetry_author: {
          type: 'poetry_author',
          area: 'content',
          entity: '',
          content: '李白',
          name: '诗词作者'
        },
        poetry_content: {
          type: 'poetry_content',
          area: 'content',
          entity: '',
          content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
          name: '诗词内容'
        },
        poetry_translation: {
          type: 'poetry_translation',
          area: 'content',
          entity: '',
          content: '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。',
          name: '诗词译文'
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
      const content = this._getBlockContent(blockConfig, hass);
      if (!content) return '';

      switch (blockConfig.type) {
        case 'poetry_title':
          return `<div class="poetry-title">${this._escapeHtml(content)}</div>`;
        case 'poetry_dynasty':
          return `<span class="poetry-dynasty">${this._escapeHtml(content)}</span>`;
        case 'poetry_author':
          return `<span class="poetry-author">${this._escapeHtml(content)}</span>`;
        case 'poetry_content':
          const lines = this._splitPoetryContent(content);
          const contentHtml = lines.map(line => 
            `<div class="poetry-line">${this._escapeHtml(line)}</div>`
          ).join('');
          return `<div class="poetry-content">${contentHtml}</div>`;
        case 'poetry_translation':
          const showTranslation = this.config?.show_translation ?? CARD_CONFIG.config_schema.show_translation.default;
          if (!showTranslation) return '';
          return `
            <div class="translation-section">
              <div class="translation-divider"></div>
              <div class="poetry-translation">${this._escapeHtml(content)}</div>
            </div>
          `;
        default:
          return '';
      }
    }
    return super._renderBlock(blockId, blockConfig, hass, entities);
  }

  _splitPoetryContent(content) {
    // 智能分行策略：根据容器宽度决定
    // 窄屏：每句一行
    // 宽屏：按完整诗句分行（保持语义完整性）
    
    const sentences = [];
    let currentSentence = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      currentSentence += char;
      
      // 遇到完整诗句结束符号时分行
      if (/[。！？]/.test(char)) {
        sentences.push(currentSentence.trim());
        currentSentence = '';
      }
    }
    
    // 添加最后一句（如果没有结束符号）
    if (currentSentence.trim()) {
      sentences.push(currentSentence.trim());
    }
    
    return sentences;
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
              <div class="poetry-dynasty-author">
                ${dynastyContent ? `<span class="poetry-dynasty">${this._escapeHtml(dynastyContent)}</span>` : ''}
                ${dynastyContent && authorContent ? '<span class="poetry-separator">·</span>' : ''}
                ${authorContent ? `<span class="poetry-author">${this._escapeHtml(authorContent)}</span>` : ''}
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

  _renderStyles(config, themeStyles) {
    // 安全地访问配置，提供默认值
    const safeConfig = config || {};
    const font_size = safeConfig.font_size || CARD_CONFIG.config_schema.font_size.default;
    
    const fontSizeMap = {
      small: { title: '1.1em', content: '0.9em', author: '0.8em', translation: '0.8em' },
      medium: { title: '1.3em', content: '1.1em', author: '0.9em', translation: '0.9em' },
      large: { title: '1.5em', content: '1.3em', author: '1em', translation: '1em' }
    };
    
    const selectedSize = fontSizeMap[font_size] || fontSizeMap.medium;

    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      /* 所有诗词内容居中 */
      .cardforge-area {
        text-align: center;
      }
      
      .poetry-title,
      .poetry-dynasty-author,
      .poetry-content {
        text-align: center;
        color: var(--primary-text-color);
        font-family: 'Noto Serif SC', serif;
        margin: 0;
        padding: 0;
      }
      
      .poetry-title {
        font-size: ${selectedSize.title};
        font-weight: bold;
        line-height: 1.3;
        margin-bottom: 8px;
      }
      
      /* 朝代和作者在同一行显示 */
      .poetry-dynasty-author {
        font-size: ${selectedSize.author};
        color: var(--secondary-text-color);
        opacity: 0.8;
        font-style: italic;
        line-height: 1.3;
        margin-bottom: 16px;
      }
      
      .poetry-dynasty,
      .poetry-author,
      .poetry-separator {
        display: inline;
      }
      
      .poetry-separator {
        margin: 0 6px;
        opacity: 0.6;
      }
      
      .poetry-content {
        font-size: ${selectedSize.content};
        line-height: 1.8;
        margin: 0 0 20px 0;
      }
      
      .poetry-line {
        margin: 0.1em 0;
        line-height: 1.6;
      }
      
      /* 译文部分 */
      .translation-section {
        margin-top: 16px;
      }
      
      .translation-divider {
        width: 60%;
        height: 1px;
        background: var(--divider-color);
        margin: 0 auto 16px auto;
        opacity: 0.6;
      }
      
      .poetry-translation {
        font-size: ${selectedSize.translation};
        color: var(--secondary-text-color);
        line-height: 1.6;
        font-family: 'Noto Sans SC', sans-serif;
        text-align: left;
        max-width: 90%;
        margin: 0 auto;
        padding: 12px;
        background: rgba(0, 0, 0, 0.03);
        border-radius: var(--cf-radius-sm);
      }
      
      /* 响应式设计 - 优化小屏字体和分行 */
      @container cardforge-container (max-width: 400px) {
        .poetry-title {
          font-size: ${font_size === 'large' ? '1.4em' : 
                      font_size === 'medium' ? '1.2em' : '1.1em'};
        }
        
        .poetry-dynasty-author {
          font-size: ${font_size === 'large' ? '1em' : 
                      font_size === 'medium' ? '0.95em' : '0.9em'};
          margin-bottom: 14px;
        }
        
        .poetry-content {
          font-size: ${font_size === 'large' ? '1.2em' : 
                      font_size === 'medium' ? '1.05em' : '0.95em'};
          margin-bottom: 16px;
          line-height: 1.7;
        }
        
        .poetry-line {
          line-height: 1.5;
          margin: 0.2em 0;
        }
        
        .poetry-translation {
          font-size: ${font_size === 'large' ? '0.95em' : 
                      font_size === 'medium' ? '0.9em' : '0.85em'};
          padding: 10px;
          max-width: 95%;
        }
        
        .translation-divider {
          margin-bottom: 14px;
        }
      }

      @container cardforge-container (max-width: 320px) {
        .poetry-title {
          font-size: ${font_size === 'large' ? '1.3em' : 
                      font_size === 'medium' ? '1.15em' : '1.05em'};
        }
        
        .poetry-content {
          font-size: ${font_size === 'large' ? '1.15em' : 
                      font_size === 'medium' ? '1em' : '0.9em'};
          line-height: 1.6;
        }
        
        .poetry-line {
          line-height: 1.4;
          margin: 0.3em 0;
        }
      }

      /* 宽屏优化 - 智能分行 */
      @container cardforge-container (min-width: 500px) {
        .poetry-content {
          line-height: 1.9;
        }
        
        .poetry-line {
          line-height: 1.7;
          margin: 0.15em 0;
        }
        
        /* 宽屏时诗句可以更舒展 */
        .poetry-title {
          margin-bottom: 12px;
        }
        
        .poetry-dynasty-author {
          margin-bottom: 20px;
        }
      }

      @container cardforge-container (min-width: 600px) {
        .poetry-content {
          font-size: ${font_size === 'large' ? '1.4em' : 
                      font_size === 'medium' ? '1.2em' : '1.1em'};
          line-height: 2;
        }
        
        .poetry-line {
          line-height: 1.8;
          margin: 0.2em 0;
        }
        
        .poetry-translation {
          font-size: ${font_size === 'large' ? '1.1em' : 
                      font_size === 'medium' ? '1em' : '0.95em'};
          max-width: 85%;
          padding: 16px;
        }
      }

      /* 超宽屏优化 */
      @container cardforge-container (min-width: 800px) {
        .poetry-content {
          font-size: ${font_size === 'large' ? '1.5em' : 
                      font_size === 'medium' ? '1.3em' : '1.2em'};
          line-height: 2.1;
        }
        
        .poetry-line {
          line-height: 1.9;
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default PoetryCard;