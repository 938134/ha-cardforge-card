// src/editors/card-editor.js - 修正版
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { cardSystem } from '../core/card-system.js';
import { themeSystem } from '../core/theme-system.js';
import { designSystem } from '../core/design-system.js';

// 导入需要的UI组件
import '../editors/card-selector.js';
import '../editors/theme-selector.js';
import '../editors/form-builder.js';
import '../editors/block-management.js';

class CardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _cards: { state: true },
    _themes: { state: true },
    _selectedCard: { state: true },
    _initialized: { state: true },
    _lastConfig: { state: true }
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
      
      /* 空状态 */
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
      
      /* 响应式 */
      @media (max-width: 480px) {
        .editor-container {
          min-width: 300px;
        }
      }
    `
  ];

  constructor() {
    super();
    this._cards = [];
    this._themes = [];
    this._selectedCard = null;
    this._initialized = false;
    this._lastConfig = null;
  }

  async firstUpdated() {
    // 初始化系统
    await cardSystem.initialize();
    await themeSystem.initialize();
    
    // 获取所有卡片和主题
    this._cards = cardSystem.getAllCards();
    this._themes = themeSystem.getAllThemes();
    this._initialized = true;
    
    // 处理初始配置
    this._processInitialConfig();
  }

  setConfig(config) {
    if (!config || typeof config !== 'object') {
      return;
    }
    
    let newConfig = { ...config };
    
    // 处理旧版配置
    if (!newConfig.card_type && newConfig.cardType) {
      newConfig.card_type = newConfig.cardType;
      delete newConfig.cardType;
    }
    
    // 确保有默认值
    newConfig = this._ensureDefaultConfig(newConfig);
    
    // 检查配置是否变化
    const newConfigStr = JSON.stringify(newConfig);
    if (newConfigStr !== this._lastConfig) {
      this.config = newConfig;
      this._lastConfig = newConfigStr;
      this.requestUpdate();
    }
  }

  _processInitialConfig() {
    // 如果配置中没有 card_type，设置为第一个卡片
    if (!this.config.card_type && this._cards.length > 0) {
      const firstCard = this._cards[0];
      this.config = this._buildCardConfig(firstCard.id, {});
      this._selectedCard = cardSystem.getCard(firstCard.id);
      this._lastConfig = JSON.stringify(this.config);
      this._notifyConfigChange();
    } else if (this.config.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
    }
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
        <!-- 卡片选择部分 -->
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
        
        <!-- 主题选择部分 -->
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
        
        <!-- 卡片配置部分 -->
        ${this.config.card_type && this._selectedCard?.schema ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:cog"></ha-icon>
              <span class="section-title">卡片设置</span>
            </div>
            <form-builder
              .schema=${this._selectedCard.schema}
              .config=${this.config}
              .hass=${this.hass}
              @config-changed=${this._handleConfigChange}
            ></form-builder>
          </div>
        ` : ''}
        
        <!-- 块管理部分（仅对支持块的卡片显示） -->
        ${this._shouldShowBlockManagement() ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:cube-outline"></ha-icon>
              <span class="section-title">块管理</span>
            </div>
            <block-management
              .config=${this.config}
              .hass=${this.hass}
              @config-changed=${this._handleConfigChange}
            ></block-management>
          </div>
        ` : ''}
      </div>
    `;
  }

  _handleCardChange(e) {
    const cardId = e.detail.cardId;
    
    if (this.config.card_type === cardId) {
      return; // 已经是当前卡片，不重复触发
    }
    
    // 构建新配置
    const newConfig = this._buildCardConfig(cardId, {
      theme: this.config.theme || 'auto'
    });
    
    // 获取卡片定义
    this._selectedCard = cardSystem.getCard(cardId);
    
    // 添加预设块（如果有）
    this._addPresetBlocks(newConfig, this._selectedCard);
    
    // 更新配置
    this.config = newConfig;
    this._lastConfig = JSON.stringify(newConfig);
    this._notifyConfigChange();
  }

  _handleThemeChange(e) {
    if (this.config.theme === e.detail.theme) {
      return;
    }
    
    this.config = { ...this.config, theme: e.detail.theme };
    this._lastConfig = JSON.stringify(this.config);
    this._notifyConfigChange();
  }

  _handleConfigChange(e) {
    this.config = { ...this.config, ...e.detail.config };
    this._lastConfig = JSON.stringify(this.config);
    this._notifyConfigChange();
  }

  _ensureDefaultConfig(userConfig) {
    const defaultConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: userConfig.card_type || cardSystem.getDefaultCard()?.id || 'clock',
      theme: userConfig.theme || 'auto'
    };
    
    // 应用卡片默认值
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
    
    // 应用卡片默认值
    const defaultConfig = {};
    const schema = cardDef.schema || {};
    Object.entries(schema).forEach(([key, field]) => {
      if (field.default !== undefined) {
        defaultConfig[key] = field.default;
      }
    });
    
    // 基础配置
    const cleanConfig = {
      type: 'custom:ha-cardforge-card',
      card_type: cardId,
      theme: baseConfig.theme || 'auto'
    };
    
    // 保留blocks配置（如果新卡片支持块）
    if ((cardDef.blocks || cardId === 'dashboard' || cardId === 'welcome' || cardId === 'poetry') && baseConfig.blocks) {
      cleanConfig.blocks = baseConfig.blocks;
    }
    
    return {
      ...cleanConfig,
      ...defaultConfig
    };
  }

  _addPresetBlocks(config, cardDef) {
    if (!cardDef?.blocks?.presets || config.blocks) {
      return;
    }
    
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
      config.blocks = presetBlocks;
    }
  }

  _shouldShowBlockManagement() {
    if (!this.config.card_type) return false;
    
    const card = cardSystem.getCard(this.config.card_type);
    const supportsBlocks = card?.blocks || 
                          this.config.card_type === 'dashboard' || 
                          this.config.card_type === 'welcome' ||
                          this.config.card_type === 'poetry';
    
    return supportsBlocks;
  }

  _notifyConfigChange() {
    const event = new CustomEvent('config-changed', {
      bubbles: true,
      composed: true,
      detail: { 
        config: { ...this.config }
      }
    });
    
    this.dispatchEvent(event);
  }

  getConfig() {
    return { ...this.config };
  }
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

export { CardEditor };