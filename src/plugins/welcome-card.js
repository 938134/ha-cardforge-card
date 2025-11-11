// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'welcome-card',
  name: '欢迎卡片',
  version: '1.0.0',
  description: '个性化欢迎信息，支持主题系统',
  author: 'CardForge Team',
  category: 'info',
  icon: '👋',
  entityRequirements: []
};

export default class WelcomeCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const { greeting, user, time, randomMessage } = this.getSystemData(hass, config);
    
    return `
      <div class="welcome-content">
        <div class="greeting">${greeting}，${user}！</div>
        <div class="time">${time}</div>
        <div class="message">${randomMessage}</div>
        <div class="theme-badge">${config.theme || 'default'} 主题</div>
      </div>
      <div class="decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    `;
  }

  getStyles(config) {
    const baseStyles = this.getThemeStyles(config);
    const theme = ThemeManager.getTheme(config.theme || 'default');
    
    return baseStyles + `
      .welcome-content {
        position: relative;
        z-index: 2;
        height: 100%;
        ${this._flexColumn()}
        justify-content: center;
        padding: 24px;
      }
      
      .greeting {
        ${this._responsiveFontSize('1.4em', '1.2em')}
        font-weight: 500;
        margin-bottom: 8px;
        color: ${this._applyThemeColor('text', theme)};
      }
      
      .time {
        ${this._responsiveFontSize('2.2em', '1.8em')}
        font-weight: bold;
        margin-bottom: 8px;
        color: ${this._applyThemeColor('primary', theme)};
      }
      
      .message {
        ${this._responsiveFontSize('0.95em', '0.85em')}
        opacity: 0.8;
        font-style: italic;
        color: ${this._applyThemeColor('textSecondary', theme)};
      }
      
      .theme-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255,255,255,0.2);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7em;
        opacity: 0.7;
      }
      
      .decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1;
      }
      
      .circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
      }
      
      .circle-1 {
        width: 80px;
        height: 80px;
        top: -20px;
        right: -20px;
      }
      
      .circle-2 {
        width: 60px;
        height: 60px;
        bottom: -10px;
        left: 20px;
      }
      
      .circle-3 {
        width: 40px;
        height: 40px;
        bottom: 30px;
        right: 40px;
      }
    `;
  }
}