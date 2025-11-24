// src/blocks/renderers/absolute-renderer.js
export class AbsoluteRenderer {
    static render(blocks, absoluteConfig, hass) {
      const { containerWidth = 1000, containerHeight = 600 } = absoluteConfig;
  
      const containerStyle = `
        width: ${containerWidth}px;
        height: ${containerHeight}px;
      `;
  
      const blocksHtml = blocks.map(block => 
        this._renderBlock(block, hass, containerWidth, containerHeight)
      ).join('');
  
      return `
        <div class="absolute-layout" style="${containerStyle}">
          ${blocksHtml}
        </div>
      `;
    }
  
    static _renderBlock(block, hass, containerWidth, containerHeight) {
      const BlockClass = window.BlockRegistry.getBlockClass(block.type);
      if (!BlockClass) {
        return this._renderErrorBlock(block, '未知块类型');
      }
  
      try {
        const instance = new BlockClass();
        const content = instance.render(block, hass);
        const styles = instance.getStyles(block);
  
        const blockStyle = this._calculateBlockStyle(block, containerWidth, containerHeight);
  
        return `
          <div class="absolute-block" data-block-id="${block.id}" style="${blockStyle}">
            ${content}
            <style>${styles}</style>
          </div>
        `;
      } catch (error) {
        console.error(`渲染绝对定位块 ${block.id} 失败:`, error);
        return this._renderErrorBlock(block, error.message);
      }
    }
  
    static _renderErrorBlock(block, error) {
      return `
        <div class="absolute-block error" data-block-id="${block.id}">
          <div class="block-container cf-error">
            <div class="cf-flex cf-flex-center cf-flex-column cf-p-md">
              <ha-icon icon="mdi:alert-circle"></ha-icon>
              <div class="cf-text-sm cf-mt-sm">渲染失败</div>
              <div class="cf-text-xs cf-text-secondary">${error}</div>
            </div>
          </div>
        </div>
      `;
    }
  
    static _calculateBlockStyle(block, containerWidth, containerHeight) {
      const position = block.position || { x: 0, y: 0, w: 2, h: 2 };
      
      // 使用10x10的网格系统
      const cellWidth = containerWidth / 10;
      const cellHeight = containerHeight / 10;
  
      const left = position.x * cellWidth;
      const top = position.y * cellHeight;
      const width = position.w * cellWidth;
      const height = position.h * cellHeight;
  
      // 应用旋转和缩放变换
      const transform = this._calculateTransform(block);
  
      return `
        position: absolute;
        left: ${left}px;
        top: ${top}px;
        width: ${width}px;
        height: ${height}px;
        transform: ${transform};
        z-index: ${block.config?.zIndex || 1};
      `;
    }
  
    static _calculateTransform(block) {
      const transforms = [];
      
      if (block.config?.rotate) {
        transforms.push(`rotate(${block.config.rotate}deg)`);
      }
      
      if (block.config?.scale) {
        transforms.push(`scale(${block.config.scale})`);
      }
      
      if (block.config?.skewX) {
        transforms.push(`skewX(${block.config.skewX}deg)`);
      }
      
      if (block.config?.skewY) {
        transforms.push(`skewY(${block.config.skewY}deg)`);
      }
  
      return transforms.join(' ') || 'none';
    }
  
