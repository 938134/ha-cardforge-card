// src/ha-cardforge-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { PluginRegistry } from './core/plugin-registry.js';
import { ConfigManager } from './core/config-manager.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _content: { state: true }
  };

  constructor() {
    super();
    this._content = { template: '', styles: '' };
  }

  async setConfig(config) {
    try {
      this.config = ConfigManager.validate(config);
      await this._renderCard();
    } catch (error) {
      this._showError(error);
    }
  }

  async _renderCard() {
    if (!this.config.plugin) return;

    const plugin = PluginRegistry.createInstance(this.config.plugin);
    if (!plugin) throw new Error(`插件不存在: ${this.config.plugin}`);

    // 获取实体数据
    const entities = {};
    Object.entries(this.config.entities || {}).forEach(([key, entityId]) => {
      if (entityId && this.hass?.states?.[entityId]) {
        entities[key] = this.hass.states[entityId];
      }
    });

    // 生成模板和样式
    const template = plugin.getTemplate(this.config, this.hass, entities);
    const styles = plugin.getStyles(this.config);

    this._content = { template, styles };
  }

  render() {
    return html`
      <ha-card>
        <div 
          class="cardforge-card cardforge-theme-${this.config.theme || 'default'}"
          @click=${this._applyTheme}
        >
          ${unsafeHTML(this._content.template)}
        </div>
      </ha-card>
      <style>${this._content.styles}</style>
    `;
  }

  _applyTheme() {
    ThemeManager.applyTheme(this.shadowRoot.querySelector('.cardforge-card'), this.config.theme || 'default');
  }
  
  firstUpdated() {
    this._applyTheme();
  }

  _showError(error) {
    this._content = {
      template: html`
        <div style="padding: 20px; text-align: center; color: var(--error-color);">
          <ha-icon icon="mdi:alert-circle" style="color: var(--error-color);"></ha-icon>
          <div>${error.message}</div>
        </div>
      `,
      styles: ''
    };
  }

  updated(changedProperties) {
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._applyTheme();
    }
  }
}

customElements.define('ha-cardforge-card', HaCardForgeCard);
export { HaCardForgeCard };