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
    _initialized: { state: true }
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
      
      ha-select, ha-combo-box {
        width: 100%;
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

    const activePlugin = this.config.plugin ? 
      PluginRegistry.getPlugin(this.config.plugin) : null;

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

        ${this._renderEntityConfig(activePlugin)}

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

  _renderEntityConfig(activePlugin) {
    if (!activePlugin) return '';
  
    const requirements = activePlugin.manifest.entityRequirements || [];
    
    // 动态渲染所有实体配置
    return requirements.map(requirement => html`
      <div class="config-row">
        <ha-combo-box
          .label=${`关联${requirement.description}`}
          .value=${this.config.entities?.[requirement.key] || ''}
          .items=${this._getEntityOptions(this.hass, requirement)}
          @value-changed=${e => this._onEntityChange(requirement.key, e.detail.value)}
          allow-custom-value
        ></ha-combo-box>
      </div>
    `);
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

    if (requirement.type === 'sensor') {
      filteredEntities = entities.filter(e => e.startsWith('sensor.'));
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

  _onPluginChange(event) {
    const pluginId = event.target.value;
    if (pluginId === this.config.plugin) return;

    this.config = {
      ...this.config,
      plugin: pluginId,
      entities: {} // 切换插件时清空实体配置
    };

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