    static getStyles(absoluteConfig) {
      const { containerWidth = 1000, containerHeight = 600 } = absoluteConfig;
  
      return `
        .absolute-layout {
          position: relative;
          width: ${containerWidth}px;
          height: ${containerHeight}px;
          background: var(--cf-surface);
          border: 1px solid var(--cf-border);
          border-radius: var(--cf-radius-lg);
          overflow: hidden;
          container-type: size;
        }
  
        .absolute-block {
          position: absolute;
          transition: all var(--cf-transition-slow);
          min-width: 60px;
          min-height: 40px;
        }
  
        .absolute-block:hover {
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
  
        .absolute-block.selected {
          outline: 2px solid var(--cf-primary-color);
          outline-offset: 2px;
          z-index: 1000;
        }
  
        .absolute-block.error {
          outline: 2px solid var(--cf-error-color);
        }
  
        .absolute-block .block-container {
          width: 100%;
          height: 100%;
          border-radius: var(--cf-radius-md);
          overflow: hidden;
        }
  
        /* 调整手柄 */
        .absolute-block .resize-handle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--cf-primary-color);
          border-radius: 50%;
          opacity: 0;
          transition: opacity var(--cf-transition-fast);
          z-index: 10;
        }
  
        .absolute-block:hover .resize-handle {
          opacity: 1;
        }
  
        .resize-handle.nw {
          top: -4px;
          left: -4px;
          cursor: nw-resize;
        }
  
        .resize-handle.ne {
          top: -4px;
          right: -4px;
          cursor: ne-resize;
        }
  
        .resize-handle.sw {
          bottom: -4px;
          left: -4px;
          cursor: sw-resize;
        }
  
        .resize-handle.se {
          bottom: -4px;
          right: -4px;
          cursor: se-resize;
        }
  
        .resize-handle.n {
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          cursor: n-resize;
        }
  
        .resize-handle.s {
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          cursor: s-resize;
        }
  
        .resize-handle.e {
          top: 50%;
          right: -4px;
          transform: translateY(-50%);
          cursor: e-resize;
        }
  
        .resize-handle.w {
          top: 50%;
          left: -4px;
          transform: translateY(-50%);
          cursor: w-resize;
        }
  
        /* 旋转手柄 */
        .absolute-block .rotate-handle {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          background: var(--cf-primary-color);
          border-radius: 50%;
          cursor: grab;
          opacity: 0;
          transition: opacity var(--cf-transition-fast);
        }
  
        .absolute-block:hover .rotate-handle {
          opacity: 1;
        }
  
        .absolute-block .rotate-handle:active {
          cursor: grabbing;
        }
  
        /* 连接线 */
        .absolute-block .connection-point {
          position: absolute;
          width: 6px;
          height: 6px;
          background: var(--cf-accent-color);
          border-radius: 50%;
          opacity: 0;
          transition: opacity var(--cf-transition-fast);
        }
  
        .absolute-block:hover .connection-point {
          opacity: 1;
        }
  
        .connection-point.top {
          top: -3px;
          left: 50%;
          transform: translateX(-50%);
        }
  
        .connection-point.bottom {
          bottom: -3px;
          left: 50%;
          transform: translateX(-50%);
        }
  
        .connection-point.left {
          top: 50%;
          left: -3px;
          transform: translateY(-50%);
        }
  
        .connection-point.right {
          top: 50%;
          right: -3px;
          transform: translateY(-50%);
        }
  
        /* 拖拽样式 */
        .absolute-block.dragging {
          opacity: 0.7;
          transform: rotate(5deg) !important;
        }
  
        .absolute-block.resizing {
          opacity: 0.8;
        }
  
        /* 网格对齐辅助线 */
        .absolute-layout::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(var(--cf-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--cf-border) 1px, transparent 1px);
          background-size: 10% 10%;
          opacity: 0.3;
          pointer-events: none;
        }
  
        /* 响应式调整 */
        @container (max-width: 800px) {
          .absolute-layout {
            transform: scale(0.8);
            transform-origin: top left;
          }
        }
  
        @container (max-width: 600px) {
          .absolute-layout {
            transform: scale(0.6);
          }
        }
  
        /* 动画效果 */
        .absolute-block-enter {
          opacity: 0;
          transform: scale(0.5) rotate(-180deg);
        }
  
        .absolute-block-enter-active {
          opacity: 1;
          transform: scale(1) rotate(0deg);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
  
        .absolute-block-exit {
          opacity: 1;
          transform: scale(1);
        }
  
        .absolute-block-exit-active {
          opacity: 0;
          transform: scale(0.5) rotate(180deg);
          transition: all 0.3s ease;
        }
  
        /* 图层管理 */
        .absolute-block.layer-1 { z-index: 1; }
        .absolute-block.layer-2 { z-index: 2; }
        .absolute-block.layer-3 { z-index: 3; }
        .absolute-block.layer-top { z-index: 1000; }
        .absolute-block.layer-bottom { z-index: -1; }
      `;
    }
  
