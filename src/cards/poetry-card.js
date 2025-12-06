// cards/poetry-card.js - 重构版
import { escapeHtml, formatPoetryContent, getEntityState } from '../core/card-tools.js';
import { createCardStyles } from '../core/card-styles.js';

export const card = {
  id: 'poetry',
  meta: {
    name: '诗词',
    description: '显示经典诗词，支持标题、朝代、作者、全文、译文',
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
      defaultName: '诗词全文',
      defaultIcon: 'mdi:format-quote-close',
      required: true
    },
    poetry_translation: {
      defaultName: '诗词译文',
      defaultIcon: 'mdi:translate',
      required: false
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
    showTranslation: {
      type: 'boolean',
      label: '显示译文',
      default: true
    }
  },
  
  template: (config, data) => {
    const blocks = config.blocks || {};
    const defaultPoetry = getDefaultPoetry();
    
    // 提取块内容
    const title = _getBlockContent(blocks, 'poetry_title', defaultPoetry.title);
    const dynasty = _getBlockContent(blocks, 'poetry_dynasty', defaultPoetry.dynasty);
    const author = _getBlockContent(blocks, 'poetry_author', defaultPoetry.author);
    const content = _getBlockContent(blocks, 'poetry_content', defaultPoetry.content);
    const translation = config.showTranslation ? 
      _getBlockContent(blocks, 'poetry_translation', defaultPoetry.translation) : '';
    
    // 如果没有任何内容，显示空状态
    if (!title && !content) {
      return `
        <div class="poetry-card card-empty">
          <div class="card-empty-icon">📜</div>
          <div class="card-empty-text">诗词卡片需要配置内容</div>
        </div>
      `;
    }
    
    const formattedContent = content ? formatPoetryContent(content) : '';
    const formattedTranslation = translation ? formatPoetryContent(translation) : '';
    
    return `
      <div class="poetry-card font-${config.fontSize}">
        <div class="card-content layout-center">
          ${title ? `<div class="poetry-title card-emphasis">${escapeHtml(title)}</div>` : ''}
          
          ${(dynasty || author) ? `
            <div class="poetry-meta layout-horizontal">
              ${dynasty ? `<span class="meta-item dynasty">${escapeHtml(dynasty)}</span>` : ''}
              ${dynasty && author ? `<span class="separator">·</span>` : ''}
              ${author ? `<span class="meta-item author">${escapeHtml(author)}</span>` : ''}
            </div>
          ` : ''}
          
          ${formattedContent ? `
            <div class="poetry-divider"></div>
            <div class="poetry-content">${formattedContent}</div>
          ` : ''}
          
          ${formattedTranslation ? `
            <div class="translation-divider"></div>
            <div class="translation-container">
              <div class="translation-label">译文</div>
              <div class="translation-content">${formattedTranslation}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    function _getBlockContent(blocks, blockId, defaultValue = '') {
      const blockEntry = Object.entries(blocks).find(([id, block]) => 
        block.presetKey === blockId
      );
      
      if (blockEntry) {
        const [_, block] = blockEntry;
        if (block.entity) {
          return getEntityState(data.hass, block.entity, defaultValue);
        }
        return defaultValue;
      }
      
      return defaultValue;
    }
    
    function getDefaultPoetry() {
      return {
        title: '静夜思',
        dynasty: '唐',
        author: '李白',
        content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
        translation: '明亮的月光洒在床前的窗户纸上，好像地上泛起了一层白霜。我抬起头来，看那天窗外空中的明月，不由得低头沉思，想起远方的家乡。'
      };
    }
  },
  
  styles: (config, theme) => {
    // 只保留诗词卡片特有的样式
    const customStyles = `
    .poetry-card {
      min-height: 240px;
      font-family: 'ZCOOL XiaoWei', 'Ma Shan Zheng', 'Noto Serif SC', var(--cf-font-family-base, serif);
      background: var(--cf-surface);
      border-radius: var(--cf-radius-lg);
      box-shadow: var(--cf-shadow-sm);
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
      margin-bottom: var(--cf-spacing-xs);
      text-shadow: 0 1px 2px rgba(var(--cf-primary-color-rgb), 0.1);
    }
    
    /* 元信息样式 */
    .poetry-meta {
      margin-bottom: var(--cf-spacing-sm);
      flex-wrap: wrap;
    }
    
    .meta-item {
      color: var(--cf-accent-color);
    }
    
    .separator {
      color: var(--cf-border);
      font-weight: var(--cf-font-weight-light);
    }
    
    /* 分隔线 */
    .poetry-divider,
    .translation-divider {
      width: 60px;
      height: 1px;
      background: var(--cf-border);
      margin: var(--cf-spacing-sm) 0;
      opacity: 0.5;
    }
    
    /* 诗词内容 */
    .poetry-content {
      width: 100%;
      max-width: 600px;
      margin-top: var(--cf-spacing-xs);
    }
    
    .poetry-line {
      font-size: 1.2em;
      line-height: 2.0;
      color: var(--cf-text-primary);
      margin-bottom: var(--cf-spacing-xs);
    }
    
    /* 译文区域 */
    .translation-container {
      width: 100%;
      max-width: 600px;
      padding: var(--cf-spacing-md);
      background: rgba(var(--cf-accent-color-rgb), 0.05);
      border-radius: var(--cf-radius-md);
      border-left: 3px solid var(--cf-accent-color);
    }
    
    .translation-label {
      font-weight: var(--cf-font-weight-semibold);
      color: var(--cf-accent-color);
      margin-bottom: var(--cf-spacing-sm);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .translation-content {
      line-height: var(--cf-line-height-relaxed);
      color: var(--cf-text-secondary);
      font-style: normal;
    }
    
    /* 诗词卡片特定的响应式 - 只保留尺寸调整 */
    @container cardforge-container (max-width: 600px) {
      .poetry-card {
        min-height: 200px;
      }
      
      .poetry-title {
        font-size: 1.6em;
        margin-bottom: 0;
      }
      
      .poetry-content,
      .translation-container {
        max-width: 100%;
      }
      
      .translation-container {
        padding: var(--cf-spacing-sm);
      }
      
      .poetry-divider,
      .translation-divider {
        margin: var(--cf-spacing-xs) 0;
      }
    }
    
    @container cardforge-container (max-width: 480px) {
      .poetry-card {
        min-height: 180px;
      }
      
      .poetry-title {
        font-size: 1.4em;
      }
      
      .poetry-meta {
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .poetry-line {
        font-size: 1.1em;
        line-height: 1.8;
      }
      
      .poetry-divider,
      .translation-divider {
        width: 40px;
        margin: var(--cf-spacing-xs) 0;
      }
    }
    
    @container cardforge-container (max-width: 360px) {
      .poetry-card {
        min-height: 160px;
      }
      
      .poetry-title {
        font-size: 1.3em;
      }
      
      .poetry-card.font-small .poetry-title {
        font-size: 1.2em;
      }
      
      .poetry-card.font-large .poetry-title {
        font-size: 1.5em;
      }
      
      .poetry-line {
        font-size: 1em;
      }
      
      .translation-label {
        font-size: 0.8em;
      }
      
      .translation-content {
        font-size: 0.9em;
      }
      
      .poetry-divider,
      .translation-divider {
        width: 30px;
      }
    }
  `;
    
    // 使用通用样式工具
    return createCardStyles(customStyles);
  }
};