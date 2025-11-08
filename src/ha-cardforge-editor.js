// ha-cardforge-card/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _availableEntities: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 600px;
    }
    .section {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid var(--divider-color);
    }
    .section-title {
      margin: 0 0 16px 0;
      font-size: 1.1em;
      font-weight: bold;
      color: var(--primary-color);
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }
    select, input {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
    }
    select:focus, input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .entity-status {
      font-size: 0.8em;
      margin-top: 4px;
    }
    .entity-valid {
      color: var(--success-color);
    }
    .entity-invalid {
      color: var(--error-color);
    }
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .theme-option {
      padding: 12px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .theme-option:hover {
      border-color: var(--primary-color);
    }
    .theme-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.1);
    }
    .theme-icon {
      font-size: 1.5em;
      margin-bottom: 8px;
    }
    .actions {
      margin-top: 24px;
      text-align: right;
    }
    button {
      padding: 10px 24px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover {
      opacity: 0.9;
    }
    .style-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .style-option {
      padding: 16px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .style-option:hover {
      border-color: var(--primary-color);
    }
    .style-option.selected {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.1);
    }
    .style-icon {
      font-size: 2em;
      margin-bottom: 8px;
    }
  `;

  constructor() {
    super();
    this.config = {};
    this._availableEntities = [];
  }

  firstUpdated() {
    this._loadAvailableEntities();
  }

  setConfig(config) {
    this.config = { 
      style: 'time-week',
      theme: 'default',
      entities: {},
      ...config 
    };
  }

  _loadAvailableEntities() {
    if (!this.hass) return;
    this._availableEntities = Object.keys(this.hass.states);
  }

  render() {
    return html`
      <div class="editor">
        <!-- 样式选择 -->
        <div class="section">
          <div class="section-title">🎨 选择样式</div>
          <div class="style-grid">
            ${this._renderStyleOption('time-week', '⏰', '时间星期')}
            ${this._renderStyleOption('time-card', '🕒', '时间卡片')}
            ${this._renderStyleOption('weather', '🌤️', '天气卡片')}
          </div>
        </div>

        <!-- 主题选择 -->
        <div class="section">
          <div class="section-title">🎭 选择主题</div>
          <div class="theme-grid">
            ${this._renderThemeOption('default', '🎨', '默认主题')}
            ${this._renderThemeOption('dark', '🌙', '深色主题')}
            ${this._renderThemeOption('material', '⚡', '材质设计')}
          </div>
        </div>

        <!-- 实体配置 -->
        <div class="section">
          <div class="section-title">🔧 实体配置</div>
          ${this._renderEntityConfig()}
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <button @click=${this._save}>保存配置</button>
        </div>
      </div>
    `;
  }

  _renderStyleOption(styleName, icon, displayName) {
    const isSelected = this.config.style === styleName;
    return html`
      <div class="style-option ${isSelected ? 'selected' : ''}" 
           @click=${() => this._styleChanged(styleName)}>
        <div class="style-icon">${icon}</div>
        <div>${displayName}</div>
      </div>
    `;
  }

  _renderThemeOption(themeName, icon, displayName) {
    const isSelected = this.config.theme === themeName;
    return html`
      <div class="theme-option ${isSelected ? 'selected' : ''}" 
           @click=${() => this._themeChanged(themeName)}>
        <div class="theme-icon">${icon}</div>
        <div>${displayName}</div>
      </div>
    `;
  }

  _renderEntityConfig() {
    const entities = this.config.entities || {};

    return html`
      <div class="form-group">
        <label>时间实体</label>
        <input 
          type="text" 
          .value=${entities.time || ''}
          @input=${e => this._entityChanged('time', e.target.value)}
          placeholder="sensor.time"
          list="time-entities"
        >
        <datalist id="time-entities">
          ${this._getEntityOptions('sensor')}
        </datalist>
        ${this._renderEntityStatus(entities.time)}
      </div>

      <div class="form-group">
        <label>日期实体</label>
        <input 
          type="text" 
          .value=${entities.date || ''}
          @input=${e => this._entityChanged('date', e.target.value)}
          placeholder="sensor.date"
          list="date-entities"
        >
        <datalist id="date-entities">
          ${this._getEntityOptions('sensor')}
        </datalist>
        ${this._renderEntityStatus(entities.date)}
      </div>

      <div class="form-group">
        <label>星期实体 (可选)</label>
        <input 
          type="text" 
          .value=${entities.week || ''}
          @input=${e => this._entityChanged('week', e.target.value)}
          placeholder="sensor.xing_qi"
          list="week-entities"
        >
        <datalist id="week-entities">
          ${this._getEntityOptions('sensor')}
        </datalist>
        ${this._renderEntityStatus(entities.week)}
      </div>
    `;
  }

  _getEntityOptions(domain) {
    return this._availableEntities
      .filter(entityId => entityId.startsWith(domain + '.'))
      .map(entityId => html`<option value="${entityId}">${entityId}</option>`);
  }

  _renderEntityStatus(entityId) {
    if (!entityId) {
      return html`<div class="entity-status">⚠️ 未配置</div>`;
    }
    
    if (!this.hass?.states[entityId]) {
      return html`<div class="entity-status entity-invalid">❌ 实体不存在</div>`;
    }

    const entity = this.hass.states[entityId];
    return html`
      <div class="entity-status entity-valid">
        ✅ 状态: ${entity.state}
        ${entity.attributes.unit_of_measurement ? ` ${entity.attributes.unit_of_measurement}` : ''}
      </div>
    `;
  }

  _styleChanged(styleName) {
    this.config = { 
      ...this.config, 
      style: styleName 
    };
    this._fireChanged();
  }

  _themeChanged(themeName) {
    this.config = { 
      ...this.config, 
      theme: themeName 
    };
    this._fireChanged();
  }

  _entityChanged(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    this._fireChanged();
  }

  _save() {
    this._fireChanged();
  }

  _fireChanged() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }
}

export { HaCardForgeEditor };