// src/cards/week-card.js - 完全通用增强版
export const card = {
  id: 'week',
  meta: {
    name: '星期',
    description: '显示年进度和周进度',
    icon: '📅',
    category: '时间',
    version: '2.2.0',
    author: 'CardForge'
  },
  
  schema: {
    showYearProgress: {
      type: 'boolean',
      label: '显示年进度',
      default: true
    },
    showWeekProgress: {
      type: 'boolean',
      label: '显示周进度',
      default: true
    }
  },
  
  template: (config) => {
    const now = new Date();
    const yearProgress = calculateYearProgress(now);
    const weekNumber = getWeekNumber(now);
    const weekDay = now.getDay();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 获取当前日期
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    let template = '<div class="week-card">';
    
    // 年进度
    if (config.showYearProgress) {
      const dashOffset = 163.36 * (1 - yearProgress / 100);
      template += `
        <div class="year-progress-container">
          <div class="year-progress-ring">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" class="progress-bg" />
              <circle cx="40" cy="40" r="34" class="progress-fill"
                      stroke-dasharray="213.63"
                      stroke-dashoffset="${dashOffset * 2.1363}"
                      transform="rotate(-90 40 40)"/>
              <text x="40" y="46" text-anchor="middle" font-size="18" font-weight="700" class="progress-text">
                ${Math.round(yearProgress)}
              </text>
            </svg>
          </div>
          <div class="year-info">
            <div class="week-number">第 ${weekNumber} 周</div>
            <div class="current-date">${month}月${day}日</div>
          </div>
        </div>
      `;
    }
    
    // 周进度
    if (config.showWeekProgress) {
      let weekBars = '';
      for (let i = 0; i < 7; i++) {
        const isActive = i < weekDay;
        const isCurrent = i === weekDay;
        let barClass = 'future';
        if (isCurrent) barClass = 'current';
        else if (isActive) barClass = 'active';
        
        weekBars += `<div class="week-bar ${barClass}"></div>`;
      }
      
      template += `
        <div class="week-progress">
          <div class="progress-bars">${weekBars}</div>
          <div class="day-labels">
            ${weekDays.map((day, index) => {
              const isWeekend = index === 0 || index === 6;
              return `<div class="day-label ${isWeekend ? 'weekend' : ''}">${day}</div>`;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    template += '</div>';
    return template;
    
    // 工具函数
    function calculateYearProgress(date) {
      const start = new Date(date.getFullYear(), 0, 1);
      const end = new Date(date.getFullYear() + 1, 0, 1);
      const elapsed = date - start;
      const total = end - start;
      return (elapsed / total) * 100;
    }
    
    function getWeekNumber(date) {
      const firstDay = new Date(date.getFullYear(), 0, 1);
      const pastDays = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
      return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    }
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    const accentColor = theme['--cf-accent-color'] || '#ff4081';
    const borderColor = theme['--cf-border'] || '#e0e0e0';
    const backgroundColor = theme['--cf-background'] || '#ffffff';
    const textPrimary = theme['--cf-text-primary'] || '#212121';
    const textSecondary = theme['--cf-text-secondary'] || '#757575';
    
    // 使用CSS原生颜色混合函数
    // color-mix() 支持所有现代浏览器
    const getContrastColor = (color) => {
      // 使用更智能的对比度计算
      // 如果主题色是浅色，则混合黑色增加对比度
      // 如果主题色是深色，则混合白色增加对比度
      // 使用20%的混合比例确保足够对比度
      return `color-mix(in srgb, ${color}, ${textPrimary} 20%)`;
    };
    
    const getBackgroundContrast = () => {
      // 进度条背景：使用背景色和边框色的混合
      return `color-mix(in srgb, ${backgroundColor}, ${borderColor} 15%)`;
    };
    
    return `
      .week-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;
        height: 100%;
        min-height: 180px;
        padding: 24px;
      }
      
      .year-progress-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 32px;
        width: 100%;
        max-width: 320px;
      }
      
      .year-progress-ring {
        flex-shrink: 0;
      }
      
      .year-progress-ring svg {
        display: block;
      }
      
      .year-progress-ring svg text {
        font-family: inherit;
      }
      
      /* 进度环使用原生颜色混合确保对比度 */
      .progress-bg {
        stroke: ${borderColor};
        stroke-width: 4;
        fill: none;
      }
      
      .progress-fill {
        stroke: ${getContrastColor(primaryColor)};
        stroke-width: 4;
        fill: none;
        stroke-linecap: round;
      }
      
      .progress-text {
        fill: ${getContrastColor(primaryColor)};
      }
      
      /* 年信息区域 */
      .year-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 80px;
        min-width: 100px;
      }
      
      .week-number {
        font-size: 1.8em;
        font-weight: 700;
        color: ${textPrimary};
        line-height: 1.2;
        margin-bottom: 8px;
        white-space: nowrap;
      }
      
      .current-date {
        font-size: 1.3em;
        font-weight: 500;
        color: ${textSecondary};
        line-height: 1.2;
        white-space: nowrap;
      }
      
      /* ========== 通用周进度条增强 ========== */
      .week-progress {
        width: 100%;
        max-width: 320px;
      }
      
      /* 进度条容器 - 通用增强 */
      .progress-bars {
        display: flex;
        width: 100%;
        height: 18px;
        background: ${getBackgroundContrast()};
        border-radius: 9px;
        overflow: hidden;
        margin-bottom: 14px;
        border: 1px solid ${borderColor};
        
        /* 通用内阴影，无论深浅背景都适用 */
        box-shadow: 
          inset 0 1px 3px 
            color-mix(in srgb, ${textPrimary} 10%, transparent),
          0 1px 0 
            color-mix(in srgb, ${backgroundColor} 90%, white 10%);
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        position: relative;
        
        /* 分隔线使用背景色混合边框色 */
        border-right: 1px solid 
          color-mix(in srgb, ${backgroundColor}, ${borderColor} 30%);
        box-sizing: border-box;
      }
      
      .week-bar:last-child {
        border-right: none;
      }
      
      /* 已完成状态 - 通用增强 */
      .week-bar.active {
        background: ${getContrastColor(primaryColor)};
        position: relative;
      }
      
      /* 通用斜纹纹理 - 使用半透明白色/黑色确保任何背景都可见 */
      .week-bar.active::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 4px,
          rgba(255, 255, 255, 0.2) 4px,
          rgba(255, 255, 255, 0.2) 8px
        );
        mix-blend-mode: overlay; /* 使用混合模式适应背景 */
        pointer-events: none;
        opacity: 0.6;
      }
      
      /* 当前日状态 - 通用特别强化 */
      .week-bar.current {
        background: ${getContrastColor(accentColor)};
        position: relative;
        z-index: 2;
      }
      
      /* 当前日的立体效果 - 使用渐变确保可见性 */
      .week-bar.current::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.3) 0%,
          rgba(255, 255, 255, 0.1) 40%,
          transparent 70%,
          rgba(0, 0, 0, 0.1) 100%
        );
        border-radius: inherit;
        pointer-events: none;
      }
      
      /* 当前日的边框和阴影 - 通用方案 */
      .week-bar.current {
        border: 1px solid 
          color-mix(in srgb, ${accentColor}, ${textPrimary} 30%);
        box-shadow: 
          0 1px 3px 
            color-mix(in srgb, ${textPrimary} 15%, transparent),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
        margin: -1px; /* 补偿边框宽度 */
      }
      
      /* 未完成状态 - 通用 */
      .week-bar.future {
        background: ${getBackgroundContrast()};
      }
      
      /* 未完成状态的微纹理 - 通用 */
      .week-bar.future::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
          90deg,
          transparent,
          transparent 3px,
          color-mix(in srgb, ${textPrimary} 5%, transparent) 3px,
          color-mix(in srgb, ${textPrimary} 5%, transparent) 6px
        );
        pointer-events: none;
        opacity: 0.5;
      }
      
      /* 日标签 */
      .day-labels {
        display: flex;
        justify-content: space-between;
      }
      
      .day-label {
        font-size: 0.95em;
        font-weight: 500;
        color: ${textSecondary};
        text-align: center;
        flex: 1;
      }
      
      .day-label.weekend {
        color: ${getContrastColor(accentColor)};
        font-weight: 600;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 500px) {
        .week-card {
          gap: 20px;
          padding: 20px;
        }
        
        .year-progress-container {
          gap: 24px;
          max-width: 280px;
        }
        
        .year-progress-ring svg {
          width: 70px;
          height: 70px;
        }
        
        .week-number {
          font-size: 1.6em;
        }
        
        .current-date {
          font-size: 1.2em;
        }
        
        .progress-bars {
          height: 16px;
          margin-bottom: 12px;
        }
        
        .week-progress {
          max-width: 280px;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .week-card {
          gap: 18px;
          padding: 16px;
        }
        
        .year-progress-container {
          gap: 20px;
          max-width: 260px;
          flex-direction: column;
          text-align: center;
        }
        
        .year-info {
          align-items: center;
          height: auto;
          min-width: auto;
          padding: 8px 0;
        }
        
        .year-progress-ring svg {
          width: 65px;
          height: 65px;
        }
        
        .week-number {
          font-size: 1.5em;
          margin-bottom: 6px;
        }
        
        .current-date {
          font-size: 1.1em;
        }
        
        .progress-bars {
          height: 14px;
          margin-bottom: 10px;
        }
        
        .week-progress {
          max-width: 260px;
        }
        
        .day-label {
          font-size: 0.9em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .week-card {
          gap: 16px;
          padding: 14px;
        }
        
        .year-progress-container {
          gap: 16px;
          max-width: 240px;
        }
        
        .year-progress-ring svg {
          width: 60px;
          height: 60px;
        }
        
        .week-number {
          font-size: 1.4em;
          margin-bottom: 4px;
        }
        
        .current-date {
          font-size: 1em;
        }
        
        .progress-bars {
          height: 12px;
          border-radius: 6px;
        }
        
        .week-progress {
          max-width: 240px;
        }
        
        .day-label {
          font-size: 0.85em;
        }
      }
      
      /* 通用对比度检测增强 */
      /* 使用CSS滤镜提高低对比度情况下的可见性 */
      @media (prefers-contrast: more) {
        .week-bar.active {
          filter: brightness(1.1) saturate(1.2);
        }
        
        .week-bar.current {
          filter: brightness(1.15) saturate(1.3);
          border-width: 2px;
        }
        
        .progress-bars {
          border-width: 2px;
        }
      }
      
      /* 强制高对比度模式 */
      @media (prefers-contrast: high) {
        .week-bar.active {
          background: ${textPrimary};
        }
        
        .week-bar.current {
          background: ${accentColor};
          border: 2px solid ${textPrimary};
        }
        
        .week-bar.active::after,
        .week-bar.future::after {
          display: none; /* 高对比度模式下移除纹理 */
        }
      }
      
      /* 使用CSS变量提供主题自适应的回退方案 */
      /* 如果浏览器不支持color-mix，使用这些回退 */
      .progress-bars {
        --week-progress-bg: ${backgroundColor};
        --week-progress-border: ${borderColor};
      }
      
      @supports not (color: color-mix(in srgb, #000, #fff)) {
        .progress-bars {
          background: var(--week-progress-bg);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .week-bar.current {
          border: 2px solid ${accentColor};
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
      }
    `;
  }
};