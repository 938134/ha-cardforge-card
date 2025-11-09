// plugins/time-card.js
class TimeCardPlugin {
  constructor() {
    this.name = 'time-card';
    this.displayName = '时间卡片';
    this.icon = '🕒';
    this.category = 'time';
    this.requiresWeek = true;
  }

  getTemplate(config, entities) {
    const time = entities.time?.state || '00:00';
    const date = entities.date?.state || '2000-01-01';
    const week = entities.week?.state || '星期一';
    const [hour, minute] = time.split(':');
    const [, month, day] = date.split('-');

    return `
      <div class="cardforge-card time-card">
        <div class="time-section">
          <div class="label">时</div>
          <div class="value hour">${hour}</div>
        </div>
        <div class="date-section">
          <div class="month">${month}月</div>
          <div class="day">${day}</div>
          <div class="week">${week}</div>
        </div>
        <div class="time-section">
          <div class="label">分</div>
          <div class="value minute">${minute}</div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return `
      .time-card {
        padding: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        align-items: center;
        height: 120px;
      }
      .time-section {
        text-align: center;
      }
      .time-section .label {
        font-size: 0.8em;
        opacity: 0.7;
      }
      .time-section .value {
        font-size: 2em;
        font-weight: bold;
        color: rgba(var(--rgb-primary-text-color), 0.7);
      }
      .date-section {
        text-align: center;
      }
      .date-section .month {
        font-size: 0.8em;
        opacity: 0.7;
      }
      .date-section .day {
        font-size: 2.8em;
        font-weight: bold;
        line-height: 1;
      }
      .date-section .week {
        font-size: 0.8em;
        opacity: 0.7;
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