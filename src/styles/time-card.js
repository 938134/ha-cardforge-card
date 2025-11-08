import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export default {
  name: 'time-card',
  displayName: '时间卡片',
  icon: '🕒',
  description: '水平布局的时间日期卡片',
  category: 'time',
  version: '1.0.0',
  
  requiresEntities: true,
  entityInterfaces: {
    required: [
      { 
        key: 'time', 
        type: 'sensor', 
        description: '时间实体',
        default: 'sensor.time'
      },
      { 
        key: 'date', 
        type: 'sensor', 
        description: '日期实体',
        default: 'sensor.date'
      }
    ],
    optional: [
      { 
        key: 'week', 
        type: 'sensor', 
        description: '星期实体',
        default: 'sensor.xing_qi'
      }
    ]
  },
  
  cardSize: 2,
  
  render: function(config, hass, entities) {
    const timeEntity = entities.get('time');
    const dateEntity = entities.get('date');
    const weekEntity = entities.get('week');

    const time = timeEntity?.state || '00:00';
    const date = dateEntity?.state || '2000-01-01';
    const week = weekEntity?.state || '星期一';
    
    const timeParts = time.split(':');
    const dateParts = date.split('-');
    const month = dateParts.length === 3 ? `${dateParts[1]}月` : '01月';
    const day = dateParts.length === 3 ? dateParts[2] : '01';

    return html`
      <div class="time-card" style="
        display: grid;
        grid-template-areas: 'a b c';
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
        height: 120px;
        align-items: center;
      ">
        <div class="hour-section" style="
          grid-area: a;
          justify-self: end;
          margin-right: 5px;
          text-align: center;
        ">
          <div class="label" style="
            font-size: 0.7em;
            margin-bottom: 4px;
            color: var(--secondary-text-color);
          ">TIME</div>
          <div class="value hour-value" style="
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 4px;
            color: rgba(var(--rgb-primary-text-color), 0.7);
          ">${timeParts[0] || '00'}</div>
          <div class="unit" style="
            font-size: 0.7em;
            color: var(--secondary-text-color);
          ">时</div>
        </div>
        
        <div class="date-section" style="
          grid-area: b;
          text-align: center;
        ">
          <div class="label" style="
            font-size: 0.7em;
            margin-bottom: 4px;
            color: var(--secondary-text-color);
          ">${month}</div>
          <div class="value date-value" style="
            font-size: 2.8em;
            font-weight: bold;
            margin-bottom: 4px;
          ">${day}</div>
          <div class="unit" style="
            font-size: 0.7em;
            color: var(--secondary-text-color);
          ">${week}</div>
        </div>
        
        <div class="minute-section" style="
          grid-area: c;
          justify-self: start;
          margin-left: 5px;
          text-align: center;
        ">
          <div class="label" style="
            font-size: 0.7em;
            margin-bottom: 4px;
            color: var(--secondary-text-color);
          ">TIME</div>
          <div class="value minute-value" style="
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 4px;
            color: rgba(var(--rgb-primary-text-color), 0.7);
          ">${timeParts[1] || '00'}</div>
          <div class="unit" style="
            font-size: 0.7em;
            color: var(--secondary-text-color);
          ">分</div>
        </div>
      </div>
    `;
  },
  
  preview: function() {
    return html`
      <div style="
        padding: 12px;
        background: var(--card-background-color);
        border-radius: 8px;
        height: 80px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
        align-items: center;
      ">
        <div style="text-align: center;">
          <div style="font-size: 0.6em; color: var(--secondary-text-color);">TIME</div>
          <div style="font-size: 1.2em; font-weight: bold; color: rgba(var(--rgb-primary-text-color), 0.7);">14</div>
          <div style="font-size: 0.6em; color: var(--secondary-text-color);">时</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.6em; color: var(--secondary-text-color);">08月</div>
          <div style="font-size: 1.8em; font-weight: bold;">15</div>
          <div style="font-size: 0.6em; color: var(--secondary-text-color);">星期四</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.6em; color: var(--secondary-text-color);">TIME</div>
          <div style="font-size: 1.2em; font-weight: bold; color: rgba(var(--rgb-primary-text-color), 0.7);">30</div>
          <div style="font-size: 0.6em; color: var(--secondary-text-color);">分</div>
        </div>
      </div>
    `;
  }
};