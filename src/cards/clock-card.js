// cards/clock-card.js - 时钟卡片（类版本）
import { CardBase } from '../core/card-base.js';
import { html } from 'https://unpkg.com/lit@3.0.0/index.js?module';
import { formatTime, formatDate, getWeekday } from '../core/card-tools.js';

export class ClockCard extends CardBase {
  static cardId = 'clock';
  static meta = {
    name: '时钟',
    description: '显示当前时间和日期',
    icon: '⏰',
    category: '时间'
  };
  
  static schema = {
    use24Hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    },
    showDate: {
      type: 'boolean',
      label: '显示日期',
      default: true
    },
    showWeekday: {
      type: 'boolean',
      label: '显示星期',
      default: true
    },
    showSeconds: {
      type: 'boolean',
      label: '显示秒数',
      default: false
    }
  };
  
  // 更新时间
  _intervalId = null;
  
  connectedCallback() {
    super.connectedCallback();
    this._startTimer();
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopTimer();
  }
  
  _startTimer() {
    this._stopTimer();
    this._intervalId = setInterval(() => {
      this.requestUpdate();
    }, 1000);
  }
  
  _stopTimer() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
  
  renderContent() {
    const now = new Date();
    const showSeconds = this.getConfigValue('showSeconds', false);
    const use24Hour = this.getConfigValue('use24Hour', true);
    const showDate = this.getConfigValue('showDate', true);
    const showWeekday = this.getConfigValue('showWeekday', true);
    
    let timeHtml;
    if (showSeconds) {
      const baseTime = formatTime(now, use24Hour);
      const seconds = now.getSeconds().toString().padStart(2, '0');
      timeHtml = html`<div class="clock-time card-emphasis">${baseTime}:${seconds}</div>`;
    } else {
      timeHtml = html`<div class="clock-time card-emphasis">${formatTime(now, use24Hour)}</div>`;
    }
    
    const dateHtml = showDate ? 
      html`<div class="clock-date card-subtitle">${formatDate(now)}</div>` : '';
    
    const weekdayHtml = showWeekday ? 
      html`<div class="clock-weekday card-caption">${getWeekday(now)}</div>` : '';
    
    return html`
      <div class="clock-card">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            ${timeHtml}
            ${dateHtml}
            ${weekdayHtml}
          </div>
        </div>
      </div>
    `;
  }
  
  getCustomStyles() {
    return `
      .clock-card {
        min-height: 160px;
      }
      
      .clock-time {
        font-size: var(--cf-font-size-4xl);
        letter-spacing: 1px;
        margin: var(--cf-spacing-md) 0;
      }
      
      .clock-date {
        margin-top: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .clock-weekday {
        margin-top: var(--cf-spacing-xs);
      }
      
      @container cardforge-container (max-width: 400px) {
        .clock-time {
          font-size: var(--cf-font-size-3xl);
          margin: var(--cf-spacing-sm) 0;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .clock-time {
          font-size: var(--cf-font-size-2xl);
          margin: var(--cf-spacing-xs) 0;
        }
      }
    `;
  }
}

// 导出卡片类用于注册
export const CardClass = ClockCard;
