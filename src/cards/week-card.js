// src/cards/week-card.js
import { BaseCard } from '../core/base-card.js';

// 统一的配置定义
const CARD_CONFIG = {
  id: 'week-card',
  name: '星期卡片',
  description: '显示年进度和周进度，突出显示当前星期',
  icon: '📅',
  category: '时间',
  version: '1.0.0',
  author: 'CardForge',
  config_schema: {
    show_year_progress: {
      type: 'boolean',
      label: '显示年进度',
      default: true
    },
    show_week_progress: {
      type: 'boolean',
      label: '显示周进度',
      default: true
    },
    ring_color: {
      type: 'color',
      label: '环颜色',
      options: [
        { value: 'blue', label: '蓝色' },
        { value: 'red', label: '红色' },
        { value: 'green', label: '绿色' },
        { value: 'yellow', label: '黄色' },
        { value: 'purple', label: '紫色' }
      ],
      default: 'blue'
    },
    font_size: {
      type: 'select',
      label: '字体大小',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    }
  }
};

export class WeekCard extends BaseCard {
  getDefaultConfig() {
    // 从config_schema生成默认配置
    const defaultConfig = {};
    Object.entries(CARD_CONFIG.config_schema).forEach(([key, field]) => {
      defaultConfig[key] = field.default !== undefined ? field.default : '';
    });

    return {
      card_type: CARD_CONFIG.id,
      theme: 'auto',
      ...defaultConfig,
      areas: {
        content: {
          layout: 'single',
          blocks: ['week_display']
        }
      },
      blocks: {
        week_display: {
          type: 'week_display',
          area: 'content',
          entity: '',
          content: ''
        }
      }
    };
  }

  getManifest() {
    return CARD_CONFIG;
  }

  // 重写渲染方法，添加动态内容
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    
    // 创建配置的深拷贝，避免修改原始配置
    const dynamicConfig = JSON.parse(JSON.stringify(safeConfig));
    
    // 生成动态内容
    dynamicConfig.blocks.week_display.content = this._generateWeekContent(dynamicConfig);
    
