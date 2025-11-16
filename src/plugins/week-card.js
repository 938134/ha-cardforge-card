// src/plugins/week-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeekCard extends BasePlugin {
  static manifest = {
    id: 'week-card',
    name: '周进度卡片',
    version: '1.0.0',
    description: '显示当前周数和进度，突出星期信息',
    category: '时间',
    icon: '📅',
    author: 'CardForge',
    
    config_schema: {
      show_progress_circle: {
        type: 'boolean',
        label: '显示环形进度图',
        default: true,
        description: '是否显示环形进度图'
      },
      show_day_count: {
        type: 'boolean',
        label: '显示天数统计',
        default: true,
        description: '是否显示已过/剩余天数'
      },
      progress_style: {
        type: 'select',
        label: '进度图样式',
        options: ['circle', 'bar', 'simple'],
        default: 'circle',
        description: '选择进度显示样式'
      },
      compact_mode: {
        type: 'boolean',
        label: '紧凑模式',
        default: true,
        description: '启用更紧凑的布局'
      }
    },
    
    entity_requirements: []
  };

  // 计算周信息
  _calculateWeekInfo() {
    const now = new Date();
    
    // ISO周数计算
    const startDate = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
    
    // 周进度计算（精确到小时）
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // 周一为周开始
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekDuration = weekEnd - weekStart;
    const elapsed = now - weekStart;
    const progress = Math.min(Math.max((elapsed / weekDuration) * 100, 0), 100);
    
    // 天数统计
    const dayOfWeek = now.getDay();
    const daysPassed = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周一为0，周日为6
    const hoursInDay = now.getHours() + now.getMinutes() / 60;
    const exactDaysPassed = daysPassed + hoursInDay / 24;
    const daysRemaining = 7 - exactDaysPassed;
    
    return {
      weekNumber,
      progress: Math.round(progress),
      exactProgress: progress,
      exactDaysPassed,
      daysPassed: Math.floor(exactDaysPassed),
      daysRemaining: Math.round(daysRemaining * 10) / 10,
      dayOfWeek,
      weekday: '星期' + '日一二三四五六'[now.getDay()],
      weekday_short: '周' + '日一二三四五六'[now.getDay()],
      date: now.toLocaleDateString('zh-CN'),
      date_short: `${now.getMonth() + 1}月${now.getDate()}日`
    };
  }

  // 生成环形进度图SVG
  _generateProgressCircle(progress, radius = 36, strokeWidth = 6) {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return `
      <svg class="week-progress-circle" width="${radius * 2 + strokeWidth}" height="${radius * 2 + strokeWidth}">
        <circle
          class="progress-bg"
          cx="${radius + strokeWidth / 2}"
          cy="${radius + strokeWidth / 2}"
          r="${radius}"
          stroke-width="${strokeWidth}"
        />
        <circle
          class="progress-fill"
          cx="${radius + strokeWidth / 2}"
          cy="${radius + strokeWidth / 2}"
          r="${radius}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="${strokeDashoffset}"
          transform="rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})"
        />
        <text
          class="progress-text"
          x="${radius + strokeWidth / 2}"
          y="${radius + strokeWidth / 2 + 4}"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          ${progress}%
        </text>
      </svg>
    `;
  }

  // 生成进度条
  _generateProgressBar(progress) {
    return `
      <div class="week-progress-bar">
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="progress-text">${progress}%</div>
      </div>
    `;
  }

  getTemplate(config, hass, entities) {
    const weekInfo = this._calculateWeekInfo();
    const showCircle = config.show_progress_circle !== false;
    const showDayCount = config.show_day_count !== false;
    const progressStyle = config.progress_style || 'circle';
    const compactMode = config.compact_mode !== false;

    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn week-card ${compactMode ? 'compact' : ''}">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-sm">
            <!-- 顶部：周数和进度 -->
            <div class="week-header cardforge-flex-row cardforge-flex-center cardforge-gap-sm">
              <div class="week-icon">📅</div>
              <div class="week-title">
                第${weekInfo.weekNumber}周 · ${weekInfo.progress}%
              </div>
            </div>

            <!-- 中部：进度图 -->
            ${showCircle ? `
              <div class="week-progress-container cardforge-flex-center">
                ${progressStyle === 'circle' 
                  ? this._generateProgressCircle(weekInfo.progress)
                  : progressStyle === 'bar'
                  ? this._generateProgressBar(weekInfo.progress)
                  : `
                    <div class="week-progress-simple">
                      <div class="progress-number">${weekInfo.progress}%</div>
                    </div>
                  `
                }
              </div>
            ` : ''}

            <!-- 底部：日期和天数统计 -->
            <div class="week-footer cardforge-flex-column cardforge-flex-center cardforge-gap-xs">
              <div class="current-date">
                ${weekInfo.weekday_short} · ${weekInfo.date_short}
              </div>
              
              ${showDayCount ? `
                <div class="day-count">
                  ${weekInfo.exactDaysPassed.toFixed(1)}/${7}天 · ${weekInfo.daysRemaining.toFixed(1)}天剩余
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const progressStyle = config.progress_style || 'circle';
    
    return `
      ${this.getBaseStyles(config)}
      
      .week-card {
        text-align: center;
      }
      
      .week-card.compact {
        padding: var(--cf-spacing-md);
      }
      
      .week-card.compact .cardforge-content-area {
        gap: var(--cf-spacing-sm);
      }
      
      .week-header {
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .week-icon {
        font-size: 1.2em;
      }
      
      .week-title {
        ${this._cfTextSize('md')}
        ${this._cfFontWeight('bold')}
        ${this._cfColor('text')}
      }
      
      .week-progress-container {
        margin: var(--cf-spacing-sm) 0;
      }
      
      /* 环形进度图样式 */
      .week-progress-circle {
        display: block;
      }
      
      .week-progress-circle .progress-bg {
        fill: none;
        stroke: rgba(var(--cf-rgb-primary), 0.2);
      }
      
      .week-progress-circle .progress-fill {
        fill: none;
        stroke: var(--cf-primary-color);
        stroke-linecap: round;
        transition: stroke-dashoffset 0.5s ease;
      }
      
      .week-progress-circle .progress-text {
        ${this._cfTextSize('sm')}
        ${this._cfFontWeight('bold')}
        ${this._cfColor('text')}
        font-variant-numeric: tabular-nums;
      }
      
      /* 进度条样式 */
      .week-progress-bar {
        width: 100%;
        max-width: 200px;
      }
      
      .week-progress-bar .progress-track {
        width: 100%;
        height: 8px;
        background: rgba(var(--cf-rgb-primary), 0.2);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .week-progress-bar .progress-fill {
        height: 100%;
        background: var(--cf-primary-color);
        border-radius: 4px;
        transition: width 0.5s ease;
      }
      
      .week-progress-bar .progress-text {
        ${this._cfTextSize('sm')}
        ${this._cfFontWeight('bold')}
        ${this._cfColor('text')}
        font-variant-numeric: tabular-nums;
      }
      
      /* 简约进度样式 */
      .week-progress-simple .progress-number {
        ${this._cfTextSize('xl')}
        ${this._cfFontWeight('bold')}
        ${this._cfColor('primary')}
        font-variant-numeric: tabular-nums;
      }
      
      .week-footer {
        margin-top: var(--cf-spacing-xs);
      }
      
      .current-date {
        ${this._cfTextSize('sm')}
        ${this._cfColor('text')}
        font-weight: 500;
      }
      
      .day-count {
        ${this._cfTextSize('xs')}
        ${this._cfColor('text-secondary')}
        font-variant-numeric: tabular-nums;
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .week-progress-circle .progress-bg {
          stroke: rgba(255, 255, 255, 0.2);
        }
        
        .week-progress-bar .progress-track {
          background: rgba(255, 255, 255, 0.2);
        }
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .week-card.compact {
          padding: var(--cf-spacing-sm);
        }
        
        .week-title {
          ${this._cfTextSize('sm')}
        }
        
        .current-date {
          ${this._cfTextSize('xs')}
        }
        
        .day-count {
          ${this._cfTextSize('xxs')}
        }
        
        .week-progress-circle {
          transform: scale(0.9);
        }
      }
      
      @media (max-width: 400px) {
        .week-header {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
        
        .week-progress-circle {
          transform: scale(0.8);
        }
      }
      
      /* 主题特殊样式 */
      .theme-glass .week-progress-circle .progress-fill,
      .theme-glass .week-progress-bar .progress-fill {
        stroke: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.8);
      }
      
      .theme-gradient .week-progress-circle .progress-fill,
      .theme-gradient .week-progress-bar .progress-fill {
        stroke: #ffffff;
        background: #ffffff;
      }
      
      .theme-neon .week-progress-circle .progress-fill,
      .theme-neon .week-progress-bar .progress-fill {
        stroke: #00ff88;
        background: #00ff88;
        filter: drop-shadow(0 0 4px #00ff88);
      }
    `;
  }
}

export default WeekCard;
export const manifest = WeekCard.manifest;