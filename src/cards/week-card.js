import { BaseCard } from '../core/base-card.js';
import { html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { getYearProgress, getWeekNumber, formatDate } from '../core/card-tools.js';

/**
 * 星期卡片 - 显示年进度和周进度
 */
export class WeekCard extends BaseCard {
  static properties = {
    ...BaseCard.properties,
    _currentDate: { state: true }
  };

  // 卡片配置模式
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
    },
    compactMode: {
      type: 'boolean',
      label: '紧凑模式',
      default: false
    }
  };

  // 卡片元数据
  static meta = {
    id: 'week',
    name: '星期',
    description: '显示年进度、周进度和当前日期',
    icon: '📅',
    category: '时间',
    tags: ['时间', '进度', '日历'],
    recommendedSize: 2
  };

  // 卡片特有样式
  static styles = [
    BaseCard.styles,
    css`
      .week-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: var(--cf-spacing-lg);
        gap: var(--cf-spacing-lg);
      }

      .compact .week-card {
        padding: var(--cf-spacing-md);
        gap: var(--cf-spacing-md);
      }

      /* 年进度区域 */
      .year-section {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-lg);
        width: 100%;
        max-width: 300px;
      }

      .compact .year-section {
        gap: var(--cf-spacing-md);
        max-width: 250px;
      }

      .progress-ring {
        position: relative;
        width: 80px;
        height: 80px;
      }

      .compact .progress-ring {
        width: 60px;
        height: 60px;
      }

      .progress-ring svg {
        width: 100%;
        height: 100%;
      }

      .progress-bg {
        stroke: var(--cf-neutral-200);
        fill: none;
      }

      .progress-fill {
        fill: none;
        stroke-linecap: round;
        transition: stroke-dashoffset var(--cf-transition-slow);
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        text-align: center;
      }

      .compact .progress-text {
        font-size: var(--cf-font-size-md);
      }

      .progress-percent {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-secondary);
      }

      .date-info {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }

      .week-label {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-primary-color);
        line-height: 1.2;
      }

      .compact .week-label {
        font-size: var(--cf-font-size-md);
      }

      .month-day {
        font-size: var(--cf-font-size-md);
        color: var(--cf-text-secondary);
        line-height: 1.2;
      }

      .compact .month-day {
        font-size: var(--cf-font-size-sm);
      }

      /* 周进度区域 */
      .week-section {
        width: 100%;
        max-width: 300px;
      }

      .compact .week-section {
        max-width: 250px;
      }

      .progress-bars {
        display: flex;
        width: 100%;
        height: 24px;
        background: var(--cf-neutral-100);
        border-radius: var(--cf-radius-pill);
        overflow: hidden;
        margin-bottom: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        box-shadow: var(--cf-shadow-inner);
      }

      .compact .progress-bars {
        height: 20px;
        margin-bottom: var(--cf-spacing-xs);
      }

      .week-bar {
        flex: 1;
        height: 100%;
        transition: all var(--cf-transition-normal);
        border-right: 1px solid rgba(255, 255, 255, 0.3);
      }

      .week-bar:last-child {
        border-right: none;
      }

      .week-bar.past {
        background: var(--cf-neutral-300);
      }

      .week-bar.current {
        background: var(--cf-accent-color);
        box-shadow: 0 0 8px rgba(var(--cf-accent-color-rgb), 0.4);
        transform: scaleY(1.1);
        z-index: 1;
        position: relative;
      }

      .week-bar.future {
        background: var(--cf-primary-color);
      }

      .day-labels {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }

      .day-label {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-secondary);
        text-align: center;
        flex: 1;
      }

      .compact .day-label {
        font-size: var(--cf-font-size-xs);
      }

      .day-label.current {
        color: var(--cf-accent-color);
        font-weight: var(--cf-font-weight-bold);
      }

      .day-label.past {
        color: var(--cf-neutral-400);
      }

      .day-label.future {
        color: var(--cf-primary-color);
      }

      /* 空状态 */
      .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--cf-text-tertiary);
        text-align: center;
        gap: var(--cf-spacing-md);
      }

      .empty-icon {
        font-size: 2.5em;
        opacity: 0.5;
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 480px) {
        .week-card {
          padding: var(--cf-spacing-md);
          gap: var(--cf-spacing-md);
        }

        .year-section {
          flex-direction: column;
          gap: var(--cf-spacing-md);
          text-align: center;
        }

        .progress-ring {
          width: 70px;
          height: 70px;
        }

        .date-info {
          align-items: center;
        }
      }

      @container cardforge-container (max-width: 320px) {
        .week-card {
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }

        .progress-ring {
          width: 60px;
          height: 60px;
        }

        .progress-bars {
          height: 18px;
        }
      }
    `
  ];

  constructor() {
    super();
    this._currentDate = new Date();
  }

  /**
   * 处理卡片数据
   */
  async processCardData() {
    const { showYearProgress = true, showWeekProgress = true, compactMode = false } = this.config;
    
    if (!showYearProgress && !showWeekProgress) {
      return { isEmpty: true };
    }

    const yearProgress = getYearProgress(this._currentDate);
    const weekNumber = getWeekNumber(this._currentDate);
    const currentDay = this._currentDate.getDay(); // 0=周日, 1=周一...
    const month = this._currentDate.getMonth() + 1;
    const day = this._currentDate.getDate();

    // 构建周进度数据
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekData = weekDays.map((dayLabel, index) => {
      const isPast = index < currentDay;
      const isCurrent = index === currentDay;
      
      return {
        label: dayLabel,
        isPast,
        isCurrent,
        colorClass: isCurrent ? 'current' : (isPast ? 'past' : 'future')
      };
    });

    return {
      yearProgress,
      weekNumber,
      month,
      day,
      weekData,
      showYearProgress,
      showWeekProgress,
      compactMode,
      isEmpty: false
    };
  }

  /**
   * 渲染卡片内容
   */
  renderCardContent() {
    if (this.renderData?.isEmpty) {
      return html`
        <div class="empty-content">
          <div class="empty-icon">📅</div>
          <div>请开启年进度或周进度显示</div>
        </div>
      `;
    }

    const {
      yearProgress,
      weekNumber,
      month,
      day,
      weekData,
      showYearProgress,
      showWeekProgress,
      compactMode
    } = this.renderData;

    // 计算SVG进度环
    const size = compactMode ? 60 : 80;
    const strokeWidth = 4;
    const radius = (size / 2) - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - yearProgress / 100);

    return html`
      <div class="week-card ${compactMode ? 'compact' : ''}">
        ${showYearProgress ? html`
          <div class="year-section">
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
              </svg>
              <div class="progress-text">
                ${Math.round(yearProgress)}<span class="progress-percent">%</span>
              </div>
            </div>
            <div class="date-info">
              <div class="week-label">第 ${weekNumber} 周</div>
              <div class="month-day">${month}月${day}日</div>
            </div>
          </div>
        ` : ''}
        
        ${showWeekProgress ? html`
          <div class="week-section">
            <div class="progress-bars">
              ${weekData.map(day => html`
                <div class="week-bar ${day.colorClass}" 
                     title="${day.label}"></div>
              `)}
            </div>
            <div class="day-labels">
              ${weekData.map(day => html`
                <div class="day-label ${day.colorClass}">${day.label}</div>
              `)}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 获取卡片尺寸
   */
  getCardSize() {
    return this.config?.card_size || 2;
  }
}

// 注册卡片
if (!customElements.get('week-card')) {
  customElements.define('week-card', WeekCard);
}

// 导出卡片类供卡片系统使用
export default WeekCard;
