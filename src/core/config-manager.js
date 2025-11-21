// src/core/config-manager.js
export class ConfigManager {
  // 应用配置默认值
  static applyDefaults(config, schema) {
    const defaults = {};
    
    Object.entries(schema || {}).forEach(([key, field]) => {
      defaults[key] = field.default !== undefined ? field.default : '';
    });
    
    return { ...defaults, ...config };
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