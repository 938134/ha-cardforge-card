// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { getJinjaParser } from './jinja-parser.js';

export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
    this._systemDataCache = null;
  }

  // === 必需实现的接口 ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === 系统变量核心 ===
  getSystemData(hass, config = {}) {
    // 缓存优化
    const cacheKey = `system_data_${hass?.user?.id}`;
    const now = Date.now();
    
    if (this._systemDataCache && 
        this._systemDataCache.key === cacheKey &&
        now - this._systemDataCache.timestamp < 1000) {
      return this._systemDataCache.data;
    }

    const systemData = this._computeSystemData(hass, config);
    
    this._systemDataCache = {
      key: cacheKey,
      timestamp: now,
      data: systemData
    };
    
    return systemData;
  }

  _computeSystemData(hass, config) {
    const now = new Date();
    
    return {
      // 基础时间系统
      ...this._getTimeSystem(now),
      // 用户环境系统
      ...this._getUserSystem(hass),
      // 平台状态系统
      ...this._getPlatformSystem(hass),
      // 地理位置系统
      ...this._getLocationSystem(hass),
      // 设备管理系统
      ...this._getDeviceSystem(hass)
    };
  }

  _getTimeSystem(now) {
    const weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekdayShortNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    return {
      // 时间相关
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      time_12h: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      time_24h: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: now.getTime(),
      iso_string: now.toISOString(),
      
      // 日期相关
      date: now.toLocaleDateString('zh-CN'),
      date_short: `${now.getMonth() + 1}月${now.getDate()}日`,
      date_number: now.toISOString().split('T')[0],
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      month_name: `${now.getMonth() + 1}月`,
      day: String(now.getDate()).padStart(2, '0'),
      day_of_year: Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)),
      
      // 星期相关
      weekday: weekdayNames[now.getDay()],
      weekday_short: weekdayShortNames[now.getDay()],
      weekday_number: String(now.getDay()),
      
      // 问候语系统
      greeting: this._getGreeting(now.getHours()),
      greeting_morning: '早上好',
      greeting_afternoon: '下午好',
      greeting_evening: '晚上好'
    };
  }

  _getUserSystem(hass) {
    const user = hass?.user;
    
    return {
      user: user?.name || '家人',
      user_id: user?.id || 'unknown',
      user_language: user?.language || 'zh-CN',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'CNY',
      unit_system: 'metric'
    };
  }

  _getPlatformSystem(hass) {
    return {
      platform: 'Home Assistant',
      version: hass?.config?.version || 'unknown',
      integration: 'cardforge',
      dark_mode: this._isDarkMode(),
      mobile: this._isMobile(),
      online: !!hass
    };
  }

  _getLocationSystem(hass) {
    // 基础位置信息，可从HA配置扩展
    return {
      location: {
        country: '中国',
        province: '',
        city: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      language: 'zh-CN',
      locale: 'cn'
    };
  }

  _getDeviceSystem(hass) {
    if (!hass) return { devices: {}, device_summary: {} };
    
    return {
      devices: this._discoverUserDevices(hass),
      device_summary: this._computeDeviceSummary(hass)
    };
  }

  // === 智能数据获取 ===
  _getCardValue(hass, entities, key, defaultValue = '') {
    // 1. 系统变量优先
    if (key.startsWith('$')) {
      return this._getSystemVariable(key, hass);
    }
    
    // 2. 实体数据
    const source = this._getEntityValue(entities, key);
    
    // 3. 智能解析：实体 → Jinja → 文本
    return this._getFlexibleValue(hass, source, defaultValue);
  }

  _getSystemVariable(variableKey, hass) {
    const systemData = this.getSystemData(hass, {});
    const variableName = variableKey.slice(1);
    
    // 支持嵌套变量：$user.name, $devices.climate.living_room_ac
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

    // 实体ID格式
    if (source.includes('.') && hass?.states?.[source]) {
      return hass.states[source].state || defaultValue;
    }
    
    // Jinja模板
    if (parser.isJinjaTemplate(source)) {
      return parser.parse(source, defaultValue);
    }
    
    // 纯文本
    return source;
  }

  // === 设备管理 ===
  _discoverUserDevices(hass) {
    const devices = {};
    const deviceDomains = ['climate', 'fan', 'light', 'media_player', 'switch', 'cover'];
    
    Object.entries(hass.states).forEach(([entityId, state]) => {
      const domain = entityId.split('.')[0];
      
      if (deviceDomains.includes(domain)) {
        const deviceInfo = this._parseDeviceEntity(entityId, state);
        if (deviceInfo) {
          devices[domain] = devices[domain] || {};
          devices[domain][entityId] = deviceInfo;
        }
      }
    });
    
    return devices;
  }

  _parseDeviceEntity(entityId, state) {
    const domain = entityId.split('.')[0];
    const attributes = state.attributes || {};
    
    return {
      entity: entityId,
      name: attributes.friendly_name || entityId,
      state: state.state,
      attributes: attributes,
      type: domain,
      can_control: true
    };
  }

  _computeDeviceSummary(hass) {
    const devices = this._discoverUserDevices(hass);
    let total = 0;
    let online = 0;
    let active = 0;
    const byType = {};
    
    Object.entries(devices).forEach(([domain, domainDevices]) => {
      const domainCount = Object.keys(domainDevices).length;
      total += domainCount;
      
      byType[domain] = {
        total: domainCount,
        on: Object.values(domainDevices).filter(d => d.state === 'on').length
      };
    });
    
    return {
      total_devices: total,
      online_devices: total, // 简化处理
      active_devices: active,
      by_type: byType
    };
  }

  _getDeviceData(entityId) {
    // 简化实现，实际应从hass状态获取
    return {
      entity: entityId,
      name: entityId.split('.')[1],
      state: 'on',
      type: entityId.split('.')[0],
      can_control: true
    };
  }

  _deviceAction(entityId, action, data = {}) {
    console.log(`设备操作: ${entityId}.${action}`, data);
    // 实际应调用 hass.callService
    return true;
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

  _renderList(items, templateFn) {
    if (!Array.isArray(items) || items.length === 0) return '';
    return items.map(templateFn).join('');
  }

  _getEntityStateSafe(hass, entityId, defaultValue = '') {
    if (!hass || !entityId) return defaultValue;
    const entity = hass.states[entityId];
    return entity?.state || defaultValue;
  }

  _safeParseFloat(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  // === 基础样式系统 ===
  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      ${this._getCSSVariables()}
      ${this._getContainerStyles()}
      ${this._getThemeStyles(themeStyles)}
      ${this._getResponsiveStyles()}
      ${this._getUtilityStyles()}
    `;
  }

  _getCSSVariables() {
    return `
      :host {
        /* 间距系统 */
        --cf-spacing-xs: 4px;
        --cf-spacing-sm: 8px;
        --cf-spacing-md: 12px;
        --cf-spacing-lg: 16px;
        --cf-spacing-xl: 20px;
        
        /* 字体系统 */
        --cf-text-xs: 0.75em;
        --cf-text-sm: 0.85em;
        --cf-text-md: 1em;
        --cf-text-lg: 1.2em;
        --cf-text-xl: 1.4em;
        
        /* 响应式断点 */
        --breakpoint-mobile: 480px;
        --breakpoint-tablet: 768px;
        --breakpoint-desktop: 1024px;
      }
    `;
  }

  _getContainerStyles() {
    return `
      .cardforge-responsive-container {
        /* 基础布局 */
        display: flex;
        flex-direction: column;
        min-height: 80px;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-lg);
        
        /* 响应式容器 */
        container-type: inline-size;
        container-name: cardforge-container;
        
        /* 主题基础 */
        background: var(--card-bg, var(--cf-surface));
        color: var(--card-text, var(--cf-text-primary));
        border: 1px solid var(--card-border, var(--cf-border));
        border-radius: var(--cf-radius-lg, 12px);
        box-shadow: var(--card-shadow, var(--cf-shadow-md));
        
        /* 动画 */
        transition: all 0.3s ease;
      }
      
      .cardforge-responsive-container:hover {
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-lg);
      }
      
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
      
      .layout-grid .cardforge-content-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--cf-spacing-sm);
      }
      
      .layout-list .cardforge-content-grid {
        grid-template-columns: 1fr;
      }
    `;
  }

  _getThemeStyles(themeStyles) {
    return `
      ${themeStyles}
      
      /* 自动暗色模式适配 */
      @media (prefers-color-scheme: dark) {
        .cardforge-responsive-container {
          --card-bg: var(--cf-dark-surface);
          --card-text: var(--cf-dark-text);
          --card-border: var(--cf-dark-border);
          --card-shadow: var(--cf-dark-shadow-md);
        }
      }
    `;
  }

  _getResponsiveStyles() {
    return `
      /* 容器查询响应式 */
      @container cardforge-container (min-width: 400px) {
        .layout-two-columns .cardforge-content-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
      
      /* 移动端适配 */
      @media (max-width: 600px) {
        .cardforge-responsive-container {
          padding: var(--cf-spacing-md);
          gap: var(--cf-spacing-sm);
        }
      }
      
      @media (max-width: 400px) {
        .cardforge-responsive-container {
          padding: var(--cf-spacing-sm);
        }
      }
    `;
  }

  _getUtilityStyles() {
    return `
      /* 错误状态 */
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
      
      .cardforge-error-icon,
      .cardforge-loading-spinner,
      .cardforge-empty-icon {
        font-size: 2em;
        opacity: 0.7;
      }
      
      .cardforge-loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--cf-border);
        border-top: 2px solid var(--cf-primary-color);
        border-radius: 50%;
        animation: cardforge-spin 1s linear infinite;
      }
      
      .cardforge-error-message,
      .cardforge-loading-text,
      .cardforge-empty-message {
        font-size: var(--cf-text-sm);
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }
      
      @keyframes cardforge-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* 工具类 */
      .cardforge-flex-column { display: flex; flex-direction: column; }
      .cardforge-flex-row { display: flex; align-items: center; }
      .cardforge-flex-center { display: flex; align-items: center; justify-content: center; }
      .cardforge-flex-between { display: flex; align-items: center; justify-content: space-between; }
      
      .cardforge-gap-xs { gap: var(--cf-spacing-xs); }
      .cardforge-gap-sm { gap: var(--cf-spacing-sm); }
      .cardforge-gap-md { gap: var(--cf-spacing-md); }
      .cardforge-gap-lg { gap: var(--cf-spacing-lg); }
    `;
  }

  // === 辅助方法 ===
  _getGreeting(hour) {
    if (hour < 6) return '深夜好';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  }

  _isDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  _isMobile() {
    return window.innerWidth <= 768;
  }
}