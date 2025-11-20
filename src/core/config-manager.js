// src/core/config-manager.js
export class ConfigManager {
    constructor() {
      this._config = {
        base: {},
        advanced: {},
        layout: {},
        theme: 'auto'
      };
      this._schema = {};
      this._listeners = new Map();
    }
  
    // === 配置分区管理 ===
    updateConfig(section, changes) {
      const oldConfig = { ...this._config[section] };
      this._config[section] = { ...oldConfig, ...changes };
      
      // 验证配置
      const validation = this.validateConfig(section, this._config[section]);
      if (!validation.valid) {
        console.warn('配置验证失败:', validation.errors);
        // 回滚变更
        this._config[section] = oldConfig;
        return { success: false, errors: validation.errors };
      }
      
      // 触发变更事件
      this._emitChange(section, this._config[section], oldConfig);
      
      return { success: true, config: this._config[section] };
    }
  
    getConfig(section = null) {
      if (section) {
        return this._config[section];
      }
      return this.getFullConfig();
    }
  
    getFullConfig() {
      return {
        ...this._config.base,
        ...this._config.advanced,
        ...this._config.layout,
        theme: this._config.theme
      };
    }
  
    // === 主题管理 ===
    setTheme(theme) {
      const oldTheme = this._config.theme;
      this._config.theme = theme;
      this._emitChange('theme', theme, oldTheme);
    }
  
    getTheme() {
      return this._config.theme;
    }
  
    // === 配置验证 ===
    setSchema(section, schema) {
      this._schema[section] = schema;
    }
  
    validateConfig(section, config) {
      const schema = this._schema[section];
      if (!schema) return { valid: true, errors: [] };
  
      const errors = [];
      
      Object.entries(schema).forEach(([key, field]) => {
        const value = config[key];
        
        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push(`字段 "${field.label}" 是必需的`);
          return;
        }
        
        if (value !== undefined && value !== null && field.type) {
          switch (field.type) {
            case 'number':
              if (isNaN(Number(value))) {
                errors.push(`字段 "${field.label}" 必须是数字`);
              }
              break;
            case 'boolean':
              if (typeof value !== 'boolean') {
                errors.push(`字段 "${field.label}" 必须是布尔值`);
              }
              break;
            case 'select':
              if (field.options && !field.options.includes(value)) {
                errors.push(`字段 "${field.label}" 必须是有效选项: ${field.options.join(', ')}`);
              }
              break;
          }
        }
      });
      
      return { valid: errors.length === 0, errors };
    }
  
    // === 事件系统 ===
    onConfigChange(section, callback) {
      if (!this._listeners.has(section)) {
        this._listeners.set(section, new Set());
      }
      this._listeners.get(section).add(callback);
      
      // 返回取消监听函数
      return () => {
        const listeners = this._listeners.get(section);
        if (listeners) {
          listeners.delete(callback);
        }
      };
    }
  
    _emitChange(section, newConfig, oldConfig) {
      const listeners = this._listeners.get(section);
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(newConfig, oldConfig, section);
          } catch (error) {
            console.error('配置变更监听器错误:', error);
          }
        });
      }
    }
  
    // === 配置持久化 ===
    saveToLocalStorage(key) {
      try {
        localStorage.setItem(`cardforge_config_${key}`, JSON.stringify(this._config));
        return true;
      } catch (error) {
        console.error('保存配置到本地存储失败:', error);
        return false;
      }
    }
  
    loadFromLocalStorage(key) {
      try {
        const saved = localStorage.getItem(`cardforge_config_${key}`);
        if (saved) {
          this._config = { ...this._config, ...JSON.parse(saved) };
          return true;
        }
      } catch (error) {
        console.error('从本地存储加载配置失败:', error);
      }
      return false;
    }
  
    // === 工具方法 ===
    resetConfig(section = null) {
      if (section) {
        const oldConfig = this._config[section];
        this._config[section] = {};
        this._emitChange(section, {}, oldConfig);
      } else {
        const oldConfig = { ...this._config };
        this._config = { base: {}, advanced: {}, layout: {}, theme: 'auto' };
        this._emitChange('all', this._config, oldConfig);
      }
    }
  
    hasChanges(originalConfig) {
      return JSON.stringify(this.getFullConfig()) !== JSON.stringify(originalConfig);
    }
  }
  
  // 创建全局实例
  export const configManager = new ConfigManager();