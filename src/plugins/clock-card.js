// src/plugins/clock-card.js
import { BasePlugin } from '../core/base-plugin.js';

class ClockCard extends BasePlugin {
  static manifest = {
    id: 'clock-card',
    name: '时钟卡片',
    version: '1.0.0',
    description: '显示当前时间和日期',
    category: '时间',
    icon: '🕒',
    author: 'CardForge',
    
    config_schema: {
      show_date: {
        type: 'boolean',
        label: '显示日期',
        default: true,
        description: '显示日期信息'
      },
      show_weekday: {
        type: 'boolean',
        label: '显示星期',
        default: true,
        description: '显示星期信息'
      }
    },
    
    entity_requirements: []
  };

  // 确保 manifest 作为实例属性也可访问
  get manifest() {
    return ClockCard.manifest;
  }

  getTemplate(config, hass, entities) {
    // 添加配置默认值处理
    const safeConfig = config || {};
    const now = new Date();
    
    // 格式化时间
    const time = now.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    // 格式化日期
    const date = now.toLocaleDateString('zh-CN');
    const weekday = '星期' + '日一二三四五六'[now.getDay()];
    
    const showDate = safeConfig.show_date !== false;
    const showWeekday = safeConfig.show_weekday !== false;

    return `
      <div class="clock-card">
        <div class="time">${time}</div>
        ${showDate || showWeekday ? `
          <div class="date-info">
            ${showDate ? `<span class="date">${date}</span>` : ''}
            ${showDate && showWeekday ? ' · ' : ''}
            ${showWeekday ? `<span class="weekday">${weekday}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  getStyles(config) {
    return `
      .clock-card {
        padding: 20px;
        text-align: center;
        background: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #000000);
        border-radius: 12px;
        border: 1px solid var(--divider-color, #e0e0e0);
      }
      
      .time {
        font-size: 2.5em;
        font-weight: 300;
        margin-bottom: 8px;
        font-variant-numeric: tabular-nums;
      }
      
      .date-info {
        font-size: 1em;
        color: var(--secondary-text-color, #666666);
      }
      
      .date, .weekday {
        font-weight: 500;
      }
      
      @media (max-width: 600px) {
        .clock-card {
          padding: 16px;
        }
        
        .time {
          font-size: 2em;
        }
        
        .date-info {
          font-size: 0.9em;
        }
      }
    `;
  }
}

// 确保默认导出和命名导出都正确
export default ClockCard;
export { ClockCard };