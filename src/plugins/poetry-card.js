// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    const defaultPoetry = this._getDailyPoetry();
    
    const title = this._getEntityState(entities, hass, 'title', defaultPoetry.title);
    const dynasty = this._getEntityState(entities, hass, 'dynasty', defaultPoetry.dynasty);
    const author = this._getEntityState(entities, hass, 'author', defaultPoetry.author);
    const content = this._getEntityState(entities, hass, 'content', defaultPoetry.content);
    const translation = this._getEntityState(entities, hass, 'translation', defaultPoetry.translation);

    const displayTitle = this._cleanEntityValue(title);
    const displayDynasty = this._cleanEntityValue(dynasty);
    const displayAuthor = this._cleanEntityValue(author);
    const displayContent = this._cleanEntityValue(content);
    const displayTranslation = this._cleanEntityValue(translation);

    return this._renderCardContainer(`
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-md">
        <!-- 诗词标题 - 调小字体 -->
        ${safeConfig.show_title && displayTitle ? `
          <div class="poetry-title">${displayTitle}</div>
        ` : ''}
        
        <!-- 朝代和作者 - 调小字体 -->
        ${(safeConfig.show_dynasty && displayDynasty) || (safeConfig.show_author && displayAuthor) ? `
          <div class="cf-flex cf-flex-center cf-gap-sm cf-text-center poetry-meta">
            ${safeConfig.show_dynasty && displayDynasty ? `<div class="poetry-dynasty">${displayDynasty}</div>` : ''}
            ${safeConfig.show_author && displayAuthor ? `<div class="poetry-author">${displayAuthor}</div>` : ''}
          </div>
        ` : ''}
        
        <!-- 诗词内容 - 使用CSS控制换行 -->
        ${displayContent ? `
          <div class="poetry-content">
            ${this._formatPoetryContent(displayContent)}
          </div>
        ` : ''}
        
        <!-- 译文 - 调小字体 -->
        ${safeConfig.show_translation && displayTranslation ? `
          <div class="poetry-translation-container">
            <div class="poetry-translation-title">译文</div>
            <div class="poetry-translation">${displayTranslation}</div>
          </div>
        ` : ''}
      </div>
    `, 'poetry-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .poetry-card {
        font-family: "楷体", "STKaiti", "SimKai", serif;
        padding: var(--cf-spacing-md);
      }
      
      /* 标题 - 调小字体 */
      .poetry-title {
        font-size: 1.3em;
        font-weight: 600;
        color: var(--cf-primary-color);
        margin-bottom: var(--cf-spacing-xs);
        text-align: center;
      }
      
      .poetry-meta {
        margin-bottom: var(--cf-spacing-md);
        align-items: center;
      }
      
      /* 朝代 - 调小字体 */
      .poetry-dynasty {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        padding: 4px 8px;
        background: rgba(var(--cf-rgb-primary), 0.08);
        border-radius: var(--cf-radius-sm);
        border: 1px solid var(--cf-border);
      }
      
      /* 作者 - 调小字体 */
      .poetry-author {
        font-size: 0.9em;
        color: var(--cf-accent-color);
        font-weight: 500;
        padding: 4px 8px;
      }
      
      /* 诗词内容 - 调小字体，使用CSS控制换行 */
      .poetry-content {
        font-size: 1em;
        font-weight: 400;
        color: var(--cf-text-primary);
        line-height: 1.8;
        text-align: center;
        margin: var(--cf-spacing-sm) 0;
        
        /* 智能换行控制 */
        white-space: pre-line;
        word-wrap: break-word;
        hyphens: auto;
      }
      
      .poetry-translation-container {
        border-top: 1px solid var(--cf-border);
        margin-top: var(--cf-spacing-md);
        padding-top: var(--cf-spacing-md);
        text-align: center;
      }
      
      /* 译文标题 - 调小字体 */
      .poetry-translation-title {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-sm);
        font-style: italic;
      }
      
      /* 译文内容 - 调小字体 */
      .poetry-translation {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        line-height: 1.6;
        font-family: system-ui, -apple-system, sans-serif;
      }
      
      /* 移动端进一步调小字体 */
      @container cardforge-container (max-width: 400px) {
        .poetry-card {
          padding: var(--cf-spacing-sm);
        }
        
        .poetry-title {
          font-size: 1.2em;
        }
        
        .poetry-content {
          font-size: 0.95em;
          line-height: 1.7;
        }
        
        .poetry-dynasty {
          font-size: 0.8em;
          padding: 3px 6px;
        }
        
        .poetry-author {
          font-size: 0.85em;
          padding: 3px 6px;
        }
        
        .poetry-translation {
          font-size: 0.85em;
        }
      }
      
      /* 超小屏幕 */
      @container cardforge-container (max-width: 300px) {
        .poetry-title {
          font-size: 1.1em;
        }
        
        .poetry-content {
          font-size: 0.9em;
          line-height: 1.6;
        }
        
        .poetry-meta {
          gap: var(--cf-spacing-xs);
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .poetry-content {
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
      }
    `;
  }

  _formatPoetryContent(content) {
    if (!content) return '';
    
    // 简化换行逻辑，主要依靠CSS的 white-space: pre-line
    // 只需要在标点处添加换行，具体显示由CSS控制
    return content
      .replace(/([。！？])/g, '$1\n')    // 完整句子换行
      .replace(/([，])/g, '$1\n');       // 句子内换行
  }

  _cleanEntityValue(text) {
    if (!text) return '';
    
    if (typeof text === 'string') {
      // 纯实体ID：sensor.xxx_xxx
      if (text.includes('.') && /^[a-z]+\.[a-z_]+$/i.test(text)) {
        return '';
      }
      
      // 实体ID + 内容：sensor.xxx《内容》或 sensor.xxx"内容"
      const patterns = [
        /[^《]*《([^》]+)》/,  // 书名号内容
        /[^"]*"([^"]+)"/,    // 双引号内容
        /[^']*'([^']+)'/     // 单引号内容
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    return text;
  }

  _getDailyPoetry() {
    const poetries = [
      {
        content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
        title: "静夜思",
        author: "李白",
        dynasty: "唐",
        translation: "明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。"
      },
      {
        content: "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。",
        title: "春晓", 
        author: "孟浩然",
        dynasty: "唐",
        translation: "春日里贪睡不知不觉天已破晓，搅乱我酣眠的是那啁啾的小鸟。昨天夜里风声雨声一直不断，那娇美的春花不知被吹落了多少？"
      }
    ];
    
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % poetries.length;
    
    return poetries[index];
  }
}

PoetryCard.manifest = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '每日经典诗词欣赏',
  icon: '📜',
  category: '文化',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    show_title: {
      type: 'boolean',
      label: '显示标题',
      default: true
    },
    show_dynasty: {
      type: 'boolean',
      label: '显示朝代',
      default: true
    },
    show_author: {
      type: 'boolean',
      label: '显示作者',
      default: true
    },
    show_translation: {
      type: 'boolean',
      label: '显示译文',
      default: true
    }
  },
  entity_requirements: {
    title: {
      name: '诗词标题',
      required: false
    },
    dynasty: {
      name: '诗词朝代', 
      required: false
    },
    author: {
      name: '诗词作者',
      required: false
    },
    content: {
      name: '诗词内容',
      required: false
    },
    translation: {
      name: '诗词译文',
      required: false
    }
  }
};

export { PoetryCard as default, PoetryCard };
export const manifest = PoetryCard.manifest;