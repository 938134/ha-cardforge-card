// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

class PoetryCard extends BaseCard {
  getDefaultConfig() {
    return {
      card_type: 'poetry-card',
      theme: 'auto',
      areas: {
        content: {
          layout: 'single'
        }
      },
      blocks: {
        poetry_title: {
          type: 'text',
          title: '',
          content: '静夜思',
          area: 'content',
          style: 'font-size: 1.4em; font-weight: 600; text-align: center; color: var(--cf-primary-color);'
        },
        poetry_author: {
          type: 'text', 
          title: '',
          content: '李白 · 唐',
          area: 'content',
          style: 'text-align: center; color: var(--cf-text-secondary); margin-bottom: 1em;'
        },
        poetry_content: {
          type: 'text',
          title: '',
          content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
          area: 'content',
          style: 'font-family: "楷体", "STKaiti", serif; font-size: 1.2em; line-height: 1.6; text-align: center; white-space: pre-line;'
        },
        poetry_translation: {
          type: 'text',
          title: '译文',
          content: '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。',
          area: 'content',
          style: 'margin-top: 1em; padding-top: 1em; border-top: 1px solid var(--cf-border); font-size: 0.9em; color: var(--cf-text-secondary); line-height: 1.5;'
        }
      }
    };
  }

  getManifest() {
    return PoetryCard.manifest;
  }

  // 诗词卡片特有样式
  static styles(config) {
    return `
      .poetry-card .cardforge-area {
        padding: var(--cf-spacing-lg);
      }
      
      .poetry-card .block-title {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-secondary);
        margin-bottom: 0.5em;
      }
      
      @container cardforge-container (max-width: 400px) {
        .poetry-card .cardforge-area {
          padding: var(--cf-spacing-md);
        }
        
        .poetry-card .block-content {
          font-size: 0.9em;
        }
      }
    `;
  }
}

PoetryCard.manifest = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '显示经典诗词，支持标题、作者、内容和译文',
  icon: '📜',
  category: '文化',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    show_translation: {
      type: 'boolean',
      label: '显示译文',
      default: true
    },
    font_family: {
      type: 'select',
      label: '字体',
      options: ['楷体', '宋体', '系统默认'],
      default: '楷体'
    }
  },
  styles: PoetryCard.styles
};

export { PoetryCard as default, PoetryCard };
export const manifest = PoetryCard.manifest;