// cards/poetry-card.js - 简化测试版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { createCardStyles } from '../core/card-styles.js';

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
    poetry_content: {
      defaultName: '诗词全文',
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
  
  template: (config, { hass }) => {
    const defaultPoetry = getDefaultPoetry();
    
    return html`
      <div class="poetry-card font-${config.fontSize}">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            <div class="poetry-title card-emphasis">${defaultPoetry.title}</div>
            
            <div class="poetry-meta layout-horizontal card-spacing-sm">
              <span class="meta-item dynasty">${defaultPoetry.dynasty}</span>
              <span class="separator">·</span>
              <span class="meta-item author">${defaultPoetry.author}</span>
            </div>
            
            <div class="poetry-divider"></div>
            <div class="poetry-content">${defaultPoetry.content}</div>
            
            <div class="translation-divider card-spacing-md"></div>
            <div class="translation-container">
              <div class="translation-label">译文</div>
              <div class="translation-content">${defaultPoetry.translation}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
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
  
  styles: (config) => {
    const customStyles = css`
      .poetry-card {
        min-height: 260px;
        font-family: var(--cf-font-family-base, serif);
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
        margin-bottom: var(--cf-spacing-xs);
        font-size: 1.2em;
        line-height: 2.0;
        color: var(--cf-text-primary);
      }
      
      /* 译文区域 */
      .translation-container {
        width: 100%;
        max-width: 600px;
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-accent-color-rgb), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 3px solid var(--cf-accent-color);
        margin-top: var(--cf-spacing-xs);
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
    `;
    
    return createCardStyles(customStyles);
  }
};
