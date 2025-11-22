// src/core/config-manager.js
export class ConfigManager {
  // 应用配置默认值
  static applyDefaults(config, schema) {
    const defaults = {};
    
    Object.entries(schema || {}).forEach(([key, field]) => {
      // 正确处理各种类型的默认值
      if (field.type === 'boolean') {
        defaults[key] = field.default !== undefined ? field.default : false;
      } else if (field.type === 'number') {
        defaults[key] = field.default !== undefined ? field.default : 0;
      } else if (field.type === 'select') {
        defaults[key] = field.default !== undefined ? field.default : (field.options?.[0] || '');
      } else {
        defaults[key] = field.default !== undefined ? field.default : '';
      }
    });
    
    // 深度合并配置，确保新添加的配置项能正确应用默认值
    const merged = { ...defaults };
    
    Object.entries(config || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        merged[key] = value;
      }
    });
    
    return merged;
  }

  // 清理配置（移除未定义的字段）
  static cleanConfig(config, schema) {
    const cleaned = {};
    const schemaKeys = Object.keys(schema || {});
    
    // 保留所有在schema中定义的字段和以下划线开头的系统字段
    Object.entries(config || {}).forEach(([key, value]) => {
      if (schemaKeys.includes(key) || key.startsWith('_')) {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }

  // 验证配置
  static validateConfig(config, schema) {
    const errors = [];
    const warnings = [];
    
    Object.entries(schema || {}).forEach(([key, field]) => {
      const value = config[key];
      
      // 必需字段验证
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`必需字段 "${field.label}" 不能为空`);
        return;
      }
      
      // 类型验证
      if (value !== undefined && value !== null && field.type) {
        switch (field.type) {
          case 'number':
            if (isNaN(Number(value))) {
              errors.push(`字段 "${field.label}" 必须是数字`);
            }
            break;
            
          case 'select':
            if (field.options && !field.options.includes(value)) {
              warnings.push(`字段 "${field.label}" 的值不在推荐选项中`);
            }
            break;
            
          case 'boolean':
            // 布尔值不需要额外验证
            break;
            
          default:
            // 文本类型不需要额外验证
            break;
        }
      }
    });
    
    return { 
      valid: errors.length === 0, 
      errors, 
      warnings 
    };
  }

  // 获取插件配置schema
  static getPluginConfigSchema(pluginManifest) {
    return pluginManifest?.config_schema || {};
  }

  // 验证插件特定配置
  static validatePluginConfig(config, pluginManifest) {
    const schema = this.getPluginConfigSchema(pluginManifest);
    return this.validateConfig(config, schema);
  }

  // 创建初始配置
  static createInitialConfig(pluginManifest) {
    const schema = this.getPluginConfigSchema(pluginManifest);
    return this.applyDefaults({}, schema);
  }

  // 检查配置是否完整
  static isConfigComplete(config, schema) {
    const validation = this.validateConfig(config, schema);
    return validation.valid && validation.errors.length === 0;
  }

  // 获取配置差异（用于调试）
  static getConfigDiff(currentConfig, newConfig) {
    const diff = {};
    
    const allKeys = new Set([
      ...Object.keys(currentConfig || {}),
      ...Object.keys(newConfig || {})
    ]);
    
    allKeys.forEach(key => {
      const currentValue = currentConfig?.[key];
      const newValue = newConfig?.[key];
      
      if (currentValue !== newValue) {
        diff[key] = {
          from: currentValue,
          to: newValue
        };
      }
    });
    
    return diff;
  }
}