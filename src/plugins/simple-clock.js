// src/plugins/simple-clock.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'simple-clock',
  name: '简约时钟',
  version: '1.0.0',
  description: '简洁的时间显示卡片',
  author: 'CardForge',
  category: '时间',
  icon: '🕒',
  entityRequirements: []
};

export default class SimpleClockPlugin extends BasePlugin {
  getHeader(config, hass, entities) {
    return `
      <div class="cf-flex cf-flex-between">
        <span>当前时间</span>
        <span class="cf-text-sm cf-text-secondary">实时</span>
      </div>
    `;
  }

  getContent(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    return `
      <div class="content-center">
        <div style="
          ${this._cfTextSize('xl')} 
          ${this._cfFontWeight('bold')}
          ${this._cfColor('primary')}
          margin-bottom: 8px;
        ">
          ${systemData.time}
        </div>
        <div style="
          ${this._cfTextSize('md')} 
          ${this._cfColor('text-secondary')}
        ">
          ${systemData.date} ${systemData.weekday}
        </div>
      </div>
    `;
  }

  getFooter(config, hass, entities) {
    const systemData = this.getSystemData(hass, config);
    return `
      <div class="cf-flex cf-flex-center cf-gap-sm">
        <span>${systemData.greeting}</span>
      </div>
    `;
  }

  getCustomStyles(config) {
    return `
      .simple-clock-content {
        text-align: center;
        padding: 20px 0;
      }
    `;
  }
}