    return super.render(dynamicConfig, hass, entities);
  }

  _generateWeekContent(config) {
    const now = new Date();
    const elements = [];
    
    // 年进度环
    if (config.show_year_progress) {
      elements.push(this._renderYearProgress(now, config));
    }
    
    // 周进度条
    if (config.show_week_progress) {
      elements.push(this._renderWeekProgress(now, config));
    }
    
    return elements.join('');
  }

  _renderYearProgress(date, config) {
    const yearProgress = this._getYearProgress(date);
    const weekNumber = this._getWeekNumber(date);
    const dateStr = this._formatDate(date);
    
    const colorMap = {
      blue: '#4285f4',
      red: '#ea4335',
      green: '#34a853',
      yellow: '#fbbc05',
      purple: '#a142f4'
    };
    
    const ringColor = colorMap[config.ring_color] || config.ring_color;
    
    return `
      <div class="year-progress">
        <div class="progress-ring">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <!-- 背景环 -->
            <circle cx="60" cy="60" r="54" stroke="#e0e0e0" stroke-width="8" fill="none"/>
            <!-- 进度环 -->
            <circle cx="60" cy="60" r="54" stroke="${ringColor}" stroke-width="8" 
                    fill="none" stroke-linecap="round"
                    stroke-dasharray="${2 * Math.PI * 54}" 
                    stroke-dashoffset="${2 * Math.PI * 54 * (1 - yearProgress / 100)}"
                    transform="rotate(-90 60 60)"/>
          </svg>
          <div class="ring-content">
            <div class="week-number">第 ${weekNumber} 周</div>
            <div class="current-date">${dateStr}</div>
          </div>
        </div>
        <div class="year-percent">${Math.round(yearProgress)}%</div>
      </div>
    `;
  }

  _renderWeekProgress(date, config) {
    const weekDay = date.getDay(); // 0-6, 0=周日
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    const currentDayName = weekDayNames[weekDay];
    const weekProgress = (weekDay === 0 ? 7 : weekDay) / 7 * 100; // 周一到周日为完整一周
    
    let weekBars = '';
    let dayLabels = '';
    let indicatorPosition = '';
    
    // 生成星期进度条和标签
    for (let i = 0; i < 7; i++) {
      const isActive = i < (weekDay === 0 ? 6 : weekDay - 1); // 已过天数
      const isCurrent = i === (weekDay === 0 ? 6 : weekDay - 1); // 当前天
      
      weekBars += `<div class="week-bar ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}"></div>`;
      dayLabels += `<div class="day-label">${weekDays[i]}</div>`;
      
      if (isCurrent) {
        indicatorPosition = `left: ${(i * 14.2857) + 7.14285}%`; // 计算箭头位置
      }
    }
    
    return `
      <div class="week-progress">
        <div class="progress-bar">
          ${weekBars}
        </div>
        <div class="day-labels">
          ${dayLabels}
        </div>
        <div class="current-indicator" style="${indicatorPosition}">
          <div class="indicator-arrow"></div>
          <div class="current-day">${currentDayName}</div>
        </div>
      </div>
    `;
  }

  _getYearProgress(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const elapsed = date - start;
    const total = end - start;
    return (elapsed / total) * 100;
  }

  _getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
  }

  _formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }

  _renderBlock(blockId, blockConfig, hass, entities) {
    // 星期显示块特殊处理
    if (blockConfig.type === 'week_display') {
      const content = this._getBlockContent(blockConfig, hass);
      if (!content) return '';
      
      return `<div class="week-display">${content}</div>`;
    }
    
    return super._renderBlock(blockId, blockConfig, hass, entities);
  }

  _getBlockContent(blockConfig, hass) {
    // 优先从实体获取内容
    if (blockConfig.entity && hass?.states?.[blockConfig.entity]) {
      const entity = hass.states[blockConfig.entity];
      return entity.state || '';
    }
    
    // 回退到静态内容
    return blockConfig.content || '';
  }

  _escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  _renderStyles(config, themeStyles) {
    const safeConfig = config || {};
    const font_size = safeConfig.font_size || CARD_CONFIG.config_schema.font_size.default;
    
    const fontSizeMap = {
      small: { ring: '0.8em', percent: '0.9em', day: '0.8em' },
      medium: { ring: '0.9em', percent: '1em', day: '0.9em' },
      large: { ring: '1em', percent: '1.1em', day: '1em' }
    };
    
    const selectedSize = fontSizeMap[font_size] || fontSizeMap.medium;

    return `
      .cardforge-card {
        ${themeStyles}
      }
      
      /* 星期显示区域 */
      .cardforge-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 160px;
        padding: var(--cf-spacing-lg);
        gap: 20px;
      }
      
      .week-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        width: 100%;
      }
      
      /* 年进度环样式 */
      .year-progress {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
      }
      
      .progress-ring {
        position: relative;
        width: 120px;
        height: 120px;
      }
      
      .ring-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        width: 100%;
      }
      
      .week-number {
        font-size: ${selectedSize.ring};
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .current-date {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
      }
      
      .year-percent {
        font-size: ${selectedSize.percent};
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      /* 周进度条样式 */
      .week-progress {
        width: 100%;
        max-width: 300px;
        position: relative;
      }
      
      .progress-bar {
        display: flex;
        width: 100%;
        height: 12px;
        background: #e0e0e0;
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 8px;
      }
      
      .week-bar {
        flex: 1;
        height: 100%;
        background: #e0e0e0;
        transition: background-color 0.3s ease;
      }
      
      .week-bar.active {
        background: var(--cf-primary-color);
      }
      
      .week-bar.current {
        background: var(--cf-accent-color);
      }
      
      .day-labels {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 20px;
      }
      
      .day-label {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        text-align: center;
        flex: 1;
      }
      
      .current-indicator {
        position: absolute;
        top: 100%;
        transform: translateX(-50%);
        text-align: center;
      }
      
      .indicator-arrow {
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid var(--cf-accent-color);
        margin: 0 auto 4px;
      }
      
      .current-day {
        font-size: ${selectedSize.day};
        font-weight: 600;
        color: var(--cf-accent-color);
        white-space: nowrap;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .cardforge-area {
          min-height: 140px;
          padding: var(--cf-spacing-md);
          gap: 16px;
        }
        
        .week-display {
          gap: 16px;
        }
        
        .progress-ring {
          width: 100px;
          height: 100px;
        }
        
        .week-number {
          font-size: ${font_size === 'large' ? '0.9em' : 
                      font_size === 'medium' ? '0.8em' : '0.7em'};
        }
        
        .current-date {
          font-size: 0.7em;
        }
        
        .year-percent {
          font-size: ${font_size === 'large' ? '1em' : 
                      font_size === 'medium' ? '0.9em' : '0.8em'};
        }
      }
    `;
  }
}

// 导出统一的manifest
export const manifest = CARD_CONFIG;

export default WeekCard;