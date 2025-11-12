// src/plugins/simple-clock.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'simple-clock',
  name: '简约时钟',
  version: '1.0.0',
  description: '基于系统时间的简约时钟显示',
  author: 'CardForge Team',
  category: 'time',
  icon: '⏰',
  entityRequirements: [],
  themeSupport: true,
  gradientSupport: false
};

export default class SimpleClockPlugin extends BasePlugin {
  constructor() {
    super();
    this._timeData = this.createReactiveData({
      time: '',
      date: '',
      weekday: ''
    });
    
    this._updateInterval = null;
  }

  onConfigUpdate(oldConfig, newConfig) {
    this._startTimeUpdates();
  }

  onDestroy() {
    this._stopTimeUpdates();
  }

  _startTimeUpdates() {
    this._stopTimeUpdates();
    this._updateTime();
    this._updateInterval = setInterval(() => this._updateTime(), 1000);
  }

  _stopTimeUpdates() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  }

  _updateTime() {
    const now = new Date();
    this._timeData.value = {
      time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      date: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      weekday: '星期' + '日一二三四五六'[now.getDay()]
    };
  }

  getTemplate(config, hass, entities) {
    const { time, date, weekday } = this._timeData.value;

    return `
      <div class="cardforge-card simple-clock">
        <div class="clock-content">
          <div class="time">${time}</div>
          <div class="date">${date}</div>
          <div class="weekday">${weekday}</div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + this.css`
      .simple-clock {
        ${this.responsive(
          'height: 140px; padding: 20px;',
          'height: 120px; padding: 16px;'
        )}
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .clock-content {
        width: 100%;
      }

      .time {
        ${this.responsive(
          'font-size: 2.5em; margin-bottom: 8px;',
          'font-size: 2em; margin-bottom: 6px;'
        )}
        font-weight: 700;
        color: var(--primary-color);
        letter-spacing: 1px;
        line-height: 1.2;
      }

      .date {
        ${this.responsive(
          'font-size: 1.1em; margin-bottom: 4px;',
          'font-size: 1em; margin-bottom: 3px;'
        )}
        opacity: 0.9;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .weekday {
        ${this.responsive(
          'font-size: 1em;',
          'font-size: 0.9em;'
        )}
        opacity: 0.7;
        color: var(--secondary-text-color);
        font-weight: 400;
      }

      /* 动画效果 */
      .simple-clock .time {
        transition: all 0.3s ease;
      }

      .simple-clock:hover .time {
        transform: scale(1.05);
      }
    `;
  }

  getCardSize() {
    return 2;
  }
}
