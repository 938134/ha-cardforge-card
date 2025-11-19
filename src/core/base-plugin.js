// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';

export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
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

  // === 布局字段系统 ===
  
  getLayoutFields() {
    const manifest = this.getManifest();
    const capabilities = this.getCardCapabilities();
    
    const defaultLayout = {
      title: capabilities.supportsTitle ? ['title'] : [],
      content: capabilities.supportsContent ? [] : ['content'],
      footer: capabilities.supportsFooter ? ['footer'] : []
    };
    
    return {
      ...defaultLayout,
      ...manifest.layout_fields
    };
  }

  // === 核心接口（必须实现） ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === 实体需求系统 ===
  
  getEntityRequirements() {
    const manifest = this.getManifest();
    
    // 策略检测
    if (manifest.layout_type === 'free') {
      return { strategy: 'free_layout' };
    }
    
    if (manifest.entity_requirements && Object.keys(manifest.entity_requirements).length > 0) {
      return { 
        strategy: 'structured',
        requirements: manifest.entity_requirements
      };
    }
    
    return { strategy: 'stateless' };
  }

  validateEntities(entities, config, hass) {
    const requirements = this.getEntityRequirements();
    
    switch (requirements.strategy) {
      case 'structured':
        return this._validateStructuredEntities(entities, requirements.requirements);
      case 'free_layout':
        return this._validateFreeLayoutEntities(entities);
      default:
        return { valid: true, errors: [], warnings: [] };
    }
  }

  _validateStructuredEntities(entities, requirements) {
    const errors = [];
    const warnings = [];

    Object.entries(requirements).forEach(([key, req]) => {
      if (req.required && (!entities[key] || entities[key].trim() === '')) {
        errors.push(`必需字段 "${req.name}" 未配置`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }

  _validateFreeLayoutEntities(entities) {
    const blocks = this._extractContentBlocks(entities);
    return {
      valid: blocks.length > 0,
      errors: blocks.length === 0 ? ['至少需要添加一个内容块'] : [],
      warnings: []
    };
  }

  _extractContentBlocks(entities) {
    const blocks = [];
    Object.entries(entities || {}).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        blocks.push({
          id: blockId,
          type: value,
          content: entities[blockId] || ''
        });
      }
    });
    return blocks;
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

  // === 数据获取 ===
  
  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return this._getFlexibleValue(hass, source, defaultValue);
  }

  _getEntityValue(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _getFlexibleValue(hass, source, defaultValue = '') {
    if (!source) return defaultValue;
    
    // 实体ID直接获取状态
    if (source.includes('.') && hass?.states?.[source]) {
      const entity = hass.states[source];
      // 如果是传感器实体，返回状态值
      if (entity) {
        return entity.state || defaultValue;
      }
    }
    
    // 直接文本
    return source;
  }

  // === 智能数据获取方法 ===
  
  _getUserName(hass, defaultValue = '朋友') {
    // 优先从Home Assistant获取当前用户名
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
    if (entityConfig.name) {
      return entityConfig.name;
    }
    
    if (entityConfig.source && hass?.states?.[entityConfig.source]) {
      return hass.states[entityConfig.source].attributes?.friendly_name || entityConfig.source;
    }
    
    return entityConfig.source || '未知实体';
  }

  _getEntityIcon(entityConfig, hass) {
    if (entityConfig.icon) {
      return entityConfig.icon;
    }
    
    if (entityConfig.source && hass?.states?.[entityConfig.source]) {
      const domain = entityConfig.source.split('.')[0];
      
      const domainIcons = {
        'light': '💡',
        'sensor': '📊',
        'switch': '🔌',
        'climate': '🌡️',
        'media_player': '📺',
        'person': '👤'
      };
      
      return domainIcons[domain] || '🏷️';
    }
    
    return '🔧';
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

      /* 响应式网格系统 */
      .cardforge-grid {
        display: grid;
        gap: var(--cf-spacing-md);
      }

      .cardforge-grid-auto {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }

      .cardforge-grid-2 {
        grid-template-columns: repeat(2, 1fr);
      }

      .cardforge-grid-3 {
        grid-template-columns: repeat(3, 1fr);
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

      /* 动画系统 */
      .cardforge-animate-fadeIn {
        animation: cardforgeFadeIn 0.6s ease-out;
      }

      .cardforge-animate-slideUp {
        animation: cardforgeSlideUp 0.5s ease-out;
      }

      .cardforge-animate-scale {
        animation: cardforgeScale 0.4s ease-out;
      }

      @keyframes cardforgeFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes cardforgeSlideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes cardforgeScale {
        from { 
          opacity: 0;
          transform: scale(0.9);
        }
        to { 
          opacity: 1;
          transform: scale(1);
        }
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .cardforge-grid-2,
        .cardforge-grid-3 {
          grid-template-columns: 1fr;
        }
        
        .cardforge-text-large {
          font-size: 2em;
        }
      }

      /* 应用主题样式 */
      .cardforge-card-container {
        ${themeStyles}
      }
    `;
  }

  // === 统一模板渲染方法 ===
  
  _renderCardContainer(content, className = '', config = {}) {
    const animationClass = config.animation_style ? `cardforge-animate-${this._getAnimationClass(config.animation_style)}` : '';
    return `
      <div class="cardforge-card-container ${className} ${animationClass}">
        <div class="cardforge-content">
          ${content}
        </div>
      </div>
    `;
  }

  _getAnimationClass(animationStyle) {
    const animationMap = {
      '无': '',
      '淡入': 'fadeIn',
      '滑动': 'slideUp', 
      '缩放': 'scale',
      '弹跳': 'scale',
      '翻转': 'scale',
      '渐显': 'fadeIn',
      '卷轴展开': 'slideUp',
      '毛笔书写': 'fadeIn',
      '逐字显示': 'fadeIn',
      '打字机': 'fadeIn'
    };
    return animationMap[animationStyle] || 'fadeIn';
  }
}