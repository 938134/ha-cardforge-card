// src/blocks/index.js
import { blockRegistry } from '../core/block-registry.js';

// 自动导入并注册所有内置块
async function registerAllBlocks() {
  const blockModules = {
    text: () => import('./text-block.js'),
    entity: () => import('./entity-block.js'),
    time: () => import('./time-block.js'),
    layout: () => import('./layout-block.js'),
    // 可在此处添加更多块，例如：
    // image: () => import('./image-block.js'),
    // button: () => import('./button-block.js'),
  };

  for (const [type, importFn] of Object.entries(blockModules)) {
    try {
      const module = await importFn();
      if (module.default) {
        blockRegistry.blocks.set(type, {
          type,
          class: module.default,
          manifest: module.default.manifest,
        });
      }
    } catch (error) {
      console.warn(`⚠️ 块 ${type} 加载失败:`, error);
    }
  }
}

// 立即执行注册（也可改为按需调用）
registerAllBlocks().then(() => {
  blockRegistry._initialized = true;
});

export { registerAllBlocks };
