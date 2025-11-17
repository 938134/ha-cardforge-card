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

  // === 系统变量集成 ===
  
  /**
   * 获取系统常用变量
   */
  _getSystemVariables(config, hass, entities) {
    const now = new Date();
    const hour = now.getHours();
    
    // 时间相关变量
    const timeVars = {
      // 基础时间
      current_time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      current_time_12h: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      current_date: now.toLocaleDateString('zh-CN'),
      current_date_short: `${now.getMonth() + 1}月${now.getDate()}日`,
      current_year: now.getFullYear(),
      current_month: String(now.getMonth() + 1).padStart(2, '0'),
      current_day: String(now.getDate()).padStart(2, '0'),
      current_weekday: '星期' + '日一二三四五六'[now.getDay()],
      current_weekday_short: '周' + '日一二三四五六'[now.getDay()],
      
      // 时间组件
      current_hour: String(now.getHours()).padStart(2, '0'),
      current_hour_12: String(hour % 12 || 12).padStart(2, '0'),
      current_minute: String(now.getMinutes()).padStart(2, '0'),
      current_second: String(now.getSeconds()).padStart(2, '0'),
      current_ampm: hour >= 12 ? 'PM' : 'AM',
      
      // 时间判断
      is_morning: hour >= 5 && hour < 12,
      is_noon: hour >= 11 && hour < 13,
      is_afternoon: hour >= 12 && hour < 18,
      is_evening: hour >= 18 || hour < 5,
      is_night: hour >= 20 || hour < 6,
      is_weekend: now.getDay() === 0 || now.getDay() === 6
    };

    // 问候语
    let greeting = '';
    if (hour >= 5 && hour < 12) {
      greeting = '早上好';
    } else if (hour >= 12 && hour < 14) {
      greeting = '中午好';
    } else if (hour >= 14 && hour < 18) {
      greeting = '下午好';
    } else {
      greeting = '晚上好';
    }

    // 用户相关变量
    const userVars = this._getUserVariables(hass, entities);
    
    // 系统状态变量
    const systemVars = {
      // Home Assistant 信息
      ha_version: hass?.config?.version || '',
      ha_location: hass?.config?.location_name || '家庭',
      ha_currency: hass?.config?.currency || 'CNY',
      ha_time_zone: hass?.config?.time_zone || 'Asia/Shanghai',
      ha_language: hass?.config?.language || 'zh-CN',
      
      // 设备信息
      browser_platform: navigator.platform,
      browser_language: navigator.language,
      browser_user_agent: navigator.userAgent,
      
      // 主题信息
      is_dark_mode: document.body.classList.contains('dark') || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches,
      
      // 问候语
      time_greeting: greeting,
      default_greeting: `${greeting}，${userVars.current_user_name || '用户'}！`
    };

    return {
      ...timeVars,
      ...userVars,
      ...systemVars,
      
      // 快捷变量
      now: timeVars.current_time,
      today: timeVars.current_date,
      user: userVars.current_user_name,
      location: systemVars.ha_location
    };
  }

  /**
   * 获取用户相关变量
   */
  _getUserVariables(hass, entities) {
    const users = hass?.user?.name ? [hass.user] : 
                 hass?.states ? this._extractUsersFromStates(hass.states) : [];
    
    const currentUser = users[0] || {};
    
    return {
      // 当前用户
      current_user_name: currentUser.name || '用户',
      current_user_id: currentUser.id || '',
      current_user_is_owner: currentUser.is_owner || false,
      current_user_is_admin: currentUser.is_admin || false,
      
      // 用户列表
      users_count: users.length,
      users_list: users.map(user => user.name),
      users: users,
      
      // 从实体中提取的用户信息
      user_entity_name: this._getEntityValue(entities, 'user_entity_name') || currentUser.name,
      user_entity_id: this._getEntityValue(entities, 'user_entity') || ''
    };
  }

  /**
   * 从实体状态中提取用户信息
   */
  _extractUsersFromStates(states) {
    const users = [];
    
    // 从 person 实体中提取用户
    Object.entries(states).forEach(([entityId, stateObj]) => {
      if (entityId.startsWith('person.')) {
        users.push({
          id: entityId,
          name: stateObj.attributes?.friendly_name || entityId.replace('person.', ''),
          entity_id: entityId,
          state: stateObj.state,
          is_home: stateObj.state === 'home'
        });
      }
    });
    
    return users;
  }

  /**
   * 获取天气相关变量
   */
  _getWeatherVariables(hass) {
    const weatherEntities = Object.entries(hass?.states || {})
      .filter(([entityId]) => entityId.startsWith('weather.'))
      .map(([entityId, stateObj]) => ({
        entity_id: entityId,
        name: stateObj.attributes?.friendly_name || entityId,
        condition: stateObj.state,
        temperature: stateObj.attributes?.temperature,
        humidity: stateObj.attributes?.humidity,
        pressure: stateObj.attributes?.pressure,
        wind_speed: stateObj.attributes?.wind_speed,
        forecast: stateObj.attributes?.forecast || []
      }));
    
    const primaryWeather = weatherEntities[0] || {};
    
    return {
      // 主要天气信息
      weather_condition: primaryWeather.condition || '',
      weather_temperature: primaryWeather.temperature || '',
      weather_humidity: primaryWeather.humidity || '',
      weather_pressure: primaryWeather.pressure || '',
      weather_wind_speed: primaryWeather.wind_speed || '',
      
      // 天气实体列表
      weather_entities: weatherEntities,
      has_weather: weatherEntities.length > 0,
      
      // 快捷变量
      temp: primaryWeather.temperature,
      humidity: primaryWeather.humidity
    };
  }

  /**
   * 获取设备相关变量
   */
  _getDeviceVariables(hass) {
    const devices = {};
    const zones = {};
    
    Object.entries(hass?.states || {}).forEach(([entityId, stateObj]) => {
      // 设备跟踪
      if (entityId.startsWith('device_tracker.') || entityId.startsWith('person.')) {
        const deviceName = stateObj.attributes?.friendly_name || entityId;
        devices[deviceName] = {
          entity_id: entityId,
          name: deviceName,
          state: stateObj.state,
          is_home: stateObj.state === 'home',
          last_changed: stateObj.last_changed
        };
      }
      
      // 区域信息
      if (entityId.startsWith('zone.')) {
        zones[entityId] = {
          name: stateObj.attributes?.friendly_name || entityId,
          latitude: stateObj.attributes?.latitude,
          longitude: stateObj.attributes?.longitude,
          radius: stateObj.attributes?.radius
        };
      }
    });
    
    const homeDevices = Object.values(devices).filter(device => device.is_home);
    
    return {
      // 设备信息
      devices: devices,
      devices_count: Object.keys(devices).length,
      devices_at_home: homeDevices,
      devices_at_home_count: homeDevices.length,
      
      // 区域信息
      zones: zones,
      
      // 快捷变量
      people_at_home: homeDevices.map(device => device.name),
      people_at_home_count: homeDevices.length
    };
  }

  /**
   * 获取系统状态变量
   */
  _getSystemStatusVariables(hass) {
    const entities = Object.keys(hass?.states || {});
    const domains = {};
    
    entities.forEach(entityId => {
      const domain = entityId.split('.')[0];
      domains[domain] = (domains[domain] || 0) + 1;
    });
    
    return {
      // 系统统计
      entities_count: entities.length,
      domains_count: Object.keys(domains).length,
      domains: domains,
      
      // 服务状态
      services_count: Object.keys(hass?.services || {}).length,
      
      // 系统信息
      system_platform: hass?.config?.components || [],
      safe_mode: hass?.config?.safe_mode || false,
      state: hass?.config?.state || ''
    };
  }

  // === 模板渲染辅助方法 ===
  
  /**
   * 渲染模板时替换系统变量
   */
  _renderWithSystemVariables(template, systemVars) {
    if (typeof template !== 'string') return template;
    
    let result = template;
    
    // 替换 {{ variable }} 格式的变量
    Object.entries(systemVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, this._renderSafeHTML(value));
    });
    
    // 替换 {variable} 格式的变量（简化版）
    Object.entries(systemVars).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, this._renderSafeHTML(value));
    });
    
    return result;
  }

  /**
   * 获取完整的系统数据（供插件使用）
   */
  _getCompleteSystemData(config, hass, entities) {
    return {
      ...this._getSystemVariables(config, hass, entities),
      weather: this._getWeatherVariables(hass),
      devices: this._getDeviceVariables(hass),
      system: this._getSystemStatusVariables(hass),
      
      // 原始数据
      _hass: hass,
      _entities: entities,
      _config: config
    };
  }

  // === 动态实体支持 ===
  
  getDynamicEntities(config, hass) {
    return [];
  }

  getAllEntityRequirements(config, hass) {
    const manifest = this.getManifest();
    const staticRequirements = manifest.entity_requirements || [];
    const dynamicRequirements = this.getDynamicEntities(config, hass);
    
    return [...staticRequirements, ...dynamicRequirements];
  }

  validateEntities(entities, config, hass) {
    const requirements = this.getAllEntityRequirements(config, hass);
    const errors = [];
    
    requirements.forEach(req => {
      if (req.required && (!entities[req.key] || entities[req.key].trim() === '')) {
        errors.push(`必需实体 "${req.description}" 不能为空`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
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
      entity_requirements: []
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

  // === 智能数据获取 ===
  
  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return this._getFlexibleValue(hass, source, defaultValue);
  }

  _getEntityValue(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _getFlexibleValue(hass, source, defaultValue = '') {
    if (!source) return defaultValue;
    
    const parser = getJinjaParser(hass);

    // 实体ID直接获取状态
    if (source.includes('.') && hass?.states?.[source]) {
      return hass.states[source].state || defaultValue;
    }
    
    // Jinja模板解析
    if (parser.isJinjaTemplate(source)) {
      return parser.parse(source, defaultValue);
    }
    
    // 直接文本
    return source;
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
      
      // 简化的域图标映射
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
      
      @media (prefers-color-scheme: dark) {
        .cardforge-responsive-container {
          background: var(--card-bg-dark);
          color: var(--card-text-dark);
          border-color: var(--card-border-dark);
        }
      }
      
      .cardforge-content-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--cf-spacing-md);
      }
      
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
      
      .cardforge-responsive-container {
        ${themeStyles}
      }
    `;
  }
}