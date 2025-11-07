export class CardRegistry {
  static _initialized = false;
  static _cards = new Map();
  static _categories = new Map();

  static async initialize() {
    if (this._initialized) return;

    // 注册分类
    this._registerCategories();
    
    // 直接注册卡片配置，避免动态导入
    await this._registerCardConfigs();
    
    this._initialized = true;
  }

  static _registerCategories() {
    const categories = {
      'time': { name: '时间日期', icon: '⏰', color: '#4CAF50' },
      'weather': { name: '天气环境', icon: '☀️', color: '#FF9800' },
      'device': { name: '设备状态', icon: '💡', color: '#2196F3' },
      'person': { name: '人员信息', icon: '👤', color: '#9C27B0' },
      'media': { name: '媒体控制', icon: '🎵', color: '#E91E63' },
      'other': { name: '其他', icon: '📦', color: '#607D8B' }
    };

    Object.entries(categories).forEach(([id, config]) => {
      this._categories.set(id, config);
    });
  }

  static async _registerCardConfigs() {
    try {
      // 直接内联卡片配置，避免动态导入
      const timeWeekCard = {
        type: 'time-week',
        name: '时间星期卡片',
        icon: '⏰',
        description: '垂直布局的时间星期卡片',
        category: 'time',
        tags: ['时间', '日期', '星期', '垂直布局'],
        entityInterfaces: {
          required: [
            { 
              key: 'time', 
              type: 'sensor', 
              description: '时间实体',
              default: 'sensor.time',
              filters: { domain: 'sensor' }
            },
            { 
              key: 'date', 
              type: 'sensor', 
              description: '日期实体',
              default: 'sensor.date',
              filters: { domain: 'sensor' }
            }
          ],
          optional: [
            { 
              key: 'week', 
              type: 'sensor', 
              description: '星期实体',
              default: 'sensor.xing_qi',
              filters: { domain: 'sensor' }
            }
          ]
        },
        layout: {
          grid: {
            templateAreas: '"a" "b" "c"',
            templateColumns: '100%',
            templateRows: '1fr 1fr 1fr',
            gap: '0',
            custom: `
              height: 200px;
              align-items: center;
            `
          }
        },
        styles: {
          timeHour: [
            'font-size: 3.2em',
            'font-weight: bold',
            'letter-spacing: 1px',
            'text-align: center'
          ],
          timeMinute: [
            'font-size: 3.2em',
            'font-weight: bold', 
            'letter-spacing: 1px',
            'text-align: center'
          ],
          dateWeek: [
            'font-size: 1em',
            'letter-spacing: 2px',
            'text-align: center',
            'display: flex',
            'flex-direction: column',
            'align-items: center',
            'gap: 4px'
          ],
          date: [
            'color: red'
          ],
          week: [
            'font-size: 0.8rem',
            'background-color: red',
            'color: white',
            'border-radius: 10px',
            'padding: 4px 12px',
            'width: 60%'
          ]
        },
        template: function(entityStates, config, hass) {
          const timeEntity = entityStates.get('time');
          const dateEntity = entityStates.get('date');
          const weekEntity = entityStates.get('week');

          const time = timeEntity?.state || '00:00';
          const timeParts = time.split(':');
          const hour = timeParts[0] || '00';
          const minute = timeParts[1] || '00';

          const date = dateEntity?.state || '2000-01-01';
          const dateParts = date.split('-');
          const dateDisplay = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}日` : '01/01';
          const week = weekEntity?.state || '星期一';

          return `
            <div class="time-week-card">
              <div class="time-hour" style="${this.styles.timeHour.join(';')}">${hour}</div>
              <div class="time-minute" style="${this.styles.timeMinute.join(';')}">${minute}</div>
              <div class="date-week" style="${this.styles.dateWeek.join(';')}">
                <div class="date" style="${this.styles.date.join(';')}">${dateDisplay}</div>
                <div class="week" style="${this.styles.week.join(';')}">${week}</div>
              </div>
            </div>
          `;
        },
        cardSize: 3
      };

      const timeCard = {
        type: 'time',
        name: '时间卡片',
        icon: '🕒',
        description: '水平布局的时间日期卡片',
        category: 'time',
        tags: ['时间', '日期', '星期', '水平布局'],
        entityInterfaces: {
          required: [
            { 
              key: 'time', 
              type: 'sensor', 
              description: '时间实体',
              default: 'sensor.time',
              filters: { domain: 'sensor' }
            },
            { 
              key: 'date', 
              type: 'sensor', 
              description: '日期实体',
              default: 'sensor.date',
              filters: { domain: 'sensor' }
            }
          ],
          optional: [
            { 
              key: 'week', 
              type: 'sensor', 
              description: '星期实体',
              default: 'sensor.xing_qi',
              filters: { domain: 'sensor' }
            }
          ]
        },
        layout: {
          grid: {
            templateAreas: '"a b c"',
            templateColumns: '1fr 1fr 1fr',
            templateRows: 'auto',
            gap: '10px',
            custom: `
              height: 120px;
              align-items: center;
            `
          }
        },
        styles: {
          a: [
            'justify-self: end',
            'margin-right: 5px',
            'text-align: center'
          ],
          b: [
            'text-align: center'
          ],
          c: [
            'justify-self: start',
            'margin-left: 5px',
            'text-align: center'
          ],
          label: [
            'font-size: 0.7em',
            'margin-bottom: 4px',
            'color: var(--cardforge-secondary-color)'
          ],
          value: [
            'font-size: 2em',
            'font-weight: bold',
            'margin-bottom: 4px'
          ],
          unit: [
            'font-size: 0.7em',
            'color: var(--cardforge-secondary-color)'
          ],
          hourValue: [
            'color: rgba(var(--rgb-primary-text-color), 0.7)'
          ],
          minuteValue: [
            'color: rgba(var(--rgb-primary-text-color), 0.7)'
          ],
          dateValue: [
            'font-size: 2.8em'
          ]
        },
        template: function(entityStates, config, hass) {
          const timeEntity = entityStates.get('time');
          const dateEntity = entityStates.get('date');
          const weekEntity = entityStates.get('week');

          const time = timeEntity?.state || '00:00';
          const timeParts = time.split(':');
          const hour = timeParts[0] || '00';
          const minute = timeParts[1] || '00';

          const date = dateEntity?.state || '2000-01-01';
          const dateParts = date.split('-');
          const month = dateParts.length === 3 ? `${dateParts[1]}月` : '01月';
          const day = dateParts.length === 3 ? dateParts[2] : '01';
          const week = weekEntity?.state || '星期一';

          return `
            <div class="time-card">
              <div class="hour-section" style="grid-area: a; ${this.styles.a.join(';')}">
                <div class="label" style="${this.styles.label.join(';')}">TIME</div>
                <div class="value hour-value" style="${this.styles.value.join(';')}; ${this.styles.hourValue.join(';')}">${hour}</div>
                <div class="unit" style="${this.styles.unit.join(';')}">时</div>
              </div>
              
              <div class="date-section" style="grid-area: b; ${this.styles.b.join(';')}">
                <div class="label" style="${this.styles.label.join(';')}">${month}</div>
                <div class="value date-value" style="${this.styles.value.join(';')}; ${this.styles.dateValue.join(';')}">${day}</div>
                <div class="unit" style="${this.styles.unit.join(';')}">${week}</div>
              </div>
              
              <div class="minute-section" style="grid-area: c; ${this.styles.c.join(';')}">
                <div class="label" style="${this.styles.label.join(';')}">TIME</div>
                <div class="value minute-value" style="${this.styles.value.join(';')}; ${this.styles.minuteValue.join(';')}">${minute}</div>
                <div class="unit" style="${this.styles.unit.join(';')}">分</div>
              </div>
            </div>
          `;
        },
        cardSize: 2
      };

      // 注册卡片
      this._cards.set(timeWeekCard.type, timeWeekCard);
      this._cards.set(timeCard.type, timeCard);

    } catch (error) {
      console.error('注册卡片配置失败:', error);
    }
  }

  // 其他方法保持不变...
  static validateCardConfig(config) {
    const required = ['type', 'name', 'category', 'entityInterfaces', 'template'];
    return required.every(key => key in config);
  }

  static registerCard(config) {
    if (this.validateCardConfig(config)) {
      this._cards.set(config.type, config);
    } else {
      throw new Error('卡片配置不完整');
    }
  }

  static getCardConfig(cardType) {
    return this._cards.get(cardType);
  }

  static hasCardType(cardType) {
    return this._cards.has(cardType);
  }

  static getAllCards() {
    return Array.from(this._cards.values());
  }

  static getCardsByCategory(category) {
    return this.getAllCards().filter(card => card.category === category);
  }

  static getCategories() {
    return Array.from(this._categories.values());
  }

  static getDefaultCard() {
    const cards = this.getAllCards();
    return cards.length > 0 ? cards[0] : null;
  }

  static searchCards(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllCards().filter(card => 
      card.name.toLowerCase().includes(lowerQuery) ||
      card.description.toLowerCase().includes(lowerQuery) ||
      card.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

window.CardRegistry = CardRegistry;