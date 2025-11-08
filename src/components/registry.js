export class Registry {
  static _styles = new Map();
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;
    
    // 直接内联注册所有外观，避免路径问题
    await this._registerBuiltinStyles();
    this._initialized = true;
  }

  static async _registerBuiltinStyles() {
    try {
      // 直接内联所有外观配置
      const builtinStyles = [
        this._createTimeWeekStyle(),
        this._createTimeCardStyle(),
        this._createClockLunarStyle(),
        this._createWelcomeStyle(),
        this._createWeatherStyle()
      ];

      builtinStyles.forEach(style => {
        if (this.validateStyleConfig(style)) {
          this._styles.set(style.name, style);
          console.log(`✅ 注册外观: ${style.displayName}`);
        }
      });

      console.log(`🎨 已注册 ${this._styles.size} 个外观样式`);

    } catch (error) {
      console.error('注册外观失败:', error);
    }
  }

  static _createTimeWeekStyle() {
    return {
      name: 'time-week',
      displayName: '时间星期',
      icon: '⏰',
      description: '垂直布局的时间星期卡片',
      category: 'time',
      version: '1.0.0',
      
      requiresEntities: true,
      entityInterfaces: {
        required: [
          { 
            key: 'time', 
            type: 'sensor', 
            description: '时间实体',
            default: 'sensor.time'
          },
          { 
            key: 'date', 
            type: 'sensor', 
            description: '日期实体',
            default: 'sensor.date'
          }
        ],
        optional: [
          { 
            key: 'week', 
            type: 'sensor', 
            description: '星期实体',
            default: 'sensor.xing_qi'
          }
        ]
      },
      
      cardSize: 3,
      
      render: function(config, hass, entities) {
        const timeEntity = entities.get('time');
        const dateEntity = entities.get('date');
        const weekEntity = entities.get('week');

        const time = timeEntity?.state || '00:00';
        const date = dateEntity?.state || '2000-01-01';
        const week = weekEntity?.state || '星期一';
        
        const timeParts = time.split(':');
        const dateParts = date.split('-');
        const dateDisplay = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}日` : '01/01';

        return `
          <div class="time-week-card" style="
            display: grid;
            grid-template-areas: 'a' 'b' 'c';
            grid-template-columns: 100%;
            grid-template-rows: 1fr 1fr 1fr;
            height: 200px;
            align-items: center;
          ">
            <div class="time-hour" style="
              grid-area: a;
              font-size: 3.2em;
              font-weight: bold;
              letter-spacing: 1px;
              text-align: center;
            ">${timeParts[0] || '00'}</div>
            
            <div class="time-minute" style="
              grid-area: b;
              font-size: 3.2em;
              font-weight: bold;
              letter-spacing: 1px;
              text-align: center;
            ">${timeParts[1] || '00'}</div>
            
            <div class="date-week" style="
              grid-area: c;
              font-size: 1em;
              letter-spacing: 2px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
            ">
              <div class="date" style="color: red;">${dateDisplay}</div>
              <div class="week" style="
                font-size: 0.8rem;
                background-color: red;
                color: white;
                border-radius: 10px;
                padding: 4px 12px;
                width: 60%;
              ">${week}</div>
            </div>
          </div>
        `;
      },
      
      preview: function() {
        return `
          <div style="
            padding: 16px;
            background: var(--card-background-color);
            border-radius: 8px;
            text-align: center;
            height: 120px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          ">
            <div style="font-size: 2em; margin-bottom: 8px;">⏰</div>
            <div style="font-weight: bold; margin-bottom: 4px;">时间星期</div>
            <div style="font-size: 0.8em; color: var(--secondary-text-color);">
              垂直布局的时间显示
            </div>
          </div>
        `;
      }
    };
  }

  static _createTimeCardStyle() {
    return {
      name: 'time-card',
      displayName: '时间卡片',
      icon: '🕒',
      description: '水平布局的时间日期卡片',
      category: 'time',
      version: '1.0.0',
      
      requiresEntities: true,
      entityInterfaces: {
        required: [
          { 
            key: 'time', 
            type: 'sensor', 
            description: '时间实体',
            default: 'sensor.time'
          },
          { 
            key: 'date', 
            type: 'sensor', 
            description: '日期实体',
            default: 'sensor.date'
          }
        ],
        optional: [
          { 
            key: 'week', 
            type: 'sensor', 
            description: '星期实体',
            default: 'sensor.xing_qi'
          }
        ]
      },
      
      cardSize: 2,
      
      render: function(config, hass, entities) {
        const timeEntity = entities.get('time');
        const dateEntity = entities.get('date');
        const weekEntity = entities.get('week');

        const time = timeEntity?.state || '00:00';
        const date = dateEntity?.state || '2000-01-01';
        const week = weekEntity?.state || '星期一';
        
        const timeParts = time.split(':');
        const dateParts = date.split('-');
        const month = dateParts.length === 3 ? `${dateParts[1]}月` : '01月';
        const day = dateParts.length === 3 ? dateParts[2] : '01';

        return `
          <div class="time-card" style="
            display: grid;
            grid-template-areas: 'a b c';
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            height: 120px;
            align-items: center;
          ">
            <div class="hour-section" style="
              grid-area: a;
              justify-self: end;
              margin-right: 5px;
              text-align: center;
            ">
              <div class="label" style="
                font-size: 0.7em;
                margin-bottom: 4px;
                color: var(--secondary-text-color);
              ">TIME</div>
              <div class="value hour-value" style="
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 4px;
                color: rgba(var(--rgb-primary-text-color), 0.7);
              ">${timeParts[0] || '00'}</div>
              <div class="unit" style="
                font-size: 0.7em;
                color: var(--secondary-text-color);
              ">时</div>
            </div>
            
            <div class="date-section" style="
              grid-area: b;
              text-align: center;
            ">
              <div class="label" style="
                font-size: 0.7em;
                margin-bottom: 4px;
                color: var(--secondary-text-color);
              ">${month}</div>
              <div class="value date-value" style="
                font-size: 2.8em;
                font-weight: bold;
                margin-bottom: 4px;
              ">${day}</div>
              <div class="unit" style="
                font-size: 0.7em;
                color: var(--secondary-text-color);
              ">${week}</div>
            </div>
            
            <div class="minute-section" style="
              grid-area: c;
              justify-self: start;
              margin-left: 5px;
              text-align: center;
            ">
              <div class="label" style="
                font-size: 0.7em;
                margin-bottom: 4px;
                color: var(--secondary-text-color);
              ">TIME</div>
              <div class="value minute-value" style="
                font-size: 2em;
                font-weight: bold;
                margin-bottom: 4px;
                color: rgba(var(--rgb-primary-text-color), 0.7);
              ">${timeParts[1] || '00'}</div>
              <div class="unit" style="
                font-size: 0.7em;
                color: var(--secondary-text-color);
              ">分</div>
            </div>
          </div>
        `;
      },
      
      preview: function() {
        return `
          <div style="
            padding: 12px;
            background: var(--card-background-color);
            border-radius: 8px;
            height: 80px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
            align-items: center;
          ">
            <div style="text-align: center;">
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">TIME</div>
              <div style="font-size: 1.2em; font-weight: bold; color: rgba(var(--rgb-primary-text-color), 0.7);">14</div>
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">时</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">08月</div>
              <div style="font-size: 1.8em; font-weight: bold;">15</div>
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">星期四</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">TIME</div>
              <div style="font-size: 1.2em; font-weight: bold; color: rgba(var(--rgb-primary-text-color), 0.7);">30</div>
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">分</div>
            </div>
          </div>
        `;
      }
    };
  }

  static _createClockLunarStyle() {
    return {
      name: 'clock-lunar',
      displayName: '时钟农历',
      icon: '🌙',
      description: '模拟时钟和农历信息',
      category: 'time',
      version: '1.0.0',
      
      requiresEntities: true,
      entityInterfaces: {
        required: [
          { 
            key: 'time', 
            type: 'sensor', 
            description: '时间实体',
            default: 'sensor.time'
          },
          { 
            key: 'date', 
            type: 'sensor', 
            description: '日期实体',
            default: 'sensor.date'
          },
          { 
            key: 'lunar', 
            type: 'sensor', 
            description: '农历实体',
            default: 'sensor.nong_li'
          }
        ]
      },
      
      cardSize: 4,
      
      render: function(config, hass, entities) {
        const timeEntity = entities.get('time');
        const dateEntity = entities.get('date');
        const lunarEntity = entities.get('lunar');

        const time = timeEntity?.state || '00:00';
        const date = dateEntity?.state || '2000-01-01';
        
        const dateObj = new Date(date);
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        const lunarWeek = lunarEntity?.attributes?.lunar?.星期 || '星期一';
        const lunarYear = lunarEntity?.attributes?.lunar?.年干支 || '';
        const lunarState = lunarEntity?.state || '';
        const solarTerm = lunarEntity?.attributes?.lunar?.节气?.节气差 || '';

        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        const hourAngle = (hours * 30) + (minutes * 0.5);
        const minuteAngle = minutes * 6;
        const secondAngle = seconds * 6;

        const analogClock = `
          <svg class="clock-svg" viewBox="0 0 100 100" style="width: 100px; height: 100px;">
            <circle class="clock-face" cx="50" cy="50" r="45" fill="var(--card-background-color)" stroke="var(--primary-text-color)" stroke-width="2"/>
            ${Array.from({length: 12}, (_, i) => {
              const angle = i * 30;
              const rad = angle * Math.PI / 180;
              const x1 = 50 + 35 * Math.sin(rad);
              const y1 = 50 - 35 * Math.cos(rad);
              const x2 = 50 + 40 * Math.sin(rad);
              const y2 = 50 - 40 * Math.cos(rad);
              return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--primary-text-color)" stroke-width="2"/>`;
            }).join('')}
            <line class="hour-hand" x1="50" y1="50" x2="${50 + 20 * Math.sin(hourAngle * Math.PI / 180)}" y2="${50 - 20 * Math.cos(hourAngle * Math.PI / 180)}" stroke="var(--primary-color)" stroke-width="3" stroke-linecap="round"/>
            <line class="minute-hand" x1="50" y1="50" x2="${50 + 30 * Math.sin(minuteAngle * Math.PI / 180)}" y2="${50 - 30 * Math.cos(minuteAngle * Math.PI / 180)}" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round"/>
            ${config.show_seconds !== false ? `
              <line class="second-hand" x1="50" y1="50" x2="${50 + 35 * Math.sin(secondAngle * Math.PI / 180)}" y2="${50 - 35 * Math.cos(secondAngle * Math.PI / 180)}" stroke="var(--accent-color)" stroke-width="1" stroke-linecap="round"/>
            ` : ''}
            <circle cx="50" cy="50" r="3" fill="var(--primary-color)"/>
          </svg>
        `;

        return `
          <div class="clock-lunar-card" style="
            display: grid;
            grid-template-areas: 'a b' 'a c' 'a d' 'a e';
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 50% 15% 15% 20%;
            height: 250px;
            align-items: center;
          ">
            <div class="analog-clock" style="grid-area: a; display: flex; justify-content: center; align-items: center;">
              ${analogClock}
            </div>
            
            <div class="time-text" style="
              grid-area: b;
              font-size: 4rem;
              letter-spacing: 2px;
              font-weight: bold;
              text-align: center;
            ">${time.split(':').slice(0, 2).join(':')}</div>
            
            <div class="date-text" style="
              grid-area: c;
              font-size: 1rem;
              font-weight: bold;
              text-align: center;
            ">${month}月${day}号 ${lunarWeek}</div>
            
            <div class="lunar-year" style="
              grid-area: d;
              font-size: 1rem;
              font-weight: bold;
              text-align: center;
            ">${lunarYear} ${lunarState}</div>
            
            <div class="solar-term" style="
              grid-area: e;
              font-size: 1rem;
              letter-spacing: 2px;
              font-weight: bold;
              background-color: coral;
              border-radius: 1em;
              width: 60%;
              justify-self: center;
              text-align: center;
              padding: 4px 0;
            ">${solarTerm}</div>
          </div>
        `;
      },
      
      preview: function() {
        return `
          <div style="
            padding: 16px;
            background: var(--card-background-color);
            border-radius: 8px;
            text-align: center;
            height: 140px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          ">
            <div style="font-size: 2em; margin-bottom: 8px;">🌙</div>
            <div style="font-weight: bold; margin-bottom: 4px;">时钟农历</div>
            <div style="font-size: 0.8em; color: var(--secondary-text-color); margin-bottom: 8px;">
              模拟时钟 + 农历信息
            </div>
            <div style="font-size: 0.7em; color: var(--secondary-text-color);">
              需要时间、日期、农历实体
            </div>
          </div>
        `;
      }
    };
  }

  static _createWelcomeStyle() {
    return {
      name: 'welcome',
      displayName: '欢迎卡片',
      icon: '👋',
      description: '简洁的欢迎信息卡片',
      category: 'info',
      version: '1.0.0',
      
      requiresEntities: false,
      
      cardSize: 2,
      
      render: function(config, hass) {
        const userName = hass?.user?.name || '用户';
        const currentTime = new Date().toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        return `
          <div class="welcome-card" style="
            padding: 24px;
            text-align: center;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            border-radius: 16px;
            height: 120px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          ">
            <div style="font-size: 1.2em; margin-bottom: 8px; opacity: 0.9;">
              你好，${userName}！
            </div>
            <div style="font-size: 2em; font-weight: bold; margin-bottom: 8px;">
              ${currentTime}
            </div>
            <div style="font-size: 0.9em; opacity: 0.8;">
              祝你今天愉快
            </div>
          </div>
        `;
      },
      
      preview: function() {
        return `
          <div style="
            padding: 20px;
            background: linear-gradient(135deg, #2196F3, #E91E63);
            color: white;
            border-radius: 12px;
            text-align: center;
            height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          ">
            <div style="font-size: 1.5em; margin-bottom: 8px;">👋</div>
            <div style="font-weight: bold;">欢迎卡片</div>
            <div style="font-size: 0.8em; opacity: 0.9;">个性化欢迎信息</div>
          </div>
        `;
      }
    };
  }

  static _createWeatherStyle() {
    return {
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
          return `
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

        return `
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
        return `
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
  }

  // 原有的公共方法保持不变
  static validateStyleConfig(config) {
    const required = ['name', 'displayName', 'render'];
    const isValid = required.every(key => key in config);
    
    if (!isValid) {
      console.warn('外观配置缺少必需字段:', required.filter(key => !(key in config)));
    }
    
    return isValid;
  }

  static getStyle(styleName) {
    return this._styles.get(styleName);
  }

  static getAllStyles() {
    return Array.from(this._styles.values());
  }

  static getStylesByCategory(category) {
    return this.getAllStyles().filter(style => 
      !category || style.category === category
    );
  }

  static hasStyle(styleName) {
    return this._styles.has(styleName);
  }

  static registerStyle(styleConfig) {
    if (this.validateStyleConfig(styleConfig)) {
      this._styles.set(styleConfig.name, styleConfig);
      return true;
    }
    return false;
  }
}

window.Registry = Registry;