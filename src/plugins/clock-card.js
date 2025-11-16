// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '时钟卡片',
    version: '1.0.0',
    description: '简洁的时间显示，三行布局',
    category: '时间',
    icon: '🕒',
    entityRequirements: []  // 空数组，不需要关联实体
  };

  getTemplate(config, hass, entities) {
    // 直接从 config 获取配置，不需要关联实体
    const showSeconds = config.show_seconds || false;
    const timeFormat = config.time_format || 'auto';
    
    const displayTime = this._getDisplayTime(timeFormat, showSeconds);

    return `
      <div class="cardforge-responsive-container layout-single-column clock-card simple-layout">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-md">
            <!-- 第一行：时间 -->
            <div class="clock-time">${displayTime}</div>
            
            <!-- 第二行：日期 -->
            <div class="clock-date">$date</div>
            
            <!-- 第三行：星期 -->
            <div class="clock-weekday">$weekday</div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      ${this.getBaseStyles(config)}
      
      .clock-card.simple-layout {
        text-align: center;
        justify-content: center;
        min-height: 120px;
      }
      
      .clock-time {
        font-size: 2.2em;
        font-weight: 700;
        color: var(--card-text, var(--cf-text-primary));
        font-variant-numeric: tabular-nums;
        line-height: 1.1;
        margin: 0;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .clock-date {
        font-size: 1em;
        color: var(--cf-text-secondary);
        font-weight: 500;
        margin: 0;
        line-height: 1.2;
      }
      
      .clock-weekday {
        font-size: 1em;
        color: var(--cf-text-secondary);
        margin: 0;
        line-height: 1.2;
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
          0 0 20px rgba(0, 255, 136, 0.3);
      }
      
      .theme-ink-wash .clock-time {
        color: #ecf0f1;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .theme-ink-wash .clock-date,
      .theme-ink-wash .clock-weekday {
        color: #bdc3c7;
      }
      
      /* 响应式优化 */
      @container cardforge-container (min-width: 300px) {
        .clock-time {
          font-size: 2.4em;
        }
      }
      
      @container cardforge-container (min-width: 400px) {
        .clock-time {
          font-size: 2.6em;
        }
      }
      
      @media (max-width: 600px) {
        .clock-card.simple-layout {
          min-height: 100px;
          padding: var(--cf-spacing-md);
        }
        
        .clock-time {
          font-size: 1.8em;
        }
        
        .clock-date,
        .clock-weekday {
          font-size: 0.9em;
        }
      }
      
      @media (max-width: 400px) {
        .clock-card.simple-layout {
          min-height: 90px;
          padding: var(--cf-spacing-sm);
        }
        
        .clock-time {
          font-size: 1.6em;
        }
        
        .clock-date,
        .clock-weekday {
          font-size: 0.85em;
        }
      }
      
      /* 动画效果 */
      @keyframes time-update {
        0% { opacity: 0.9; transform: translateY(1px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .clock-time {
        animation: time-update 0.5s ease-in-out;
      }
    `;
  }

  // === 辅助方法 ===
  _getDisplayTime(timeFormat, showSeconds) {
    const showSec = showSeconds === true || showSeconds === 'true';
    
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