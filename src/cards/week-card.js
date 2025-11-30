// src/cards/week-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'week-card',
  name: '星期卡片',
  description: '显示年进度和周进度，突出显示当前星期',
  icon: '📅',
  category: '时间',
  version: '1.0.0',
  author: 'CardForge',
  block_mode: 'none',
  config_schema: {
    show_year_progress: {
      type: 'boolean',
      label: '显示年进度',
      default: true
    },
    show_week_progress: {
      type: 'boolean',
      label: '显示周进度',
      default: true
    }
  }
};

export class WeekCard extends BaseCard {
  getDefaultConfig() {
    // 从config_schema生成默认配置
    const defaultConfig = {};
    Object.entries(CARD_CONFIG.config_schema).forEach(([key, field]) => {
      defaultConfig[key] = field.default !== undefined ? field.default : '';
    });

    return {
      card_type: CARD_CONFIG.id,
      theme: 'auto',
      ...defaultConfig,
      // 明确设置为空对象，表示无块
      blocks: {}
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  // 重写渲染方法，直接渲染星期内容
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    const content = this._generateWeekContent(safeConfig);
    const styles = this._renderStyles(safeConfig, '');
    
    return {
      template: this._renderTemplate(content),
      styles: styles
    };
  }

  _generateWeekContent(config) {
    const now = new Date();
    const elements = [];
    
    // 年进度环
    if (config.show_year_progress) {
      elements.push(this._renderYearProgress(now));
    }
    
    // 周进度条
    if (config.show_week_progress) {
      elements.push(this._renderWeekProgress(now));
    }
    
    return elements.join('');
  }

  _renderYearProgress(date) {
    const yearProgress = this._getYearProgress(date);
    const weekNumber = this._getWeekNumber(date);
    const dateStr = this._formatShortDate(date);
    
    return `
      <div class="year-progress-container">
        <div class="year-progress">
          <div class="progress-ring">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <!-- 背景环 -->
              <circle cx="30" cy="30" r="26" stroke="#e0e0e0" stroke-width="5" fill="none"/>
              <!-- 进度环 -->
              <circle cx="30" cy="30" r="26" stroke="var(--cf-primary-color)" stroke-width="5" 
                      fill="none" stroke-linecap="round"
                      stroke-dasharray="${2 * Math.PI * 26}" 
                      stroke-dashoffset="${2 * Math.PI * 26 * (1 - yearProgress / 100)}"
                      transform="rotate(-90 30 30)"/>
            </svg>
            <div class="ring-content">
              <div class="year-percent">${Math.round(yearProgress)}</div>
            </div>
          </div>
          <div class="week-info">
            <div class="week-number">第 ${weekNumber} 周</div>
            <div class="current-date">${dateStr}</div>
          </div>
        </div>
      </div>
    `;
  }

  _renderWeekProgress(date) {
    const weekDay = date.getDay(); // 0-6, 0=周日
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    let weekBars = '';
    let dayLabels = '';
    
    // 生成星期进度条和标签
    for (let i = 0; i < 7; i++) {
      const isActive = i < weekDay; // 已过天数（包括今天）
      const isCurrent = i === weekDay; // 当前天
      
      let colorClass = 'future';
      if (isCurrent) {
        colorClass = 'current';
      } else if (isActive) {
        colorClass = 'active';
      }
      
      weekBars += `<div class="week-bar ${colorClass}"></div>`;
      dayLabels += `<div class="day-label">${weekDays[i]}</div>`;
    }
    
    return `
      <div class="week-progress">
        <div class="progress-bars">
          ${weekBars}
        </div>
        <div class="day-labels">
          ${dayLabels}
        </div>
      </div>
    `;
  }

  _getYearProgress(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const elapsed = date - start;
    const total = end - start;
    return (elapsed / total) * 100;
  }

  _getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  }

  _formatShortDate(date) {
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    return `${month}月${day}日`;
  }

