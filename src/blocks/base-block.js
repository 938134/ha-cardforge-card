// src/blocks/base-block.js
export class BaseBlock {
  static blockType = 'base';
  static blockName = '基础块';
  static blockIcon = 'mdi:cube';
  static category = 'basic';
  static description = '基础块类型';

  constructor() {
    if (new.target === BaseBlock) {
      throw new Error('BaseBlock 是抽象类，必须被继承');
    }
  }

  render(block, hass) {
    throw new Error('必须实现 render 方法');
  }

  getStyles(block) {
    return '';
  }

  getEditTemplate(block, hass, onConfigChange) {
    return '';
  }

  getDefaultConfig() {
    return {};
  }

  validateConfig(config) {
    return { valid: true, errors: [] };
  }

  // 工具方法
  _getSafeConfig(block, defaultConfig = {}) {
    return {
      ...defaultConfig,
      ...block.config
    };
  }

  _renderContainer(content, className = '') {
    return `
      <div class="block-container ${className}">
        <div class="block-content">
          ${content}
        </div>
      </div>
    `;
  }

  _renderHeader(title, subtitle = '') {
    if (!title) return '';
    
    return `
      <div class="block-header">
        <div class="block-title">${this._escapeHtml(title)}</div>
        ${subtitle ? `<div class="block-subtitle">${this._escapeHtml(subtitle)}</div>` : ''}
      </div>
    `;
  }

  _renderValue(value, unit = '') {
    return `
      <div class="block-value-section">
        <div class="block-value">${this._escapeHtml(value)}</div>
        ${unit ? `<div class="block-unit">${this._escapeHtml(unit)}</div>` : ''}
      </div>
    `;
  }

  _escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  _getEntityState(entityId, hass, fallback = '未知') {
    if (!entityId || !hass) return fallback;
    const entity = hass.states?.[entityId];
    return entity?.state || fallback;
  }

  _getEntityAttributes(entityId, hass) {
    if (!entityId || !hass) return {};
    const entity = hass.states?.[entityId];
    return entity?.attributes || {};
  }
}