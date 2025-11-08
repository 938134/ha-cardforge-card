import { html } from 'https://unpkg.com/lit@2.8.0/index.js?module';

export default {
  name: 'weather',
  displayName: '天气卡片',
  icon: '☀️',
  description: '简洁的天气信息显示',
  category: 'weather',
  version: '1.0.0',
  
  requiresEntities: false,
  entityInterfaces: {
    optional: [
      { 
        key: 'weather', 
        type: 'weather', 
        description: '天气实体',
        default: 'weather.home'
      }
    ]
  },
  
  cardSize: 2,
  
  render: function(config, hass, entities) {
    const weatherEntity = entities.get('weather');
    
    if (!weatherEntity) {
      return html`
        <div class="weather-card" style="
          padding: 20px;
          text-align: center;
          background: var(--card-background-color);
          border-radius: 12px;
          height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          color: var(--secondary-text-color);
        ">
          <div style="font-size: 2em; margin-bottom: 8px;">🌤️</div>
          <div>未配置天气实体</div>
        </div>
      `;
    }

    const temperature = weatherEntity.attributes?.temperature || '--';
    const condition = weatherEntity.state || '未知';
    const humidity = weatherEntity.attributes?.humidity || '--';
    
    const weatherIcons = {
      'sunny': '☀️',
      'clear': '☀️',
      'partlycloudy': '⛅',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'snowy': '❄️',
      'windy': '💨',
      'fog': '🌫️'
    };
    
    const weatherIcon = weatherIcons[condition] || '🌤️';

    return html`
      <div class="weather-card" style="
        padding: 20px;
        background: var(--card-background-color);
        border-radius: 12px;
        height: 120px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 16px;
      ">
        <div style="text-align: center;">
          <div style="font-size: 3em;">${weatherIcon}</div>
          <div style="font-size: 0.9em; color: var(--secondary-text-color); margin-top: 4px;">
            ${condition}
          </div>
        </div>
        
        <div>
          <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 8px;">
            ${temperature}°
          </div>
          <div style="font-size: 0.9em; color: var(--secondary-text-color);">
            湿度: ${humidity}%
          </div>
        </div>
      </div>
    `;
  },
  
  preview: function() {
    return html`
      <div style="
        padding: 16px;
        background: var(--card-background-color);
        border-radius: 8px;
        height: 100px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 12px;
      ">
        <div style="text-align: center;">
          <div style="font-size: 2em;">☀️</div>
          <div style="font-size: 0.8em; color: var(--secondary-text-color);">晴朗</div>
        </div>
        <div>
          <div style="font-size: 1.8em; font-weight: bold;">25°</div>
          <div style="font-size: 0.8em; color: var(--secondary-text-color);">湿度: 60%</div>
        </div>
      </div>
    `;
  }
};