// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  static manifest = {
    id: 'poetry-card',
    name: '诗词卡片',
    version: '1.0.0',
    description: '经典诗词展示卡片，支持完整诗词信息',
    category: '文化',
    icon: '📜',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['古典卷轴', '书法墨宝', '文人雅士', '水墨意境', '古籍页面', '现代简约'],
        default: '古典卷轴'
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '卷轴展开', '淡入显现', '毛笔书写', '逐字显示', '渐入佳境'],
        default: '卷轴展开'
      },
      show_decoration: {
        type: 'boolean',
        label: '显示装饰元素',
        default: true
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
        options: ['较小', '正常', '较大', '特大'],
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
    
    return `
      <div class="cardforge-responsive-container poetry-card style-${this._getStyleClass(cardStyle)} animation-${config.animation_style || '卷轴展开'} alignment-${this._getAlignmentClass(config.text_alignment)} font-${this._getFontSizeClass(config.font_size)} ${config.show_decoration ? 'with-decoration' : ''}">
        ${this._renderCardContent(cardStyle, poetryData, config)}
      </div>
    `;
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
      'ink': () => this._renderInkStyle(poetryData, config),
      'ancient': () => this._renderAncientStyle(poetryData, config),
      'modern': () => this._renderModernStyle(poetryData, config)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['scroll']();
  }

  /* ===== 古典卷轴风格 ===== */
  _renderScrollStyle(poetryData, config) {
    return `
      <div class="scroll-layout">
        ${config.show_decoration ? `
          <div class="scroll-top"></div>
          <div class="scroll-bottom"></div>
        ` : ''}
        <div class="scroll-content">
          <div class="poetry-header">
            <h1 class="poetry-title">${poetryData.title}</h1>
            <div class="poetry-meta">
              <span class="author">${poetryData.author}</span>
              <span class="dynasty">[${poetryData.dynasty}]</span>
            </div>
          </div>
          <div class="poetry-content">
            ${this._formatPoetryContent(poetryData.content)}
          </div>
          ${config.show_decoration ? `
            <div class="scroll-seal">📜</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 书法墨宝风格 ===== */
  _renderCalligraphyStyle(poetryData, config) {
    return `
      <div class="calligraphy-layout">
        <div class="calligraphy-paper">
          <div class="calligraphy-header">
            <div class="title-section">
              <h1 class="poetry-title">${poetryData.title}</h1>
              <div class="author-dynasty">
                <span class="author">${poetryData.author}</span>
                <span class="dynasty">${poetryData.dynasty}</span>
              </div>
            </div>
          </div>
          <div class="calligraphy-content">
            ${this._formatPoetryContent(poetryData.content, true)}
          </div>
          ${config.show_decoration ? `
            <div class="calligraphy-seal">
              <div class="seal-text">墨宝</div>
            </div>
            <div class="ink-stone">🖌️</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 文人雅士风格 ===== */
  _renderScholarStyle(poetryData, config) {
    return `
      <div class="scholar-layout">
        <div class="scholar-desk">
          ${config.show_decoration ? `
            <div class="desk-items">
              <div class="scholar-statue">🎎</div>
              <div class="tea-cup">🍵</div>
              <div class="bamboo">🎋</div>
            </div>
          ` : ''}
          <div class="scholar-content">
            <div class="scholar-header">
              <div class="poetry-title">《${poetryData.title}》</div>
              <div class="scholar-meta">
                <span class="author">${poetryData.author}</span>
                <span class="dynasty">· ${poetryData.dynasty}</span>
              </div>
            </div>
            <div class="scholar-poetry">
              ${this._formatPoetryContent(poetryData.content)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ===== 水墨意境风格 ===== */
  _renderInkStyle(poetryData, config) {
    return `
      <div class="ink-layout">
        <div class="ink-background">
          ${config.show_decoration ? `
            <div class="ink-mountain">⛰️</div>
            <div class="ink-bird">🐦</div>
            <div class="ink-boat">🚣</div>
          ` : ''}
        </div>
        <div class="ink-content">
          <div class="ink-title">${poetryData.title}</div>
          <div class="ink-meta">
            <span class="ink-author">${poetryData.author}</span>
            <span class="ink-dynasty">${poetryData.dynasty}</span>
          </div>
          <div class="ink-poetry">
            ${this._formatPoetryContent(poetryData.content)}
          </div>
        </div>
      </div>
    `;
  }

  /* ===== 古籍页面风格 ===== */
  _renderAncientStyle(poetryData, config) {
    return `
      <div class="ancient-layout">
        <div class="ancient-page">
          <div class="page-header">
            <div class="page-title">${poetryData.title}</div>
            <div class="page-meta">
              <span class="page-author">${poetryData.author}</span>
              <span class="page-dynasty">${poetryData.dynasty}</span>
            </div>
          </div>
          <div class="page-content">
            <div class="ancient-poetry">
              ${this._formatPoetryContent(poetryData.content)}
            </div>
          </div>
          ${config.show_decoration ? `
            <div class="page-footer">
              <div class="page-number">· 壹 ·</div>
              <div class="ancient-pattern">卍</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 现代简约风格 ===== */
  _renderModernStyle(poetryData, config) {
    return `
      <div class="modern-layout">
        <div class="modern-header">
          <div class="modern-title">${poetryData.title}</div>
          <div class="modern-meta">
            <div class="modern-author">${poetryData.author}</div>
            <div class="modern-dynasty">${poetryData.dynasty}</div>
          </div>
        </div>
        <div class="modern-content">
          <div class="modern-poetry">
            ${this._formatPoetryContent(poetryData.content)}
          </div>
        </div>
        ${config.show_decoration ? `
          <div class="modern-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-dot"></div>
            <div class="decoration-line"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _formatPoetryContent(content, useBr = false) {
    if (!content) return '<div class="empty-content">诗词内容为空</div>';
    
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
      '水墨意境': 'ink',
      '古籍页面': 'ancient',
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
      '较大': 'large',
      '特大': 'xlarge'
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
        padding: var(--cf-spacing-xl);
        min-height: 300px;
        position: relative;
        overflow: hidden;
        font-family: 'SimSun', 'STKaiti', 'KaiTi', serif;
      }
      
      .poetry-title {
        margin: 0;
        font-weight: 700;
        line-height: 1.2;
      }
      
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
      .font-small .poetry-content { font-size: 0.9em; }
      .font-normal .poetry-content { font-size: 1em; }
      .font-large .poetry-content { font-size: 1.2em; }
      .font-xlarge .poetry-content { font-size: 1.4em; }
      
      .font-small .poetry-title { font-size: 1.3em; }
      .font-normal .poetry-title { font-size: 1.5em; }
      .font-large .poetry-title { font-size: 1.8em; }
      .font-xlarge .poetry-title { font-size: 2.2em; }
      
      /* 文字对齐 */
      .alignment-left { text-align: left; }
      .alignment-center { text-align: center; }
      .alignment-right { text-align: right; }
      
      /* ===== 古典卷轴风格 ===== */
      .style-scroll {
        background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
        color: #F5DEB3;
        border: 8px solid #D2B48C;
        border-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23D2B48C"/></svg>') 8 round;
      }
      .scroll-layout {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .scroll-top, .scroll-bottom {
        height: 20px;
        background: #8B4513;
        border: 2px solid #A0522D;
        position: absolute;
        left: -8px;
        right: -8px;
      }
      .scroll-top {
        top: -8px;
        border-bottom: 1px solid #A0522D;
      }
      .scroll-bottom {
        bottom: -8px;
        border-top: 1px solid #A0522D;
      }
      .scroll-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--cf-spacing-lg);
        background: repeating-linear-gradient(
          to bottom,
          #F5DEB3,
          #F5DEB3 2px,
          #E8D0A9 2px,
          #E8D0A9 4px
        );
        margin: 20px 0;
        position: relative;
      }
      .scroll-seal {
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-size: 1.5em;
        opacity: 0.6;
      }
      
      /* ===== 书法墨宝风格 ===== */
      .style-calligraphy {
        background: linear-gradient(135deg, #2F1B0A 0%, #4A3520 100%);
        color: #8B4513;
      }
      .calligraphy-layout {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .calligraphy-paper {
        background: #FEFEF7;
        padding: var(--cf-spacing-xl);
        border: 1px solid #8B4513;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        position: relative;
        max-width: 90%;
      }
      .calligraphy-header {
        border-bottom: 2px solid #8B4513;
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
        font-size: 0.9em;
      }
      .calligraphy-content {
        font-weight: 600;
        line-height: 2;
      }
      .calligraphy-seal {
        position: absolute;
        bottom: 20px;
        left: 20px;
        width: 60px;
        height: 60px;
        border: 2px solid #8B4513;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-15deg);
        opacity: 0.7;
      }
      .seal-text {
        font-size: 0.8em;
        font-weight: 700;
        color: #8B4513;
      }
      .ink-stone {
        position: absolute;
        bottom: 20px;
        right: 20px;
        font-size: 1.2em;
        opacity: 0.5;
      }
      
      /* ===== 文人雅士风格 ===== */
      .style-scholar {
        background: linear-gradient(135deg, #8FBC8F 0%, #2E8B57 100%);
        color: #2F4F4F;
      }
      .scholar-layout {
        height: 100%;
      }
      .scholar-desk {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .desk-items {
        position: absolute;
        top: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }
      .scholar-statue, .tea-cup, .bamboo {
        font-size: 1.5em;
        opacity: 0.7;
      }
      .scholar-content {
        background: rgba(255,255,255,0.95);
        padding: var(--cf-spacing-xl);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        max-width: 80%;
      }
      .scholar-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-lg);
      }
      .scholar-meta {
        margin-top: var(--cf-spacing-sm);
        font-size: 0.9em;
        opacity: 0.8;
      }
      .scholar-poetry {
        line-height: 1.8;
      }
      
      /* ===== 水墨意境风格 ===== */
      .style-ink {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
        color: #e0e0e0;
        position: relative;
      }
      .ink-layout {
        height: 100%;
        position: relative;
      }
      .ink-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.1;
      }
      .ink-mountain, .ink-bird, .ink-boat {
        position: absolute;
        font-size: 2em;
      }
      .ink-mountain { top: 20px; left: 20px; }
      .ink-bird { top: 50px; right: 40px; }
      .ink-boat { bottom: 30px; left: 60px; }
      .ink-content {
        position: relative;
        z-index: 2;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
      }
      .ink-title {
        font-size: 1.8em;
        font-weight: 700;
        margin-bottom: var(--cf-spacing-sm);
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      }
      .ink-meta {
        margin-bottom: var(--cf-spacing-lg);
        opacity: 0.8;
        font-size: 0.9em;
      }
      .ink-poetry {
        line-height: 2;
        font-weight: 500;
      }
      
      /* ===== 古籍页面风格 ===== */
      .style-ancient {
        background: linear-gradient(135deg, #8B7355 0%, #A0522D 100%);
        color: #8B4513;
      }
      .ancient-layout {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ancient-page {
        background: #F5F5DC;
        padding: var(--cf-spacing-xl);
        border: 1px solid #8B4513;
        box-shadow: 8px 8px 0px rgba(0,0,0,0.2);
        position: relative;
        max-width: 90%;
        height: 90%;
      }
      .page-header {
        border-bottom: 1px solid #8B4513;
        padding-bottom: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }
      .page-title {
        font-size: 1.6em;
        font-weight: 700;
        text-align: center;
      }
      .page-meta {
        text-align: center;
        margin-top: var(--cf-spacing-sm);
        font-size: 0.9em;
        opacity: 0.8;
      }
      .page-content {
        height: calc(100% - 100px);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ancient-poetry {
        line-height: 1.8;
        text-align: center;
      }
      .page-footer {
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: space-between;
        padding: 0 var(--cf-spacing-lg);
        font-size: 0.8em;
        opacity: 0.6;
      }
      .ancient-pattern {
        font-family: serif;
      }
      
      /* ===== 现代简约风格 ===== */
      .style-modern {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        color: #495057;
        border: 1px solid #dee2e6;
      }
      .modern-layout {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .modern-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-lg);
      }
      .modern-title {
        font-size: 1.8em;
        font-weight: 700;
        margin-bottom: var(--cf-spacing-sm);
        color: #212529;
      }
      .modern-meta {
        display: flex;
        justify-content: center;
        gap: var(--cf-spacing-md);
        font-size: 0.9em;
        opacity: 0.7;
      }
      .modern-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modern-poetry {
        line-height: 1.8;
        max-width: 600px;
      }
      .modern-decoration {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-lg);
      }
      .decoration-line {
        flex: 1;
        height: 1px;
        background: #dee2e6;
      }
      .decoration-dot {
        width: 4px;
        height: 4px;
        background: #adb5bd;
        border-radius: 50%;
      }
      
      /* 动画效果 */
      .animation-卷轴展开 .scroll-content {
        animation: scrollUnfold 1.5s ease-out;
      }
      
      .animation-毛笔书写 .calligraphy-content {
        animation: brushWrite 2s ease-in-out;
      }
      
      .animation-逐字显示 .poetry-line {
        animation: typewriter 0.5s ease-in;
        animation-fill-mode: both;
      }
      
      .poetry-line:nth-child(1) { animation-delay: 0.2s; }
      .poetry-line:nth-child(2) { animation-delay: 0.7s; }
      .poetry-line:nth-child(3) { animation-delay: 1.2s; }
      .poetry-line:nth-child(4) { animation-delay: 1.7s; }
      
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
      
      @keyframes typewriter {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* 响应式设计 */
      @media (max-width: 600px) {
        .poetry-card {
          padding: var(--cf-spacing-lg);
          min-height: 250px;
        }
        .calligraphy-paper, .ancient-page {
          max-width: 95%;
          padding: var(--cf-spacing-lg);
        }
        .scholar-content {
          max-width: 90%;
          padding: var(--cf-spacing-lg);
        }
        .font-xlarge .poetry-title { font-size: 1.8em; }
        .font-xlarge .poetry-content { font-size: 1.2em; }
      }
    `;
  }
}

export default PoetryCard;
export const manifest = PoetryCard.manifest;