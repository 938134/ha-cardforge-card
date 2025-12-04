// 诗词卡片 - 完全变量化版本
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
    },
    showDivider: {
      type: 'boolean',
      label: '显示分隔线',
      default: true
    },
    alignText: {
      type: 'select',
      label: '文本对齐',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'center'
    }
  },
  
  template: (config, data) => {
    const blocks = config.blocks || {};
    
    if (Object.keys(blocks).length === 0) {
      return `
        <div class="poetry-card empty align-${config.alignText}">
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
    
    const divider = config.showDivider ? '<div class="poetry-divider"></div>' : '';
    
    return `
      <div class="poetry-card font-${config.fontSize} align-${config.alignText}">
        ${title ? `<div class="poetry-title">${escapeHtml(title)}</div>` : ''}
        ${(dynasty || author) ? `
          <div class="poetry-meta">
            ${dynasty ? `<span class="dynasty">${escapeHtml(dynasty)}</span>` : ''}
            ${dynasty && author ? `<span class="separator">·</span>` : ''}
            ${author ? `<span class="author">${escapeHtml(author)}</span>` : ''}
          </div>
        ` : ''}
        ${divider}
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
    // 使用设计系统变量
    const primaryColor = theme['--cf-primary-color'] || 'var(--cf-primary-color, #03a9f4)';
    const accentColor = theme['--cf-accent-color'] || 'var(--cf-accent-color, #ff4081)';
    const textPrimary = theme['--cf-text-primary'] || 'var(--cf-text-primary, #212121)';
    const textSecondary = theme['--cf-text-secondary'] || 'var(--cf-text-secondary, #757575)';
    const textTertiary = theme['--cf-text-tertiary'] || 'var(--cf-text-tertiary, #9e9e9e)';
    const borderColor = theme['--cf-border'] || 'var(--cf-border, #e0e0e0)';
    const surfaceColor = theme['--cf-surface'] || 'var(--cf-surface, #ffffff)';
    
    // 根据字体大小计算
    let titleFontSize = '1.8em';
    let metaFontSize = '0.95em';
    let contentFontSize = '1.2em';
    let lineHeight = '2.0';
    
    if (config.fontSize === 'small') {
      titleFontSize = '1.6em';
      metaFontSize = '0.85em';
      contentFontSize = '1.1em';
      lineHeight = '1.8';
    } else if (config.fontSize === 'large') {
      titleFontSize = '2.2em';
      metaFontSize = '1.1em';
      contentFontSize = '1.4em';
      lineHeight = '2.2';
    }
    
    return `
      .poetry-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 240px;
        padding: var(--cf-spacing-xl, 20px);
        text-align: center;
        font-family: 'ZCOOL XiaoWei', 'Ma Shan Zheng', 'Noto Serif SC', var(--cf-font-family-base, serif);
        background: ${surfaceColor};
        border-radius: var(--cf-radius-lg, 12px);
        box-shadow: var(--cf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      .poetry-card.align-left {
        text-align: left;
        align-items: flex-start;
      }
      
      .poetry-card.align-right {
        text-align: right;
        align-items: flex-end;
      }
      
      .poetry-title {
        font-size: ${titleFontSize};
        font-weight: var(--cf-font-weight-bold, 700);
        color: ${primaryColor};
        margin-bottom: var(--cf-spacing-sm, 8px);
        line-height: var(--cf-line-height-tight, 1.25);
        text-shadow: 0 1px 2px rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.1);
      }
      
      .poetry-meta {
        font-size: ${metaFontSize};
        color: ${textSecondary};
        margin-bottom: var(--cf-spacing-lg, 16px);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-xs, 4px);
        flex-wrap: wrap;
      }
      
      .poetry-card.align-left .poetry-meta {
        justify-content: flex-start;
      }
      
      .poetry-card.align-right .poetry-meta {
        justify-content: flex-end;
      }
      
      .dynasty {
        color: ${accentColor};
        font-weight: var(--cf-font-weight-medium, 500);
      }
      
      .author {
        color: ${textTertiary};
        font-style: italic;
      }
      
      .separator {
        color: ${borderColor};
        font-weight: var(--cf-font-weight-light, 300);
      }
      
      .poetry-divider {
        width: 60px;
        height: 1px;
        background: ${borderColor};
        margin: var(--cf-spacing-lg, 16px) 0;
        opacity: 0.5;
      }
      
      .poetry-card.align-left .poetry-divider {
        margin-left: 0;
        width: 40px;
      }
      
      .poetry-card.align-right .poetry-divider {
        margin-right: 0;
        width: 40px;
      }
      
      .poetry-content {
        width: 100%;
        max-width: 600px;
      }
      
      .poetry-line {
        font-size: ${contentFontSize};
        line-height: ${lineHeight};
        color: ${textPrimary};
        margin-bottom: var(--cf-spacing-xs, 4px);
        animation: fadeInLine 0.6s ease var(--delay, 0s) both;
      }
      
      .poetry-line:nth-child(1) { --delay: 0.1s; }
      .poetry-line:nth-child(2) { --delay: 0.2s; }
      .poetry-line:nth-child(3) { --delay: 0.3s; }
      .poetry-line:nth-child(4) { --delay: 0.4s; }
      .poetry-line:nth-child(5) { --delay: 0.5s; }
      .poetry-line:nth-child(6) { --delay: 0.6s; }
      
      .poetry-empty {
        text-align: center;
        color: ${textTertiary};
        padding: var(--cf-spacing-xl, 20px);
      }
      
      .empty-icon {
        font-size: 3em;
        margin-bottom: var(--cf-spacing-md, 12px);
        opacity: 0.4;
      }
      
      .empty-text {
        font-size: var(--cf-font-size-lg, 1.125rem);
        font-weight: var(--cf-font-weight-medium, 500);
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .poetry-card {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .poetry-title {
          text-shadow: 0 1px 4px rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.2);
        }
        
        .poetry-divider {
          background: rgba(255, 255, 255, 0.2);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .poetry-card {
          padding: var(--cf-spacing-lg, 16px);
          min-height: 200px;
        }
        
        .poetry-card.font-medium .poetry-title {
          font-size: 1.6em;
        }
        
        .poetry-card.font-medium .poetry-content {
          font-size: 1.1em;
        }
        
        .poetry-card.font-large .poetry-title {
          font-size: 1.8em;
        }
        
        .poetry-card.font-large .poetry-content {
          font-size: 1.2em;
        }
        
        .poetry-content {
          max-width: 100%;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .poetry-card {
          padding: var(--cf-spacing-md, 12px);
        }
        
        .poetry-card.font-medium .poetry-title {
          font-size: 1.4em;
        }
        
        .poetry-card.font-medium .poetry-content {
          font-size: 1em;
          line-height: 1.6;
        }
        
        .poetry-card.font-large .poetry-title {
          font-size: 1.6em;
        }
        
        .poetry-card.font-large .poetry-content {
          font-size: 1.1em;
        }
        
        .poetry-card.font-small .poetry-title {
          font-size: 1.3em;
        }
        
        .poetry-card.font-small .poetry-content {
          font-size: 0.95em;
        }
        
        .poetry-meta {
          font-size: 0.8em;
        }
      }
      
      /* 动画效果 */
      @keyframes fadeInLine {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .poetry-card {
        animation: poetryAppear var(--cf-transition-slow, 0.4s) ease;
      }
      
      @keyframes poetryAppear {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
  }
};