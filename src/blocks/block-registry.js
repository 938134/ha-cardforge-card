// src/blocks/block-registry.js
class BlockRegistry {
    static _blockTypes = new Map();
    static _initialized = false;
  
    static async initialize() {
      if (this._initialized) return;
  
      console.log('🔄 开始初始化块注册中心...');
  
      // 动态导入所有块类型
      const blockModules = [
        { name: 'sensor', path: './types/sensor-block.js' },
        { name: 'text', path: './types/text-block.js' },
        { name: 'time', path: './types/time-block.js' },
        { name: 'weather', path: './types/weather-block.js' },
        { name: 'media', path: './types/media-block.js' },
        { name: 'action', path: './types/action-block.js' },
        { name: 'chart', path: './types/chart-block.js' },
        { name: 'layout', path: './types/layout-block.js' }
      ];
  
      for (const { name, path } of blockModules) {
        try {
          console.log(`📦 加载块类型: ${name}`);
          const module = await import(path);
          
          if (module && module.default) {
            this._registerBlockModule(module.default);
            console.log(`✅ 成功注册: ${name}`);
          } else {
            console.warn(`❌ 模块 ${name} 没有默认导出`);
          }
        } catch (error) {
          console.error(`💥 加载块类型 ${name} 失败:`, error);
        }
      }
  
      this._initialized = true;
      console.log(`🎉 块注册中心初始化完成，共注册 ${this._blockTypes.size} 个块类型`);
    }
  
    static _registerBlockModule(BlockClass) {
      if (!BlockClass || !BlockClass.blockType) {
        console.warn('❌ 无效的块类，缺少 blockType 属性');
        return;
      }
  
      if (typeof BlockClass.prototype.render !== 'function') {
        console.warn(`❌ 块类 ${BlockClass.blockType} 缺少 render 方法`);
        return;
      }
  
      this._blockTypes.set(BlockClass.blockType, BlockClass);
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
      if (typeof instance.getEditTemplate === 'function') {
        return instance.getEditTemplate(block, hass, onConfigChange);
      }
      return '';
    }
  
    static getDefaultConfig(blockType) {
      const BlockClass = this.getBlockClass(blockType);
      if (!BlockClass) return {};
  
      const instance = new BlockClass();
      if (typeof instance.getDefaultConfig === 'function') {
        return instance.getDefaultConfig();
      }
      return {};
    }
  
    static validateConfig(blockType, config) {
      const BlockClass = this.getBlockClass(blockType);
      if (!BlockClass) return { valid: false, errors: ['未知块类型'] };
  
      const instance = new BlockClass();
      if (typeof instance.validateConfig === 'function') {
        return instance.validateConfig(config);
      }
      return { valid: true, errors: [] };
    }
  }
  
// 自动初始化但捕获错误
BlockRegistry.initialize().catch(error => {
  console.error('块注册中心初始化失败:', error);
});
  
  export { BlockRegistry };