// src/core/base-card.js
import { themeManager } from './theme-manager.js';

export class BaseCard {
  constructor() {
    if (new.target === BaseCard) {
      throw new Error('BaseCard 是抽象类，必须被继承');
    }
    
    this.defaultConfig = this.getDefaultConfig();
  }

  // === 必须由子类实现的方法 ===
  getDefaultConfig() {
    throw new Error('必须实现 getDefaultConfig 方法');
  }

  getManifest() {
    throw new Error('必须实现 getManifest 方法');
  }

  // === 核心渲染流程 ===
  render(config, hass, entities) {
    const safeConfig = this._getSafeConfig(config);
    const themeStyles = themeManager.getThemeStyles(safeConfig.theme, safeConfig);
    
    return {
      template: this._renderTemplate(safeConfig, hass, entities),
      styles: this._renderStyles(safeConfig, themeStyles)
    };
  }

  _getSafeConfig(config) {
    const manifest = this.getManifest();
    const schema = manifest?.config_schema || {};
    const safeConfig = { ...this.defaultConfig, ...config };
    
    // 应用默认值
    Object.entries(schema).forEach(([key, field]) => {
      if (safeConfig[key] === undefined) {
        safeConfig[key] = field.default !== undefined ? field.default : '';
      }
    });
    
    return safeConfig;
  }

  _renderTemplate(config, hass, entities) {
    const areas = this._renderAreas(config, hass, entities);
    
    return `
      <div class="cardforge-card ${config.card_type || ''}">
        ${areas.header}
        ${areas.content}
        ${areas.footer}
      </div>
    `;
  }

  _renderAreas(config, hass, entities) {
    const areas = {};
    
    // 支持新的扁平化配置结构
    const blocks = config.blocks || {};
    
    // 按区域分组块
    const headerBlocks = this._getBlocksByArea(blocks, 'header');
    const contentBlocks = this._getBlocksByArea(blocks, 'content'); 
    const footerBlocks = this._getBlocksByArea(blocks, 'footer');
    
    // 渲染各区域
    areas.header = headerBlocks.length > 0 ? 
      this._renderArea('header', { blocks: headerBlocks }, config, hass, entities) : '';
    
    areas.content = contentBlocks.length > 0 ? 
      this._renderArea('content', { blocks: contentBlocks }, config, hass, entities) : 
      this._renderArea('content', { blocks: [] }, config, hass, entities);
    
    areas.footer = footerBlocks.length > 0 ? 
      this._renderArea('footer', { blocks: footerBlocks }, config, hass, entities) : '';
    
    return areas;
  }

  _getBlocksByArea(blocks, area) {
    return Object.entries(blocks)
      .filter(([blockId, blockConfig]) => {
        // 内容区域是默认区域
        if (area === 'content') {
          return !blockConfig.area || blockConfig.area === 'content';
        }
        return blockConfig.area === area;
      })
      .map(([blockId]) => blockId);
  }

  _getBlocksByArea(blocks, area) {
    return Object.entries(blocks)
      .filter(([blockId, blockConfig]) => {
        // 内容区域是默认区域
        if (area === 'content') {
          return !blockConfig.area || blockConfig.area === 'content';
        }
        return blockConfig.area === area;
      })
      .map(([blockId]) => blockId);
  }

  _renderBlock(blockId, blockConfig, hass, entities) {
    if (!blockConfig) return '';
    
    const content = this._getBlockContent(blockConfig, hass, entities);
    const style = blockConfig.style ? `style="${blockConfig.style}"` : '';
    
    return `
      <div class="cardforge-block block-${blockConfig.type}" data-block-id="${blockId}" ${style}>
        ${blockConfig.title ? `<div class="block-title">${blockConfig.title}</div>` : ''}
        <div class="block-content">${content}</div>
      </div>
    `;
  }

  _getBlockContent(blockConfig, hass, entities) {
    if (blockConfig.entity && hass?.states[blockConfig.entity]) {
      const entity = hass.states[blockConfig.entity];
      return entity.state || blockConfig.entity;
    }
    
    return blockConfig.content || '';
  }

  _renderLayout(layout, blocks) {
    switch (layout) {
      case 'grid-2x2':
        return `<div class="layout-grid grid-2x2">${blocks}</div>`;
      case 'grid-1x4':
        return `<div class="layout-grid grid-1x4">${blocks}</div>`;
      default:
        return `<div class="layout-single">${blocks}</div>`;
    }
  }

  _renderStyles(config, themeStyles) {
    const manifest = this.getManifest();
    const cardStyles = manifest?.styles ? manifest.styles(config) : '';
    
    return `
      .cardforge-card {
        ${themeStyles}
      }
      ${cardStyles}
    `;
  }

  // === 工具方法 ===
  _getEntityState(entities, hass, key, fallback = '') {
    try {
      const entityId = entities?.[key];
      if (!entityId) return fallback;
      if (!hass) return entityId;
      
      const entity = hass.states?.[entityId];
      if (!entity) return entityId;
      
      return entity.state || fallback;
    } catch (error) {
      return fallback;
    }
  }

  _renderSafeHTML(content) {
    if (!content) return '';
    return String(content)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}