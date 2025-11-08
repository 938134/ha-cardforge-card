export default {
    name: 'clock-lunar',
    displayName: '时钟农历',
    icon: '🌙',
    description: '模拟时钟和农历信息',
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
        },
        { 
          key: 'lunar', 
          type: 'sensor', 
          description: '农历实体',
          default: 'sensor.nong_li'
        }
      ]
    },
    
    cardSize: 4,
    
    render: function(config, hass, entities) {
      const timeEntity = entities.get('time');
      const dateEntity = entities.get('date');
      const lunarEntity = entities.get('lunar');
  
      const time = timeEntity?.state || '00:00';
      const date = dateEntity?.state || '2000-01-01';
      
      const dateObj = new Date(date);
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      
      const lunarWeek = lunarEntity?.attributes?.lunar?.星期 || '星期一';
      const lunarYear = lunarEntity?.attributes?.lunar?.年干支 || '';
      const lunarState = lunarEntity?.state || '';
      const solarTerm = lunarEntity?.attributes?.lunar?.节气?.节气差 || '';
  
      // 生成当前时间（用于模拟时钟）
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      const hourAngle = (hours * 30) + (minutes * 0.5);
      const minuteAngle = minutes * 6;
      const secondAngle = seconds * 6;
  
      const analogClock = `
        <svg class="clock-svg" viewBox="0 0 100 100" style="width: 100px; height: 100px;">
          <circle class="clock-face" cx="50" cy="50" r="45" fill="var(--card-background-color)" stroke="var(--primary-text-color)" stroke-width="2"/>
          ${Array.from({length: 12}, (_, i) => {
            const angle = i * 30;
            const rad = angle * Math.PI / 180;
            const x1 = 50 + 35 * Math.sin(rad);
            const y1 = 50 - 35 * Math.cos(rad);
            const x2 = 50 + 40 * Math.sin(rad);
            const y2 = 50 - 40 * Math.cos(rad);
            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--primary-text-color)" stroke-width="2"/>`;
          }).join('')}
          <line class="hour-hand" x1="50" y1="50" x2="${50 + 20 * Math.sin(hourAngle * Math.PI / 180)}" y2="${50 - 20 * Math.cos(hourAngle * Math.PI / 180)}" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round"/>
          <line class="minute-hand" x1="50" y1="50" x2="${50 + 30 * Math.sin(minuteAngle * Math.PI / 180)}" y2="${50 - 30 * Math.cos(minuteAngle * Math.PI / 180)}" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round"/>
          ${config.show_seconds !== false ? `
            <line class="second-hand" x1="50" y1="50" x2="${50 + 35 * Math.sin(secondAngle * Math.PI / 180)}" y2="${50 - 35 * Math.cos(secondAngle * Math.PI / 180)}" stroke="var(--accent-color)" stroke-width="1" stroke-linecap="round"/>
          ` : ''}
          <circle cx="50" cy="50" r="3" fill="var(--primary-color)"/>
        </svg>
      `;
  
      return `
        <div class="clock-lunar-card" style="
          display: grid;
          grid-template-areas: 'a b' 'a c' 'a d' 'a e';
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 50% 15% 15% 20%;
          height: 250px;
          align-items: center;
        ">
          <div class="analog-clock" style="grid-area: a; display: flex; justify-content: center; align-items: center;">
            ${analogClock}
          </div>
          
          <div class="time-text" style="
            grid-area: b;
            font-size: 4rem;
            letter-spacing: 2px;
            font-weight: bold;
            text-align: center;
          ">${time.split(':').slice(0, 2).join(':')}</div>
          
          <div class="date-text" style="
            grid-area: c;
            font-size: 1rem;
            font-weight: bold;
            text-align: center;
          ">${month}月${day}号 ${lunarWeek}</div>
          
          <div class="lunar-year" style="
            grid-area: d;
            font-size: 1rem;
            font-weight: bold;
            text-align: center;
          ">${lunarYear} ${lunarState}</div>
          
          <div class="solar-term" style="
            grid-area: e;
            font-size: 1rem;
            letter-spacing: 2px;
            font-weight: bold;
            background-color: coral;
            border-radius: 1em;
            width: 60%;
            justify-self: center;
            text-align: center;
            padding: 4px 0;
          ">${solarTerm}</div>
        </div>
      `;
    },
    
    preview: function() {
      return `
        <div style="
          padding: 16px;
          background: var(--card-background-color);
          border-radius: 8px;
          text-align: center;
          height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        ">
          <div style="font-size: 2em; margin-bottom: 8px;">🌙</div>
          <div style="font-weight: bold; margin-bottom: 4px;">时钟农历</div>
          <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-bottom: 8px;">
            模拟时钟 + 农历信息
          </div>
          <div style="font-size: 0.7em; color: var(--secondary-text-color);">
            需要时间、日期、农历实体
          </div>
        </div>
      `;
    }
  };