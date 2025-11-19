// src/plugins/poetry-card.js
import { BasePlugin } from '../core/base-plugin.js';

class PoetryCard extends BasePlugin {
  static manifest = {
    id: 'poetry-card',
    name: '诗词卡片',
    version: '1.1.0',
    description: '经典诗词展示卡片，支持完整诗词信息和传统文化风格',
    category: '文化',
    icon: '📜',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['古典卷轴', '书法墨宝', '文人雅士', '水墨意境', '金石篆刻', '宫廷御用'],
        default: '古典卷轴'
      },
      show_author_info: {
        type: 'boolean',
        label: '显示作者信息',
        default: true
      },
      show_dynasty_info: {
        type: 'boolean',
        label: '显示朝代信息',
        default: true
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['卷轴展开', '毛笔书写', '印章落下', '淡入浮现', '无动画'],
        default: '卷轴展开'
      },
      text_alignment: {
        type: 'select',
        label: '文字对齐',
        options: ['左对齐', '居中', '右对齐'],
        default: '居中'
      },
      font_style: {
        type: 'select',
        label: '字体风格',
        options: ['楷书', '行书', '隶书', '篆书', '宋体'],
        default: '楷书'
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
      },
      poetry_translation: {
        name: '诗词译文',
        description: '诗词的现代译文',
        type: 'text',
        required: false,
        default: '',
        example: '明亮的月光洒在窗户纸上... 或 sensor.poetry_translation'
      },
      poetry_notes: {
        name: '诗词注解',
        description: '诗词的创作背景或注解',
        type: 'text',
        required: false,
        default: '',
        example: '这首诗写的是在寂静的月夜... 或 sensor.poetry_notes'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const poetryData = this._getPoetryData(hass, entities);
    const cardStyle = config.card_style || '古典卷轴';
    
    const content = this._renderCardContent(cardStyle, poetryData, config);
    return this._renderCardContainer(content, `poetry-card style-${this._getStyleClass(cardStyle)} font-${this._getFontClass(config.font_style)} alignment-${this._getAlignmentClass(config.text_alignment)}`, config);
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
    const translation = getValue('poetry_translation');
    const notes = getValue('poetry_notes');

    // 如果没有配置数据，显示示例诗词
    if (!title && !author && !content) {
      return {
        title: '静夜思',
        author: '李白',
        dynasty: '唐',
        content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
        translation: '明亮的月光洒在窗户纸上，好像地上泛起了一层霜。\n我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。',
        notes: '这首诗写的是在寂静的月夜思念家乡的感受。',
        isExample: true
      };
    }

    return {
      title: title || '无题',
      author: author || '未知',
      dynasty: dynasty || '未知',
      content: content || '诗词内容为空',
      translation: translation || '',
      notes: notes || '',
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
      'seal': () => this._renderSealStyle(poetryData, config),
      'imperial': () => this._renderImperialStyle(poetryData, config)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['scroll']();
  }

  /* ===== 古典卷轴风格 ===== */
  _renderScrollStyle(poetryData, config) {
    return `
      <div class="scroll-layout">
        <div class="scroll-top"></div>
        <div class="scroll-content">
          <div class="poetry-header">
            <h1 class="poetry-title">《${poetryData.title}》</h1>
            ${config.show_author_info || config.show_dynasty_info ? `
              <div class="poetry-meta">
                ${config.show_author_info ? `<span class="author">${poetryData.author}</span>` : ''}
                ${config.show_dynasty_info ? `<span class="dynasty">[${poetryData.dynasty}]</span>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="poetry-content">
            ${this._formatPoetryContent(poetryData.content)}
          </div>
          ${poetryData.translation ? `
            <div class="poetry-translation">
              <div class="translation-label">【译文】</div>
              <div class="translation-content">${poetryData.translation}</div>
            </div>
          ` : ''}
          ${poetryData.notes ? `
            <div class="poetry-notes">
              <div class="notes-label">【注解】</div>
              <div class="notes-content">${poetryData.notes}</div>
            </div>
          ` : ''}
        </div>
        <div class="scroll-bottom"></div>
        <div class="scroll-seal">${this._getSealText(poetryData.author)}</div>
      </div>
    `;
  }

  /* ===== 书法墨宝风格 ===== */
  _renderCalligraphyStyle(poetryData, config) {
    return `
      <div class="calligraphy-layout">
        <div class="ink-stone"></div>
        <div class="calligraphy-content">
          <div class="calligraphy-header">
            <div class="title-section">
              <h1 class="poetry-title">${poetryData.title}</h1>
              ${config.show_author_info || config.show_dynasty_info ? `
                <div class="author-dynasty">
                  ${config.show_author_info ? `<span class="author">${poetryData.author}</span>` : ''}
                  ${config.show_dynasty_info ? `<span class="dynasty">${poetryData.dynasty}</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="calligraphy-poetry">
            ${this._formatPoetryContent(poetryData.content, true)}
          </div>
          <div class="calligraphy-footer">
            ${poetryData.translation ? `
              <div class="translation-section">
                <div class="section-title">译文</div>
                <div class="translation-text">${poetryData.translation}</div>
              </div>
            ` : ''}
            ${poetryData.notes ? `
              <div class="notes-section">
                <div class="section-title">赏析</div>
                <div class="notes-text">${poetryData.notes}</div>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="brush-pen"></div>
      </div>
    `;
  }

  /* ===== 文人雅士风格 ===== */
  _renderScholarStyle(poetryData, config) {
    return `
      <div class="scholar-layout">
        <div class="scholar-desk"></div>
        <div class="scholar-content">
          <div class="scholar-header">
            <div class="scholar-title">《${poetryData.title}》</div>
            ${config.show_author_info || config.show_dynasty_info ? `
              <div class="scholar-meta">
                ${config.show_author_info ? `<span class="scholar-author">${poetryData.author}</span>` : ''}
                ${config.show_dynasty_info ? `<span class="scholar-dynasty">· ${poetryData.dynasty}</span>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="scholar-poetry">
            ${this._formatPoetryContent(poetryData.content)}
          </div>
          <div class="scholar-annotations">
            ${poetryData.translation || poetryData.notes ? `
              <div class="annotations-container">
                ${poetryData.translation ? `
                  <div class="annotation">
                    <div class="annotation-icon">💬</div>
                    <div class="annotation-content">
                      <div class="annotation-title">译文</div>
                      <div class="annotation-text">${poetryData.translation}</div>
                    </div>
                  </div>
                ` : ''}
                ${poetryData.notes ? `
                  <div class="annotation">
                    <div class="annotation-icon">📖</div>
                    <div class="annotation-content">
                      <div class="annotation-title">赏析</div>
                      <div class="annotation-text">${poetryData.notes}</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>
        <div class="scholar-seal">${this._getSealText(poetryData.author)}</div>
      </div>
    `;
  }

  /* ===== 水墨意境风格 ===== */
  _renderInkStyle(poetryData, config) {
    return `
      <div class="ink-layout">
        <div class="ink-background">
          <div class="ink-splash-1"></div>
          <div class="ink-splash-2"></div>
          <div class="ink-splash-3"></div>
        </div>
        <div class="ink-content">
          <div class="ink-header">
            <div class="ink-title">${poetryData.title}</div>
            ${config.show_author_info || config.show_dynasty_info ? `
              <div class="ink-meta">
                ${config.show_author_info ? `<span class="ink-author">${poetryData.author}</span>` : ''}
                ${config.show_dynasty_info ? `<span class="ink-dynasty">${poetryData.dynasty}</span>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="ink-poetry">
            ${this._formatPoetryContent(poetryData.content)}
          </div>
          ${poetryData.translation || poetryData.notes ? `
            <div class="ink-footnotes">
              ${poetryData.translation ? `
                <div class="footnote">
                  <span class="footnote-marker">※</span>
                  <span class="footnote-text">${poetryData.translation}</span>
                </div>
              ` : ''}
              ${poetryData.notes ? `
                <div class="footnote">
                  <span class="footnote-marker">※</span>
                  <span class="footnote-text">${poetryData.notes}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 金石篆刻风格 ===== */
  _renderSealStyle(poetryData, config) {
    return `
      <div class="seal-layout">
        <div class="stone-tablet">
          <div class="tablet-border"></div>
          <div class="tablet-content">
            <div class="seal-header">
              <div class="seal-title">${poetryData.title}</div>
              ${config.show_author_info || config.show_dynasty_info ? `
                <div class="seal-meta">
                  ${config.show_author_info ? `<span class="seal-author">${poetryData.author}</span>` : ''}
                  ${config.show_dynasty_info ? `<span class="seal-dynasty">${poetryData.dynasty}</span>` : ''}
                </div>
              ` : ''}
            </div>
            <div class="seal-poetry">
              ${this._formatPoetryContent(poetryData.content)}
            </div>
          </div>
        </div>
        <div class="seal-impressions">
          <div class="author-seal">${this._getSealText(poetryData.author)}</div>
          <div class="dynasty-seal">${this._getSealText(poetryData.dynasty)}</div>
        </div>
        ${poetryData.translation || poetryData.notes ? `
          <div class="seal-annotations">
            ${poetryData.translation ? `
              <div class="seal-annotation">
                <div class="annotation-title">铭文释义</div>
                <div class="annotation-text">${poetryData.translation}</div>
              </div>
            ` : ''}
            ${poetryData.notes ? `
              <div class="seal-annotation">
                <div class="annotation-title">金石考据</div>
                <div class="annotation-text">${poetryData.notes}</div>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 宫廷御用风格 ===== */
  _renderImperialStyle(poetryData, config) {
    return `
      <div class="imperial-layout">
        <div class="imperial-banner">
          <div class="bragon-left"></div>
          <div class="imperial-title">御览诗选</div>
          <div class="dragon-right"></div>
        </div>
        <div class="imperial-content">
          <div class="imperial-header">
            <div class="imperial-poetry-title">《${poetryData.title}》</div>
            ${config.show_author_info || config.show_dynasty_info ? `
              <div class="imperial-meta">
                ${config.show_author_info ? `<span class="imperial-author">${poetryData.author}</span>` : ''}
                ${config.show_dynasty_info ? `<span class="imperial-dynasty">${poetryData.dynasty}</span>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="imperial-poetry">
            ${this._formatPoetryContent(poetryData.content)}
          </div>
          <div class="imperial-footer">
            ${poetryData.translation ? `
              <div class="imperial-translation">
                <div class="translation-header">【钦定译文】</div>
                <div class="translation-content">${poetryData.translation}</div>
              </div>
            ` : ''}
            ${poetryData.notes ? `
              <div class="imperial-notes">
                <div class="notes-header">【御批注解】</div>
                <div class="notes-content">${poetryData.notes}</div>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="imperial-seal">御览之宝</div>
      </div>
    `;
  }

  _formatPoetryContent(content, useCalligraphy = false) {
    if (!content) return '<div class="empty-content">诗词内容为空</div>';
    
    const lines = content.split('\n').filter(line => line.trim());
    
    if (useCalligraphy) {
      // 书法风格，每句单独处理
      return lines.map(line => {
        const characters = line.split('');
        return `
          <div class="calligraphy-line">
            ${characters.map(char => `<span class="calligraphy-char">${char}</span>`).join('')}
          </div>
        `;
      }).join('');
    } else {
      // 普通风格
      return lines.map(line => `<div class="poetry-line">${line}</div>`).join('');
    }
  }

  _getSealText(text) {
    if (!text || text.length === 0) return '印';
    if (text.length === 1) return text;
    if (text.length === 2) return text.split('').join('\n');
    return text.substring(0, 2).split('').join('\n');
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '古典卷轴': 'scroll',
      '书法墨宝': 'calligraphy', 
      '文人雅士': 'scholar',
      '水墨意境': 'ink',
      '金石篆刻': 'seal',
      '宫廷御用': 'imperial'
    };
    return styleMap[styleName] || 'scroll';
  }

  _getFontClass(fontStyle) {
    const fontMap = {
      '楷书': 'kaishu',
      '行书': 'xingshu',
      '隶书': 'lishu',
      '篆书': 'zhuanshu',
      '宋体': 'songti'
    };
    return fontMap[fontStyle] || 'kaishu';
  }

  _getAlignmentClass(alignment) {
    const alignmentMap = {
      '左对齐': 'left',
      '居中': 'center', 
      '右对齐': 'right'
    };
    return alignmentMap[alignment] || 'center';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '古典卷轴';
    const styleClass = this._getStyleClass(cardStyle);
    const fontClass = this._getFontClass(config.font_style);
    
    // 使用增强的基类样式
    const baseStyles = this.getEnhancedBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .poetry-card {
        font-family: 'SimSun', 'STKaiti', 'KaiTi', serif;
        position: relative;
        overflow: hidden;
      }

      /* 字体系统 */
      .font-kaishu { font-family: 'STKaiti', 'KaiTi', 'SimSun', serif; }
      .font-xingshu { font-family: 'STXingkai', 'Xingkai SC', cursive; }
      .font-lishu { font-family: 'STLiti', 'LiSu', serif; }
      .font-zhuanshu { font-family: 'STZhongsong', 'SimSun', serif; }
      .font-songti { font-family: 'SimSun', 'NSimSun', serif; }

      /* 对齐系统 */
      .alignment-left { text-align: left; }
      .alignment-center { text-align: center; }
      .alignment-right { text-align: right; }

      /* 通用诗词样式 */
      .poetry-title {
        font-size: 1.6em;
        font-weight: 700;
        margin: 0 0 var(--cf-spacing-md) 0;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      }

      .poetry-content {
        line-height: 2;
        margin: var(--cf-spacing-lg) 0;
      }

      .poetry-line {
        margin-bottom: 0.8em;
        font-size: 1.1em;
      }

      .calligraphy-line {
        margin-bottom: 1.2em;
        display: flex;
        justify-content: center;
        gap: 2px;
      }

      .calligraphy-char {
        display: inline-block;
        font-size: 1.3em;
        font-weight: 600;
        animation: brushStroke 0.5s ease-in-out;
        animation-fill-mode: both;
      }

      .poetry-meta, .author-dynasty, .scholar-meta {
        font-size: 0.9em;
        opacity: 0.8;
        font-style: italic;
        margin-bottom: var(--cf-spacing-lg);
      }

      .author, .dynasty {
        margin: 0 var(--cf-spacing-sm);
      }

      .poetry-translation, .poetry-notes {
        margin-top: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(255,255,255,0.1);
        border-radius: var(--cf-radius-sm);
        font-size: 0.9em;
        line-height: 1.6;
      }

      .translation-label, .notes-label {
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
        color: #8B4513;
      }

      /* ===== 古典卷轴样式 ===== */
      .style-scroll {
        background: linear-gradient(to bottom, #F5F5DC 0%, #F0E68C 100%);
        color: #5D4037;
        border: 2px solid #8B4513;
        padding: 0;
      }

      .scroll-layout {
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .scroll-top, .scroll-bottom {
        height: 40px;
        background: #8B4513;
        position: relative;
        flex-shrink: 0;
      }

      .scroll-top::before, .scroll-bottom::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 20px;
        right: 20px;
        height: 2px;
        background: #D2B48C;
        transform: translateY(-50%);
      }

      .scroll-content {
        flex: 1;
        padding: var(--cf-spacing-xl);
        position: relative;
        overflow: hidden;
      }

      .scroll-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(90deg, transparent 98%, rgba(139, 69, 19, 0.1) 100%),
          linear-gradient(0deg, transparent 98%, rgba(139, 69, 19, 0.1) 100%);
        background-size: 20px 20px;
        pointer-events: none;
      }

      .scroll-seal {
        position: absolute;
        bottom: 60px;
        right: 30px;
        width: 60px;
        height: 60px;
        border: 2px solid #8B4513;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8em;
        font-weight: 700;
        color: #8B4513;
        background: rgba(255,255,255,0.9);
        transform: rotate(-5deg);
        line-height: 1;
        text-align: center;
        white-space: pre-line;
      }

      /* ===== 书法墨宝样式 ===== */
      .style-calligraphy {
        background: linear-gradient(135deg, #2c1810 0%, #3c2818 100%);
        color: #F5DEB3;
      }

      .calligraphy-layout {
        position: relative;
        height: 100%;
        padding: var(--cf-spacing-xl);
      }

      .ink-stone {
        position: absolute;
        bottom: 10px;
        left: 10px;
        width: 80px;
        height: 60px;
        background: #1a1a1a;
        border-radius: 5px;
        opacity: 0.3;
      }

      .ink-stone::before {
        content: '';
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        background: #333;
        border-radius: 3px;
      }

      .calligraphy-content {
        position: relative;
        z-index: 2;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .calligraphy-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-xl);
      }

      .title-section {
        border-bottom: 2px solid #F5DEB3;
        padding-bottom: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-md);
      }

      .calligraphy-poetry {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .calligraphy-footer {
        margin-top: var(--cf-spacing-lg);
      }

      .translation-section, .notes-section {
        margin-bottom: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
        background: rgba(245, 222, 179, 0.1);
        border-radius: var(--cf-radius-sm);
      }

      .section-title {
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
        color: #D2B48C;
      }

      .brush-pen {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 8px;
        height: 120px;
        background: #1a1a1a;
        border-radius: 4px;
        transform: rotate(15deg);
        opacity: 0.5;
      }

      .brush-pen::before {
        content: '';
        position: absolute;
        top: 0;
        left: -2px;
        right: -2px;
        height: 20px;
        background: #8B4513;
        border-radius: 4px;
      }

      /* ===== 文人雅士样式 ===== */
      .style-scholar {
        background: linear-gradient(135deg, #8B7355 0%, #A52A2A 100%);
        color: #FAF0E6;
      }

      .scholar-layout {
        position: relative;
        height: 100%;
        padding: var(--cf-spacing-xl);
      }

      .scholar-desk {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%),
          linear-gradient(0deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%);
        background-size: 40px 40px;
        opacity: 0.1;
      }

      .scholar-content {
        position: relative;
        z-index: 2;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .scholar-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-xl);
      }

      .scholar-title {
        font-size: 1.8em;
        font-weight: 700;
        margin-bottom: var(--cf-spacing-sm);
      }

      .scholar-poetry {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 1.1em;
      }

      .scholar-annotations {
        margin-top: var(--cf-spacing-lg);
      }

      .annotations-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .annotation {
        display: flex;
        gap: var(--cf-spacing-md);
        align-items: flex-start;
      }

      .annotation-icon {
        font-size: 1.2em;
        flex-shrink: 0;
      }

      .annotation-content {
        flex: 1;
      }

      .annotation-title {
        font-weight: 600;
        margin-bottom: var(--cf-spacing-xs);
        color: #D2B48C;
      }

      .annotation-text {
        font-size: 0.9em;
        line-height: 1.5;
        opacity: 0.9;
      }

      .scholar-seal {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border: 1px solid #FAF0E6;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7em;
        font-weight: 700;
        color: #FAF0E6;
        background: rgba(165, 42, 42, 0.5);
        line-height: 1;
        text-align: center;
        white-space: pre-line;
      }

      /* 动画效果 */
      @keyframes brushStroke {
        0% {
          opacity: 0;
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animation-卷轴展开 .scroll-content {
        animation: scrollUnfold 1.5s ease-out;
      }

      .animation-毛笔书写 .calligraphy-char {
        animation-delay: calc(var(--char-index) * 0.1s);
      }

      .animation-印章落下 .scroll-seal,
      .animation-印章落下 .scholar-seal {
        animation: sealDrop 1s ease-out;
      }

      @keyframes scrollUnfold {
        from {
          transform: scaleY(0);
          opacity: 0;
        }
        to {
          transform: scaleY(1);
          opacity: 1;
        }
      }

      @keyframes sealDrop {
        0% {
          transform: translateY(-50px) rotate(-5deg);
          opacity: 0;
        }
        70% {
          transform: translateY(10px) rotate(-5deg);
        }
        100% {
          transform: translateY(0) rotate(-5deg);
          opacity: 1;
        }
      }

      /* 响应式优化 */
      @container cardforge-container (max-width: 400px) {
        .scroll-content {
          padding: var(--cf-spacing-lg);
        }
        
        .calligraphy-layout,
        .scholar-layout {
          padding: var(--cf-spacing-lg);
        }
        
        .poetry-title {
          font-size: 1.4em;
        }
        
        .poetry-line {
          font-size: 1em;
        }
        
        .scroll-seal,
        .scholar-seal {
          width: 40px;
          height: 40px;
          font-size: 0.6em;
        }
      }
    `;
  }
}

export default PoetryCard;
export const manifest = PoetryCard.manifest;