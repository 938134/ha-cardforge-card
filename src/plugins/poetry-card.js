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

// 在诗词卡片的 getStyles 方法中，确保使用正确的样式系统
getStyles(config) {
  const cardStyle = config.card_style || '古典卷轴';
  const styleClass = this._getStyleClass(cardStyle);
  const fontClass = this._getFontClass(config.font_style);
  
  // 使用增强的基类样式 - 确保主题系统正常工作
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

    /* ===== 古典卷轴样式 ===== */
    .style-scroll {
      background: linear-gradient(to bottom, #F5F5DC 0%, #F0E68C 100%);
      color: #5D4037;
      border: 2px solid #8B4513;
      padding: 0;
    }

    /* ===== 书法墨宝样式 ===== */
    .style-calligraphy {
      background: linear-gradient(135deg, #2c1810 0%, #3c2818 100%);
      color: #F5DEB3;
      border: 1px solid #5D4037;
    }

    /* ===== 文人雅士样式 ===== */
    .style-scholar {
      background: linear-gradient(135deg, #8B7355 0%, #A52A2A 100%);
      color: #FAF0E6;
      border: 1px solid #8B4513;
    }

    /* ===== 水墨意境样式 ===== */
    .style-ink {
      background: linear-gradient(135deg, #f5f5dc 0%, #e8e4d9 100%);
      color: #2c1810;
      font-family: 'STKaiti', 'KaiTi', 'SimSun', serif;
      border: 1px solid #8B4513;
    }

    /* ===== 金石篆刻样式 ===== */
    .style-seal {
      background: linear-gradient(135deg, #8B7355 0%, #696969 100%);
      color: #F5F5DC;
      border: 2px solid #5D4037;
    }

    /* ===== 宫廷御用样式 ===== */
    .style-imperial {
      background: linear-gradient(135deg, #8B0000 0%, #B22222 100%);
      color: #FFD700;
      border: 3px double #FFD700;
    }

    /* 其他样式保持不变... */
  `;
}
}

export default PoetryCard;
export const manifest = PoetryCard.manifest;