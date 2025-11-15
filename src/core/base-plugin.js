// src/core/base-plugin.js - 已完美兼容新主题系统，支持Jinja模板
import { themeManager } from '../themes/index.js';

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

  // === 统一数据获取方法 - 增强Jinja支持 ===
  _getEntityValue(entities, key, defaultValue = '') {
    return entities[key]?.state || defaultValue;
  }

  _getFlexibleValue(hass, source, defaultValue = '') {
    if (!source) return defaultValue;
    
    // 如果是实体ID格式（包含点号）且不是模板
    if (source.includes('.') && hass?.states?.[source] && 
        !source.includes('{{') && !source.includes('{%')) {
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

  // === 增强的Jinja2模板解析 ===
  _evaluateJinjaTemplate(hass, template, defaultValue = '') {
    try {
      let result = template;
      
      // 1. 处理 state_attr() 函数
      const stateAttrMatches = template.match(/{{\s*state_attr\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)\s*}}/g);
      if (stateAttrMatches) {
        stateAttrMatches.forEach(match => {
          const attrMatch = match.match(/state_attr\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)/);
          if (attrMatch) {
            const entityId = attrMatch[1];
            const attribute = attrMatch[2];
            if (hass?.states?.[entityId]?.attributes?.[attribute]) {
              const attrValue = hass.states[entityId].attributes[attribute];
              result = result.replace(match, attrValue);
            } else {
              result = result.replace(match, defaultValue);
            }
          }
        });
      }

      // 2. 处理 states() 函数
      const stateMatches = template.match(/{{\s*states\(['"]([^'"]+)['"]\)\s*}}/g);
      if (stateMatches) {
        stateMatches.forEach(match => {
          const entityMatch = match.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && hass?.states?.[entityMatch[1]]) {
            result = result.replace(match, hass.states[entityMatch[1]].state);
          } else {
            result = result.replace(match, defaultValue);
          }
        });
      }

      // 3. 处理 is_state() 函数
      const isStateMatches = template.match(/{{\s*is_state\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)\s*}}/g);
      if (isStateMatches) {
        isStateMatches.forEach(match => {
          const stateMatch = match.match(/is_state\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)/);
          if (stateMatch) {
            const entityId = stateMatch[1];
            const expectedState = stateMatch[2];
            if (hass?.states?.[entityId]) {
              const isMatch = hass.states[entityId].state === expectedState;
              result = result.replace(match, isMatch ? 'true' : 'false');
            } else {
              result = result.replace(match, 'false');
            }
          }
        });
      }
      
      // 4. 处理实体属性语法
      const attrMatches = template.match(/{{\s*states\.([^.\s]+)\.([^.\s]+)\.attributes\.([^ }]+)\s*}}/g);
      if (attrMatches) {
        attrMatches.forEach(match => {
          const attrMatch = match.match(/states\.([^.\s]+)\.([^.\s]+)\.attributes\.([^ }]+)/);
          if (attrMatch) {
            const entityId = `${attrMatch[1]}.${attrMatch[2]}`;
            const attribute = attrMatch[3];
            if (hass?.states?.[entityId]?.attributes?.[attribute]) {
              result = result.replace(match, hass.states[entityId].attributes[attribute]);
            } else {
              result = result.replace(match, defaultValue);
            }
          }
        });
      }

      // 5. 处理简化的属性语法
      const simpleAttrMatches = template.match(/{{\s*states\.([^.\s]+)\.([^.\s]+)\.([^ }]+)\s*}}/g);
      if (simpleAttrMatches) {
        simpleAttrMatches.forEach(match => {
          const attrMatch = match.match(/states\.([^.\s]+)\.([^.\s]+)\.([^ }]+)/);
          if (attrMatch && attrMatch[3] !== 'attributes') {
            const entityId = `${attrMatch[1]}.${attrMatch[2]}`;
            const attribute = attrMatch[3];
            if (hass?.states?.[entityId]?.attributes?.[attribute]) {
              result = result.replace(match, hass.states[entityId].attributes[attribute]);
            } else if (hass?.states?.[entityId]?.state && attribute === 'state') {
              result = result.replace(match, hass.states[entityId].state);
            } else {
              result = result.replace(match, defaultValue);
            }
          }
        });
      }
      
      // 6. 处理数学运算
      const mathMatches = template.match(/{{\s*([^{}]*[\d\.\s\+\-\*\/\(\)\|][^{}]*)\s*}}/g);
      if (mathMatches) {
        mathMatches.forEach(match => {
          const mathExpr = match.replace(/[{}]/g, '').trim();
          
          // 跳过已经处理过的函数调用
          if (mathExpr.includes('states(') || mathExpr.includes('state_attr(') || 
              mathExpr.includes('is_state(') || mathExpr.includes('states.')) {
            return;
          }

          try {
            // 处理过滤器
            let evalExpr = mathExpr;
            
            // 处理 round 过滤器
            const roundMatch = evalExpr.match(/(.+)\|\s*round\s*\(\s*(\d+)\s*\)/);
            if (roundMatch) {
              const baseExpr = roundMatch[1].trim();
              const decimals = parseInt(roundMatch[2]);
              const baseValue = this._safeEval(baseExpr);
              if (baseValue !== null) {
                const rounded = Math.round(baseValue * Math.pow(10, decimals)) / Math.pow(10, decimals);
                result = result.replace(match, rounded.toString());
                return;
              }
            }

            // 处理 float 过滤器
            if (evalExpr.includes('| float')) {
              evalExpr = evalExpr.replace(/\|\s*float/g, '');
            }

            // 处理 int 过滤器
            if (evalExpr.includes('| int')) {
              evalExpr = evalExpr.replace(/\|\s*int/g, '');
            }

            evalExpr = evalExpr.trim();

            // 安全评估数学表达式
            if (/^[\d\.\s\+\-\*\/\(\)]+$/.test(evalExpr)) {
              const calcResult = this._safeEval(evalExpr);
              if (calcResult !== null) {
                result = result.replace(match, calcResult.toString());
              }
            }
          } catch (e) {
            console.warn('数学表达式计算失败:', mathExpr, e);
          }
        });
      }
      
      // 7. 处理时间函数
      if (template.includes('now()')) {
        const now = new Date();
        const timeFormats = {
          "strftime('%H:%M')": now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          "strftime('%Y-%m-%d')": now.toLocaleDateString('zh-CN'),
          "strftime('%m月%d日')": `${now.getMonth() + 1}月${now.getDate()}日`,
          "strftime('%Y年%m月%d日')": `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`,
          "strftime('%A')": '星期' + '日一二三四五六'[now.getDay()],
          "strftime('%H:%M:%S')": now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
        };
        
        Object.entries(timeFormats).forEach(([format, value]) => {
          if (template.includes(format)) {
            result = result.replace(`{{ now().${format} }}`, value);
          }
        });
      }

      // 8. 处理条件语句
      const ifMatches = template.match(/{%.*?%}/g);
      if (ifMatches) {
        ifMatches.forEach(match => {
          try {
            // 简单的条件判断处理
            if (match.includes("if") && match.includes("else")) {
              const conditionMatch = match.match(/if\s+([^%]+)\s*%}([^%]*){%\s*else\s*%}([^%]*){%\s*endif\s*%}/);
              if (conditionMatch) {
                const condition = conditionMatch[1].trim();
                const truePart = conditionMatch[2].trim();
                const falsePart = conditionMatch[3].trim();
                
                // 评估条件
                let conditionResult = this._evaluateJinjaCondition(hass, condition);
                
                result = result.replace(match, conditionResult ? truePart : falsePart);
              }
            }
          } catch (e) {
            console.warn('条件语句处理失败:', match, e);
          }
        });
      }
      
      // 9. 清理剩余的模板标记
      result = result.replace(/{{\s*[^}]*\s*}}/g, '');
      result = result.replace(/{%.*?%}/g, '');
      
      return result || defaultValue;
    } catch (error) {
      console.error('Jinja2模板解析错误:', error);
      return defaultValue;
    }
  }

  _evaluateJinjaCondition(hass, condition) {
    try {
      // 处理 == 操作符
      if (condition.includes("==")) {
        const [left, right] = condition.split("==").map(s => s.trim().replace(/'/g, "").replace(/"/g, ""));
        
        // 检查是否是实体状态比较
        if (left.includes("states(")) {
          const entityMatch = left.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && hass?.states?.[entityMatch[1]]) {
            return hass.states[entityMatch[1]].state === right;
          }
        }
        
        return left === right;
      }
      
      // 处理 != 操作符
      if (condition.includes("!=")) {
        const [left, right] = condition.split("!=").map(s => s.trim().replace(/'/g, "").replace(/"/g, ""));
        
        if (left.includes("states(")) {
          const entityMatch = left.match(/states\(['"]([^'"]+)['"]\)/);
          if (entityMatch && hass?.states?.[entityMatch[1]]) {
            return hass.states[entityMatch[1]].state !== right;
          }
        }
        
        return left !== right;
      }
      
      // 处理 is_state() 函数
      if (condition.includes("is_state(")) {
        const stateMatch = condition.match(/is_state\(['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\)/);
        if (stateMatch && hass?.states?.[stateMatch[1]]) {
          return hass.states[stateMatch[1]].state === stateMatch[2];
        }
      }
      
      return false;
    } catch (e) {
      console.warn('条件评估失败:', condition, e);
      return false;
    }
  }

  _safeEval(expr) {
    try {
      return Function(`"use strict"; return (${expr})`)();
    } catch (e) {
      console.warn('表达式计算失败:', expr, e);
      return null;
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

  // === 样式系统 - 已完美兼容新主题系统 ===
  getBaseStyles(config) {
    const themeId = config.theme || 'auto';
    
    // 获取主题样式 - 新主题系统完全兼容
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
        
        /* 应用主题样式 - 新主题系统完全兼容 */
        ${themeStyles}
      }
      
      /* 主题突出显示效果 */
      .cardforge-card:hover {
        transform: translateY(-2px);
        ${this._boxShadow('strong')}
      }
      
      ${this._getResponsiveStyles()}
      ${this._getAnimationStyles()}
      
      /* 使用新的样式类名 */
      .cardforge-interactive { 
        cursor: pointer; 
        transition: all 0.2s ease; 
      }
      .cardforge-interactive:hover { opacity: 0.8; }
      .cardforge-interactive:active { transform: scale(0.98); }
      
      .cardforge-status-on { color: var(--success-color); }
      .cardforge-status-off { color: var(--disabled-color); }
      .cardforge-status-unavailable { color: var(--error-color); opacity: 0.5; }
      
      /* 兼容新样式系统的工具类 */
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

  // === 新的样式工具方法 - 兼容新样式系统 ===
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

  // === 响应式工具方法 - 增强版 ===
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