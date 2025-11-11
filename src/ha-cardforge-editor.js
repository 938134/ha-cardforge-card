// src/ha-cardforge-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { ConfigManager } from './core/config-manager.js';

class HaCardForgeEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugins: { state: true },
    _currentPlugin: { state: true }
  };

  static styles = css`
    .editor {
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .section {
      background: var(--card-background-color);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid var(--divider-color);
    }
    
    .section-title {
      font-size: 1.1em;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--primary-text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .plugin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .plugin-item {
      padding: 16px;
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }
    
    .plugin-item:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
    }
    
    .plugin-item.selected {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
    }
    
    .plugin-icon {
      font-size: 2em;
      margin-bottom: 8px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .plugin-name {
      font-weight: 600;
      font-size: 0.9em;
      margin-bottom: 4px;
    }
    
    .plugin-desc {
      font-size: 0.8em;
      opacity: 0.8;
      line-height: 1.3;
    }
    
    .entity-field {
      margin-bottom: 16px;
    }
    
    .field-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--primary-text-color);
    }
    
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--divider-color);
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
    }
  `;

  constructor() {
    super();
    this.config = ConfigManager.DEFAULT_CONFIG;
    this._plugins = [];
    this._currentPlugin = null;
    this._init();
  }

  async _init() {
    await PluginRegistry.initialize();
    this._plugins = PluginRegistry.getAllPlugins();
    this.requestUpdate();
  }

  setConfig(config) {
    this.config = ConfigManager.validate(config);
    if (this.config.plugin) {
      this._currentPlugin = PluginRegistry.getPlugin(this.config.plugin);
    }
  }

  render() {
    return html`
      <div class="editor">
        ${this._renderPluginSelection()}
        ${this.config.plugin ? this._renderEntityConfig() : ''}
        ${this.config.plugin ? this._renderThemeConfig() : ''}
        ${this._renderActions()}
      </div>
    `;
  }

  _renderPluginSelection() {
    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:puzzle"></ha-icon>
          选择卡片插件
        </div>
        
        <div class="plugin-grid">
          ${this._plugins.map(plugin => html`
            <div 
              class="plugin-item ${this.config.plugin === plugin.id ? 'selected' : ''}"
              @click=${() => this._selectPlugin(plugin)}
            >
              <div class="plugin-icon">${plugin.icon}</div>
              <div class="plugin-name">${plugin.name}</div>
              <div class="plugin-desc">${plugin.description}</div>
            </div>
          `)}
        </div>
        
        ${!this.config.plugin ? html`
          <div class="empty-state">
            <ha-icon icon="mdi:cursor-default-click" style="font-size: 3em; opacity: 0.5;"></ha-icon>
            <div style="margin-top: 12px;">请选择一个插件开始配置</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityConfig() {
    const plugin = PluginRegistry.getPlugin(this.config.plugin);
    if (!plugin?.manifest.entityRequirements?.length) return '';

    return html`
      <div class="section">
        <div class="section-title">
          <ha-icon icon="mdi:database-cog"></ha-icon>
          实体配置
        </div>
        
        ${plugin.manifest.entityRequirements.map(req => {
          const entityId = this.config.entities?.[req.key] || '';
          const isValid = EntityManager.validateEntity(this.hass, entityId);
          
          return html`
            <div class="entity-field">
              <label class="field-label">
                ${req.description}
                ${req.required ? html`<span style="color: var(--error-color)">*</span>` : ''}
              </label>
              <ha-entity-picker
                .hass=${this.hass}
                .value=${entityId}
                @value-changed=${e => this._updateEntity(req.key, e.detail.value)}
                allow-custom-entity
              ></ha-entity-picker>
              ${!isValid.isValid ? html`
                <div style="color: var(--error-color); font-size: 0.8em; margin-top: 4px;">
                  ${isValid.reason}
                </div>
              ` : ''}
            </div>
          `;
        })}
      </div>
    `;
  }

  // 在 ha-cardforge-editor.js 的 _renderThemeConfig 方法中：
_renderThemeConfig() {
  const themes = ThemeManager.getAllThemes();

  return html`
    <div class="section">
      <div class="section-title">
        <ha-icon icon="mdi:palette"></ha-icon>
        主题设置
        <span style="color: var(--success-color); font-size: 0.8em; margin-left: auto;">
          ✅ 所有主题可用
        </span>
      </div>
      
      <div class="theme-grid">
        ${themes.map(theme => {
          const isSelected = this.config.theme === theme.id;
          
          return html`
            <div 
              class="theme-item ${isSelected ? 'selected' : ''}"
              @click=${() => this._updateTheme(theme.id)}
              style="
                background: ${theme.colors.background};
                color: ${theme.colors.text};
                border: 2px solid ${isSelected ? theme.colors.primary : 'transparent'};
              "
            >
              <div class="theme-preview" style="background: ${theme.colors.primary}"></div>
              <div class="theme-name">${theme.name}</div>
              ${ThemeManager.isGradientTheme(theme.id) ? html`
                <div class="theme-badge gradient">渐变</div>
              ` : ''}
            </div>
          `;
        })}
      </div>
      
      <style>
        .theme-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        
        .theme-item {
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 80px;
        }
        
        .theme-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .theme-item.selected {
          border-width: 3px !important;
        }
        
        .theme-preview {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          margin-bottom: 8px;
        }
        
        .theme-name {
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .theme-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--primary-color);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7em;
        }
        
        .theme-badge.gradient {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }
      </style>
    </div>
  `;
}

  _renderActions() {
    return html`
      <div class="actions">
        <mwc-button outlined @click=${this._cancel}>取消</mwc-button>
        <mwc-button 
          raised 
          @click=${this._save}
          ?disabled=${!this._isConfigValid()}
        >
          保存
        </mwc-button>
      </div>
    `;
  }

  _selectPlugin(plugin) {
    this.config = ConfigManager.createPluginConfig(
      plugin.id, 
      plugin.entityRequirements || []
    );
    this._currentPlugin = plugin;
    this._notifyConfigChange();
  }

  _updateEntity(key, value) {
    this.config.entities = { ...this.config.entities, [key]: value };
    this._notifyConfigChange();
  }

  _updateTheme(theme) {
    this.config.theme = theme;
    this._notifyConfigChange();
  }

  _isConfigValid() {
    if (!this.config.plugin) return false;
    
    const plugin = PluginRegistry.getPlugin(this.config.plugin);
    if (!plugin) return false;

    // 检查必填实体
    const requirements = plugin.manifest.entityRequirements || [];
    for (const req of requirements) {
      if (req.required && !this.config.entities?.[req.key]) {
        return false;
      }
    }

    return true;
  }

  _notifyConfigChange() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this.config }
    }));
  }

  _save() {
    this._notifyConfigChange();
  }

  _cancel() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: null }
    }));
  }
}

customElements.define('ha-cardforge-editor', HaCardForgeEditor);
export { HaCardForgeEditor };