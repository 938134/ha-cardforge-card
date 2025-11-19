// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.1.0',
    description: '智能欢迎卡片，显示时间、日期和个性化问候',
    category: '信息',
    icon: '👋',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['数字时钟', '优雅日历', '商务仪表', '创意时间轴'],
        default: '数字时钟'
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '缩放', '滑动'],
        default: '淡入'
      },
      show_weather: {
        type: 'boolean',
        label: '显示天气信息',
        default: false
      }
    },
    
    entity_requirements: {
      welcome_message: {
        name: '欢迎消息',
        description: '个性化欢迎消息，可输入文本或实体ID',
        type: 'text', 
        required: false,
        default: '',
        example: 'sensor.daily_quote 或 直接输入文本'
      },
      weather_entity: {
        name: '天气实体',
        description: '显示天气信息的实体',
        type: 'sensor',
        required: false,
        default: '',
        example: 'weather.home'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const userName = this._getUserName(hass);
    const welcomeMessage = this._getWelcomeMessage(hass, entities);
    const timeData = this._getTimeData();
    const cardStyle = config.card_style || '数字时钟';
    
    const content = this._renderCardContent(cardStyle, userName, welcomeMessage, timeData, config, hass, entities);
    return this._renderCardContainer(content, `welcome-card style-${this._getStyleClass(cardStyle)}`, config);
  }

  _getTimeData() {
    const now = new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    return {
      time: now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      date: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      weekday: weekdays[now.getDay()],
      hour: now.getHours(),
      minute: String(now.getMinutes()).padStart(2, '0'),
      second: String(now.getSeconds()).padStart(2, '0')
    };
  }

  _renderCardContent(style, userName, welcomeMessage, timeData, config, hass, entities) {
    const styleClass = this._getStyleClass(style);
    
    const renderers = {
      'digital': () => this._renderDigitalClock(userName, welcomeMessage, timeData, config, hass, entities),
      'elegant': () => this._renderElegantCalendar(userName, welcomeMessage, timeData, config, hass, entities),
      'business': () => this._renderBusinessDashboard(userName, welcomeMessage, timeData, config, hass, entities),
      'creative': () => this._renderCreativeTimeline(userName, welcomeMessage, timeData, config, hass, entities)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['digital']();
  }

  /* ===== 数字时钟风格 ===== */
  _renderDigitalClock(userName, welcomeMessage, timeData, config, hass, entities) {
    const weatherInfo = config.show_weather ? this._getWeatherInfo(hass, entities) : null;
    
    return `
      <div class="digital-layout">
        <div class="time-section">
          <div class="cardforge-text-large">${timeData.time}</div>
          <div class="time-seconds cardforge-text-small">${timeData.second}</div>
        </div>
        <div class="info-section">
          <div class="date-week">
            <div class="cardforge-text-medium">${timeData.date}</div>
            <div class="cardforge-text-small">${timeData.weekday}</div>
          </div>
          <div class="greeting-section">
            <div class="cardforge-text-medium">${this._getTimeBasedGreeting()}，${userName}</div>
            <div class="cardforge-text-small">${welcomeMessage}</div>
          </div>
          ${weatherInfo ? `
            <div class="weather-info">
              <div class="weather-icon">${weatherInfo.icon}</div>
              <div class="cardforge-text-small">${weatherInfo.temperature}°</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 优雅日历风格 ===== */
  _renderElegantCalendar(userName, welcomeMessage, timeData, config, hass, entities) {
    return `
      <div class="elegant-layout">
        <div class="calendar-header">
          <div class="cardforge-text-small">${timeData.date.split('年')[0]}年</div>
          <div class="day-date">
            <div class="cardforge-text-large">${new Date().getDate()}</div>
            <div class="cardforge-text-small">${timeData.date.split('年')[1].split('月')[0]}月</div>
          </div>
        </div>
        <div class="calendar-content">
          <div class="time-section">
            <div class="cardforge-text-medium">${timeData.time}</div>
            <div class="cardforge-text-small">${timeData.weekday}</div>
          </div>
          <div class="greeting-section">
            <div class="cardforge-text-medium">${this._getTimeBasedGreeting()}，${userName}</div>
            <div class="cardforge-text-small">${welcomeMessage}</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ===== 商务仪表风格 ===== */
  _renderBusinessDashboard(userName, welcomeMessage, timeData, config, hass, entities) {
    const progress = ((timeData.hour * 60 + parseInt(timeData.minute)) / (24 * 60)) * 100;
    
    return `
      <div class="business-layout">
        <div class="dashboard-header">
          <div class="cardforge-text-large">${timeData.time}</div>
          <div class="cardforge-text-small">${timeData.date}</div>
        </div>
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-labels cardforge-text-small">
            <span>今日进度</span>
            <span>${Math.round(progress)}%</span>
          </div>
        </div>
        <div class="content-section">
          <div class="cardforge-text-medium">${this._getTimeBasedGreeting()}，${userName}</div>
          <div class="cardforge-text-small">${welcomeMessage}</div>
          <div class="weekday-badge cardforge-text-small">${timeData.weekday}</div>
        </div>
      </div>
    `;
  }

  /* ===== 创意时间轴风格 ===== */
  _renderCreativeTimeline(userName, welcomeMessage, timeData, config, hass, entities) {
    const timePeriod = this._getTimePeriod();
    
    return `
      <div class="creative-layout">
        <div class="timeline-track">
          <div class="timeline-marker" style="left: ${(timeData.hour * 60 + parseInt(timeData.minute)) / (24 * 60) * 100}%">
            <div class="marker-time cardforge-text-small">${timeData.time}</div>
          </div>
        </div>
        <div class="timeline-content">
          <div class="date-section">
            <div class="cardforge-text-medium">${timeData.date}</div>
            <div class="cardforge-text-small">${timeData.weekday}</div>
          </div>
          <div class="greeting-section">
            <div class="cardforge-text-large">${this._getTimeBasedGreeting()}</div>
            <div class="cardforge-text-medium">${userName}</div>
          </div>
          <div class="cardforge-text-small">${welcomeMessage}</div>
          <div class="cardforge-text-small">${timePeriod}</div>
        </div>
      </div>
    `;
  }

  _getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '清晨时光';
    if (hour >= 12 && hour < 14) return '午间时刻';
    if (hour >= 14 && hour < 18) return '下午时分';
    if (hour >= 18 && hour < 22) return '傍晚时分';
    return '深夜时刻';
  }

  _getWeatherInfo(hass, entities) {
    const weatherEntity = entities.weather_entity?.state;
    if (weatherEntity && hass?.states?.[weatherEntity]) {
      const weather = hass.states[weatherEntity];
      return {
        temperature: weather.attributes.temperature || '--',
        icon: this._getWeatherIcon(weather.state)
      };
    }
    return null;
  }

  _getWeatherIcon(condition) {
    const icons = {
      'sunny': '☀️',
      'clear': '☀️',
      'partlycloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'snowy': '❄️',
      'windy': '💨',
      'fog': '🌫️'
    };
    return icons[condition] || '🌈';
  }

  _getWelcomeMessage(hass, entities) {
    if (!entities || !entities.welcome_message) {
      return this._getDefaultWelcomeMessage();
    }
    
    const welcomeMessage = entities.welcome_message.state || '';
    
    if (welcomeMessage.includes('.') && hass?.states?.[welcomeMessage]) {
      const entity = hass.states[welcomeMessage];
      return entity.state || this._getDefaultWelcomeMessage();
    }
    
    return welcomeMessage || this._getDefaultWelcomeMessage();
  }

  _getStyleClass(styleName) {
    const styleMap = {
      '数字时钟': 'digital',
      '优雅日历': 'elegant', 
      '商务仪表': 'business',
      '创意时间轴': 'creative'
    };
    return styleMap[styleName] || 'digital';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '数字时钟';
    const styleClass = this._getStyleClass(cardStyle);
    
    return `
      ${this.getBaseStyles(config)}
      
      .welcome-card {
        justify-content: space-between;
      }

      /* 通用样式 */
      .time-section {
        display: flex;
        align-items: baseline;
        gap: var(--cf-spacing-sm);
        justify-content: center;
      }

      .info-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .date-week {
        display: flex;
        justify-content: space-between;
      }

      .greeting-section {
        text-align: center;
      }

      .weather-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        margin-top: var(--cf-spacing-md);
      }

      .weather-icon {
        font-size: 1.5em;
      }

      .progress-bar {
        height: 6px;
        background: rgba(var(--cf-rgb-primary), 0.2);
        border-radius: 3px;
        overflow: hidden;
        margin: var(--cf-spacing-sm) 0;
      }

      .progress-fill {
        height: 100%;
        background: var(--cf-primary-color);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .progress-labels {
        display: flex;
        justify-content: space-between;
      }

      .weekday-badge {
        align-self: flex-start;
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 4px 12px;
        border-radius: 12px;
        margin-top: var(--cf-spacing-md);
      }

      /* 优雅日历样式 */
      .elegant-layout {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: var(--cf-spacing-xl);
        align-items: center;
      }

      .calendar-header {
        text-align: center;
        border-right: 1px solid rgba(var(--cf-rgb-primary), 0.3);
        padding-right: var(--cf-spacing-xl);
      }

      .calendar-content {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      /* 创意时间轴样式 */
      .creative-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .timeline-track {
        height: 4px;
        background: rgba(var(--cf-rgb-primary), 0.3);
        border-radius: 2px;
        margin-bottom: var(--cf-spacing-xl);
        position: relative;
      }

      .timeline-marker {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        background: var(--cf-primary-color);
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .marker-time {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--cf-surface);
        padding: 4px 8px;
        border-radius: 6px;
        white-space: nowrap;
      }

      .timeline-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--cf-spacing-md);
      }

      .date-section {
        display: flex;
        justify-content: space-between;
      }

      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .elegant-layout {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-lg);
        }
        
        .calendar-header {
          border-right: none;
          border-bottom: 1px solid rgba(var(--cf-rgb-primary), 0.3);
          padding-right: 0;
          padding-bottom: var(--cf-spacing-lg);
        }
        
        .time-section {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;