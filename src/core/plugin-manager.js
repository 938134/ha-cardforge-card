// src/core/plugin-manager.js
import { FallbackPlugin } from './fallback-plugin.js';

export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.remoteBaseURL = 'https://ghfast.top/https://raw.githubusercontent.com/938134/ha-cardforge-card/main/';
    this._cache = new Map();
    this._pluginRegistry = null;
  }
  
  // 插件注册
  registerPlugin(PluginClass) {
    const pluginInstance = new PluginClass();
    this.plugins.set(pluginInstance.name, pluginInstance);
    console.log(`✅ 注册插件: ${pluginInstance.displayName}`);
  }
  
  registerPluginClass(PluginClass) {
    this.registerPlugin(PluginClass);
  }
  
  unregisterPlugin(pluginId) {
    this.plugins.delete(pluginId);
    this._cache.delete(pluginId);
  }
  
  // 插件加载
  async loadPlugin(pluginId) {
    if (this._cache.has(pluginId)) {
      return this._cache.get(pluginId);
    }
    
    // 首先检查本地插件
    if (this.plugins.has(pluginId)) {
      const plugin = this.plugins.get(pluginId);
      this._cache.set(pluginId, plugin);
      return plugin;
    }
    
    // 然后尝试远程加载
    try {
      const plugin = await this._loadRemotePlugin(pluginId);
      this._cache.set(pluginId, plugin);
      return plugin;
    } catch (error) {
      console.error(`❌ 加载插件失败: ${pluginId}`, error);
      return this.getFallbackPlugin(pluginId, error.message);
    }
  }
  
  async _loadRemotePlugin(pluginId) {
    const registry = await this._loadPluginRegistry();
    const pluginInfo = registry.plugins?.find(p => p.id === pluginId);
    
    if (!pluginInfo) {
      throw new Error(`插件未在注册表中找到: ${pluginId}`);
    }
    
    const pluginURL = `${this.remoteBaseURL}plugins/${pluginId}.js`;
    const response = await fetch(pluginURL);
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }
    
    const pluginCode = await response.text();
    return this._createPluginInstance(pluginInfo, pluginCode);
  }
  
  async _createPluginInstance(pluginInfo, pluginCode) {
    try {
      const blob = new Blob([pluginCode], { type: 'application/javascript' });
      const blobURL = URL.createObjectURL(blob);
      const module = await import(blobURL);
      URL.revokeObjectURL(blobURL);
      
      if (module.default) {
        const pluginInstance = new module.default();
        this._validatePluginInterface(pluginInstance);
        pluginInstance.pluginInfo = pluginInfo;
        return pluginInstance;
      } else {
        throw new Error('插件未导出默认类');
      }
    } catch (error) {
      throw new Error(`插件实例化失败: ${error.message}`);
    }
  }
  
  _validatePluginInterface(pluginInstance) {
    const requiredMethods = ['getTemplate', 'getStyles'];
    const missingMethods = requiredMethods.filter(method => 
      typeof pluginInstance[method] !== 'function'
    );
    
    if (missingMethods.length > 0) {
      throw new Error(`插件接口不完整，缺少方法: ${missingMethods.join(', ')}`);
    }
  }
  
  async _loadPluginRegistry() {
    if (this._pluginRegistry) return this._pluginRegistry;
    
    try {
      const registryURL = `${this.remoteBaseURL}plugins/index.json`;
      const response = await fetch(registryURL);
      this._pluginRegistry = await response.json();
      return this._pluginRegistry;
    } catch (error) {
      console.error('加载插件注册表失败:', error);
      this._pluginRegistry = { plugins: [] };
      return this._pluginRegistry;
    }
  }
  
  // 插件发现
  async getAvailablePlugins() {
    const localPlugins = Array.from(this.plugins.values()).map(plugin => ({
      id: plugin.name,
      name: plugin.displayName,
      description: plugin.description || '',
      icon: plugin.icon,
      category: plugin.category,
      requiresWeek: plugin.requiresWeek,
      featured: plugin.featured
    }));
    
    try {
      const registry = await this._loadPluginRegistry();
      const remotePlugins = registry.plugins || [];
      return [...localPlugins, ...remotePlugins];
    } catch (error) {
      return localPlugins;
    }
  }
  
  async searchPlugins(query = '', category = 'all') {
    const plugins = await this.getAvailablePlugins();
    
    return plugins.filter(plugin => {
      const matchesCategory = category === 'all' || plugin.category === category;
      if (!matchesCategory) return false;
      
      if (!query) return true;
      
      const searchTerm = query.toLowerCase();
      return (
        plugin.name.toLowerCase().includes(searchTerm) ||
        plugin.description.toLowerCase().includes(searchTerm)
      );
    });
  }
  
  async getCategories() {
    const plugins = await this.getAvailablePlugins();
    const categories = new Set(['all']);
    plugins.forEach(plugin => {
      if (plugin.category) categories.add(plugin.category);
    });
    return Array.from(categories);
  }
  
  getPluginInfo(pluginId) {
    const plugin = this.plugins.get(pluginId);
    return plugin ? {
      id: plugin.name,
      name: plugin.displayName,
      description: plugin.description,
      icon: plugin.icon,
      category: plugin.category,
      requiresWeek: plugin.requiresWeek
    } : null;
  }
  
  getFallbackPlugin(pluginId, errorMessage) {
    return new FallbackPlugin(pluginId, errorMessage);
  }
  
  clearCache() {
    this._cache.clear();
    this._pluginRegistry = null;
  }
}