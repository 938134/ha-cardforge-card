// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  static manifest = {
    id: 'poetry-card',
    name: '诗词卡片',
    version: '1.1.0',
    description: '经典诗词展示卡片，支持完整诗词信息',
    category: '文化',
    icon: '📜',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['古典卷轴', '书法墨宝', '文人雅士', '现代简约'],
        default: '古典卷轴'
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '卷轴展开', '毛笔书写'],
        default: '卷轴展开'
      },
      text_alignment: {
        type: 'select',
        label: '文字对齐',
        options: ['左对齐', '居中', '右对齐'],
        default: '居中'
      },
      font_size: {
        type: 'select',
        label: '字体大小',
        options: ['较小', '正常', '较大'],
        default: '正常'
      }
    },
    
    entity_requirements: {
      poetry_title: {
        name: '诗词标题',
        description: '诗词的标题',
        type: 'text',
        required: true,
        default: '',
        example: '静夜思 或 sensor.poetry_title'
      },
      poetry_author: {
        name: '诗词作者',
        description: '诗词的作者',
        type: 'text',
        required: true,
        default: '',
        example: '李白 或 sensor.poetry_author'
      },
      poetry_dynasty: {
        name: '诗词朝代',
        description: '作者所属的朝代',
        type: 'text',
        required: true,
        default: '',
        example: '唐 或 sensor.poetry_dynasty'
      },
      poetry_content: {
        name: '诗词全文',
        description: '诗词的完整内容',
        type: 'text',
        required: true,
        default: '',
        example: '床前明月光... 或 sensor.poetry_content'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const poetryData = this._getPoetryData(hass, entities);
    const cardStyle = config.card_style || '古典卷轴';
    
    const content = this._renderCardContent(cardStyle, poetryData, config);
    return this._renderCardContainer(content, `poetry-card style-${this._getStyleClass(cardStyle)} alignment-${this._getAlignmentClass(config.text_alignment)} font-${this._getFontSizeClass(config.font_size)}`, config);
  }

  _getPoetryData(hass, entities) {
    // 获取诗词数据，支持实体和直接文本
    const getValue = (key) => {
      const value = this._getCardValue(hass, entities, key, '');
      if (value.includes('.') && hass?.states?.[value]) {
        return hass.states[value].state || '';
      }
      return value;
    };

    const title = getValue('poetry_title');
    const author = getValue('poetry_author');
    const dynasty = getValue('poetry_dynasty');
    const content = getValue('poetry_content');

    // 如果没有配置数据，显示示例诗词
    if (!title && !author && !content) {
      return {
        title: '静夜思',
        author: '李白',
        dynasty: '唐',
        content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
        isExample: true
      };
    }

    return {
      title: title || '无题',
      author: author || '未知',
      dynasty: dynasty || '未知',
      content: content || '诗词内容为空',
      isExample: false
    };
  }

  _renderCardContent(style, poetryData, config) {
    const styleClass = this._getStyleClass(style);
    
    const renderers = {
      'scroll': () => this._renderScrollStyle(poetryData, config),
      'calligraphy': () => this._renderCalligraphyStyle(poetryData, config),
      'scholar': () => this._renderScholarStyle(poetryData, config),
      'modern': () => this._renderModernStyle(poetryData, config)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['scroll']();
  }

  /* ===== 古典卷轴风格 ===== */
  _renderScrollStyle(poetryData, config) {
    return `
      <div class="scroll-layout">
        <div class="poetry-header">
          <h1 class="cardforge-title">${poetryData.title}</h1>
          <div class="poetry-meta cardforge-text-small">
            <span class="author">${poetryData.author}</span>
            <span class="dynasty">[${poetryData.dynasty}]</span>
          </div>
        </div>
        <div class="poetry-content cardforge-text-medium">
          ${this._formatPoetryContent(poetryData.content)}
        </div>
      </div>
    `;
  }

  /* ===== 书法墨宝风格 ===== */
  _renderCalligraphyStyle(poetryData, config) {
    return `
      <div class="calligraphy-layout">
        <div class="calligraphy-header">
          <div class="title-section">
            <h1 class="cardforge-title">${poetryData.title}</h1>
            <div class="author-dynasty cardforge-text-small">
              <span class="author">${poetryData.author}</span>
              <span class="dynasty">${poetryData.dynasty}</span>
            </div>
          </div>
        </div>
        <div class="calligraphy-content cardforge-text-medium">
          ${this._formatPoetryContent(poetryData.content, true)}
        </div>
      </div>
    `;
  }

  /* ===== 文人雅士风格 ===== */
  _renderScholarStyle(poetryData, config) {
    return `
      <div class="scholar-layout">
        <div class="scholar-header">
          <div class="cardforge-title">《${poetryData.title}》</div>
          <div class="scholar-meta cardforge-text-small">
            <span class="author">${poetryData.author}</span>
            <span class="dynasty">· ${poetryData.dynasty}</span>
          </div>
        </div>
        <div class="scholar-poetry cardforge-text-medium">
          ${this._formatPoetryContent(poetryData.content)}
        </div>
      </div>
    `;
  }

  /* ===== 现代简约风格 ===== */
  _renderModernStyle(poetryData, config) {
    return `
      <div class="modern-layout">
        <div class="modern-header">
          <div class="cardforge-title">${poetryData.title}</div>
          <div class="modern-meta cardforge-text-small">
            <div class="modern-author">${poetryData.author}</div>
            <div class="modern-dynasty">${poetryData.dynasty}</div>
          </div>
        </div>
        <div class="modern-content">
          <div class="modern-poetry cardforge-text-medium">
            ${this._formatPoetryContent(poetryData.content)}
          </div>
        </div>
      </div>
    `;
  }

  _formatPoetryContent(content, useBr = false) {
    if (!content) return '<div class="empty-content cardforge-text-small">诗词内容为空</div>';
    
    // 处理换行和标点
    const lines = content.split('\n').filter(line => line.trim());
    if (useBr) {
      return lines.map(line => 
        `<div class="poetry-line">${line.replace(/，/g, '，<br>').replace(/。/g, '。<br>')}</div>`
      ).join('');
    } else {
      return lines.map(line => `<div class="poetry-line">${line}</div>`).join('');
    }
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '古典卷轴': 'scroll',
      '书法墨宝': 'calligraphy', 
      '文人雅士': 'scholar',
      '现代简约': 'modern'
    };
    return styleMap[styleName] || 'scroll';
  }

  _getAlignmentClass(alignment) {
    const alignmentMap = {
      '左对齐': 'left',
      '居中': 'center', 
      '右对齐': 'right'
    };
    return alignmentMap[alignment] || 'center';
  }

  _getFontSizeClass(size) {
    const sizeMap = {
      '较小': 'small',
      '正常': 'normal',
      '较大': 'large'
    };
    return sizeMap[size] || 'normal';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '古典卷轴';
    const styleClass = this._getStyleClass(cardStyle);
    const fontSize = this._getFontSizeClass(config.font_size);
    
    return `
      ${this.getBaseStyles(config)}
      
      .poetry-card {
        font-family: 'SimSun', 'STKaiti', 'KaiTi', serif;
        justify-content: center;
      }

      /* 通用样式 */
      .poetry-content {
        line-height: 1.8;
        white-space: pre-line;
      }

      .poetry-line {
        margin-bottom: 0.5em;
      }

      .author, .dynasty {
        font-style: italic;
      }

      /* 字体大小控制 */
      .font-small .cardforge-text-medium { font-size: 0.9em; }
      .font-normal .cardforge-text-medium { font-size: 1em; }
      .font-large .cardforge-text-medium { font-size: 1.1em; }
      
      .font-small .cardforge-title { font-size: 1.2em; }
      .font-normal .cardforge-title { font-size: 1.4em; }
      .font-large .cardforge-title { font-size: 1.6em; }
      
      /* 文字对齐 */
      .alignment-left { text-align: left; }
      .alignment-center { text-align: center; }
      .alignment-right { text-align: right; }

      /* 古典卷轴样式 */
      .style-scroll {
        border: 2px solid var(--cf-border);
        background: linear-gradient(to bottom, #F5F5DC, #F0E68C);
      }

      .scroll-layout {
        padding: var(--cf-spacing-lg);
      }

      .poetry-header {
        border-bottom: 1px solid var(--cf-border);
        padding-bottom: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      /* 书法墨宝样式 */
      .style-calligraphy {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
      }

      .calligraphy-layout {
        padding: var(--cf-spacing-xl);
      }

      .calligraphy-header {
        border-bottom: 2px solid var(--cf-primary-color);
        padding-bottom: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .title-section {
        text-align: center;
      }

      .author-dynasty {
        display: flex;
        justify-content: center;
        gap: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-sm);
      }

      .calligraphy-content {
        font-weight: 600;
        line-height: 2;
      }

      /* 文人雅士样式 */
      .style-scholar {
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .scholar-layout {
        padding: var(--cf-spacing-lg);
      }

      .scholar-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-lg);
      }

      .scholar-meta {
        margin-top: var(--cf-spacing-sm);
        opacity: 0.8;
      }

      .scholar-poetry {
        line-height: 1.8;
      }

      /* 现代简约样式 */
      .style-modern {
        background: var(--cf-surface);
      }

      .modern-layout {
        padding: var(--cf-spacing-lg);
      }

      .modern-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-lg);
      }

      .modern-meta {
        display: flex;
        justify-content: center;
        gap: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-sm);
        opacity: 0.7;
      }

      .modern-content {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modern-poetry {
        line-height: 1.8;
        max-width: 600px;
      }

      /* 动画效果 */
      .cardforge-animate-卷轴展开 .scroll-layout {
        animation: scrollUnfold 1.5s ease-out;
      }

      .cardforge-animate-毛笔书写 .calligraphy-content {
        animation: brushWrite 2s ease-in-out;
      }

      @keyframes scrollUnfold {
        from { transform: scaleY(0); opacity: 0; }
        to { transform: scaleY(1); opacity: 1; }
      }

      @keyframes brushWrite {
        from { 
          clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
          opacity: 0;
        }
        to { 
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          opacity: 1;
        }
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .calligraphy-layout,
        .scholar-layout,
        .modern-layout {
          padding: var(--cf-spacing-md);
        }
        
        .author-dynasty {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
        
        .modern-meta {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
      }
    `;
  }
}

export default PoetryCard;
export const manifest = PoetryCard.manifest;