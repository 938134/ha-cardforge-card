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
      
      <div class="cf-flex cf-flex-center cf-flex-column cf-gap-lg">
        <div class="cardforge-text-large">第 ${weekNumber} 周</div>
        <div class="cardforge-text-medium">${year}年</div>
        
        ${config.show_progress ? this._renderWeekProgress(dayOfWeek, weekProgress) : ''}
        ${config.show_year_progress ? this._renderYearProgress(yearProgress) : ''}
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'week-card', config);
  }

  getStyles(config) {
    return this.getBaseStyles(config);
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

  _renderWeekProgress(dayOfWeek, progress) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    return `
      <div class="cf-flex cf-flex-column cf-gap-sm" style="width: 100%; max-width: 300px;">
        <div class="cf-flex cf-flex-between">
          <span class="cardforge-text-small">本周进度</span>
          <span class="cardforge-text-small">${progress.toFixed(1)}%</span>
        </div>
        <div style="
          height: 8px; 
          background: var(--cf-border); 
          border-radius: 4px; 
          overflow: hidden;
        ">
          <div style="
            height: 100%; 
            background: var(--cf-primary-color); 
            width: ${progress}%;
            transition: width 0.3s ease;
          "></div>
        </div>
        <div class="cf-flex cf-flex-between cf-text-xs">
          ${weekdays.map((day, index) => `
            <span style="color: ${index === dayOfWeek ? 'var(--cf-primary-color)' : 'var(--cf-text-secondary)'}">
              ${day}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }

  _renderYearProgress(progress) {
    return `
      <div class="cf-flex cf-flex-column cf-gap-sm" style="width: 100%; max-width: 300px;">
        <div class="cf-flex cf-flex-between">
          <span class="cardforge-text-small">年度进度</span>
          <span class="cardforge-text-small">${progress.toFixed(1)}%</span>
        </div>
        <div style="
          height: 6px; 
          background: var(--cf-border); 
          border-radius: 3px; 
          overflow: hidden;
        ">
          <div style="
            height: 100%; 
            background: var(--cf-accent-color); 
            width: ${progress}%;
            transition: width 0.3s ease;
          "></div>
        </div>
      </div>
    `;
  }
}

// 正确导出 manifest 和默认类
WeekCard.manifest = {
  id: 'week-card',
  name: '周历卡片',
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
      default: false
    }
  },
  capabilities: {
    supportsTitle: true,
    supportsFooter: true
  }
};

export { WeekCard as default, WeekCard };
export const manifest = WeekCard.manifest;