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
    // 自动分组块到区域
    const areas = this._groupBlocksByArea(config.blocks);
    
    return `
      <div class="cardforge-card ${config.card_type || ''}">
        ${areas.header}
        ${areas.content}
        ${areas.footer}
      </div>
    `;
  }

  _groupBlocksByArea(blocks) {
    const areas = {
      header: { blocks: [] },
      content: { blocks: [] },
      footer: { blocks: [] }
    };
    
    // 根据块的area属性自动分组
    Object.entries(blocks || {}).forEach(([blockId, blockConfig]) => {
      const area = blockConfig.area || 'content'; // 默认内容区域
      if (areas[area]) {
        areas[area].blocks.push({ id: blockId, ...blockConfig });
      }
    });
    
    // 渲染各区域
    return {
      header: this._renderArea('header', areas.header.blocks),
      content: this._renderArea('content', areas.content.blocks),
      footer: this._renderArea('footer', areas.footer.blocks)
    };
  }

  _renderArea(areaName, blocks) {
    if (blocks.length === 0) return '';
    
    const blockElements = blocks.map(block => 
      this._renderBlock(block.id, block, this.hass, this.entities)
    ).join('');
    
    const layoutClass = this._getAutoLayoutClass(areaName, blocks.length);
    
    return `
      <div class="cardforge-area area-${areaName}">
        <div class="layout-container ${layoutClass}">
          ${blockElements}
        </div>
      </div>
    `;
  }

  _getAutoLayoutClass(areaName, blockCount) {
    // 智能自动布局
    if (areaName === 'header' || areaName === 'footer') {
      return 'layout-single';
    }
    
    // 内容区域智能布局
    if (blockCount <= 1) return 'layout-single';
    if (blockCount <= 4) return 'layout-grid-2x2';
    if (blockCount <= 9) return 'layout-grid-3x3';
    return 'layout-single'; // 更多块使用单列滚动
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