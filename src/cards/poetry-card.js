// src/cards/poetry-card.js
export const card = {
  id: 'poetry',
  meta: {
    name: '诗词',
    description: '显示经典诗词，支持译文',
    icon: '📜',
    category: '文化',
    version: '2.0.0',
    author: 'CardForge'
  },
  
  cardType: 'content',
  
  schema: {
    showTranslation: {
      type: 'boolean',
      label: '显示译文',
      default: false
    },
    fontSize: {
      type: 'select',
      label: '字体大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    }
  },
  
  blocks: {
    mode: 'preset',
    presets: {
      poetry_title: {
        type: 'text',
        name: '诗词标题',
        content: '静夜思',
        icon: 'mdi:format-title'
      },
      poetry_dynasty: {
        type: 'text',
        name: '朝代',
        content: '唐',
        icon: 'mdi:calendar-clock'
      },
      poetry_author: {
        type: 'text', 
        name: '作者',
        content: '李白',
        icon: 'mdi:account'
      },
      poetry_content: {
        type: 'text',
        name: '诗词内容',
        content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
        icon: 'mdi:format-quote-close'
      },
      poetry_translation: {
        type: 'text',
        name: '诗词译文',
        content: '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。',
        icon: 'mdi:translate'
      }
    }
  },
  
  template: (config, data, context) => {
    const blocks = config.blocks || {};
    
    if (Object.keys(blocks).length === 0 && context.renderBlocks) {
      return `
        <div class="poetry-card">
          <div class="poetry-empty">
            <div class="empty-icon">📜</div>
            <div class="empty-text">诗词卡片需要配置内容</div>
          </div>
        </div>
      `;
    }
    
    const title = this._getBlockContent(blocks, 'poetry_title', '静夜思');
    const dynasty = this._getBlockContent(blocks, 'poetry_dynasty', '唐');
    const author = this._getBlockContent(blocks, 'poetry_author', '李白');
    const content = this._getBlockContent(blocks, 'poetry_content', '床前明月光，疑是地上霜。举头望明月，低头思故乡。');
    const translation = config.showTranslation 
      ? this._getBlockContent(blocks, 'poetry_translation', '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。')
      : '';
    
    const fontSizeClass = `font-${config.fontSize}`;
    
    return `
      <div class="poetry-card ${fontSizeClass}">
        ${title ? `<div class="poetry-title">${this._escapeHtml(title)}</div>` : ''}
        ${(dynasty || author) ? `
          <div class="poetry-meta">
            ${dynasty ? `<span class="dynasty">${this._escapeHtml(dynasty)}</span>` : ''}
            ${dynasty && author ? `<span class="separator">·</span>` : ''}
            ${author ? `<span class="author">${this._escapeHtml(author)}</span>` : ''}
          </div>
        ` : ''}
        ${content ? `<div class="poetry-content">${this._formatPoetryContent(content)}</div>` : ''}
        ${translation ? `
          <div class="translation-section">
            <div class="translation-divider"></div>
            <div class="translation-content">${this._escapeHtml(translation)}</div>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  _getBlockContent(blocks, blockId, defaultValue = '') {
    for (const [id, block] of Object.entries(blocks)) {
      if (id.includes(blockId) || block.type === blockId || block.name?.includes(blockId.replace('_', ''))) {
        return block.content || block.value || defaultValue;
      }
    }
    return defaultValue;
  },
  
  _formatPoetryContent(content) {
    if (!content) return '';
    const sentences = content.split(/[。，；]/).filter(s => s.trim());
    return sentences.map(sentence => 
      `<div class="poetry-line">${this._escapeHtml(sentence.trim())}</div>`
    ).join('');
  },
  
  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  styles: (config, theme) => {
    const fontSizeMap = {
      small: { title: '1.1em', content: '0.9em', meta: '0.8em' },
      medium: { title: '1.3em', content: '1em', meta: '0.9em' },
      large: { title: '1.5em', content: '1.2em', meta: '1em' }
    };
    
    const sizes = fontSizeMap[config.fontSize] || fontSizeMap.medium;
    
    return `
      .poetry-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 200px;
        padding: 20px;
        text-align: center;
      }
      
      .poetry-empty {
        color: var(--cf-text-secondary);
        text-align: center;
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1em;
      }
      
      .poetry-title {
        font-size: ${sizes.title};
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 8px;
      }
      
      .poetry-meta {
        font-size: ${sizes.meta};
        color: var(--cf-text-secondary);
        margin-bottom: 16px;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      
      .separator {
        opacity: 0.5;
      }
      
      .poetry-content {
        font-size: ${sizes.content};
        color: var(--cf-text-primary);
        line-height: 1.8;
        margin-bottom: 20px;
      }
      
      .poetry-line {
        margin-bottom: 8px;
      }
      
      .translation-section {
        margin-top: 16px;
        max-width: 90%;
      }
      
      .translation-divider {
        width: 50px;
        height: 1px;
        background: var(--cf-border);
        margin: 0 auto 16px auto;
        opacity: 0.6;
      }
      
      .translation-content {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        line-height: 1.6;
        font-style: italic;
      }
      
      @container cardforge-container (max-width: 400px) {
        .poetry-card {
          padding: 16px;
        }
        
        .poetry-title {
          font-size: ${parseFloat(sizes.title) * 0.9}em;
        }
        
        .poetry-content {
          font-size: ${parseFloat(sizes.content) * 0.9}em;
        }
      }
    `;
  },
  
  layout: {
    type: 'single',
    recommendedSize: 4
  }
};

export class PoetryCard {
  static card = card;
}