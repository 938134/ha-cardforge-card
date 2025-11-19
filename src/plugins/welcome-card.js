// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WelcomeCard extends BasePlugin {
  static manifest = {
    id: 'welcome-card',
    name: '欢迎卡片',
    version: '1.0.0',
    description: '智能欢迎卡片，显示时间、日期和个性化问候',
    category: '信息',
    icon: '👋',
    author: 'CardForge',
    
    config_schema: {
      card_style: {
        type: 'select',
        label: '卡片风格',
        options: ['数字时钟', '优雅日历', '商务仪表', '创意时间轴', '极简信息', '自然时光'],
        default: '数字时钟'
      },
      animation_style: {
        type: 'select',
        label: '动画效果',
        options: ['无', '淡入', '滑动', '缩放', '打字机'],
        default: '淡入'
      },
      show_weather: {
        type: 'boolean',
        label: '显示天气信息',
        default: false
      },
      show_quote: {
        type: 'boolean',
        label: '显示每日一言',
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
    
    return `
      <div class="cardforge-responsive-container welcome-card style-${this._getStyleClass(cardStyle)} animation-${config.animation_style || '淡入'}">
        ${this._renderCardContent(cardStyle, userName, welcomeMessage, timeData, config, hass, entities)}
      </div>
    `;
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
      'creative': () => this._renderCreativeTimeline(userName, welcomeMessage, timeData, config, hass, entities),
      'minimal': () => this._renderMinimalInfo(userName, welcomeMessage, timeData, config, hass, entities),
      'nature': () => this._renderNatureTime(userName, welcomeMessage, timeData, config, hass, entities)
    };
    
    return renderers[styleClass] ? renderers[styleClass]() : renderers['digital']();
  }

  /* ===== 数字时钟风格 ===== */
  _renderDigitalClock(userName, welcomeMessage, timeData, config, hass, entities) {
    const weatherInfo = config.show_weather ? this._getWeatherInfo(hass, entities) : null;
    
    return `
      <div class="digital-clock-layout">
        <div class="time-display">
          <div class="time-main">${timeData.time}</div>
          <div class="time-seconds">${timeData.second}</div>
        </div>
        <div class="info-panel">
          <div class="date-week">
            <div class="date">${timeData.date}</div>
            <div class="weekday">${timeData.weekday}</div>
          </div>
          <div class="greeting-section">
            <div class="greeting">${this._getTimeBasedGreeting()}，${userName}</div>
            <div class="message">${welcomeMessage}</div>
          </div>
          ${weatherInfo ? `
            <div class="weather-info">
              <div class="weather-icon">${weatherInfo.icon}</div>
              <div class="weather-temp">${weatherInfo.temperature}°</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /* ===== 优雅日历风格 ===== */
  _renderElegantCalendar(userName, welcomeMessage, timeData, config, hass, entities) {
    return `
      <div class="elegant-calendar-layout">
        <div class="calendar-header">
          <div class="month-year">${timeData.date.split('年')[0]}年</div>
          <div class="day-date">
            <div class="day-number">${new Date().getDate()}</div>
            <div class="month-name">${timeData.date.split('年')[1].split('月')[0]}月</div>
          </div>
        </div>
        <div class="calendar-content">
          <div class="time-section">
            <div class="elegant-time">${timeData.time}</div>
            <div class="weekday">${timeData.weekday}</div>
          </div>
          <div class="greeting-section">
            <div class="greeting">${this._getTimeBasedGreeting()}，${userName}</div>
            <div class="message">${welcomeMessage}</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ===== 商务仪表风格 ===== */
  _renderBusinessDashboard(userName, welcomeMessage, timeData, config, hass, entities) {
    const progress = ((timeData.hour * 60 + parseInt(timeData.minute)) / (24 * 60)) * 100;
    
    return `
      <div class="business-dashboard-layout">
        <div class="dashboard-header">
          <div class="business-time">${timeData.time}</div>
          <div class="business-date">${timeData.date}</div>
        </div>
        <div class="progress-section">
          <div class="day-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-labels">
              <span>今日进度</span>
              <span>${Math.round(progress)}%</span>
            </div>
          </div>
        </div>
        <div class="business-content">
          <div class="greeting">${this._getTimeBasedGreeting()}，${userName}</div>
          <div class="message">${welcomeMessage}</div>
          <div class="weekday-badge">${timeData.weekday}</div>
        </div>
      </div>
    `;
  }

  /* ===== 创意时间轴风格 ===== */
  _renderCreativeTimeline(userName, welcomeMessage, timeData, config, hass, entities) {
    const timePeriod = this._getTimePeriod();
    
    return `
      <div class="creative-timeline-layout">
        <div class="timeline-track">
          <div class="timeline-marker" style="left: ${(timeData.hour * 60 + parseInt(timeData.minute)) / (24 * 60) * 100}%">
            <div class="marker-time">${timeData.time}</div>
          </div>
        </div>
        <div class="timeline-content">
          <div class="creative-date">
            <div class="date-main">${timeData.date}</div>
            <div class="weekday">${timeData.weekday}</div>
          </div>
          <div class="creative-greeting">
            <div class="greeting-large">${this._getTimeBasedGreeting()}</div>
            <div class="user-name">${userName}</div>
          </div>
          <div class="timeline-message">${welcomeMessage}</div>
          <div class="time-period">${timePeriod}</div>
        </div>
      </div>
    `;
  }

  /* ===== 极简信息风格 ===== */
  _renderMinimalInfo(userName, welcomeMessage, timeData, config, hass, entities) {
    return `
      <div class="minimal-info-layout">
        <div class="minimal-time">${timeData.time}</div>
        <div class="minimal-date">${timeData.date}</div>
        <div class="minimal-greeting">
          <span class="greeting-text">${this._getTimeBasedGreeting()}</span>
          <span class="user-name">${userName}</span>
        </div>
        <div class="minimal-message">${welcomeMessage}</div>
        <div class="minimal-weekday">${timeData.weekday}</div>
      </div>
    `;
  }

  /* ===== 自然时光风格 ===== */
  _renderNatureTime(userName, welcomeMessage, timeData, config, hass, entities) {
    const season = this._getSeason();
    const natureIcon = this._getNatureIcon(timeData.hour);
    
    return `
      <div class="nature-time-layout">
        <div class="nature-header">
          <div class="nature-icon">${natureIcon}</div>
          <div class="nature-time">${timeData.time}</div>
        </div>
        <div class="nature-content">
          <div class="season-badge">${season}</div>
          <div class="nature-date">${timeData.date}</div>
          <div class="nature-greeting">
            <div class="greeting">${this._getTimeBasedGreeting()}，${userName}</div>
            <div class="message">${welcomeMessage}</div>
          </div>
          <div class="nature-weekday">${timeData.weekday}</div>
        </div>
      </div>
    `;
  }

  _getSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return '🌱 春季';
    if (month >= 6 && month <= 8) return '🌞 夏季';
    if (month >= 9 && month <= 11) return '🍂 秋季';
    return '⛄ 冬季';
  }

  _getNatureIcon(hour) {
    if (hour >= 5 && hour < 8) return '🌅';
    if (hour >= 8 && hour < 12) return '☀️';
    if (hour >= 12 && hour < 14) return '🌤️';
    if (hour >= 14 && hour < 18) return '⛅';
    if (hour >= 18 && hour < 20) return '🌇';
    return '🌙';
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
      '创意时间轴': 'creative',
      '极简信息': 'minimal',
      '自然时光': 'nature'
    };
    return styleMap[styleName] || 'digital';
  }

  getStyles(config) {
    const cardStyle = config.card_style || '数字时钟';
    const styleClass = this._getStyleClass(cardStyle);
    
    return `
      ${this.getBaseStyles(config)}
      .welcome-card {
        padding: var(--cf-spacing-xl);
        min-height: 220px;
        position: relative;
        overflow: hidden;
      }
      
      /* ===== 数字时钟风格 ===== */
      .style-digital {
        background: linear-gradient(135deg, #0c0c0c 0%, #2d2d2d 100%);
        color: #00ff88;
        font-family: 'Courier New', monospace;
      }
      .digital-clock-layout {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xl);
        height: 100%;
      }
      .time-display {
        display: flex;
        align-items: baseline;
        gap: var(--cf-spacing-sm);
      }
      .time-main {
        font-size: 3.5em;
        font-weight: 700;
        text-shadow: 0 0 20px #00ff88;
      }
      .time-seconds {
        font-size: 1.2em;
        opacity: 0.7;
      }
      .info-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }
      .date-week {
        display: flex;
        justify-content: space-between;
        font-size: 1.1em;
        opacity: 0.9;
      }
      .greeting-section .greeting {
        font-size: 1.4em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-xs);
      }
      .greeting-section .message {
        opacity: 0.8;
        font-size: 1em;
      }
      .weather-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-top: var(--cf-spacing-md);
      }
      .weather-icon {
        font-size: 1.5em;
      }
      .weather-temp {
        font-size: 1.2em;
        font-weight: 600;
      }
      
      /* ===== 优雅日历风格 ===== */
      .style-elegant {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: 'Georgia', serif;
      }
      .elegant-calendar-layout {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: var(--cf-spacing-xl);
        height: 100%;
        align-items: center;
      }
      .calendar-header {
        text-align: center;
        border-right: 2px solid rgba(255,255,255,0.3);
        padding-right: var(--cf-spacing-xl);
      }
      .month-year {
        font-size: 1.2em;
        opacity: 0.8;
        margin-bottom: var(--cf-spacing-sm);
      }
      .day-date {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .day-number {
        font-size: 3em;
        font-weight: 700;
        line-height: 1;
      }
      .month-name {
        font-size: 1.1em;
        opacity: 0.9;
      }
      .time-section {
        margin-bottom: var(--cf-spacing-lg);
      }
      .elegant-time {
        font-size: 2.2em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-xs);
      }
      .weekday {
        font-size: 1.1em;
        opacity: 0.8;
        font-style: italic;
      }
      .greeting-section .greeting {
        font-size: 1.3em;
        margin-bottom: var(--cf-spacing-sm);
      }
      
      /* ===== 商务仪表风格 ===== */
      .style-business {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        font-family: 'Arial', sans-serif;
      }
      .business-dashboard-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: var(--cf-spacing-lg);
      }
      .business-time {
        font-size: 2.5em;
        font-weight: 700;
      }
      .business-date {
        font-size: 1.1em;
        opacity: 0.9;
      }
      .progress-section {
        margin-bottom: var(--cf-spacing-lg);
      }
      .day-progress {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      .progress-bar {
        height: 6px;
        background: rgba(255,255,255,0.2);
        border-radius: 3px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      .progress-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.9em;
        opacity: 0.8;
      }
      .business-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .business-content .greeting {
        font-size: 1.4em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
      }
      .weekday-badge {
        align-self: flex-start;
        background: rgba(255,255,255,0.2);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.9em;
        margin-top: var(--cf-spacing-md);
      }
      
      /* ===== 创意时间轴风格 ===== */
      .style-creative {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
        background-size: 400% 400%;
        animation: gradientShift 8s ease infinite;
        color: white;
        font-family: 'Segoe UI', sans-serif;
      }
      .creative-timeline-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .timeline-track {
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        margin-bottom: var(--cf-spacing-xl);
        position: relative;
      }
      .timeline-marker {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        background: white;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
      }
      .marker-time {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.7);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.8em;
        white-space: nowrap;
      }
      .timeline-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .creative-date {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: var(--cf-spacing-lg);
      }
      .date-main {
        font-size: 1.3em;
        font-weight: 600;
      }
      .creative-greeting {
        margin-bottom: var(--cf-spacing-md);
      }
      .greeting-large {
        font-size: 1.8em;
        font-weight: 700;
        margin-bottom: var(--cf-spacing-xs);
      }
      .user-name {
        font-size: 1.2em;
        opacity: 0.9;
      }
      .timeline-message {
        font-size: 1.1em;
        margin-bottom: var(--cf-spacing-sm);
        line-height: 1.4;
      }
      .time-period {
        font-size: 0.9em;
        opacity: 0.8;
        font-style: italic;
      }
      
      /* ===== 极简信息风格 ===== */
      .style-minimal {
        background: #ffffff;
        color: #333333;
        border: 2px solid #e0e0e0;
        font-family: 'Helvetica Neue', sans-serif;
      }
      .minimal-info-layout {
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        gap: var(--cf-spacing-md);
        height: 100%;
      }
      .minimal-time {
        font-size: 2.8em;
        font-weight: 300;
        letter-spacing: -1px;
      }
      .minimal-date {
        font-size: 1.1em;
        color: #666;
      }
      .minimal-greeting {
        display: flex;
        align-items: baseline;
        gap: var(--cf-spacing-sm);
        font-size: 1.3em;
      }
      .greeting-text {
        font-weight: 500;
      }
      .user-name {
        color: #666;
      }
      .minimal-message {
        color: #666;
        line-height: 1.4;
      }
      .minimal-weekday {
        justify-self: end;
        color: #999;
        font-size: 0.9em;
      }
      
      /* ===== 自然时光风格 ===== */
      .style-nature {
        background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);
        color: #2e7d32;
        font-family: 'Arial', sans-serif;
      }
      .nature-time-layout {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: var(--cf-spacing-lg);
        height: 100%;
        align-items: center;
      }
      .nature-header {
        text-align: center;
      }
      .nature-icon {
        font-size: 3em;
        margin-bottom: var(--cf-spacing-sm);
      }
      .nature-time {
        font-size: 1.4em;
        font-weight: 600;
      }
      .nature-content {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      .season-badge {
        align-self: flex-start;
        background: rgba(46, 125, 50, 0.1);
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.9em;
      }
      .nature-date {
        font-size: 1.1em;
        font-weight: 500;
      }
      .nature-greeting .greeting {
        font-size: 1.3em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-xs);
      }
      .nature-greeting .message {
        color: #388e3c;
      }
      .nature-weekday {
        color: #4caf50;
        font-style: italic;
      }
      
      /* 动画效果 */
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .animation-打字机 .greeting {
        overflow: hidden;
        border-right: 2px solid;
        white-space: nowrap;
        animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
      }
      
      @keyframes typing {
        from { width: 0 }
        to { width: 100% }
      }
      
      @keyframes blink-caret {
        from, to { border-color: transparent }
        50% { border-color: currentColor; }
      }

      /* 响应式设计 */
      @media (max-width: 600px) {
        .welcome-card {
          padding: var(--cf-spacing-lg);
          min-height: 200px;
        }
        .digital-clock-layout {
          flex-direction: column;
          gap: var(--cf-spacing-lg);
          text-align: center;
        }
        .time-main {
          font-size: 2.8em;
        }
        .elegant-calendar-layout {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-lg);
        }
        .calendar-header {
          border-right: none;
          border-bottom: 2px solid rgba(255,255,255,0.3);
          padding-right: 0;
          padding-bottom: var(--cf-spacing-lg);
        }
        .nature-time-layout {
          grid-template-columns: 1fr;
          text-align: center;
        }
      }
    `;
  }
}

export default WelcomeCard;
export const manifest = WelcomeCard.manifest;