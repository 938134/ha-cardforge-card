import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property, state } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';
import './card-selector.js';
import './theme-selector.js';
import './form-builder.js';
import '../blocks/block-management.js';

/**
 * 卡片编辑器组件
 */
export class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cards: { state: true },
    _themes: { state: true },
    _selectedCard: { state: true },
    _sections: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
        min-width: 320px;
      }

      .editor-section {
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
        transition: all var(--cf-transition-fast);
      }

      .editor-section:last-child {
        border-bottom: none;
      }

      .editor-section:hover {
        background: rgba(var(--cf-primary-color-rgb), 0.02);
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }

      .section-icon {
        color: var(--cf-text-secondary);
        font-size: 1.2em;
      }

      .section-title {
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-semibold);
        color: var(--cf-text-primary);
        flex: 1;
      }

      .section-description {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-tertiary);
        margin-top: var(--cf-spacing-xs);
        line-height: var(--cf-line-height-normal);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-2xl);
        color: var(--cf-text-secondary);
      }

      .empty-icon {
        font-size: 2.5em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }

      .empty-title {
        font-weight: var(--cf-font-weight-semibold);
        margin-bottom: var(--cf-spacing-xs);
      }

      .empty-description {
        font-size: var(--cf-font-size-sm);
        line-height: var(--cf-line-height-relaxed);
      }

      /* 卡片选择区域 */
      .card-selection {
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-primary-color-rgb), 0.03);
        border-radius: var(--cf-radius-md);
      }

      /* 响应式设计 */
      @container (max-width: 768px) {
        .editor-container {
          min-width: 280px;
        }

        .editor-section {
          padding: var(--cf-spacing-md);
        }
      }

      @container (max-width: 480px) {
        .editor-container {
          min-width: 240px;
        }

        .editor-section {
          padding: var(--cf-spacing-sm);
        }

        .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--cf-spacing-xs);
        }
      }
    `
  ];

  constructor() {
    super();
    this.hass = null;
    this.config = {};
    this._cards = [];
    this._themes = [];
    this._selectedCard = null;
    this._sections = [
      { id: 'card', icon: 'mdi:palette', title: '卡片类型', description: '选择要使用的卡片类型' },
      { id: 'theme', icon: 'mdi:format-paint', title: '主题样式', description: '选择卡片的视觉风格' },
      { id: 'settings', icon: 'mdi:cog', title: '卡片设置', description: '配置卡片的具体参数' },
      { id: 'blocks', icon: 'mdi:cube-outline', title: '块管理', description: '管理卡片中的功能块' }
    ];
  }

  async firstUpdated() {
    await this._initializeSystems();
    this._processInitialConfig();
  }

  setConfig(config) {
    if (!config || typeof config !== 'object') {
      this.config = this._getDefaultConfig();
    } else {
      this.config = { ...config };
    }
    
    if (this.config.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
    }
  }

  /**
   * 初始化系统
   */
  async _initializeSystems() {
    try {
      await Promise.all([
        cardSystem.initialize(),
        themeSystem.initialize()
      ]);

      this._cards = cardSystem.getAllCards();
      this._themes = themeSystem.getAllThemes();

      console.log('卡片系统初始化完成:', {
        cards: this._cards.length,
        themes: this._themes.length
      });

    } catch (error) {
      console.error('系统初始化失败:', error);
      this._cards = [];
      this._themes = [];
    }
  }

  /**
   * 处理初始配置
   */
  _processInitialConfig() {
    if (!this.config.card_type && this._cards.length > 0) {
      const firstCard = this._cards[0];
      this.config = this._buildCardConfig(firstCard.id);
      this._selectedCard = cardSystem.getCard(firstCard.id);
      this._notifyConfigChange();
    } else if (this.config.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
    }
  }

  /**
   * 获取默认配置
   */
  _getDefaultConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',
      theme: 'auto'
    };
  }

  /**
   * 构建卡片配置
   */
  _buildCardConfig(cardId) {
    const cardDef = cardSystem.getCard(cardId);
    if (!cardDef) {
      return this._getDefaultConfig();
    }

    const config = {
      type: 'custom:ha-cardforge-card',
      card_type: cardId,
      theme: 'auto'
    };

    // 应用schema默认值
    const schema = cardDef.CardClass.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined) {
        config[key] = field.default;
      }
    });

    // 如果是预设卡片，初始化块配置
    const blocksConfig = cardDef.CardClass.blocksConfig;
    if (blocksConfig?.type === 'preset' && blocksConfig.blocks) {
      const blocks = {};
      Object.entries(blocksConfig.blocks).forEach(([key, preset]) => {
        const blockId = `preset_${key}_${Date.now()}`;
        blocks[blockId] = {
          entity: '',
          name: preset.name || key,
          icon: preset.icon || 'mdi:cube-outline',
          area: 'content',
          presetKey: key,
          required: preset.required || false
        };
      });
      config.blocks = blocks;
    }

    return config;
  }

  /**
   * 渲染编辑器部分
   */
  _renderEditorSection(section) {
    switch (section.id) {
      case 'card':
        return this._renderCardSelection();
      case 'theme':
        return this._renderThemeSelection();
      case 'settings':
        return this._renderCardSettings();
      case 'blocks':
        return this._renderBlockManagement();
      default:
        return null;
    }
  }

  /**
   * 渲染卡片选择
   */
  _renderCardSelection() {
    if (this._cards.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">
            <ha-icon icon="mdi:package-variant-closed"></ha-icon>
          </div>
          <div class="empty-title">暂无可用卡片</div>
          <div class="empty-description">卡片系统正在初始化...</div>
        </div>
      `;
    }

    return html`
      <div class="card-selection">
        <card-selector 
          .cards=${this._cards}
          .selectedCard=${this.config.card_type}
          @card-changed=${this._handleCardChange}
        ></card-selector>
      </div>
    `;
  }

  /**
   * 渲染主题选择
   */
  _renderThemeSelection() {
    if (!this.config.card_type || this._themes.length === 0) {
      return null;
    }

    return html`
      <theme-selector
        .themes=${this._themes}
        .selectedTheme=${this.config.theme || 'auto'}
        @theme-changed=${this._handleThemeChange}
      ></theme-selector>
    `;
  }

  /**
   * 渲染卡片设置
   */
  _renderCardSettings() {
    if (!this._selectedCard?.CardClass?.schema) {
      return null;
    }

    return html`
      <form-builder
        .schema=${this._selectedCard.CardClass.schema}
        .config=${this.config}
        .hass=${this.hass}
        @config-changed=${this._handleConfigChange}
      ></form-builder>
    `;
  }

  /**
   * 渲染块管理
   */
  _renderBlockManagement() {
    const blocksConfig = this._selectedCard?.CardClass?.blocksConfig;
    if (!blocksConfig) {
      return null;
    }

    return html`
      <block-management
        .config=${this.config}
        .hass=${this.hass}
        .cardDefinition=${{
          blockType: blocksConfig.type,
          presetBlocks: blocksConfig.blocks
        }}
        @config-changed=${this._handleConfigChange}
      ></block-management>
    `;
  }

  /**
   * 处理卡片变化
   */
  _handleCardChange(e) {
    const cardId = e.detail.cardId;
    
    if (this.config.card_type === cardId) {
      return;
    }

    const newConfig = this._buildCardConfig(cardId);
    this.config = newConfig;
    this._selectedCard = cardSystem.getCard(cardId);
    this._notifyConfigChange();
  }

  /**
   * 处理主题变化
   */
  _handleThemeChange(e) {
    if (this.config.theme === e.detail.theme) {
      return;
    }

    this.config = { ...this.config, theme: e.detail.theme };
    this._notifyConfigChange();
  }

  /**
   * 处理配置变化
   */
  _handleConfigChange(e) {
    this.config = { ...this.config, ...e.detail.config };
    this._notifyConfigChange();
  }

  /**
   * 通知配置变化
   */
  _notifyConfigChange() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this.config } },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    const hasCards = this._cards.length > 0;
    const hasSelectedCard = !!this._selectedCard;

    return html`
      <div class="editor-container">
        ${this._sections.map(section => {
          // 条件显示检查
          let shouldShow = true;
          
          switch (section.id) {
            case 'card':
              shouldShow = hasCards;
              break;
            case 'theme':
              shouldShow = hasCards && hasSelectedCard;
              break;
            case 'settings':
              shouldShow = hasCards && hasSelectedCard && 
                         this._selectedCard.CardClass.schema;
              break;
            case 'blocks':
              shouldShow = hasCards && hasSelectedCard && 
                         this._selectedCard.CardClass.blocksConfig;
              break;
          }

          if (!shouldShow) return null;

          return html`
            <div class="editor-section">
              <div class="section-header">
                <ha-icon class="section-icon" .icon=${section.icon}></ha-icon>
                <div class="section-title">${section.title}</div>
              </div>
              
              ${section.description ? html`
                <div class="section-description">${section.description}</div>
              ` : ''}
              
              ${this._renderEditorSection(section)}
            </div>
          `;
        }).filter(Boolean)}
      </div>
    `;
  }

  /**
   * 获取配置（用于编辑器接口）
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 获取默认配置（用于编辑器接口）
   */
  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',
      theme: 'auto'
    };
  }
}

// 注册自定义元素
if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}
