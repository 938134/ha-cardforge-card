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
  
  // 预设块类型
  blockType: 'preset',
  
  // 5个预设块定义
  presetBlocks: {
    poetry_title: {
      defaultName: '诗词标题',
      defaultIcon: 'mdi:format-title',
      area: 'header',
      required: true,
      description: '诗词标题，如《静夜思》'
    },
    poetry_dynasty: {
      defaultName: '朝代',
      defaultIcon: 'mdi:calendar-clock',
      area: 'content',
      required: false,
      description: '诗词创作朝代，如"唐"'
    },
    poetry_author: {
      defaultName: '作者',
      defaultIcon: 'mdi:account',
      area: 'content',
      required: false,
      description: '诗词作者，如"李白"'
    },
    poetry_content: {
      defaultName: '诗词内容',
      defaultIcon: 'mdi:format-quote-close',
      area: 'content',
      required: true,
      description: '诗词正文内容'
    },
    poetry_translation: {
      defaultName: '诗词译文',
      defaultIcon: 'mdi:translate',
      area: 'footer',
      required: false,
      description: '诗词翻译为现代文'
    }
  },
  
  // 区域配置
  layout: {
    areas: [
      { id: 'header', label: '标题区', maxBlocks: 1 },
      { id: 'content', label: '内容区', maxBlocks: 5 },
      { id: 'footer', label: '译文区', maxBlocks: 1 }
    ]
  },
  
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
  
  template: (config, data, context) => {
    const blocks = config.blocks || {};
    
    // 如果没有块，显示空状态
    if (Object.keys(blocks).length === 0) {
      return `
        <div class="poetry-card">
          <div class="poetry-empty">
            <div class="empty-icon">📜</div>
            <div class="empty-text">诗词卡片需要配置内容</div>
            <div class="empty-hint">请在编辑器中为预设块关联实体</div>
          </div>
        </div>
      `;
    }
    
    // 提取块内容
    const title = _getBlockContent(blocks, 'poetry_title', '');
    const dynasty = _getBlockContent(blocks, 'poetry_dynasty', '');
    const author = _getBlockContent(blocks, 'poetry_author', '');
    const content = _getBlockContent(blocks, 'poetry_content', '');
    const translation = config.showTranslation 
      ? _getBlockContent(blocks, 'poetry_translation', '')
      : '';
    
    // 格式化诗词内容
    const formattedContent = _formatPoetryContent(content);
    
    return `
      <div class="poetry-card font-${config.fontSize}">
        ${title ? `<div class="poetry-title">${_escapeHtml(title)}</div>` : ''}
        ${(dynasty || author) ? `
          <div class="poetry-meta">
            ${dynasty ? `<span class="dynasty">${_escapeHtml(dynasty)}</span>` : ''}
            ${dynasty && author ? `<span class="separator">·</span>` : ''}
            ${author ? `<span class="author">${_escapeHtml(author)}</span>` : ''}
          </div>
        ` : ''}
        ${content ? `<div class="poetry-content">${formattedContent}</div>` : ''}
        ${translation ? `
          <div class="translation-section">
            <div class="translation-divider"></div>
            <div class="translation-content">${_escapeHtml(translation)}</div>
          </div>
        ` : ''}
      </div>
    `;
    
    // 辅助函数
    function _getBlockContent(blocks, blockId, defaultValue = '') {
      // 查找指定类型的块
      const blockEntry = Object.entries(blocks).find(([id, block]) => 
        block.presetKey === blockId || block.name?.includes(blockId.replace('poetry_', ''))
      );
      
      if (blockEntry) {
        const [_, block] = blockEntry;
        // 如果有实体，从实体获取值
        if (block.entity && data.hass?.states?.[block.entity]) {
          const entity = data.hass.states[block.entity];
          return entity.state || defaultValue;
        }
        // 否则使用默认值
        return defaultValue;
      }
      
      return defaultValue;
    }
    
    function _formatPoetryContent(content) {
      if (!content) return '';
      // 将诗词按句分割
      const sentences = content.split(/[。，；]/).filter(s => s.trim());
      return sentences.map(sentence => 
        `<div class="poetry-line">${_escapeHtml(sentence.trim())}</div>`
      ).join('');
    }
    
    function _escapeHtml(text) {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    const accentColor = theme['--cf-accent-color'] || '#ff4081';
    
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
        text-align: center;
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: 12px;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1em;
      }
      
      .empty-hint {
        font-size: 0.85em;
        opacity: 0.7;
        margin-top: 8px;
      }
      
      /* 字体大小控制 */
      .poetry-card.font-small {
        font-size: 0.9em;
      }
      
      .poetry-card.font-medium {
        font-size: 1em;
      }
      
      .poetry-card.font-large {
        font-size: 1.1em;
      }
      
      /* 标题样式 */
      .poetry-title {
        font-size: 1.8em;
        font-weight: 600;
        color: ${primaryColor};
        margin-bottom: 8px;
        line-height: 1.2;
      }
      
      /* 元信息样式 */
      .poetry-meta {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .dynasty, .author {
        font-style: italic;
      }
      
      .separator {
        opacity: 0.5;
      }
      
      /* 诗词内容样式 */
      .poetry-content {
        width: 100%;
        max-width: 600px;
        margin-bottom: 16px;
      }
      
      .poetry-line {
        font-size: 1.1em;
        line-height: 1.8;
        color: var(--cf-text-primary);
        margin-bottom: 8px;
        font-family: '楷体', 'KaiTi', serif;
      }
      
      /* 译文区域样式 */
      .translation-section {
        width: 100%;
        max-width: 600px;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--cf-border);
      }
      
      .translation-divider {
        width: 60px;
        height: 2px;
        background: ${accentColor};
        margin: 0 auto 16px auto;
        opacity: 0.7;
      }
      
      .translation-content {
        font-size: 0.95em;
        line-height: 1.6;
        color: var(--cf-text-secondary);
        text-align: left;
        padding: 0 10px;
      }
      
      @container cardforge-container (max-width: 400px) {
        .poetry-card {
          padding: 16px;
        }
        
        .poetry-title {
          font-size: 1.5em;
        }
        
        .poetry-line {
          font-size: 1em;
          line-height: 1.6;
        }
        
        .translation-content {
          font-size: 0.9em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .poetry-card {
          padding: 12px;
        }
        
        .poetry-title {
          font-size: 1.3em;
        }
        
        .poetry-meta {
          flex-direction: column;
          gap: 4px;
        }
        
        .separator {
          display: none;
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
