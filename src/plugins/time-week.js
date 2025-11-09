// src/plugins/time-week.js
import { BasePlugin } from './base-plugin.js';

export class TimeWeekPlugin extends BasePlugin {
  constructor() {
    super();
    this.name = 'time-week';
    this.displayName = '时间星期';
    this.icon = '⏰';
    this.category = 'time';
    this.description = '垂直布局的时间星期显示';
    this.requiresWeek = true;
    this.featured = true;
  }

  getTemplate(config, entities) {
    const { hour, minute } = this.formatTime(entities.time?.state);
    const { month, day } = this.formatDate(entities.date?.state);
    const week = entities.week?.state || '星期一';

    return `
      <div class="cardforge-card time-week">
        <div class="hour">${hour}</div>
        <div class="minute">${minute}</div>
        <div class="date">${month}/${day}日</div>
        <div class="week">${week}</div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      .time-week {
        padding: 20px;
        text-align: center;
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .time-week .hour,
      .time-week .minute {
        font-size: 3em;
        font-weight: bold;
        line-height: 1;
      }
      .time-week .date {
        margin-top: 10px;
        font-size: 1.1em;
        color: var(--primary-color);
      }
      .time-week .week {
        background: var(--primary-color);
        color: white;
        border-radius: 10px;
        padding: 4px 12px;
        display: inline-block;
        margin-top: 8px;
        font-size: 0.9em;
      }
    `;
  }

  getEntityRequirements() {
    return {
      required: [
        { key: 'time', type: 'sensor', description: '时间实体' },
        { key: 'date', type: 'sensor', description: '日期实体' }
      ],
      optional: [
        { key: 'week', type: 'sensor', description: '星期实体' }
      ]
    };
  }
}