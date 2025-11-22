// src/plugins/week-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeekCard extends BasePlugin {
  getTemplate(config, hass, entities) {
    const now = new Date();
    const weekNumber = this._getWeekNumber(now);
    const year = now.getFullYear();
    const dayOfWeek = now.getDay();
    const weekProgress = (dayOfWeek / 7) * 100;
    const yearProgress = this._getYearProgress(now);

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <!-- 第一行：年进度和周信息 -->
      <div class="cf-flex cf-flex-between cf-flex-center" style="align-items: stretch; gap: var(--cf-spacing-lg);">
        <!-- 左侧：年进度环形图 -->
        ${config.show_year_progress ? this._renderYearProgressCircle(yearProgress, year) : ''}
        
        <!-- 右侧：周信息和年份 -->
        <div class="cf-flex cf-flex-center cf-flex-column" style="flex: 1; justify-content: center;">
          <div class="cardforge-text-large cf-text-center">第 ${weekNumber} 周</div>
          <div class="cardforge-text-medium cf-text-center cf-text-secondary">${year}年</div>
        </div>
      </div>
      
      <!-- 第二行：周进度条 -->
      ${config.show_progress ? this._renderWeekProgress(dayOfWeek, weekProgress) : ''}
      
      ${this._renderCardFooter(config, entities)}
    `, 'week-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .progress-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: conic-gradient(
          var(--cf-primary-color) 0%,
          var(--cf-primary-color) var(--progress, 0%),
          var(--cf-border) var(--progress, 0%),
          var(--cf-border) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        flex-shrink: 0;
      }
      
      .progress-circle::before {
        content: '';
        width: 70px;
        height: 70px;
        background: var(--cf-background);
        border-radius: 50%;
        position: absolute;
      }
      
      .progress-text {
        position: relative;
        z-index: 1;
        text-align: center;
      }
      
      .progress-percent {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-primary-color);
        line-height: 1;
      }
      
      .progress-label {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }
      
      .week-progress-container {
        width: 100%;
        margin-top: var(--cf-spacing-lg);
      }
      
      .week-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--cf-spacing-xs);
        margin-top: var(--cf-spacing-sm);
      }
      
      .week-day {
        text-align: center;
        font-size: 0.8em;
        padding: var(--cf-spacing-xs);
        border-radius: var(--cf-radius-sm);
        transition: all var(--cf-transition-fast);
      }
      
      .week-day.current {
        background: var(--cf-primary-color);
        color: white;
        font-weight: 600;
      }
      
      .week-day.other {
        color: var(--cf-text-secondary);
      }
      
      @container cardforge-container (max-width: 400px) {
        .progress-circle {
          width: 60px;
          height: 60px;
        }
        
        .progress-circle::before {
          width: 50px;
          height: 50px;
        }
        
        .progress-percent {
          font-size: 1em;
        }
        
        .cardforge-text-large {
          font-size: 1.8em;
        }
        
        .cardforge-text-medium {
          font-size: 1em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .cf-flex.cf-flex-between {
          flex-direction: column;
          gap: var(--cf-spacing-md) !important;
        }
        
        .progress-circle {
          align-self: center;
        }
      }
    `;
  }

  _getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  _getYearProgress(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const total = end - start;
    const passed = date - start;
    return (passed / total) * 100;
  }

  _renderYearProgressCircle(progress, year) {
    const progressValue = Math.round(progress);
    
    return `
      <div class="progress-circle" style="--progress: ${progress}%">
        <div class="progress-text">
          <div class="progress-percent">${progressValue}%</div>
          <div class="progress-label">${year}</div>
        </div>
      </div>
    `;
  }

  _renderWeekProgress(dayOfWeek, progress) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    return `
      <div class="week-progress-container">
        <div class="cf-flex cf-flex-between cf-mb-sm">
          <span class="cardforge-text-small">本周进度</span>
          <span class="cardforge-text-small">${progress.toFixed(1)}%</span>
        </div>
        <div style="
          height: 6px; 
          background: var(--cf-border); 
          border-radius: 3px; 
          overflow: hidden;
          margin-bottom: var(--cf-spacing-sm);
        ">
          <div style="
            height: 100%; 
            background: var(--cf-accent-color); 
            width: ${progress}%;
            transition: width 0.3s ease;
          "></div>
        </div>
        <div class="week-days">
          ${weekdays.map((day, index) => `
            <div class="week-day ${index === dayOfWeek ? 'current' : 'other'}">
              ${day}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

WeekCard.manifest = {
  id: 'week-card',
  name: '星期卡片',
  description: '显示当前周数和日期进度',
  icon: '📅',
  category: '时间',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    show_progress: {
      type: 'boolean',
      label: '显示周进度',
      default: true
    },
    show_year_progress: {
      type: 'boolean',
      label: '显示年进度',
      default: true
    }
  }
};

export { WeekCard as default, WeekCard };
export const manifest = WeekCard.manifest;