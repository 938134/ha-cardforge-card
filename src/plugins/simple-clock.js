// src/plugins/simple-clock.js
import { BasePlugin } from '../core/base-plugin.js';

class SimpleClock extends BasePlugin {
  static manifest = {
    id: 'simple-clock',
    name: '简约时钟',
    version: '1.0.0',
    description: '显示当前时间和日期',
    category: '时间',
    icon: '🕒',
    entityRequirements: []
  };

  getTemplate(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    
    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-sm">
            <div class="cardforge-content-large">${systemData.time}</div>
            <div class="cardforge-content-body">${systemData.date}</div>
            <div class="cardforge-content-small">${systemData.weekday}</div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config);
  }
}

export default SimpleClock;
export const manifest = SimpleClock.manifest;