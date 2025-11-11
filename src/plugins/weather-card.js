// src/plugins/weather-card.js
import { BasePlugin } from '../core/base-plugin.js';

export const manifest = {
  id: 'weather-card',
  name: '天气卡片',
  version: '1.0.0',
  description: '显示实时天气信息',
  author: 'CardForge Team',
  category: 'weather',
  icon: '🌤️',
  entityRequirements: [
    {
      key: 'weather',
      type: 'weather',
      description: '天气实体',
      required: true,
      domains: ['weather']  // 修正：使用 domains 而不是 type
    }
  ],
  themeSupport: true,
  gradientSupport: true
};

export default class WeatherCardPlugin extends BasePlugin {
  getTemplate(config, hass, entities) {
    const weather = entities.weather;
    const temperature = weather?.attributes?.temperature || '--';
    const condition = weather?.state || '未知';
    const humidity = weather?.attributes?.humidity || '--';
    
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
        display: flex;
        align-items: center;
        gap: 16px;
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
        margin-bottom: 4px;
      }
      .condition {
        ${this._responsiveFontSize('1em', '0.9em')}
        opacity: 0.8;
        margin-bottom: 2px;
      }
      .humidity {
        ${this._responsiveFontSize('0.85em', '0.8em')}
        opacity: 0.6;
      }
      
      @media (max-width: 480px) {
        .weather-content {
          gap: 12px;
        }
        .weather-icon {
          font-size: 2.5em;
        }
      }
    `;
  }
}