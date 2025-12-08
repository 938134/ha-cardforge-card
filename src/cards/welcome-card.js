// cards/week-card.js - 星期卡片（类版本）
import { CardBase } from '../core/card-base.js';
import { html } from 'https://unpkg.com/lit@3.0.0/index.js?module';
import { getYearProgress, getWeekNumber } from '../core/card-tools.js';

export class WeekCard extends CardBase {
  static cardId = 'week';
  static meta = {
    name: '星期',
    description: '显示年进度和周进度',
    icon: '📅',
    category: '时间'
  };
  
  static schema = {
    showYearProgress: {
      type: 'boolean',
      label: '显示年进度',
      default: true
    },
    showWeekProgress: {
      type: 'boolean',
      label: '显示周进度',
      default: true
    }
  };
  
  _intervalId = null;
  
  connectedCallback() {
    super.connectedCallback();
    // 每天更新一次
    this._intervalId = setInterval(() => {
      this.requestUpdate();
    }, 24 * 60 * 60 * 1000); // 每天
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
  
  renderContent() {
    const now = new Date();
    const showYearProgress = this.getConfigValue('showYearProgress', true);
    const showWeekProgress = this.getConfigValue('showWeekProgress', true);
    
    const yearProgress = getYearProgress(now);
    const weekNumber = getWeekNumber(now);
    const currentDay = now.getDay();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 如果没有显示任何内容
    if (!showYearProgress && !showWeekProgress) {
      return html`
        <div class="week-card">
          <div class="card-empty">
            <div class="card-empty-icon">📅</div>
            <div class="card-empty-text">请开启年进度或周进度显示</div>
          </div>
        </div>
      `;
    }
    
    // 年进度区域
    let yearSectionHtml = html``;
    if (showYearProgress) {
      const size = 80;
      const strokeWidth = 4;
      const radius = (size / 2) - strokeWidth;
      const circumference = 2 * Math.PI * radius;
      const dashOffset = circumference * (1 - yearProgress / 100);
      
      yearSectionHtml = html`
        <div class="year-section layout-horizontal">
          <div class="progress-ring">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
              <defs>
                <linearGradient id="year-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="var(--cf-primary-color)" />
                  <stop offset="100%" stop-color="var(--cf-accent-color)" />
                </linearGradient>
              </defs>
              <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                      class="progress-bg" 
                      stroke-width="${strokeWidth}" />
              <circle cx="${size/2}" cy="${size/2}" r="${radius}" 
                      class="progress-fill"
                      stroke-width="${strokeWidth}"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${dashOffset}"
                      stroke="url(#year-gradient)"
                      transform="rotate(-90 ${size/2} ${size/2})" />
              <text x="${size/2}" y="${size/2 + 5}" 
                    text-anchor="middle" 
                    class="progress-text">
                ${Math.round(yearProgress)}<tspan class="progress-percent">%</tspan>
              </text>
            </svg>
          </div>
          <div class="date-info">
            <div class="week-label card-emphasis">第 ${weekNumber} 周</div>
            <div class="month-day card-subtitle">${month}月${day}日</div>
          </div>
        </div>
      `;
    }
    
    // 周进度区域
    let weekSectionHtml = html``;
    if (showWeekProgress) {
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      
      const weekBars = weekDays.map((dayLabel, i) => {
        const isPast = i < currentDay;
        const isCurrent = i === currentDay;
        const colorClass = isCurrent ? 'current' : (isPast ? 'past' : 'future');
        
        return html`<div class="week-bar ${colorClass}" data-day="${dayLabel}"></div>`;
      });
      
      const weekLabels = weekDays.map((dayLabel, i) => {
        const isPast = i < currentDay;
        const isCurrent = i === currentDay;
        const colorClass = isCurrent ? 'current' : (isPast ? 'past' : 'future');
        
        return html`<div class="day-label ${colorClass}">${dayLabel}</div>`;
      });
      
      weekSectionHtml = html`
        <div class="week-section">
          <div class="progress-bars">${weekBars}</div>
          <div class="day-labels layout-horizontal">${weekLabels}</div>
        </div>
      `;
    }
    
    return html`
      <div class="week-card">
        <div class="card-wrapper">
          <div class="card-content layout-center">
            ${yearSectionHtml}
            ${weekSectionHtml}
          </div>
        </div>
      </div>
    `;
  }
  
  getCustomStyles() {
    return `
      .week-card {
        min-height: 180px;
      }
      
      .week-card .card-content {
        gap: var(--cf-spacing-lg);
        justify-content: center;
      }
      
      .year-section {
        width: 100%;
        max-width: 320px;
        margin: var(--cf-spacing-sm) 0;
      }
      
      .progress-bg {
        stroke: var(--cf-neutral-200);
        fill: none;
      }
      
      .progress-fill {
        fill: none;
        stroke-linecap: round;
        transition: stroke-dashoffset var(--cf-transition-duration-slow);
      }
      
      .progress-text {
        fill: var(--cf-text-primary);
        font-size: var(--cf-font-size-xl);
        font-weight: var(--cf-font-weight-bold);
      }
      
      .progress-percent {
        font-size: var(--cf-font-size-sm);
        fill: var(--cf-text-secondary);
      }
      
      .date-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 100px;
      }
      
      .week-label {
        line-height: var(--cf-line-height-tight);
        margin-bottom: 2px;
        white-space: nowrap;
      }
      
      .month-day {
        line-height: var(--cf-line-height-tight);
        white-space: nowrap;
      }
      
      .week-section {
        width: 100%;
        max-width: 300px;
        margin: var(--cf-spacing-sm) 0;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: var(--cf-spacing-lg);
        background: var(--cf-surface);
        border-radius: var(--cf-radius-pill);
        overflow: hidden;
        margin-bottom: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-shadow-inner);
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        transition: all var(--cf-transition-duration-normal);
        border-right: 1px solid var(--cf-border-light);
      }
      
      .week-bar:last-child {
        border-right: none;
      }
      
      .week-bar.past {
        background: var(--cf-neutral-200);
      }
      
      .week-bar.current {
        background: var(--cf-accent-color);
        transform: scaleY(1.1);
        box-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb), 0.3);
        z-index: 1;
        position: relative;
      }
      
      .week-bar.future {
        background: var(--cf-primary-color);
      }
      
      .day-labels {
        justify-content: space-between;
      }
      
      .day-label {
        font-weight: var(--cf-font-weight-medium);
        text-align: center;
        flex: 1;
        font-size: var(--cf-font-size-sm);
      }
      
      .day-label.past {
        color: var(--cf-neutral-400);
      }
      
      .day-label.current {
        color: var(--cf-accent-color);
        font-weight: var(--cf-font-weight-bold);
      }
      
      .day-label.future {
        color: var(--cf-primary-color);
      }
      
      @container cardforge-container (max-width: 500px) {
        .week-card {
          min-height: 160px;
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-md);
        }
        
        .year-section {
          max-width: 280px;
          margin: 8px 0;
        }
        
        .week-section {
          max-width: 280px;
          margin: 8px 0;
        }
        
        .progress-bars {
          height: var(--cf-spacing-md);
          margin-bottom: var(--cf-spacing-xs);
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card {
          min-height: 150px;
        }
        
        .week-card .card-content {
          gap: var(--cf-spacing-sm);
        }
        
        .year-section {
          max-width: 260px;
          margin: 6px 0;
        }
        
        .date-info {
          min-width: auto;
        }
        
        .week-section {
          max-width: 260px;
          margin: 6px 0;
        }
        
        .progress-bars {
          height: 12px;
          margin-bottom: 6px;
        }
        
        .week-label {
          margin-bottom: 1px;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .year-section {
          flex-direction: column;
          text-align: center;
          max-width: 240px;
          gap: var(--cf-spacing-sm);
          margin: 6px 0;
        }
        
        .progress-ring svg {
          width: 60px;
          height: 60px;
        }
        
        .progress-bars {
          height: 10px;
          border-radius: var(--cf-radius-md);
          margin-bottom: 4px;
        }
        
        .week-section {
          max-width: 240px;
          margin: 6px 0;
        }
      }
      
      @container cardforge-container (max-width: 280px) {
        .week-card {
          min-height: 140px;
        }
        
        .week-card .card-content {
          gap: 8px;
        }
        
        .year-section {
          margin: 4px 0;
        }
        
        .week-section {
          margin: 4px 0;
        }
      }
    `;
  }
}

// 导出卡片类用于注册
export const CardClass = WeekCard;
