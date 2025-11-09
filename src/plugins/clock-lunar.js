// src/plugins/clock-lunar.js
import { BasePlugin } from './base-plugin.js';

export class ClockLunarPlugin extends BasePlugin {
  constructor() {
    super();
    this.name = 'clock-lunar';
    this.displayName = '时钟农历';
    this.icon = '🌙';
    this.category = 'time';
    this.description = '模拟时钟和农历信息';
  }

  getTemplate(config, entities) {
    const time = entities.time?.state || '12:34';
    const date = entities.date?.state || '2024-01-01';
    const lunar = entities.lunar;
    
    const lunarYear = lunar?.attributes?.lunar?.年干支 || '';
    const lunarDate = lunar?.state || '';
    const lunarWeek = lunar?.attributes?.lunar?.星期 || '星期一';
    const solarTerm = lunar?.attributes?.lunar?.节气?.节气差 || '';
    
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    const clockSvg = this._generateClockSVG();

    return `
      <div class="cardforge-card clock-lunar">
        <div class="clock-section">
          ${clockSvg}
        </div>
        <div class="info-section">
          <div class="time-text">${time.split(':').slice(0, 2).join(':')}</div>
          <div class="date-text">${month}月${day}号 ${lunarWeek}</div>
          <div class="lunar-text">${lunarYear} ${lunarDate}</div>
          <div class="solar-term">${solarTerm}</div>
        </div>
      </div>
    `;
  }

  _generateClockSVG() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    return `
      <svg class="clock" viewBox="0 0 100 100" width="100" height="100">
        <!-- 表盘 -->
        <circle cx="50" cy="50" r="45" fill="var(--card-background-color)" 
                stroke="var(--primary-text-color)" stroke-width="2"/>
        
        <!-- 时刻度 -->
        ${Array.from({length: 12}, (_, i) => {
          const angle = i * 30;
          const rad = angle * Math.PI / 180;
          const x1 = 50 + 35 * Math.sin(rad);
          const y1 = 50 - 35 * Math.cos(rad);
          const x2 = 50 + 40 * Math.sin(rad);
          const y2 = 50 - 40 * Math.cos(rad);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                       stroke="var(--primary-text-color)" stroke-width="2"/>`;
        }).join('')}
        
        <!-- 时针 -->
        <line class="hour-hand" x1="50" y1="50" 
              x2="${50 + 20 * Math.sin(hourAngle * Math.PI / 180)}" 
              y2="${50 - 20 * Math.cos(hourAngle * Math.PI / 180)}" 
              stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round"/>
        
        <!-- 分针 -->
        <line class="minute-hand" x1="50" y1="50" 
              x2="${50 + 30 * Math.sin(minuteAngle * Math.PI / 180)}" 
              y2="${50 - 30 * Math.cos(minuteAngle * Math.PI / 180)}" 
              stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round"/>
        
        <!-- 秒针 -->
        <line class="second-hand" x1="50" y1="50" 
              x2="${50 + 35 * Math.sin(secondAngle * Math.PI / 180)}" 
              y2="${50 - 35 * Math.cos(secondAngle * Math.PI / 180)}" 
              stroke="var(--accent-color)" stroke-width="1" stroke-linecap="round"/>
        
        <!-- 中心点 -->
        <circle cx="50" cy="50" r="3" fill="var(--primary-color)"/>
      </svg>
    `;
  }

  getStyles(config) {
    return `
      .clock-lunar {
        padding: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        align-items: center;
        height: 250px;
      }
      
      .clock-section {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .clock {
        width: 100px;
        height: 100px;
      }
      
      .hour-hand {
        transition: transform 0.3s ease;
      }
      
      .minute-hand {
        transition: transform 0.3s ease;
      }
      
      .second-hand {
        transition: transform 0.1s ease;
      }
      
      .info-section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }
      
      .time-text {
        font-size: 2.5em;
        font-weight: bold;
        letter-spacing: 2px;
      }
      
      .date-text {
        font-size: 1em;
        font-weight: bold;
        opacity: 0.9;
      }
      
      .lunar-text {
        font-size: 1em;
        font-weight: bold;
        opacity: 0.8;
      }
      
      .solar-term {
        font-size: 1em;
        font-weight: bold;
        background: coral;
        color: white;
        border-radius: 1em;
        padding: 4px 12px;
        text-align: center;
        letter-spacing: 1px;
      }
      
      @media (max-width: 480px) {
        .clock-lunar {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr 1fr;
          height: 300px;
        }
        
        .time-text {
          font-size: 2em;
        }
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
        { key: 'lunar', type: 'sensor', description: '农历实体' }
      ]
    };
  }
}