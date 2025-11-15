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

  // === 通用安全工具函数 ===
  
  // 安全的实体状态获取
  _getEntityStateSafe(hass, entityId, defaultValue = '') {
    if (!hass || !entityId) return defaultValue;
    
    const entity = hass.states[entityId];
    if (!entity) {
      console.warn(`实体不存在: ${entityId}`);
      return defaultValue;
    }
    
    return entity.state || defaultValue;
  }

  // 安全的实体属性获取
  _getEntityAttribute(hass, entityId, attribute, defaultValue = '') {
    if (!hass || !entityId) return defaultValue;
    
    const entity = hass.states[entityId];
    if (!entity || !entity.attributes) return defaultValue;
    
    return entity.attributes[attribute] || defaultValue;
  }

  // 批量获取实体状态
  _getMultipleEntityStates(hass, entityMap) {
    const result = {};
    Object.entries(entityMap).forEach(([key, entityId]) => {
      result[key] = this._getEntityStateSafe(hass, entityId);
    });
    return result;
  }

  // 安全的数值转换
  _safeParseFloat(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }

  // 安全的整数转换
  _safeParseInt(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
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

  // === 安全渲染工具 ===
  
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

  // === 基础样式工具 ===
  
  // 统一卡片容器样式（保证上下间距一致）
  _getCardContainerStyles() {
    return `
      .cardforge-card-container {
        ${this._cfPadding('lg')}
        ${this._cfBackground('surface')}
        ${this._cfBorderRadius('lg')}
        ${this._cfShadow('md')}
        min-height: auto;
        height: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
        overflow: visible;
        border: 1px solid var(--cf-border);
        transition: all var(--cf-transition-normal);
        box-sizing: border-box;
      }
      
      .cardforge-card-container:hover {
        ${this._cfShadow('lg')}
        transform: translateY(-2px);
        border-color: rgba(var(--cf-rgb-primary), 0.3);
      }
      
      /* 保证所有卡片上下间距一致 */
      .cardforge-card-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: 60px; /* 最小内容高度 */
        gap: var(--cf-spacing-md);
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
        ${this._cfTextSize('sm')}
        ${this._cfColor('text-secondary')}
        line-height: 1.4;
      }
    `;
  }

  // 统一内容区域样式
  _getContentAreaStyles() {
    return `
      .cardforge-content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--cf-spacing-md);
      }
      
      .cardforge-content-header {
        ${this._cfTextSize('lg')}
        ${this._cfFontWeight('bold')}
        ${this._cfColor('text')}
        text-align: center;
        line-height: 1.2;
        margin: 0;
      }
      
      .cardforge-content-body {
        ${this._cfTextSize('md')}
        ${this._cfColor('text')}
        line-height: 1.4;
        text-align: center;
        margin: 0;
      }
      
      .cardforge-content-large {
        ${this._cfTextSize('xl')}
        ${this._cfFontWeight('bold')}
        line-height: 1.2;
        text-align: center;
        margin: 0;
      }
      
      .cardforge-content-small {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text-secondary')}
        line-height: 1.3;
        text-align: center;
        margin: 0;
      }
      
      /* 多行文本支持 */
      .cardforge-multiline {
        white-space: pre-line;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      /* 自动换行 */
      .cardforge-wrap {
        white-space: normal;
        word-break: break-word;
      }
    `;
  }

  // === 响应式工具 ===
  
  _getResponsiveStyles() {
    return `
      /* 移动端适配 */
      @media (max-width: 600px) {
        .cardforge-card-container {
          ${this._cfPadding('md')}
        }
        
        .cardforge-card-content {
          gap: var(--cf-spacing-sm);
          min-height: 50px;
        }
        
        .cardforge-content-header {
          ${this._cfTextSize('md')}
        }
        
        .cardforge-content-body {
          ${this._cfTextSize('sm')}
        }
        
        .cardforge-content-large {
          ${this._cfTextSize('lg')}
        }
        
        .cardforge-content-small {
          ${this._cfTextSize('xs')}
        }
        
        .cardforge-error-container,
        .cardforge-loading-container,
        .cardforge-empty-container {
          min-height: 60px;
          gap: var(--cf-spacing-sm);
        }
      }
      
      @media (max-width: 400px) {
        .cardforge-card-container {
          ${this._cfPadding('sm')}
        }
        
        .cardforge-card-content {
          min-height: 40px;
        }
      }
    `;
  }

  // === 动画工具 ===
  
  _getAnimationStyles() {
    return `
      @keyframes cardforge-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes cardforge-fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .cardforge-animate-fadeIn {
        animation: cardforge-fadeIn 0.5s var(--cf-ease-out);
      }
    `;
  }

  // === 布局工具 ===
  
  _getLayoutTools() {
    return `
      .cardforge-flex-column {
        display: flex;
        flex-direction: column;
      }
      
      .cardforge-flex-row {
        display: flex;
        align-items: center;
      }
      
      .cardforge-flex-center {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .cardforge-flex-between {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .cardforge-flex-start {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      
      .cardforge-gap-xs { gap: var(--cf-spacing-xs); }
      .cardforge-gap-sm { gap: var(--cf-spacing-sm); }
      .cardforge-gap-md { gap: var(--cf-spacing-md); }
      .cardforge-gap-lg { gap: var(--cf-spacing-lg); }
      
      .cardforge-flex-1 { flex: 1; }
      .cardforge-flex-auto { flex: auto; }
    `;
  }

  // === 基础样式系统（必须包含在所有卡片中）===
  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      :host {
        --rgb-primary-background-color: var(--card-background-color, 255, 255, 255);
        --rgb-primary-text-color: var(--primary-text-color, 0, 0, 0);
      }
      
      /* 包含所有基础工具样式 */
      ${this._getCardContainerStyles()}
      ${this._getContentAreaStyles()}
      ${this._getResponsiveStyles()}
      ${this._getAnimationStyles()}
      ${this._getLayoutTools()}
      
      /* 主题样式 */
      .cardforge-card-container {
        ${themeStyles}
      }
      
      ${this._getAdditionalBaseStyles()}
    `;
  }

  // 子类可以覆盖的额外基础样式
  _getAdditionalBaseStyles() {
    return '';
  }

  // === 原有的工具方法（保持兼容）===
  
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

  _getEntityValue(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _getFlexibleValue(hass, source, defaultValue = '') {
    if (!source) return defaultValue;
    
    const parser = getJinjaParser(hass);

    if (source.includes('.') && hass?.states?.[source]) {
      return hass.states[source].state || defaultValue;
    }
    
    if (parser.isJinjaTemplate(source)) {
      return parser.parse(source, defaultValue);
    }
    
    return source;
  }

  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return this._getFlexibleValue(hass, source, defaultValue);
  }

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
  _isEntityOn(entity) { return entity?.state === 'on'; }
  _isEntityOff(entity) { return entity?.state === 'off'; }
  _isEntityUnavailable(entity) { return !entity || entity.state === 'unavailable' || entity.state === 'unknown'; }
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