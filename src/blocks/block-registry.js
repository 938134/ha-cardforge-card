// src/blocks/block-registry.js
class BlockRegistry {
  static _blocks = new Map();
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;

    try {
      await this._discoverBlocks();
      this._initialized = true;
    } catch (error) {
      console.error('❌ 块注册表初始化失败:', error);
    }
  }

  static async _discoverBlocks() {
    const blockModules = [
      () => import('./types/text-block.js'),
      () => import('./types/time-block.js'),
    ];

    for (const importFn of blockModules) {
      try {
        const module = await importFn();
        this._registerBlockModule(module);
      } catch (error) {
        console.error(`❌ 加载块失败:`, error);
      }
    }
  }

  static _registerBlockModule(module) {
    if (!module.default) {
      console.warn('块缺少默认导出，跳过注册');
      return;
    }

    const BlockClass = module.default;
    
    if (!BlockClass.blockType) {
      console.warn('块缺少 blockType，跳过注册');
      return;
    }

    const blockId = BlockClass.blockType;
    
    if (typeof BlockClass.prototype.render === 'function' && 
        typeof BlockClass.prototype.getStyles === 'function') {
      
      this._blocks.set(blockId, {
        id: blockId,
        class: BlockClass,
        manifest: {
          id: blockId,
          name: BlockClass.blockName,
          description: BlockClass.description,
          icon: BlockClass.blockIcon,
          category: BlockClass.category
        }
      });
    } else {
      console.warn(`块 ${blockId} 接口不完整，跳过`);
    }
  }

  // === 核心API ===
  static getBlock(blockId) {
    return this._blocks.get(blockId);
  }

  static getAllBlocks() {
    return Array.from(this._blocks.values()).map(item => ({
      ...item.manifest,
      id: item.id
    }));
  }

  static getBlockClass(blockId) {
    const block = this._blocks.get(blockId);
    return block ? block.class : null;
  }

  static createBlockInstance(blockId) {
    const BlockClass = this.getBlockClass(blockId);
    return BlockClass ? new BlockClass() : null;
  }

  static getBlockManifest(blockId) {
    const block = this._blocks.get(blockId);
    return block ? block.manifest : null;
  }

  // 渲染方法
  static render(block, hass) {
    const instance = this.createBlockInstance(block.type);
    if (!instance) {
      throw new Error(`未知的块类型: ${block.type}`);
    }
    return instance.render(block, hass);
  }

  static getStyles(block) {
    const instance = this.createBlockInstance(block.type);
    if (!instance) return '';
    return instance.getStyles(block);
  }

  static getEditTemplate(block, hass, onConfigChange) {
    const instance = this.createBlockInstance(block.type);
    if (!instance) return '';
    
    if (typeof instance.getEditTemplate === 'function') {
      return instance.getEditTemplate(block, hass, onConfigChange);
    }
    return '';
  }

  static getDefaultConfig(blockType) {
    const instance = this.createBlockInstance(blockType);
    if (!instance) return {};
    
    if (typeof instance.getDefaultConfig === 'function') {
      return instance.getDefaultConfig();
    }
    return {};
  }

  static validateConfig(blockType, config) {
    const instance = this.createBlockInstance(blockType);
    if (!instance) return { valid: false, errors: ['未知块类型'] };
    
    if (typeof instance.validateConfig === 'function') {
      return instance.validateConfig(config);
    }
    return { valid: true, errors: [] };
  }
}

// 自动初始化
BlockRegistry.initialize();

export { BlockRegistry };