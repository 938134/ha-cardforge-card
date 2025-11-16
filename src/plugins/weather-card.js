// src/plugins/weather-card.js
import { BasePlugin } from '../core/base-plugin.js';

class WeatherCard extends BasePlugin {
  static manifest = {
    id: 'weather-card',
    name: '天气卡片',
    version: '1.0.0',
    description: '优雅的天气信息展示卡片，支持当前天气和预报',
    category: 'environment',
    icon: '🌤️',
    author: 'CardForge Team',
    
    config_schema: {
      // 布局配置
      layout_style: {
        type: 'select',
        label: '布局风格',
        options: ['modern', 'compact', 'detailed'],
        default: 'modern',
        description: '选择天气卡片的布局风格'
      },
      
      show_location: {
        type: 'boolean',
        label: '显示位置',
        default: true,
        description: '显示天气位置信息'
      },
      
      show_feels_like: {
        type: 'boolean',
        label: '显示体感温度',
        default: true,
        description: '显示体感温度信息'
      },
      
      show_details: {
        type: 'boolean',
        label: '显示详细信息',
        default: true,
        description: '显示湿度、风速等详细信息'
      },
      
      show_forecast: {
        type: 'boolean',
        label: '显示天气预报',
        default: false,
        description: '显示未来几天的天气预报'
      },
      
      // 显示配置
      temperature_unit: {
        type: 'select',
        label: '温度单位',
        options: ['celsius', 'fahrenheit'],
        default: 'celsius',
        description: '选择温度显示单位'
      },
      
      forecast_days: {
        type: 'number',
        label: '预报天数',
        default: 3,
        min: 0,
        max: 7,
        description: '显示未来几天的天气预报'
      }
    },
    
    entity_requirements: [
      {
        key: 'weather',
        description: '天气实体',
        required: true,
        type: 'weather'
      }
    ]
  };

  // 天气图标映射
  _getWeatherIcon(condition) {
    const iconMap = {
      // 晴天
      'sunny': '☀️',
      'clear': '☀️',
      'clear-night': '🌙',
      
      // 多云
      'cloudy': '☁️',
      'partlycloudy': '⛅',
      'partly-cloudy-day': '⛅',
      'partly-cloudy-night': '☁️',
      
      // 雨天
      'rainy': '🌧️',
      'pouring': '🌧️',
      'rain': '🌧️',
      'lightning-rainy': '⛈️',
      
      // 雪天
      'snowy': '❄️',
      'snowy-rainy': '🌨️',
      'snow': '❄️',
      
      // 其他
      'fog': '🌫️',
      'windy': '💨',
      'windy-variant': '💨',
      'hail': '🌨️'
    };
    
    return iconMap[condition] || '🌈';
  }

  // 解析天气数据
  _parseWeatherData(weatherEntity) {
    if (!weatherEntity) return null;
    
    const attributes = weatherEntity.attributes || {};
    const state = weatherEntity.state;
    
    // 处理温度单位转换
    const temperature = attributes.temperature || this._parseTemperature(state);
    const feelsLike = attributes.temperature || attributes.feels_like;
    
    return {
      condition: attributes.condition || this._mapCondition(state),
      temperature: temperature,
      feels_like: feelsLike,
      humidity: attributes.humidity,
      pressure: attributes.pressure,
      wind_speed: attributes.wind_speed,
      wind_bearing: attributes.wind_bearing,
      visibility: attributes.visibility,
      forecast: attributes.forecast || [],
      location: attributes.friendly_name || '当前位置',
      attribution: attributes.attribution
    };
  }

  // 从状态中解析温度
  _parseTemperature(state) {
    // 尝试从状态字符串中提取温度数字
    const tempMatch = state.match(/(-?\d+(?:\.\d+)?)/);
    return tempMatch ? tempMatch[1] : state;
  }

  // 映射天气状态到标准条件
  _mapCondition(state) {
    const stateLower = state.toLowerCase();
    
    if (stateLower.includes('sun') || stateLower.includes('clear')) return 'sunny';
    if (stateLower.includes('cloud')) return 'cloudy';
    if (stateLower.includes('rain')) return 'rainy';
    if (stateLower.includes('snow')) return 'snowy';
    if (stateLower.includes('fog') || stateLower.includes('mist')) return 'fog';
    if (stateLower.includes('wind')) return 'windy';
    
    return stateLower;
  }

  // 格式化温度显示
  _formatTemperature(temp, unit = 'celsius') {
    if (!temp) return '-';
    
    const num = this._safeParseFloat(temp);
    if (isNaN(num)) return temp;
    
    // 单位转换
    if (unit === 'fahrenheit') {
      const fahrenheit = (num * 9/5) + 32;
      return Math.round(fahrenheit);
    }
    
    return Math.round(num);
  }