  _renderTemplate(content) {
    return `
      <div class="cardforge-card ${CARD_CONFIG.id}">
        <div class="cardforge-area area-content">
          <div class="week-display">
            ${content}
          </div>
        </div>
      </div>
    `;
  }

  _renderStyles(config, themeStyles) {
    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      /* 星期显示区域 */
      .cardforge-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 140px;
        padding: var(--cf-spacing-md);
        gap: 20px;
      }
      
      .week-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        width: 100%;
      }
      
      /* 年进度容器 - 居中显示 */
      .year-progress-container {
        display: flex;
        justify-content: center;
        width: 100%;
      }
      
      /* 年进度环和文字水平排列 */
      .year-progress {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
      }
      
      .progress-ring {
        position: relative;
        width: 60px;
        height: 60px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ring-content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .year-percent {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-primary-color);
        line-height: 1;
      }
      
      /* 周信息 - 垂直居中 */
      .week-info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 4px;
        height: 60px; /* 与进度环高度一致 */
      }
      
      .week-number {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }
      
      .current-date {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        line-height: 1.2;
      }
      
      /* 周进度条样式 */
      .week-progress {
        width: 100%;
        max-width: 240px;
      }
      
      .progress-bars {
        display: flex;
        width: 100%;
        height: 14px;
        background: #f0f0f0;
        border-radius: 7px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        transition: background-color 0.3s ease;
      }
      
      .week-bar.active {
        background: var(--cf-primary-color);
      }
      
      .week-bar.current {
        background: var(--cf-accent-color);
      }
      
      .week-bar.future {
        background: #e0e0e0;
      }
      
      .day-labels {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }
      
      .day-label {
        font-size: 0.75em;
        color: var(--cf-text-secondary);
        text-align: center;
        flex: 1;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .cardforge-area {
          min-height: 130px;
          padding: var(--cf-spacing-sm);
          gap: 16px;
        }
        
        .week-display {
          gap: 16px;
        }
        
        .year-progress {
          gap: 16px;
        }
        
        .progress-ring {
          width: 55px;
          height: 55px;
        }
        
        .week-info {
          height: 55px;
        }
        
        .year-percent {
          font-size: 1em;
        }
        
        .week-number {
          font-size: 0.95em;
        }
        
        .current-date {
          font-size: 0.85em;
        }
        
        .week-progress {
          max-width: 220px;
        }
        
        .progress-bars {
          height: 12px;
        }
      }

      @container cardforge-container (max-width: 350px) {
        .year-progress {
          gap: 14px;
        }
        
        .progress-ring {
          width: 50px;
          height: 50px;
        }
        
        .week-info {
          height: 50px;
        }
        
        .year-percent {
          font-size: 0.95em;
        }
        
        .week-number {
          font-size: 0.9em;
        }
        
        .current-date {
          font-size: 0.8em;
        }
        
        .week-progress {
          max-width: 200px;
        }
      }

      @container cardforge-container (max-width: 300px) {
        .year-progress {
          gap: 12px;
        }
        
        .progress-ring {
          width: 45px;
          height: 45px;
        }
        
        .week-info {
          height: 45px;
        }
        
        .year-percent {
          font-size: 0.9em;
        }
        
        .week-number {
          font-size: 0.85em;
        }
        
        .current-date {
          font-size: 0.75em;
        }
        
        .week-progress {
          max-width: 180px;
        }
        
        .progress-bars {
          height: 10px;
        }
        
        .day-label {
          font-size: 0.7em;
        }
      }

      @container cardforge-container (max-width: 250px) {
        .year-progress {
          gap: 10px;
        }
        
        .progress-ring {
          width: 40px;
          height: 40px;
        }
        
        .week-info {
          height: 40px;
        }
        
        .year-percent {
          font-size: 0.85em;
        }
        
        .week-number {
          font-size: 0.8em;
        }
        
        .current-date {
          font-size: 0.7em;
        }
        
        .week-progress {
          max-width: 160px;
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default WeekCard;