// src/cards/poetry-card.js
import { BaseCard } from '../core/base-card.js';

class PoetryCard extends BaseCard {
  getDefaultConfig() {
    return {
      card_type: 'poetry-card',
      theme: 'auto',
      blocks: {
        poetry_title: {
          type: 'text',
          title: '标题',
          content: '静夜思',
          area: 'header',
          style: 'font-size: 1.4em; font-weight: 600; text-align: center; color: var(--cf-primary-color);'
        },
        poetry_dynasty: {
          type: 'text',
          title: '朝代',
          content: '唐',
          area: 'header',
          style: 'font-size: 0.9em; color: var(--cf-text-secondary); padding: 4px 12px; background: rgba(var(--cf-rgb-primary), 0.1); border-radius: var(--cf-radius-sm); border: 1px solid var(--cf-border);'
        },
        poetry_author: {
          type: 'text', 
          title: '作者',
          content: '李白',
          area: 'header',
          style: 'font-size: 1em; color: var(--cf-accent-color); font-weight: 500;'
        },
        poetry_content: {
          type: 'text',
          title: '全文',
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
      },
      // 卡片特定配置默认值
      show_title: true,
      show_dynasty: true,
      show_author: true,
      show_translation: true,
      font_family: '楷体',
      font_size: '中号',
      text_color: '#212121',
      text_align: '居中'
    };
  }

  getManifest() {
    return PoetryCard.manifest;
  }

  // 重写渲染方法，根据配置动态显示/隐藏元素
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    // 创建配置的深拷贝
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    
    // 根据配置动态更新块内容
    this._applyDynamicConfig(dynamicConfig, hass, entities);
    
    return super.render(dynamicConfig, hass, entities);
  }

  _applyDynamicConfig(config, hass, entities) {
    const blocks = config.blocks;
    
    // 从实体获取数据（如果配置了实体）
    if (entities) {
      if (entities.poetry_title && hass?.states[entities.poetry_title]) {
        blocks.poetry_title.content = hass.states[entities.poetry_title].state;
      }
      if (entities.poetry_dynasty && hass?.states[entities.poetry_dynasty]) {
        blocks.poetry_dynasty.content = hass.states[entities.poetry_dynasty].state;
      }
      if (entities.poetry_author && hass?.states[entities.poetry_author]) {
        blocks.poetry_author.content = hass.states[entities.poetry_author].state;
      }
      if (entities.poetry_content && hass?.states[entities.poetry_content]) {
        blocks.poetry_content.content = hass.states[entities.poetry_content].state;
      }
      if (entities.poetry_translation && hass?.states[entities.poetry_translation]) {
        blocks.poetry_translation.content = hass.states[entities.poetry_translation].state;
      }
    }
    
    // 根据显示配置调整样式
    this._applyDisplayConfig(config);
  }

  _applyDisplayConfig(config) {
    const blocks = config.blocks;
    
    // 标题显示/隐藏
    if (!config.show_title) {
      blocks.poetry_title.style += '; display: none;';
    }
    
    // 朝代显示/隐藏
    if (!config.show_dynasty) {
      blocks.poetry_dynasty.style += '; display: none;';
    }
    
    // 作者显示/隐藏
    if (!config.show_author) {
      blocks.poetry_author.style += '; display: none;';
    }
    
    // 译文显示/隐藏
    if (!config.show_translation) {
      blocks.poetry_translation.style += '; display: none;';
    }
    
    // 应用字体
    const fontFamily = this._getFontFamily(config.font_family);
    blocks.poetry_content.style = blocks.poetry_content.style.replace(
      /font-family:[^;]+;/,
      `font-family: ${fontFamily};`
    );
    
    // 应用字体大小
    const fontSize = this._getFontSize(config.font_size);
    blocks.poetry_content.style = blocks.poetry_content.style.replace(
      /font-size:[^;]+;/,
      `font-size: ${fontSize};`
    );
    
    // 应用文字颜色
    if (config.text_color) {
      blocks.poetry_content.style = blocks.poetry_content.style.replace(
        /color:[^;]+;/,
        `color: ${config.text_color};`
      );
      blocks.poetry_title.style = blocks.poetry_title.style.replace(
        /color:[^;]+;/,
        `color: ${config.text_color};`
      );
    }
    
    // 应用对齐方式
    const textAlign = this._getTextAlign(config.text_align);
    blocks.poetry_content.style = blocks.poetry_content.style.replace(
      /text-align:[^;]+;/,
      `text-align: ${textAlign};`
    );
  }

  _getFontFamily(font) {
    const fontMap = {
      '楷体': '"楷体", "STKaiti", "SimKai", serif',
      '宋体': '"宋体", "SimSun", serif',
      '系统默认': 'inherit'
    };
    return fontMap[font] || fontMap['楷体'];
  }

  _getFontSize(size) {
    const sizeMap = {
      '小号': '1em',
      '中号': '1.2em',
      '大号': '1.5em'
    };
    return sizeMap[size] || sizeMap['中号'];
  }

  _getTextAlign(align) {
    const alignMap = {
      '左对齐': 'left',
      '居中': 'center',
      '右对齐': 'right'
    };
    return alignMap[align] || alignMap['居中'];
  }

  static styles(config) {
    return `
      .poetry-card .cardforge-area {
        padding: var(--cf-spacing-lg);
      }
      
      .poetry-card .area-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
      }
      
      .poetry-card .header-row {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        flex-wrap: wrap;
        justify-content: center;
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
        
        .poetry-card .header-row {
          gap: var(--cf-spacing-sm);
          flex-direction: column;
        }
      }
    `;
  }
}

PoetryCard.manifest = {
  id: 'poetry-card',
  name: '诗词卡片',
  description: '显示经典诗词，支持标题、朝代、作者、全文和译文',
  icon: '📜',
  category: '文化',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    show_title: {
      type: 'boolean',
      label: '显示诗词标题',
      default: true
    },
    show_dynasty: {
      type: 'boolean',
      label: '显示诗词朝代',
      default: true
    },
    show_author: {
      type: 'boolean',
      label: '显示诗词作者',
      default: true
    },
    show_translation: {
      type: 'boolean',
      label: '显示诗词译文',
      default: true
    },
    font_family: {
      type: 'select',
      label: '诗词字体',
      options: ['楷体', '宋体', '系统默认'],
      default: '楷体'
    },
    font_size: {
      type: 'select',
      label: '文字大小',
      options: ['小号', '中号', '大号'],
      default: '中号'
    },
    text_color: {
      type: 'color',
      label: '文字颜色',
      default: '#212121'
    },
    text_align: {
      type: 'select',
      label: '对齐方式',
      options: ['左对齐', '居中', '右对齐'],
      default: '居中'
    }
  },
  entity_requirements: {
    poetry_title: {
      name: '诗词标题实体',
      required: false
    },
    poetry_dynasty: {
      name: '诗词朝代实体',
      required: false
    },
    poetry_author: {
      name: '诗词作者实体',
      required: false
    },
    poetry_content: {
      name: '诗词全文实体',
      required: false
    },
    poetry_translation: {
      name: '诗词译文实体',
      required: false
    }
  },
  styles: PoetryCard.styles
};

export { PoetryCard as default, PoetryCard };
export const manifest = PoetryCard.manifest;