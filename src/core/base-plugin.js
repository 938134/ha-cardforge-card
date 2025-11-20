// src/core/base-plugin.js
import { themeManager } from './theme-manager.js';

export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 必须实现的接口 ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === 默认的 getManifest 实现 ===
  getManifest() {
    // 如果子类没有定义静态 manifest，抛出错误
    if (!this.constructor.manifest) {
      throw new Error(`插件 ${this.constructor.name} 必须定义静态 manifest 属性`);
    }
    return this._mergeManifest(this.constructor.manifest);
  }

  // === 可选的生命周期方法 ===
  onConfigChange(newConfig, oldConfig) {}
  onEntitiesChange(newEntities, oldEntities) {}
  onThemeChange(newTheme, oldTheme) {}

  // === Manifest 工具方法 ===
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
      },
      layout_type: 'auto',
      allow_custom_entities: false,
      entity_requirements: {}
    };
    
    const merged = { ...defaultManifest, ...customManifest };
    this._validateManifest(merged);
    return merged;
  }

  // === 配置验证 ===
  _validateConfig(config, manifest) {
    const errors = [];
    const schema = manifest.config_schema || {};
    
    Object.entries(schema).forEach(([key, field]) => {
      const value = config[key];
      
      if (field.required && (!value || value === '')) {
        errors.push(`必需字段 "${field.label}" 不能为空`);
        return;
      }
      
      if (value && field.type) {
        switch (field.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`字段 "${field.label}" 必须是数字`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`字段 "${field.label}" 必须是布尔值`);
            }
            break;
          case 'select':
            if (field.options && !field.options.includes(value)) {
              errors.push(`字段 "${field.label}" 必须是有效选项`);
            }
            break;
        }
      }
    });
    
    if (errors.length > 0) {
      throw new Error(`配置验证失败: ${errors.join('; ')}`);
    }
    return true;
  }

  _applyConfigDefaults(config, manifest) {
    const defaults = {};
    const schema = manifest.config_schema || {};
    
    Object.entries(schema).forEach(([key, field]) => {
      defaults[key] = field.default !== undefined ? field.default : '';
    });
    
    return { ...defaults, ...config };
  }

  // === 数据获取工具方法 ===
  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return this._getFlexibleValue(hass, source, defaultValue);
  }

  _getEntityValue(entities, key, defaultValue = '') {
    if (entities && typeof entities[key] === 'object') {
      return entities[key]?.state || defaultValue;
    }
    return entities?.[key] || defaultValue;
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

  // === 错误处理模板 ===
  _renderError(message, icon = '❌') {
    return `
      <div class="cardforge-error-container">
        <div class="cardforge-error-icon">${icon}</div>
        <div class="cardforge-error-message">${this._renderSafeHTML(message)}</div>
      </div>
    `;
  }

  _renderLoading(message = '加载中...') {
    return `
      <div class="cardforge-loading-container">
        <div class="cardforge-loading-spinner"></div>
        <div class="cardforge-loading-text">${this._renderSafeHTML(message)}</div>
      </div>
    `;
  }

  _renderEmpty(message = '暂无数据', icon = '📭') {
    return `
      <div class="cardforge-empty-container">
        <div class="cardforge-empty-icon">${icon}</div>
        <div class="cardforge-empty-message">${this._renderSafeHTML(message)}</div>
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

  // === 统一卡片容器系统 ===
  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
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

      .cardforge-content-centered {
        align-items: center;
        text-align: center;
      }

      .cardforge-content-spaced {
        justify-content: space-between;
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

      /* 应用主题样式 */
      .cardforge-card-container {
        ${themeStyles}
      }
    `;
  }

  // === 统一模板渲染方法 ===
  _renderCardContainer(content, className = '') {
    return `
      <div class="cardforge-card-container ${className}">
        <div class="cardforge-content">
          ${content}
        </div>
      </div>
    `;
  }

  _renderCardHeader(title, subtitle = '') {
    if (!title) return '';
    
    return `
      <div class="cardforge-header">
        <div class="cardforge-title">${this._renderSafeHTML(title)}</div>
        ${subtitle ? `<div class="cardforge-subtitle">${this._renderSafeHTML(subtitle)}</div>` : ''}
      </div>
    `;
  }
  
  _renderCardFooter(footer) {
    if (!footer) return '';
    
    return `
      <div class="cardforge-footer">
        <div class="footer-text">${this._renderSafeHTML(footer)}</div>
      </div>
    `;
  }
}