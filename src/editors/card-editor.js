// src/editors/card-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardRegistry } from '../core/card-registry.js';
import { themeManager } from '../themes/index.js';
import { designSystem } from '../core/design-system.js';
import './card-selector.js';
import './theme-selector.js';
import './block-list.js';
import './block-properties.js';
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
    // 统一编辑状态
    _blockEditorState: { state: true },
    _configVersion: { state: true } // 新增：配置版本号，用于强制更新
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
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid var(--cf-primary-color);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
    `
  ];

  constructor() {
    super();
    this.config = {
      type: 'custom:ha-cardforge-card',
      card_type: '',
      theme: 'auto',
      areas: {},
      blocks: {}
    };
    this._cards = [];
    this._themes = [];
    this._selectedCard = null;
    this._initialized = false;
    this._availableEntities = [];
    this._cardSchema = null;
    
    // 统一块编辑状态管理
    this._blockEditorState = {
      editingBlockId: null,
      editingArea: 'content',
      tempConfig: null
    };
    
    this._configVersion = 0; // 配置版本号
  }

  async firstUpdated() {
    await cardRegistry.initialize();
    await themeManager.initialize();
    
    this._cards = cardRegistry.getAllCards();
    this._themes = themeManager.getAllThemes();
    this._initialized = true;
    
    if (this.config.card_type) {
      this._loadCardInstance();
    }
  }

  setConfig(config) {
    // 深拷贝配置，避免引用问题
    this.config = JSON.parse(JSON.stringify({
      type: 'custom:ha-cardforge-card',
      card_type: '',
      theme: 'auto',
      areas: {},
      blocks: {},
      ...config
    }));
    
    if (this.config.card_type && this._initialized) {
      this._loadCardInstance();
    }
    
    this._configVersion++; // 配置更新时增加版本号
  }

  _loadCardInstance() {
    this._selectedCard = cardRegistry.getCard(this.config.card_type);
    this._cardSchema = this._selectedCard?.manifest?.config_schema || null;
    
    // 如果没有区域配置，使用卡片的默认配置
    if (!this.config.areas || Object.keys(this.config.areas).length === 0) {
      const cardInstance = cardRegistry.createCardInstance(this.config.card_type);
      if (cardInstance) {
        const defaultConfig = cardInstance.getDefaultConfig();
        // 深拷贝默认配置
        this.config.areas = JSON.parse(JSON.stringify(defaultConfig.areas || {}));
        this.config.blocks = JSON.parse(JSON.stringify(defaultConfig.blocks || {}));
      }
    }
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container">
        <div class="editor-layout">
          ${this._renderCardSelectionSection()}
          ${this.config.card_type ? this._renderThemeSection() : ''}
          ${this.config.card_type && this._cardSchema ? this._renderCardSettings() : ''}
          ${this.config.card_type ? this._renderBlockManagement() : ''}
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
          <span class="section-title">选择卡片类型</span>
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
        
        <block-list
          .config=${this.config}
          .hass=${this.hass}
          .editorState=${this._blockEditorState}
          .configVersion=${this._configVersion} <!-- 传递版本号 -->
          @config-changed=${this._onConfigChanged}
          @editor-state-changed=${this._onEditorStateChanged}
        ></block-list>
        
        ${this._blockEditorState.editingBlockId ? html`
          <div class="editor-section" style="border-top: 2px solid var(--cf-primary-color); margin-top: var(--cf-spacing-lg);">
            <block-properties
              .blockConfig=${this._blockEditorState.tempConfig || this.config.blocks[this._blockEditorState.editingBlockId]}
              .hass=${this.hass}
              .availableEntities=${this._availableEntities}
              @block-config-changed=${this._onBlockConfigChanged}
              @editor-state-changed=${this._onEditorStateChanged}
            ></block-properties>
          </div>
        ` : ''}
      </div>
    `;
  }

  _onCardChanged(e) {
    const cardType = e.detail.cardId;
    this.config.card_type = cardType;
    
    // 加载卡片的默认配置和schema
    this._selectedCard = cardRegistry.getCard(cardType);
    this._cardSchema = this._selectedCard?.manifest?.config_schema || null;
    
    const cardInstance = cardRegistry.createCardInstance(cardType);
    if (cardInstance) {
      const defaultConfig = cardInstance.getDefaultConfig();
      // 深拷贝默认配置
      this.config.areas = JSON.parse(JSON.stringify(defaultConfig.areas || {}));
      this.config.blocks = JSON.parse(JSON.stringify(defaultConfig.blocks || {}));
      
      // 应用卡片配置的默认值
      if (this._cardSchema) {
        Object.entries(this._cardSchema).forEach(([key, field]) => {
          if (this.config[key] === undefined && field.default !== undefined) {
            this.config[key] = field.default;
          }
        });
      }
    }
    
    // 清除编辑状态
    this._clearEditingState();
    this._notifyConfigUpdate();
  }

  _onThemeChanged(e) {
    this.config.theme = e.detail.theme;
    this._notifyConfigUpdate();
  }

  _onConfigChanged(e) {
    // 深拷贝合并配置
    const newConfig = {
      ...this.config,
      ...JSON.parse(JSON.stringify(e.detail.config))
    };
    
    this.config = newConfig;
    this._configVersion++; // 增加版本号
    this._notifyConfigUpdate();
  }

  _onEditorStateChanged(e) {
    this._blockEditorState = {
      ...this._blockEditorState,
      ...e.detail.state
    };
    this.requestUpdate();
  }

_onBlockConfigChanged(e) {
  if (this._blockEditorState.editingBlockId) {
    // 创建新的配置对象，避免引用问题
    const updatedBlocks = {
      ...this.config.blocks,
      [this._blockEditorState.editingBlockId]: e.detail.blockConfig
    };
    
    this.config = {
      ...this.config,
      blocks: updatedBlocks
    };
    
    // 更新临时配置
    this._blockEditorState.tempConfig = e.detail.blockConfig;
    
    this._notifyConfigUpdate();
    
    // 强制更新所有组件
    this.requestUpdate();
  }
}

  _clearEditingState() {
    this._blockEditorState = {
      editingBlockId: null,
      editingArea: 'content',
      tempConfig: null
    };
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
    this.requestUpdate();
  }

  updated(changedProperties) {
    if (changedProperties.has('hass') && this.hass) {
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
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

export { CardEditor };
