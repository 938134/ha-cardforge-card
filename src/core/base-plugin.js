// src/core/base-plugin.js
import { ThemeManager } from './theme-manager.js';

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

  // === 主题集成方法 - 所有插件都支持 ===
  getThemeStyles(config) {
    const themeId = config.theme || 'default';
    const theme = ThemeManager.getTheme(themeId);
    
    return `
      .cardforge-card {
        ${this._getThemeBaseStyles(theme)}
        ${this._getCardLayoutStyles()}
      }
      ${this._getThemeClasses(themeId)}
      ${this._getCommonStyles(theme)}
    `;
  }

  _getThemeBaseStyles(theme) {
    return `
      background: ${theme.colors.background};
      color: ${theme.colors.text};
      border-radius: var(--ha-card-border-radius, 12px);
      position: relative;
      overflow: hidden;
      font-family: var(--ha-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);
    `;
  }

  _getThemeClasses(themeId) {
    return `
      .cardforge-theme-${themeId} {
        /* 主题特定样式由 ThemeManager 注入 */
      }
    `;
  }

  _getCommonStyles(theme) {
    return `
      .cardforge-text-primary { color: ${theme.colors.primary}; }
      .cardforge-text-accent { color: ${theme.colors.accent}; }
      .cardforge-text-success { color: ${theme.colors.success}; }
      .cardforge-text-warning { color: ${theme.colors.warning}; }
      .cardforge-text-error { color: ${theme.colors.error}; }
      .cardforge-bg-primary { background: ${theme.colors.primary}; }
      .cardforge-bg-accent { background: ${theme.colors.accent}; }
      
      .cardforge-border {
        border: 1px solid rgba(255,255,255,0.1);
      }
      
      .cardforge-shadow {
        box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      }
      
      .cardforge-glass {
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
      }
    `;
  }

  _getCardLayoutStyles() {
    return `
      min-height: 80px;
      box-sizing: border-box;
      transition: all 0.3s ease;
    `;
  }

  // === 主题工具方法 ===
  _applyThemeColor(type, theme) {
    const colorMap = {
      'primary': theme.colors.primary,
      'accent': theme.colors.accent,
      'text': theme.colors.text,
      'textSecondary': theme.colors.textSecondary,
      'success': theme.colors.success,
      'warning': theme.colors.warning,
      'error': theme.colors.error
    };
    return colorMap[type] || theme.colors.primary;
  }

  _getContrastColor(theme) {
    return ThemeManager.isGradientTheme(theme.id) ? '#ffffff' : theme.colors.text;
  }

  // === 数据工具方法 ===
  getSystemData(hass, config) {
    const now = new Date();
    return {
      time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      date: now.toLocaleDateString('zh-CN'),
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      user: hass?.user?.name || '家人',
      greeting: this._getGreeting(now.getHours()),
      randomMessage: this._getRandomMessage()
    };
  }

  // === 响应式工具 ===
  _responsiveValue(desktop, mobile) {
    return `
      ${desktop};
      @media (max-width: 480px) {
        ${mobile};
      }
    `;
  }

  _responsiveFontSize(desktop, mobile = desktop) {
    return this._responsiveValue(`font-size: ${desktop}`, `font-size: ${mobile}`);
  }

  _responsivePadding(desktop, mobile = desktop) {
    return this._responsiveValue(`padding: ${desktop}`, `padding: ${mobile}`);
  }

  _responsiveHeight(desktop, mobile = desktop) {
    return this._responsiveValue(`height: ${desktop}`, `height: ${mobile}`);
  }

  // === 布局工具 ===
  _flexCenter() {
    return 'display: flex; align-items: center; justify-content: center;';
  }

  _flexColumn() {
    return 'display: flex; flex-direction: column;';
  }

  _textCenter() {
    return 'text-align: center;';
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

  _getRandomMessage() {
    const messages = [
      '祝您今天愉快！', 
      '一切准备就绪！', 
      '家，因你而温暖',
      '美好的一天开始了',
      '保持微笑，继续前进'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}