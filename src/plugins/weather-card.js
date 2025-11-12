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
    }
  ],
  themeSupport: true,
  gradientSupport: true
};

export default class WeatherCardPlugin extends BasePlugin {
  constructor() {
    super();
    this._weatherData = this.createReactiveData({
      temperature: '--',
      condition: '未知',
      humidity: '--',
      forecast: []
    });
  }

  onEntitiesUpdate(entities) {
    if (entities.weather) {
      this._updateWeatherData(entities.weather);
    }
  }

  _updateWeatherData(weatherEntity) {
    const attributes = weatherEntity.attributes || {};
    
    this._weatherData.value = {
      temperature: attributes.temperature || '--',
      condition: weatherEntity.state || '未知',
      humidity: attributes.humidity || '--',
      forecast: attributes.forecast || []
    };
  }

  _getWeatherIcon(condition) {
    const iconMap = {
      'sunny': '☀️',
      'clear': '☀️',
      'partlycloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'snowy': '❄️',
      'snowy-rainy': '🌨️',
      'pouring': '🌧️',
      'windy': '💨',
      'windy-variant': '💨',
      'fog': '🌫️',
      'hail': '🌨️',
      'lightning': '⚡',
      'lightning-rainy': '⛈️',
      'clear-night': '🌙',
      'partlycloudy-night': '☁️'
    };

    return iconMap[condition?.toLowerCase()] || '🌤️';
  }

  _getConditionText(condition) {
    const conditionMap = {
      'sunny': '晴朗',
      'clear': '晴朗',
      'partlycloudy': '局部多云',
      'cloudy': '多云',
      'rainy': '雨天',
      'snowy': '雪天',
      'windy': '大风',
      'fog': '雾天',
      'clear-night': '晴朗夜晚'
    };

    return conditionMap[condition?.toLowerCase()] || condition;
  }

  getThemeConfig() {
    return {
      useGradient: true,
      gradientType: 'diagonal',
      gradientColors: ['#4facfe', '#00f2fe']
    };
  }

  getTemplate(config, hass, entities) {
    const { temperature, condition, humidity } = this._weatherData.value;
    const weatherIcon = this._getWeatherIcon(condition);
    const conditionText = this._getConditionText(condition);

    return `
      <div class="cardforge-card weather-card">
        <div class="weather-content">
          <div class="weather-icon">${weatherIcon}</div>
          <div class="weather-info">
            <div class="temperature">${temperature}°</div>
            <div class="condition">${conditionText}</div>
            <div class="details">
              <div class="humidity">
                <ha-icon icon="mdi:water-percent" class="detail-icon"></ha-icon>
                湿度: ${humidity}%
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config) + this.css`
      .weather-card {
        ${this.responsive(
          'height: 140px; padding: 20px;',
          'height: 120px; padding: 16px;'
        )}
        color: white !important;
      }

      .weather-content {
        display: flex;
        align-items: center;
        gap: 16px;
        height: 100%;
      }

      .weather-icon {
        ${this.responsive(
          'font-size: 3.5em;',
          'font-size: 2.8em;'
        )}
        flex-shrink: 0;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }

      .weather-info {
        flex: 1;
      }

      .temperature {
        ${this.responsive(
          'font-size: 2.4em; margin-bottom: 4px;',
          'font-size: 2em; margin-bottom: 3px;'
        )}
        font-weight: 700;
        line-height: 1;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

      .condition {
        ${this.responsive(
          'font-size: 1.1em; margin-bottom: 8px;',
          'font-size: 1em; margin-bottom: 6px;'
        )}
        font-weight: 500;
        opacity: 0.95;
        line-height: 1.2;
      }

      .details {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .humidity {
        display: flex;
        align-items: center;
        gap: 4px;
        ${this.responsive(
          'font-size: 0.9em;',
          'font-size: 0.8em;'
        )}
        opacity: 0.8;
      }

      .detail-icon {
        --mdc-icon-size: 16px;
        opacity: 0.7;
      }

      /* 动画效果 */
      .weather-card:hover .weather-icon {
        animation: bounce 1s ease;
      }

      @keyframes bounce {
        0%, 20%, 60%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-5px);
        }
        80% {
          transform: translateY(-2px);
        }
      }

      /* 移动端优化 */
      @media (max-width: 480px) {
        .weather-content {
          gap: 12px;
        }
        
        .details {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
      }
    `;
  }

  getCardSize() {
    return 2;
  }
}
