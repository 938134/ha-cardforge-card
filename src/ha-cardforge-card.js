// ha-cardforge-card/ha-cardforge-card.js
import { LitElement } from 'https://unpkg.com/lit@2.8.0/index.js?module';

const ButtonCard = customElements.get('button-card');

class HaCardForgeCard extends ButtonCard {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _entities: { state: true }
  };

  constructor() {
    super();
    this._entities = new Map();
    this._styleManager = new StyleManager();
  }

  async setConfig(config) {
    this._config = this._validateConfig(config);
    this._updateEntities();
    
    // 动态加载样式
    const style = await this._styleManager.loadStyle(this._config.style);
    
    const buttonConfig = this._convertToButtonCard(this._config, style);
    super.setConfig(buttonConfig);
  }

  _validateConfig(config) {
    return {
      style: 'time-week',
      theme: 'default',
      entities: {},
      custom: {},
      ...config
    };
  }

  _updateEntities() {
    this._entities.clear();
    if (!this.hass || !this._config.entities) return;
    
    Object.entries(this._config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entities.set(key, this.hass.states[entityId]);
      }
    });
  }

  _convertToButtonCard(config, style) {
    const entities = Object.fromEntries(this._entities);
    
    return {
      type: 'custom:button-card',
      template: style.getTemplate(config, entities),
      styles: style.getStyles(config) + this._getThemeStyles(config.theme),
      ...this._applyTheme(config)
    };
  }

  _getThemeStyles(theme) {
    const themes = {
      'default': `
        .cardforge-card { 
          background: var(--card-background-color); 
          color: var(--primary-text-color);
        }
      `,
      'dark': `
        .cardforge-card { 
          background: #1e1e1e; 
          color: white;
        }
      `,
      'material': `
        .cardforge-card { 
          background: #fafafa; 
          color: #212121;
          border-radius: 8px;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16);
        }
      `
    };
    return themes[theme] || themes.default;
  }

  _applyTheme(config) {
    const themeConfigs = {
      'dark': { style: 'background: #1e1e1e; color: white;' },
      'material': { style: 'background: #fafafa; color: #212121;' }
    };
    return themeConfigs[config.theme] || {};
  }

  updated(changedProperties) {
    if (changedProperties.has('hass')) {
      this._updateEntities();
      this.setConfig(this._config);
    }
  }

  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      style: 'time-week',
      theme: 'default',
      entities: {
        time: 'sensor.time',
        date: 'sensor.date'
      }
    };
  }
}

// 样式管理器
class StyleManager {
  constructor() {
    this._cache = new Map();
  }

  async loadStyle(styleName) {
    if (this._cache.has(styleName)) {
      return this._cache.get(styleName);
    }

    try {
      const module = await import(`./styles/${styleName}.js`);
      const styleInstance = new module.default();
      this._cache.set(styleName, styleInstance);
      return styleInstance;
    } catch (error) {
      console.error(`加载样式 ${styleName} 失败:`, error);
      return new FallbackStyle(styleName);
    }
  }

  clearCache() {
    this._cache.clear();
  }
}

// 回退样式
class FallbackStyle {
  constructor(styleName) {
    this.styleName = styleName;
  }

  getTemplate(config, entities) {
    return `
      <div style="padding:20px;text-align:center;color:var(--error-color)">
        <div style="font-size:2em">❌</div>
        <div>样式 "${this.styleName}" 加载失败</div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      .cardforge-card {
        border-radius: var(--ha-card-border-radius, 12px);
      }
    `;
  }
}

export { HaCardForgeCard };