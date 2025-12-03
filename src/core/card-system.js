// src/core/card-system.js
import { renderBlock, renderBlocks } from './block-renderer.js';

class CardSystem {
  constructor() {
    this.cards = new Map();
    this._initialized = false;
  }

  // 初始化卡片系统
  async initialize() {
    if (this._initialized) return;
    
    await this._discoverCards();
    
    this._initialized = true;
  }

  // 动态发现卡片
  async _discoverCards() {
    const cardModules = [
      () => import('../cards/clock-card.js'),
      () => import('../cards/week-card.js'),
      () => import('../cards/welcome-card.js'),
      () => import('../cards/poetry-card.js'),
      () => import('../cards/dashboard-card.js')
    ];

    for (const importFn of cardModules) {
      try {
        const module = await importFn();
        this._registerCardModule(module);
      } catch (error) {
        // 静默失败
      }
    }
  }

  // 注册卡片模块
  _registerCardModule(module) {
    if (!module.card) return;
    
    const cardId = module.card.id;
    if (!cardId) return;

    // 验证必需字段
    if (!module.card.meta || !module.card.template || !module.card.styles) {
      return;
    }

    // 注册卡片
    this.cards.set(cardId, {
      id: cardId,
      definition: module.card,
      CardClass: module.CardClass || null
    });
  }

  // 获取卡片定义
  getCard(cardId) {
    const cardData = this.cards.get(cardId);
    return cardData?.definition || null;
  }

  // 获取默认卡片
  getDefaultCard() {
    const defaultCards = ['clock', 'welcome', 'dashboard'];
    for (const cardId of defaultCards) {
      if (this.cards.has(cardId)) {
        return this.getCard(cardId);
      }
    }
    return this.cards.values().next().value?.definition;
  }

  // 获取所有卡片列表
  getAllCards() {
    return Array.from(this.cards.values()).map(item => ({
      id: item.id,
      ...item.definition.meta,
      schema: item.definition.schema || {},
      blockType: item.definition.blockType || 'none',
      layout: item.definition.layout || {},
      presetBlocks: item.definition.presetBlocks || null
    }));
  }

  // 获取所有卡片分类
  getAllCategories() {
    const categories = new Set();
    this.cards.forEach(item => {
      if (item.definition.meta.category) {
        categories.add(item.definition.meta.category);
      }
    });
    return Array.from(categories);
  }

  // 渲染卡片
  renderCard(cardId, userConfig = {}, hass = null, themeVariables = {}) {
    const card = this.getCard(cardId);
    if (!card) {
      throw new Error(`卡片不存在: ${cardId}`);
    }

    // 合并配置
    const config = this._mergeConfig(card.schema || {}, userConfig);
    
    // 准备数据上下文
    const data = { hass };
    const context = { 
      theme: themeVariables,
      renderBlock: (block) => renderBlock(block, hass),
      renderBlocks: (blocks) => renderBlocks(blocks, hass),
      renderBlocksByArea: (blocks) => this._renderBlocksByArea(blocks, hass, card.layout)
    };

    try {
      const template = card.template(config, data, context);
      const styles = card.styles(config, themeVariables);
      
      return {
        template,
        styles,
        config
      };
    } catch (error) {
      throw new Error(`卡片渲染失败: ${error.message}`);
    }
  }

  // 按区域渲染块
  _renderBlocksByArea(blocks, hass, layout = {}) {
    if (!blocks || Object.keys(blocks).length === 0) return '';
    
    const areas = layout.areas || [{ id: 'content' }];
    const blocksByArea = {};
    
    // 初始化区域分组
    areas.forEach(area => {
      blocksByArea[area.id] = [];
    });
    
    // 按区域分组
    Object.entries(blocks).forEach(([id, block]) => {
      const area = block.area || 'content';
      if (!blocksByArea[area]) {
        blocksByArea[area] = [];
      }
      blocksByArea[area].push([id, block]);
    });
    
    // 渲染每个区域
    let html = '';
    areas.forEach(area => {
      const areaBlocks = blocksByArea[area.id];
      if (areaBlocks && areaBlocks.length > 0) {
        html += `<div class="card-area area-${area.id}">`;
        html += areaBlocks.map(([id, block]) => renderBlock(block, hass)).join('');
        html += '</div>';
      }
    });
    
    // 渲染未指定区域的块
    const unassignedBlocks = blocksByArea['content'] || [];
    if (unassignedBlocks.length > 0) {
      if (!areas.some(area => area.id === 'content')) {
        html += `<div class="card-area area-content">`;
        html += unassignedBlocks.map(([id, block]) => renderBlock(block, hass)).join('');
        html += '</div>';
      }
    }
    
    return html;
  }

  // 合并配置（用户配置 + 默认值）
  _mergeConfig(schema, userConfig) {
    const config = { ...userConfig };
    
    // 应用schema中的默认值
    if (schema) {
      Object.entries(schema).forEach(([key, field]) => {
        if (config[key] === undefined && field.default !== undefined) {
          config[key] = field.default;
        }
      });
    }
    
    // 确保有blocks字段
    if (config.blocks === undefined) {
      config.blocks = {};
    }
    
    return config;
  }

  // 验证块配置是否合法
  validateBlock(block, cardId) {
    if (!block) return false;
    
    // 所有块都必须有entity字段
    if (!block.entity) return false;
    
    return true;
  }

  // 获取卡片支持的区域配置
  getCardAreas(cardId) {
    const card = this.getCard(cardId);
    if (!card) return [];
    
    return card.layout?.areas || [{ id: 'content', label: '内容区' }];
  }

  // 获取卡片预设块定义
  getPresetBlocks(cardId) {
    const card = this.getCard(cardId);
    if (!card || card.blockType !== 'preset') return null;
    
    return card.presetBlocks || {};
  }

  // 生成预设块的初始配置
  generatePresetBlocks(cardId) {
    const card = this.getCard(cardId);
    if (!card || card.blockType !== 'preset') return {};
    
    const presetBlocks = {};
    const presetDefs = card.presetBlocks || {};
    
    Object.entries(presetDefs).forEach(([key, preset]) => {
      const blockId = `preset_${key}_${Date.now()}`;
      presetBlocks[blockId] = {
        entity: '',
        name: preset.defaultName || key,
        icon: preset.defaultIcon || 'mdi:cube-outline',
        area: preset.area || 'content',
        presetKey: key,
        required: preset.required || false
      };
    });
    
    return presetBlocks;
  }

  // 清理配置中的无效块
  cleanupBlocks(config, hass) {
    if (!config?.blocks) return config;
    
    const validBlocks = {};
    
    Object.entries(config.blocks).forEach(([id, block]) => {
      if (this.validateBlock(block, config.card_type)) {
        validBlocks[id] = block;
      }
    });
    
    return {
      ...config,
      blocks: validBlocks
    };
  }
}

// 创建全局实例
const cardSystem = new CardSystem();

// 自动初始化
cardSystem.initialize();

export { cardSystem, CardSystem };
