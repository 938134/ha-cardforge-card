// src/blocks/index.js

export { default as TextBlock } from './text-block.js';
export { default as EntityBlock } from './entity-block.js';
export { default as TimeBlock } from './time-block.js';
export { default as LayoutBlock } from './layout-block.js';

// 可选：导出 manifest 便于外部使用
export const blockManifests = {
  text: TextBlock.manifest,
  entity: EntityBlock.manifest,
  time: TimeBlock.manifest,
  layout: LayoutBlock.manifest,
};