  // 获取风向描述
  _getWindDirection(bearing) {
    if (!bearing) return '';
    
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  getTemplate(config, hass, entities) {
    const weatherData = this._parseWeatherData(entities.weather);
    
    if (!weatherData) {
      return this._renderError('天气数据不可用', '🌫️');
    }

    const layoutStyle = config.layout_style || 'modern';
    const showLocation = config.show_location !== false;
    const showFeelsLike = config.show_feels_like !== false;
    const showDetails = config.show_details !== false;
    const showForecast = config.show_forecast || false;
    const temperatureUnit = config.temperature_unit || 'celsius';
    const forecastDays = config.forecast_days || 3;

    const temperature = this._formatTemperature(weatherData.temperature, temperatureUnit);
    const feelsLike = this._formatTemperature(weatherData.feels_like, temperatureUnit);
    const weatherIcon = this._getWeatherIcon(weatherData.condition);
    const windDirection = this._getWindDirection(weatherData.wind_bearing);

    // 过滤预报数据
    const forecast = weatherData.forecast.slice(0, forecastDays);

    return `
      <div class="cardforge-responsive-container weather-card layout-${layoutStyle}">
        <div class="cardforge-content-grid">
          <!-- 主要天气信息 -->
          <div class="weather-main">
            ${showLocation ? `
              <div class="location-info">
                <div class="location-icon">📍</div>
                <div class="location-name">${weatherData.location}</div>
              </div>
            ` : ''}
            
            <div class="current-weather">
              <div class="weather-icon">${weatherIcon}</div>
              <div class="temperature-section">
                <div class="temperature">${temperature}°</div>
                ${showFeelsLike && feelsLike ? `
                  <div class="feels-like">体感 ${feelsLike}°</div>
                ` : ''}
              </div>
              <div class="condition">${weatherData.condition}</div>
            </div>
          </div>

          <!-- 详细信息 -->
          ${showDetails ? `
            <div class="weather-details">
              <div class="detail-grid">
                ${weatherData.humidity ? `
                  <div class="detail-item humidity">
                    <div class="detail-icon">💧</div>
                    <div class="detail-info">
                      <div class="detail-value">${weatherData.humidity}%</div>
                      <div class="detail-label">湿度</div>
                    </div>
                  </div>
                ` : ''}
                
                ${weatherData.wind_speed ? `
                  <div class="detail-item wind">
                    <div class="detail-icon">💨</div>
                    <div class="detail-info">
                      <div class="detail-value">${weatherData.wind_speed}${windDirection ? ` ${windDirection}` : ''}</div>
                      <div class="detail-label">风速</div>
                    </div>
                  </div>
                ` : ''}
                
                ${weatherData.pressure ? `
                  <div class="detail-item pressure">
                    <div class="detail-icon">📊</div>
                    <div class="detail-info">
                      <div class="detail-value">${weatherData.pressure}hPa</div>
                      <div class="detail-label">气压</div>
                    </div>
                  </div>
                ` : ''}
                
                ${weatherData.visibility ? `
                  <div class="detail-item visibility">
                    <div class="detail-icon">👁️</div>
                    <div class="detail-info">
                      <div class="detail-value">${weatherData.visibility}km</div>
                      <div class="detail-label">能见度</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- 天气预报 -->
          ${showForecast && forecast.length > 0 ? `
            <div class="weather-forecast">
              <div class="forecast-header">天气预报</div>
              <div class="forecast-grid">
                ${forecast.map(day => {
                  const forecastTemp = this._formatTemperature(day.temperature, temperatureUnit);
                  const forecastIcon = this._getWeatherIcon(day.condition);
                  const date = new Date(day.datetime);
                  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                  const weekday = weekdays[date.getDay()];
                  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                  
                  return `
                    <div class="forecast-item">
                      <div class="forecast-day">${weekday}</div>
                      <div class="forecast-date">${dateStr}</div>
                      <div class="forecast-icon">${forecastIcon}</div>
                      <div class="forecast-temp">${forecastTemp}°</div>
                      <div class="forecast-condition">${day.condition}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getStyles(config) {
    const layoutStyle = config.layout_style || 'modern';
    const showDetails = config.show_details !== false;
    const showForecast = config.show_forecast || false;

    return `
      ${this.getBaseStyles(config)}
      
      .weather-card {
        padding: var(--cf-spacing-lg);
        background: linear-gradient(135deg, var(--card-background-color) 0%, rgba(var(--cf-rgb-primary), 0.05) 100%);
      }
      
      /* 位置信息 */
      .location-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }
      
      .location-icon {
        font-size: 1em;
        opacity: 0.8;
      }
      
      .location-name {
        font-size: 0.95em;
        font-weight: 500;
        color: var(--cf-text-secondary);
      }
      
      /* 当前天气 */
      .current-weather {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-lg);
        margin-bottom: ${showDetails ? 'var(--cf-spacing-lg)' : '0'};
      }
      
      .weather-icon {
        font-size: 3.5em;
        line-height: 1;
        animation: weather-float 3s ease-in-out infinite;
      }
      
      .temperature-section {
        flex: 1;
      }
      
      .temperature {
        font-size: 2.5em;
        font-weight: 300;
        color: var(--cf-text-primary);
        line-height: 1;
        margin-bottom: 4px;
        font-variant-numeric: tabular-nums;
      }
      
      .feels-like {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: 4px;
      }
      
      .condition {
        font-size: 1em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      /* 详细信息网格 */
      .weather-details {
        margin: var(--cf-spacing-lg) 0;
      }
      
      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--cf-spacing-md);
      }
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.1);
      }
      
      .detail-icon {
        font-size: 1.2em;
        opacity: 0.8;
        flex-shrink: 0;
      }
      
      .detail-info {
        flex: 1;
      }
      
      .detail-value {
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }
      
      .detail-label {
        font-size: 0.75em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }
      
      /* 天气预报 */
      .weather-forecast {
        margin-top: var(--cf-spacing-lg);
        padding-top: var(--cf-spacing-lg);
        border-top: 1px solid rgba(var(--cf-rgb-primary), 0.1);
      }
      
      .forecast-header {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-md);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .forecast-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--cf-spacing-sm);
      }
      
      .forecast-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.03);
        border-radius: var(--cf-radius-md);
        text-align: center;
      }
      
      .forecast-day {
        font-size: 0.8em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
      }
      
      .forecast-date {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        margin-bottom: 6px;
      }
      
      .forecast-icon {
        font-size: 1.5em;
        margin-bottom: 6px;
      }
      
      .forecast-temp {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
      }
      
      .forecast-condition {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        line-height: 1.2;
      }
      
      /* 布局变体 */
      .layout-compact .current-weather {
        gap: var(--cf-spacing-md);
      }
      
      .layout-compact .weather-icon {
        font-size: 2.5em;
      }
      
      .layout-compact .temperature {
        font-size: 2em;
      }
      
      .layout-detailed .detail-grid {
        grid-template-columns: repeat(4, 1fr);
      }
      
      .layout-detailed .forecast-grid {
        grid-template-columns: repeat(4, 1fr);
      }
      
      /* 动画效果 */
      @keyframes weather-float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-3px);
        }
      }
      
      /* 响应式优化 */
      @media (max-width: 600px) {
        .weather-card {
          padding: var(--cf-spacing-md);
        }
        
        .current-weather {
          gap: var(--cf-spacing-md);
        }
        
        .weather-icon {
          font-size: 3em;
        }
        
        .temperature {
          font-size: 2em;
        }
        
        .detail-grid {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
        
        .forecast-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .layout-detailed .detail-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .layout-detailed .forecast-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @media (max-width: 400px) {
        .weather-card {
          padding: var(--cf-spacing-sm);
        }
        
        .current-weather {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-sm);
        }
        
        .weather-icon {
          font-size: 2.5em;
        }
        
        .temperature {
          font-size: 1.8em;
        }
        
        .forecast-grid {
          grid-template-columns: 1fr;
        }
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .weather-card {
          background: linear-gradient(135deg, var(--card-background-color) 0%, rgba(255, 255, 255, 0.03) 100%);
        }
        
        .detail-item {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .forecast-item {
          background: rgba(255, 255, 255, 0.03);
        }
      }
      
      /* 主题适配 */
      .theme-glass .weather-card {
        backdrop-filter: blur(20px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .theme-glass .detail-item {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      
      .theme-gradient .weather-card {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
        color: white;
      }
      
      .theme-gradient .location-name,
      .theme-gradient .feels-like,
      .theme-gradient .condition,
      .theme-gradient .detail-label,
      .theme-gradient .forecast-header,
      .theme-gradient .forecast-date,
      .theme-gradient .forecast-condition {
        color: rgba(255, 255, 255, 0.9);
      }
      
      .theme-gradient .detail-item {
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
    `;
  }
}

export default WeatherCard;
export const manifest = WeatherCard.manifest;