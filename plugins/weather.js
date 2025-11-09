// ha-cardforge-card/plugins/weather.js
export default class WeatherPlugin {
  constructor() {
    this.name = 'weather';
    this.displayName = '天气卡片';
    this.icon = '🌤️';
    this.category = 'weather';
  }

  getTemplate(config, entities) {
    const weather = entities.weather;
    const temp = weather?.attributes?.temperature || '--';
    const condition = weather?.state || '未知';
    const humidity = weather?.attributes?.humidity || '--';

    return `
      <div class="cardforge-card weather">
        <div class="icon">${this._getWeatherIcon(condition)}</div>
        <div class="temp">${temp}°</div>
        <div class="condition">${condition}</div>
        <div class="humidity">湿度: ${humidity}%</div>
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
      'fog': '🌫️'
    };
    return icons[condition] || '🌤️';
  }

  getStyles(config) {
    return `
      .weather {
        padding: 20px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        align-items: center;
        height: 120px;
      }
      .weather .icon {
        font-size: 3em;
        text-align: center;
      }
      .weather .temp {
        font-size: 2.5em;
        font-weight: bold;
      }
      .weather .condition {
        grid-column: 1 / -1;
        text-align: center;
        opacity: 0.8;
      }
      .weather .humidity {
        grid-column: 1 / -1;
        text-align: center;
        font-size: 0.9em;
        opacity: 0.7;
      }
    `;
  }
}