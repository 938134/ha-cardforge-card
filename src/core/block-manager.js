// src/core/block-manager.js
class BlockManager {
  constructor() {
    this.blocks = new Map();
    this._initialized = false;
  }

  async initialize() {
    if (this._initialized) return;

    try {
      await this._discoverBlocks();
      this._initialized = true;
    } catch (error) {
      console.error('❌ 块系统初始化失败:', error);
    }
  }

  async _discoverBlocks() {
    const blockFiles = {
      'sensor': () => import('../blocks/types/sensor-block.js'),
      'text': () => import('../blocks/types/text-block.js'),
      'time': () => import('../blocks/types/time-block.js'),
      'weather': () => import('../blocks/types/weather-block.js'),
      'media': () => import('../blocks/types/media-block.js'),
      'chart': () => import('../blocks/types/chart-block.js'),
      'action': () => import('../blocks/types/action-block.js'),
      'layout': () => import('../blocks/types/layout-block.js')
    };

    for (const [blockType, importFn] of Object.entries(blockFiles)) {
      try {
        const module = await importFn();
        this._registerBlockModule(blockType, module);
      } catch (error) {
        console.warn(`⚠️ 加载块类型 ${blockType} 失败:`, error);
      }
    }
  }

  _registerBlockModule(blockType, module) {
    if (module.default && module.default.blockType) {
      const BlockClass = module.default;
      
      this.blocks.set(blockType, {
        id: blockType,
        class: BlockClass,
        manifest: {
          id: BlockClass.blockType,
          name: BlockClass.blockName,
          description: BlockClass.description,
          icon: BlockClass.blockIcon,
          category: BlockClass.category
        }
      });
    } else {
      console.warn(`块 ${blockType} 格式不正确，跳过`);
    }
  }

  // === 核心API ===
  getBlock(blockType) {
    return this.blocks.get(blockType);
  }

  getAllBlocks() {
    return Array.from(this.blocks.values()).map(item => ({
      ...item.manifest,
      id: item.id
    }));
  }

  getBlockClass(blockType) {
    const block = this.blocks.get(blockType);
    return block ? block.class : null;
  }

  createBlockInstance(blockType) {
    const BlockClass = this.getBlockClass(blockType);
    return BlockClass ? new BlockClass() : null;
  }

  getBlockManifest(blockType) {
    const block = this.blocks.get(blockType);
    return block ? block.manifest : null;
  }

  // === 渲染和样式 ===
  render(block, hass) {
    const instance = this.createBlockInstance(block.type);
    if (!instance) {
      throw new Error(`未知的块类型: ${block.type}`);
    }
    return instance.render(block, hass);
  }

  getStyles(block) {
    const instance = this.createBlockInstance(block.type);
    if (!instance) return '';
    return instance.getStyles(block);
  }

  // === 编辑器支持 ===
  getEditTemplate(block, hass, onConfigChange) {
    const instance = this.createBlockInstance(block.type);
    if (!instance) return '';
    return instance.getEditTemplate(block, hass, onConfigChange);
  }

  getDefaultConfig(blockType) {
    const instance = this.createBlockInstance(blockType);
    if (!instance) return {};
    return instance.getDefaultConfig();
  }

  validateConfig(blockType, config) {
    const instance = this.createBlockInstance(blockType);
    if (!instance) return { valid: false, errors: ['未知块类型'] };
    return instance.validateConfig(config);
  }

  // === 动态块注册 ===
  registerDynamicBlock(blockConfig) {
    if (!blockConfig.id || !blockConfig.name || !blockConfig.render) {
      console.warn('动态块配置不完整，跳过注册');
      return;
    }

    // 创建动态块类
    class DynamicBlock {
      static blockType = blockConfig.id;
      static blockName = blockConfig.name;
      static blockIcon = blockConfig.icon || 'mdi:cube';
      static category = blockConfig.category || 'custom';
      static description = blockConfig.description || `${blockConfig.name}块`;

      render(block, hass) {
        return blockConfig.render(block, hass);
      }

      getStyles(block) {
        return blockConfig.getStyles ? blockConfig.getStyles(block) : '';
      }

      getEditTemplate(block, hass, onConfigChange) {
        return blockConfig.getEditTemplate ? 
          blockConfig.getEditTemplate(block, hass, onConfigChange) : 
          '<div class="cf-text-secondary">此块类型不支持编辑</div>';
      }

      getDefaultConfig() {
        return blockConfig.defaultConfig || {};
      }

      validateConfig(config) {
        return blockConfig.validateConfig ? 
          blockConfig.validateConfig(config) : 
          { valid: true, errors: [] };
      }
    }

    this.blocks.set(blockConfig.id, {
      id: blockConfig.id,
      class: DynamicBlock,
      manifest: {
        id: blockConfig.id,
        name: blockConfig.name,
        description: blockConfig.description || `${blockConfig.name}块`,
        icon: blockConfig.icon || 'mdi:cube',
        category: blockConfig.category || 'custom'
      }
    });
  }
}

// 创建全局块管理器实例
const blockManager = new BlockManager();

// 自动初始化
blockManager.initialize();

export { blockManager, BlockManager };