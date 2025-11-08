import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export default {
  name: 'time-week',
  displayName: '时间星期',
  icon: '⏰',
  description: '垂直布局的时间星期卡片',
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
  
  cardSize: 3,
  
  render: function(config, hass, entities) {
    const timeEntity = entities.get('time');
    const dateEntity = entities.get('date');
    const weekEntity = entities.get('week');

    const time = timeEntity?.state || '00:00';
    const date = dateEntity?.state || '2000-01-01';
    const week = weekEntity?.state || '星期一';
    
    const timeParts = time.split(':');
    const dateParts = date.split('-');
    const dateDisplay = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}日` : '01/01';

    return html`
      <div class="time-week-card" style="
        display: grid;
        grid-template-areas: 'a' 'b' 'c';
        grid-template-columns: 100%;
        grid-template-rows: 1fr 1fr 1fr;
        height: 200px;
        align-items: center;
      ">
        <div class="time-hour" style="
          grid-area: a;
          font-size: 3.2em;
          font-weight: bold;
          letter-spacing: 1px;
          text-align: center;
        ">${timeParts[0] || '00'}</div>
        
        <div class="time-minute" style="
          grid-area: b;
          font-size: 3.2em;
          font-weight: bold;
          letter-spacing: 1px;
          text-align: center;
        ">${timeParts[1] || '00'}</div>
        
        <div class="date-week" style="
          grid-area: c;
          font-size: 1em;
          letter-spacing: 2px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        ">
          <div class="date" style="color: red;">${dateDisplay}</div>
          <div class="week" style="
            font-size: 0.8rem;
            background-color: red;
            color: white;
            border-radius: 10px;
            padding: 4px 12px;
            width: 60%;
          ">${week}</div>
        </div>
      </div>
    `;
  },
  
  preview: function() {
    return html`
      <div style="
        padding: 16px;
        background: var(--card-background-color);
        border-radius: 8px;
        text-align: center;
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      ">
        <div style="font-size: 2em; margin-bottom: 8px;">⏰</div>
        <div style="font-weight: bold; margin-bottom: 4px;">时间星期</div>
        <div style="font-size: 0.8em; color: var(--secondary-text-color);">
          垂直布局的时间显示
        </div>
      </div>
    `;
  }
};