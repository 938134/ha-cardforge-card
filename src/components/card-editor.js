// 卡片编辑器
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';
import { BlockManagement } from '../blocks/index.js';
import './card-selector.js';
import './theme-selector.js';
import './form-builder.js';

class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cards: { state: true },
    _themes: { state: true },
    _selectedCard: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        background: var(--cf-background);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
        min-width: 350px;
      }
      
      .editor-section {
        padding: var(--cf-spacing-lg);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .editor-section:last-child {
        border-bottom: none;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .section-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
    `
  ];

  constructor() {
    super();
    this._cards = [];
    this._themes = [];
    this._selectedCard = null;
  }

  async firstUpdated() {
    await cardSystem.initialize();
    await themeSystem.initialize();
    
    this._cards = cardSystem.getAllCards();
    this._themes = themeSystem.getAllThemes();
    
    this._processInitialConfig();
  }

  setConfig(config) {
    if (!config || typeof config !== 'object') return;
    
    let newConfig = { ...config };
    newConfig = this._ensureDefaultConfig(newConfig);
    
    this.config = newConfig;
    this._selectedCard = cardSystem.getCard(this.config.card_type);
  }

  _processInitialConfig() {
    if (!this.config.card_type && this._cards.length > 0) {
      const firstCard = this._cards[0];
      this.config = this._buildCardConfig(firstCard.id, {});
      this._selectedCard = cardSystem.getCard(firstCard.id);
      this._notifyConfigChange();
    } else if (this.config.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
    }
  }

  render() {
    const selectedCardDef = this._selectedCard;
    
    return html`
      <div class="editor-container">
        <!-- 卡片选择 -->
        <div class="editor-section">
          <div class="section-header">
            <ha-icon icon="mdi:palette"></ha-icon>
            <span class="section-title">选择卡片类型</span>
          </div>
          <card-selector 
            .cards=${this._cards}
            .selectedCard=${this.config.card_type}
            @card-changed=${this._handleCardChange}
          ></card-selector>
        </div>
        
        <!-- 主题选择 -->
        ${this.config.card_type ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:format-paint"></ha-icon>
              <span class="section-title">选择主题</span>
            </div>
            <theme-selector
              .themes=${this._themes}
              .selectedTheme=${this.config.theme}
              @theme-changed=${this._handleThemeChange}
            ></theme-selector>
          </div>
        ` : ''}
        
        <!-- 卡片配置 -->
        ${this.config.card_type && selectedCardDef?.schema ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:cog"></ha-icon>
              <span class="section-title">卡片设置</span>
            </div>
            <form-builder
              .schema=${selectedCardDef.schema}
              .config=${this.config}
              .hass=${this.hass}
              @config-changed=${this._handleConfigChange}
            ></form-builder>
          </div>
        ` : ''}
        
        <!-- 块管理 -->
        ${selectedCardDef?.blockType && selectedCardDef.blockType !== 'none' ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:cube-outline"></ha-icon>
              <span class="section-title">块管理</span>
            </div>
            <block-management
              .config=${this.config}
              .hass=${this.hass}
              .cardType=${this.config.card_type}
              @config-changed=${this._handleConfigChange}
            ></block-management>
          </div>
        ` : ''}
      </div>
    `;
  }

  _handleCardChange(e) {
    const cardId = e.detail.cardId;
    
    if (this.config.card_type === cardId) return;
    
    const newConfig = this._buildCardConfig(cardId, {
      theme: this.config.theme || 'auto'
    });
    
    this._selectedCard = cardSystem.getCard(cardId);
    this.config = newConfig;
    this._notifyConfigChange();
  }

  _handleThemeChange(e) {
    if (this.config.theme === e.detail.theme) return;
    
    this.config = { ...this.config, theme: e.detail.theme };
    this._notifyConfigChange();
  }

  _handleConfigChange(e) {
    this.config = { ...this.config, ...e.detail.config };
    this._notifyConfigChange();
  }

  _ensureDefaultConfig(userConfig) {
    const defaultConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: userConfig.card_type || cardSystem.getDefaultCard()?.id || 'clock',
      theme: userConfig.theme || 'auto'
    };
    
    const card = cardSystem.getCard(defaultConfig.card_type);
    if (card?.schema) {
      Object.entries(card.schema).forEach(([key, field]) => {
        if (field.default !== undefined && userConfig[key] === undefined) {
          defaultConfig[key] = field.default;
        }
      });
    }
    
    return { ...defaultConfig, ...userConfig };
  }

  _buildCardConfig(cardId, baseConfig = {}) {
    const cardDef = cardSystem.getCard(cardId);
    if (!cardDef) {
      return {
        type: 'custom:ha-cardforge-card',
        card_type: cardId,
        theme: baseConfig.theme || 'auto',
        ...baseConfig
      };
    }
    
    const defaultConfig = {};
    const schema = cardDef.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined) {
        defaultConfig[key] = field.default;
      }
    });
    
    const cleanConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: cardId,
      theme: baseConfig.theme || 'auto'
    };
    
    return {
      ...cleanConfig,
      ...defaultConfig
    };
  }

  _notifyConfigChange() {
    const event = new CustomEvent('config-changed', {
      detail: { config: { ...this.config } }
    });
    this.dispatchEvent(event);
  }

  getConfig() {
    return { ...this.config };
  }

  static getStubConfig() {
    return {
      type: 'custom:ha-cardforge-card',
      card_type: 'clock',
      theme: 'auto'
    };
  }
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

export { CardEditor };
