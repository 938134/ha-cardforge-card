// src/blocks/block-registry.js
class BlockRegistry {
  static _blockTypes = new Map();
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;

    // 动态导入所有块类型
    const blockModules = [
      () => import('./types/text-block.js'),
      () => import('./types/time-block.js'),
    ];

    for (const importFn of blockModules) {
      try {
        const module = await importFn();
        this._registerBlockModule(module);
      } catch (error) {
        console.warn('加载块类型失败:', error);
      }
    }

    this._initialized = true;
  }

  static _registerBlockModule(module) {
    if (module.default && module.default.blockType) {
      const blockClass = module.default;
      this._blockTypes.set(blockClass.blockType, blockClass);
    }
  }

  static register(blockType, blockClass) {
    this._blockTypes.set(blockType, blockClass);
  }

  static getBlockClass(blockType) {
    return this._blockTypes.get(blockType);
  }

  static getAllBlockTypes() {
    return Array.from(this._blockTypes.values()).map(BlockClass => ({
      type: BlockClass.blockType,
      name: BlockClass.blockName,
      icon: BlockClass.blockIcon,
      category: BlockClass.category,
      description: BlockClass.description
    }));
  }

  static render(block, hass) {
    const BlockClass = this.getBlockClass(block.type);
    if (!BlockClass) {
      throw new Error(`未知的块类型: ${block.type}`);
    }

    const instance = new BlockClass();
    return instance.render(block, hass);
  }

  static getStyles(block) {
    const BlockClass = this.getBlockClass(block.type);
    if (!BlockClass) return '';

    const instance = new BlockClass();
    return instance.getStyles(block);
  }

  static getEditTemplate(block, hass, onConfigChange) {
    const BlockClass = this.getBlockClass(block.type);
    if (!BlockClass) return '';

    const instance = new BlockClass();
    return instance.getEditTemplate(block, hass, onConfigChange);
  }

  static getDefaultConfig(blockType) {
    const BlockClass = this.getBlockClass(blockType);
    if (!BlockClass) return {};

    const instance = new BlockClass();
    return instance.getDefaultConfig();
  }

  static validateConfig(blockType, config) {
    const BlockClass = this.getBlockClass(blockType);
    if (!BlockClass) return { valid: false, errors: ['未知块类型'] };

    const instance = new BlockClass();
    return instance.validateConfig(config);
  }
}

// 自动初始化
BlockRegistry.initialize();

export { BlockRegistry };