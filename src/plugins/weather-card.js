// src/plugins/weather-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'weather-card',
  name: '天气卡片',
  version: '1.1.0',
  description: '显示实时天气信息，支持灵活数据源配置',
  author: 'CardForge Team',
  category: 'weather',
  icon: '🌤️',
  entityRequirements: [
    {
      key: 'weather_source',
      description: '天气实体来源',
      required: true
    },
    {
      key: 'temperature_source',
      description: '温度来源（覆盖天气实体的温度）',
      required: false
    },
    {
      key: 'humidity_source',
      description: '湿度来源（覆盖天气实体的湿度）',
      required: false
    }
  ],
  themeSupport: true,
  gradientSupport: true
};

export default class WeatherCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const weatherEntity = entities.weather_source;
    
    // 使用统一数据获取方法
    const temperature = this._getCardValue(hass, entities, 'temperature_source') || 
                       weatherEntity?.attributes?.temperature || '--';
    const condition = weatherEntity?.state || '未知';
    const humidity = this._getCardValue(hass, entities, 'humidity_source') || 
                    weatherEntity?.attributes?.humidity || '--';
    
    return `
      <div class="cardforge-card weather-card">
        <div class="weather-content">
          <div class="weather-icon">${this._getWeatherIcon(condition)}</div>
          <div class="weather-info">
            <div class="temperature">${temperature}°</div>
            <div class="condition">${condition}</div>
            <div class="humidity">湿度: ${humidity}%</div>
          </div>
        </div>
      </div>
    `;
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
      'fog': '🌫️',
      'clear-night': '🌙'
    };
    return icons[condition?.toLowerCase()] || '🌤️';
  }

  getStyles(config) {
    return this.getBaseStyles(config) + `
      .weather-card {
        ${this._responsivePadding('20px', '16px')}
        ${this._responsiveHeight('120px', '100px')}
      }
      
      .weather-content {
        ${this._flexRow()}
        ${this._responsiveGap('16px', '12px')}
        height: 100%;
      }
      
      .weather-icon {
        font-size: 3em;
        flex-shrink: 0;
      }
      
      .weather-info {
        flex: 1;
      }
      
      .temperature {
        ${this._responsiveFontSize('2.2em', '1.8em')}
        font-weight: bold;
        color: var(--primary-color);
        line-height: 1;
        ${this._responsiveMargin('0 0 4px', '0 0 3px')}
      }
      
      .condition {
        ${this._responsiveFontSize('1em', '0.9em')}
        opacity: 0.8;
        ${this._responsiveMargin('0 0 2px', '0 0 1px')}
      }
      
      .humidity {
        ${this._responsiveFontSize('0.85em', '0.8em')}
        opacity: 0.6;
      }
      
      /* 响应式优化 */
      @media (max-width: 480px) {
        .weather-icon {
          font-size: 2.5em;
        }
      }
      
      /* 主题适配 */
      .weather-card.glass .temperature {
        color: var(--primary-text-color);
      }
    `;
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['var(--primary-color)', 'var(--accent-color)']
    };
  }
}