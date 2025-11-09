// src/plugins/base-plugin.js
export class BasePlugin {
    constructor() {
      if (new.target === BasePlugin) {
        throw new Error('BasePlugin is abstract and cannot be instantiated directly');
      }
      
      this.name = '';
      this.displayName = '';
      this.icon = '';
      this.category = '';
      this.description = '';
      this.requiresWeek = false;
      this.featured = false;
      this.pluginInfo = null;
    }
    
    // 必须实现的方法
    getTemplate(config, entities) {
      throw new Error('getTemplate must be implemented');
    }
    
    getStyles(config) {
      throw new Error('getStyles must be implemented');
    }
    
    // 可选方法
    getEntityRequirements() {
      return { required: [], optional: [] };
    }
    
    validateConfig(config) {
      const errors = [];
      const requirements = this.getEntityRequirements();
      
      requirements.required.forEach(req => {
        if (!config.entities?.[req.key]) {
          errors.push(`缺少必需实体: ${req.description}`);
        }
      });
      
      return { valid: errors.length === 0, errors };
    }
    
    // 工具方法
    getDefaultEntities() {
      const defaults = {};
      const requirements = this.getEntityRequirements();
      
      requirements.required.forEach(req => {
        defaults[req.key] = this._getDefaultEntityId(req);
      });
      
      requirements.optional.forEach(req => {
        if (!defaults[req.key]) {
          defaults[req.key] = this._getDefaultEntityId(req);
        }
      });
      
      return defaults;
    }
    
    _getDefaultEntityId(requirement) {
      const defaults = {
        time: 'sensor.time',
        date: 'sensor.date',
        week: 'sensor.xing_qi',
        weather: 'weather.home',
        lunar: 'sensor.lunar_date'
      };
      
      return defaults[requirement.key] || '';
    }
    
    // 数据格式化工具
    formatTime(timeStr) {
      const [hour, minute] = (timeStr || '00:00').split(':');
      return { hour, minute };
    }
    
    formatDate(dateStr) {
      const [year, month, day] = (dateStr || '2000-01-01').split('-');
      return { year, month, day };
    }
    
    // 样式工具
    generateGridStyles(columns, gap = '10px') {
      return `
        display: grid;
        grid-template-columns: ${columns};
        gap: ${gap};
      `;
    }
    
    generateFlexStyles(direction = 'row', justify = 'center', align = 'center') {
      return `
        display: flex;
        flex-direction: ${direction};
        justify-content: ${justify};
        align-items: ${align};
      `;
    }
  } 