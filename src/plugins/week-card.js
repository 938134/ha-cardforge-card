// src/plugins/week-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeekCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    const now = new Date();
    const weekNumber = this._getWeekNumber(now);
    const year = now.getFullYear();
    const dayOfWeek = now.getDay();
    const weekProgress = (dayOfWeek / 7) * 100;
    const yearProgress = this._getYearProgress(now);

    return this._renderCardContainer(`
      ${this._renderCardHeader(safeConfig, entities)}
      
      <!-- 紧凑布局：年进度和周信息 -->
      <div class="week-main-container">
        <!-- 左侧：周信息和年份 -->
        <div class="week-info">
          <div class="cardforge-text-large week-number">第 ${weekNumber} 周</div>
          <div class="cardforge-text-medium week-year">${year}年</div>
        </div>
        
        <!-- 右侧：年进度环形图 -->
        ${safeConfig.show_year_progress ? this._renderYearProgressCircle(yearProgress, year) : ''}
      </div>
      
      <!-- 周进度条 -->
      ${safeConfig.show_progress ? this._renderWeekProgress(dayOfWeek, weekProgress) : ''}
      
      ${this._renderCardFooter(safeConfig, entities)}
    `, 'week-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .week-main-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .week-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: left;
      }
      
      .week-number {
        line-height: 1.1;
        margin-bottom: var(--cf-spacing-xs);
        font-size: 2em;
        font-weight: 300;
      }
      
      .week-year {
        opacity: 0.8;
        font-size: 1em;
      }
      
      .progress-circle {
        width: 60px;
        height: 60px;
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
        width: 50px;
        height: 50px;
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
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-primary-color);
        line-height: 1;
      }
      
      .progress-label {
        font-size: 0.6em;
        color: var(--cf-text-secondary);
        margin-top: 1px;
      }
      
      .week-progress-container {
        width: 100%;
        margin-top: var(--cf-spacing-md);
      }
      
      .week-progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .week-progress-bar {
        height: 6px;
        background: var(--cf-border);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .week-progress-fill {
        height: 100%;
        background: var(--cf-accent-color);
        transition: width 0.3s ease;
        border-radius: 3px;
      }
      
      .week-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--cf-spacing-xs);
      }
      
      .week-day {
        text-align: center;
        font-size: 0.75em;
        padding: 6px 2px;
        border-radius: var(--cf-radius-sm);
        transition: all var(--cf-transition-fast);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      .week-day.current {
        background: var(--cf-primary-color);
        color: white;
        font-weight: 600;
        transform: scale(1.05);
      }
      
      .week-day.other {
        color: var(--cf-text-secondary);
        opacity: 0.7;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .week-main-container {
          gap: var(--cf-spacing-sm);
        }
        
        .week-number {
          font-size: 1.8em;
        }
        
        .week-year {
          font-size: 0.9em;
        }
        
        .progress-circle {
          width: 55px;
          height: 55px;
        }
        
        .progress-circle::before {
          width: 45px;
          height: 45px;
        }
        
        .progress-percent {
          font-size: 0.85em;
        }
        
        .week-day {
          padding: 4px 1px;
          font-size: 0.7em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .week-main-container {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
          text-align: center;
        }
        
        .week-info {
          text-align: center;
        }
        
        .week-number {
          font-size: 1.6em;
        }
      }
      
      /* 悬停效果 */
      .week-day:hover {
        background: rgba(var(--cf-rgb-primary), 0.1);
        transform: translateY(-1px);
      }
      
      .week-day.current:hover {
        background: var(--cf-primary-color);
        transform: scale(1.08);
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
          <div class="progress-label">年进度</div>
        </div>
      </div>
    `;
  }

  _renderWeekProgress(dayOfWeek, progress) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    return `
      <div class="week-progress-container">
        <div class="week-progress-header">
          <span class="cardforge-text-small">本周进度</span>
          <span class="cardforge-text-small">${progress.toFixed(1)}%</span>
        </div>
        
        <div class="week-progress-bar">
          <div class="week-progress-fill" style="width: ${progress}%"></div>
        </div>
        
        <div class="week-days">
          ${weekdays.map((day, index) => `
            <div class="week-day ${index === dayOfWeek ? 'current' : 'other'}" title="${weekdays[index]}${index === dayOfWeek ? '（今天）' : ''}">
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