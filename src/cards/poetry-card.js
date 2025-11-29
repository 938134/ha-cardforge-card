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
    // 按标点符号正确分行，保留完整诗句
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      currentLine += char;
      
      // 遇到句号、问号、感叹号时分行
      if (/[。！？]/.test(char)) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
      // 遇到逗号、分号且达到一定长度时分行（避免过长的句子）
      else if (/[，；]/.test(char) && currentLine.length >= 6) {
        lines.push(currentLine.trim());
        currentLine = '';
      }
    }
    
    // 添加最后一行
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines;
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
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .poetry-title {
          font-size: ${font_size === 'large' ? '1.3em' : 
                      font_size === 'medium' ? '1.1em' : '1em'};
        }
        
        .poetry-dynasty-author {
          font-size: ${font_size === 'large' ? '0.9em' : 
                      font_size === 'medium' ? '0.8em' : '0.75em'};
          margin-bottom: 12px;
        }
        
        .poetry-content {
          font-size: ${font_size === 'large' ? '1.1em' : 
                      font_size === 'medium' ? '0.95em' : '0.85em'};
          margin-bottom: 16px;
        }
        
        .poetry-translation {
          font-size: ${font_size === 'large' ? '0.85em' : 
                      font_size === 'medium' ? '0.8em' : '0.75em'};
          padding: 8px;
        }
        
        .translation-divider {
          margin-bottom: 12px;
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default PoetryCard;