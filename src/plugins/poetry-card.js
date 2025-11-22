// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    // 直接获取实体数据
    const defaultPoetry = this._getDailyPoetry();
    
    // 优雅地获取数据：实体数据 > 默认数据
    const title = this._getEntityState(entities, hass, 'title', defaultPoetry.title);
    const dynasty = this._getEntityState(entities, hass, 'dynasty', defaultPoetry.dynasty);
    const author = this._getEntityState(entities, hass, 'author', defaultPoetry.author);
    const content = this._getEntityState(entities, hass, 'content', defaultPoetry.content);
    const translation = this._getEntityState(entities, hass, 'translation', defaultPoetry.translation);

    // 清理实体值
    const displayTitle = this._cleanEntityValue(title);
    const displayDynasty = this._cleanEntityValue(dynasty);
    const displayAuthor = this._cleanEntityValue(author);
    const displayContent = this._cleanEntityValue(content);
    const displayTranslation = this._cleanEntityValue(translation);

    return this._renderCardContainer(`
      <!-- 修复：卡片标题区域使用配置的标题，而不是实体标题 -->
      ${this._renderCardHeader(safeConfig, entities)}
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-lg">
        <!-- 诗词标题 - 在内容区域显示 -->
        ${safeConfig.show_title && displayTitle ? `
          <div class="cardforge-text-large cf-text-center poetry-title">${displayTitle}</div>
        ` : ''}
        
        <!-- 朝代和作者在同一行 -->
        ${(safeConfig.show_dynasty && displayDynasty) || (safeConfig.show_author && displayAuthor) ? `
          <div class="cf-flex cf-flex-center cf-gap-md cf-text-center poetry-meta">
            ${safeConfig.show_dynasty && displayDynasty ? `<div class="cardforge-text-small poetry-dynasty">${displayDynasty}</div>` : ''}
            ${safeConfig.show_author && displayAuthor ? `<div class="cardforge-text-medium poetry-author">${displayAuthor}</div>` : ''}
          </div>
        ` : ''}
        
        <!-- 诗词内容 - 按句子数量智能换行 -->
        ${displayContent ? `
          <div class="cardforge-text-large cf-text-center poetry-content" style="line-height: 1.8;">
            ${this._formatPoetryContent(displayContent)}
          </div>
        ` : ''}
        
        <!-- 译文 -->
        ${safeConfig.show_translation && displayTranslation ? `
          <div class="cf-mt-lg cf-p-md poetry-translation-container">
            <div class="cardforge-text-small cf-text-center poetry-translation-title">译文</div>
            <div class="cardforge-text-medium cf-text-center poetry-translation">${displayTranslation}</div>
          </div>
        ` : ''}
      </div>
      
      ${this._renderCardFooter(safeConfig, entities)}
    `, 'poetry-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .poetry-card {
        font-family: "楷体", "STKaiti", serif;
      }
      
      .poetry-title {
        font-weight: 600;
        color: var(--cf-primary-color);
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .poetry-meta {
        margin-bottom: var(--cf-spacing-lg);
        align-items: center;
      }
      
      .poetry-dynasty {
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-xs) var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-radius: var(--cf-radius-sm);
        border: 1px solid var(--cf-border);
      }
      
      .poetry-author {
        color: var(--cf-accent-color);
        font-weight: 500;
        padding: var(--cf-spacing-xs) var(--cf-spacing-md);
      }
      
      .poetry-content {
        font-weight: 400;
        color: var(--cf-text-primary);
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        font-size: 1.1em;
        line-height: 1.5; 
      }
      
      .poetry-translation-container {
        border-top: 1px solid var(--cf-border);
        margin-top: var(--cf-spacing-lg);
        padding-top: var(--cf-spacing-md);
      }
      
      .poetry-translation-title {
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-sm);
        font-style: italic;
      }
      
      .poetry-translation {
        color: var(--cf-text-primary);
        line-height: 1.6;
        font-family: system-ui, sans-serif;
      }
      
      @container cardforge-container (max-width: 400px) {
        .poetry-content {
          font-size: 1.2em;
        }
        
        .poetry-meta {
          gap: var(--cf-spacing-sm);
        }
        
        .poetry-dynasty,
        .poetry-author {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
          font-size: 0.9em;
        }
      }
    `;
  }

_formatPoetryContent(content) {
  if (!content) return '';
  
  // 按完整句子分割（句号、叹号、问号）
  const fullSentences = content.split(/([。！？\.!?])/);
  const sentenceCount = fullSentences.filter(s => /[。！？\.!?]/.test(s)).length;
  
  let result = content;
  
  if (sentenceCount <= 10) {
    // 8句以内的诗：只处理逗号换行
    result = result
      .replace(/，/g, '，<br>')
      .replace(/,/g, ',<br>');
  } else {
    // 8句以上的诗：按完整句子换行
    result = result
      .replace(/([。！？\.!?])/g, '$1<br><br>');
  }
  
  return result;
}

  // 修复：实体值清理
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