// cards/week-card.js - 优化颜色版
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
      description: '是否显示年份进度条'
    },
    show_week_progress: {
      type: 'boolean',
      label: '显示周进度',
      default: true,
      description: '是否显示周进度指示器'
    }
  },
  
  blockType: 'none',
  
  template: (config, { hass }, { theme }) => {
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
    
    // 年份进度条
    let yearProgressHtml = '';
    if (config.show_year_progress !== false) {
      yearProgressHtml = `
        <div class="year-progress-container">
          <div class="year-progress-info">
            <span>${dateInfo.date}</span>
            <span class="year-progress-text">第 ${dateInfo.weekNumber} 周 · 已完成 ${dateInfo.yearProgress.toFixed(1)}%</span>
          </div>
          <div class="year-progress-bar">
            <div 
              class="year-progress-fill" 
              style="width: ${dateInfo.yearProgress}%"
            ></div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="cardforge-container">
        <div class="card-wrapper">
          <div class="card-content">
            <!-- 卡片标题 -->
            <div class="card-title">${dateInfo.weekday}</div>
            
            <!-- 星期展示 -->
            <div class="week-container">
              ${weekHtml}
            </div>
            
            <!-- 周进度指示器 -->
            ${weekDots}
            
            <!-- 年份进度 -->
            ${yearProgressHtml}
            
            <!-- 底部信息 -->
            <div class="card-caption">${dateInfo.greeting}，${escapeHtml(hass?.user?.name || '朋友')}</div>
          </div>
        </div>
      </div>
    `;
  },
  
  styles: (config, theme) => createCardStyles(`
    /* 星期卡片特有样式 */
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
    
    /* 年份进度条 */
    .year-progress-container {
      width: 100%;
      max-width: 300px;
      margin-top: var(--cf-spacing-lg);
    }
    
    .year-progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: var(--cf-font-size-sm);
    }
    
    .year-progress-info span:first-child {
      color: var(--cf-text-primary);
      font-weight: var(--cf-font-weight-medium);
    }
    
    .year-progress-text {
      color: var(--cf-text-tertiary);
    }
    
    .year-progress-bar {
      height: 6px;
      background: var(--cf-neutral-200);
      border-radius: var(--cf-radius-pill);
      overflow: hidden;
    }
    
    .year-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, 
        var(--cf-primary-color), 
        var(--cf-accent-color)
      );
      border-radius: var(--cf-radius-pill);
      transition: width 1s var(--cf-easing-standard);
    }
    
    /* 深色模式适配 */
    @media (prefers-color-scheme: dark) {
      .weekday-past {
        color: var(--cf-neutral-600);
      }
      
      .weekday-past .weekday-number {
        color: var(--cf-neutral-500);
      }
      
      .weekday-past .weekday-name {
        color: var(--cf-neutral-600);
      }
      
      .weekday-current {
        background: rgba(var(--cf-accent-color-rgb), 0.2);
      }
      
      .weekday-future .weekday-number {
        color: var(--cf-primary-color);
      }
      
      .weekday-future .weekday-name {
        color: var(--cf-neutral-400);
      }
      
      .week-dot-past {
        background: var(--cf-neutral-600);
      }
      
      .week-dot-future {
        background: rgba(var(--cf-primary-color-rgb), 0.6);
      }
      
      .year-progress-bar {
        background: var(--cf-neutral-700);
      }
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
      
      .year-progress-container {
        max-width: 250px;
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
      
      .year-progress-info {
        font-size: var(--cf-font-size-xs);
      }
      
      .year-progress-bar {
        height: 4px;
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