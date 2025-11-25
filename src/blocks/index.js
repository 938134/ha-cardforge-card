// src/blocks/index.js
import { blockManager } from '../core/block-manager.js';

// 导出所有块类型
export { default as TextBlock } from './text-block.js';
export { default as EntityBlock } from './entity-block.js';
export { default as TimeBlock } from './time-block.js';
export { default as LayoutBlock } from './layout-block.js';

// 导出块管理器
export { blockManager };

// 便捷方法
export const getAllBlocks = () => blockManager.getAllBlocks();
export const getBlockManifest = (blockType) => blockManager.getBlockManifest(blockType);
export const createBlockInstance = (blockType) => blockManager.createBlockInstance(blockType);

export default blockManager;
