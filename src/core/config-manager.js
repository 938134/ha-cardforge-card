// src/core/config-manager.js
export class ConfigManager {
  // 配置验证
  static validateConfig(config, schema) {
    const errors = [];
    const warnings = [];
    
    Object.entries(schema || {}).forEach(([key, field]) => {
      const value = config[key];
      
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push(`必需字段 "${field.label}" 不能为空`);
        return;
      }
      
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
        }
      }
    });
    
    return { valid: errors.length === 0, errors, warnings };
  }

  // 应用配置默认值
  static applyDefaults(config, schema) {
    const defaults = {};
    
    Object.entries(schema || {}).forEach(([key, field]) => {
      defaults[key] = field.default !== undefined ? field.default : '';
    });
    
    return this.mergeConfigs(defaults, config);
  }

  // 合并配置
  static mergeConfigs(baseConfig, updates) {
    const merged = { ...baseConfig };
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          merged[key] = { ...merged[key], ...value };
        } else {
          merged[key] = value;
        }
      }
    });
    
    return merged;
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

  // 清理配置（移除未定义的字段）
  static cleanConfig(config, schema) {
    const cleaned = {};
    const schemaKeys = Object.keys(schema || {});
    
    Object.entries(config || {}).forEach(([key, value]) => {
      if (schemaKeys.includes(key) || key.startsWith('_')) {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }
}