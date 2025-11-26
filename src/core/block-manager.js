// src/core/block-manager.js
class BlockManager {
  constructor() {
    this.blocks = new Map();
    this._initialized = false;
    this._initializationPromise = null;
  }

  async initialize() {
    if (this._initialized) return;

    // 防止重复初始化
    if (!this._initializationPromise) {
      this._initializationPromise = this._discoverBlocks();
    }

    await this._initializationPromise;
    this._initialized = true;
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
      console.log(`✅ 注册块: ${blockType}`, BlockClass.manifest);
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

  // 检查是否已初始化
  isInitialized() {
    return this._initialized;
  }
}

const blockManager = new BlockManager();

// 立即开始初始化，但不阻塞
blockManager.initialize().catch(error => {
  console.error('块管理器初始化失败:', error);
});

export { blockManager, BlockManager };
