// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { LayoutStrategy } from './layout-strategy.js';
import { EntityProcessor } from './entity-processor.js';

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
      author: 'CardForge'
    };
    
    const merged = { ...defaultManifest, ...customManifest };
    this._validateManifest(merged);
    return merged;
  }

  // === 配置系统 ===
  getConfigSchema() {
    const manifest = this.getManifest();
    return manifest.config_schema || {};
  }

  getConfigValue(config, key, defaultValue = '') {
    const schema = this.getConfigSchema();
    const field = schema[key];
    
    if (config[key] !== undefined) {
      return config[key];
    }
    
    return field?.default !== undefined ? field.default : defaultValue;
  }

renderConfigEditor(config, onConfigChange) {
  const schema = this.getConfigSchema();
  if (!schema || Object.keys(schema).length === 0) {
    return this._renderNoConfig();
  }

  // 使用新的配置编辑器组件
  return `
    <config-editor 
      .schema="${JSON.stringify(schema).replace(/"/g, '&quot;')}"
      .config="${JSON.stringify(config).replace(/"/g, '&quot;')}"
    ></config-editor>
  `;
}

_renderNoConfig() {
  return `
    <div class="config-empty-state">
      <ha-icon icon="mdi:check-circle"></ha-icon>
      <div>此卡片无需额外配置</div>
    </div>
  `;
}

  _renderConfigField(key, field, config, onConfigChange) {
    const currentValue = this.getConfigValue(config, key);
    
    switch (field.type) {
      case 'boolean':
        return `
          <div class="config-field config-boolean" data-key="${key}">
            <label class="config-label">
              <ha-switch 
                .checked="${!!currentValue}"
              ></ha-switch>
              <span>${field.label}</span>
            </label>
            ${field.description ? `<div class="config-description">${field.description}</div>` : ''}
          </div>
        `;
        
      case 'select':
        const options = field.options.map(opt => 
          `<paper-item value="${opt}">${opt}</paper-item>`
        ).join('');
        
        return `
          <div class="config-field config-select" data-key="${key}">
            <label class="config-label">${field.label}</label>
            <ha-select 
              .value="${currentValue}"
            >
              ${options}
            </ha-select>
            ${field.description ? `<div class="config-description">${field.description}</div>` : ''}
          </div>
        `;
        
      case 'number':
        return `
          <div class="config-field config-number" data-key="${key}">
            <label class="config-label">${field.label}</label>
            <ha-textfield
              type="number"
              .value="${currentValue}"
              min="${field.min || ''}"
              max="${field.max || ''}"
            ></ha-textfield>
            ${field.description ? `<div class="config-description">${field.description}</div>` : ''}
          </div>
        `;
        
      default: // text
        return `
          <div class="config-field config-text" data-key="${key}">
            <label class="config-label">${field.label}</label>
            <ha-textfield
              .value="${currentValue}"
              placeholder="${field.placeholder || ''}"
            ></ha-textfield>
            ${field.description ? `<div class="config-description">${field.description}</div>` : ''}
          </div>
        `;
    }
  }

  // === 布局策略系统 ===
  getLayoutMode() {
    const manifest = this.getManifest();
    return LayoutStrategy.detectMode(manifest);
  }

  getLayoutInfo() {
    const manifest = this.getManifest();
    return LayoutStrategy.getStrategyInfo(manifest);
  }

  validateEntities(entities, config, hass) {
    const mode = this.getLayoutMode();
    const manifest = this.getManifest();
    return LayoutStrategy.validateEntities(mode, entities, manifest);
  }

  processEntities(entities, config, hass) {
    const mode = this.getLayoutMode();
    const manifest = this.getManifest();
    return LayoutStrategy.processEntities(mode, entities, manifest, hass);
  }

  // === 数据获取 ===
  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return EntityProcessor.getFlexibleValue(hass, source, defaultValue);
  }

  _getEntityValue(entities, key, defaultValue = '') {
    return EntityProcessor._getStringValue(entities[key]) || defaultValue;
  }

  // === 实体显示工具 ===
  _getEntityDisplayName(entityConfig, hass) {
    return EntityProcessor.getEntityDisplayName(entityConfig, hass);
  }

  _getEntityIcon(entityConfig, hass) {
    return EntityProcessor.getEntityIcon(entityConfig, hass);
  }

  // === 错误处理模板 ===
  _renderError(message, icon = '❌') {
    return `
      <div class="cardforge-error-container cf-flex cf-flex-center cf-flex-column cf-p-lg">
        <div class="cf-error cf-text-xl cf-mb-md">${icon}</div>
        <div class="cf-text-lg cf-font-bold cf-mb-sm">卡片加载失败</div>
        <div class="cf-text-sm cf-text-secondary">${this._renderSafeHTML(message)}</div>
      </div>
    `;
  }

  _renderLoading(message = '加载中...') {
    return `
      <div class="cardforge-loading-container cf-flex cf-flex-center cf-flex-column cf-p-lg">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <div class="cf-text-md cf-mt-md">${this._renderSafeHTML(message)}</div>
      </div>
    `;
  }

  _renderEmpty(message = '暂无数据', icon = '📭') {
    return `
      <div class="cardforge-empty-container cf-flex cf-flex-center cf-flex-column cf-p-lg">
        <div class="cf-text-xl cf-mb-md">${icon}</div>
        <div class="cf-text-sm cf-text-secondary">${this._renderSafeHTML(message)}</div>
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

  // === 统一卡片容器系统 ===
  _renderCardContainer(content, className = '', config = {}) {
    const themeId = config.theme || 'auto';
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      <div class="cardforge-card-container ${className}" style="${themeStyles}">
        <div class="cardforge-content">
          ${content}
        </div>
      </div>
    `;
  }

  _renderCardHeader(config, entities) {
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
    return `
      /* 统一卡片容器 */
      .cardforge-card-container {
        display: flex;
        flex-direction: column;
        min-height: 80px;
        height: auto;
        padding: var(--cf-spacing-lg);
        container-type: inline-size;
        container-name: cardforge-container;
        position: relative;
        overflow: hidden;
      }

      /* 内容布局系统 */
      .cardforge-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--cf-spacing-md);
      }

      /* 文本样式系统 */
      .cardforge-title {
        font-size: 1.4em;
        font-weight: 600;
        line-height: 1.2;
        margin: 0;
      }

      .cardforge-subtitle {
        font-size: 1em;
        opacity: 0.8;
        margin: 0;
      }

      .cardforge-text-large {
        font-size: 2.5em;
        font-weight: 300;
        line-height: 1;
        margin: 0;
      }

      .cardforge-text-medium {
        font-size: 1.2em;
        line-height: 1.4;
        margin: 0;
      }

      .cardforge-text-small {
        font-size: 0.9em;
        opacity: 0.7;
        margin: 0;
      }

      /* 布局组件 */
      .cardforge-section {
        margin-bottom: var(--cf-spacing-lg);
      }

      .cardforge-section-title {
        margin-bottom: var(--cf-spacing-md);
        font-weight: 600;
        opacity: 0.9;
      }

      .cardforge-footer {
        margin-top: var(--cf-spacing-lg);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .cardforge-card-container {
          padding: var(--cf-spacing-md);
        }
        
        .cardforge-text-large {
          font-size: 2em;
        }
        
        .cf-grid-2,
        .cf-grid-3,
        .cf-grid-4 {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  // 数值安全转换
  _safeParseFloat(value, defaultValue = 0) {
    return EntityProcessor.safeParseFloat(value, defaultValue);
  }

  _safeParseInt(value, defaultValue = 0) {
    return EntityProcessor.safeParseInt(value, defaultValue);
  }
}
