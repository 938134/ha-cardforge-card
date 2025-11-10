// src/plugins/welcome-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class WelcomeCardPlugin extends BasePlugin {
  getPluginInfo() {
    return {
      name: '欢迎卡片',
      description: '个性化欢迎信息卡片，支持实体绑定',
      icon: '👋',
      category: 'info'
    };
  }

  getEntityRequirements() {
    return [
      {
        key: 'user',
        description: '用户名称',
        required: false,
        domains: ['person', 'input_text', 'sensor']
      },
      {
        key: 'message',
        description: '欢迎消息',
        required: false,
        domains: ['input_text', 'sensor']
      },
      {
        key: 'weather',
        description: '天气信息',
        required: false,
        domains: ['weather', 'sensor']
      }
    ];
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }

  getTemplate(config, hass, entities) {
    const userEntity = entities.user;
    const messageEntity = entities.message;
    const weatherEntity = entities.weather;
    
    // 获取用户名称
    const userName = this._getUserName(userEntity, hass);
    
    // 获取欢迎消息
    const welcomeMessage = this._getWelcomeMessage(messageEntity);
    
    // 获取天气信息
    const weatherInfo = this._getWeatherInfo(weatherEntity);
    
    const { greeting, time } = this.getSystemData(hass, config);
    
    return `
      <div class="cardforge-card welcome-card">
        <div class="welcome-content">
          <div class="greeting">${greeting}，${userName}！</div>
          <div class="time">${time}</div>
          ${welcomeMessage ? `<div class="message">${welcomeMessage}</div>` : ''}
          ${weatherInfo ? `<div class="weather-info">${weatherInfo}</div>` : ''}
        </div>
        <div class="decoration">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div>
    `;
  }

  _getUserName(userEntity, hass) {
    // 从实体获取用户名称
    if (userEntity) {
      if (userEntity.entity_id.startsWith('person.')) {
        // person 实体
        return userEntity.attributes?.friendly_name || '家人';
      } else if (userEntity.entity_id.startsWith('input_text.')) {
        // input_text 实体
        return userEntity.state || '家人';
      } else if (userEntity.entity_id.startsWith('sensor.')) {
        // sensor 实体
        return userEntity.state || '家人';
      }
    }
    
    // 从 Home Assistant 用户信息获取
    if (hass?.user?.name) {
      return hass.user.name;
    }
    
    // 默认值
    return '家人';
  }

  _getWelcomeMessage(messageEntity) {
    if (messageEntity && messageEntity.state && messageEntity.state !== 'unavailable') {
      return messageEntity.state;
    }
    
    // 默认欢迎消息
    const messages = [
      '祝您今天愉快！',
      '一切准备就绪！',
      '家，因你而温暖',
      '美好的一天开始了',
      '放松心情，享受生活',
      '今天也是充满希望的一天'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  _getWeatherInfo(weatherEntity) {
    if (!weatherEntity) return null;
    
    const state = weatherEntity.state;
    const attributes = weatherEntity.attributes || {};
    
    if (state === 'unavailable' || state === 'unknown') {
      return null;
    }
    
    // 天气图标映射
    const weatherIcons = {
      'sunny': '☀️',
      'clear': '☀️',
      'partlycloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'pouring': '🌧️',
      'snowy': '❄️',
      'windy': '💨',
      'fog': '🌫️',
      'hail': '🌨️',
      'lightning': '⚡'
    };
    
    const condition = attributes.friendly_name || state;
    const temperature = attributes.temperature;
    const icon = weatherIcons[state] || '🌤️';
    
    let weatherText = `${icon} ${condition}`;
    if (temperature !== undefined) {
      weatherText += ` ${temperature}°`;
    }
    
    return weatherText;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .welcome-card {
        ${this._flexCenter()}
        ${this._responsiveHeight('180px', '160px')}
        ${this._responsivePadding('24px', '20px')}
        position: relative;
        overflow: hidden;
      }
      
      .welcome-content {
        position: relative;
        z-index: 2;
        ${this._textCenter()}
        width: 100%;
      }
      
      .greeting {
        ${this._responsiveFontSize('1.4em', '1.2em')}
        font-weight: 600;
        margin-bottom: 8px;
        opacity: 0.95;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .time {
        ${this._responsiveFontSize('2.2em', '1.8em')}
        font-weight: bold;
        margin-bottom: 12px;
        letter-spacing: 1px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .message {
        ${this._responsiveFontSize('1em', '0.9em')}
        opacity: 0.9;
        font-style: italic;
        margin-bottom: 8px;
        text-shadow: 0 1px 1px rgba(0,0,0,0.1);
      }
      
      .weather-info {
        ${this._responsiveFontSize('0.9em', '0.8em')}
        opacity: 0.8;
        background: rgba(255,255,255,0.2);
        border-radius: 12px;
        padding: 4px 12px;
        display: inline-block;
        backdrop-filter: blur(5px);
        text-shadow: 0 1px 1px rgba(0,0,0,0.1);
      }
      
      .decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1;
      }
      
      .circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
      }
      
      .circle-1 {
        width: 80px;
        height: 80px;
        top: -20px;
        right: -20px;
      }
      
      .circle-2 {
        width: 60px;
        height: 60px;
        bottom: -10px;
        left: 20px;
      }
      
      .circle-3 {
        width: 40px;
        height: 40px;
        bottom: 30px;
        right: 40px;
      }
      
      /* 动画效果 */
      .welcome-card:hover .circle-1 {
        animation: float 3s ease-in-out infinite;
      }
      
      .welcome-card:hover .circle-2 {
        animation: float 3s ease-in-out infinite 0.5s;
      }
      
      .welcome-card:hover .circle-3 {
        animation: float 3s ease-in-out infinite 1s;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      
      /* 深色主题适配 */
      .cardforge-card[data-theme="dark"] .welcome-card {
        background: linear-gradient(135deg, #bb86fc, #03dac6);
      }
      
      .cardforge-card[data-theme="dark"] .weather-info {
        background: rgba(0,0,0,0.2);
      }
      
      /* 材质主题适配 */
      .cardforge-card[data-theme="material"] .welcome-card {
        background: linear-gradient(135deg, #6200ee, #03dac6);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    `;
  }
}