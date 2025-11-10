// src/ha-cardforge-card.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { unsafeHTML } from 'https://unpkg.com/lit-html/directives/unsafe-html.js?module';
import { PLUGIN_REGISTRY } from './core/plugin-registry.js';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _plugin: { state: true },
    _entities: { state: true },
    _error: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }
    
    .cardforge-error {
      padding: 20px;
      text-align: center;
      color: var(--error-color);
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      border: 1px solid var(--divider-color);
    }
    
    .cardforge-loading {
      padding: 20px;
      text-align: center;
      color: var(--secondary-text-color);
    }
  `;

  constructor() {
    super();
    this._pluginCache = new Map();
    this._plugin = null;
    this._entities = {};
    this._error = null;
  }

  async setConfig(config) {
    console.log('🎯 [CardForge] 设置配置:', config);
    
    try {
      this.config = this._validateConfig(config);
      this._error = null;
      
      // 加载插件
      this._plugin = await this._loadPlugin(this.config.plugin);
      console.log('✅ [CardForge] 插件加载成功:', this.config.plugin);
      
      // 更新实体数据
      this._updateEntities();
      
      // 请求重新渲染
      this.requestUpdate();
      
    } catch (error) {
      console.error('❌ [CardForge] 配置错误:', error);
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
      }
    });
    
    console.log('📊 [CardForge] 实体数据:', this._entities);
  }

  render() {
    // 显示错误状态
    if (this._error) {
      return html`
        <ha-card>
          <div class="cardforge-error">
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
          <div class="cardforge-loading">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div style="margin-top: 8px;">加载中...</div>
          </div>
        </ha-card>
      `;
    }
    
    // 获取插件的模板和样式
    const template = this._plugin.getTemplate(this.config, this.hass, this._entities);
    const styles = this._plugin.getStyles(this.config);
    
    console.log('🎨 [CardForge] 渲染卡片:', {
      插件: this.config.plugin,
      模板长度: template.length,
      样式长度: styles.length
    });
    
    return html`
      <ha-card>
        <div class="cardforge-content">
          ${unsafeHTML(template)}
        </div>
      </ha-card>
      
      <style>
        .cardforge-content {
          position: relative;
        }
        ${styles}
      </style>
    `;
  }

  updated(changedProperties) {
    // Hass 状态更新时刷新实体数据
    if (changedProperties.has('hass')) {
      console.log('🔄 [CardForge] Hass 状态更新');
      this._updateEntities();
    }
  }

  // Lovelace 编辑器集成
  static getConfigElement() {
    return document.createElement('ha-cardforge-editor');
  }

  static getStubConfig() {
    return {
      plugin: 'simple-clock'
    };
  }
}

export { HaCardForgeCard };
