// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { EntityManager } from './core/entity-manager.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _state: { state: true }
  };

  static styles = css`
    :host {
      --editor-primary: var(--primary-color);
      --editor-success: var(--success-color);
      --editor-warning: var(--warning-color);
      --editor-error: var(--error-color);
    }

    .editor {
      padding: 0;
    }

    .stepper {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      position: relative;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--divider-color);
      color: var(--secondary-text-color);
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .step.active .step-circle {
      background: var(--editor-primary);
      color: white;
    }

    .step.completed .step-circle {
      background: var(--editor-success);
      color: white;
    }

    .step-label {
      margin-top: 8px;
      font-size: 12px;
      color: var(--secondary-text-color);
      font-weight: 500;
    }

    .step.active .step-label {
      color: var(--editor-primary);
    }

    .step-connector {
      position: absolute;
      top: 16px;
      height: 2px;
      background: var(--divider-color);
      z-index: 1;
    }

    .tab-content {
      min-height: 400px;
      padding: 0 16px;
    }

    .plugin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }

    .plugin-card {
      border: 2px solid transparent;
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .plugin-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--editor-primary);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .plugin-card:hover::before,
    .plugin-card.selected::before {
      transform: scaleX(1);
    }

    .plugin-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .plugin-card.selected {
      border-color: var(--editor-primary);
    }

    .plugin-content {
      padding: 20px 16px;
      text-align: center;
    }

    .plugin-icon {
      font-size: 2.5em;
      margin-bottom: 12px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .plugin-name {
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 0.95em;
    }

    .plugin-description {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }

    .entity-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .entity-field {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: start;
    }

    .field-label {
      font-weight: 500;
      font-size: 0.9em;
      color: var(--primary-text-color);
    }

    .field-required {
      color: var(--editor-error);
      margin-left: 4px;
    }

    .field-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8em;
      margin-top: 4px;
    }

    .status-valid {
      color: var(--editor-success);
    }

    .status-invalid {
      color: var(--editor-error);
    }

    .status-optional {
      color: var(--secondary-text-color);
    }

    .actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding: 16px;
      border-top: 1px solid var(--divider-color);
    }
  `;

  constructor() {
    super();
    this.config = { plugin: '', entities: {}, theme: 'default' };
    this._state = {
      step: 0,
      plugins: [],
      searchQuery: '',
      selectedCategory: 'all',
      validation: {}
    };
    
    this._initialize();
  }

  async _initialize() {
    await PluginRegistry.initialize();
    this._state.plugins = PluginRegistry.getAllPlugins();
    this.requestUpdate();
  }

  setConfig(config) {
    this.config = { ...this.config, ...config };
    this._updateValidation();
  }

  render() {
    return html`
      <div class="editor">
        ${this._renderStepper()}
        <div class="tab-content">
          ${this._renderCurrentStep()}
        </div>
        ${this._renderActions()}
      </div>
    `;
  }

  _renderStepper() {
    const steps = [
      { label: '选择插件', completed: !!this.config.plugin },
      { label: '配置实体', completed: this._areEntitiesValid() },
      { label: '主题设置', completed: false }
    ];

    return html`
      <div class="stepper">
        ${steps.map((step, index) => {
          const isActive = index === this._state.step;
          const isCompleted = step.completed;
          const stepClass = `step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;

          return html`
            <div class="${stepClass}">
              <div class="step-circle">
                ${isCompleted ? '✓' : index + 1}
              </div>
              <div class="step-label">${step.label}</div>
            </div>
            ${index < steps.length - 1 ? html`
              <div class="step-connector" style="left: ${(index + 1) * 25}%; right: ${(steps.length - index - 1) * 25}%"></div>
            ` : ''}
          `;
        })}
      </div>
    `;
  }

  _renderCurrentStep() {
    switch (this._state.step) {
      case 0: return this._renderPluginSelection();
      case 1: return this._renderEntityConfiguration();
      case 2: return this._renderThemeConfiguration();
      default: return this._renderError('未知步骤');
    }
  }

  _renderPluginSelection() {
    const filteredPlugins = this._getFilteredPlugins();

    return html`
      <div>
        <h3 style="margin-bottom: 16px;">选择卡片类型</h3>
        
        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <ha-textfield
            style="flex: 1;"
            label="搜索插件..."
            .value=${this._state.searchQuery}
            @input=${e => this._onSearchChange(e.target.value)}
            icon="mdi:magnify"
          ></ha-textfield>
          
          <ha-select
            label="分类"
            .value=${this._state.selectedCategory}
            @selected=${e => this._onCategoryChange(e.target.value)}
            style="min-width: 120px;"
          >
            ${PluginRegistry.getCategories().map(category => html`
              <mwc-list-item value=${category}>
                ${category === 'all' ? '全部分类' : category}
              </mwc-list-item>
            `)}
          </ha-select>
        </div>

        <div class="plugin-grid">
          ${filteredPlugins.map(plugin => html`
            <ha-card 
              class="plugin-card ${this.config.plugin === plugin.id ? 'selected' : ''}"
              @click=${() => this._selectPlugin(plugin)}
            >
              <div class="plugin-content">
                <div class="plugin-icon">${plugin.icon}</div>
                <div class="plugin-name">${plugin.name}</div>
                <div class="plugin-description">${plugin.description}</div>
              </div>
            </ha-card>
          `)}
        </div>

        ${filteredPlugins.length === 0 ? html`
          <div style="text-align: center; padding: 40px; color: var(--secondary-text-color);">
            <ha-icon icon="mdi:package-variant-closed" style="font-size: 3em; opacity: 0.5; margin-bottom: 16px;"></ha-icon>
            <div>没有找到匹配的插件</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityConfiguration() {
    if (!this.config.plugin) {
      return this._renderError('请先选择插件');
    }

    const plugin = this._state.plugins.find(p => p.id === this.config.plugin);
    if (!plugin) return this._renderError('插件不存在');

    const requirements = plugin.entityRequirements || [];

    if (requirements.length === 0) {
      return html`
        <div style="text-align: center; padding: 40px;">
          <ha-icon icon="mdi:check-circle" style="color: var(--editor-success); font-size: 3em; margin-bottom: 16px;"></ha-icon>
          <h3>无需配置实体</h3>
          <p style="color: var(--secondary-text-color);">此插件不需要关联任何实体</p>
        </div>
      `;
    }

    return html`
      <div class="entity-config">
        <h3 style="margin-bottom: 16px;">配置实体</h3>
        
        ${requirements.map(req => {
          const entityId = this.config.entities?.[req.key] || '';
          const validation = this._state.validation[req.key] || { isValid: false, reason: '' };

          return html`
            <div class="entity-field">
              <div>
                <div class="field-label">
                  ${req.description}
                  ${req.required ? html`<span class="field-required">*</span>` : ''}
                </div>
                <ha-entity-picker
                  .hass=${this.hass}
                  .value=${entityId}
                  @value-changed=${e => this._onEntityChange(req.key, e.detail.value)}
                  allow-custom-entity
                ></ha-entity-picker>
                <div class="field-status ${validation.isValid ? 'status-valid' : req.required ? 'status-invalid' : 'status-optional'}">
                  <ha-icon icon=${validation.isValid ? 'mdi:check-circle' : 'mdi:information'}></ha-icon>
                  ${validation.reason}
                </div>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  _renderThemeConfiguration() {
    const themes = [
      { id: 'default', name: '默认主题', icon: 'mdi:palette' },
      { id: 'dark', name: '深色主题', icon: 'mdi:weather-night' },
      { id: 'material', name: '材质设计', icon: 'mdi:material-design' }
    ];

    return html`
      <div>
        <h3 style="margin-bottom: 16px;">选择主题</h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
          ${themes.map(theme => html`
            <ha-card 
              class="plugin-card ${this.config.theme === theme.id ? 'selected' : ''}"
              @click=${() => this._onThemeChange(theme.id)}
            >
              <div class="plugin-content">
                <div class="plugin-icon">
                  <ha-icon .icon=${theme.icon}></ha-icon>
                </div>
                <div class="plugin-name">${theme.name}</div>
              </div>
            </ha-card>
          `)}
        </div>
      </div>
    `;
  }

  _renderActions() {
    return html`
      <div class="actions">
        <mwc-button 
          outlined 
          label="上一步" 
          @click=${this._previousStep}
          ?disabled=${this._state.step === 0}
        ></mwc-button>
        
        <div style="display: flex; gap: 8px;">
          <mwc-button outlined label="取消" @click=${this._cancel}></mwc-button>
          <mwc-button 
            raised 
            label=${this._state.step === 2 ? '完成' : '下一步'}
            @click=${this._nextStep}
            ?disabled=${!this._canProceed()}
          ></mwc-button>
        </div>
      </div>
    `;
  }

  // 状态管理方法
  _canProceed() {
    switch (this._state.step) {
      case 0: return !!this.config.plugin;
      case 1: return this._areEntitiesValid();
      case 2: return true;
      default: return false;
    }
  }

  _areEntitiesValid() {
    const plugin = this._state.plugins.find(p => p.id === this.config.plugin);
    if (!plugin) return false;

    const requirements = plugin.entityRequirements || [];
    return requirements.every(req => 
      !req.required || this._state.validation[req.key]?.isValid
    );
  }

  _updateValidation() {
    const plugin = this._state.plugins.find(p => p.id === this.config.plugin);
    if (!plugin) return;

    const validation = {};
    plugin.entityRequirements?.forEach(req => {
      const entityId = this.config.entities?.[req.key];
      validation[req.key] = EntityManager.validateEntity(this.hass, entityId, req);
    });

    this._state.validation = validation;
    this.requestUpdate();
  }

  _nextStep() {
    if (this._state.step < 2) {
      this._state.step++;
      this.requestUpdate();
    } else {
      this._save();
    }
  }

  _previousStep() {
    if (this._state.step > 0) {
      this._state.step--;
      this.requestUpdate();
    }
  }

  _selectPlugin(plugin) {
    this.config = {
      ...this.config,
      plugin: plugin.id,
      entities: this._initializeEntities(plugin)
    };
    this._updateValidation();
    this._notifyConfigUpdate();
  }

  _onEntityChange(key, value) {
    this.config.entities = { ...this.config.entities, [key]: value };
    this._updateValidation();
    this._notifyConfigUpdate();
  }

  _onThemeChange(theme) {
    this.config.theme = theme;
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _save() {
    this._notifyConfigUpdate();
    this.dispatchEvent(new CustomEvent('config-saved'));
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-cancelled'));
  }
}
