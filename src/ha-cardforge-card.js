// src/ha-cardforge-card.js
import { LitElement, html } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { PLUGIN_REGISTRY } from './core/plugin-registry.js';
import { ThemeManager } from './core/theme-manager.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugin: { state: true },
    _entities: { state: true },
    _error: { state: true },
    _isPreview: { state: true } // 添加预览模式支持
  };

  constructor() {
    super();
    this._pluginCache = new Map();
    this._plugin = null;
    this._entities = {};
    this._error = null;
    this._isPreview = false;
  }

  async setConfig(config) {
    try {
      this.config = this._validateConfig(config);
      this._error = null;
      this._isPreview = config._isPreview || false; // 检测预览模式
      
      // 加载插件
      this._plugin = await this._loadPlugin(this.config.plugin);
      
      // 更新实体数据
      this._updateEntities();
      
      // 应用主题
      if (this.config.theme) {
        ThemeManager.applyTheme(this, this.config.theme);
      }
      
      // 请求重新渲染
      this.requestUpdate();
      
    } catch (error) {
      console.error('卡片加载失败:', error);
      this._error = error;
      this.requestUpdate();
    }
  }

  _validateConfig(config) {
    if (!config || !config.plugin) {
      throw new Error('必须指定 plugin 参数');
    }
    
    return {
      plugin: '',
      entities: {},
      theme: 'default',
      ...config
    };
  }

  async _loadPlugin(pluginId) {
    // 检查缓存
    if (this._pluginCache.has(pluginId)) {
      return this._pluginCache.get(pluginId);
    }

    // 获取插件类
    const PluginClass = PLUGIN_REGISTRY[pluginId];
    if (!PluginClass) {
      throw new Error(`未知插件: ${pluginId}`);
    }
    
    // 创建插件实例
    const plugin = new PluginClass();
    
    // 验证插件接口
    if (typeof plugin.getTemplate !== 'function' || 
        typeof plugin.getStyles !== 'function') {
      throw new Error('插件接口不完整');
    }
    
    // 缓存插件
    this._pluginCache.set(pluginId, plugin);
    return plugin;
  }

  _updateEntities() {
    this._entities = {};
    
    if (!this.hass || !this.config.entities) {
      return;
    }
    
    // 从 Hass 获取实体状态
    Object.entries(this.config.entities).forEach(([key, entityId]) => {
      if (entityId && this.hass.states[entityId]) {
        this._entities[key] = this.hass.states[entityId];
      } else if (this._isPreview) {
        // 预览模式下提供模拟数据
        this._entities[key] = this._getMockEntity(key, entityId);
      }
    });
  }

  _getMockEntity(key, entityId) {
    // 为预览提供模拟实体数据
    const now = new Date();
    const mockData = {
      time: {
        entity_id: entityId || 'sensor.time',
        state: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        attributes: {}
      },
      date: {
        entity_id: entityId || 'sensor.date', 
        state: now.toLocaleDateString('zh-CN'),
        attributes: {}
      },
      week: {
        entity_id: entityId || 'sensor.week',
        state: '星期' + '日一二三四五六'[now.getDay()],
        attributes: {}
      },
      weather: {
        entity_id: entityId || 'weather.home',
        state: '晴朗',
        attributes: {
          temperature: 25,
          humidity: 65
        }
      }
    };
    
    return mockData[key] || {
      entity_id: entityId || `sensor.${key}`,
      state: '模拟数据',
      attributes: {}
    };
  }

  render() {
    // 显示错误状态
    if (this._error) {
      return html`
        <ha-card>
          <div style="padding: 20px; text-align: center; color: var(--error-color);">
            <div style="font-size: 2em;">❌</div>
            <div style="font-weight: bold; margin: 8px 0;">卡片加载失败</div>
            <div style="font-size: 0.9em;">${this._error.message}</div>
          </div>
        </ha-card>
      `;
    }
    
    // 显示加载状态
    if (!this._plugin) {
      return html`
        <ha-card>
          <div style="padding: 20px; text-align: center; color: var(--secondary-text-color);">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div style="margin-top: 8px;">加载中...</div>
          </div>
        </ha-card>
      `;
    }
    
    // 获取插件的模板和样式
    const template = this._plugin.getTemplate(this.config, this.hass, this._entities);
    const styles = this._plugin.getStyles(this.config);

    return html`
      <ha-card>
        <div style="position: relative;">
          ${unsafeHTML(template)}
        </div>
      </ha-card>
      
      <style>
        ${styles}
      </style>
    `;
  }

  updated(changedProperties) {
    // Hass 状态更新时刷新实体数据
    if (changedProperties.has('hass')) {
      this._updateEntities();
    }
    
    // 配置更新时重新应用主题
    if (changedProperties.has('config') && this.config.theme) {
      ThemeManager.applyTheme(this, this.config.theme);
    }
  }

  // Lovelace 编辑器集成
  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      plugin: 'simple-clock',
      entities: {
        time: 'sensor.time',
        date: 'sensor.date'
      },
      theme: 'default'
    };
  }
}

export { HaCardForgeCard };