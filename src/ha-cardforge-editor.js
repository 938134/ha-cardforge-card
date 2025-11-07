import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _availableCards: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 600px;
    }
    .section {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--card-background-color);
      border-radius: 8px;
      border: 1px solid var(--divider-color);
    }
    .section-title {
      margin: 0 0 16px 0;
      font-size: 1.1em;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .card-type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .card-type-option {
      padding: 16px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }
    .card-type-option:hover {
      border-color: var(--primary-color);
    }
    .card-type-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--primary-color-rgb), 0.1);
    }
    .card-type-icon {
      font-size: 2em;
      margin-bottom: 8px;
    }
  `;

  constructor() {
    super();
    this.config = { 
      type: 'standard', 
      layout: { header: {}, content: {}, footer: {} } 
    };
    this._availableCards = [
      { type: 'standard', name: '标准卡片', icon: '📄', description: '三栏布局的基础卡片' },
      { type: 'button', name: '按钮卡片', icon: '🔘', description: '基于 button-card 的卡片' },
      { type: 'weather', name: '天气卡片', icon: '🌤️', description: '专用天气显示卡片' }
    ];
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  render() {
    return html`
      <div class="editor">
        <!-- 卡片类型选择 -->
        <div class="section">
          <h3 class="section-title">🎨 选择卡片类型</h3>
          <div class="card-type-grid">
            ${this._availableCards.map(card => html`
              <div 
                class="card-type-option ${this.config.type === card.type ? 'selected' : ''}"
                @click=${() => this._changeCardType(card.type)}
              >
                <div class="card-type-icon">${card.icon}</div>
                <div style="font-weight: 500;">${card.name}</div>
                <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-top: 4px;">
                  ${card.description}
                </div>
              </div>
            `)}
          </div>
        </div>

        <!-- 动态卡片配置 -->
        ${this._renderCardConfig()}

        <!-- 操作按钮 -->
        <div class="action-buttons" style="justify-content: flex-end;">
          <mwc-button @click=${this._cancel} label="取消"></mwc-button>
          <mwc-button @click=${this._save} unelevated label="保存"></mwc-button>
        </div>
      </div>
    `;
  }

  _renderCardConfig() {
    switch (this.config.type) {
      case 'standard':
        return this._renderStandardConfig();
      case 'button':
        return this._renderButtonConfig();
      case 'weather':
        return this._renderWeatherConfig();
      default:
        return html`<div class="section">未知卡片类型: ${this.config.type}</div>`;
    }
  }

  _renderStandardConfig() {
    return html`
      <!-- 基础设置 -->
      <div class="section">
        <h3 class="section-title">🏷️ 基础设置</h3>
        
        <div class="form-group">
          <ha-textfield
            label="卡片标题"
            .value=${this.config.layout?.header?.title || ''}
            @input=${e => this._updateConfig('layout.header.title', e.target.value)}
            style="width: 100%;"
          ></ha-textfield>
        </div>

        <div class="form-group">
          <ha-icon-picker
            label="图标"
            .value=${this.config.layout?.header?.icon || ''}
            @value-changed=${e => this._updateConfig('layout.header.icon', e.detail.value)}
            style="width: 100%;"
          ></ha-icon-picker>
        </div>
      </div>

      <!-- 内容设置 -->
      <div class="section">
        <h3 class="section-title">📊 内容设置</h3>
        
        <div class="form-group">
          <ha-entity-picker
            label="选择实体"
            .hass=${this.hass}
            .value=${this.config.layout?.content?.entities || []}
            @value-changed=${e => this._updateConfig('layout.content.entities', e.detail.value)}
            style="width: 100%;"
            multiple
          ></ha-entity-picker>
        </div>

        <div class="action-buttons">
          <mwc-button 
            @click=${this._openTemplateLibrary}
            label="📚 选择模板"
          ></mwc-button>
        </div>
      </div>

      <!-- 页脚设置 -->
      <div class="section">
        <h3 class="section-title">📄 页脚设置</h3>
        
        <div class="form-group">
          <ha-formfield label="显示页脚">
            <ha-switch
              .checked=${this.config.layout?.footer?.visible !== false}
              @change=${e => this._updateConfig('layout.footer.visible', e.target.checked)}
            ></ha-switch>
          </ha-formfield>
        </div>
      </div>
    `;
  }

  _renderButtonConfig() {
    return html`
      <div class="section">
        <h3 class="section-title">🔘 按钮卡片设置</h3>
        
        <div class="form-group">
          <ha-entity-picker
            label="选择实体"
            .hass=${this.hass}
            .value=${this.config.entity || ''}
            @value-changed=${e => this._updateConfig('entity', e.detail.value)}
            style="width: 100%;"
          ></ha-entity-picker>
        </div>

        <div class="action-buttons">
          <mwc-button 
            @click=${this._openTemplateLibrary}
            label="📚 选择按钮模板"
          ></mwc-button>
        </div>
      </div>
    `;
  }

  _renderWeatherConfig() {
    return html`
      <div class="section">
        <h3 class="section-title">🌤️ 天气卡片设置</h3>
        
        <div class="form-group">
          <ha-entity-picker
            label="选择天气实体"
            .hass=${this.hass}
            .value=${this.config.entity || ''}
            @value-changed=${e => this._updateConfig('entity', e.detail.value)}
            style="width: 100%;"
            .includeDomains=${['weather']}
          ></ha-entity-picker>
        </div>
      </div>
    `;
  }

  _changeCardType(cardType) {
    this._updateConfig('type', cardType);
    
    // 重置配置
    const defaultConfigs = {
      standard: { layout: { header: {}, content: { entities: [] }, footer: {} } },
      button: { entity: '', button_config: {} },
      weather: { entity: '' }
    };
    
    this.config = { ...this.config, ...defaultConfigs[cardType] };
    this._fireConfigChanged();
  }

  _updateConfig(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, this.config);
    
    target[lastKey] = value;
    this.requestUpdate();
  }

  _openTemplateLibrary() {
    if (window.TemplateLibrary) {
      window.TemplateLibrary.open(this.config, (newConfig) => {
        this.config = newConfig;
        this._fireConfigChanged();
      });
    }
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-cancel', { bubbles: true, composed: true }));
  }

  _save() {
    this._fireConfigChanged();
    this.dispatchEvent(new CustomEvent('config-save', { bubbles: true, composed: true }));
  }

  _fireConfigChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('ha-cardforge-editor', HaCardForgeEditor);
