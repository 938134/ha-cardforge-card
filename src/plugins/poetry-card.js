// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    // 直接获取实体数据
    const defaultPoetry = this._getDailyPoetry();
    
    // 优雅地获取数据：实体数据 > 默认数据
    const titleEntity = this._getEntityState(entities, hass, 'title');
    const dynastyEntity = this._getEntityState(entities, hass, 'dynasty');
    const authorEntity = this._getEntityState(entities, hass, 'author');
    const contentEntity = this._getEntityState(entities, hass, 'content');
    const translationEntity = this._getEntityState(entities, hass, 'translation');

    // 修复：只有当实体有实际内容时才使用，否则使用默认值
    const title = titleEntity && titleEntity !== '加载中...' ? titleEntity : defaultPoetry.title;
    const dynasty = dynastyEntity && dynastyEntity !== '加载中...' ? dynastyEntity : defaultPoetry.dynasty;
    const author = authorEntity && authorEntity !== '加载中...' ? authorEntity : defaultPoetry.author;
    const content = contentEntity && contentEntity !== '加载中...' ? contentEntity : defaultPoetry.content;
    const translation = translationEntity && translationEntity !== '加载中...' ? translationEntity : defaultPoetry.translation;

    return this._renderCardContainer(`
      ${this._renderCardHeader(safeConfig, entities)}
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-lg">
        <!-- 标题 - 修复：只有当启用标题且标题有内容时才显示 -->
        ${safeConfig.show_title && title && title !== '加载中...' ? `
          <div class="cardforge-text-large cf-text-center poetry-title">《${title}》</div>
        ` : ''}
        
        <!-- 朝代和作者在同一行 -->
        ${((safeConfig.show_dynasty && dynasty && dynasty !== '加载中...') || (safeConfig.show_author && author && author !== '加载中...')) ? `
          <div class="cf-flex cf-flex-center cf-gap-md cf-text-center poetry-meta">
            ${safeConfig.show_dynasty && dynasty && dynasty !== '加载中...' ? `<div class="cardforge-text-small poetry-dynasty">${dynasty}</div>` : ''}
            ${safeConfig.show_author && author && author !== '加载中...' ? `<div class="cardforge-text-medium poetry-author">${author}</div>` : ''}
          </div>
        ` : ''}
        
        <!-- 诗词内容 - 优化长诗显示 -->
        ${content && content !== '加载中...' ? this._renderPoetryContent(content, safeConfig) : ''}
        
        <!-- 译文 -->
        ${safeConfig.show_translation && translation && translation !== '加载中...' ? `
          <div class="cf-mt-lg cf-p-md poetry-translation-container">
            <div class="cardforge-text-small cf-text-center poetry-translation-title">译文</div>
            <div class="cardforge-text-medium cf-text-center poetry-translation">${this._formatLongText(translation)}</div>
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
        line-height: 1.8;
        max-height: 300px;
        overflow-y: auto;
        padding: var(--cf-spacing-sm);
      }
      
      .poetry-content::-webkit-scrollbar {
        width: 4px;
      }
      
      .poetry-content::-webkit-scrollbar-thumb {
        background: var(--cf-border);
        border-radius: 2px;
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
        max-height: 200px;
        overflow-y: auto;
        padding: var(--cf-spacing-sm);
      }
      
      .poetry-translation::-webkit-scrollbar {
        width: 4px;
      }
      
      .poetry-translation::-webkit-scrollbar-thumb {
        background: var(--cf-border);
        border-radius: 2px;
      }
      
      @container cardforge-container (max-width: 400px) {
        .poetry-content {
          font-size: 1.1em;
          max-height: 250px;
        }
        
        .poetry-meta {
          gap: var(--cf-spacing-sm);
        }
        
        .poetry-dynasty,
        .poetry-author {
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
          font-size: 0.9em;
        }
        
        .poetry-translation {
          max-height: 150px;
          font-size: 0.9em;
        }
      }
    `;
  }

  // 优化长诗内容渲染
  _renderPoetryContent(content, config) {
    // 对内容进行适当的分行处理
    const formattedContent = content
      .replace(/，/g, '，<br>')
      .replace(/。/g, '。<br>')
      .replace(/！/g, '！<br>')
      .replace(/？/g, '？<br>')
      .replace(/；/g, '；<br>')
      .replace(/：/g, '：<br>');

    return `
      <div class="cardforge-text-large cf-text-center poetry-content">
        ${formattedContent}
      </div>
    `;
  }

  // 格式化长文本，添加适当的换行
  _formatLongText(text) {
    if (!text) return '';
    
    // 对长译文进行适当的分段
    const sentences = text.split(/[。！？]/).filter(s => s.trim());
    return sentences.map(sentence => sentence.trim() + '。').join('<br><br>');
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