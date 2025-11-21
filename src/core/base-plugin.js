// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { LayoutEngine } from './layout-engine.js';
import { BlockManager } from './block-manager.js';
import { ConfigManager } from './config-manager.js';

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
    return this._mergeManifest(this.constructor.manifest);
  }

  _validateManifest(manifest) {
    const requiredFields = ['id', 'name', 'version', 'description', 'category', 'icon'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Manifest 缺少必需字段: ${missingFields.join(', ')}`);
    }
    return true;
  }

  _mergeManifest(customManifest) {
    const defaultManifest = {
      id: '',
      name: '',
      version: '1.0.0',
      description: '',
      category: 'general',
      icon: '📄',
      author: 'CardForge',
      config_schema: {},
      capabilities: {},
      supported_features: {
        fonts: true,
        alignment: true,
        spacing: true,
        borders: true,
        colors: true,
        animations: true
      }
    };
    
    const merged = { ...defaultManifest, ...customManifest };
    this._validateManifest(merged);
    return merged;
  }

  // === 获取支持的功能 ===
  getSupportedFeatures() {
    const manifest = this.getManifest();
    return manifest.supported_features || {};
  }

  // === 布局引擎系统 ===
  getLayoutMode() {
    const manifest = this.getManifest();
    return LayoutEngine.detectMode(manifest);
  }

  validateEntities(entities, config, hass) {
    const manifest = this.getManifest();
    return LayoutEngine.validate(entities, manifest);
  }

  processEntities(entities, config, hass) {
    const manifest = this.getManifest();
    return LayoutEngine.process(entities, manifest, hass);
  }

  // === 卡片能力系统 ===
  getCardCapabilities() {
    const manifest = this.getManifest();
    const defaultCapabilities = {
      supportsTitle: false,
      supportsContent: false, 
      supportsFooter: false
    };
    
    return {
      ...defaultCapabilities,
      ...manifest.capabilities
    };
  }

  // === 配置验证 ===
  _validateConfig(config, manifest) {
    return ConfigManager.validateConfig(config, manifest.config_schema);
  }

  _applyConfigDefaults(config, manifest) {
    return ConfigManager.applyDefaults(config, manifest.config_schema);
  }

  // === 数据获取 ===
  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return this._getFlexibleValue(hass, source, defaultValue);
  }

  _getEntityValue(entities, key, defaultValue = '') {
    if (!entities || !entities[key]) return defaultValue;
    
    const value = entities[key];
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value._source || value.state || '';
    return String(value);
  }

  _getFlexibleValue(hass, source, defaultValue = '') {
    if (!source) return defaultValue;
    
    // 实体ID直接获取状态
    if (source.includes('.') && hass?.states?.[source]) {
      const entity = hass.states[source];
      return entity.state || defaultValue;
    }
    
    // 直接文本
    return source;
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
  _renderCardContainer(content, className = '', config = {}) {
    const alignment = config.text_alignment || 'center';
    const alignmentClass = `cf-text-${alignment === '左对齐' ? 'left' : alignment === '右对齐' ? 'right' : 'center'}`;
    const animationClass = config.animation_style && config.animation_style !== '无' ? 'cardforge-animate-fadeIn' : '';
    
    return `
      <div class="cardforge-card-container ${className} ${alignmentClass} ${animationClass}">
        <div class="cardforge-content">
          ${content}
        </div>
      </div>
    `;
  }

  _renderCardHeader(config, entities) {
    const capabilities = this.getCardCapabilities();
    if (!capabilities.supportsTitle) return '';

    const title = this._getCardValue(this.hass, entities, 'title', config.title);
    if (!title) return '';

    const subtitle = this._getCardValue(this.hass, entities, 'subtitle', config.subtitle);
    
    return `
      <div class="cardforge-header">
        <div class="cardforge-title">${this._renderSafeHTML(title)}</div>
        ${subtitle ? `<div class="cardforge-subtitle">${this._renderSafeHTML(subtitle)}</div>` : ''}
      </div>
    `;
  }
  
  _renderCardFooter(config, entities) {
    const capabilities = this.getCardCapabilities();
    if (!capabilities.supportsFooter) return '';

    const footer = this._getCardValue(this.hass, entities, 'footer', config.footer);
    if (!footer) return '';

    return `
      <div class="cardforge-footer">
        <div class="footer-text cf-text-small">${this._renderSafeHTML(footer)}</div>
      </div>
    `;
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

  renderFlex(items, direction = 'row', justify = 'center', align = 'center', className = '') {
    return `
      <div class="cf-flex ${className}" 
           style="flex-direction: ${direction}; justify-content: ${justify}; align-items: ${align};">
        ${items.join('')}
      </div>
    `;
  }

  // === 统一样式系统 ===
  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      /* 应用主题样式 */
      .cardforge-card-container {
        ${themeStyles}
      }
    `;
  }

  // 数值安全转换
  _safeParseFloat(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  _safeParseInt(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
  }
}