    static validateAbsoluteLayout(blocks, containerWidth, containerHeight) {
      const errors = [];
  
      blocks.forEach((block, index) => {
        if (!block.position) {
          errors.push(`块 ${index + 1} 缺少位置数据`);
          return;
        }
  
        const { x, y, w, h } = block.position;
  
        // 检查边界
        if (x < 0 || y < 0 || x + w > 10 || y + h > 10) {
          errors.push(`块 ${index + 1} 超出容器边界`);
        }
  
        if (w < 0.5 || h < 0.5 || w > 10 || h > 10) {
          errors.push(`块 ${index + 1} 尺寸超出允许范围`);
        }
  
        // 检查重叠
        for (let i = index + 1; i < blocks.length; i++) {
          if (this._blocksOverlap(block, blocks[i])) {
            errors.push(`块 ${index + 1} 和块 ${i + 1} 位置重叠`);
          }
        }
      });
  
      return {
        valid: errors.length === 0,
        errors
      };
    }
  
    static _blocksOverlap(blockA, blockB) {
      if (!blockA.position || !blockB.position) return false;
  
      const a = blockA.position;
      const b = blockB.position;
  
      return !(
        a.x + a.w <= b.x ||
        a.x >= b.x + b.w ||
        a.y + a.h <= b.y ||
        a.y >= b.y + b.h
      );
    }
  
    static snapToGrid(x, y, gridSize = 0.5) {
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize
      };
    }
  
    static calculateAutoLayout(blocks, containerWidth, containerHeight) {
      const optimized = [...blocks];
      const gridSize = 1; // 1单位网格
      const margin = 0.5; // 块间距
  
      let currentX = margin;
      let currentY = margin;
      let maxHeightInRow = 0;
  
      optimized.forEach(block => {
        const width = block.position?.w || 2;
        const height = block.position?.h || 1;
  
        // 检查当前行是否有足够空间
        if (currentX + width + margin > 10) {
          currentX = margin;
          currentY += maxHeightInRow + margin;
          maxHeightInRow = 0;
        }
  
        // 更新块位置
        block.position = {
          x: currentX,
          y: currentY,
          w: width,
          h: height
        };
  
        currentX += width + margin;
        maxHeightInRow = Math.max(maxHeightInRow, height);
  
        // 检查是否超出容器高度
        if (currentY + height > 10) {
          console.warn('自动布局超出容器高度');
        }
      });
  
      return optimized;
    }
  
    static getLayeringSuggestions(blocks) {
      const layers = {
        background: [],
        content: [],
        foreground: []
      };
  
      blocks.forEach(block => {
        const type = block.type;
        
        if (['layout', 'chart'].includes(type)) {
          layers.background.push(block.id);
        } else if (['sensor', 'text', 'time', 'weather'].includes(type)) {
          layers.content.push(block.id);
        } else if (['action', 'media'].includes(type)) {
          layers.foreground.push(block.id);
        } else {
          layers.content.push(block.id);
        }
      });
  
      return layers;
    }
  
    static calculateOptimalContainerSize(blocks) {
      let maxX = 0;
      let maxY = 0;
  
      blocks.forEach(block => {
        if (block.position) {
          const { x, y, w, h } = block.position;
          maxX = Math.max(maxX, x + w);
          maxY = Math.max(maxY, y + h);
        }
      });
  
      // 添加边距
      const padding = 1;
      const suggestedWidth = Math.max(8, Math.ceil(maxX + padding)) * 100;
      const suggestedHeight = Math.max(6, Math.ceil(maxY + padding)) * 100;
  
      return {
        width: suggestedWidth,
        height: suggestedHeight
      };
    }
  }
  
  export default AbsoluteRenderer;