// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '时钟卡片',
    version: '1.1.0',
    description: '显示当前时间、日期和星期信息',
    category: '时间',
    icon: '🕒',
    author: 'CardForge',
    
    config_schema: {
      // 时间格式配置
      time_format: {
        type: 'select',
        label: '时间格式',
        options: ['24小时制', '12小时制'],
        default: '24小时制',
        description: '选择时间显示格式'
      },
      
      // 日期格式配置
      date_format: {
        type: 'select',
        label: '日期格式',
        options: ['完整日期', '短日期', '数字日期'],
        default: '完整日期',
        description: '选择日期显示格式'
      },
      
      // 显示选项
      show_seconds: {
        type: 'boolean',
        label: '显示秒数',
        default: false,
        description: '是否显示秒数'
      },
      
      show_weekday: {
        type: 'boolean',
        label: '显示星期',
        default: true,
        description: '是否显示星期信息'
      },
      
      // 布局配置
      layout: {
        type: 'select',
        label: '布局样式',
        options: ['compact', 'elegant', 'minimal'],
        default: 'elegant',
        description: '选择时钟显示布局'
      },
      
      // 样式配置
      text_size: {
        type: 'select',
        label: '文字大小',
        options: ['small', 'medium', 'large'],
        default: 'medium',
        description: '调整文字显示大小'
      }
    },
    
    entity_requirements: []
  };

  // 格式化时间显示
  _formatTimeDisplay(config, systemData) {
    const timeFormat = config.time_format || '24小时制';
    const showSeconds = config.show_seconds || false;
    
    let timeDisplay = systemData.time;
    
    if (timeFormat === '12小时制') {
      timeDisplay = systemData.time_12h;
    }
    
    if (showSeconds) {
      // 获取带秒数的时间
      const now = new Date();
      const seconds = String(now.getSeconds()).padStart(2, '0');
      timeDisplay = timeDisplay.replace(':', ':' + systemData.time.split(':')[1] + ':' + seconds);
    }
    
    return timeDisplay;
  }

  // 格式化日期显示
  _formatDateDisplay(config, systemData) {
    const dateFormat = config.date_format || '完整日期';
    
    switch (dateFormat) {
      case '短日期':
        return systemData.date_short;
      case '数字日期':
        return systemData.date_number;
      default:
        return systemData.date;
    }
  }

  // 获取布局类名
  _getLayoutClass(config) {
    const layout = config.layout || 'elegant';
    return `layout-${layout}`;
  }

  // 获取文字大小类名
  _getTextSizeClass(config) {
    const size = config.text_size || 'medium';
    return `text-${size}`;
  }

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    
    // 使用系统数据，不调用 _getCardValue 方法
    const timeDisplay = this._formatTimeDisplay(config, systemData);
    const dateDisplay = this._formatDateDisplay(config, systemData);
    const weekdayDisplay = systemData.weekday;
    
    const layoutClass = this._getLayoutClass(config);
    const textSizeClass = this._getTextSizeClass(config);
    const showWeekday = config.show_weekday !== false;

    return `
      <div class="cardforge-responsive-container clock-card ${layoutClass} ${textSizeClass}">
        <div class="cardforge-content-grid">
          <div class="cardforge-main-content">
            <div class="clock-display">
              <div class="time-primary">${this._renderSafeHTML(timeDisplay)}</div>
              ${showWeekday ? `
                <div class="date-weekday">
                  <span class="date">${this._renderSafeHTML(dateDisplay)}</span>
                  <span class="weekday">${this._renderSafeHTML(weekdayDisplay)}</span>
                </div>
              ` : `
                <div class="date-single">
                  ${this._renderSafeHTML(dateDisplay)}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const layoutClass = this._getLayoutClass(config);
    
    return `
      ${this.getBaseStyles(config)}
      
      .clock-card {
        text-align: center;
        padding: var(--cf-spacing-xl);
      }
      
      /* 紧凑布局 */
      .layout-compact .clock-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
      }
      
      .layout-compact .time-primary {
        font-size: 1.8em;
        font-weight: bold;
        font-variant-numeric: tabular-nums;
        color: var(--cf-text-primary);
      }
      
      .layout-compact .date-weekday {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .layout-compact .date {
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }
      
      .layout-compact .weekday {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
      }
      
      /* 优雅布局 */
      .layout-elegant .clock-display {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      
      .layout-elegant .time-primary {
        font-size: 2.5em;
        font-weight: 300;
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.5px;
        color: var(--cf-text-primary);
        line-height: 1;
      }
      
      .layout-elegant .date-weekday {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      
      .layout-elegant .date {
        font-size: 1.1em;
        color: var(--cf-text-primary);
      }
      
      .layout-elegant .weekday {
        font-size: 0.95em;
        color: var(--cf-text-secondary);
        font-weight: 500;
      }
      
      /* 极简布局 */
      .layout-minimal .clock-display {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-xs);
      }
      
      .layout-minimal .time-primary {
        font-size: 1.8em;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: var(--cf-text-primary);
      }
      
      .layout-minimal .date-weekday,
      .layout-minimal .date-single {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      /* 文字大小调整 */
      .text-small .time-primary {
        font-size: 1.5em !important;
      }
      
      .text-small .date {
        font-size: 0.9em !important;
      }
      
      .text-large .time-primary {
        font-size: 3em !important;
      }
      
      .text-large .date {
        font-size: 1.3em !important;
      }
      
      /* 主题特殊样式 */
      .theme-glass .clock-card {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      
      .theme-gradient .clock-card {
        color: white !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .theme-neon .clock-card {
        color: #00ff88 !important;
        text-shadow: 0 0 10px currentColor;
      }
      
      .theme-ink-wash .clock-card {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
        color: #ecf0f1 !important;
        border: 1px solid #7f8c8d !important;
      }
      
      /* 响应式优化 */
      @container cardforge-container (max-width: 400px) {
        .layout-compact .clock-display {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
        }
        
        .layout-elegant .time-primary {
          font-size: 2em !important;
        }
        
        .text-large .time-primary {
          font-size: 2.2em !important;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .clock-card {
          padding: var(--cf-spacing-md) !important;
        }
        
        .layout-elegant .time-primary {
          font-size: 1.8em !important;
        }
        
        .date-weekday {
          flex-direction: column !important;
        }
      }
      
      /* 动画效果 */
      .clock-card {
        transition: all 0.3s ease;
      }
      
      .time-primary {
        transition: transform 0.2s ease;
      }
      
      .clock-card:hover .time-primary {
        transform: scale(1.05);
      }
    `;
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;