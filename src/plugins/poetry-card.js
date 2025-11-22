// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    // 处理实体数据
    const processedEntities = this.processEntities(entities, safeConfig, hass);
    
    console.log('诗词卡片 - 处理后的实体数据:', processedEntities);
    
    // 优先使用实体数据，其次使用默认诗词
    const defaultPoetry = this._getDailyPoetry();
    
    const title = this._getEntityState(processedEntities, 'title') || defaultPoetry.title;
    const dynasty = this._getEntityState(processedEntities, 'dynasty') || defaultPoetry.dynasty;
    const author = this._getEntityState(processedEntities, 'author') || defaultPoetry.author;
    const content = this._getEntityState(processedEntities, 'content') || defaultPoetry.content;
    const translation = this._getEntityState(processedEntities, 'translation') || defaultPoetry.translation;

    console.log('最终显示数据:', { title, dynasty, author, content, translation });

    return this._renderCardContainer(`
      ${this._renderCardHeader(safeConfig, entities)}
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-lg">
        <!-- 标题 -->
        ${safeConfig.show_title && title ? `
          <div class="cardforge-text-large cf-text-center poetry-title">《${title}》</div>
        ` : ''}
        
        <!-- 朝代和作者在同一行 -->
        ${(safeConfig.show_dynasty && dynasty) || (safeConfig.show_author && author) ? `
          <div class="cf-flex cf-flex-center cf-gap-md cf-text-center poetry-meta">
            ${safeConfig.show_dynasty && dynasty ? `<div class="cardforge-text-small poetry-dynasty">${dynasty}</div>` : ''}
            ${safeConfig.show_author && author ? `<div class="cardforge-text-medium poetry-author">${author}</div>` : ''}
          </div>
        ` : ''}
        
        <!-- 诗词内容 -->
        ${content ? `
          <div class="cardforge-text-large cf-text-center poetry-content" style="line-height: 1.8;">
            ${content.split('，').join('，<br>').split('。').join('。<br>')}
          </div>
        ` : ''}
        
        <!-- 译文 -->
        ${safeConfig.show_translation && translation ? `
          <div class="cf-mt-lg cf-p-md poetry-translation-container">
            <div class="cardforge-text-small cf-text-center poetry-translation-title">译文</div>
            <div class="cardforge-text-medium cf-text-center poetry-translation">${translation}</div>
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

  _getEntityState(processedEntities, key) {
    if (!processedEntities.entities || !processedEntities.entities[key]) {
      return null;
    }
    
    const entityData = processedEntities.entities[key];
    console.log(`实体 ${key} 数据:`, entityData);
    return entityData.state || null;
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