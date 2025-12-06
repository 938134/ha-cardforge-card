// cards/week-card.js - 简化版（移除重复深色模式）
import { createCardStyles } from '../core/card-styles.js';
import { getDateTimeInfo, escapeHtml } from '../core/card-tools.js';

export const card = {
  id: 'week',
  name: '星期卡片',
  description: '显示星期和年份进度',
  icon: '📅',
  
  meta: {
    version: '1.0',
    author: 'CardForge',
    category: '时间'
  },
  
  schema: {
    show_year_progress: {
      type: 'boolean',
      label: '显示年份进度',
      default: true,
      description: '是否显示年份进度环'
    },
    show_week_progress: {
      type: 'boolean',
      label: '显示周进度',
      default: true,
      description: '是否显示周进度指示器'
    }
  },
  
  blockType: 'none',
  
  template: (config, context) => {
    const { hass } = context || {};
    const date = new Date();
    const dateInfo = getDateTimeInfo(date);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const currentDay = date.getDay(); // 0=周日, 1=周一...
    
    // 生成星期HTML
    let weekHtml = '';
    for (let i = 0; i < 7; i++) {
      const isPast = i < currentDay;
      const isCurrent = i === currentDay;
      const isFuture = i > currentDay;
      
      let dayClass = 'weekday';
      if (isPast) dayClass += ' weekday-past';
      if (isCurrent) dayClass += ' weekday-current';
      if (isFuture) dayClass += ' weekday-future';
      
      weekHtml += `
        <div class="${dayClass}">
          <div class="weekday-number">${i + 1}</div>
          <div class="weekday-name">${weekdays[i]}</div>
        </div>
      `;
    }
    
    // 周进度圆点
    let weekDots = '';
    if (config.show_week_progress !== false) {
      weekDots = `
        <div class="week-progress-dots">
          ${Array(7).fill(0).map((_, i) => {
            const isPast = i < currentDay;
            const isCurrent = i === currentDay;
            let dotClass = 'week-dot';
            if (isPast) dotClass += ' week-dot-past';
            if (isCurrent) dotClass += ' week-dot-current';
            if (i > currentDay) dotClass += ' week-dot-future';
            return `<span class="${dotClass}"></span>`;
          }).join('')}
        </div>
      `;
    }
    
    // 年份进度环
    let yearProgressHtml = '';
    if (config.show_year_progress !== false) {
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      const progress = dateInfo.yearProgress;
      const strokeDashoffset = circumference - (progress / 100) * circumference;
      
      yearProgressHtml = `
        <div class="year-progress-wrapper">
          <svg class="year-progress-svg" width="100" height="100">
            <!-- 渐变定义 -->
            <defs>
              <linearGradient id="year-progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="var(--cf-primary-color)" />
                <stop offset="100%" stop-color="var(--cf-accent-color)" />
              </linearGradient>
            </defs>
            <circle 
              class="year-progress-bg" 
              cx="50" cy="50" r="${radius}" 
              fill="none" 
              stroke-width="6"
            />
            <circle 
              class="year-progress-fill" 
              cx="50" cy="50" r="${radius}" 
              fill="none" 
              stroke-width="6"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${strokeDashoffset}"
              transform="rotate(-90 50 50)"
              stroke="url(#year-progress-gradient)"
            />
            <text x="50" y="50" class="year-progress-text">
              ${Math.round(progress)}%
            </text>
          </svg>
          <div class="year-progress-info">
            <div class="year-progress-week">第 ${dateInfo.weekNumber} 周</div>
            <div class="year-progress-date">${dateInfo.date}</div>
          </div>
        </div>
      `;
    }
    
    // 获取用户名
    const userName = hass?.user?.name ? escapeHtml(hass.user.name) : '朋友';
    
    return `
      <div class="cardforge-container">
        <div class="card-wrapper">
          <div class="card-content">
            <!-- 星期展示 -->
            <div class="week-container">
              ${weekHtml}
            </div>
            
            <!-- 周进度指示器 -->
            ${weekDots}
            
            <!-- 年份进度环 -->
            ${yearProgressHtml}
            
            <!-- 问候语 -->
            <div class="card-caption">
              ${dateInfo.greeting}，${userName}
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  styles: (config, theme = {}) => createCardStyles(`
    /* 星期卡片特有样式 - 只定义颜色变量，深色模式由card-styles处理 */
    .week-container {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin: var(--cf-spacing-lg) 0;
      width: 100%;
      max-width: 400px;
    }
    
    .weekday {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 4px;
      border-radius: var(--cf-radius-md);
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    }
    
    .weekday:hover {
      transform: translateY(-2px);
    }
    
    /* 已过星期 */
    .weekday-past {
      color: var(--cf-neutral-400);
    }
    
    .weekday-past .weekday-number {
      color: var(--cf-text-tertiary);
    }
    
    .weekday-past .weekday-name {
      color: var(--cf-neutral-400);
    }
    
    /* 当下星期 */
    .weekday-current {
      background: rgba(var(--cf-accent-color-rgb), 0.15);
      color: var(--cf-accent-color);
      box-shadow: var(--cf-shadow-sm);
    }
    
    .weekday-current .weekday-number {
      font-weight: var(--cf-font-weight-bold);
      font-size: var(--cf-font-size-lg);
      color: var(--cf-accent-color);
    }
    
    .weekday-current .weekday-name {
      font-weight: var(--cf-font-weight-medium);
      color: var(--cf-accent-color);
    }
    
    /* 未来星期 */
    .weekday-future {
      color: var(--cf-primary-color);
    }
    
    .weekday-future .weekday-number {
      color: var(--cf-primary-color);
    }
    
    .weekday-future .weekday-name {
      color: var(--cf-text-secondary);
    }
    
    .weekday-number {
      font-size: var(--cf-font-size-lg);
      font-weight: var(--cf-font-weight-semibold);
      line-height: 1;
      margin-bottom: 2px;
    }
    
    .weekday-name {
      font-size: var(--cf-font-size-sm);
      font-weight: var(--cf-font-weight-medium);
    }
    
    /* 周进度圆点 */
    .week-progress-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin: var(--cf-spacing-md) 0;
    }
    
    .week-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
    }
    
    .week-dot-past {
      background: var(--cf-neutral-400);
    }
    
    .week-dot-current {
      background: var(--cf-accent-color);
      transform: scale(1.3);
      box-shadow: 0 0 0 2px rgba(var(--cf-accent-color-rgb), 0.2);
    }
    
    .week-dot-future {
      background: rgba(var(--cf-primary-color-rgb), 0.4);
    }
    
    /* 年份进度环 */
    .year-progress-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: var(--cf-spacing-lg);
      width: 100%;
    }
    
    .year-progress-svg {
      margin-bottom: var(--cf-spacing-sm);
    }
    
    .year-progress-bg {
      stroke: var(--cf-neutral-200);
    }
    
    .year-progress-fill {
      stroke-linecap: round;
      transition: stroke-dashoffset 1s var(--cf-easing-standard);
    }
    
    .year-progress-text {
      fill: var(--cf-text-primary);
      font-size: 14px;
      font-weight: var(--cf-font-weight-bold);
      text-anchor: middle;
      dominant-baseline: middle;
    }
    
    .year-progress-info {
      text-align: center;
    }
    
    .year-progress-week {
      font-size: var(--cf-font-size-lg);
      font-weight: var(--cf-font-weight-bold);
      color: var(--cf-text-primary);
      margin-bottom: 4px;
    }
    
    .year-progress-date {
      font-size: var(--cf-font-size-sm);
      color: var(--cf-text-secondary);
    }
    
    /* 响应式设计 */
    @container cardforge-container (max-width: 768px) {
      .week-container {
        gap: 6px;
      }
      
      .weekday {
        padding: 6px 3px;
      }
      
      .weekday-number {
        font-size: var(--cf-font-size-md);
      }
      
      .weekday-name {
        font-size: var(--cf-font-size-xs);
      }
      
      .weekday-current .weekday-number {
        font-size: var(--cf-font-size-md);
      }
      
      .year-progress-svg {
        width: 80px;
        height: 80px;
      }
      
      .year-progress-bg,
      .year-progress-fill {
        stroke-width: 5;
      }
      
      .year-progress-text {
        font-size: 12px;
      }
      
      .year-progress-week {
        font-size: var(--cf-font-size-md);
      }
      
      .year-progress-date {
        font-size: var(--cf-font-size-xs);
      }
    }
    
    @container cardforge-container (max-width: 480px) {
      .week-container {
        gap: 4px;
      }
      
      .weekday {
        padding: 4px 2px;
      }
      
      .weekday-number {
        font-size: var(--cf-font-size-sm);
      }
      
      .weekday-name {
        font-size: 0.7em;
      }
      
      .weekday-current .weekday-number {
        font-size: var(--cf-font-size-sm);
      }
      
      .week-dot {
        width: 5px;
        height: 5px;
      }
      
      .week-dot-current {
        transform: scale(1.2);
      }
      
      .year-progress-svg {
        width: 70px;
        height: 70px;
      }
      
      .year-progress-bg,
      .year-progress-fill {
        stroke-width: 4;
      }
      
      .year-progress-text {
        font-size: 11px;
      }
      
      .year-progress-week {
        font-size: var(--cf-font-size-sm);
      }
      
      .year-progress-date {
        font-size: 0.8em;
      }
    }
    
    @container cardforge-container (max-width: 360px) {
      .week-container {
        gap: 3px;
      }
      
      .weekday {
        padding: 3px 1px;
      }
      
      .weekday-number {
        font-size: 0.85em;
      }
      
      .weekday-name {
        font-size: 0.65em;
      }
    }
  `)
};