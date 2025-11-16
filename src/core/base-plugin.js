// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { getJinjaParser } from './jinja-parser.js';

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
  
  // 获取插件 Manifest
  getManifest() {
    if (!this.constructor.manifest) {
      throw new Error(`插件 ${this.constructor.name} 必须定义 manifest`);
    }
    return this._mergeManifest(this.constructor.manifest);
  }

  // Manifest 验证
  _validateManifest(manifest) {
    const requiredFields = ['id', 'name', 'version', 'description', 'category', 'icon'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Manifest 缺少必需字段: ${missingFields.join(', ')}`);
    }
    return true;
  }

  // Manifest 合并
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
      entity_requirements: []
    };
    
    const merged = { ...defaultManifest, ...customManifest };
    this._validateManifest(merged);
    return merged;
  }

  // 配置验证
  _validateConfig(config, manifest) {
    const errors = [];
    const schema = manifest.config_schema || {};
    
    Object.entries(schema).forEach(([key, field]) => {
      const value = config[key];
      
      // 检查必需字段
      if (field.required && (!value || value === '')) {
        errors.push(`必需字段 "${field.label}" 不能为空`);
        return;
      }
      
      // 基础类型验证
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

  // 应用配置默认值
  _applyConfigDefaults(config, manifest) {
    const defaults = {};
    const schema = manifest.config_schema || {};
    
    Object.entries(schema).forEach(([key, field]) => {
      defaults[key] = field.default !== undefined ? field.default : '';
    });
    
    return { ...defaults, ...config };
  }

  // === 系统变量集成 ===
  
  getSystemData(hass, config) {
    const now = new Date();
    
    return {
      // 基础时间数据
      ...this._getBasicTimeData(now),
      // 用户数据
      ...this._getUserData(hass),
      // 问候语数据
      ...this._getGreetingData(now)
    };
  }

  _getBasicTimeData(now) {
    return {
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      time_12h: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: now.toLocaleDateString('zh-CN'),
      date_short: `${now.getMonth() + 1}月${now.getDate()}日`,
      date_number: now.toISOString().split('T')[0],
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      day: String(now.getDate()).padStart(2, '0'),
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      weekday_short: '周' + '日一二三四五六'[now.getDay()],
      timestamp: now.getTime(),
      iso_string: now.toISOString()
    };
  }

  _getUserData(hass) {
    return {
      user: hass?.user?.name || '家人',
      user_id: hass?.user?.id || 'unknown',
      user_language: hass?.language || 'zh-CN',
      timezone: hass?.config?.time_zone || 'Asia/Shanghai'
    };
  }

  _getGreetingData(now) {
    const hour = now.getHours();
    let greeting = '你好';
    
    if (hour < 6) greeting = '深夜好';
    else if (hour < 9) greeting = '早上好';
    else if (hour < 12) greeting = '上午好';
    else if (hour < 14) greeting = '中午好';
    else if (hour < 18) greeting = '下午好';
    else if (hour < 22) greeting = '晚上好';
    else greeting = '夜深了';
    
    return {
      greeting,
      greeting_morning: '早上好',
      greeting_afternoon: '下午好',
      greeting_evening: '晚上好'
    };
  }

  // === 智能数据获取（支持系统变量和Jinja）===
  
  _getCardValue(hass, entities, key, defaultValue = '') {
    // 1. 首先检查系统变量（$开头）
    if (key.startsWith('$')) {
      return this._getSystemVariable(key, hass);
    }
    
    // 2. 原有逻辑：实体 → Jinja → 文本
    const source = this._getEntityValue(entities, key);
    return this._getFlexibleValue(hass, source, defaultValue);
  }

  _getSystemVariable(variableKey, hass) {
    const systemData = this.getSystemData(hass, {});
    const variableName = variableKey.slice(1); // 去掉 $
    
    // 支持嵌套变量，如 $time.current
    const keys = variableName.split('.');
    let value = systemData;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return `[系统变量 ${variableKey} 不存在]`;
      }
    }
    
    return value;
  }

  _getEntityValue(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _getFlexibleValue(hass, source, defaultValue = '') {
    if (!source) return defaultValue;
    
    const parser = getJinjaParser(hass);

    // 如果是实体ID格式
    if (source.includes('.') && hass?.states?.[source]) {
      return hass.states[source].state || defaultValue;
    }
    
    // 如果是Jinja2模板
    if (parser.isJinjaTemplate(source)) {
      return parser.parse(source, defaultValue);
    }
    
    // 直接文本
    return source;
  }

  // === 设备支持 ===
  
  _getDeviceData(entityId, hass) {
    if (!hass || !entityId) return null;
    
    const entity = hass.states[entityId];
    if (!entity) return null;
    
    const domain = entityId.split('.')[0];
    
    return {
      entity: entityId,
      name: entity.attributes?.friendly_name || entityId,
      state: entity.state,
      attributes: entity.attributes || {},
      domain: domain,
      // 统一的操作方法
      actions: this._getDeviceActions(domain)
    };
  }

  _getDeviceActions(domain) {
    const actions = {
      toggle: '切换状态',
      turn_on: '开启',
      turn_off: '关闭'
    };
    
    // 域特定操作
    if (domain === 'climate') {
      actions.set_temperature = '设置温度';
      actions.set_mode = '设置模式';
    } else if (domain === 'fan') {
      actions.set_speed = '设置风速';
    } else if (domain === 'light') {
      actions.set_brightness = '设置亮度';
    }
    
    return actions;
  }

  _deviceAction(hass, entityId, action, data = {}) {
    if (!hass?.callService) {
      console.error('Home Assistant 服务不可用');
      return false;
    }
    
    const domain = entityId.split('.')[0];
    
    try {
      hass.callService(domain, action, {
        entity_id: entityId,
        ...data
      });
      return true;
    } catch (error) {
      console.error(`设备操作失败: ${domain}.${action}`, error);
      return false;
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

  // === 基础样式系统 ===
  
  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      :host {
        --card-bg-light: var(--card-background-color, #ffffff);
        --card-text-light: var(--primary-text-color, #333333);
        --card-border-light: var(--divider-color, #e0e0e0);
        --card-bg-dark: #1a1a1a;
        --card-text-dark: #e0e0e0;
        --card-border-dark: #404040;
      }
      
      /* 响应式容器 */
      .cardforge-responsive-container {
        display: flex;
        flex-direction: column;
        min-height: 80px;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-lg);
        background: var(--card-bg-light);
        color: var(--card-text-light);
        border: 1px solid var(--card-border-light);
        border-radius: var(--cf-radius-lg);
        container-type: inline-size;
        container-name: cardforge-container;
      }
      
      /* 暗色模式适配 */
      @media (prefers-color-scheme: dark) {
        .cardforge-responsive-container {
          background: var(--card-bg-dark);
          color: var(--card-text-dark);
          border-color: var(--card-border-dark);
        }
      }
      
      /* 内容区域 */
      .cardforge-content-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--cf-spacing-md);
      }
      
      /* 布局模式 */
      .layout-single-column .cardforge-content-grid {
        grid-template-columns: 1fr;
      }
      
      .layout-two-columns .cardforge-content-grid {
        grid-template-columns: 1fr;
      }
      
      @container cardforge-container (min-width: 600px) {
        .layout-two-columns .cardforge-content-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      
      /* 错误状态样式 */
      .cardforge-error-container,
      .cardforge-loading-container,
      .cardforge-empty-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        min-height: 80px;
        text-align: center;
      }
      
      .cardforge-loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--card-border-light);
        border-top: 2px solid var(--primary-color, #03a9f4);
        border-radius: 50%;
        animation: cardforge-spin 1s linear infinite;
      }
      
      .cardforge-error-message,
      .cardforge-loading-text,
      .cardforge-empty-message {
        font-size: 0.85em;
        color: var(--secondary-text-color, #757575);
        line-height: 1.4;
      }
      
      @keyframes cardforge-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* 主题样式 */
      .cardforge-responsive-container {
        ${themeStyles}
      }
    `;
  }
}