// src/plugins/weather-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeatherCard extends BasePlugin {
  static manifest = {
    id: 'weather-card',
    name: '天气卡片',
    version: '1.0.0',
    description: '显示天气信息',
    category: '环境',
    icon: '🌤️',
    entityRequirements: [
      {
        key: 'weather',
        description: '天气实体',
        required: true
      }
    ]
  };

  _processWeatherData(weatherEntity) {
    if (!weatherEntity) return null;
    
    const attributes = weatherEntity.attributes || {};
    
    return {
      temperature: attributes.temperature || weatherEntity.state,
      condition: this._mapWeatherCondition(attributes.condition),
      humidity: attributes.humidity,
      pressure: attributes.pressure,
      wind_speed: attributes.wind_speed,
      forecast: attributes.forecast || []
    };
  }

  _mapWeatherCondition(condition) {
    const conditionMap = {
      'sunny': '☀️', 'clear': '☀️',
      'cloudy': '☁️', 'partlycloudy': '⛅',
      'rainy': '🌧️', 'pouring': '🌧️',
      'snowy': '❄️', 'snowy-rainy': '🌨️',
      'windy': '💨', 'fog': '🌫️'
    };
    return conditionMap[condition] || '🌈';
  }

  getTemplate(config, hass, entities) {
    const weatherData = this._processWeatherData(entities.weather);
    
    if (!weatherData) {
      return this._renderError('天气数据不可用', '🌫️');
    }

    return `
      <div class="cardforge-card-container cardforge-animate-fadeIn">
        <div class="cardforge-card-content">
          <div class="cardforge-content-area cardforge-gap-md">
            <div class="cardforge-flex-row cardforge-flex-center cardforge-gap-md">
              <div class="cardforge-content-large">${weatherData.condition}</div>
              <div class="cardforge-content-large">${weatherData.temperature}°</div>
            </div>
            <div class="cardforge-content-body">
              <div>湿度: ${weatherData.humidity}%</div>
              <div>风速: ${weatherData.wind_speed} m/s</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getStyles(config) {
    return this.getBaseStyles(config);
  }
}

export default WeatherCard;
export const manifest = WeatherCard.manifest;