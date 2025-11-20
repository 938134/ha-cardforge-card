// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { LayoutStrategy } from './layout-strategy.js';
import { EntityProcessor } from './entity-processor.js';
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
      layout_fields: {
        title: [],
        content: [],
        footer: []
      }
    };
    
    const merged = { ...defaultManifest, ...customManifest };
    this._validateManifest(merged);
    return merged;
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
    return EntityProcessor.getFlexibleValue(hass, source, defaultValue);
  }

  _getEntityValue(entities, key, defaultValue = '') {
    return EntityProcessor._getStringValue(entities[key]) || defaultValue;
  }

  // === 智能数据获取方法 ===
  _getUserName(hass, defaultValue = '朋友') {
    if (hass?.user?.name) {
      return hass.user.name;
    }
    return defaultValue;
  }

  _getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '早上好';
    } else if (hour >= 12 && hour < 14) {
      return '中午好';
    } else if (hour >= 14 && hour < 18) {
      return '下午好';
    } else if (hour >= 18 && hour < 22) {
      return '晚上好';
    } else {
      return '你好';
    }
  }

  _getTimePeriodMessage() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '美好的一天从早晨开始';
    } else if (hour >= 12 && hour < 14) {
      return '午间时光，注意休息';
    } else if (hour >= 14 && hour < 18) {
      return '下午工作效率最高';
    } else if (hour >= 18 && hour < 22) {
      return '晚间放松时间';
    } else {
      return '夜深了，早点休息';
    }
  }

  _getDefaultWelcomeMessage() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '今天也是充满活力的一天！';
    } else if (hour >= 12 && hour < 14) {
      return '午餐时间到，记得按时吃饭';
    } else if (hour >= 14 && hour < 18) {
      return '下午工作加油！';
    } else if (hour >= 18 && hour < 22) {
      return '晚上放松一下';
    } else {
      return '夜深了，注意休息';
    }
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
    const styleConfig = ConfigManager.getStyleConfig(config);
    const cssVariables = ConfigManager.generateCSSVariables(styleConfig);
    
    return `
      ${cssVariables}
      
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

      /* 应用主题样式 */
      .cardforge-card-container {
        ${themeStyles}
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