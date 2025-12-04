// 诗词卡片
export const card = {
  id: 'poetry',
  meta: {
    name: '诗词',
    description: '显示经典诗词',
    icon: '📜',
    category: '文化'
  },
  
  blockType: 'preset',
  presetBlocks: {
    poetry_title: {
      defaultName: '诗词标题',
      defaultIcon: 'mdi:format-title',
      required: true
    },
    poetry_dynasty: {
      defaultName: '朝代',
      defaultIcon: 'mdi:calendar-clock',
      required: false
    },
    poetry_author: {
      defaultName: '作者',
      defaultIcon: 'mdi:account',
      required: false
    },
    poetry_content: {
      defaultName: '诗词内容',
      defaultIcon: 'mdi:format-quote-close',
      required: true
    }
  },
  
  schema: {
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
  
  template: (config, data) => {
    const blocks = config.blocks || {};
    
    if (Object.keys(blocks).length === 0) {
      return `
        <div class="poetry-card">
          <div class="poetry-empty">
            <div class="empty-icon">📜</div>
            <div class="empty-text">诗词卡片需要配置内容</div>
          </div>
        </div>
      `;
    }
    
    // 提取块内容
    const title = _getBlockContent(blocks, 'poetry_title', '');
    const dynasty = _getBlockContent(blocks, 'poetry_dynasty', '');
    const author = _getBlockContent(blocks, 'poetry_author', '');
    const content = _getBlockContent(blocks, 'poetry_content', '');
    
    return `
      <div class="poetry-card font-${config.fontSize}">
        ${title ? `<div class="poetry-title">${escapeHtml(title)}</div>` : ''}
        ${(dynasty || author) ? `
          <div class="poetry-meta">
            ${dynasty ? `<span class="dynasty">${escapeHtml(dynasty)}</span>` : ''}
            ${dynasty && author ? `<span class="separator">·</span>` : ''}
            ${author ? `<span class="author">${escapeHtml(author)}</span>` : ''}
          </div>
        ` : ''}
        ${content ? `<div class="poetry-content">${formatPoetryContent(content)}</div>` : ''}
      </div>
    `;
    
    function _getBlockContent(blocks, blockId, defaultValue = '') {
      const blockEntry = Object.entries(blocks).find(([id, block]) => 
        block.presetKey === blockId
      );
      
      if (blockEntry) {
        const [_, block] = blockEntry;
        if (block.entity && data.hass?.states?.[block.entity]) {
          const entity = data.hass.states[block.entity];
          return entity.state || defaultValue;
        }
        return defaultValue;
      }
      
      return defaultValue;
    }
    
    function formatPoetryContent(content) {
      if (!content) return '';
      const sentences = content.split(/([。！？])/);
      let result = '';
      let currentSentence = '';
      
      for (let i = 0; i < sentences.length; i++) {
        const segment = sentences[i];
        if (segment) {
          currentSentence += segment;
          if (/[。！？]/.test(segment)) {
            result += `<div class="poetry-line">${escapeHtml(currentSentence)}</div>`;
            currentSentence = '';
          }
        }
      }
      
      if (currentSentence) {
        result += `<div class="poetry-line">${escapeHtml(currentSentence)}</div>`;
      }
      
      return result;
    }
    
    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    
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
      
      .poetry-card.font-small { font-size: 0.9em; }
      .poetry-card.font-medium { font-size: 1em; }
      .poetry-card.font-large { font-size: 1.1em; }
      
      .poetry-title {
        font-size: 1.8em;
        font-weight: 600;
        color: ${primaryColor};
        margin-bottom: 12px;
        line-height: 1.3;
      }
      
      .poetry-meta {
        font-size: 0.95em;
        color: var(--cf-text-secondary);
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .poetry-content {
        width: 100%;
        max-width: 600px;
      }
      
      .poetry-line {
        font-size: 1.2em;
        line-height: 2.0;
        color: var(--cf-text-primary);
        margin-bottom: 4px;
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
    `;
  }
};
