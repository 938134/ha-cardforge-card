// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '时钟卡片',
    version: '1.0.0',
    description: '智能时钟显示，支持多种时间格式和主题',
    category: '时间',
    icon: '🕒',
    entityRequirements: [
      {
        key: 'time_format',
        description: '时间格式（12h/24h/auto）',
        required: false
      },
      {
        key: 'show_date',
        description: '是否显示日期',
        required: false
      },
      {
        key: 'show_seconds',
        description: '是否显示秒数',
        required: false
      },
      {
        key: 'custom_title',
        description: '自定义标题',
        required: false
      }
    ]
  };

  getTemplate(config, hass, entities) {
    // 使用系统变量获取时间数据
    const timeFormat = this._getCardValue(hass, entities, 'time_format', 'auto');
    const showDate = this._getCardValue(hass, entities, 'show_date', 'true');
    const showSeconds = this._getCardValue(hass, entities, 'show_seconds', 'false');
    const customTitle = this._getCardValue(hass, entities, 'custom_title', '');
    
    // 智能时间格式选择
    const displayTime = this._getDisplayTime(timeFormat, showSeconds);
    const displayDate = showDate === 'true' ? '$date' : '';
    const title = customTitle || '$greeting';

    return `
      <div class="cardforge-responsive-container layout-single-column clock-card">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-lg">
            <!-- 时间显示 -->
            <div class="clock-time-container cardforge-flex-column cardforge-flex-center cardforge-gap-sm">
              <div class="clock-time">${displayTime}</div>
              ${showDate === 'true' ? `
                <div class="clock-date">${displayDate}</div>
              ` : ''}
            </div>
            
            <!-- 底部信息 -->
            <div class="clock-footer cardforge-flex-row cardforge-flex-between cardforge-flex-center">
              <div class="clock-title">${title}</div>
              <div class="clock-weekday">$weekday_short</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      
      .clock-card {
        text-align: center;
        justify-content: center;
      }
      
      .clock-time-container {
        padding: var(--cf-spacing-md) 0;
      }
      
      .clock-time {
        font-size: 2.5em;
        font-weight: 700;
        color: var(--card-text, var(--cf-text-primary));
        font-variant-numeric: tabular-nums;
        line-height: 1.1;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        letter-spacing: -0.5px;
      }
      
      .clock-date {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
        font-weight: 500;
        margin-top: var(--cf-spacing-xs);
      }
      
      .clock-footer {
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid rgba(var(--cf-rgb-primary), 0.1);
        margin-top: var(--cf-spacing-sm);
      }
      
      .clock-title {
        font-size: var(--cf-text-sm);
        color: var(--cf-text-secondary);
        font-weight: 600;
      }
      
      .clock-weekday {
        font-size: var(--cf-text-sm);
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 500;
      }
      
      /* 主题特殊样式 */
      .theme-glass .clock-time {
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      .theme-gradient .clock-time {
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .theme-neon .clock-time {
        color: #00ff88;
        text-shadow: 
          0 0 10px #00ff88,
          0 0 20px rgba(0, 255, 136, 0.5);
      }
      
      .theme-ink-wash .clock-time {
        color: #ecf0f1;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      /* 响应式优化 */
      @container cardforge-container (min-width: 300px) {
        .clock-time {
          font-size: 2.2em;
        }
      }
      
      @container cardforge-container (min-width: 400px) {
        .clock-time {
          font-size: 2.8em;
        }
      }
      
      @media (max-width: 600px) {
        .clock-time {
          font-size: 2em;
        }
        
        .clock-date {
          font-size: 1em;
        }
        
        .clock-footer {
          padding-top: var(--cf-spacing-sm);
          margin-top: var(--cf-spacing-xs);
        }
      }
      
      @media (max-width: 400px) {
        .clock-time {
          font-size: 1.8em;
        }
        
        .clock-date {
          font-size: 0.9em;
        }
        
        .clock-title,
        .clock-weekday {
          font-size: var(--cf-text-xs);
        }
      }
      
      /* 动画效果 */
      @keyframes clock-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      
      .clock-time {
        animation: clock-pulse 2s ease-in-out infinite;
      }
    `;
  }

  // === 辅助方法 ===
  _getDisplayTime(timeFormat, showSeconds) {
    const showSec = showSeconds === 'true';
    
    switch (timeFormat) {
      case '12h':
        return showSec ? '$time_12h' : '$time_12h'.replace(/:\d{2}\s/, ' ');
      case '24h':
        return showSec ? '$time_24h' : '$time';
      case 'auto':
      default:
        // 根据系统偏好自动选择
        const is12Hour = Intl.DateTimeFormat().resolvedOptions().hour12;
        return is12Hour ? 
          (showSec ? '$time_12h' : '$time_12h'.replace(/:\d{2}\s/, ' ')) :
          (showSec ? '$time_24h' : '$time');
    }
  }
}

export default ClockCard;
export const manifest = ClockCard.manifest;