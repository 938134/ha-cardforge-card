// src/editors/card-editor.js - 修复版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';

class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cards: { state: true },
    _themes: { state: true },
    _selectedCard: { state: true },
    _initialized: { state: true }
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
      
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2.5em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }
    `
  ];

  constructor() {
    super();
    this._cards = [];
    this._themes = [];
    this._selectedCard = null;
    this._initialized = false;
  }

  async firstUpdated() {
    await cardSystem.initialize();
    await themeSystem.initialize();
    
    this._cards = cardSystem.getAllCards();
    this._themes = themeSystem.getAllThemes();
    this._initialized = true;
    
    if (this.config?.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
    } else if (this._cards.length > 0) {
      this._selectCard(this._cards[0].id);
    }
  }

  setConfig(config) {
    if (!config || typeof config !== 'object') {
      this.config = this.constructor.getDefaultConfig();
      return;
    }
    
    const newConfig = { ...config };
    
    if (!newConfig.card_type) {
      if (this._cards.length > 0) {
        newConfig.card_type = this._cards[0].id;
      } else {
        newConfig.card_type = 'clock';
      }
    }
    
    delete newConfig.cardType;
    
    this.config = {
      type: 'custom:ha-cardforge-card',
      card_type: newConfig.card_type || 'clock',
      theme: newConfig.theme || 'auto',
      ...newConfig
    };
    
    if (this.config.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
    }
    
    this.requestUpdate();
  }

  render() {
    if (!this._initialized) {
      return html`
        <div class="editor-container">
          <div class="editor-section">
            <div class="empty-state">
              <div class="empty-icon">⏳</div>
              <div>初始化编辑器中...</div>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="editor-container">
        <!-- 卡片选择器 -->
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
        
        ${this.config.card_type ? html`
          <!-- 主题选择器 -->
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:format-paint"></ha-icon>
              <span class="section-title">选择主题</span>
            </div>
            <theme-selector
              .themes=${this._themes}
              .selectedTheme=${this.config.theme || 'auto'}
              @theme-changed=${this._handleThemeChange}
            ></theme-selector>
          </div>
        ` : ''}
        
        <!-- 卡片设置表单 -->
        ${this.config.card_type && this._selectedCard?.schema ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:cog"></ha-icon>
              <span class="section-title">卡片设置</span>
            </div>
            <form-builder
              .config=${this.config}
              .schema=${this._selectedCard.schema}
              .hass=${this.hass}
              @config-changed=${this._handleConfigChange}
            ></form-builder>
          </div>
        ` : ''}
      </div>
    `;
  }

  _handleCardChange(e) {
    const cardId = e.detail.cardId;
    if (this.config.card_type === cardId) return;
    
    const cardDef = cardSystem.getCard(cardId);
    if (!cardDef) return;
    
    const newConfig = this._buildCardConfig(cardId);
    
    if (cardDef.blocks?.presets && !this.config.blocks) {
      const presetBlocks = {};
      Object.entries(cardDef.blocks.presets).forEach(([key, preset], index) => {
        const blockId = `block_${key}_${Date.now()}_${index}`;
        presetBlocks[blockId] = {
          ...preset,
          name: preset.name || key,
          content: preset.content || ''
        };
      });
      
      if (Object.keys(presetBlocks).length > 0) {
        newConfig.blocks = presetBlocks;
      }
    }
    
    this.config = newConfig;
    this._selectedCard = cardDef;
    
    this._notifyConfigChange();
  }

  _handleThemeChange(e) {
    const themeId = e.detail.theme;
    if (this.config.theme === themeId) return;
    
    this.config = { ...this.config, theme: themeId };
    this._notifyConfigChange();
  }

  _handleConfigChange(e) {
    const changedConfig = e.detail.config;
    this.config = { ...this.config, ...changedConfig };
    this._notifyConfigChange();
  }

  _buildCardConfig(cardId) {
    const cardDef = cardSystem.getCard(cardId);
    const defaultConfig = {};
    
    if (cardDef?.schema) {
      Object.entries(cardDef.schema).forEach(([key, field]) => {
        if (field.default !== undefined) {
          defaultConfig[key] = field.default;
        }
      });
    }
    
    return {
      type: 'custom:ha-cardforge-card',
      card_type: cardId,
      theme: this.config?.theme || 'auto',
      ...defaultConfig
    };
  }

  _notifyConfigChange() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { config: { ...this.config } }
    }));
  }

  getConfig() {
    return { ...this.config };
  }

  static getDefaultConfig() {
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