// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';

export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 核心接口 ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === 统一渲染入口 ===
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    return this.getTemplate(safeConfig, hass, entities);
  }

  // === 配置处理 ===
  _getSafeConfig(config) {
    const manifest = this.getManifest();
    const schema = manifest?.config_schema || {};
    const safeConfig = { ...config };
    
    // 应用默认值
    Object.entries(schema).forEach(([key, field]) => {
      if (safeConfig[key] === undefined) {
        safeConfig[key] = field.default !== undefined ? field.default : '';
      }
    });
    
    return safeConfig;
  }

  // === 实体数据获取 ===
  _getEntityState(entities, hass, key, fallback = '') {
    try {
      const entityId = entities?.[key];
      if (!entityId) return fallback;
      
      const entity = hass?.states?.[entityId];
      if (!entity) return '加载中...';
      
      return entity.state || fallback;
    } catch (error) {
      return fallback;
    }
  }

  // === 卡片容器系统 ===
  _renderCardContainer(content, className = '') {
    return `
      <div class="cardforge-card-container ${className}">
        <div class="cardforge-content">
          ${content}
        </div>
      </div>
    `;
  }

  _renderCardHeader(config, entities) {
    const title = this._getEntityState(entities, null, 'title', config.title);
    if (!title) return '';

    const subtitle = this._getEntityState(entities, null, 'subtitle', config.subtitle);
    
    return `
      <div class="cardforge-header">
        <div class="cardforge-title">${this._renderSafeHTML(title)}</div>
        ${subtitle ? `<div class="cardforge-subtitle">${this._renderSafeHTML(subtitle)}</div>` : ''}
      </div>
    `;
  }

  _renderCardFooter(config, entities) {
    const footer = this._getEntityState(entities, null, 'footer', config.footer);
    if (!footer) return '';

    return `
      <div class="cardforge-footer">
        <div class="footer-text cf-text-small">${this._renderSafeHTML(footer)}</div>
      </div>
    `;
  }

  // === 工具方法 ===
  _renderSafeHTML(content) {
    if (!content) return '';
    return String(content)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  _renderIf(condition, template) {
    return condition ? template : '';
  }

  // === Manifest 系统 ===
  getManifest() {
    if (!this.constructor.manifest) {
      throw new Error(`插件 ${this.constructor.name} 必须定义 manifest`);
    }
    return this.constructor.manifest;
  }

  // === 统一样式系统 ===
  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      .cardforge-card-container {
        ${themeStyles}
      }
    `;
  }
}