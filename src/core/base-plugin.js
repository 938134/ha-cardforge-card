// src/core/base-plugin.js
export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 插件信息接口（可选）===
  getPluginInfo() {
    // 子类可以覆盖提供更详细的插件信息
    return {
      name: this.constructor.name.replace('Plugin', ''),
      description: '自定义卡片插件',
      icon: '🔧',
      category: 'general'
    };
  }

  // === 必需实现的接口 ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  // === 可选覆盖的接口 ===
  getEntityRequirements() {
    return [];
  }
  
  getThemeConfig() {
    return {
      useGradient: false,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }
  
  getStyles(config) {
    return this.getBaseStyles(config);
  }

  getServiceConfig() {
    return {};
  }
  
  handleInteraction(type, data, config, hass) {
    console.log(`交互事件: ${type}`, data);
  }

  // === 基础设施方法 ===
  getSystemData(hass, config) {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: now.toLocaleDateString('zh-CN'),
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      user: hass?.user?.name || '家人',
      greeting: this._getGreeting(now.getHours()),
      randomMessage: this._getRandomMessage()
    };
  }
  
  getDeviceData(entities, config) {
    const data = {};
    const requirements = this.getEntityRequirements();
    
    requirements.forEach(req => {
      const entity = entities[req.key];
      if (entity) {
        data[req.key] = {
          state: entity.state,
          attributes: entity.attributes,
          isOn: this._isEntityOn(entity),
          isOff: this._isEntityOff(entity),
          isUnavailable: this._isEntityUnavailable(entity)
        };
      }
    });
    
    return data;
  }

  // === 控制方法 ===
  callService(hass, domain, service, data = {}) {
    if (!hass || !hass.callService) {
      console.error('Home Assistant 服务不可用');
      return false;
    }
    
    hass.callService(domain, service, data)
      .then(() => console.log(`服务调用成功: ${domain}.${service}`))
      .catch(error => console.error(`服务调用失败: ${domain}.${service}`, error));
    
    return true;
  }
  
  toggleEntity(hass, entityId) {
    const entity = hass.states[entityId];
    if (!entity) return false;
    
    const domain = entityId.split('.')[0];
    const service = entity.state === 'on' ? 'turn_off' : 'turn_on';
    
    return this.callService(hass, domain, service, {
      entity_id: entityId
    });
  }

  // === 工具方法 ===
  _isEntityOn(entity) { return entity.state === 'on'; }
  _isEntityOff(entity) { return entity.state === 'off'; }
  _isEntityUnavailable(entity) { return entity.state === 'unavailable' || entity.state === 'unknown'; }
  _getEntityState(entities, key, defaultValue = '') { return entities[key]?.state || defaultValue; }
  _getEntityAttribute(entities, key, attribute, defaultValue = '') { return entities[key]?.attributes?.[attribute] || defaultValue; }
  
  _responsiveValue(desktop, mobile) { return `${desktop}; @media (max-width: 480px) { ${mobile}; }`; }
  _responsiveFontSize(desktopSize, mobileSize = desktopSize) { return this._responsiveValue(`font-size: ${desktopSize}`, `font-size: ${mobileSize}`); }
  _responsiveHeight(desktopHeight, mobileHeight = desktopHeight) { return this._responsiveValue(`height: ${desktopHeight}`, `height: ${mobileHeight}`); }
  _responsivePadding(desktopPadding, mobilePadding = desktopPadding) { return this._responsiveValue(`padding: ${desktopPadding}`, `padding: ${mobilePadding}`); }
  
  _flexCenter() { return 'display: flex; align-items: center; justify-content: center;'; }
  _textCenter() { return 'text-align: center;'; }
  _flexColumn() { return 'display: flex; flex-direction: column;'; }
  
  _getGreeting(hour) {
    if (hour < 6) return '深夜好';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  }
  
  _getRandomMessage() {
    const messages = ['祝您今天愉快！', '一切准备就绪！', '家，因你而温暖'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // === 样式系统 ===
  getBaseStyles(config) {
    const themeConfig = { ...this.getThemeConfig(), ...config.themeConfig };
    return `
      .cardforge-card {
        position: relative;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        border-radius: var(--ha-card-border-radius, 12px);
        ${this._getThemeStyles(themeConfig)}
        cursor: default;
      }
      ${this._getResponsiveStyles()}
      
      .cardforge-interactive { 
        cursor: pointer; 
        transition: all 0.2s ease; 
      }
      .cardforge-interactive:hover { opacity: 0.8; }
      .cardforge-interactive:active { transform: scale(0.98); }
      
      .cardforge-status-on { color: var(--success-color); }
      .cardforge-status-off { color: var(--disabled-color); }
      .cardforge-status-unavailable { color: var(--error-color); opacity: 0.5; }
    `;
  }
  
  _getThemeStyles(themeConfig) {
    if (!themeConfig.useGradient) {
      return 'background: var(--card-background-color); color: var(--primary-text-color);';
    }
    
    const gradientMap = {
      'diagonal': `linear-gradient(135deg, ${themeConfig.gradientColors.join(', ')})`,
      'horizontal': `linear-gradient(90deg, ${themeConfig.gradientColors.join(', ')})`,
      'vertical': `linear-gradient(180deg, ${themeConfig.gradientColors.join(', ')})`,
      'radial': `radial-gradient(circle, ${themeConfig.gradientColors.join(', ')})`
    };
    
    const gradient = gradientMap[themeConfig.gradientType] || gradientMap.diagonal;
    return `background: ${gradient}; color: white;`;
  }
  
  _getResponsiveStyles() {
    return `
      @media (max-width: 480px) {
        .cardforge-card { border-radius: var(--ha-card-border-radius, 8px); }
      }
    `;
  }
}