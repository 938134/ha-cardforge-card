// src/blocks/block-registry.js
class BlockRegistry {
  static _blockTypes = new Map();
  static _initialized = false;

  static async initialize() {
    if (this._initialized) return;

    // 改为手动注册块类型，避免重复定义自定义元素
    const blockClasses = [
      await import('./types/sensor-block.js'),
      await import('./types/text-block.js'),
      await import('./types/time-block.js'),
      await import('./types/weather-block.js'),
      await import('./types/media-block.js'),
      await import('./types/action-block.js'),
      await import('./types/chart-block.js'),
      await import('./types/layout-block.js')
    ];

    for (const module of blockClasses) {
      this._registerBlockModule(module);
    }

    this._initialized = true;
  }

  static _registerBlockModule(module) {
    if (module.default && module.default.blockType) {
      const blockClass = module.default;
      
      // 检查是否已经注册过
      if (!this._blockTypes.has(blockClass.blockType)) {
        this._blockTypes.set(blockClass.blockType, blockClass);
      }
    }
  }

  // 其他方法保持不变...
  static register(blockType, blockClass) {
    if (this._blockTypes.has(blockType)) {
      console.warn(`块类型 ${blockType} 已经注册，跳过重复注册`);
      return;
    }
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

// 延迟初始化，避免重复执行
let initializationPromise = null;
BlockRegistry.initialize = function() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      if (this._initialized) return;
      
      // 改为手动注册块类型
      const blockClasses = [
        await import('./types/sensor-block.js'),
        await import('./types/text-block.js'),
        await import('./types/time-block.js'),
        await import('./types/weather-block.js'),
        await import('./types/media-block.js'),
        await import('./types/action-block.js'),
        await import('./types/chart-block.js'),
        await import('./types/layout-block.js')
      ];

      for (const module of blockClasses) {
        this._registerBlockModule(module);
      }

      this._initialized = true;
    })();
  }
  
  return initializationPromise;
};

export { BlockRegistry };