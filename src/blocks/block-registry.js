// src/blocks/block-registry.js
class BlockRegistry {
    static _blockTypes = new Map();
    static _initialized = false;
  
    static async initialize() {
      if (this._initialized) return;
  
      console.log('🔄 开始初始化块注册中心...');
  
      // 使用相对路径导入（与原来插件系统相同的方式）
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
          console.log(`✅ 成功加载块类型`);
        } catch (error) {
          console.error('💥 加载块类型失败:', error);
          
          // 详细错误信息
          if (error.message.includes('Failed to fetch')) {
            console.error('📁 文件路径错误，请检查文件是否存在');
          } else if (error.message.includes('Unexpected token')) {
            console.error('📝 语法错误，请检查文件格式');
          } else {
            console.error('🔧 未知错误:', error);
          }
        }
      }
  
      this._initialized = true;
      console.log(`🎉 块注册中心初始化完成，共注册 ${this._blockTypes.size} 个块类型`);
    }
  
    static _registerBlockModule(module) {
      // 支持多种导出方式
      let BlockClass = null;
      
      if (module.default) {
        // ES6 默认导出
        BlockClass = module.default;
      } else {
        // 命名导出，取第一个导出的类
        const exportedKeys = Object.keys(module);
        if (exportedKeys.length > 0) {
          BlockClass = module[exportedKeys[0]];
        }
      }
      
      if (BlockClass && BlockClass.blockType) {
        this._blockTypes.set(BlockClass.blockType, BlockClass);
        console.log(`✅ 成功注册块类型: ${BlockClass.blockType}`);
      } else {
        console.warn('❌ 块类型格式不正确，跳过注册');
        console.log('模块内容:', module);
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