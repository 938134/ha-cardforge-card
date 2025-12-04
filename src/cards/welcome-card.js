// welcome-card.js - 每日一言部分优化
export const card = {
  id: 'welcome',
  meta: {
    name: '欢迎',
    description: '个性化欢迎信息',
    icon: '👋',
    category: '信息'
  },
  
  schema: {
    use24Hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    greetingName: {
      type: 'text',
      label: '自定义称呼',
      placeholder: '例如：小明'
    },
    showQuote: {
      type: 'boolean',
      label: '显示每日一言',
      default: true
    },
    greetingSize: {
      type: 'select',
      label: '欢迎语大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    },
    quoteAlignment: {
      type: 'select',
      label: '名言对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'left'
    }
  },
  
  blockType: 'preset',
  presetBlocks: {
    daily_quote: {
      defaultName: '每日一言',
      defaultIcon: 'mdi:format-quote-close',
      required: false,
      description: '关联一个文本传感器实体显示每日名言'
    }
  },
  
  template: (config, data) => {
    const now = new Date();
    const hour = now.getHours();
    const userName = config.greetingName || data.hass?.user?.name || '朋友';
    
    // 问候语
    let greeting = '';
    if (hour >= 5 && hour < 12) greeting = '早上好';
    else if (hour >= 12 && hour < 14) greeting = '中午好';
    else if (hour >= 14 && hour < 18) greeting = '下午好';
    else if (hour >= 18 && hour < 22) greeting = '晚上好';
    else greeting = '夜深了';
    
    greeting += `，${userName}！`;
    
    // 时间显示
    let timeStr = '';
    if (config.use24Hour) {
      timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                now.getMinutes().toString().padStart(2, '0');
    } else {
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      timeStr = hours + ':' + 
                now.getMinutes().toString().padStart(2, '0') + 
                ' ' + ampm;
    }
    
    // 获取每日一言
    let quoteHtml = '';
    if (config.showQuote) {
      let quoteContent = '';
      let quoteIcon = 'mdi:format-quote-close'; // 默认图标
      let hasEntity = false;
      
      const blocks = config.blocks || {};
      
      // 查找每日一言块
      Object.values(blocks).forEach(block => {
        if (block.presetKey === 'daily_quote') {
          if (block.icon) {
            quoteIcon = block.icon;
          }
          
          if (block.entity && data.hass?.states?.[block.entity]) {
            hasEntity = true;
            const entity = data.hass.states[block.entity];
            quoteContent = entity.state || getDefaultQuote(now);
            
            // 如果实体有自定义图标属性，优先使用
            if (entity.attributes && entity.attributes.icon) {
              quoteIcon = entity.attributes.icon;
            }
          }
        }
      });
      
      // 如果没有关联实体，使用默认名言
      if (!hasEntity) {
        quoteContent = getDefaultQuote(now);
      }
      
      if (quoteContent) {
        quoteHtml = `
          <div class="quote-container align-${config.quoteAlignment} ${hasEntity ? 'has-entity' : ''}">
            <div class="quote-icon">
              <ha-icon icon="${quoteIcon}"></ha-icon>
            </div>
            <div class="quote-content">${escapeHtml(quoteContent)}</div>
          </div>
        `;
      }
    }
    
    return `
      <div class="welcome-card size-${config.greetingSize}">
        <div class="greeting">${escapeHtml(greeting)}</div>
        <div class="time">${timeStr}</div>
        ${quoteHtml}
      </div>
    `;
    
    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    
    function getDefaultQuote(date) {
      const quotes = [
        "生活就像一盒巧克力，你永远不知道下一颗是什么味道。",
        "成功的秘诀在于对目标的坚持。",
        "时间就像海绵里的水，只要愿挤，总还是有的。",
        "不忘初心，方得始终。",
        "学习如逆水行舟，不进则退。"
      ];
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      return quotes[dayOfYear % quotes.length];
    }
  },
  
  styles: (config, theme) => {
    // 直接从design-system中获取变量
    const primaryColor = theme['--cf-primary-color'] || 'var(--cf-primary-color)';
    const accentColor = theme['--cf-accent-color'] || 'var(--cf-accent-color)';
    const textPrimary = theme['--cf-text-primary'] || 'var(--cf-text-primary)';
    const textSecondary = theme['--cf-text-secondary'] || 'var(--cf-text-secondary)';
    const textTertiary = theme['--cf-text-tertiary'] || 'var(--cf-text-tertiary)';
    const surfaceColor = theme['--cf-surface'] || 'var(--cf-surface)';
    const surfaceElevated = theme['--cf-surface-elevated'] || 'var(--cf-surface-elevated)';
    const borderColor = theme['--cf-border'] || 'var(--cf-border)';
    const borderLight = theme['--cf-border-light'] || 'var(--cf-border-light)';
    const hoverColor = theme['--cf-hover-color'] || 'var(--cf-hover-color)';
    const primaryColorRgb = theme['--cf-primary-color-rgb'] || 'var(--cf-primary-color-rgb, 3, 169, 244)';
    
    // 根据尺寸计算字体大小
    let greetingFontSize = '1.8em';
    let timeFontSize = '3.5em';
    let quoteFontSize = '1.1em';
    
    if (config.greetingSize === 'small') {
      greetingFontSize = '1.6em';
      timeFontSize = '3em';
      quoteFontSize = '1em';
    } else if (config.greetingSize === 'large') {
      greetingFontSize = '2.2em';
      timeFontSize = '4em';
      quoteFontSize = '1.2em';
    }
    
    return `
      .welcome-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 220px;
        padding: var(--cf-spacing-xl);
        text-align: center;
        font-family: var(--cf-font-family-base);
        gap: var(--cf-spacing-lg);
      }
      
      .greeting {
        font-size: ${greetingFontSize};
        font-weight: var(--cf-font-weight-medium);
        color: ${textPrimary};
        line-height: var(--cf-line-height-tight);
        margin-bottom: var(--cf-spacing-xs);
        animation: fadeInDown var(--cf-transition-slow) ease;
      }
      
      .time {
        font-size: ${timeFontSize};
        font-weight: var(--cf-font-weight-bold);
        color: ${primaryColor};
        letter-spacing: 1px;
        line-height: var(--cf-line-height-tight);
        margin-bottom: var(--cf-spacing-lg);
        text-shadow: 0 2px 8px rgba(${primaryColorRgb}, 0.2);
        animation: scaleIn var(--cf-transition-slow) ease 0.1s both;
      }
      
      /* 每日一言容器 */
      .quote-container {
        width: 100%;
        max-width: 500px;
        margin-top: var(--cf-spacing-md);
        padding: var(--cf-spacing-lg);
        background: ${surfaceElevated};
        border: 1px solid ${borderColor};
        border-left: 3px solid ${accentColor};
        border-radius: var(--cf-radius-lg);
        display: flex;
        align-items: flex-start;
        gap: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
        box-shadow: var(--cf-shadow-sm);
        animation: fadeInUp var(--cf-transition-slow) ease 0.2s both;
      }
      
      /* 对齐方式 */
      .quote-container.align-left {
        text-align: left;
      }
      
      .quote-container.align-center {
        text-align: center;
        justify-content: center;
      }
      
      .quote-container.align-right {
        text-align: right;
        justify-content: flex-end;
      }
      
      .quote-container.align-center .quote-content {
        text-align: center;
      }
      
      .quote-container.align-right .quote-content {
        text-align: right;
      }
      
      /* 图标区域 */
      .quote-icon {
        flex-shrink: 0;
        width: var(--cf-spacing-xl);
        height: var(--cf-spacing-xl);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: rgba(${primaryColorRgb}, 0.1);
        color: ${primaryColor};
        font-size: 1.2em;
        transition: all var(--cf-transition-fast);
      }
      
      .quote-container.has-entity .quote-icon {
        background: rgba(${primaryColorRgb}, 0.15);
        color: ${accentColor};
      }
      
      /* 内容区域 */
      .quote-content {
        flex: 1;
        min-width: 0;
        font-size: ${quoteFontSize};
        color: ${textSecondary};
        line-height: var(--cf-line-height-relaxed);
        font-style: italic;
        font-weight: var(--cf-font-weight-light);
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        text-align: left; /* 默认左对齐，由容器控制最终对齐 */
      }
      
      /* 交互效果 */
      .quote-container:hover {
        background: ${hoverColor};
        border-color: ${primaryColor};
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .quote-container:hover .quote-icon {
        transform: scale(1.1);
        background: rgba(${primaryColorRgb}, 0.2);
      }
      
      .quote-container:active {
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .time {
          text-shadow: 0 2px 12px rgba(${primaryColorRgb}, 0.4);
        }
        
        .quote-container {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--cf-border-dark, ${borderColor});
        }
        
        .quote-icon {
          background: rgba(${primaryColorRgb}, 0.2);
        }
        
        .quote-container.has-entity .quote-icon {
          background: rgba(${primaryColorRgb}, 0.25);
        }
        
        .quote-content {
          color: ${textTertiary};
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
          gap: var(--cf-spacing-md);
        }
        
        .quote-container {
          max-width: 450px;
          padding: var(--cf-spacing-md);
          gap: var(--cf-spacing-sm);
        }
        
        .welcome-card.size-medium .greeting {
          font-size: 1.6em;
        }
        
        .welcome-card.size-medium .time {
          font-size: 3em;
        }
        
        .welcome-card.size-large .greeting {
          font-size: 1.8em;
        }
        
        .welcome-card.size-large .time {
          font-size: 3.5em;
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .welcome-card {
          padding: var(--cf-spacing-md);
          min-height: 180px;
        }
        
        .quote-container {
          max-width: 100%;
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-xs);
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .quote-container.align-left,
        .quote-container.align-right {
          align-items: center;
          text-align: center;
        }
        
        .quote-icon {
          width: var(--cf-spacing-lg);
          height: var(--cf-spacing-lg);
          font-size: 1em;
          margin-bottom: var(--cf-spacing-xs);
        }
        
        .quote-content {
          text-align: center !important;
          font-size: 1em;
        }
        
        .welcome-card.size-medium .greeting {
          font-size: 1.4em;
        }
        
        .welcome-card.size-medium .time {
          font-size: 2.5em;
        }
        
        .welcome-card.size-large .greeting {
          font-size: 1.6em;
        }
        
        .welcome-card.size-large .time {
          font-size: 3em;
        }
        
        .welcome-card.size-small .greeting {
          font-size: 1.3em;
        }
        
        .welcome-card.size-small .time {
          font-size: 2.2em;
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .welcome-card {
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }
        
        .quote-container {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        }
        
        .quote-content {
          font-size: 0.95em;
          line-height: var(--cf-line-height-normal);
        }
      }
      
      /* 动画效果 */
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* 高对比度模式支持 */
      .high-contrast .quote-container {
        border-width: 2px;
        border-left-width: 4px;
      }
      
      .high-contrast .quote-icon {
        border: 1px solid ${primaryColor};
      }
    `;
  }
};