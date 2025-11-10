// src/core/base-plugin.js
export class BasePlugin {
  constructor() {
    if (new.target === BasePlugin) {
      throw new Error('BasePlugin 是抽象类，必须被继承');
    }
  }

  // === 插件信息接口 ===
  getPluginInfo() {
    return {
      name: this.constructor.name.replace('Plugin', ''),
      description: '自定义卡片插件',
      icon: '🔧',
      category: 'general',
      supportsGradient: false
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

  // === 系统数据获取 ===
  getSystemData(hass, config) {
    const now = new Date();
    return {
      // 时间相关
      time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', minute: '2-digit', hour12: false 
      }),
      date: now.toLocaleDateString('zh-CN'),
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      
      // 用户相关
      user: hass?.user?.name || '家人',
      greeting: this._getGreeting(now.getHours()),
      
      // 随机内容
      randomMessage: this._getRandomMessage(),
      randomEmoji: this._getRandomEmoji(),
      
      // 系统状态
      isDaytime: now.getHours() >= 6 && now.getHours() < 18,
      season: this._getSeason(now.getMonth())
    };
  }

  // === 工具方法 ===
  _getGreeting(hour) {
    if (hour < 5) return '深夜好';
    if (hour < 8) return '清晨好'; 
    if (hour < 11) return '早上好';
    if (hour < 13) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  }

  _getRandomMessage() {
    const messages = [
      '祝您今天愉快！', '一切准备就绪！', '家，因你而温暖',
      '美好的一天开始了', '放松心情，享受生活', '今天也要加油哦！',
      '保持微笑，好运自然来', '心之所向，素履以往'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  _getRandomEmoji() {
    const emojis = ['😊', '🌟', '🎉', '💫', '✨', '🎈', '🦋', '🌻'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  _getSeason(month) {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  // === 样式系统 ===
  getBaseStyles(config) {
    const themeConfig = { ...this.getThemeConfig(), ...config.themeConfig };
    return `
      .cardforge-card {
        position: relative;
        font-family: var(--paper-font-common-nowrap_-_font-family);
        border-radius: var(--ha-card-border-radius, 12px);
        ${this._getThemeStyles(config, themeConfig)}
        cursor: default;
        overflow: hidden;
      }
      ${this._getResponsiveStyles()}
    `;
  }
  
  _getThemeStyles(config, themeConfig) {
    const theme = config.theme || 'default';
    const themes = {
      default: `
        background: var(--card-background-color);
        color: var(--primary-text-color);
      `,
      dark: `
        background: #1e1e1e;
        color: #ffffff;
      `,
      material: `
        background: #fafafa;
        color: #212121;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      `,
      minimal: `
        background: transparent;
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
      `,
      gradient: `
        background: ${this._getGradient(themeConfig)};
        color: white;
      `
    };
    return themes[theme] || themes.default;
  }

  _getGradient(themeConfig) {
    const gradientMap = {
      'diagonal': `linear-gradient(135deg, ${themeConfig.gradientColors.join(', ')})`,
      'horizontal': `linear-gradient(90deg, ${themeConfig.gradientColors.join(', ')})`,
      'vertical': `linear-gradient(180deg, ${themeConfig.gradientColors.join(', ')})`,
      'radial': `radial-gradient(circle, ${themeConfig.gradientColors.join(', ')})`
    };
    return gradientMap[themeConfig.gradientType] || gradientMap.diagonal;
  }
  
  _getResponsiveStyles() {
    return `
      @media (max-width: 480px) {
        .cardforge-card { 
          border-radius: var(--ha-card-border-radius, 8px); 
        }
      }
    `;
  }

  // === 响应式工具 ===
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

  // === 布局工具 ===
  _flexCenter() {
    return 'display: flex; align-items: center; justify-content: center;';
  }

  _textCenter() {
    return 'text-align: center;';
  }

  _flexColumn() {
    return 'display: flex; flex-direction: column;';
  }
}