// src/core/base-plugin.js
import { themeManager } from '../themes/index.js';
import { getJinjaParser } from './jinja-parser.js';

export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 装饰配置系统 ===
  getDefaultDecorations() {
    return {
      // 布局装饰
      useHeader: true,
      useFooter: false,
      headerHeight: '40px',
      footerHeight: '32px',
      
      // 视觉装饰
      useBackground: false,
      backgroundType: 'gradient', // gradient, image, pattern, none
      gradientColors: ['var(--cf-primary-color)', 'var(--cf-accent-color)'],
      backgroundImage: '',
      backgroundPattern: 'none', // dots, lines, grid, waves
      
      // 动画装饰
      useAnimation: false,
      animationType: 'none', // fade, slide, pulse, float
      animationDuration: '0.5s',
      
      // 边框装饰
      useBorder: true,
      borderType: 'solid', // solid, dashed, dotted, double, none
      borderWidth: '1px',
      borderColor: 'var(--cf-border)',
      
      // 阴影装饰
      useShadow: true,
      shadowIntensity: 'md', // sm, md, lg, xl
      
      // 特殊效果
      useGlassEffect: false,
      useNeonEffect: false,
      useHoverEffect: true,
      
      // 内容装饰
      contentLayout: 'center', // center, start, end, between, around
      textAlignment: 'center', // left, center, right
      useTextShadow: false
    };
  }

  // === 三部分结构接口 ===
  getHeader(config, hass, entities) {
    return ''; // 默认无标题
  }

  getContent(config, hass, entities) {
    throw new Error('必须实现 getContent 方法');
  }

  getFooter(config, hass, entities) {
    return ''; // 默认无页脚
  }

  // === 兼容旧接口 ===
  getTemplate(config, hass, entities) {
    const decorations = this._getDecorations(config);
    const header = this.getHeader(config, hass, entities);
    const content = this.getContent(config, hass, entities);
    const footer = this.getFooter(config, hass, entities);
    
    return `
      <div class="cardforge-card ${this._getDecorationClasses(decorations)}">
        ${decorations.useHeader && header ? `<div class="cardforge-header">${header}</div>` : ''}
        <div class="cardforge-content">${content}</div>
        ${decorations.useFooter && footer ? `<div class="cardforge-footer">${footer}</div>` : ''}
        
        <!-- 装饰元素 -->
        ${this._renderDecorationElements(decorations)}
      </div>
    `;
  }

  // === 样式系统 ===
  getStyles(config) {
    const themeId = config.theme || 'auto';
    const decorations = this._getDecorations(config);
    const themeStyles = themeManager.getThemeStyles(themeId, config);
    
    return `
      ${this.getBaseStyles(config)}
      ${this.getDecorationStyles(decorations)}
      ${themeStyles}
      ${this.getCustomStyles(config)}
      ${this._getResponsiveStyles()}
    `;
  }

  getBaseStyles(config) {
    const decorations = this._getDecorations(config);
    
    return `
      .cardforge-card {
        position: relative;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        ${this._cfBorderRadius('lg')}
        cursor: default;
        overflow: hidden;
        transition: all 0.3s ease;
        ${this._cfBackground('surface')}
        display: flex;
        flex-direction: column;
        min-height: 80px;
        
        ${decorations.useBorder ? `
          border: ${decorations.borderWidth} ${decorations.borderType} ${decorations.borderColor};
        ` : 'border: none;'}
        
        ${decorations.useShadow ? this._cfShadow(decorations.shadowIntensity) : ''}
        
        ${decorations.useHoverEffect ? `
          &:hover {
            transform: translateY(-2px);
            ${this._cfShadow('lg')}
          }
        ` : ''}
      }
      
      /* 标题区域 */
      .cardforge-header {
        ${this._cfPadding('md')}
        ${this._cfBorderRadius('lg lg 0 0')}
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-bottom: 1px solid var(--cf-border);
        min-height: ${this._getDecorationValue(config, 'headerHeight', '40px')};
        flex-shrink: 0;
        display: flex;
        align-items: center;
        font-weight: 600;
        color: var(--cf-text-primary);
        ${decorations.useTextShadow ? this._textShadow() : ''}
      }
      
      /* 内容区域 */
      .cardforge-content {
        ${this._cfPadding('lg')}
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 60px;
        overflow: hidden;
        
        /* 内容布局 */
        ${decorations.contentLayout === 'center' ? `
          align-items: center;
          justify-content: center;
          text-align: center;
        ` : ''}
        
        ${decorations.contentLayout === 'start' ? `
          align-items: flex-start;
          justify-content: flex-start;
          text-align: left;
        ` : ''}
        
        ${decorations.contentLayout === 'end' ? `
          align-items: flex-end;
          justify-content: flex-end;
          text-align: right;
        ` : ''}
        
        ${decorations.contentLayout === 'between' ? `
          align-items: center;
          justify-content: space-between;
          text-align: center;
        ` : ''}
        
        ${decorations.contentLayout === 'around' ? `
          align-items: center;
          justify-content: space-around;
          text-align: center;
        ` : ''}
      }
      
      /* 页脚区域 */
      .cardforge-footer {
        ${this._cfPadding('sm')}
        ${this._cfBorderRadius('0 0 lg lg')}
        background: rgba(var(--cf-rgb-primary), 0.03);
        border-top: 1px solid var(--cf-border);
        min-height: ${this._getDecorationValue(config, 'footerHeight', '32px')};
        flex-shrink: 0;
        display: flex;
        align-items: center;
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        ${decorations.useTextShadow ? this._textShadow() : ''}
      }
      
      /* 装饰类名 */
      .decoration-glass {
        background: linear-gradient(135deg, 
          rgba(255, 255, 255, 0.2) 0%, 
          rgba(255, 255, 255, 0.1) 100%);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .decoration-neon {
        background: #1a1a1a;
        border: 1px solid #00ff88;
        box-shadow: 0 0 10px #00ff88;
        color: #00ff88;
        animation: neonPulse 2s ease-in-out infinite;
      }
      
      .decoration-gradient {
        background: linear-gradient(135deg, 
          ${decorations.gradientColors[0]}, 
          ${decorations.gradientColors[1]});
        background-size: 200% 200%;
        animation: gradientShift 6s ease infinite;
        color: white;
        border: none;
      }
      
      /* 文本工具类 */
      .text-ellipsis {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .text-wrap {
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      .text-multiline {
        white-space: pre-line;
        line-height: 1.4;
      }
      
      /* 滚动支持 */
      .content-scrollable {
        overflow-y: auto;
        max-height: 200px;
      }
      
      .content-scrollable::-webkit-scrollbar {
        width: 4px;
      }
      
      .content-scrollable::-webkit-scrollbar-thumb {
        background: var(--cf-border);
        border-radius: 2px;
      }
      
      ${this._getAnimationStyles()}
    `;
  }

  // === 装饰样式 ===
  getDecorationStyles(decorations) {
    return `
      /* 背景装饰 */
      ${decorations.useBackground && decorations.backgroundType === 'image' ? `
        .cardforge-card {
          background-image: url('${decorations.backgroundImage}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
      ` : ''}
      
      ${decorations.useBackground && decorations.backgroundType === 'pattern' ? `
        .cardforge-card {
          ${this._getPatternBackground(decorations.backgroundPattern)}
        }
      ` : ''}
      
      /* 动画装饰 */
      ${decorations.useAnimation ? `
        .cardforge-card {
          animation: ${decorations.animationType}In ${decorations.animationDuration} ease-out;
        }
        
        .cardforge-animate-${decorations.animationType} {
          animation: ${decorations.animationType} ${decorations.animationDuration} ease-out;
        }
      ` : ''}
      
      /* 毛玻璃效果 */
      ${decorations.useGlassEffect ? `
        .cardforge-card {
          background: linear-gradient(135deg, 
            rgba(var(--cf-rgb-background), 0.3) 0%, 
            rgba(var(--cf-rgb-background), 0.1) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
        }
      ` : ''}
    `;
  }

  // === 装饰工具方法 ===
  _getDecorations(config) {
    return {
      ...this.getDefaultDecorations(),
      ...(config.decorations || {})
    };
  }

  _getDecorationValue(config, key, defaultValue) {
    const decorations = this._getDecorations(config);
    return decorations[key] || defaultValue;
  }

  _getDecorationClasses(decorations) {
    const classes = [];
    
    if (decorations.useGlassEffect) classes.push('decoration-glass');
    if (decorations.useNeonEffect) classes.push('decoration-neon');
    if (decorations.useBackground && decorations.backgroundType === 'gradient') {
      classes.push('decoration-gradient');
    }
    if (decorations.useAnimation) {
      classes.push(`cardforge-animate-${decorations.animationType}`);
    }
    
    return classes.join(' ');
  }

  _renderDecorationElements(decorations) {
    let elements = '';
    
    // 背景图案元素
    if (decorations.useBackground && decorations.backgroundPattern !== 'none') {
      elements += `<div class="decoration-pattern ${decorations.backgroundPattern}"></div>`;
    }
    
    return elements;
  }

  _getPatternBackground(pattern) {
    const patterns = {
      dots: `
        background-image: radial-gradient(circle, var(--cf-border) 1px, transparent 1px);
        background-size: 10px 10px;
      `,
      lines: `
        background-image: linear-gradient(90deg, transparent 95%, var(--cf-border) 95%),
                         linear-gradient(0deg, transparent 95%, var(--cf-border) 95%);
        background-size: 20px 20px;
      `,
      grid: `
        background-image: linear-gradient(var(--cf-border) 1px, transparent 1px),
                         linear-gradient(90deg, var(--cf-border) 1px, transparent 1px);
        background-size: 20px 20px;
      `,
      waves: `
        background-image: radial-gradient(circle at 100% 50%, transparent 20%, var(--cf-primary-color) 21%, var(--cf-primary-color) 34%, transparent 35%, transparent),
                         radial-gradient(circle at 0% 50%, transparent 20%, var(--cf-primary-color) 21%, var(--cf-primary-color) 34%, transparent 35%, transparent);
        background-size: 60px 30px;
        background-position: 0 0, 30px 30px;
      `
    };
    
    return patterns[pattern] || '';
  }

  // === 自定义样式（插件可覆盖）===
  getCustomStyles(config) {
    return '';
  }

  // === 数据工具方法 ===
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
    const source = entities[key]?.state || '';
    return this._getFlexibleValue(hass, source, defaultValue);
  }

  // === 样式工具方法 ===
  _responsiveValue(desktop, mobile) { 
    return `${desktop}; @media (max-width: 480px) { ${mobile}; }`; 
  }

  _flexCenter() { return 'display: flex; align-items: center; justify-content: center;'; }
  _textCenter() { return 'text-align: center;'; }
  _flexColumn() { return 'display: flex; flex-direction: column;'; }
  _flexRow() { return 'display: flex; align-items: center;'; }
  
  _borderRadius(radius = '12px') {
    return `border-radius: ${radius};`;
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

  // === CF 样式工具 ===
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

  _cfBorderRadius(corners = 'lg') {
    const radiusMap = {
      sm: 'var(--cf-radius-sm)',
      md: 'var(--cf-radius-md)',
      lg: 'var(--cf-radius-lg)',
      xl: 'var(--cf-radius-xl)'
    };
    
    if (corners.includes(' ')) {
      const cornersArray = corners.split(' ').map(corner => radiusMap[corner] || corner);
      return `border-radius: ${cornersArray.join(' ')};`;
    } else {
      return `border-radius: ${radiusMap[corners] || corners};`;
    }
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

  // === 响应式样式 ===
  _getResponsiveStyles() {
    return `
      @media (max-width: 480px) {
        .cardforge-card {
          ${this._cfBorderRadius('md')}
        }
        
        .cardforge-header {
          ${this._cfPadding('sm')}
          min-height: 36px;
          font-size: 0.9em;
        }
        
        .cardforge-content {
          ${this._cfPadding('md')}
          min-height: 50px;
        }
        
        .cardforge-footer {
          ${this._cfPadding('xs')}
          min-height: 28px;
          font-size: 0.75em;
        }
      }
    `;
  }

  // === 动画样式 ===
  _getAnimationStyles() {
    return `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      
      @keyframes neonPulse {
        0%, 100% {
          box-shadow: 0 0 5px #00ff88;
        }
        50% {
          box-shadow: 0 0 20px #00ff88, 0 0 30px rgba(0, 255, 136, 0.3);
        }
      }
    `;
  }
}