// src/plugins/poem-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoemCard extends BasePlugin {
  static manifest = {
    id: 'poem-card',
    name: '诗词卡片',
    version: '1.0.0',
    description: '优雅的诗词展示卡片，支持自定义诗词内容',
    category: '文学',
    icon: '📜',
    author: 'CardForge',
    
    capabilities: {
      supportsTitle: false,
      supportsContent: true,    // 允许自定义诗词内容
      supportsFooter: false
    },
    
    config_schema: {
      poem_style: {
        type: 'select',
        label: '诗词风格',
        options: ['古典风格', '现代风格', '书法风格', '简约风格', '水墨风格'],
        default: '古典风格'
      },
      
      show_title: {
        type: 'boolean',
        label: '显示标题',
        default: true
      },
      
      show_author: {
        type: 'boolean',
        label: '显示作者',
        default: true
      },
      
      show_dynasty: {
        type: 'boolean',
        label: '显示朝代',
        default: true
      },
      
      text_alignment: {
        type: 'select',
        label: '文字对齐',
        options: ['居中对齐', '左对齐', '右对齐'],
        default: '居中对齐'
      },
      
      enable_shadow: {
        type: 'boolean',
        label: '启用文字阴影',
        default: true
      },
      
      background_style: {
        type: 'select',
        label: '背景风格',
        options: ['纯色背景', '渐变背景', '纹理背景', '无背景'],
        default: '纹理背景'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const styleClass = this._getStyleClass(config.poem_style);
    const alignmentClass = this._getAlignmentClass(config.text_alignment);
    const poemData = this._getPoemData(entities);
    
    return `
      <div class="cardforge-responsive-container poem-card style-${styleClass} ${alignmentClass}">
        <div class="cardforge-content-grid">
          ${this._renderPoemContent(poemData, config)}
        </div>
      </div>
    `;
  }

  _getPoemData(entities) {
    // 从实体配置中获取诗词数据
    return {
      title: entities?.poem_title || '静夜思',
      author: entities?.poem_author || '李白',
      dynasty: entities?.poem_dynasty || '唐',
      content: entities?.poem_content || '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。'
    };
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '古典风格': 'classical',
      '现代风格': 'modern',
      '书法风格': 'calligraphy',
      '简约风格': 'minimal',
      '水墨风格': 'ink-wash'
    };
    return styleMap[styleName] || 'classical';
  }

  _getAlignmentClass(alignment) {
    const alignmentMap = {
      '居中对齐': 'center',
      '左对齐': 'left',
      '右对齐': 'right'
    };
    return alignmentMap[alignment] || 'center';
  }

  _renderPoemContent(poemData, config) {
    const lines = poemData.content.split('\n').filter(line => line.trim());
    
    return `
      <div class="poem-container">
        ${config.show_title ? `
          <div class="poem-title">${poemData.title}</div>
        ` : ''}
        
        ${config.show_author || config.show_dynasty ? `
          <div class="poem-meta">
            ${config.show_author ? `<span class="poem-author">${poemData.author}</span>` : ''}
            ${config.show_dynasty ? `<span class="poem-dynasty">[${poemData.dynasty}]</span>` : ''}
          </div>
        ` : ''}
        
        <div class="poem-content">
          ${lines.map(line => `
            <div class="poem-line">${line}</div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const styleClass = this._getStyleClass(config.poem_style);
    const alignmentClass = this._getAlignmentClass(config.text_alignment);
    const hasShadow = config.enable_shadow;
    const backgroundStyle = config.background_style;

    return `
      ${this.getBaseStyles(config)}
      
      .poem-card {
        padding: var(--cf-spacing-xl);
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .poem-container {
        width: 100%;
        max-width: 600px;
      }

      /* 文字对齐 */
      .center {
        text-align: center;
      }

      .left {
        text-align: left;
      }

      .right {
        text-align: right;
      }

      /* 诗词标题 */
      .poem-title {
        font-size: 2.2em;
        font-weight: 700;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-lg);
        line-height: 1.3;
        ${hasShadow ? 'text-shadow: 2px 2px 4px rgba(0,0,0,0.3);' : ''}
      }

      /* 作者信息 */
      .poem-meta {
        font-size: 1.2em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-xl);
        line-height: 1.4;
      }

      .poem-author {
        font-weight: 600;
        margin-right: var(--cf-spacing-sm);
      }

      .poem-dynasty {
        font-style: italic;
      }

      /* 诗词内容 */
      .poem-content {
        line-height: 1.8;
      }

      .poem-line {
        font-size: 1.3em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        ${hasShadow ? 'text-shadow: 1px 1px 2px rgba(0,0,0,0.2);' : ''}
      }

      /* ===== 古典风格 ===== */
      .style-classical .poem-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: var(--cf-spacing-xxl);
        border-radius: var(--cf-radius-lg);
        border: 1px solid rgba(255,255,255,0.5);
        box-shadow: var(--cf-shadow-lg);
        position: relative;
      }

      .style-classical .poem-container::before {
        content: "";
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        border: 2px solid rgba(139, 69, 19, 0.2);
        border-radius: var(--cf-radius-md);
        pointer-events: none;
      }

      .style-classical .poem-title {
        color: #8b4513;
        font-family: "SimSun", "宋体", serif;
      }

      .style-classical .poem-line {
        font-family: "SimSun", "宋体", serif;
        font-size: 1.4em;
      }

      /* ===== 现代风格 ===== */
      .style-modern .poem-container {
        background: var(--cf-surface);
        padding: var(--cf-spacing-xl);
        border-radius: var(--cf-radius-lg);
        box-shadow: var(--cf-shadow-xl);
      }

      .style-modern .poem-title {
        color: var(--cf-primary-color);
        font-weight: 300;
        letter-spacing: 2px;
      }

      .style-modern .poem-line {
        font-weight: 300;
        letter-spacing: 1px;
      }

      /* ===== 书法风格 ===== */
      .style-calligraphy {
        background: linear-gradient(45deg, #d4af37 0%, #f5f7fa 50%, #d4af37 100%);
      }

      .style-calligraphy .poem-container {
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.1"><rect width="100" height="100" fill="none" stroke="%238b4513" stroke-width="2"/></svg>');
        padding: var(--cf-spacing-xxl);
        border: 8px double #8b4513;
      }

      .style-calligraphy .poem-title {
        font-family: "楷体", "KaiTi", "STKaiti", serif;
        font-size: 2.5em;
        color: #8b4513;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
      }

      .style-calligraphy .poem-line {
        font-family: "楷体", "KaiTi", "STKaiti", serif;
        font-size: 1.6em;
        color: #2c1810;
        font-weight: 600;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }

      /* ===== 简约风格 ===== */
      .style-minimal .poem-container {
        padding: 0;
      }

      .style-minimal .poem-title {
        font-weight: 400;
        font-size: 1.8em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
      }

      .style-minimal .poem-meta {
        font-size: 1em;
        margin-bottom: var(--cf-spacing-lg);
      }

      .style-minimal .poem-line {
        font-size: 1.1em;
        font-weight: 300;
        margin-bottom: var(--cf-spacing-sm);
      }

      /* ===== 水墨风格 ===== */
      .style-ink-wash {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        color: #ecf0f1;
      }

      .style-ink-wash .poem-container {
        position: relative;
        padding: var(--cf-spacing-xxl);
      }

      .style-ink-wash .poem-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
        pointer-events: none;
      }

      .style-ink-wash .poem-title {
        color: #ecf0f1;
        font-family: "楷体", "KaiTi", serif;
        font-size: 2.3em;
      }

      .style-ink-wash .poem-meta {
        color: #bdc3c7;
      }

      .style-ink-wash .poem-line {
        color: #ecf0f1;
        font-family: "楷体", "KaiTi", serif;
        font-size: 1.4em;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
      }

      /* 背景样式 */
      .poem-card[class*="texture"] {
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" opacity="0.05"><rect width="100" height="100" fill="none" stroke="%23000" stroke-width="1"/></svg>');
      }

      .poem-card.gradient-bg {
        background: linear-gradient(135deg, var(--cf-primary-color) 0%, var(--cf-accent-color) 100%);
      }

      .poem-card.no-bg {
        background: transparent;
      }

      /* 响应式优化 */
      @media (max-width: 768px) {
        .poem-card {
          padding: var(--cf-spacing-lg);
          min-height: 250px;
        }

        .poem-title {
          font-size: 1.8em;
        }

        .poem-line {
          font-size: 1.1em;
        }

        .style-classical .poem-container,
        .style-calligraphy .poem-container,
        .style-ink-wash .poem-container {
          padding: var(--cf-spacing-xl);
        }

        .style-calligraphy .poem-title {
          font-size: 2em;
        }

        .style-calligraphy .poem-line {
          font-size: 1.3em;
        }
      }

      @media (max-width: 480px) {
        .poem-title {
          font-size: 1.6em;
        }

        .poem-line {
          font-size: 1em;
        }

        .poem-meta {
          font-size: 1em;
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .style-modern .poem-container {
          background: var(--cf-dark-surface);
        }

        .style-minimal .poem-title,
        .style-minimal .poem-line {
          color: var(--cf-dark-text);
        }

        .style-minimal .poem-meta {
          color: var(--cf-dark-text-secondary);
        }
      }
    `;
  }
}

export default PoemCard;
export const manifest = PoemCard.manifest;
