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

  // === 统一数据获取方法 ===
  _getEntityValue(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _getFlexibleValue(hass, source, defaultValue = '') {
    if (!source) return defaultValue;
    
    // 如果是实体ID格式（包含点号）
    if (source.includes('.') && hass?.states?.[source]) {
      return hass.states[source].state || defaultValue;
    }
    
    // 如果是Jinja2模板（包含花括号）
    if (source.includes('{{') || source.includes('{%')) {
      return this._evaluateJinjaTemplate(hass, source, defaultValue);
    }
    
    // 直接文本
    return source;
  }

  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    return this._getFlexibleValue(hass, source, defaultValue);
  }

  _evaluateJinjaTemplate(hass, template, defaultValue = '') {
    try {
      let result = template;
      
      // 处理实体状态 {{ states('sensor.temperature') }}
      const stateMatches = template.match(/{{\s*states\(['"]([^'"]+)['"]\)\s*}}/g);
      if (stateMatches) {
        stateMatches.forEach(match => {
          const entityMatch = match.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && hass?.states?.[entityMatch[1]]) {
            result = result.replace(match, hass.states[entityMatch[1]].state);
          }
        });
      }
      
      // 处理实体属性 {{ states.sensor.temperature.attributes.unit }}
      const attrMatches = template.match(/{{\s*states\.([^ ]+)\.attributes\.([^ }]+)\s*}}/g);
      if (attrMatches) {
        attrMatches.forEach(match => {
          const attrMatch = match.match(/states\.([^ ]+)\.attributes\.([^ }]+)/);
          if (attrMatch && hass?.states?.[attrMatch[1]]?.attributes?.[attrMatch[2]]) {
            result = result.replace(match, hass.states[attrMatch[1]].attributes[attrMatch[2]]);
          }
        });
      }
      
      // 处理数学运算
      const mathMatches = template.match(/{{\s*([\d\.\s\+\-\*\/\(\)]+)\s*}}/g);
      if (mathMatches) {
        mathMatches.forEach(match => {
          const mathExpr = match.replace(/[{}]/g, '').trim();
          try {
            if (/^[\d\.\s\+\-\*\/\(\)]+$/.test(mathExpr)) {
              const calcResult = eval(mathExpr);
              if (mathExpr.includes('round(2)')) {
                result = result.replace(match, Math.round(calcResult * 100) / 100);
              } else {
                result = result.replace(match, calcResult);
              }
            }
          } catch (e) {
            console.warn('数学表达式计算失败:', mathExpr);
          }
        });
      }
      
      // 处理时间函数
      if (template.includes('now()')) {
        const now = new Date();
        const timeFormats = {
          "strftime('%H:%M')": now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          "strftime('%Y-%m-%d')": now.toLocaleDateString('zh-CN'),
          "strftime('%m月%d日')": `${now.getMonth() + 1}月${now.getDate()}日`,
          "strftime('%Y年%m月%d日')": `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
        };
        
        Object.entries(timeFormats).forEach(([format, value]) => {
          if (template.includes(format)) {
            result = result.replace(`{{ now().${format} }}`, value);
          }
        });
      }
      
      // 清理剩余的模板标记
      result = result.replace(/{{\s*[^}]*\s*}}/g, '');
      
      return result || defaultValue;
    } catch (error) {
      console.error('Jinja2模板解析错误:', error);
      return defaultValue;
    }
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
  
  _borderRadius(radius = 'var(--cardforge-radius-lg)') {
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

  // === 简化的基础样式 ===
  getBaseStyles(config) {
    return `
      :host {
        --rgb-primary-background-color: var(--card-background-color, 255, 255, 255);
        --rgb-primary-text-color: var(--primary-text-color, 0, 0, 0);
      }
      
      .cardforge-card {
        position: relative;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        ${this._borderRadius()}
        cursor: default;
        overflow: hidden;
        transition: all var(--cardforge-duration-normal) ease;
      }
      
      /* 主题突出显示效果 */
      .cardforge-card:hover {
        transform: translateY(-2px);
        ${this._boxShadow('strong')}
      }
      
      ${this._getResponsiveStyles()}
      
      .cardforge-interactive { 
        cursor: pointer; 
        transition: all var(--cardforge-duration-fast) ease; 
      }
      .cardforge-interactive:hover { opacity: 0.8; }
      .cardforge-interactive:active { transform: scale(0.98); }
      
      .cardforge-status-on { color: var(--success-color); }
      .cardforge-status-off { color: var(--disabled-color); }
      .cardforge-status-unavailable { color: var(--error-color); opacity: 0.5; }
    `;
  }
  
  _getResponsiveStyles() {
    return `
      @media (max-width: 480px) {
        .cardforge-card {
          ${this._borderRadius('var(--cardforge-radius-md)')}
        }
      }
      
      @media (max-width: 360px) {
        .cardforge-card {
          ${this._borderRadius('var(--cardforge-radius-sm)')}
        }
      }
    `;
  }
}
