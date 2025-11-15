// src/plugins/time-week.js
import { BasePlugin } from '../core/base-plugin.js';

class TimeWeek extends BasePlugin {
  static manifest = {
    id: 'time-week',
    name: '周数卡片',
    version: '1.0.0',
    description: '显示当前周数和进度',
    category: '时间',
    icon: '📅',
    entityRequirements: []
  };

  _calculateWeekInfo() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
    
    const weekProgress = (now.getDay() * 24 + now.getHours()) / (7 * 24) * 100;
    
    return {
      weekNumber,
      weekProgress: Math.round(weekProgress),
      dayOfWeek: now.getDay(),
      dayName: '星期' + '日一二三四五六'[now.getDay()]
    };
  }

  getTemplate(config, hass, entities) {
    const weekInfo = this._calculateWeekInfo();
    const systemData = this.getSystemData(hass, config);
    
    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-md">
            <div class="cardforge-content-large">第 ${weekInfo.weekNumber} 周</div>
            <div class="cardforge-content-body">
              <div>${systemData.date}</div>
              <div>${weekInfo.dayName}</div>
            </div>
            <div class="cardforge-content-small">
              本周进度: ${weekInfo.weekProgress}%
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config);
  }
}

export default TimeWeek;
export const manifest = TimeWeek.manifest;