// src/core/base-plugin.js
export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
    this._styleCache = new Map();
  }

  // === 核心接口 ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === 生命周期钩子 ===
  onConfigUpdate(oldConfig, newConfig) {}
  onEntitiesUpdate(entities) {}
  onHassUpdate(hass) {}
  onDestroy() {}

  // === 响应式数据工具 ===
  createReactiveData(initialValue) {
    let value = initialValue;
    const subscribers = new Set();

    return {
      get value() { return value; },
      set value(newValue) {
        const oldValue = value;
        value = newValue;
        subscribers.forEach(callback => callback(newValue, oldValue));
      },
      subscribe(callback) {
        subscribers.add(callback);
        return () => subscribers.delete(callback);
      }
    };
  }

  // === 优雅的样式系统 ===
  getBaseStyles(config) {
    const cacheKey = JSON.stringify(config);
    if (this._styleCache.has(cacheKey)) {
      return this._styleCache.get(cacheKey);
    }

    const themeConfig = { ...this.getThemeConfig(), ...config.themeConfig };
    const styles = `
      .cardforge-card {
        position: relative;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        border-radius: var(--ha-card-border-radius, 12px);
        ${this._applyTheme(themeConfig)}
        cursor: default;
        transition: all 0.3s ease;
      }
      
      .cardforge-interactive { 
        cursor: pointer; 
        transition: all 0.2s ease; 
      }
      
      .cardforge-interactive:hover { 
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      ${this._getResponsiveBase()}
    `;

    this._styleCache.set(cacheKey, styles);
    return styles;
  }

  _applyTheme(themeConfig) {
    const themes = {
      default: `
        background: var(--card-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
      `,
      dark: `
        background: var(--dark-primary-color);
        color: var(--text-primary-color);
        border: none;
      `,
      material: `
        background: var(--card-background-color);
        color: var(--primary-text-color);
        border: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      `
    };

    return themes[themeConfig.theme] || themes.default;
  }

  _getResponsiveBase() {
    return `
      @media (max-width: 480px) {
        .cardforge-card {
          border-radius: var(--ha-card-border-radius, 8px);
          margin: 4px;
        }
      }
    `;
  }

  // === 现代化的工具方法 ===
  css = (strings, ...values) => {
    return String.raw({ raw: strings }, ...values);
  };

  responsive = (desktop, mobile = desktop) => this.css`
    ${desktop}
    @media (max-width: 480px) { ${mobile} }
  `;

  // === 数据获取工具 ===
  async fetchEntityHistory(hass, entityId, hours = 24) {
    if (!hass || !entityId) return [];
    
    try {
      const end = new Date();
      const start = new Date(end.getTime() - (hours * 60 * 60 * 1000));
      
      const response = await hass.callApi('GET', `history/period/${start.toISOString()}`, {
        filter_entity_id: entityId,
        end_time: end.toISOString(),
      });
      
      return response[0] || [];
    } catch (error) {
      console.warn('获取历史数据失败:', error);
      return [];
    }
  }
}
