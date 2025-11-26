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
    // 根据块的 area 属性自动分组到区域
    const areas = this._groupBlocksByArea(config);
    
    return `
      <div class="cardforge-card ${config.card_type || ''}">
        ${areas.header}
        ${areas.content}
        ${areas.footer}
      </div>
    `;
  }

  _groupBlocksByArea(config) {
    const areas = {
      header: this._renderArea('header', config),
      content: this._renderArea('content', config),
      footer: this._renderArea('footer', config)
    };
    
    return areas;
  }

  _renderArea(areaName, config) {
    // 获取属于该区域的所有块
    const areaBlocks = this._getBlocksByArea(areaName, config.blocks);
    
    if (areaBlocks.length === 0) {
      return '';
    }
    
    const blocksHtml = areaBlocks.map(block => 
      this._renderBlock(block.id, block.config, config, config.hass, config.entities)
    ).join('');
    
    const layout = config.areas?.[areaName]?.layout || 'single';
    
    return `
      <div class="cardforge-area area-${areaName}">
        ${this._renderLayout(layout, blocksHtml)}
      </div>
    `;
  }

  _getBlocksByArea(areaName, blocksConfig) {
    const blocks = [];
    
    Object.entries(blocksConfig || {}).forEach(([blockId, blockConfig]) => {
      if (blockConfig.area === areaName) {
        blocks.push({ id: blockId, config: blockConfig });
      }
    });
    
    return blocks;
  }

  _renderBlock(blockId, blockConfig, config, hass, entities) {
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
      case 'grid-3x3':
        return `<div class="layout-grid grid-3x3">${blocks}</div>`;
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