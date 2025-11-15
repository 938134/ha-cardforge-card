// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { getJinjaParser } from './jinja-parser.js';

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

  // === 统一数据获取方法 ===
  _getEntityValue(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _getFlexibleValue(hass, source, defaultValue = '') {
    if (!source) return defaultValue;
    
    const parser = getJinjaParser(hass);

    // 如果是实体ID格式（包含点号）
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

  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return this._getFlexibleValue(hass, source, defaultValue);
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
  _getEntityState(entities, key, defaultValue = '') { 
    return this._getEntityValue(entities, key, defaultValue);
  }
  _getEntityAttribute(entities, key, attribute, defaultValue = '') { 
    const entity = entities[key];
    return entity?.attributes?.[attribute] || defaultValue;
  }
  
  // === 样式工具方法 ===
  _responsiveValue(desktop, mobile) { 
    return `${desktop}; @media (max-width: 480px) { ${mobile}; }`; 
  }
  _responsiveFontSize(desktopSize, mobileSize = desktopSize) { 
    return this._responsiveValue(`font-size: ${desktopSize}`, `font-size: ${mobileSize}`); 
  }
  _responsiveHeight(desktopHeight, mobileHeight = desktopHeight) { 
    return this._responsiveValue(`height: ${desktopHeight}`, `height: ${mobileHeight}`); 
  }
  _responsivePadding(desktopPadding, mobilePadding = desktopPadding) { 
    return this._responsiveValue(`padding: ${desktopPadding}`, `padding: ${mobilePadding}`); 
  }
  _responsiveGap(desktopGap, mobileGap = desktopGap) { 
    return this._responsiveValue(`gap: ${desktopGap}`, `gap: ${mobileGap}`); 
  }
  _responsiveMargin(desktopMargin, mobileMargin = desktopMargin) { 
    return this._responsiveValue(`margin: ${desktopMargin}`, `margin: ${mobileMargin}`); 
  }
  
  _flexCenter() { return 'display: flex; align-items: center; justify-content: center;'; }
  _textCenter() { return 'text-align: center;'; }
  _flexColumn() { return 'display: flex; flex-direction: column;'; }
  _flexRow() { return 'display: flex; align-items: center;'; }
  
  _borderRadius(radius = '12px') {
    return `border-radius: ${radius};`;
  }
  
  _boxShadow(intensity = 'medium') {
    const shadows = {
      light: '0 2px 8px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
      strong: '0 8px 25px rgba(0, 0, 0, 0.2)',
      neon: '0 0 10px currentColor, 0 0 20px rgba(255, 255, 255, 0.3)'
    };
    return `box-shadow: ${shadows[intensity] || shadows.medium};`;
  }
  
  _textShadow() {
    return 'text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);';
  }
  
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
    return '';
  }

  // === 样式系统 ===
  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      :host {
        --rgb-primary-background-color: var(--card-background-color, 255, 255, 255);
        --rgb-primary-text-color: var(--primary-text-color, 0, 0, 0);
      }
      
      .cardforge-card {
        position: relative;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        ${this._borderRadius('var(--ha-card-border-radius, 12px)')}
        cursor: default;
        overflow: hidden;
        transition: all 0.3s ease;
        
        ${themeStyles}
      }
      
      .cardforge-card:hover {
        transform: translateY(-2px);
        ${this._boxShadow('strong')}
      }
      
      ${this._getResponsiveStyles()}
      ${this._getAnimationStyles()}
      
      .cardforge-interactive { 
        cursor: pointer; 
        transition: all 0.2s ease; 
      }
      .cardforge-interactive:hover { opacity: 0.8; }
      .cardforge-interactive:active { transform: scale(0.98); }
      
      .cardforge-status-on { color: var(--success-color); }
      .cardforge-status-off { color: var(--disabled-color); }
      .cardforge-status-unavailable { color: var(--error-color); opacity: 0.5; }
      
      .cf-flex { display: flex; }
      .cf-flex-center { display: flex; align-items: center; justify-content: center; }
      .cf-flex-column { display: flex; flex-direction: column; }
      .cf-flex-row { display: flex; align-items: center; }
      .cf-text-center { text-align: center; }
      .cf-text-left { text-align: left; }
      .cf-text-right { text-align: right; }
    `;
  }
  
  _getAnimationStyles() {
    return `
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      @keyframes neonPulse {
        0%, 100% {
          box-shadow: 
            0 0 8px #00ff88,
            inset 0 0 15px rgba(0, 255, 136, 0.1);
        }
        50% {
          box-shadow: 
            0 0 20px #00ff88,
            0 0 35px rgba(0, 255, 136, 0.3),
            inset 0 0 25px rgba(0, 255, 136, 0.2);
        }
      }
      
      @keyframes glassShine {
        0% {
          background-position: -100% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      @keyframes messageFade {
        0% {
          opacity: 0;
          transform: translateY(5px);
        }
        100% {
          opacity: 0.8;
          transform: translateY(0px);
        }
      }
      
      @keyframes sealRotate {
        0%, 100% {
          transform: rotate(15deg);
        }
        50% {
          transform: rotate(25deg);
        }
      }
    `;
  }
  
  _getResponsiveStyles() {
    return `
      @media (max-width: 480px) {
        .cardforge-card {
          ${this._borderRadius('8px')}
        }
      }
      
      @media (max-width: 360px) {
        .cardforge-card {
          ${this._borderRadius('6px')}
        }
      }
    `;
  }

  // === 新的样式工具方法 ===
  _cfPadding(size = 'md') {
    const sizes = {
      xs: 'var(--cf-spacing-xs)',
      sm: 'var(--cf-spacing-sm)',
      md: 'var(--cf-spacing-md)',
      lg: 'var(--cf-spacing-lg)',
      xl: 'var(--cf-spacing-xl)'
    };
    return `padding: ${sizes[size] || sizes.md};`;
  }

  _cfMargin(size = 'md') {
    const sizes = {
      xs: 'var(--cf-spacing-xs)',
      sm: 'var(--cf-spacing-sm)',
      md: 'var(--cf-spacing-md)',
      lg: 'var(--cf-spacing-lg)',
      xl: 'var(--cf-spacing-xl)'
    };
    return `margin: ${sizes[size] || sizes.md};`;
  }

  _cfGap(size = 'md') {
    const sizes = {
      xs: 'var(--cf-spacing-xs)',
      sm: 'var(--cf-spacing-sm)',
      md: 'var(--cf-spacing-md)',
      lg: 'var(--cf-spacing-lg)',
      xl: 'var(--cf-spacing-xl)'
    };
    return `gap: ${sizes[size] || sizes.md};`;
  }

  _cfTextSize(size = 'md') {
    const sizes = {
      xs: '0.75em',
      sm: '0.85em',
      md: '1em',
      lg: '1.2em',
      xl: '1.4em'
    };
    return `font-size: ${sizes[size] || sizes.md};`;
  }

  _cfFontWeight(weight = 'normal') {
    const weights = {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    };
    return `font-weight: ${weights[weight] || weights.normal};`;
  }

  _cfBorderRadius(size = 'lg') {
    const sizes = {
      sm: 'var(--cf-radius-sm)',
      md: 'var(--cf-radius-md)',
      lg: 'var(--cf-radius-lg)',
      xl: 'var(--cf-radius-xl)'
    };
    return `border-radius: ${sizes[size] || sizes.lg};`;
  }

  _cfShadow(intensity = 'md') {
    const shadows = {
      sm: 'var(--cf-shadow-sm)',
      md: 'var(--cf-shadow-md)',
      lg: 'var(--cf-shadow-lg)',
      xl: 'var(--cf-shadow-xl)'
    };
    return `box-shadow: ${shadows[intensity] || shadows.md};`;
  }

  // === 颜色工具方法 ===
  _cfColor(type = 'primary') {
    const colors = {
      primary: 'var(--cf-primary-color)',
      accent: 'var(--cf-accent-color)',
      text: 'var(--cf-text-primary)',
      'text-secondary': 'var(--cf-text-secondary)',
      error: 'var(--cf-error-color)',
      warning: 'var(--cf-warning-color)',
      success: 'var(--cf-success-color)'
    };
    return `color: ${colors[type] || colors.primary};`;
  }

  _cfBackground(type = 'surface') {
    const backgrounds = {
      surface: 'var(--cf-surface)',
      background: 'var(--cf-background)',
      primary: 'var(--cf-primary-color)',
      accent: 'var(--cf-accent-color)'
    };
    return `background: ${backgrounds[type] || backgrounds.surface};`;
  }

  // === 响应式工具方法 ===
  _cfResponsive(desktop, mobile, breakpoint = '480px') {
    return `
      ${desktop}
      @media (max-width: ${breakpoint}) {
        ${mobile}
      }
    `;
  }

  _cfMobileFirst(mobile, desktop, breakpoint = '481px') {
    return `
      ${mobile}
      @media (min-width: ${breakpoint}) {
        ${desktop}
      }
    `;
  }
}