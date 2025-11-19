// src/plugins/week-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeekCard extends BasePlugin {
  static manifest = {
    id: 'week-card',
    name: '星期卡片',
    version: '1.0.0',
    description: '精美星期显示卡片，多种风格可选',
    category: '时间',
    icon: '📅',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['简约数字', '优雅文字', '进度圆圈', '色彩标签', '日历视图', '创意图标'],
        default: '简约数字'
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '缩放', '弹跳', '翻转', '渐显'],
        default: '淡入'
      },
      show_week_progress: {
        type: 'boolean',
        label: '显示周进度',
        default: true
      },
      show_date: {
        type: 'boolean',
        label: '显示日期',
        default: true
      },
      highlight_weekend: {
        type: 'boolean',
        label: '高亮周末',
        default: true
      }
    },
    
    // 不需要实体
    entity_requirements: {}
  };

  getTemplate(config, hass, entities) {
    const weekData = this._getWeekData();
    const cardStyle = config.card_style || '简约数字';
    
    return `
      <div class="cardforge-responsive-container week-card style-${this._getStyleClass(cardStyle)} animation-${config.animation_style || '淡入'}">
        ${this._renderCardContent(cardStyle, weekData, config)}
      </div>
    `;
  }

  _getWeekData() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0是星期日，1是星期一，...，6是星期六
    const weekProgress = (dayOfWeek / 7) * 100;
    
    const weekdays = [
      { name: '星期日', short: '日', isWeekend: true, icon: '🌞' },
      { name: '星期一', short: '一', isWeekend: false, icon: '📚' },
      { name: '星期二', short: '二', isWeekend: false, icon: '💼' },
      { name: '星期三', short: '三', isWeekend: false, icon: '🌞' },
      { name: '星期四', short: '四', isWeekend: false, icon: '📊' },
      { name: '星期五', short: '五', isWeekend: false, icon: '🎉' },
      { name: '星期六', short: '六', isWeekend: true, icon: '🎮' }
    ];
    
    return {
      currentDay: dayOfWeek,
      currentWeekday: weekdays[dayOfWeek],
      weekdays: weekdays,
      weekProgress: weekProgress,
      date: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      weekNumber: this._getWeekNumber(now)
    };
  }

  _getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  _renderCardContent(style, weekData, config) {
    const styleClass = this._getStyleClass(style);
    
    const renderers = {
      'digital': () => this._renderDigitalStyle(weekData, config),
      'elegant': () => this._renderElegantStyle(weekData, config),
      'progress': () => this._renderProgressStyle(weekData, config),
      'colorful': () => this._renderColorfulStyle(weekData, config),
      'calendar': () => this._renderCalendarStyle(weekData, config),
      'creative': () => this._renderCreativeStyle(weekData, config)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['digital']();
  }

  /* ===== 简约数字风格 ===== */
  _renderDigitalStyle(weekData, config) {
    return `
      <div class="digital-week-layout">
        <div class="week-number">第 ${weekData.weekNumber} 周</div>
        <div class="digital-display">
          <div class="day-number">${weekData.currentDay}</div>
          <div class="week-info">
            <div class="weekday-name">${weekData.currentWeekday.name}</div>
            ${config.show_date ? `<div class="current-date">${weekData.date}</div>` : ''}
          </div>
        </div>
        ${config.show_week_progress ? `
          <div class="week-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${weekData.weekProgress}%"></div>
            </div>
            <div class="progress-text">周进度 ${Math.round(weekData.weekProgress)}%</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 优雅文字风格 ===== */
  _renderElegantStyle(weekData, config) {
    return `
      <div class="elegant-week-layout">
        <div class="elegant-header">
          <div class="elegant-weekday">${weekData.currentWeekday.name}</div>
          ${config.show_date ? `<div class="elegant-date">${weekData.date}</div>` : ''}
        </div>
        <div class="week-grid">
          ${weekData.weekdays.map((day, index) => `
            <div class="week-day ${index === weekData.currentDay ? 'current' : ''} ${config.highlight_weekend && day.isWeekend ? 'weekend' : ''}">
              <span class="day-short">${day.short}</span>
            </div>
          `).join('')}
        </div>
        <div class="week-meta">
          <span class="week-count">第 ${weekData.weekNumber} 周</span>
          ${config.show_week_progress ? `
            <span class="week-progress-text">${Math.round(weekData.weekProgress)}% 完成</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 进度圆圈风格 ===== */
  _renderProgressStyle(weekData, config) {
    const rotation = (weekData.weekProgress / 100) * 360;
    
    return `
      <div class="progress-week-layout">
        <div class="progress-circle">
          <div class="circle-bg"></div>
          <div class="circle-progress" style="transform: rotate(${rotation}deg)"></div>
          <div class="circle-content">
            <div class="current-day">${weekData.currentDay}</div>
            <div class="weekday-text">${weekData.currentWeekday.name}</div>
          </div>
        </div>
        <div class="progress-info">
          ${config.show_date ? `<div class="progress-date">${weekData.date}</div>` : ''}
          <div class="week-number-info">第 ${weekData.weekNumber} 周</div>
          ${config.show_week_progress ? `
            <div class="progress-percent">${Math.round(weekData.weekProgress)}%</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 色彩标签风格 ===== */
  _renderColorfulStyle(weekData, config) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    
    return `
      <div class="colorful-week-layout">
        <div class="colorful-header">
          <div class="colorful-weekday" style="color: ${colors[weekData.currentDay]}">
            ${weekData.currentWeekday.name}
          </div>
          ${config.show_date ? `<div class="colorful-date">${weekData.date}</div>` : ''}
        </div>
        <div class="tags-container">
          ${weekData.weekdays.map((day, index) => `
            <div class="day-tag ${index === weekData.currentDay ? 'current' : ''} ${config.highlight_weekend && day.isWeekend ? 'weekend' : ''}" 
                 style="background: ${colors[index]}">
              <span class="tag-text">${day.short}</span>
              ${index === weekData.currentDay ? '<div class="tag-indicator"></div>' : ''}
            </div>
          `).join('')}
        </div>
        <div class="colorful-footer">
          <span>第 ${weekData.weekNumber} 周</span>
          ${config.show_week_progress ? `
            <span>· 进度 ${Math.round(weekData.weekProgress)}%</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 日历视图风格 ===== */
  _renderCalendarStyle(weekData, config) {
    return `
      <div class="calendar-week-layout">
        <div class="calendar-header">
          <div class="calendar-title">本周日历</div>
          <div class="calendar-week">第 ${weekData.weekNumber} 周</div>
        </div>
        <div class="calendar-grid">
          ${weekData.weekdays.map((day, index) => `
            <div class="calendar-day ${index === weekData.currentDay ? 'current-day' : ''} ${config.highlight_weekend && day.isWeekend ? 'weekend-day' : ''}">
              <div class="day-header">
                <span class="day-name">${day.name}</span>
                <span class="day-icon">${day.icon}</span>
              </div>
              <div class="day-content">
                ${index === weekData.currentDay ? '<div class="today-marker">今天</div>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
        ${config.show_date ? `
          <div class="calendar-footer">
            ${weekData.date}
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 创意图标风格 ===== */
  _renderCreativeStyle(weekData, config) {
    return `
      <div class="creative-week-layout">
        <div class="creative-main">
          <div class="icon-display">${weekData.currentWeekday.icon}</div>
          <div class="creative-info">
            <div class="creative-weekday">${weekData.currentWeekday.name}</div>
            ${config.show_date ? `<div class="creative-date">${weekData.date}</div>` : ''}
            <div class="creative-week">第 ${weekData.weekNumber} 周</div>
          </div>
        </div>
        <div class="icon-grid">
          ${weekData.weekdays.map((day, index) => `
            <div class="icon-item ${index === weekData.currentDay ? 'active' : ''}">
              <div class="item-icon">${day.icon}</div>
              <div class="item-label">${day.short}</div>
            </div>
          `).join('')}
        </div>
        ${config.show_week_progress ? `
          <div class="creative-progress">
            <div class="progress-text">本周进度</div>
            <div class="progress-value">${Math.round(weekData.weekProgress)}%</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '简约数字': 'digital',
      '优雅文字': 'elegant', 
      '进度圆圈': 'progress',
      '色彩标签': 'colorful',
      '日历视图': 'calendar',
      '创意图标': 'creative'
    };
    return styleMap[styleName] || 'digital';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '简约数字';
    const styleClass = this._getStyleClass(cardStyle);
    
    return `
      ${this.getBaseStyles(config)}
      .week-card {
        padding: var(--cf-spacing-xl);
        min-height: 200px;
        position: relative;
        overflow: hidden;
      }
      
      /* ===== 简约数字风格 ===== */
      .style-digital {
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        color: white;
        font-family: 'Arial', sans-serif;
      }
      .digital-week-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;
      }
      .week-number {
        font-size: 0.9em;
        opacity: 0.8;
        align-self: flex-start;
      }
      .digital-display {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
        justify-content: center;
      }
      .day-number {
        font-size: 4em;
        font-weight: 700;
        color: #e74c3c;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      .week-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      .weekday-name {
        font-size: 1.8em;
        font-weight: 600;
      }
      .current-date {
        font-size: 1em;
        opacity: 0.8;
      }
      .week-progress {
        margin-top: var(--cf-spacing-md);
      }
      .progress-bar {
        height: 6px;
        background: rgba(255,255,255,0.2);
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: var(--cf-spacing-xs);
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #e74c3c, #f39c12);
        border-radius: 3px;
        transition: width 0.5s ease;
      }
      .progress-text {
        font-size: 0.9em;
        opacity: 0.8;
        text-align: center;
      }
      
      /* ===== 优雅文字风格 ===== */
      .style-elegant {
        background: linear-gradient(135deg, #8360c3 0%, #2ebf91 100%);
        color: white;
        font-family: 'Georgia', serif;
      }
      .elegant-week-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--cf-spacing-lg);
      }
      .elegant-header {
        text-align: center;
      }
      .elegant-weekday {
        font-size: 2.2em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-xs);
      }
      .elegant-date {
        font-size: 1em;
        opacity: 0.8;
        font-style: italic;
      }
      .week-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--cf-spacing-sm);
      }
      .week-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      .week-day.current {
        background: rgba(255,255,255,0.3);
        transform: scale(1.1);
        font-weight: 700;
      }
      .week-day.weekend {
        background: rgba(255, 255, 255, 0.15);
      }
      .week-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.9em;
        opacity: 0.8;
      }
      
      /* ===== 进度圆圈风格 ===== */
      .style-progress {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .progress-week-layout {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
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
        border: 8px solid rgba(255,255,255,0.2);
        border-radius: 50%;
      }
      .circle-progress {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 8px solid #e74c3c;
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
        font-size: 2em;
        font-weight: 700;
        line-height: 1;
      }
      .weekday-text {
        font-size: 0.9em;
        opacity: 0.9;
        margin-top: var(--cf-spacing-xs);
      }
      .progress-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      .progress-date {
        font-size: 1.1em;
      }
      .week-number-info {
        font-size: 1em;
        opacity: 0.8;
      }
      .progress-percent {
        font-size: 1.5em;
        font-weight: 700;
        color: #e74c3c;
      }
      
      /* ===== 色彩标签风格 ===== */
      .style-colorful {
        background: #1a1a1a;
        color: white;
      }
      .colorful-week-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--cf-spacing-lg);
      }
      .colorful-header {
        text-align: center;
      }
      .colorful-weekday {
        font-size: 2em;
        font-weight: 700;
        margin-bottom: var(--cf-spacing-xs);
      }
      .colorful-date {
        font-size: 1em;
        opacity: 0.7;
      }
      .tags-container {
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: center;
      }
      .day-tag {
        padding: 8px 12px;
        border-radius: 20px;
        font-weight: 600;
        color: white;
        position: relative;
        transition: transform 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      .day-tag.current {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }
      .day-tag.weekend {
        opacity: 0.8;
      }
      .tag-indicator {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      .colorful-footer {
        display: flex;
        justify-content: center;
        gap: var(--cf-spacing-md);
        font-size: 0.9em;
        opacity: 0.7;
      }
      
      /* ===== 日历视图风格 ===== */
      .style-calendar {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #333;
      }
      .calendar-week-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--cf-spacing-lg);
      }
      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .calendar-title {
        font-size: 1.2em;
        font-weight: 600;
      }
      .calendar-week {
        font-size: 0.9em;
        opacity: 0.7;
      }
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--cf-spacing-sm);
        flex: 1;
      }
      .calendar-day {
        background: rgba(255,255,255,0.8);
        border-radius: 8px;
        padding: var(--cf-spacing-sm);
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
        transition: all 0.3s ease;
      }
      .calendar-day.current-day {
        background: rgba(255,255,255,1);
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .calendar-day.weekend-day {
        background: rgba(255,255,255,0.9);
      }
      .day-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .day-name {
        font-size: 0.8em;
        font-weight: 500;
      }
      .day-icon {
        font-size: 0.9em;
      }
      .today-marker {
        background: #ff6b6b;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.7em;
        font-weight: 600;
        text-align: center;
      }
      .calendar-footer {
        text-align: center;
        font-size: 0.9em;
        opacity: 0.7;
      }
      
      /* ===== 创意图标风格 ===== */
      .style-creative {
        background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3b6 100%);
        color: #2e7d32;
      }
      .creative-week-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--cf-spacing-lg);
      }
      .creative-main {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
      }
      .icon-display {
        font-size: 3em;
      }
      .creative-info {
        flex: 1;
      }
      .creative-weekday {
        font-size: 1.8em;
        font-weight: 700;
        margin-bottom: var(--cf-spacing-xs);
      }
      .creative-date {
        font-size: 1em;
        opacity: 0.8;
        margin-bottom: var(--cf-spacing-xs);
      }
      .creative-week {
        font-size: 0.9em;
        opacity: 0.7;
      }
      .icon-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--cf-spacing-sm);
      }
      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        opacity: 0.6;
        transition: all 0.3s ease;
      }
      .icon-item.active {
        opacity: 1;
        transform: scale(1.1);
      }
      .item-icon {
        font-size: 1.2em;
      }
      .item-label {
        font-size: 0.8em;
        font-weight: 500;
      }
      .creative-progress {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(46, 125, 50, 0.1);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border-radius: 8px;
      }
      .progress-text {
        font-size: 0.9em;
      }
      .progress-value {
        font-size: 1.2em;
        font-weight: 700;
        color: #2e7d32;
      }
      
      /* 动画效果 */
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .animation-弹跳 .week-day.current {
        animation: bounce 0.5s ease;
      }
      
      .animation-翻转 .calendar-day.current-day {
        animation: flip 0.6s ease;
      }
      
      .animation-渐显 .creative-weekday {
        animation: fadeInUp 0.8s ease;
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: scale(1); }
        40%, 43% { transform: scale(1.3); }
      }
      
      @keyframes flip {
        0% { transform: rotateY(0) scale(1); }
        50% { transform: rotateY(90deg) scale(1.1); }
        100% { transform: rotateY(0) scale(1.05); }
      }
      
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* 响应式设计 */
      @media (max-width: 600px) {
        .week-card {
          padding: var(--cf-spacing-lg);
          min-height: 180px;
        }
        .progress-week-layout {
          flex-direction: column;
          gap: var(--cf-spacing-lg);
          text-align: center;
        }
        .progress-circle {
          width: 100px;
          height: 100px;
        }
        .creative-main {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-md);
        }
        .tags-container {
          flex-wrap: wrap;
        }
        .day-tag {
          padding: 6px 10px;
          font-size: 0.9em;
        }
      }
    `;
  }
}

export default WeekCard;
export const manifest = WeekCard.manifest;