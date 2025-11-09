// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class WelcomeCardPlugin extends BasePlugin {
  constructor() {
    super();
  }

  getTemplate(config, hass, entities) {
    const hour = new Date().getHours();
    const greeting = this._getGreeting(hour);
    const message = this._getRandomMessage();

    return `
      <div class="welcome-card" style="border: 2px solid purple; padding: 24px;">
        <div class="greeting" style="color: white; font-size: 1.4em; font-weight: bold;">${greeting}</div>
        <div class="time" style="color: white; font-size: 2em; font-weight: bold;">${new Date().toLocaleTimeString('zh-CN')}</div>
        <div class="message" style="color: white; font-size: 0.9em; opacity: 0.9;">${message}</div>
        <div style="color: white; font-size: 12px; margin-top: 10px;">欢迎卡片调试信息</div>
      </div>
    `;
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
    const messages = [
      '祝您今天愉快！',
      '一切准备就绪！',
      '家，因你而温暖',
      '美好的一天开始了',
      '放松心情，享受生活'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getStyles(config) {
    return `
      .welcome-card {
        text-align: center;
        padding: 24px;
        height: 160px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        color: white;
        border-radius: 12px;
        font-family: var(--paper-font-common-nowrap_-_font-family);
      }
    `;
  }
}