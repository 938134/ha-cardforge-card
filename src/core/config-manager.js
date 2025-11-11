// src/core/config-manager.js
class ConfigManager {
    static DEFAULT_CONFIG = {
      plugin: '',
      entities: {},
      theme: 'default',
      custom: {}
    };
  
    static validate(config) {
      if (!config?.plugin) {
        throw new Error('必须选择插件');
      }
      return { ...this.DEFAULT_CONFIG, ...config };
    }
  
    static createPluginConfig(pluginId, requirements = []) {
      const entities = {};
      requirements.forEach(req => {
        entities[req.key] = '';
      });
      
      return {
        plugin: pluginId,
        entities,
        theme: 'default'
      };
    }
  }
  
  export { ConfigManager };