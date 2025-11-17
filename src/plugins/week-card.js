// src/plugins/week-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeekCard extends BasePlugin {
  static manifest = {
    id: 'week-card',
    name: '星期卡片',
    version: '1.0.0',
    description: '简洁的星期和年度进度显示',
    category: 'information',
    icon: '📅',
    author: 'CardForge',
    
    config_schema: {
      display_style: {
        type: 'select',
        label: '显示风格',
        options: ['simple', 'modern', 'minimal', 'progress'],
        default: 'simple',
        description: '选择卡片的显示风格'
      },
      
      show_date: {
        type: 'boolean',
        label: '显示完整日期',
        default: true,
        description: '显示年月日信息'
      },
      
      show_week_progress: {
        type: 'boolean',
        label: '显示年度进度',
        default: true,
        description: '显示年度周进度'
      },
      
      show_week_number: {
        type: 'boolean',
        label: '显示周数',
        default: true,
        description: '显示当前是第几周'
      },
      
      progress_style: {
        type: 'select',
        label: '进度样式',
        options: ['bar', 'circle', 'text'],
        default: 'bar',
        description: '选择进度显示样式'
      }
    },
    
    entity_requirements: []
  };

  // 获取年度周进度数据
  _getYearProgress() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
    const weekOfYear = Math.ceil((days + 1) / 7);
    const totalWeeks = 52; // 一年通常52周
    const progress = (weekOfYear / totalWeeks) * 100;
    
    return {
      weekNumber: weekOfYear,
      totalWeeks: totalWeeks,
      progress: Math.round(progress),
      progressDecimal: progress
    };
  }

  // 获取星期中文名称
  _getWeekdayChinese(weekday) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[weekday] || '未知';
  }

  // 渲染简洁风格
  _renderSimpleLayout(systemData, config, progressData) {
    const showDate = config.show_date !== false;
    const showProgress = config.show_week_progress !== false;
    const showWeekNumber = config.show_week_number !== false;
    const progressStyle = config.progress_style || 'bar';

    return `
      <div class="week-simple">
        <div class="week-main">
          <div class="weekday-large">${systemData.weekday}</div>
          ${showDate ? `
            <div class="date-info">${systemData.date}</div>
          ` : ''}
        </div>
        
        ${showProgress || showWeekNumber ? `
          <div class="week-meta">
            ${showWeekNumber ? `
              <div class="week-number">第${progressData.weekNumber}周</div>
            ` : ''}
            
            ${showProgress ? this._renderProgress(progressData, progressStyle, 'compact') : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 渲染现代风格
  _renderModernLayout(systemData, config, progressData) {
    const showDate = config.show_date !== false;
    const showProgress = config.show_week_progress !== false;
    const showWeekNumber = config.show_week_number !== false;
    const progressStyle = config.progress_style || 'bar';

    return `
      <div class="week-modern">
        <div class="modern-header">
          <div class="weekday-modern">${systemData.weekday}</div>
          ${showWeekNumber ? `
            <div class="week-badge">第${progressData.weekNumber}周</div>
          ` : ''}
        </div>
        
        ${showDate ? `
          <div class="modern-date">${systemData.date}</div>
        ` : ''}
        
        ${showProgress ? `
          <div class="modern-progress">
            ${this._renderProgress(progressData, progressStyle, 'detailed')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 渲染极简风格
  _renderMinimalLayout(systemData, config, progressData) {
    const showProgress = config.show_week_progress !== false;
    const showWeekNumber = config.show_week_number !== false;

    return `
      <div class="week-minimal">
        <div class="minimal-weekday">${systemData.weekday}</div>
        
        ${showProgress || showWeekNumber ? `
          <div class="minimal-meta">
            ${showWeekNumber ? `<span class="minimal-week">W${progressData.weekNumber}</span>` : ''}
            ${showProgress ? `<span class="minimal-progress">${progressData.progress}%</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 渲染进度风格
  _renderProgressLayout(systemData, config, progressData) {
    const showDate = config.show_date !== false;
    const showWeekNumber = config.show_week_number !== false;
    const progressStyle = config.progress_style || 'circle';

    return `
      <div class="week-progress">
        <div class="progress-main">
          ${this._renderProgress(progressData, progressStyle, 'focus')}
          
          <div class="progress-info">
            <div class="progress-weekday">${systemData.weekday}</div>
            ${showDate ? `
              <div class="progress-date">${systemData.date}</div>
            ` : ''}
            ${showWeekNumber ? `
              <div class="progress-weeknum">第${progressData.weekNumber}周</div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // 渲染进度组件
  _renderProgress(progressData, style, size = 'normal') {
    const { weekNumber, totalWeeks, progress, progressDecimal } = progressData;
    
    switch (style) {
      case 'circle':
        return `
          <div class="progress-circle ${size}">
            <div class="circle-bg"></div>
            <div class="circle-progress" style="transform: rotate(${progressDecimal * 3.6}deg)"></div>
            <div class="circle-text">
              <span class="circle-percent">${progress}%</span>
              ${size === 'detailed' ? `<span class="circle-weeks">${weekNumber}/${totalWeeks}</span>` : ''}
            </div>
          </div>
        `;
        
      case 'text':
        return `
          <div class="progress-text ${size}">
            <div class="text-label">年度进度</div>
            <div class="text-value">${weekNumber}/${totalWeeks}周 • ${progress}%</div>
          </div>
        `;
        
      default: // bar
        return `
          <div class="progress-bar ${size}">
            <div class="bar-info">
              <span class="bar-label">年度进度</span>
              <span class="bar-value">${progress}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${progress}%"></div>
            </div>
            ${size === 'detailed' ? `
              <div class="bar-detail">${weekNumber}/${totalWeeks}周</div>
            ` : ''}
          </div>
        `;
    }
  }

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    const progressData = this._getYearProgress();
    const displayStyle = config.display_style || 'simple';

    let layoutHTML = '';
    
    switch (displayStyle) {
      case 'modern':
        layoutHTML = this._renderModernLayout(systemData, config, progressData);
        break;
      case 'minimal':
        layoutHTML = this._renderMinimalLayout(systemData, config, progressData);
        break;
      case 'progress':
        layoutHTML = this._renderProgressLayout(systemData, config, progressData);
        break;
      default:
        layoutHTML = this._renderSimpleLayout(systemData, config, progressData);
    }

    return `
      <div class="cardforge-responsive-container week-card style-${displayStyle}">
        <div class="cardforge-content-grid">
          ${layoutHTML}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const displayStyle = config.display_style || 'simple';
    const progressStyle = config.progress_style || 'bar';

    return `
      ${this.getBaseStyles(config)}
      
      .week-card {
        padding: var(--cf-spacing-lg);
        min-height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* ===== 简洁风格 ===== */
      .week-simple {
        text-align: center;
        width: 100%;
      }
      
      .weekday-large {
        font-size: 3em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-sm);
        line-height: 1.1;
      }
      
      .date-info {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-lg);
      }
      
      .week-meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-lg);
        flex-wrap: wrap;
      }
      
      .week-number {
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border-radius: var(--cf-radius-md);
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-primary-color);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
      }
      
      /* ===== 现代风格 ===== */
      .week-modern {
        width: 100%;
      }
      
      .modern-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-md);
      }
      
      .weekday-modern {
        font-size: 2.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .week-badge {
        background: var(--cf-primary-color);
        color: white;
        padding: var(--cf-spacing-xs) var(--cf-spacing-md);
        border-radius: var(--cf-radius-md);
        font-size: 0.8em;
        font-weight: 600;
      }
      
      .modern-date {
        font-size: 1em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-lg);
      }
      
      .modern-progress {
        margin-top: var(--cf-spacing-lg);
      }
      
      /* ===== 极简风格 ===== */
      .week-minimal {
        text-align: center;
        width: 100%;
      }
      
      .minimal-weekday {
        font-size: 3.5em;
        font-weight: 300;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        line-height: 1;
      }
      
      .minimal-meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .minimal-week {
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        border-radius: var(--cf-radius-sm);
      }
      
      .minimal-progress {
        font-weight: 500;
        color: var(--cf-primary-color);
      }
      
      /* ===== 进度风格 ===== */
      .week-progress {
        width: 100%;
      }
      
      .progress-main {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
        justify-content: center;
      }
      
      .progress-info {
        text-align: left;
      }
      
      .progress-weekday {
        font-size: 1.8em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .progress-date {
        font-size: 1em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .progress-weeknum {
        font-size: 0.9em;
        color: var(--cf-primary-color);
        font-weight: 500;
      }
      
      /* ===== 进度条样式 ===== */
      .progress-bar {
        width: 100%;
      }
      
      .progress-bar.compact {
        max-width: 120px;
      }
      
      .bar-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-xs);
        font-size: 0.8em;
      }
      
      .bar-label {
        color: var(--cf-text-secondary);
      }
      
      .bar-value {
        color: var(--cf-primary-color);
        font-weight: 500;
      }
      
      .bar-track {
        height: 6px;
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-radius: 3px;
        overflow: hidden;
      }
      
      .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--cf-primary-color), var(--cf-accent-color));
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      
      .bar-detail {
        font-size: 0.75em;
        color: var(--cf-text-secondary);
        text-align: center;
        margin-top: var(--cf-spacing-xs);
      }
      
      /* ===== 圆形进度条 ===== */
      .progress-circle {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 50%;
      }
      
      .progress-circle.detailed {
        width: 100px;
        height: 100px;
      }
      
      .progress-circle.focus {
        width: 120px;
        height: 120px;
      }
      
      .circle-bg {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(var(--cf-rgb-primary), 0.1);
        position: absolute;
        top: 0;
        left: 0;
      }
      
      .circle-progress {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: conic-gradient(var(--cf-primary-color) 0%, var(--cf-accent-color) 100%);
        mask: radial-gradient(transparent 50%, #000 51%);
        -webkit-mask: radial-gradient(transparent 50%, #000 51%);
        position: absolute;
        top: 0;
        left: 0;
        transition: transform 0.3s ease;
      }
      
      .circle-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: var(--cf-text-primary);
      }
      
      .circle-percent {
        font-size: 1.2em;
        font-weight: 600;
        display: block;
        color: var(--cf-primary-color);
      }
      
      .progress-circle.detailed .circle-percent {
        font-size: 1.4em;
      }
      
      .progress-circle.focus .circle-percent {
        font-size: 1.8em;
      }
      
      .circle-weeks {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        display: block;
        margin-top: 2px;
      }
      
      /* ===== 文字进度 ===== */
      .progress-text {
        text-align: center;
      }
      
      .progress-text.compact {
        font-size: 0.8em;
      }
      
      .text-label {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .text-value {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-primary-color);
      }
      
      .progress-text.detailed .text-value {
        font-size: 1em;
      }
      
      /* ===== 响应式优化 ===== */
      @media (max-width: 600px) {
        .week-card {
          padding: var(--cf-spacing-md);
          min-height: 120px;
        }
        
        .weekday-large {
          font-size: 2.5em;
        }
        
        .weekday-modern {
          font-size: 1.8em;
        }
        
        .minimal-weekday {
          font-size: 3em;
        }
        
        .progress-weekday {
          font-size: 1.5em;
        }
        
        .progress-main {
          gap: var(--cf-spacing-lg);
        }
        
        .progress-circle.focus {
          width: 100px;
          height: 100px;
        }
      }
      
      @media (max-width: 400px) {
        .weekday-large {
          font-size: 2em;
        }
        
        .weekday-modern {
          font-size: 1.5em;
        }
        
        .minimal-weekday {
          font-size: 2.5em;
        }
        
        .modern-header {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
          align-items: flex-start;
        }
        
        .progress-main {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-md);
        }
        
        .progress-info {
          text-align: center;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .week-number,
        .minimal-week {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .bar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .circle-bg {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    `;
  }
}

export default WeekCard;
export const manifest = WeekCard.manifest;
