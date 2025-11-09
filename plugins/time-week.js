// plugins/time-week.js
class TimeWeekPlugin {
  constructor() {
    this.name = 'time-week';
    this.displayName = '时间星期';
    this.icon = '⏰';
    this.category = 'time';
  }

  getTemplate(config, entities) {
    const time = entities.time?.state || '00:00';
    const date = entities.date?.state || '2000-01-01';
    const week = entities.week?.state || '星期一';
    const [hour, minute] = time.split(':');
    const [, month, day] = date.split('-');

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
}