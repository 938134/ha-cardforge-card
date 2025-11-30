// src/editors/card-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardRegistry } from '../core/card-registry.js';
import { themeManager } from '../core/theme-manager.js';
import { designSystem } from '../core/design-system.js';
import './card-selector.js';
import './theme-selector.js';
import './block-management.js';
import './form-builder.js';

class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cards: { state: true },
    _themes: { state: true },
    _selectedCard: { state: true },
    _initialized: { state: true },
    _availableEntities: { state: true },
    _cardSchema: { state: true },
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        background: var(--cf-background);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-shadow-sm);
        overflow: hidden;
        min-height: 500px;
        container-type: inline-size;
        container-name: cardforge-editor;
      }
      .editor-layout {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .editor-section {
        background: var(--cf-surface);
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
    `,
  ];

  constructor() {
    super();
    this.config = {
      type: 'custom:ha-cardforge-card',
      card_type: '',
      theme: 'auto',
      areas: {},
      blocks: {},
    };
    this._cards = [];
    this._themes = [];
    this._selectedCard = null;
    this._initialized = false;
    this._availableEntities = [];
    this._cardSchema = null;
  }

  async firstUpdated() {
    await cardRegistry.initialize();
    await themeManager.initialize();
    this._cards = cardRegistry.getAllCards();
    this._themes = themeManager.getAllThemes();
    this._initialized = true;
    if (this.config.card_type) this._loadCardInstance();
  }

  setConfig(config) {
    this.config = { ...config };
    this._loadCardInstance();
  }

  render() {
    if (!this._initialized) return this._renderLoading();

    return html`
      <div class="editor-container">
        <div class="editor-layout">
          ${this._renderCardSelectionSection()}
          ${this.config.card_type ? this._renderThemeSection() : ''}
          ${this.config.card_type && this._cardSchema ? this._renderCardSettings() : ''}
          ${this._shouldShowBlockManagement() ? this._renderBlockManagement() : ''}
        </div>
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="editor-section">
        <div class="cf-flex cf-flex-center cf-p-lg">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="cf-text-md cf-m-sm">初始化编辑器...</div>
        </div>
      </div>
    `;
  }

  _renderCardSelectionSection() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:palette"></ha-icon>
          <span class="section-title">卡片类型</span>
        </div>
        <card-selector
          .cards=${this._cards}
          .selectedCard=${this.config.card_type}
          @card-changed=${this._onCardChanged}
        ></card-selector>
      </div>
    `;
  }

  _renderThemeSection() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:format-paint"></ha-icon>
          <span class="section-title">主题样式</span>
        </div>
        <theme-selector
          .themes=${this._themes}
          .selectedTheme=${this.config.theme}
          @theme-changed=${this._onThemeChanged}
        ></theme-selector>
      </div>
    `;
  }

  _renderCardSettings() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:tune"></ha-icon>
          <span class="section-title">卡片设置</span>
        </div>
        <form-builder
          .config=${this.config}
          .schema=${this._cardSchema}
          .hass=${this.hass}
          .availableEntities=${this._availableEntities}
          @config-changed=${this._onConfigChanged}
        ></form-builder>
      </div>
    `;
  }

  _renderBlockManagement() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:cube"></ha-icon>
          <span class="section-title">块管理</span>
        </div>
        <block-management
          .config=${this.config}
          .hass=${this.hass}
          @config-changed=${this._onConfigChanged}
        ></block-management>
      </div>
    `;
  }

  _shouldShowBlockManagement() {
    // 只有选择了卡片类型时才显示块管理
    if (!this.config.card_type) return false;
    
    // 获取卡片块模式
    const card = cardRegistry.getCard(this.config.card_type);
    const blockMode = card?.manifest?.block_mode || 'custom';
    
    // 无块模式不显示块管理
    if (blockMode === 'none') return false;
    
    // 其他模式根据块数量决定
    const blockCount = Object.keys(this.config.blocks || {}).length;
    return blockCount > 0 || blockMode === 'custom';
  }

  _onCardChanged(e) {
    const cardType = e.detail.cardId;
    this.config = { ...this.config, card_type: cardType };
    this._loadCardInstance();
    const cardInstance = cardRegistry.createCardInstance(cardType);
    if (cardInstance) {
      const defaultConfig = cardInstance.getDefaultConfig();
      this.config = { ...this.config, areas: defaultConfig.areas, blocks: defaultConfig.blocks };
    }
    this._notifyConfigUpdate();
  }

  _onThemeChanged(e) {
    this.config = { ...this.config, theme: e.detail.theme };
    this._notifyConfigUpdate();
  }

  _onConfigChanged(e) {
    this.config = { ...this.config, ...e.detail.config };
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this.config } }));
    this.requestUpdate();
  }

  _loadCardInstance() {
    this._selectedCard = cardRegistry.getCard(this.config.card_type);
    this._cardSchema = this._selectedCard?.manifest?.config_schema || null;
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateAvailableEntities();
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }
    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  getConfig() {
    return this.config;
  }
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}
export { CardEditor };