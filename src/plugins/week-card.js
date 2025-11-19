// src/plugins/week-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeekCard extends BasePlugin {
  static manifest = {
    id: 'week-card',
    name: '星期卡片',
    version: '1.1.0',
    description: '精美星期显示卡片，突出双休日和周进度',
    category: '时间',
    icon: '📅',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['进度环形', '时间轴', '日历网格', '周末高亮', '数据统计', '简约数字'],
        default: '进度环形'
      },
      highlight_weekend: {
        type: 'boolean',
        label: '高亮周末',
        default: true
      },
      show_week_progress: {
        type: 'boolean',
        label: '显示周进度',
        default: true
      },
      show_week_number: {
        type: 'boolean',
        label: '显示第几周',
        default: true
      },
      weekend_color: {
        type: 'select',
        label: '周末颜色',
        options: ['红色系', '橙色系', '绿色系', '蓝色系', '紫色系'],
        default: '红色系'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const weekData = this._getWeekData();
    const cardStyle = config.card_style || '进度环形';
    
    const content = this._renderCardContent(cardStyle, weekData, config);
    return this._renderCardContainer(content, `week-card style-${this._getStyleClass(cardStyle)} weekend-${this._getWeekendColorClass(config.weekend_color)}`, config);
  }

  _getWeekData() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0-6, 0是周日
    const weekProgress = (dayOfWeek / 6) * 100; // 周一到周日算完整一周
    
    const weekdays = [
      { name: '星期日', short: '日', isWeekend: true, icon: '🌞', progress: 100 },
      { name: '星期一', short: '一', isWeekend: false, icon: '💼', progress: 0 },
      { name: '星期二', short: '二', isWeekend: false, icon: '📚', progress: 20 },
      { name: '星期三', short: '三', isWeekend: false, icon: '🌞', progress: 40 },
      { name: '星期四', short: '四', isWeekend: false, icon: '📊', progress: 60 },
      { name: '星期五', short: '五', isWeekend: false, icon: '🎉', progress: 80 },
      { name: '星期六', short: '六', isWeekend: true, icon: '🎮', progress: 100 }
    ];
    
    return {
      currentDay: dayOfWeek,
      currentWeekday: weekdays[dayOfWeek],
      weekdays: weekdays,
      weekProgress: weekProgress,
      weekNumber: this._getWeekNumber(now),
      date: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      daysUntilWeekend: this._getDaysUntilWeekend(dayOfWeek),
      weekendProgress: this._getWeekendProgress(dayOfWeek)
    };
  }

  _getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  _getDaysUntilWeekend(dayOfWeek) {
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0; // 已经是周末
    return 6 - dayOfWeek; // 距离周六的天数
  }

  _getWeekendProgress(dayOfWeek) {
    // 计算距离周末的进度（周一到周五）
    if (dayOfWeek === 0 || dayOfWeek === 6) return 100;
    return (dayOfWeek / 5) * 100;
  }

  _renderCardContent(style, weekData, config) {
    const styleClass = this._getStyleClass(style);
    
    const renderers = {
      'progress': () => this._renderProgressStyle(weekData, config),
      'timeline': () => this._renderTimelineStyle(weekData, config),
      'calendar': () => this._renderCalendarStyle(weekData, config),
      'weekend': () => this._renderWeekendStyle(weekData, config),
      'stats': () => this._renderStatsStyle(weekData, config),
      'digital': () => this._renderDigitalStyle(weekData, config)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['progress']();
  }

  /* ===== 进度环形风格 ===== */
  _renderProgressStyle(weekData, config) {
    const rotation = (weekData.weekProgress / 100) * 360;
    
    return `
      <div class="progress-layout">
        <div class="progress-circle">
          <div class="circle-bg"></div>
          <div class="circle-progress" style="transform: rotate(${rotation}deg)"></div>
          <div class="circle-content">
            <div class="current-day cardforge-text-large">${weekData.currentDay === 0 ? 7 : weekData.currentDay}</div>
            <div class="current-weekday cardforge-text-small">${weekData.currentWeekday.name}</div>
          </div>
        </div>
        <div class="progress-info">
          ${config.show_week_number ? `<div class="week-number">第 ${weekData.weekNumber} 周</div>` : ''}
          ${config.show_week_progress ? `
            <div class="progress-section">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${weekData.weekProgress}%"></div>
              </div>
              <div class="progress-text">周进度 ${Math.round(weekData.weekProgress)}%</div>
            </div>
          ` : ''}
          <div class="weekend-countdown">
            ${weekData.daysUntilWeekend === 0 ? 
              '<span class="weekend-now">🎉 周末进行中</span>' : 
              `<span>距离周末还有 ${weekData.daysUntilWeekend} 天</span>`
            }
          </div>
        </div>
      </div>
    `;
  }

  /* ===== 时间轴风格 ===== */
  _renderTimelineStyle(weekData, config) {
    return `
      <div class="timeline-layout">
        <div class="timeline-header">
          ${config.show_week_number ? `<div class="week-number-timeline">第 ${weekData.weekNumber} 周</div>` : ''}
          <div class="current-date">${weekData.date}</div>
        </div>
        <div class="timeline-container">
          ${weekData.weekdays.map((day, index) => `
            <div class="timeline-item ${index === weekData.currentDay ? 'current' : ''} ${config.highlight_weekend && day.isWeekend ? 'weekend' : ''}">
              <div class="timeline-marker">
                ${index === weekData.currentDay ? '<div class="current-pulse"></div>' : ''}
              </div>
              <div class="timeline-content">
                <div class="day-name">${day.short}</div>
                <div class="day-icon">${day.icon}</div>
              </div>
            </div>
          `).join('')}
        </div>
        ${config.show_week_progress ? `
          <div class="timeline-progress">
            <div class="progress-text">本周已完成 ${Math.round(weekData.weekProgress)}%</div>
            <div class="weekend-progress">
              周末进度: ${Math.round(weekData.weekendProgress)}%
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 日历网格风格 ===== */
  _renderCalendarStyle(weekData, config) {
    return `
      <div class="calendar-layout">
        <div class="calendar-header">
          <div class="current-weekday-large">${weekData.currentWeekday.name}</div>
          ${config.show_week_number ? `<div class="week-number-calendar">第 ${weekData.weekNumber} 周</div>` : ''}
        </div>
        <div class="calendar-grid">
          ${weekData.weekdays.map((day, index) => `
            <div class="calendar-day ${index === weekData.currentDay ? 'current' : ''} ${config.highlight_weekend && day.isWeekend ? 'weekend' : ''}">
              <div class="day-short">${day.short}</div>
              <div class="day-icon">${day.icon}</div>
              ${config.highlight_weekend && day.isWeekend ? '<div class="weekend-badge">周末</div>' : ''}
            </div>
          `).join('')}
        </div>
        ${config.show_week_progress ? `
          <div class="calendar-footer">
            <div class="progress-stats">
              <div class="stat">
                <div class="stat-value">${Math.round(weekData.weekProgress)}%</div>
                <div class="stat-label">周进度</div>
              </div>
              <div class="stat">
                <div class="stat-value">${weekData.daysUntilWeekend}</div>
                <div class="stat-label">天到周末</div>
              </div>
              <div class="stat">
                <div class="stat-value">${weekData.weekNumber}</div>
                <div class="stat-label">第几周</div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 周末高亮风格 ===== */
  _renderWeekendStyle(weekData, config) {
    const weekendDays = weekData.weekdays.filter(day => day.isWeekend);
    const isWeekend = weekData.currentWeekday.isWeekend;
    
    return `
      <div class="weekend-layout">
        <div class="weekend-header">
          <div class="weekend-status ${isWeekend ? 'active' : ''}">
            ${isWeekend ? '🎊 周末快乐！' : '📅 工作日加油'}
          </div>
          ${config.show_week_number ? `<div class="week-number-weekend">第 ${weekData.weekNumber} 周</div>` : ''}
        </div>
        
        <div class="current-day-section">
          <div class="current-day-large">${weekData.currentDay === 0 ? 7 : weekData.currentDay}</div>
          <div class="current-weekday-main">${weekData.currentWeekday.name}</div>
        </div>

        <div class="weekend-countdown-section">
          ${!isWeekend ? `
            <div class="countdown">
              <div class="countdown-title">距离周末还有</div>
              <div class="countdown-days">${weekData.daysUntilWeekend} 天</div>
              <div class="countdown-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${weekData.weekendProgress}%"></div>
                </div>
                <div class="progress-text">本周进度 ${Math.round(weekData.weekendProgress)}%</div>
              </div>
            </div>
          ` : `
            <div class="weekend-celebration">
              <div class="celebration-icon">🎉</div>
              <div class="celebration-text">享受美好周末时光！</div>
            </div>
          `}
        </div>

        <div class="weekend-days">
          <div class="weekend-title">周末日期</div>
          <div class="weekend-list">
            ${weekendDays.map(day => `
              <div class="weekend-day ${day.name === weekData.currentWeekday.name ? 'current' : ''}">
                <span class="weekend-icon">${day.icon}</span>
                <span class="weekend-name">${day.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ===== 数据统计风格 ===== */
  _renderStatsStyle(weekData, config) {
    const workDays = weekData.weekdays.filter(day => !day.isWeekend).length;
    const weekendDays = weekData.weekdays.filter(day => day.isWeekend).length;
    const passedWorkDays = weekData.currentDay >= 1 && weekData.currentDay <= 5 ? weekData.currentDay : 5;
    
    return `
      <div class="stats-layout">
        <div class="stats-header">
          <div class="current-display">
            <div class="current-day-stats">${weekData.currentDay === 0 ? 7 : weekData.currentDay}</div>
            <div class="current-weekday-stats">${weekData.currentWeekday.name}</div>
          </div>
          ${config.show_week_number ? `<div class="week-number-stats">第 ${weekData.weekNumber} 周</div>` : ''}
        </div>

        <div class="stats-grid">
          <div class="stat-card ${weekData.currentWeekday.isWeekend ? 'weekend' : 'workday'}">
            <div class="stat-icon">${weekData.currentWeekday.isWeekend ? '🎯' : '💼'}</div>
            <div class="stat-value">${weekData.currentWeekday.isWeekend ? '周末' : '工作日'}</div>
            <div class="stat-label">今天类型</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-value">${Math.round(weekData.weekProgress)}%</div>
            <div class="stat-label">周进度</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-value">${weekData.daysUntilWeekend}</div>
            <div class="stat-label">天到周末</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">${passedWorkDays}/${workDays}</div>
            <div class="stat-label">工作日</div>
          </div>
        </div>

        <div class="week-stats">
          <div class="week-bar">
            ${weekData.weekdays.map((day, index) => `
              <div class="day-bar ${index === weekData.currentDay ? 'current' : ''} ${config.highlight_weekend && day.isWeekend ? 'weekend' : ''}" 
                   style="height: ${day.progress}%">
                <div class="bar-label">${day.short}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ===== 简约数字风格 ===== */
  _renderDigitalStyle(weekData, config) {
    return `
      <div class="digital-layout">
        <div class="digital-main">
          <div class="digital-day">${weekData.currentDay === 0 ? '7' : '0' + weekData.currentDay}</div>
          <div class="digital-info">
            <div class="digital-weekday">${weekData.currentWeekday.name}</div>
            ${config.show_week_number ? `<div class="digital-week-number">第 ${weekData.weekNumber} 周</div>` : ''}
          </div>
        </div>
        
        ${config.show_week_progress ? `
          <div class="digital-progress">
            <div class="progress-section">
              <div class="progress-label">周进度</div>
              <div class="progress-value">${Math.round(weekData.weekProgress)}%</div>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${weekData.weekProgress}%"></div>
              </div>
            </div>
            ${!weekData.currentWeekday.isWeekend ? `
              <div class="progress-section">
                <div class="progress-label">周末倒计时</div>
                <div class="progress-value">${weekData.daysUntilWeekend}天</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${weekData.weekendProgress}%"></div>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="digital-week">
          ${weekData.weekdays.map((day, index) => `
            <div class="digital-day-item ${index === weekData.currentDay ? 'current' : ''} ${config.highlight_weekend && day.isWeekend ? 'weekend' : ''}">
              ${day.short}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '进度环形': 'progress',
      '时间轴': 'timeline', 
      '日历网格': 'calendar',
      '周末高亮': 'weekend',
      '数据统计': 'stats',
      '简约数字': 'digital'
    };
    return styleMap[styleName] || 'progress';
  }

  _getWeekendColorClass(color) {
    const colorMap = {
      '红色系': 'red',
      '橙色系': 'orange',
      '绿色系': 'green', 
      '蓝色系': 'blue',
      '紫色系': 'purple'
    };
    return colorMap[color] || 'red';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '进度环形';
    const styleClass = this._getStyleClass(cardStyle);
    const weekendColor = this._getWeekendColorClass(config.weekend_color);
    
    // 使用增强的基类样式
    const baseStyles = this.getEnhancedBaseStyles(config);
    
    // 周末颜色配置
    const weekendColors = {
      'red': { primary: '#ff6b6b', secondary: '#ff5252', light: '#ffebee' },
      'orange': { primary: '#ffa726', secondary: '#ff9800', light: '#fff3e0' },
      'green': { primary: '#66bb6a', secondary: '#4caf50', light: '#e8f5e8' },
      'blue': { primary: '#42a5f5', secondary: '#2196f3', light: '#e3f2fd' },
      'purple': { primary: '#ab47bc', secondary: '#9c27b0', light: '#f3e5f5' }
    };
    
    const colors = weekendColors[weekendColor] || weekendColors['red'];
    
    return `
      ${baseStyles}
      
      .week-card {
        position: relative;
      }

      /* 周末颜色变量 */
      .weekend-red .weekend {
        background: ${colors.light} !important;
        color: ${colors.primary} !important;
        border-color: ${colors.primary} !important;
      }

      .weekend-orange .weekend {
        background: ${colors.light} !important;
        color: ${colors.primary} !important;
        border-color: ${colors.primary} !important;
      }

      .weekend-green .weekend {
        background: ${colors.light} !important;
        color: ${colors.primary} !important;
        border-color: ${colors.primary} !important;
      }

      .weekend-blue .weekend {
        background: ${colors.light} !important;
        color: ${colors.primary} !important;
        border-color: ${colors.primary} !important;
      }

      .weekend-purple .weekend {
        background: ${colors.light} !important;
        color: ${colors.primary} !important;
        border-color: ${colors.primary} !important;
      }

      /* 通用进度条样式 */
      .progress-bar {
        height: 6px;
        background: rgba(var(--cf-rgb-primary), 0.2);
        border-radius: 3px;
        overflow: hidden;
        margin: var(--cf-spacing-sm) 0;
      }

      .progress-fill {
        height: 100%;
        background: var(--cf-primary-color);
        border-radius: 3px;
        transition: width 0.5s ease;
      }

      .weekend-now {
        color: ${colors.primary};
        font-weight: 600;
      }

      /* ===== 进度环形样式 ===== */
      .style-progress {
        text-align: center;
      }

      .progress-layout {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
        justify-content: center;
        height: 100%;
      }

      .progress-circle {
        position: relative;
        width: 120px;
        height: 120px;
        border-radius: 50%;
      }

      .circle-bg {
        width: 100%;
        height: 100%;
        border: 6px solid rgba(var(--cf-rgb-primary), 0.2);
        border-radius: 50%;
      }

      .circle-progress {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 6px solid var(--cf-primary-color);
        border-radius: 50%;
        clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%);
      }

      .circle-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }

      .current-day {
        font-size: 2.5em;
        font-weight: 700;
        color: var(--cf-primary-color);
      }

      .progress-info {
        text-align: left;
        min-width: 150px;
      }

      .week-number {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-md);
        color: var(--cf-text-primary);
      }

      .progress-text {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }

      .weekend-countdown {
        margin-top: var(--cf-spacing-md);
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }

      /* ===== 时间轴样式 ===== */
      .style-timeline {
        padding: var(--cf-spacing-lg);
      }

      .timeline-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-lg);
      }

      .week-number-timeline {
        font-weight: 600;
        color: var(--cf-primary-color);
      }

      .current-date {
        font-size: 0.9em;
        opacity: 0.8;
      }

      .timeline-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1;
        position: relative;
      }

      .timeline-container::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 2px;
        background: rgba(var(--cf-rgb-primary), 0.3);
        transform: translateY(-50%);
      }

      .timeline-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 2;
      }

      .timeline-marker {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--cf-background);
        border: 2px solid rgba(var(--cf-rgb-primary), 0.5);
        margin-bottom: var(--cf-spacing-sm);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .timeline-item.current .timeline-marker {
        background: var(--cf-primary-color);
        border-color: var(--cf-primary-color);
      }

      .timeline-item.weekend .timeline-marker {
        border-color: ${colors.primary};
      }

      .current-pulse {
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      .timeline-content {
        text-align: center;
      }

      .day-name {
        font-size: 0.8em;
        margin-bottom: 2px;
      }

      .day-icon {
        font-size: 1.2em;
      }

      .timeline-progress {
        margin-top: var(--cf-spacing-lg);
        text-align: center;
      }

      .weekend-progress {
        margin-top: var(--cf-spacing-sm);
        font-size: 0.9em;
        color: ${colors.primary};
      }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* ===== 日历网格样式 ===== */
      .style-calendar {
        padding: var(--cf-spacing-lg);
      }

      .calendar-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .calendar-header {
        text-align: center;
        margin-bottom: var(--cf-spacing-lg);
      }

      .current-weekday-large {
        font-size: 1.8em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
      }

      .week-number-calendar {
        font-size: 1em;
        opacity: 0.8;
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--cf-spacing-sm);
        flex: 1;
      }

      .calendar-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm);
        transition: all 0.3s ease;
        position: relative;
      }

      .calendar-day.current {
        background: var(--cf-primary-color);
        color: white;
        transform: scale(1.05);
      }

      .day-short {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .day-icon {
        font-size: 1.2em;
      }

      .weekend-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: ${colors.primary};
        color: white;
        font-size: 0.7em;
        padding: 2px 6px;
        border-radius: 10px;
      }

      .calendar-footer {
        margin-top: var(--cf-spacing-lg);
      }

      .progress-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--cf-spacing-md);
      }

      .stat {
        text-align: center;
      }

      .stat-value {
        font-size: 1.4em;
        font-weight: 700;
        color: var(--cf-primary-color);
      }

      .stat-label {
        font-size: 0.8em;
        opacity: 0.7;
        margin-top: 2px;
      }

      /* 响应式优化 */
      @container cardforge-container (max-width: 400px) {
        .progress-layout {
          flex-direction: column;
          gap: var(--cf-spacing-lg);
        }
        
        .progress-circle {
          width: 100px;
          height: 100px;
        }
        
        .progress-info {
          text-align: center;
        }
        
        .calendar-grid {
          gap: var(--cf-spacing-xs);
        }
        
        .calendar-day {
          padding: var(--cf-spacing-xs);
        }
        
        .progress-stats {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
  }
}

export default WeekCard;
export const manifest = WeekCard.manifest;