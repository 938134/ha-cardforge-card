// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  static manifest = {
    id: 'poetry-card',
    name: '诗词展示',
    version: '1.0.0',
    description: '优雅展示诗词，支持智能标点换行',
    category: 'information',
    icon: '📜',
    author: 'CardForge',
    
    config_schema: {
      // 布局配置
      layout_style: {
        type: 'select',
        label: '布局风格',
        options: ['vertical', 'horizontal', 'classic', 'modern'],
        default: 'vertical',
        description: '选择诗词展示的布局风格'
      },
      
      font_size: {
        type: 'select',
        label: '字体大小',
        options: ['small', 'medium', 'large'],
        default: 'medium',
        description: '选择诗词文字的显示大小'
      },
      
      show_border: {
        type: 'boolean',
        label: '显示边框',
        default: true,
        description: '显示卡片边框装饰'
      },
      
      background_style: {
        type: 'select',
        label: '背景样式',
        options: ['plain', 'paper', 'ink-wash'],
        default: 'paper',
        description: '选择卡片背景样式'
      },
      
      // 动画效果
      enable_animations: {
        type: 'boolean',
        label: '启用动画',
        default: true,
        description: '启用诗词展示动画效果'
      }
    },
    
    entity_requirements: [
      {
        key: 'title',
        description: '诗词标题',
        required: true,
        suggested: 'sensor.poetry_title'
      },
      {
        key: 'dynasty',
        description: '诗词朝代',
        required: true,
        suggested: 'sensor.poetry_dynasty'
      },
      {
        key: 'author',
        description: '诗词作者',
        required: true,
        suggested: 'sensor.poetry_author'
      },
      {
        key: 'content',
        description: '诗词内容',
        required: true,
        suggested: 'sensor.poetry_content'
      }
    ]
  };

  // 智能标点换行处理
  _formatPoetryContent(content, layoutStyle) {
    if (!content) return '';
    
    // 根据布局风格选择换行策略
    if (layoutStyle === 'vertical') {
      return this._formatVerticalContent(content);
    } else {
      return this._formatHorizontalContent(content);
    }
  }

  // 竖排布局内容格式化
  _formatVerticalContent(content) {
    // 竖排布局：按句换行，智能处理标点
    const sentences = content.split(/[，。！？；]/).filter(s => s.trim());
    let formattedContent = '';
    
    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence) {
        // 竖排时每个字符单独一行
        const chars = trimmedSentence.split('');
        const charLines = chars.map(char => 
          `<div class="vertical-char">${char}</div>`
        ).join('');
        
        formattedContent += `<div class="vertical-line">${charLines}</div>`;
        
        // 在句子结束后添加标点（如果原句有标点）
        const originalEnd = content.charAt(content.indexOf(sentence) + sentence.length);
        if (['，', '。', '！', '？', '；'].includes(originalEnd)) {
          formattedContent += `<div class="vertical-punctuation">${originalEnd}</div>`;
        }
      }
    });
    
    return formattedContent;
  }

  // 横排布局内容格式化
  _formatHorizontalContent(content) {
    // 横排布局：智能标点换行，保持诗词韵律
    let formattedContent = '';
    let currentLine = '';
    
    // 按字符处理，智能判断换行位置
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      currentLine += char;
      
      // 遇到标点符号时考虑换行
      if (['。', '！', '？', '；', '\n'].includes(char)) {
        // 句子结束，换行
        formattedContent += `<div class="poetry-line">${currentLine}</div>`;
        currentLine = '';
      } else if (['，', '、'].includes(char)) {
        // 逗号处，如果下一句较长也可以考虑换行
        const nextChars = content.slice(i + 1, i + 4);
        if (nextChars.length >= 3 && !['，', '。', '！', '？'].includes(nextChars[0])) {
          formattedContent += `<div class="poetry-line">${currentLine}</div>`;
          currentLine = '';
        }
      }
    }
    
    // 处理最后一行
    if (currentLine) {
      formattedContent += `<div class="poetry-line">${currentLine}</div>`;
    }
    
    return formattedContent;
  }

  // 渲染竖排布局
  _renderVerticalLayout(entities, config) {
    const title = this._getCardValue(this.hass, entities, 'title', '');
    const dynasty = this._getCardValue(this.hass, entities, 'dynasty', '');
    const author = this._getCardValue(this.hass, entities, 'author', '');
    const content = this._getCardValue(this.hass, entities, 'content', '');
    
    const formattedContent = this._formatPoetryContent(content, 'vertical');
    const enableAnimations = config.enable_animations !== false;

    return `
      <div class="poetry-vertical ${enableAnimations ? 'with-animations' : ''}">
        <div class="vertical-header">
          <div class="vertical-title">《${title}》</div>
          <div class="vertical-author">${author} · ${dynasty}</div>
        </div>
        
        <div class="vertical-content">
          ${formattedContent}
        </div>
        
        <div class="vertical-seal">诗</div>
      </div>
    `;
  }

  // 渲染横排布局
  _renderHorizontalLayout(entities, config) {
    const title = this._getCardValue(this.hass, entities, 'title', '');
    const dynasty = this._getCardValue(this.hass, entities, 'dynasty', '');
    const author = this._getCardValue(this.hass, entities, 'author', '');
    const content = this._getCardValue(this.hass, entities, 'content', '');
    
    const formattedContent = this._formatPoetryContent(content, 'horizontal');
    const enableAnimations = config.enable_animations !== false;

    return `
      <div class="poetry-horizontal ${enableAnimations ? 'with-animations' : ''}">
        <div class="horizontal-header">
          <div class="horizontal-title">《${title}》</div>
          <div class="horizontal-author">${author}［${dynasty}］</div>
        </div>
        
        <div class="horizontal-content">
          ${formattedContent}
        </div>
      </div>
    `;
  }

  // 渲染经典布局
  _renderClassicLayout(entities, config) {
    const title = this._getCardValue(this.hass, entities, 'title', '');
    const dynasty = this._getCardValue(this.hass, entities, 'dynasty', '');
    const author = this._getCardValue(this.hass, entities, 'author', '');
    const content = this._getCardValue(this.hass, entities, 'content', '');
    
    const formattedContent = this._formatPoetryContent(content, 'horizontal');
    const enableAnimations = config.enable_animations !== false;

    return `
      <div class="poetry-classic ${enableAnimations ? 'with-animations' : ''}">
        <div class="classic-border">
          <div class="classic-corner corner-tl"></div>
          <div class="classic-corner corner-tr"></div>
          <div class="classic-corner corner-bl"></div>
          <div class="classic-corner corner-br"></div>
        </div>
        
        <div class="classic-content">
          <div class="classic-title">${title}</div>
          <div class="classic-author">${author} · ${dynasty}</div>
          
          <div class="classic-poetry">
            ${formattedContent}
          </div>
        </div>
      </div>
    `;
  }

  // 渲染现代布局
  _renderModernLayout(entities, config) {
    const title = this._getCardValue(this.hass, entities, 'title', '');
    const dynasty = this._getCardValue(this.hass, entities, 'dynasty', '');
    const author = this._getCardValue(this.hass, entities, 'author', '');
    const content = this._getCardValue(this.hass, entities, 'content', '');
    
    const formattedContent = this._formatPoetryContent(content, 'horizontal');
    const enableAnimations = config.enable_animations !== false;

    return `
      <div class="poetry-modern ${enableAnimations ? 'with-animations' : ''}">
        <div class="modern-header">
          <div class="modern-title-section">
            <h2 class="modern-title">${title}</h2>
            <div class="modern-meta">
              <span class="modern-author">${author}</span>
              <span class="modern-dynasty">${dynasty}</span>
            </div>
          </div>
        </div>
        
        <div class="modern-content">
          ${formattedContent}
        </div>
        
        <div class="modern-decoration">
          <div class="decoration-line"></div>
        </div>
      </div>
    `;
  }

  getTemplate(config, hass, entities) {
    this.hass = hass;
    const layoutStyle = config.layout_style || 'vertical';

    let layoutHTML = '';
    
    switch (layoutStyle) {
      case 'horizontal':
        layoutHTML = this._renderHorizontalLayout(entities, config);
        break;
      case 'classic':
        layoutHTML = this._renderClassicLayout(entities, config);
        break;
      case 'modern':
        layoutHTML = this._renderModernLayout(entities, config);
        break;
      default:
        layoutHTML = this._renderVerticalLayout(entities, config);
    }

    return `
      <div class="cardforge-responsive-container poetry-card layout-${layoutStyle}">
        <div class="cardforge-content-grid">
          ${layoutHTML}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const layoutStyle = config.layout_style || 'vertical';
    const fontSize = config.font_size || 'medium';
    const showBorder = config.show_border !== false;
    const backgroundStyle = config.background_style || 'paper';
    const enableAnimations = config.enable_animations !== false;

    // 字体大小映射
    const fontSizes = {
      small: { title: '1.3em', content: '1em', author: '0.9em' },
      medium: { title: '1.6em', content: '1.2em', author: '1em' },
      large: { title: '2em', content: '1.5em', author: '1.1em' }
    };

    const sizes = fontSizes[fontSize] || fontSizes.medium;

    return `
      ${this.getBaseStyles(config)}
      
      .poetry-card {
        padding: var(--cf-spacing-lg);
        position: relative;
        overflow: hidden;
        min-height: 200px;
        font-family: "SimSun", "NSimSun", "楷体", "宋体", serif;
      }
      
      /* 背景样式 */
      .poetry-card.background-plain {
        background: var(--cf-surface);
      }
      
      .poetry-card.background-paper {
        background: #fefefe;
        background-image: 
          radial-gradient(#ddd 1px, transparent 1px),
          radial-gradient(#ddd 1px, transparent 1px);
        background-size: 20px 20px;
        background-position: 0 0, 10px 10px;
      }
      
      .poetry-card.background-ink-wash {
        background: linear-gradient(135deg, #f5f1e6 0%, #e8dfca 100%);
        position: relative;
      }
      
      .poetry-card.background-ink-wash::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(0,0,0,0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0,0,0,0.02) 0%, transparent 50%);
        pointer-events: none;
      }
      
      /* ===== 竖排布局样式 ===== */
      .poetry-vertical {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        padding: var(--cf-spacing-lg);
        writing-mode: vertical-rl;
        text-orientation: mixed;
      }
      
      .vertical-header {
        margin-bottom: var(--cf-spacing-xl);
        text-align: center;
      }
      
      .vertical-title {
        font-size: ${sizes.title};
        font-weight: 700;
        color: #8b4513;
        margin-bottom: var(--cf-spacing-md);
        letter-spacing: 0.2em;
      }
      
      .vertical-author {
        font-size: ${sizes.author};
        color: #666;
        opacity: 0.8;
      }
      
      .vertical-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5em;
      }
      
      .vertical-line {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2em;
      }
      
      .vertical-char {
        font-size: ${sizes.content};
        line-height: 1.2;
        color: #2c1810;
      }
      
      .vertical-punctuation {
        font-size: ${sizes.content};
        color: #8b4513;
        margin: 0.3em 0;
      }
      
      .vertical-seal {
        position: absolute;
        bottom: 20px;
        left: 20px;
        width: 40px;
        height: 40px;
        border: 2px solid #8b4513;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8em;
        color: #8b4513;
        transform: rotate(15deg);
        opacity: 0.6;
      }
      
      /* ===== 横排布局样式 ===== */
      .poetry-horizontal {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: var(--cf-spacing-lg);
      }
      
      .horizontal-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-xl);
        border-bottom: 1px solid rgba(139, 69, 19, 0.3);
        padding-bottom: var(--cf-spacing-lg);
      }
      
      .horizontal-title {
        font-size: ${sizes.title};
        font-weight: 700;
        color: #8b4513;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .horizontal-author {
        font-size: ${sizes.author};
        color: #666;
        font-style: italic;
      }
      
      .horizontal-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.8em;
      }
      
      .poetry-line {
        font-size: ${sizes.content};
        color: #2c1810;
        line-height: 1.8;
        text-align: center;
        width: 100%;
      }
      
      /* 智能标点换行优化 */
      .poetry-line {
        text-align: justify;
        text-justify: inter-ideograph;
      }
      
      /* ===== 经典布局样式 ===== */
      .poetry-classic {
        position: relative;
        height: 100%;
        padding: var(--cf-spacing-xl);
        background: #fef9f0;
        border: 1px solid #d4b78c;
      }
      
      .classic-border {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }
      
      .classic-corner {
        position: absolute;
        width: 20px;
        height: 20px;
        border-color: #8b4513;
        border-style: solid;
        border-width: 0;
      }
      
      .corner-tl {
        top: 10px;
        left: 10px;
        border-top-width: 2px;
        border-left-width: 2px;
      }
      
      .corner-tr {
        top: 10px;
        right: 10px;
        border-top-width: 2px;
        border-right-width: 2px;
      }
      
      .corner-bl {
        bottom: 10px;
        left: 10px;
        border-bottom-width: 2px;
        border-left-width: 2px;
      }
      
      .corner-br {
        bottom: 10px;
        right: 10px;
        border-bottom-width: 2px;
        border-right-width: 2px;
      }
      
      .classic-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      
      .classic-title {
        font-size: ${sizes.title};
        font-weight: 700;
        color: #8b4513;
        margin-bottom: var(--cf-spacing-md);
      }
      
      .classic-author {
        font-size: ${sizes.author};
        color: #666;
        margin-bottom: var(--cf-spacing-xl);
        font-style: italic;
      }
      
      .classic-poetry {
        line-height: 2;
      }
      
      /* ===== 现代布局样式 ===== */
      .poetry-modern {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: var(--cf-spacing-lg);
      }
      
      .modern-header {
        margin-bottom: var(--cf-spacing-lg);
      }
      
      .modern-title-section {
        text-align: center;
      }
      
      .modern-title {
        font-size: ${sizes.title};
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 var(--cf-spacing-sm) 0;
      }
      
      .modern-meta {
        display: flex;
        justify-content: center;
        gap: var(--cf-spacing-md);
        font-size: ${sizes.author};
        color: var(--cf-text-secondary);
      }
      
      .modern-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.6em;
      }
      
      .modern-decoration {
        margin-top: var(--cf-spacing-lg);
      }
      
      .decoration-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--cf-primary-color), transparent);
        opacity: 0.5;
      }
      
      /* ===== 动画效果 ===== */
      .with-animations .vertical-char,
      .with-animations .poetry-line {
        animation: fadeInUp 0.6s ease-out both;
      }
      
      .with-animations .vertical-char:nth-child(odd),
      .with-animations .poetry-line:nth-child(odd) {
        animation-delay: 0.1s;
      }
      
      .with-animations .vertical-char:nth-child(even),
      .with-animations .poetry-line:nth-child(even) {
        animation-delay: 0.2s;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* ===== 响应式优化 ===== */
      @media (max-width: 600px) {
        .poetry-card {
          padding: var(--cf-spacing-md);
          min-height: 180px;
        }
        
        .vertical-title,
        .horizontal-title,
        .classic-title,
        .modern-title {
          font-size: 1.3em;
        }
        
        .vertical-content,
        .horizontal-content,
        .classic-poetry,
        .modern-content {
          font-size: 0.9em;
        }
        
        .vertical-author,
        .horizontal-author,
        .classic-author,
        .modern-meta {
          font-size: 0.8em;
        }
      }
      
      @media (max-width: 400px) {
        .poetry-vertical {
          writing-mode: horizontal-tb;
          text-orientation: mixed;
        }
        
        .vertical-line {
          flex-direction: row;
          gap: 0.5em;
        }
        
        .vertical-punctuation {
          margin: 0 0.2em;
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .poetry-card.background-paper {
          background: #2a2a2a;
          background-image: 
            radial-gradient(#444 1px, transparent 1px),
            radial-gradient(#444 1px, transparent 1px);
        }
        
        .poetry-card.background-ink-wash {
          background: linear-gradient(135deg, #3a3a3a 0%, #2d2d2d 100%);
        }
        
        .vertical-char,
        .poetry-line {
          color: #e0e0e0;
        }
        
        .poetry-classic {
          background: #3a3a3a;
          border-color: #666;
        }
        
        .classic-corner {
          border-color: #8b4513;
        }
      }
    `;
  }
}

export default PoetryCard;
export const manifest = PoetryCard.manifest;
