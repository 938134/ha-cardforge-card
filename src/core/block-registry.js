// src/core/block-registry.js
class BlockRegistry {
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
      console.error('❌ 块注册表初始化失败:', error);
    }
  }

  async _discoverBlocks() {
    const blockFiles = {
      'text': () => import('../blocks/text-block.js'),
      'entity': () => import('../blocks/entity-block.js'),
      'time': () => import('../blocks/time-block.js'),
      'layout': () => import('../blocks/layout-block.js')
    };

    for (const [blockType, importFn] of Object.entries(blockFiles)) {
      try {
        const module = await importFn();
        this._registerBlockModule(blockType, module);
      } catch (error) {
        console.warn(`⚠️ 加载块 ${blockType} 失败:`, error);
      }
    }
  }

  _registerBlockModule(blockType, module) {
    if (module.default) {
      const BlockClass = module.default;
      
      this.blocks.set(blockType, {
        type: blockType,
        class: BlockClass,
        manifest: BlockClass.manifest
      });
    }
  }

  getBlock(blockType) {
    return this.blocks.get(blockType);
  }

  getAllBlocks() {
    return Array.from(this.blocks.values()).map(item => ({
      ...item.manifest,
      type: item.type
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
}

const blockRegistry = new BlockRegistry();
blockRegistry.initialize();

export { blockRegistry, BlockRegistry };