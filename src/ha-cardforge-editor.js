// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { sharedStyles } from './core/shared-styles.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _themes: { state: true },
    _initialized: { state: true },
    _activePlugin: { state: true }
  };

  static styles = [
    sharedStyles,
    css`
      .editor-container {
        padding: 16px;
      }
      
      .config-row {
        margin-bottom: 16px;
      }
      
      .card-actions {
        margin-top: 24px;
        text-align: right;
        border-top: 1px solid var(--divider-color);
        padding-top: 16px;
      }
      
      ha-select, ha-combo-box, ha-textfield {
        width: 100%;
      }
      
      .entity-help {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-top: 4px;
        line-height: 1.3;
      }
      
      .source-type {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
      
      .source-type-button {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 0.85em;
        text-align: center;
        transition: all 0.2s ease;
      }
      
      .source-type-button.active {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
        color: var(--primary-color);
      }
      
      .source-input {
        margin-top: 8px;
      }
      
      .jinja-hint {
        background: rgba(var(--rgb-primary-color), 0.05);
        border: 1px solid rgba(var(--rgb-primary-color), 0.2);
        border-radius: 4px;
        padding: 8px;
        margin-top: 8px;
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }
      
      .jinja-examples {
        margin-top: 4px;
        font-family: monospace;
        font-size: 0.75em;
        opacity: 0.7;
      }
    `
  ];

  constructor() {
    super();
    this.config = { plugin: '', entities: {}, theme: 'auto' };
    this._plugins = [];
    this._themes = [
      { value: 'auto', label: '跟随系统' },
      { value: 'glass', label: '毛玻璃' },
      { value: 'gradient', label: '随机渐变' },
      { value: 'neon', label: '霓虹光影' }
    ];
    this._initialized = false;
    this._activePlugin = null;
    this._sourceTypes = {}; // 存储每个实体的输入类型
  }

  async firstUpdated() {
    await PluginRegistry.initialize();
    this._loadPlugins();
    this._initialized = true;
  }

  setConfig(config) {
    this.config = { 
      plugin: '',
      entities: {},
      theme: 'auto',
      ...config 
    };
    
    // 初始化源类型
    if (config.plugin) {
      this._activePlugin = PluginRegistry.getPlugin(config.plugin);
      this._initSourceTypes();
    }
  }

  render() {
    if (!this._initialized) {
      return html`
        <ha-card>
          <div class="empty-state">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div style="margin-top: 16px;">初始化插件系统...</div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <div class="editor-container">
        <div class="config-row">
          <ha-select
            .label=${"选择卡片"}
            .value=${this.config.plugin}
            @selected=${e => this._onPluginChange(e)}
            @closed=${e => e.stopPropagation()}
          >
            ${this._plugins.map(plugin => html`
              <mwc-list-item value=${plugin.id}>${plugin.name}</mwc-list-item>
            `)}
          </ha-select>
        </div>

        ${this.config.plugin ? html`
          <div class="config-row">
            <ha-select
              .label=${"选择主题"}
              .value=${this.config.theme}
              @selected=${e => this._onThemeChange(e)}
              @closed=${e => e.stopPropagation()}
            >
              ${this._themes.map(theme => html`
                <mwc-list-item value=${theme.value}>${theme.label}</mwc-list-item>
              `)}
            </ha-select>
          </div>

          ${this._renderEntityConfig()}
        ` : ''}

        <div class="card-actions">
          <mwc-button outlined label="取消" @click=${this._cancel}></mwc-button>
          <mwc-button 
            raised 
            label="保存配置" 
            @click=${this._save} 
            .disabled=${!this.config.plugin}
          ></mwc-button>
        </div>
      </div>
    `;
  }

  _renderEntityConfig() {
    if (!this._activePlugin) return '';

    const requirements = this._activePlugin.manifest.entityRequirements || [];
    
    if (requirements.length === 0) {
      return html`
        <div class="config-row">
          <div class="entity-help">
            ✅ 此插件无需配置实体
          </div>
        </div>
      `;
    }

    return requirements.map(req => this._renderEntityRow(req));
  }

  _renderEntityRow(requirement) {
    const currentValue = this.config.entities?.[requirement.key] || '';
    const sourceType = this._getSourceType(requirement.key, currentValue);
    
    return html`
      <div class="config-row">
        <div class="entity-label">
          ${requirement.description}
          ${requirement.required ? html`<span class="required-star">*</span>` : ''}
        </div>
        
        <div class="source-type">
          <button 
            class="source-type-button ${sourceType === 'entity' ? 'active' : ''}"
            @click=${() => this._setSourceType(requirement.key, 'entity')}
          >
            🏷️ 实体
          </button>
          <button 
            class="source-type-button ${sourceType === 'jinja' ? 'active' : ''}"
            @click=${() => this._setSourceType(requirement.key, 'jinja')}
          >
            🔧 Jinja2
          </button>
          <button 
            class="source-type-button ${sourceType === 'text' ? 'active' : ''}"
            @click=${() => this._setSourceType(requirement.key, 'text')}
          >
            📝 文本
          </button>
        </div>
        
        <div class="source-input">
          ${this._renderSourceInput(requirement, currentValue, sourceType)}
        </div>
        
        <div class="entity-help">
          ${this._getEntityHelpText(requirement, sourceType)}
        </div>
      </div>
    `;
  }

  _renderSourceInput(requirement, currentValue, sourceType) {
    switch (sourceType) {
      case 'entity':
        return html`
          <ha-combo-box
            .label=${`选择${requirement.description}`}
            .value=${this._extractEntityId(currentValue)}
            .items=${this._getEntityOptions(this.hass, requirement)}
            @value-changed=${e => this._onEntityChange(requirement.key, e.detail.value)}
            allow-custom-value
          ></ha-combo-box>
        `;
        
      case 'jinja':
        return html`
          <ha-textfield
            .label=${`Jinja2模板`}
            .value=${currentValue}
            @input=${e => this._onEntityChange(requirement.key, e.target.value)}
            placeholder="例如: {{ states('sensor.temperature') }}"
          ></ha-textfield>
          <div class="jinja-hint">
            💡 Jinja2模板支持：
            <div class="jinja-examples">
              • {{ states('sensor.entity_id') }}<br>
              • {{ states.sensor.entity_id.attributes.name }}<br>
              • {{ now().strftime('%H:%M') }}<br>
              • {{ 25.5 + 1.2 | round(2) }}
            </div>
          </div>
        `;
        
      case 'text':
        return html`
          <ha-textfield
            .label=${`输入文本`}
            .value=${currentValue}
            @input=${e => this._onEntityChange(requirement.key, e.target.value)}
            placeholder="直接输入显示内容"
          ></ha-textfield>
        `;
    }
  }

  _getEntityHelpText(requirement, sourceType) {
    const baseText = requirement.required ? '必填项' : '可选项';
    
    const typeText = {
      'entity': '选择Home Assistant实体',
      'jinja': '使用Jinja2模板动态计算值',
      'text': '直接输入静态文本内容'
    }[sourceType];
    
    return `${baseText} • ${typeText}`;
  }

  _getSourceType(key, value) {
    if (!this._sourceTypes[key]) {
      // 自动检测类型
      if (value.includes('{{') || value.includes('{%')) {
        this._sourceTypes[key] = 'jinja';
      } else if (value.includes('.')) {
        this._sourceTypes[key] = 'entity';
      } else {
        this._sourceTypes[key] = 'text';
      }
    }
    return this._sourceTypes[key];
  }

  _setSourceType(key, type) {
    this._sourceTypes[key] = type;
    
    // 清空当前值当切换类型时
    if (this.config.entities?.[key]) {
      this.config.entities[key] = '';
      this._notifyConfigUpdate();
    }
    
    this.requestUpdate();
  }

  _extractEntityId(value) {
    // 从可能包含模板的字符串中提取实体ID
    if (!value) return '';
    if (value.includes('{{') || value.includes('{%')) return '';
    return value;
  }

  _loadPlugins() {
    this._plugins = PluginRegistry.getAllPlugins().map(plugin => ({
      id: plugin.id,
      name: plugin.name
    }));
  }

  _getEntityOptions(hass, requirement) {
    if (!hass) return [];

    const entities = Object.keys(hass.states || {});
    let filteredEntities = entities;

    // 根据需求类型过滤实体
    if (requirement.type === 'sensor') {
      filteredEntities = entities.filter(e => e.startsWith('sensor.'));
    } else if (requirement.type === 'weather') {
      filteredEntities = entities.filter(e => e.startsWith('weather.'));
    } else if (requirement.type === 'input_text') {
      filteredEntities = entities.filter(e => e.startsWith('input_text.'));
    }

    filteredEntities.sort();

    const options = filteredEntities.map(entity => {
      const stateObj = hass.states[entity];
      const friendlyName = stateObj?.attributes?.friendly_name;
      return {
        value: entity,
        label: friendlyName ? `${friendlyName} (${entity})` : entity
      };
    });

    options.unshift({ value: '', label: `选择${requirement.description}` });
    return options;
  }

  _initSourceTypes() {
    const requirements = this._activePlugin?.manifest.entityRequirements || [];
    requirements.forEach(req => {
      const value = this.config.entities?.[req.key] || '';
      this._getSourceType(req.key, value); // 自动初始化类型
    });
  }

  _onPluginChange(event) {
    const pluginId = event.target.value;
    if (pluginId === this.config.plugin) return;

    this.config = {
      ...this.config,
      plugin: pluginId,
      entities: {} // 切换插件时清空实体配置
    };

    this._activePlugin = PluginRegistry.getPlugin(pluginId);
    this._sourceTypes = {}; // 重置源类型
    this._initSourceTypes();

    this._notifyConfigUpdate();
  }

  _onThemeChange(event) {
    const theme = event.target.value;
    if (theme === this.config.theme) return;

    this.config.theme = theme;
    this._notifyConfigUpdate();
  }

  _onEntityChange(key, value) {
    this.config.entities = {
      ...this.config.entities,
      [key]: value
    };
    
    // 更新源类型检测
    this._getSourceType(key, value);
    
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _save() {
    this._notifyConfigUpdate();
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: null }
    }));
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this.requestUpdate();
    }
  }
}

if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', HaCardForgeEditor);
}

export { HaCardForgeEditor };