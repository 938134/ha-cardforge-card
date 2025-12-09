// cards/clock-card.js - 修复版确保能工作
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export const card = {
  id: 'clock',
  meta: {
    name: '时钟',
    description: '显示当前时间和日期',
    icon: '⏰',
    category: '时间'
  },
  
  schema: {
    use24Hour: { type: 'boolean', label: '24小时制', default: true },
    showDate: { type: 'boolean', label: '显示日期', default: true },
    showWeekday: { type: 'boolean', label: '显示星期', default: true },
    showSeconds: { type: 'boolean', label: '显示秒数', default: false }
  },
  
  template: (config, { hass }) => {
    console.log('⏰ 时钟卡片模板被调用，配置:', config);
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    // 确保返回的是 html 模板
    return html`
      <!-- 时钟卡片 -->
      <div class="clock-card">
        <div class="clock-time card-emphasis">
          ${hours}:${minutes}${config.showSeconds ? `:${seconds}` : ''}
        </div>
        ${config.showDate ? html`
          <div class="clock-date card-subtitle">
            ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日
          </div>
        ` : ''}
        ${config.showWeekday ? html`
          <div class="clock-weekday card-caption">
            ${['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]}
          </div>
        ` : ''}
      </div>
    `;
  },
  
  styles: (config) => {
    console.log('🎨 时钟卡片样式被调用');
    // 返回有效的 CSSResult
    return css`
      .clock-card {
        height: 100%;
        min-height: 140px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      }
      
      .clock-time {
        font-size: 3em;
        font-weight: bold;
        color: var(--cf-primary-color);
        margin-bottom: 10px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .clock-date {
        font-size: 1.2em;
        color: var(--cf-text-secondary);
        margin-bottom: 5px;
      }
      
      .clock-weekday {
        font-size: 1em;
        color: var(--cf-text-tertiary);
        font-style: italic;
      }
    `;
  }
};
