// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { LayoutEngine } from './layout-engine.js';
import { BlockManager } from './block-manager.js';

export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 核心接口（必须实现） ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === Manifest 系统 ===
  getManifest() {
    if (!this.constructor.manifest) {
      throw new Error(`插件 ${this.constructor.name} 必须定义 manifest`);
    }
    return this.constructor.manifest;
  }

  // === 布局引擎系统 ===
  processEntities(entities, config, hass) {
    const manifest = this.getManifest();
    return LayoutEngine.process(entities, manifest, hass);
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

  // === 统一卡片容器系统 ===
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
    const title = this._getCardValue(entities, 'title', config.title);
    if (!title) return '';

    const subtitle = this._getCardValue(entities, 'subtitle', config.subtitle);
    
    return `
      <div class="cardforge-header">
        <div class="cardforge-title">${this._renderSafeHTML(title)}</div>
        ${subtitle ? `<div class="cardforge-subtitle">${this._renderSafeHTML(subtitle)}</div>` : ''}
      </div>
    `;
  }
  
  _renderCardFooter(config, entities) {
    const footer = this._getCardValue(entities, 'footer', config.footer);
    if (!footer) return '';

    return `
      <div class="cardforge-footer">
        <div class="footer-text cf-text-small">${this._renderSafeHTML(footer)}</div>
      </div>
    `;
  }

  // === 数据获取 ===
  _getCardValue(entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return source || defaultValue;
  }

  _getEntityValue(entities, key, defaultValue = '') {
    if (!entities || !entities[key]) return defaultValue;
    
    const value = entities[key];
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value._source || value.state || '';
    return String(value);
  }

  // === 辅助布局方法 ===
  renderSection(title, content, className = '') {
    return `
      <div class="cardforge-section ${className}">
        ${title ? `<div class="cardforge-section-title cardforge-title">${title}</div>` : ''}
        <div class="cardforge-section-content">
          ${content}
        </div>
      </div>
    `;
  }

  renderGrid(items, columns = 3, className = '') {
    return `
      <div class="cf-grid cf-grid-${columns} ${className}">
        ${items.join('')}
      </div>
    `;
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