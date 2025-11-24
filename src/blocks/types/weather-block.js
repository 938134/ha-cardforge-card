// src/blocks/types/weather-block.js
import { BaseBlock } from '../base-block.js';

class WeatherBlock extends BaseBlock {
  static blockType = 'weather';
  static blockName = '天气';
  static blockIcon = 'mdi:weather-cloudy';
  static category = 'information';
  static description = '显示天气信息';

  render(block, hass) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const entityId = config.entity;
    
    if (!entityId) {
      return this._renderEmpty('请选择天气实体');
    }

    const entity = hass?.states?.[entityId];
    if (!entity) {
      return this._renderEmpty('天气实体未找到');
    }

    const state = entity.state;
    const attributes = entity.attributes || {};
    const temperature = attributes.temperature;
    const humidity = attributes.humidity;
    const forecast = attributes.forecast || [];

    return this._renderContainer(`
      ${this._renderHeader(config.title || attributes.friendly_name || '天气')}
      
      <div class="weather-content">
        <div class="weather-current">
          <div class="weather-icon">
            <ha-icon icon="${this._getWeatherIcon(state)}"></ha-icon>
          </div>
          <div class="weather-temp">${temperature || '--'}°</div>
        </div>
        
        <div class="weather-details">
          ${humidity ? `<div class="weather-detail">湿度: ${humidity}%</div>` : ''}
          <div class="weather-state">${this._getWeatherState(state)}</div>
        </div>
      </div>

      ${config.showForecast && forecast.length > 0 ? this._renderForecast(forecast) : ''}
    `, 'weather-block');
  }

  getStyles(block) {
    return `
      .weather-block .weather-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .weather-current {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-md);
      }

      .weather-icon {
        font-size: 2.5em;
        color: var(--cf-primary-color);
      }

      .weather-temp {
        font-size: 2em;
        font-weight: 300;
        color: var(--cf-text-primary);
      }

      .weather-details {
        text-align: center;
      }

      .weather-detail {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: 4px;
      }

      .weather-state {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        font-weight: 500;
      }

      .weather-forecast {
        margin-top: var(--cf-spacing-md);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
      }

      .forecast-title {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-sm);
        text-align: center;
      }

      .forecast-items {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--cf-spacing-sm);
      }

      .forecast-item {
        text-align: center;
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-sm);
      }

      .forecast-day {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        margin-bottom: 4px;
      }

      .forecast-icon {
        font-size: 1.2em;
        color: var(--cf-primary-color);
        margin: 4px 0;
      }

      .forecast-temp {
        font-size: 0.8em;
        color: var(--cf-text-primary);
        font-weight: 500;
      }

      @container (max-width: 300px) {
        .weather-current {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
        }
        
        .weather-icon {
          font-size: 2em;
        }
        
        .weather-temp {
          font-size: 1.6em;
        }
        
        .forecast-items {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  getEditTemplate(block, hass, onConfigChange) {
    const config = this._getSafeConfig(block, this.getDefaultConfig());
    const entities = this._getWeatherEntities(hass);

    return `
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">天气实体</label>
          <ha-combo-box
            .items="${JSON.stringify(entities)}"
            .value="${config.entity || ''}"
            @value-changed="${e => onConfigChange('entity', e.detail.value)}"
            allow-custom-value
            fullwidth
          ></ha-combo-box>
        </div>
        
        <div class="form-field">
          <label class="form-label">标题</label>
          <ha-textfield
            .value="${config.title || ''}"
            @input="${e => onConfigChange('title', e.target.value)}"
            placeholder="使用实体名称"
            fullwidth
          ></ha-textfield>
        </div>
        
        <div class="switch-item">
          <span class="switch-label">显示天气预报</span>
          <ha-switch
            .checked="${config.showForecast}"
            @change="${e => onConfigChange('showForecast', e.target.checked)}"
          ></ha-switch>
        </div>
      </div>
    `;
  }

  getDefaultConfig() {
    return {
      entity: '',
      title: '',
      showForecast: true
    };
  }

  _getWeatherEntities(hass) {
    if (!hass?.states) return [];
    
    return Object.entries(hass.states)
      .filter(([entityId, entity]) => 
        entityId.startsWith('weather.') ||
        entity.attributes?.temperature !== undefined
      )
      .map(([entityId, entity]) => ({
        value: entityId,
        label: entity.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _getWeatherIcon(state) {
    const iconMap = {
      'sunny': 'mdi:weather-sunny',
      'clear': 'mdi:weather-night',
      'cloudy': 'mdi:weather-cloudy',
      'partlycloudy': 'mdi:weather-partly-cloudy',
      'rainy': 'mdi:weather-rainy',
      'pouring': 'mdi:weather-pouring',
      'snowy': 'mdi:weather-snowy',
      'windy': 'mdi:weather-windy',
      'fog': 'mdi:weather-fog',
      'hail': 'mdi:weather-hail'
    };
    
    return iconMap[state] || 'mdi:weather-cloudy';
  }

  _getWeatherState(state) {
    const stateMap = {
      'sunny': '晴朗',
      'clear': '晴朗',
      'cloudy': '多云',
      'partlycloudy': '局部多云',
      'rainy': '雨天',
      'pouring': '大雨',
      'snowy': '雪天',
      'windy': '大风',
      'fog': '雾天',
      'hail': '冰雹'
    };
    
    return stateMap[state] || state;
  }

  _renderForecast(forecast) {
    const today = new Date();
    const nextDays = forecast.slice(0, 3);
    
    return `
      <div class="weather-forecast">
        <div class="forecast-title">未来预报</div>
        <div class="forecast-items">
          ${nextDays.map((day, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() + index + 1);
            const dayName = this._getDayName(date);
            
            return `
              <div class="forecast-item">
                <div class="forecast-day">${dayName}</div>
                <ha-icon class="forecast-icon" icon="${this._getWeatherIcon(day.condition)}"></ha-icon>
                <div class="forecast-temp">${day.temperature}°</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  _getDayName(date) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  }

  _renderEmpty(message) {
    return this._renderContainer(`
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
        <ha-icon icon="mdi:weather-cloudy" class="cf-text-secondary"></ha-icon>
        <div class="cf-text-sm cf-mt-sm cf-text-secondary">${message}</div>
      </div>
    `, 'weather-block empty');
  }
}

export default WeatherBlock;