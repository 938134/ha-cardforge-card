// src/core/base-card.js
import { PluginManager } from './plugin-manager.js';
import { EntityManager } from './entity-manager.js';
import { ThemeManager } from './theme-manager.js';

export class BaseCard {
  constructor() {
    this.pluginManager = new PluginManager();
    this.entityManager = new EntityManager();
    this.themeManager = new ThemeManager();
    this._entities = new Map();  // 确保在基类中初始化
    this._config = null;
    this.hass = null;
  }
  
  validateConfig(config) {
    return {
      plugin: '',
      theme: 'default',
      entities: {},
      custom: {},
      ...config
    };
  }
  
  updateEntities(hass) {
    this.hass = hass;  // 保存 hass 引用
    this._entities.clear();
    if (!hass || !this._config?.entities) return;
    
    Object.entries(this._config.entities).forEach(([key, entityId]) => {
      if (entityId && hass.states[entityId]) {
        this._entities.set(key, hass.states[entityId]);
      }
    });
  }
  
  getEntitiesForPlugin(plugin) {
    const entities = Object.fromEntries(this._entities);
    
    // 预览模式使用模拟数据
    if (this._config?._preview) {
      return this._getPreviewEntities(entities, plugin);
    }
    
    return entities;
  }
  
  _getPreviewEntities(entities, plugin) {
    const previewData = {
      time: { state: '12:34', attributes: {} },
      date: { state: '2024-01-01', attributes: {} },
      week: { state: '星期一', attributes: {} },
      weather: { 
        state: '晴朗', 
        attributes: { temperature: 25, humidity: 65 } 
      },
      lunar: { 
        state: '冬月廿三', 
        attributes: { lunar: { 年干支: '甲辰', 星期: '星期一' } } 
      }
    };
    
    return { ...previewData, ...entities };
  }
  
  renderError(error) {
    const errorElement = document.createElement('div');
    errorElement.className = 'cardforge-error';
    errorElement.innerHTML = `
      <style>
        .cardforge-error {
          padding: 16px;
          background: var(--error-color, #db4437);
          color: white;
          border-radius: 8px;
          text-align: center;
          margin: 8px;
          font-family: var(--primary-font-family);
        }
        .cardforge-error ha-icon {
          --mdc-icon-size: 24px;
          margin-right: 8px;
        }
      </style>
      <ha-icon icon="mdi:alert-circle"></ha-icon>
      <span>${error}</span>
    `;
    return errorElement;
  }
  
  _convertStyles(css) {
    // 简化样式转换
    return {
      card: [
        {
          'border-radius': 'var(--ha-card-border-radius, 12px)',
          'box-shadow': 'var(--ha-card-box-shadow, none)',
          'overflow': 'hidden'
        }
      ]
    };
  }
}