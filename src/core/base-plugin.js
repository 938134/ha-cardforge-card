// src/core/base-plugin.js
export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 必需实现的接口 ===
  getTemplate(config, hass, entities) {
    throw new Error('必须实现 getTemplate 方法');
  }

  getStyles(config) {
    throw new Error('必须实现 getStyles 方法');
  }

  // === 可选覆盖的接口 ===
  getThemeConfig() {
    return {
      useGradient: false,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }

  // === 系统数据工具 ===
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
        ${this._getThemeStyles(themeConfig, config.theme)}
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
  
  _getThemeStyles(themeConfig, themeId = 'auto') {
    // 根据 themeId 和 themeConfig 生成样式
    if (!themeConfig.useGradient) {
      return this._getSolidTheme(themeId);
    }
    
    return this._getGradientTheme(themeConfig, themeId);
  }
  
  _getSolidTheme(themeId) {
    const themes = {
      'auto': `
        background: var(--card-background-color); 
        color: var(--primary-text-color);
      `,
      'light': `
        background: #ffffff; 
        color: #333333;
        --primary-color: #03a9f4;
        --accent-color: #ff4081;
      `,
      'dark': `
        background: #1e1e1e; 
        color: #ffffff;
        --primary-color: #03a9f4;
        --accent-color: #ff4081;
      `,
      'colorful': `
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); 
        color: white;
      `
    };
    
    return themes[themeId] || themes.auto;
  }
  
  _getGradientTheme(themeConfig, themeId) {
    // 多彩主题使用欢迎卡片的渐变色彩
    const gradientColors = {
      'auto': ['var(--primary-color)', 'var(--accent-color)'],
      'light': ['#4facfe', '#00f2fe'],
      'dark': ['#667eea', '#764ba2'], 
      'colorful': ['var(--primary-color)', 'var(--accent-color)']
    };
    
    const colors = gradientColors[themeId] || gradientColors.auto;
    
    const gradientMap = {
      'diagonal': `linear-gradient(135deg, ${colors.join(', ')})`,
      'horizontal': `linear-gradient(90deg, ${colors.join(', ')})`,
      'vertical': `linear-gradient(180deg, ${colors.join(', ')})`,
      'radial': `radial-gradient(circle, ${colors.join(', ')})`
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
