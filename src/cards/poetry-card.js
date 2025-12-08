import { BaseCard } from '../core/base-card.js';
import { html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { 
  getEntityState,
  getDefaultQuote,
  splitPoetryContent 
} from '../core/card-tools.js';

/**
 * 诗词卡片 - 显示经典诗词，支持标题、朝代、作者、全文、译文
 */
export class PoetryCard extends BaseCard {
  static properties = {
    ...BaseCard.properties,
    _poetryData: { state: true }
  };

  // 卡片配置模式
  static schema = {
    fontSize: {
      type: 'select',
      label: '字体大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    },
    showTranslation: {
      type: 'boolean',
      label: '显示译文',
      default: true
    },
    fontFamily: {
      type: 'select',
      label: '字体风格',
      options: [
        { value: 'serif', label: '衬线体（传统）' },
        { value: 'sans-serif', label: '无衬线体（现代）' },
        { value: 'handwriting', label: '手写体' }
      ],
      default: 'serif'
    }
  };

  // 块配置
  static blocksConfig = {
    type: 'preset',
    blocks: {
      poetry_title: {
        name: '诗词标题',
        icon: 'mdi:format-title',
        required: true
      },
      poetry_dynasty: {
        name: '朝代',
        icon: 'mdi:calendar-clock',
        required: false
      },
      poetry_author: {
        name: '作者',
        icon: 'mdi:account',
        required: false
      },
      poetry_content: {
        name: '诗词全文',
        icon: 'mdi:format-quote-close',
        required: true
      },
      poetry_translation: {
        name: '诗词译文',
        icon: 'mdi:translate',
        required: false
      }
    }
  };

  // 卡片元数据
  static meta = {
    name: '诗词',
    description: '显示经典诗词，支持标题、朝代、作者、全文、译文',
    icon: '📜',
    category: '文化',
    tags: ['诗词', '文学', '文化'],
    recommendedSize: 4
  };

  // 卡片特有样式
  static styles = [
    BaseCard.styles,
    css`
      .poetry-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: var(--cf-spacing-xl);
        text-align: center;
        transition: all var(--cf-transition-normal);
      }

      /* 字体大小控制 */
      .font-small { font-size: 0.9em; }
      .font-medium { font-size: 1em; }
      .font-large { font-size: 1.1em; }

      /* 字体风格控制 */
      .font-serif {
        font-family: 'Noto Serif SC', 'Source Han Serif SC', 'STZhongsong', 'SimSun', serif;
      }

      .font-sans-serif {
        font-family: var(--cf-font-family-base);
      }

      .font-handwriting {
        font-family: 'Ma Shan Zheng', 'ZCOOL XiaoWei', cursive;
      }

      /* 标题区域 */
      .title-section {
        margin-bottom: var(--cf-spacing-lg);
      }

      .poetry-title {
        font-size: var(--cf-font-size-2xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .poetry-meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        color: var(--cf-text-secondary);
        font-size: var(--cf-font-size-sm);
        font-style: italic;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
      }

      /* 内容区域 */
      .content-section {
        width: 100%;
        max-width: 600px;
        margin: var(--cf-spacing-lg) 0;
      }

      .poetry-divider {
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent, 
          var(--cf-primary-color), 
          transparent);
        margin: var(--cf-spacing-lg) auto;
        opacity: 0.6;
      }

      .poetry-lines {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .poetry-line {
        font-size: var(--cf-font-size-lg);
        line-height: var(--cf-line-height-relaxed);
        color: var(--cf-text-primary);
        letter-spacing: 0.5px;
        transition: all var(--cf-transition-normal);
      }

      .poetry-line:hover {
        color: var(--cf-primary-color);
        transform: translateX(4px);
      }

      /* 译文区域 */
      .translation-section {
        width: 100%;
        max-width: 600px;
        margin-top: var(--cf-spacing-xl);
      }

      .translation-divider {
        width: 40px;
        height: 1px;
        background: var(--cf-border);
        margin: var(--cf-spacing-lg) auto;
      }

      .translation-label {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-accent-color);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: var(--cf-spacing-md);
      }

      .translation-content {
        text-align: left;
        font-size: var(--cf-font-size-md);
        line-height: var(--cf-line-height-relaxed);
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-lg);
        background: var(--cf-surface-elevated);
        border-radius: var(--cf-radius-lg);
        border-left: 4px solid var(--cf-accent-color);
      }

      /* 空状态 */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--cf-text-tertiary);
        text-align: center;
        gap: var(--cf-spacing-lg);
      }

      .empty-icon {
        font-size: 3em;
        opacity: 0.5;
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .poetry-card {
          padding: var(--cf-spacing-lg);
        }

        .poetry-title {
          font-size: var(--cf-font-size-xl);
        }

        .poetry-line {
          font-size: var(--cf-font-size-md);
        }

        .translation-content {
          padding: var(--cf-spacing-md);
          font-size: var(--cf-font-size-sm);
        }
      }

      @container cardforge-container (max-width: 400px) {
        .poetry-card {
          padding: var(--cf-spacing-md);
        }

        .poetry-title {
          font-size: var(--cf-font-size-lg);
        }

        .poetry-meta {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }

        .poetry-line {
          font-size: var(--cf-font-size-sm);
        }

        .content-section,
        .translation-section {
          max-width: 100%;
        }
      }

      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .translation-content {
          background: rgba(255, 255, 255, 0.05);
        }
      }
    `
  ];

  constructor() {
    super();
    this._poetryData = null;
  }

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      this._updatePoetryData();
    }
  }

  /**
   * 更新诗词数据
   */
  _updatePoetryData() {
    const blocks = this.config?.blocks || {};
    const poetryData = {};

    // 从块中提取数据
    Object.entries(blocks).forEach(([_, block]) => {
      if (block.presetKey && this.hass?.states) {
        const key = block.presetKey;
        const value = block.entity ? 
          getEntityState(this.hass, block.entity, '') : '';

        if (value && key.startsWith('poetry_')) {
          const field = key.replace('poetry_', '');
          poetryData[field] = {
            value,
            icon: block.icon,
            hasEntity: !!block.entity
          };
        }
      }
    });

    // 设置默认数据（如果没有配置实体）
    if (!poetryData.title) {
      poetryData.title = {
        value: '静夜思',
        icon: 'mdi:format-title',
        hasEntity: false
      };
    }

    if (!poetryData.content) {
      poetryData.content = {
        value: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',
        icon: 'mdi:format-quote-close',
        hasEntity: false
      };
    }

    this._poetryData = poetryData;
  }

  /**
   * 处理卡片数据
   */
  async processCardData() {
    const { 
      fontSize = 'medium', 
      fontFamily = 'serif',
      showTranslation = true 
    } = this.config;

    if (!this._poetryData) {
      return { isEmpty: true };
    }

    // 处理诗词内容
    const content = this._poetryData.content?.value || '';
    const contentLines = splitPoetryContent(content);

    // 处理译文
    const translation = showTranslation ? 
      this._poetryData.translation?.value || '' : '';

    return {
      title: this._poetryData.title?.value,
      dynasty: this._poetryData.dynasty?.value,
      author: this._poetryData.author?.value,
      content: contentLines,
      translation,
      fontSize,
      fontFamily,
      showTranslation,
      isEmpty: false
    };
  }

  /**
   * 渲染卡片内容
   */
  renderCardContent() {
    if (this.renderData?.isEmpty) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">📜</div>
          <div>诗词卡片需要配置内容</div>
          <div style="font-size: var(--cf-font-size-sm);">
            请为每个预设块配置对应的实体
          </div>
        </div>
      `;
    }

    const {
      title,
      dynasty,
      author,
      content,
      translation,
      fontSize,
      fontFamily,
      showTranslation
    } = this.renderData;

    return html`
      <div class="poetry-card font-${fontSize} font-${fontFamily}">
        <!-- 标题和元信息 -->
        <div class="title-section">
          ${title ? html`
            <div class="poetry-title">${title}</div>
          ` : ''}
          
          ${(dynasty || author) ? html`
            <div class="poetry-meta">
              ${dynasty ? html`
                <div class="meta-item dynasty">
                  <ha-icon icon="mdi:calendar-clock" style="width: 16px; height: 16px;"></ha-icon>
                  <span>${dynasty}</span>
                </div>
              ` : ''}
              
              ${dynasty && author ? html`<span>·</span>` : ''}
              
              ${author ? html`
                <div class="meta-item author">
                  <ha-icon icon="mdi:account" style="width: 16px; height: 16px;"></ha-icon>
                  <span>${author}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- 诗词内容 -->
        ${content.length > 0 ? html`
          <div class="content-section">
            <div class="poetry-divider"></div>
            <div class="poetry-lines">
              ${content.map(line => html`
                <div class="poetry-line">${line}</div>
              `)}
            </div>
          </div>
        ` : ''}

        <!-- 译文 -->
        ${showTranslation && translation ? html`
          <div class="translation-section">
            <div class="translation-divider"></div>
            <div class="translation-label">译文</div>
            <div class="translation-content">${translation}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 获取卡片尺寸
   */
  getCardSize() {
    return this.config?.card_size || 4;
  }
}

// 注册卡片
if (!customElements.get('poetry-card')) {
  customElements.define('poetry-card', PoetryCard);
}

// 导出卡片类供卡片系统使用
export default PoetryCard;
