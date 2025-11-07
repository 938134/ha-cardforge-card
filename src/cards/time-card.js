// 时间卡片配置 - 水平布局的时间日期卡片
export default {
    type: 'time',
    name: '时间卡片',
    icon: '🕒',
    description: '水平布局的时间日期卡片',
    category: 'time',
    tags: ['时间', '日期', '星期', '水平布局'],
    
    // 实体接口定义
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
  
    // 布局配置
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
  
    // 样式配置
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
  
    // 默认交互动作
    defaultActions: {
      tap_action: {
        action: 'more-info',
        entity: 'sensor.time'
      },
      hold_action: {
        action: 'more-info', 
        entity: 'sensor.date'
      }
    },
  
    // 卡片尺寸
    cardSize: 2,
  
    // 模板函数
    template: function(entityStates, config, hass) {
      const timeEntity = entityStates.get('time');
      const dateEntity = entityStates.get('date');
      const weekEntity = entityStates.get('week');
  
      // 获取时间数据
      const time = timeEntity?.state || '00:00';
      const timeParts = time.split(':');
      const hour = timeParts[0] || '00';
      const minute = timeParts[1] || '00';
  
      // 获取日期数据
      const date = dateEntity?.state || '2000-01-01';
      const dateParts = date.split('-');
      const month = dateParts.length === 3 ? `${dateParts[1]}月` : '01月';
      const day = dateParts.length === 3 ? dateParts[2] : '01';
  
      // 获取星期数据
      const week = weekEntity?.state || '星期一';
  
      // 应用自定义样式
      const styles = this._getStyles(config);
  
      return `
        <div class="time-card" style="${styles.grid}">
          <!-- 小时部分 -->
          <div class="hour-section" style="grid-area: a; ${styles.a.join(';')}">
            <div class="label" style="${styles.label.join(';')}">TIME</div>
            <div class="value hour-value" style="${styles.value.join(';')}; ${styles.hourValue.join(';')}">${hour}</div>
            <div class="unit" style="${styles.unit.join(';')}">时</div>
          </div>
          
          <!-- 日期部分 -->
          <div class="date-section" style="grid-area: b; ${styles.b.join(';')}">
            <div class="label" style="${styles.label.join(';')}">${month}</div>
            <div class="value date-value" style="${styles.value.join(';')}; ${styles.dateValue.join(';')}">${day}</div>
            <div class="unit" style="${styles.unit.join(';')}">${week}</div>
          </div>
          
          <!-- 分钟部分 -->
          <div class="minute-section" style="grid-area: c; ${styles.c.join(';')}">
            <div class="label" style="${styles.label.join(';')}">TIME</div>
            <div class="value minute-value" style="${styles.value.join(';')}; ${styles.minuteValue.join(';')}">${minute}</div>
            <div class="unit" style="${styles.unit.join(';')}">分</div>
          </div>
        </div>
      `;
    },
  
    // 获取合并后的样式
    _getStyles: function(config) {
      const defaultStyles = this.styles;
      const customStyles = config.style || {};
      
      return {
        grid: this.layout.grid.custom,
        a: [...defaultStyles.a, ...(customStyles.a || [])],
        b: [...defaultStyles.b, ...(customStyles.b || [])],
        c: [...defaultStyles.c, ...(customStyles.c || [])],
        label: [...defaultStyles.label, ...(customStyles.label || [])],
        value: [...defaultStyles.value, ...(customStyles.value || [])],
        unit: [...defaultStyles.unit, ...(customStyles.unit || [])],
        hourValue: [...defaultStyles.hourValue, ...(customStyles.hourValue || [])],
        minuteValue: [...defaultStyles.minuteValue, ...(customStyles.minuteValue || [])],
        dateValue: [...defaultStyles.dateValue, ...(customStyles.dateValue || [])]
      };
    },
  
    // 预览配置
    preview: {
      thumbnail: '/local/cardforge/previews/time-card.png',
      livePreview: true,
      demoData: {
        time: '14:30',
        date: '2024-08-15',
        week: '星期四'
      },
      generatePreview: function(config) {
        const demoData = this.demoData;
        const timeParts = demoData.time.split(':');
        
        return `
          <div style="
            display: grid;
            grid-template-areas: 'a b c';
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            height: 80px;
            align-items: center;
            padding: 12px;
            background: var(--card-background-color);
            border-radius: 8px;
            font-family: var(--paper-font-common-nowrap_-_font-family);
          ">
            <div style="grid-area: a; text-align: center; justify-self: end; margin-right: 5px;">
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">TIME</div>
              <div style="font-size: 1.2em; font-weight: bold; color: rgba(var(--rgb-primary-text-color), 0.7);">${timeParts[0]}</div>
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">时</div>
            </div>
            
            <div style="grid-area: b; text-align: center;">
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">${demoData.date.split('-')[1]}月</div>
              <div style="font-size: 1.8em; font-weight: bold;">${demoData.date.split('-')[2]}</div>
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">${demoData.week}</div>
            </div>
            
            <div style="grid-area: c; text-align: center; justify-self: start; margin-left: 5px;">
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">TIME</div>
              <div style="font-size: 1.2em; font-weight: bold; color: rgba(var(--rgb-primary-text-color), 0.7);">${timeParts[1]}</div>
              <div style="font-size: 0.6em; color: var(--secondary-text-color);">分</div>
            </div>
          </div>
        `;
      }
    },
  
    // 验证配置
    validateConfig: function(config) {
      const errors = [];
      
      if (!config.entities?.time) {
        errors.push('必须配置时间实体');
      }
      
      if (!config.entities?.date) {
        errors.push('必须配置日期实体');
      }
  
      return {
        isValid: errors.length === 0,
        errors: errors
      };
    },
  
    // 配置迁移（版本兼容）
    migrateConfig: function(oldConfig, fromVersion) {
      // 从旧版本迁移配置的逻辑
      const newConfig = { ...oldConfig };
      
      if (fromVersion < 2) {
        // 迁移逻辑示例
        if (oldConfig.time_entity && !newConfig.entities) {
          newConfig.entities = {
            time: oldConfig.time_entity,
            date: oldConfig.date_entity,
            week: oldConfig.week_entity
          };
          delete newConfig.time_entity;
          delete newConfig.date_entity;
          delete newConfig.week_entity;
        }
      }
      
      return newConfig;
    },
  
    // 获取默认配置
    getDefaultConfig: function() {
      return {
        type: 'time',
        entities: {
          time: 'sensor.time',
          date: 'sensor.date',
          week: 'sensor.xing_qi'
        },
        style: {
          fontSize: 'medium',
          showSeconds: false
        },
        tap_action: {
          action: 'more-info',
          entity: 'sensor.time'
        }
      };
    },
  
    // 支持的样式选项（用于编辑器）
    supportedStyles: {
      fontSize: ['small', 'medium', 'large'],
      textAlign: ['left', 'center', 'right'],
      fontWeight: ['normal', 'bold', 'lighter']
    },
  
    // 文档链接
    documentation: {
      entities: {
        time: '需要提供时间信息的传感器实体，格式为 HH:MM',
        date: '需要提供日期信息的传感器实体，格式为 YYYY-MM-DD', 
        week: '需要提供星期信息的传感器实体'
      },
      examples: [
        {
          name: '基础时间显示',
          config: {
            entities: {
              time: 'sensor.time',
              date: 'sensor.date'
            }
          }
        },
        {
          name: '完整时间星期显示',
          config: {
            entities: {
              time: 'sensor.time',
              date: 'sensor.date',
              week: 'sensor.xing_qi'
            }
          }
        }
      ]
    }
  };