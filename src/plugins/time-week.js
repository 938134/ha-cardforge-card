// src/plugins/time-week.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'time-week',
  name: '时间星期',
  version: '1.0.0',
  description: '垂直布局的时间星期显示',
  author: 'CardForge Team',
  category: 'time',
  icon: '📅',
  entityRequirements: [
    {
      key: 'time',
      description: '时间实体',
      required: false
    },
    {
      key: 'date', 
      description: '日期实体',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: false
};

export default class TimeWeekPlugin extends BasePlugin {
  constructor() {
    super();
    this._timeData = this.createReactiveData({
      hour: '00',
      minute: '00',
      month: '01',
      day: '01',
      weekday: '星期一'
    });

    this._updateInterval = null;
  }

  onConfigUpdate(oldConfig, newConfig) {
    this._startTimeUpdates();
  }

  onEntitiesUpdate(entities) {
    this._updateFromEntities(entities);
  }

  onDestroy() {
    this._stopTimeUpdates();
  }

  _startTimeUpdates() {
    this._stopTimeUpdates();
    this._updateTimeData();
    this._updateInterval = setInterval(() => this._updateTimeData(), 1000);
  }

  _stopTimeUpdates() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  }

  _updateFromEntities(entities) {
    const timeEntity = entities.time;
    const dateEntity = entities.date;

    if (timeEntity || dateEntity) {
      this._updateTimeData(timeEntity, dateEntity);
    }
  }

  _updateTimeData(timeEntity = null, dateEntity = null) {
    const now = new Date();
    
    // 从实体或系统时间获取数据
    let timeStr, dateStr;
    
    if (timeEntity) {
      timeStr = timeEntity.state;
    } else {
      timeStr = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    }

    if (dateEntity) {
      dateStr = dateEntity.state;
    } else {
      dateStr = now.toLocaleDateString('zh-CN');
    }

    const [hour, minute] = timeStr.split(':');
    let month = '01', day = '01';

    // 解析日期
    if (dateStr.includes('-')) {
      const dateParts = dateStr.split('-');
      month = dateParts[1] || String(now.getMonth() + 1).padStart(2, '0');
      day = dateParts[2] || String(now.getDate()).padStart(2, '0');
    } else if (dateStr.includes('/')) {
      const dateParts = dateStr.split('/');
      month = dateParts[1] || String(now.getMonth() + 1).padStart(2, '0');
      day = dateParts[2] || String(now.getDate()).padStart(2, '0');
    } else {
      month = String(now.getMonth() + 1).padStart(2, '0');
      day = String(now.getDate()).padStart(2, '0');
    }

    this._timeData.value = {
      hour: hour || '00',
      minute: minute || '00',
      month: month,
      day: day,
      weekday: '星期' + '日一二三四五六'[now.getDay()]
    };
  }

  getTemplate(config, hass, entities) {
    const { hour, minute, month, day, weekday } = this._timeData.value;

    return `
      <div class="cardforge-card time-week">
        <div class="time-section">
          <div class="hour">${hour}</div>
          <div class="minute">${minute}</div>
        </div>
        <div class="date-section">
          <div class="month-day">${month}月${day}日</div>
          <div class="weekday">${weekday}</div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + this.css`
      .time-week {
        ${this.responsive(
          'height: 180px; padding: 20px;',
          'height: 160px; padding: 16px;'
        )}
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: center;
      }

      .time-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .hour, .minute {
        ${this.responsive(
          'font-size: 2.8em;',
          'font-size: 2.2em;'
        )}
        font-weight: 700;
        line-height: 1;
        color: var(--primary-color);
        letter-spacing: 1px;
      }

      .hour {
        opacity: 0.9;
      }

      .minute {
        opacity: 0.7;
      }

      .date-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .month-day {
        ${this.responsive(
          'font-size: 1.2em;',
          'font-size: 1em;'
        )}
        font-weight: 600;
        opacity: 0.9;
        color: var(--primary-text-color);
        line-height: 1.2;
      }

      .weekday {
        ${this.responsive(
          'font-size: 1em; padding: 4px 12px;',
          'font-size: 0.9em; padding: 3px 10px;'
        )}
        background: var(--primary-color);
        color: white;
        border-radius: 12px;
        display: inline-block;
        opacity: 0.9;
        font-weight: 500;
        line-height: 1.3;
      }

      /* 动画效果 */
      .time-week:hover .hour,
      .time-week:hover .minute {
        transform: scale(1.05);
        transition: transform 0.3s ease;
      }

      .time-week:hover .weekday {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      }

      /* 移动端优化 */
      @media (max-width: 480px) {
        .time-week {
          gap: 12px;
        }
        
        .time-section {
          gap: 2px;
        }
        
        .date-section {
          gap: 6px;
        }
      }
    `;
  }

  getCardSize() {
    return 3;
  }
}
