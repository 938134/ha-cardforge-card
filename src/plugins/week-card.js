// src/plugins/week-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeekCard extends BasePlugin {
  static manifest = {
    id: 'week-card',
    name: '星期卡片',
    version: '1.1.0',
    description: '精美星期显示卡片，多种风格可选',
    category: '时间',
    icon: '📅',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['简约数字', '优雅文字', '进度圆圈', '色彩标签'],
        default: '简约数字'
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '缩放', '滑动'],
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
    
    const content = this._renderCardContent(cardStyle, weekData, config);
    return this._renderCardContainer(content, `week-card style-${this._getStyleClass(cardStyle)}`, config);
  }

  _getWeekData() {
    const now = new Date();
    const dayOfWeek = now.getDay();
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
      'colorful': () => this._renderColorfulStyle(weekData, config)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['digital']();
  }

  /* ===== 简约数字风格 ===== */
  _renderDigitalStyle(weekData, config) {
    return `
      <div class="digital-layout">
        <div class="cardforge-text-small">第 ${weekData.weekNumber} 周</div>
        <div class="main-display">
          <div class="day-number cardforge-text-large">${weekData.currentDay}</div>
          <div class="week-info">
            <div class="cardforge-text-medium">${weekData.currentWeekday.name}</div>
            ${config.show_date ? `<div class="cardforge-text-small">${weekData.date}</div>` : ''}
          </div>
        </div>
        ${config.show_week_progress ? `
          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${weekData.weekProgress}%"></div>
            </div>
            <div class="cardforge-text-small">周进度 ${Math.round(weekData.weekProgress)}%</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ===== 优雅文字风格 ===== */
  _renderElegantStyle(weekData, config) {
    return `
      <div class="elegant-layout">
        <div class="header-section">
          <div class="cardforge-text-medium">${weekData.currentWeekday.name}</div>
          ${config.show_date ? `<div class="cardforge-text-small">${weekData.date}</div>` : ''}
        </div>
        <div class="week-grid cardforge-grid cardforge-grid-auto">
          ${weekData.weekdays.map((day, index) => `
            <div class="week-day ${index === weekData.currentDay ? 'current' : ''} ${config.highlight_weekend && day.isWeekend ? 'weekend' : ''}">
              <span>${day.short}</span>
            </div>
          `).join('')}
        </div>
        <div class="footer-section cardforge-text-small">
          <span>第 ${weekData.weekNumber} 周</span>
          ${config.show_week_progress ? `
            <span>· ${Math.round(weekData.weekProgress)}% 完成</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 进度圆圈风格 ===== */
  _renderProgressStyle(weekData, config) {
    const rotation = (weekData.weekProgress / 100) * 360;
    
    return `
      <div class="progress-layout">
        <div class="progress-circle">
          <div class="circle-bg"></div>
          <div class="circle-progress" style="transform: rotate(${rotation}deg)"></div>
          <div class="circle-content">
            <div class="cardforge-text-medium">${weekData.currentDay}</div>
            <div class="cardforge-text-small">${weekData.currentWeekday.name}</div>
          </div>
        </div>
        <div class="progress-info">
          ${config.show_date ? `<div class="cardforge-text-small">${weekData.date}</div>` : ''}
          <div class="cardforge-text-small">第 ${weekData.weekNumber} 周</div>
          ${config.show_week_progress ? `
            <div class="progress-percent cardforge-text-medium">${Math.round(weekData.weekProgress)}%</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 色彩标签风格 ===== */
  _renderColorfulStyle(weekData, config) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    
    return `
      <div class="colorful-layout">
        <div class="header-section">
          <div class="cardforge-text-medium">${weekData.currentWeekday.name}</div>
          ${config.show_date ? `<div class="cardforge-text-small">${weekData.date}</div>` : ''}
        </div>
        <div class="tags-container">
          ${weekData.weekdays.map((day, index) => `
            <div class="day-tag ${index === weekData.currentDay ? 'current' : ''}" 
                 style="background: ${colors[index]}">
              <span>${day.short}</span>
            </div>
          `).join('')}
        </div>
        <div class="footer-section cardforge-text-small">
          <span>第 ${weekData.weekNumber} 周</span>
          ${config.show_week_progress ? `
            <span>· 进度 ${Math.round(weekData.weekProgress)}%</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '简约数字': 'digital',
      '优雅文字': 'elegant', 
      '进度圆圈': 'progress',
      '色彩标签': 'colorful'
    };
    return styleMap[styleName] || 'digital';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '简约数字';
    const styleClass = this._getStyleClass(cardStyle);
    
    return `
      ${this.getBaseStyles(config)}
      
      .week-card {
        justify-content: space-between;
      }

      /* 通用样式 */
      .main-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-lg);
      }

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

      .week-grid {
        margin: var(--cf-spacing-md) 0;
      }

      .week-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
      }

      .week-day.current {
        background: var(--cf-primary-color);
        color: white;
        transform: scale(1.1);
      }

      .week-day.weekend {
        background: rgba(var(--cf-rgb-accent), 0.1);
      }

      .header-section,
      .footer-section {
        text-align: center;
      }

      .footer-section {
        display: flex;
        justify-content: center;
        gap: var(--cf-spacing-md);
      }

      /* 进度圆圈样式 */
      .progress-layout {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
        justify-content: center;
      }

      .progress-circle {
        position: relative;
        width: 100px;
        height: 100px;
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

      .progress-percent {
        color: var(--cf-primary-color);
        font-weight: 600;
      }

      /* 色彩标签样式 */
      .tags-container {
        display: flex;
        gap: var(--cf-spacing-sm);
        justify-content: center;
        margin: var(--cf-spacing-md) 0;
      }

      .day-tag {
        padding: 8px 12px;
        border-radius: 20px;
        font-weight: 600;
        color: white;
        transition: transform 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .day-tag.current {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .progress-layout {
          flex-direction: column;
          gap: var(--cf-spacing-lg);
        }
        
        .tags-container {
          flex-wrap: wrap;
        }
        
        .day-tag {
          padding: 6px 10px;
          font-size: 0.