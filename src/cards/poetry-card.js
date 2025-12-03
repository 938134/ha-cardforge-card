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
      required: true,
      description: '诗词标题，如《静夜思》'
    },
    poetry_dynasty: {
      defaultName: '朝代',
      defaultIcon: 'mdi:calendar-clock',
      required: false,
      description: '诗词创作朝代，如"唐"'
    },
    poetry_author: {
      defaultName: '作者',
      defaultIcon: 'mdi:account',
      required: false,
      description: '诗词作者，如"李白"'
    },
    poetry_content: {
      defaultName: '诗词内容',
      defaultIcon: 'mdi:format-quote-close',
      required: true,
      description: '诗词正文内容'
    },
    poetry_translation: {
      defaultName: '诗词译文',
      defaultIcon: 'mdi:translate',
      required: false,
      description: '诗词翻译为现代文'
    }
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
    
    // 格式化诗词内容（保留标点符号）
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
      
      // 按句子分割（句号、叹号、问号）
      const sentences = content.split(/([。！？])/);
      let result = '';
      let currentSentence = '';
      
      for (let i = 0; i < sentences.length; i++) {
        const segment = sentences[i];
        if (segment) {
          currentSentence += segment;
          
          // 如果是句子结束符（。！？），则输出整句
          if (/[。！？]/.test(segment)) {
            result += `<div class="poetry-line">${_escapeHtml(currentSentence)}</div>`;
            currentSentence = '';
          }
        }
      }
      
      // 处理最后可能没有结束符的句子
      if (currentSentence) {
        result += `<div class="poetry-line">${_escapeHtml(currentSentence)}</div>`;
      }
      
      return result;
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
        min-height: 220px;
        padding: 24px;
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
        margin-bottom: 12px;
        line-height: 1.3;
        font-family: inherit;
      }
      
      /* 元信息样式 */
      .poetry-meta {
        font-size: 0.95em;
        color: var(--cf-text-secondary);
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: inherit;
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
        margin-bottom: 20px;
      }
      
      .poetry-line {
        font-size: 1.2em;
        line-height: 2.0;
        color: var(--cf-text-primary);
        margin-bottom: 4px;
        font-family: inherit;
        text-align: center;
      }
      
      /* 译文区域样式 */
      .translation-section {
        width: 100%;
        max-width: 600px;
        margin-top: 20px;
        padding-top: 20px;
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
        font-size: 1em;
        line-height: 1.8;
        color: var(--cf-text-secondary);
        text-align: left;
        padding: 0 10px;
        font-family: inherit;
      }
      
      @container cardforge-container (max-width: 500px) {
        .poetry-card {
          padding: 20px;
          min-height: 200px;
        }
        
        .poetry-title {
          font-size: 1.6em;
        }
        
        .poetry-line {
          font-size: 1.1em;
          line-height: 1.8;
        }
        
        .translation-content {
          font-size: 0.95em;
          line-height: 1.6;
        }
      }
      
      @container cardforge-container (max-width: 350px) {
        .poetry-card {
          padding: 16px;
          min-height: 180px;
        }
        
        .poetry-title {
          font-size: 1.4em;
        }
        
        .poetry-meta {
          flex-direction: column;
          gap: 4px;
          margin-bottom: 20px;
        }
        
        .separator {
          display: none;
        }
        
        .poetry-line {
          font-size: 1em;
          line-height: 1.6;
        }
        
        .translation-content {
          font-size: 0.9em;
          line-height: 1.5;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .poetry-title {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .translation-content {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    `;
  }
};

export class PoetryCard {
  static card = card;
}