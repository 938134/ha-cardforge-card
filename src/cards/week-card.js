// cards/week-card.js - 星期卡片完整版
export const card = {
  id: 'week',
  meta: {
    name: '星期卡片',
    description: '显示当前周数、时间、星期和年度进度',
    icon: '📅'
  },
  
  schema: {
    show_week_number: {
      type: 'boolean',
      label: '显示周数',
      default: true
    },
    show_time: {
      type: 'boolean', 
      label: '显示时间',
      default: true
    },
    show_annual_progress: {
      type: 'boolean',
      label: '显示年度进度',
      default: true
    },
    use_24_hour: {
      type: 'boolean',
      label: '24小时制',
      default: true
    }
  },
  
  template: (config, { hass }) => {
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const currentTime = formatTime(now, config.use_24_hour);
    const weekday = now.getDay();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 年度进度计算
    const yearProgress = getYearProgress(now);
    
    // 生成星期HTML
    let weekdaysHtml = '';
    for (let i = 0; i < 7; i++) {
      const dayIndex = i; // 0=周日, 1=周一, ..., 6=周六
      const isToday = dayIndex === weekday;
      const isPast = i < weekday;
      const isFuture = i > weekday;
      
      let dayClass = 'weekday';
      if (isToday) {
        dayClass += ' today';
      } else if (isPast) {
        dayClass += ' past';
      } else {
        dayClass += ' future';
      }
      
      weekdaysHtml += `
        <div class="${dayClass}">
          ${weekdays[dayIndex]}
        </div>
      `;
    }
    
    return `
      <div class="week-card">
        <!-- 周数和时间区域 -->
        ${config.show_week_number ? `
          <div class="week-number">第${weekNumber}周</div>
        ` : ''}
        
        ${config.show_time ? `
          <div class="current-time">${currentTime}</div>
        ` : ''}
        
        <!-- 星期区域 -->
        <div class="weekdays-container">
          ${weekdaysHtml}
        </div>
        
        <!-- 年度进度环 -->
        ${config.show_annual_progress ? `
          <div class="annual-progress">
            <div class="progress-ring">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path class="circle"
                  stroke-dasharray="${yearProgress}, 100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="progress-text">
                <span class="progress-percent">${Math.round(yearProgress)}%</span>
                <span class="progress-label">年度进度</span>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  styles: (config) => `
    .week-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      height: 100%;
      min-height: 300px;
    }
    
    /* 周数样式 */
    .week-number {
      font-size: 14px;
      color: #6B7280;
      font-weight: 500;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    
    /* 当前时间样式 */
    .current-time {
      font-size: 32px;
      font-weight: 700;
      color: #3B82F6;
      margin-bottom: 24px;
      text-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
    }
    
    /* 星期容器 */
    .weekdays-container {
      display: flex;
      justify-content: space-between;
      width: 100%;
      max-width: 320px;
      margin: 0 auto 24px;
      padding: 0 10px;
    }
    
    /* 单个星期样式 */
    .weekday {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: default;
    }
    
    /* 已过日期 - 浅灰色，70%透明度 */
    .weekday.past {
      color: #9CA3AF;
      opacity: 0.7;
    }
    
    /* 今天日期 - 橙色背景，白色文字 */
    .weekday.today {
      background: linear-gradient(135deg, #F59E0B, #F97316);
      color: #FFFFFF;
      box-shadow: 
        0 4px 12px rgba(245, 158, 11, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
      position: relative;
      z-index: 2;
    }
    
    /* 今天日期发光效果 */
    .weekday.today::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(249, 115, 22, 0.3));
      z-index: -1;
      animation: pulse 2s infinite;
    }
    
    /* 未来日期 - 深蓝色，90%透明度 */
    .weekday.future {
      color: #1E40AF;
      opacity: 0.9;
    }
    
    /* 年度进度环样式 */
    .annual-progress {
      margin-top: 20px;
    }
    
    .progress-ring {
      position: relative;
      width: 120px;
      height: 120px;
    }
    
    .circular-chart {
      display: block;
      width: 120px;
      height: 120px;
    }
    
    .circle-bg {
      fill: none;
      stroke: #E5E7EB;
      stroke-width: 2.8;
    }
    
    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      stroke: url(#progress-gradient);
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
      transition: stroke-dasharray 0.8s ease;
    }
    
    /* 进度渐变 */
    .circular-chart defs {
      height: 0;
    }
    
    .circular-chart defs linearGradient {
      height: 100%;
    }
    
    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
    
    .progress-percent {
      display: block;
      font-size: 20px;
      font-weight: 700;
      color: #374151;
      line-height: 1.2;
    }
    
    .progress-label {
      display: block;
      font-size: 12px;
      color: #6B7280;
      margin-top: 2px;
    }
    
    /* 动画 */
    @keyframes pulse {
      0%, 100% {
        opacity: 0.6;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
    }
    
    /* 响应式设计 */
    @container cardforge-container (max-width: 768px) {
      .week-card {
        padding: 16px;
        min-height: 260px;
      }
      
      .current-time {
        font-size: 28px;
        margin-bottom: 20px;
      }
      
      .weekdays-container {
        max-width: 280px;
      }
      
      .weekday {
        width: 36px;
        height: 36px;
        font-size: 15px;
      }
      
      .progress-ring {
        width: 100px;
        height: 100px;
      }
      
      .circular-chart {
        width: 100px;
        height: 100px;
      }
      
      .progress-percent {
        font-size: 18px;
      }
    }
    
    @container cardforge-container (max-width: 480px) {
      .week-card {
        padding: 12px;
        min-height: 240px;
      }
      
      .current-time {
        font-size: 24px;
        margin-bottom: 16px;
      }
      
      .weekdays-container {
        max-width: 240px;
      }
      
      .weekday {
        width: 32px;
        height: 32px;
        font-size: 14px;
        border-radius: 6px;
      }
      
      .weekday.today {
        transform: scale(1.05);
      }
      
      .progress-ring {
        width: 90px;
        height: 90px;
      }
      
      .circular-chart {
        width: 90px;
        height: 90px;
      }
      
      .progress-percent {
        font-size: 16px;
      }
      
      .progress-label {
        font-size: 11px;
      }
    }
    
    /* 深色模式适配 */
    @media (prefers-color-scheme: dark) {
      .week-number {
        color: #9CA3AF;
      }
      
      .current-time {
        color: #60A5FA;
        text-shadow: 0 2px 8px rgba(96, 165, 250, 0.3);
      }
      
      .weekday.past {
        color: #6B7280;
        opacity: 0.6;
      }
      
      .weekday.today {
        background: linear-gradient(135deg, #F59E0B, #EA580C);
        box-shadow: 
          0 4px 16px rgba(245, 158, 11, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
      
      .weekday.future {
        color: #93C5FD;
        opacity: 0.9;
      }
      
      .circle-bg {
        stroke: #4B5563;
      }
      
      .progress-percent {
        color: #E5E7EB;
      }
      
      .progress-label {
        color: #9CA3AF;
      }
      
      /* 深色模式下的SVG渐变 */
      .circular-chart {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }
    }
    
    /* SVG渐变定义 - 必须放在样式末尾 */
    <svg style="display: none;">
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3B82F6" />
          <stop offset="50%" stop-color="#8B5CF6" />
          <stop offset="100%" stop-color="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  `,
  
  // 卡片布局建议
  layout: {
    recommendedSize: 4, // 推荐卡片大小
    aspectRatio: '1:1.2', // 宽高比建议
    resizable: true
  }
};

// 辅助函数
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function formatTime(date, use24Hour = true) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (use24Hour) {
    return hours.toString().padStart(2, '0') + ':' + minutes;
  } else {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return hours + ':' + minutes + ' ' + ampm;
  }
}

function getYearProgress(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear() + 1, 0, 1);
  const elapsed = date - start;
  const total = end - start;
  return (elapsed / total) * 100;
}