// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { LayoutEngine } from './layout-engine.js';
import { BlockManager } from './block-manager.js';

export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
    this._currentConfig = {};
  }

  // === 核心接口（必须实现） ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === 统一的模板入口 ===
  render(config, hass, entities) {
    // 自动处理配置
    const safeConfig = this._prepareConfig(config);
    
    // 调用子类的具体实现
    return this.getTemplate(safeConfig, hass, entities);
  }

  // === 配置预处理 ===
  _prepareConfig(config) {
    this._currentConfig = this._getSafeConfig(config);
    return this._currentConfig;
  }

  // === 基于 manifest 的统一配置处理 ===
  _getSafeConfig(config) {
    const manifest = this.getManifest();
    const schema = manifest?.config_schema || {};
    const safeConfig = { ...config };
    
    Object.entries(schema).forEach(([key, field]) => {
      // 如果配置项未定义，使用 manifest 中定义的默认值
      if (safeConfig[key] === undefined) {
        safeConfig[key] = this._getFieldDefaultValue(field);
      }
    });
    
    return safeConfig;
  }

  // === 根据字段类型获取默认值 ===
  _getFieldDefaultValue(field) {
    if (field.default !== undefined) {
      return field.default;
    }
    
    // 如果 manifest 中没有定义默认值，根据类型返回合理的默认值
    switch (field.type) {
      case 'boolean':
        return false;
      case 'number':
        return 0;
      case 'select':
        return field.options?.[0] || '';
      default:
        return '';
    }
  }

  // === 简化的实体数据获取 ===
  _getEntityData(entities, hass, key) {
    if (!entities || !entities[key]) {
      return null;
    }
    
    const entityId = entities[key];
    
    // 直接通过 hass 获取实体状态
    if (hass?.states?.[entityId]) {
      const entity = hass.states[entityId];
      return {
        id: entityId,
        state: entity.state,
        attributes: entity.attributes || {}
      };
    }
    
    // 如果实体不存在，返回基本信息
    return {
      id: entityId,
      state: '未知',
      attributes: {}
    };
  }

  // === 批量获取实体数据 ===
  _getEntitiesData(entities, hass, keys) {
    const result = {};
    keys.forEach(key => {
      result[key] = this._getEntityData(entities, hass, key);
    });
    return result;
  }

  // === 优雅的实体状态获取 ===
  _getEntityState(entities, hass, key, fallback = '') {
    try {
      const entityId = entities?.[key];
      if (!entityId) return fallback;
      
      return hass?.states?.[entityId]?.state || fallback;
    } catch (error) {
      console.warn(`获取实体状态失败 ${key}:`, error);
      return fallback;
    }
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