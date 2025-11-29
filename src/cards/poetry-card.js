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
          content: '床前明月光疑是地上霜举头望明月低头思故乡'
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
        default:
          return '';
      }
    }
    return super._renderBlock(blockId, blockConfig, hass, entities);
  }

  _splitPoetryContent(content) {
    // 根据字数自动分行（五言或七言）
    const text = content.replace(/[，。！？；\s]/g, ''); // 移除所有标点符号和空格
    const charCount = text.length;
    
    if (charCount % 5 === 0) {
      // 五言诗
      return this._splitByCount(text, 5);
    } else if (charCount % 7 === 0) {
      // 七言诗
      return this._splitByCount(text, 7);
    } else {
      // 其他格式，每行最多7个字
      return this._splitByCount(text, 7);
    }
  }

  _splitByCount(text, count) {
    const lines = [];
    for (let i = 0; i < text.length; i += count) {
      lines.push(text.substring(i, i + count));
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
      small: { title: '1.1em', content: '0.9em', author: '0.8em' },
      medium: { title: '1.3em', content: '1.1em', author: '0.9em' },
      large: { title: '1.5em', content: '1.3em', author: '1em' }
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
        font-family: 'Noto Serif SC', serif;
        margin: 0;
        padding: 0;
      }
      
      .poetry-title {
        font-size: ${selectedSize.title};
        font-weight: bold;
        line-height: 1.3;
        margin-bottom: 8px;
        color: var(--primary-text-color); /* 使用主题主文字色 */
      }
      
      /* 朝代和作者在同一行显示 */
      .poetry-dynasty-author {
        font-size: ${selectedSize.author};
        opacity: 0.8;
        font-style: italic;
        line-height: 1.3;
        margin-bottom: 12px;
        color: var(--secondary-text-color); /* 使用主题次文字色 */
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
        margin: 0;
        color: var(--primary-text-color); /* 使用主题主文字色 */
      }
      
      .poetry-line {
        margin: 0.1em 0;
        line-height: 1.6;
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default PoetryCard;