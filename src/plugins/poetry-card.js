// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  static manifest = {
    id: 'poetry-card',
    name: '诗词卡片',
    version: '1.0.0',
    description: '优雅的诗词展示卡片，支持动态配置诗词内容',
    category: '文化',
    icon: '📜',
    author: 'CardForge',
    
    // 卡片能力配置
    capabilities: {
      supportsTitle: true,
      supportsContent: true,
      supportsFooter: false
    },
    
    // 布局字段定义
    layout_fields: {
      title: ['title'],
      content: ['dynasty', 'author', 'content']
    },
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['古典风格', '简约风格', '水墨风格', '书香风格'],
        default: '古典风格'
      },
      
      text_align: {
        type: 'select',
        label: '文字对齐',
        options: ['左对齐', '居中', '右对齐'],
        default: '居中'
      },
      
      show_border: {
        type: 'boolean',
        label: '显示边框',
        default: true
      },
      
      show_background: {
        type: 'boolean',
        label: '显示背景',
        default: true
      },
      
      font_size: {
        type: 'select',
        label: '字体大小',
        options: ['小', '标准', '大', '特大'],
        default: '标准'
      }
    }
  };

  getTemplate(config, hass, entities) {
    // 获取诗词数据
    const poetryData = this._getPoetryData(entities, config);
    
    // 验证数据完整性
    const validation = this._validatePoetryData(poetryData);
    if (!validation.valid) {
      return this._renderError(validation.message || '诗词数据不完整');
    }

    const cardStyle = config.card_style || '古典风格';
    const textAlign = config.text_align || '居中';

    return `
      <div class="cardforge-responsive-container poetry-card style-${this._getStyleClass(cardStyle)} align-${this._getAlignClass(textAlign)}">
        <div class="poetry-content">
          ${this._renderTitle(poetryData.title, cardStyle)}
          ${this._renderMetaInfo(poetryData.dynasty, poetryData.author, cardStyle)}
          ${this._renderContent(poetryData.content, cardStyle)}
        </div>
      </div>
    `;
  }

  _getPoetryData(entities, config) {
    // 从实体数据中获取诗词信息，支持动态配置
    return {
      title: this._getCardValue(entities, 'title', '无题'),
      dynasty: this._getCardValue(entities, 'dynasty', '未知朝代'),
      author: this._getCardValue(entities, 'author', '佚名'),
      content: this._getCardValue(entities, 'content', '')
    };
  }

  _validatePoetryData(data) {
    const errors = [];
    
    if (!data.title || data.title.trim() === '') {
      errors.push('诗词标题不能为空');
    }
    
    if (!data.content || data.content.trim() === '') {
      errors.push('诗词内容不能为空');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      message: errors.join('; ')
    };
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '古典风格': 'classical',
      '简约风格': 'minimal', 
      '水墨风格': 'ink-wash',
      '书香风格': 'bookish'
    };
    return styleMap[styleName] || 'classical';
  }

  _getAlignClass(alignName) {
    const alignMap = {
      '左对齐': 'left',
      '居中': 'center',
      '右对齐': 'right'
    };
    return alignMap[alignName] || 'center';
  }

  _renderTitle(title, style) {
    if (!title || title.trim() === '') return '';
    
    return `
      <div class="poetry-title ${style}-title">
        <h2 class="title-text">${this._renderSafeHTML(title)}</h2>
      </div>
    `;
  }

  _renderMetaInfo(dynasty, author, style) {
    const hasDynasty = dynasty && dynasty.trim() !== '';
    const hasAuthor = author && author.trim() !== '';
    
    if (!hasDynasty && !hasAuthor) return '';
    
    let metaText = '';
    if (hasDynasty && hasAuthor) {
      metaText = `${dynasty} · ${author}`;
    } else if (hasDynasty) {
      metaText = dynasty;
    } else {
      metaText = author;
    }
    
    return `
      <div class="poetry-meta ${style}-meta">
        <span class="meta-text">${this._renderSafeHTML(metaText)}</span>
      </div>
    `;
  }

  _renderContent(content, style) {
    if (!content || content.trim() === '') {
      return this._renderEmpty('暂无诗词内容', '📝');
    }
    
    // 处理诗词内容，支持换行
    const formattedContent = content.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .map(line => `<div class="content-line">${this._renderSafeHTML(line)}</div>`)
      .join('');
    
    return `
      <div class="poetry-content-text ${style}-content">
        <div class="content-lines">
          ${formattedContent}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const cardStyle = config.card_style || '古典风格';
    const textAlign = config.text_align || '居中';
    const showBorder = config.show_border !== false;
    const showBackground = config.show_background !== false;
    const fontSize = config.font_size || '标准';

    const fontSizeMap = {
      '小': '0.9em',
      '标准': '1em',
      '大': '1.2em',
      '特大': '1.4em'
    };

    const baseFontSize = fontSizeMap[fontSize] || '1em';

    const styles = {
      base: `
        .poetry-card {
          min-height: 200px;
          padding: var(--cf-spacing-xl);
          transition: all var(--cf-transition-normal);
          ${showBackground ? '' : 'background: transparent !important;'}
          ${showBorder ? '' : 'border: none !important;'}
        }

        .poetry-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--cf-spacing-lg);
        }

        .align-left { text-align: left; }
        .align-center { text-align: center; }
        .align-right { text-align: right; }

        /* 通用标题样式 */
        .poetry-title {
          margin-bottom: var(--cf-spacing-sm);
        }

        .title-text {
          margin: 0;
          font-weight: 600;
          line-height: 1.3;
          font-size: calc(${baseFontSize} * 1.4);
        }

        /* 通用元信息样式 */
        .poetry-meta {
          margin-bottom: var(--cf-spacing-lg);
          opacity: 0.8;
        }

        .meta-text {
          font-style: italic;
          font-size: calc(${baseFontSize} * 0.9);
        }

        /* 通用内容样式 */
        .poetry-content-text {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content-lines {
          width: 100%;
        }

        .content-line {
          margin-bottom: var(--cf-spacing-md);
          line-height: 1.8;
          font-size: ${baseFontSize};
          transition: all var(--cf-transition-fast);
        }

        .content-line:last-child {
          margin-bottom: 0;
        }
      `,

      classical: `
        .style-classical .cardforge-responsive-container {
          background: linear-gradient(135deg, #f9f3e9 0%, #e8dfca 100%);
          border: 2px solid #d4b88c;
          box-shadow: var(--cf-shadow-md);
        }

        .classical-title .title-text {
          color: #8b4513;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          border-bottom: 2px solid #d4b88c;
          padding-bottom: var(--cf-spacing-sm);
        }

        .classical-meta .meta-text {
          color: #a0522d;
          font-weight: 500;
        }

        .classical-content .content-line {
          color: #654321;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
      `,

      minimal: `
        .style-minimal .cardforge-responsive-container {
          background: var(--cf-surface);
          border: 1px solid var(--cf-border);
        }

        .minimal-title .title-text {
          color: var(--cf-text-primary);
          font-weight: 700;
        }

        .minimal-meta .meta-text {
          color: var(--cf-text-secondary);
          font-weight: 400;
        }

        .minimal-content .content-line {
          color: var(--cf-text-primary);
          font-weight: 400;
        }
      `,

      inkWash: `
        .style-ink-wash .cardforge-responsive-container {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
          border: none;
          color: #ecf0f1;
          position: relative;
          overflow: hidden;
        }

        .style-ink-wash .cardforge-responsive-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(52, 152, 219, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(231, 76, 60, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .ink-wash-title .title-text {
          color: #ecf0f1;
          font-weight: 600;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .ink-wash-meta .meta-text {
          color: #bdc3c7;
          font-weight: 500;
        }

        .ink-wash-content .content-line {
          color: #ecf0f1;
          font-weight: 500;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
      `,

      bookish: `
        .style-bookish .cardforge-responsive-container {
          background: 
            linear-gradient(135deg, #fdf6e3 0%, #f5e8c8 100%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(139, 69, 19, 0.05) 10px,
              rgba(139, 69, 19, 0.05) 20px
            );
          border: 3px double #d4b88c;
          box-shadow: 
            var(--cf-shadow-md),
            inset 0 0 20px rgba(139, 69, 19, 0.1);
        }

        .bookish-title .title-text {
          color: #8b4513;
          font-weight: 700;
          font-family: "SimSun", "NSimSun", serif;
          position: relative;
        }

        .bookish-title .title-text::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #d4b88c, transparent);
        }

        .bookish-meta .meta-text {
          color: #a0522d;
          font-weight: 500;
          font-family: "KaiTi", "STKaiti", serif;
        }

        .bookish-content .content-line {
          color: #654321;
          font-weight: 500;
          font-family: "KaiTi", "STKaiti", serif;
          position: relative;
        }

        .bookish-content .content-line::before {
          content: '❝';
          position: absolute;
          left: -25px;
          top: 0;
          color: #d4b88c;
          opacity: 0.6;
        }
      `,

      responsive: `
        @media (max-width: 600px) {
          .poetry-card {
            padding: var(--cf-spacing-lg);
            min-height: 180px;
          }

          .title-text {
            font-size: calc(${baseFontSize} * 1.2);
          }

          .content-line {
            font-size: calc(${baseFontSize} * 0.9);
            margin-bottom: var(--cf-spacing-sm);
          }

          .bookish-content .content-line::before {
            left: -20px;
            font-size: 0.8em;
          }
        }

        @media (max-width: 400px) {
          .poetry-card {
            padding: var(--cf-spacing-md);
          }

          .title-text {
            font-size: calc(${baseFontSize} * 1.1);
          }

          .poetry-content {
            gap: var(--cf-spacing-md);
          }
        }
      `,

      animations: `
        .poetry-card {
          animation: fadeInUp 0.6s var(--cf-ease-out);
        }

        .content-line {
          animation: slideInFade 0.8s var(--cf-ease-out) both;
        }

        .content-line:nth-child(1) { animation-delay: 0.1s; }
        .content-line:nth-child(2) { animation-delay: 0.2s; }
        .content-line:nth-child(3) { animation-delay: 0.3s; }
        .content-line:nth-child(4) { animation-delay: 0.4s; }
        .content-line:nth-child(5) { animation-delay: 0.5s; }
        .content-line:nth-child(6) { animation-delay: 0.6s; }
        .content-line:nth-child(7) { animation-delay: 0.7s; }
        .content-line:nth-child(8) { animation-delay: 0.8s; }

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

        @keyframes slideInFade {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `
    };

    return `
      ${this.getBaseStyles(config)}
      ${styles.base}
      ${styles[this._getStyleClass(cardStyle)] || styles.classical}
      ${styles.responsive}
      ${styles.animations}
    `;
  }

  // 实体需求定义
  getAllEntityRequirements(config, hass) {
    const baseRequirements = super.getAllEntityRequirements(config, hass);
    
    // 添加诗词特定的实体需求
    const poetryRequirements = [
      {
        key: 'title',
        description: '诗词标题',
        required: true
      },
      {
        key: 'dynasty',
        description: '诗词朝代', 
        required: false
      },
      {
        key: 'author',
        description: '诗词作者',
        required: false
      },
      {
        key: 'content',
        description: '诗词全文',
        required: true
      }
    ];
    
    return [...baseRequirements, ...poetryRequirements];
  }

  // 数据验证
  validateEntities(entities, config, hass) {
    const errors = [];
    
    if (!entities.title || !entities.title.state || entities.title.state.trim() === '') {
      errors.push('诗词标题不能为空');
    }
    
    if (!entities.content || !entities.content.state || entities.content.state.trim() === '') {
      errors.push('诗词内容不能为空');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

export default PoetryCard;
export const manifest = PoetryCard.manifest;