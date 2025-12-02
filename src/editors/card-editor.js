// src/editors/card-editor.js
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
      
      /* 卡片选择器样式 */
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
      }
      
      .card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
      }
      
      .card-item:hover {
        border-color: var(--cf-primary-color);
      }
      
      .card-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }
      
      .card-icon {
        font-size: 1.5em;
        margin-bottom: 6px;
      }
      
      .card-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
      }
      
      /* 主题选择器样式 */
      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
      }
      
      .theme-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
      }
      
      .theme-item:hover {
        border-color: var(--cf-primary-color);
      }
      
      .theme-item.selected {
        border-color: var(--cf-primary-color);
      }
      
      .theme-preview {
        width: 100%;
        height: 40px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 6px;
        border: 2px solid transparent;
      }
      
      .theme-item.selected .theme-preview {
        border-color: var(--cf-primary-color);
      }
      
      .theme-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
      }
      
      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }
      
      .empty-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-sm);
        opacity: 0.5;
      }
    `
  ];

  constructor() {
    super();
    this.config = {
      type: 'custom:ha-cardforge-card',
      card_type: '',
      theme: 'auto'
    };
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
    
    if (this.config.card_type) {
      this._selectedCard = cardSystem.getCard(this.config.card_type);
    }
  }

  setConfig(config) {
    this.config = { ...config };
    if (this._initialized && this.config.card_type) {
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
        ${this._renderCardSelectionSection()}
        ${this.config.card_type ? this._renderThemeSelectionSection() : ''}
        ${this.config.card_type && this._selectedCard?.schema ? this._renderCardSettings() : ''}
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
        <div class="card-grid">
          ${this._cards.map(card => html`
            <div 
              class="card-item ${this.config.card_type === card.id ? 'selected' : ''}"
              @click=${() => this._selectCard(card.id)}
              title="${card.description}"
            >
              <div class="card-icon">${card.icon}</div>
              <div class="card-name">${card.name}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderThemeSelectionSection() {
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:format-paint"></ha-icon>
          <span class="section-title">选择主题</span>
        </div>
        <div class="theme-grid">
          ${this._themes.map(theme => {
            const preview = themeSystem.getThemePreview(theme.id);
            return html`
              <div 
                class="theme-item ${this.config.theme === theme.id ? 'selected' : ''}"
                @click=${() => this._selectTheme(theme.id)}
                title="${theme.description}"
              >
                <div class="theme-preview" style="
                  background: ${preview.background};
                  color: ${preview.color};
                  border: ${preview.border};
                "></div>
                <div class="theme-name">${theme.name}</div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  _renderCardSettings() {
    const schema = this._selectedCard?.schema || {};
    const schemaKeys = Object.keys(schema);
    
    if (schemaKeys.length === 0) {
      return html`
        <div class="editor-section">
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <div>此卡片无需额外配置</div>
          </div>
        </div>
      `;
    }

    // 简单的表单渲染（完整版可以使用 form-builder.js）
    return html`
      <div class="editor-section">
        <div class="section-header">
          <ha-icon icon="mdi:cog"></ha-icon>
          <span class="section-title">卡片设置</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--cf-spacing-md);">
          ${schemaKeys.map(key => {
            const field = schema[key];
            return this._renderField(key, field);
          })}
        </div>
      </div>
    `;
  }

  _renderField(key, field) {
    const value = this.config[key] !== undefined ? this.config[key] : field.default;
    
    switch (field.type) {
      case 'boolean':
        return html`
          <div style="display: flex; align-items: center; gap: var(--cf-spacing-md);">
            <ha-switch
              .checked=${value}
              @change=${e => this._updateConfig(key, e.target.checked)}
            ></ha-switch>
            <div style="font-size: 0.9em; font-weight: 500;">${field.label}</div>
          </div>
        `;
        
      case 'select':
        return html`
          <ha-select
            .value=${value}
            @closed=${e => e.stopPropagation()}
            naturalMenuWidth
            fixedMenuPosition
            fullwidth
            .label=${field.label}
            @change=${e => this._updateConfig(key, e.target.value)}
          >
            ${field.options.map(opt => html`
              <ha-list-item .value=${opt.value || opt}>
                ${opt.label || opt}
              </ha-list-item>
            `)}
          </ha-select>
        `;
        
      case 'number':
        return html`
          <ha-textfield
            type="number"
            .value=${value}
            @input=${e => this._updateConfig(key, parseInt(e.target.value) || 0)}
            .label=${field.label}
            fullwidth
          ></ha-textfield>
        `;
        
      default:
        return html`
          <ha-textfield
            .value=${value || ''}
            @input=${e => this._updateConfig(key, e.target.value)}
            .label=${field.label}
            .placeholder=${field.placeholder || ''}
            fullwidth
          ></ha-textfield>
        `;
    }
  }

  _selectCard(cardId) {
    const card = cardSystem.getCard(cardId);
    if (!card) return;
    
    // 构建新配置
    const newConfig = {
      ...this.config,
      card_type: cardId
    };
    
    // 应用schema中的默认值
    Object.entries(card.schema).forEach(([key, field]) => {
      if (newConfig[key] === undefined && field.default !== undefined) {
        newConfig[key] = field.default;
      }
    });
    
    this.config = newConfig;
    this._selectedCard = card;
    this._notifyConfigChange();
  }

  _selectTheme(themeId) {
    this.config = { ...this.config, theme: themeId };
    this._notifyConfigChange();
  }

  _updateConfig(key, value) {
    this.config = { ...this.config, [key]: value };
    this._notifyConfigChange();
  }

  _notifyConfigChange() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  getConfig() {
    return this.config;
  }
}

if (!customElements.get('card-editor')) {
  customElements.define('card-editor', CardEditor);
}

export { CardEditor };
