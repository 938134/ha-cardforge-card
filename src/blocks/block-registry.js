// src/blocks/block-registry.js
class BlockRegistry {
    static _blockTypes = new Map();
    static _initialized = false;
  
    static async initialize() {
      if (this._initialized) return;
  
    // 动态导入所有块类型
    const blockModules = [
      { name: 'sensor', importFn: () => import('./types/sensor-block.js') },
      { name: 'text', importFn: () => import('./types/text-block.js') },
      { name: 'time', importFn: () => import('./types/time-block.js') },
      { name: 'weather', importFn: () => import('./types/weather-block.js') },
      { name: 'media', importFn: () => import('./types/media-block.js') },
      { name: 'action', importFn: () => import('./types/action-block.js') },
      { name: 'chart', importFn: () => import('./types/chart-block.js') },
      { name: 'layout', importFn: () => import('./types/layout-block.js') }
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
  
    static _registerBlockModule(blockType, module) {
      // 修复：检查模块结构，支持多种导出方式
      let BlockClass = null;
      
      if (module.default) {
        // ES6 默认导出
        BlockClass = module.default;
      } else if (Object.keys(module).length > 0) {
        // 命名导出，取第一个类
        const firstKey = Object.keys(module)[0];
        BlockClass = module[firstKey];
      }
      
      if (BlockClass && BlockClass.blockType) {
        this._blockTypes.set(BlockClass.blockType, BlockClass);
        console.log(`✅ 成功注册块类型: ${BlockClass.blockType}`);
      } else {
        console.warn(`❌ 块类型 ${blockType} 格式不正确，跳过注册`);
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