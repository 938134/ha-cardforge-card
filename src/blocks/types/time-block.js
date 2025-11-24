// src/blocks/types/time-block.js
import { BaseBlock } from '../base-block.js';

class TimeBlock extends BaseBlock {
  static blockType = 'time';
  static blockName = '时间';
  static blockIcon = 'mdi:clock';
  static category = 'information';
  static description = '显示时间和日期';

  render(block, hass) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const now = new Date();
    
    const timeText = this._formatTime(now, config.use24Hour);
    const dateText = config.showDate ? this._formatDate(now) : '';
    const weekText = config.showWeek ? this._formatWeek(now) : '';
    const lunarText = config.showLunar ? this._formatLunar(now) : '';

    return this._renderContainer(`
      ${this._renderHeader(config.title)}
      <div class="time-content">
        <div class="time-main">${timeText.main}</div>
        ${timeText.ampm ? `<div class="time-ampm">${timeText.ampm}</div>` : ''}
        
        ${(dateText || weekText) ? `
          <div class="time-date-section">
            ${dateText ? `<span class="time-date">${dateText}</span>` : ''}
            ${dateText && weekText ? '<span class="time-separator">·</span>' : ''}
            ${weekText ? `<span class="time-week">${weekText}</span>` : ''}
          </div>
        ` : ''}
        
        ${lunarText ? `
          <div class="time-lunar">${lunarText}</div>
        ` : ''}
      </div>
    `, 'time-block');
  }

  getStyles(block) {
    return `
      .time-block .time-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        text-align: center;
      }
      
      .time-block .time-main {
        font-size: 2em;
        font-weight: 300;
        color: var(--cf-text-primary);
        line-height: 1;
      }
      
      .time-block .time-ampm {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }
      
      .time-block .time-date-section {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
      }
      
      .time-block .time-date,
      .time-block .time-week {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .time-block .time-separator {
        color: var(--cf-text-secondary);
        opacity: 0.6;
      }
      
      .time-block .time-lunar {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
        opacity: 0.8;
      }
      
      @container (max-width: 300px) {
        .time-block .time-main {
          font-size: 1.6em;
        }
        
        .time-block .time-date-section {
          flex-direction: column;
          gap: 2px;
        }
      }
    `;
  }

  getEditTemplate(block, hass, onConfigChange) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());

    return `
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">标题</label>
          <ha-textfield
            .value="${config.title || ''}"
            @input="${e => onConfigChange('title', e.target.value)}"
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="form-row">
          <div class="switch-item">
            <span class="switch-label">24小时制</span>
            <ha-switch
              .checked="${config.use24Hour}"
              @change="${e => onConfigChange('use24Hour', e.target.checked)}"
            ></ha-switch>
          </div>
          
          <div class="switch-item">
            <span class="switch-label">显示日期</span>
            <ha-switch
              .checked="${config.showDate}"
              @change="${e => onConfigChange('showDate', e.target.checked)}"
            ></ha-switch>
          </div>
        </div>
        
        <div class="form-row">
          <div class="switch-item">
            <span class="switch-label">显示星期</span>
            <ha-switch
              .checked="${config.showWeek}"
              @change="${e => onConfigChange('showWeek', e.target.checked)}"
            ></ha-switch>
          </div>
          
          <div class="switch-item">
            <span class="switch-label">显示农历</span>
            <ha-switch
              .checked="${config.showLunar}"
              @change="${e => onConfigChange('showLunar', e.target.checked)}"
            ></ha-switch>
          </div>
        </div>
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      title: '',
      use24Hour: true,
      showDate: true,
      showWeek: true,
      showLunar: false
    };
  }

  _formatTime(date, use24Hour) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    if (use24Hour) {
      return {
        main: `${hours.toString().padStart(2, '0')}:${minutes}`,
        ampm: null
      };
    } else {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return {
        main: `${hours}:${minutes}`,
        ampm: ampm
      };
    }
  }

  _formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }

  _formatWeek(date) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[date.getDay()];
  }

  _formatLunar(date) {
    // 简化的农历显示（实际项目应该使用完整的农历库）
    const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
    const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    
    const baseDate = new Date(date.getFullYear(), 0, 1);
    const diffDays = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
    
    const lunarMonthIndex = diffDays % 12;
    const lunarDayIndex = diffDays % 30;
    
    return `${lunarMonths[lunarMonthIndex]}${lunarDays[lunarDayIndex]}`;
  }
}

export { TimeBlock as default };