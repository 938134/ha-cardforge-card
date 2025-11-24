// src/blocks/renderers/grid-renderer.js
export class GridRenderer {
    static render(blocks, gridConfig, hass) {
      const { columns = 4, gap = '8px' } = gridConfig;
      
      const gridStyle = `
        grid-template-columns: repeat(${columns}, 1fr);
        gap: ${gap};
      `;
  
      const blocksHtml = blocks.map(block => 
        this._renderBlock(block, hass)
      ).join('');
  
      return `
        <div class="grid-layout" style="${gridStyle}">
          ${blocksHtml}
        </div>
      `;
    }
  
    static _renderBlock(block, hass) {
      const BlockClass = window.BlockRegistry.getBlockClass(block.type);
      if (!BlockClass) {
        return this._renderErrorBlock(block, '未知块类型');
      }
  
      try {
        const instance = new BlockClass();
        const content = instance.render(block, hass);
        const styles = instance.getStyles(block);
  
        return `
          <div class="grid-block" data-block-id="${block.id}">
            ${content}
            <style>${styles}</style>
          </div>
        `;
      } catch (error) {
        console.error(`渲染网格块 ${block.id} 失败:`, error);
        return this._renderErrorBlock(block, error.message);
      }
    }
  
    static _renderErrorBlock(block, error) {
      return `
        <div class="grid-block error" data-block-id="${block.id}">
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
  
    static getStyles(gridConfig) {
      const { columns = 4, gap = '8px' } = gridConfig;
      
      return `
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(${columns}, 1fr);
          gap: ${gap};
          width: 100%;
          height: 100%;
          container-type: inline-size;
        }
  
        .grid-block {
          position: relative;
          transition: all var(--cf-transition-fast);
          min-height: 60px;
        }
  
        .grid-block:hover {
          transform: translateY(-2px);
          z-index: 2;
        }
  
        .grid-block.error {
          outline: 2px solid var(--cf-error-color);
        }
  
        .grid-block .block-container {
          height: 100%;
          border-radius: var(--cf-radius-md);
          overflow: hidden;
        }
  
        /* 响应式网格 */
        @container (max-width: 600px) {
          .grid-layout {
            grid-template-columns: repeat(${Math.min(columns, 3)}, 1fr);
          }
        }
  
        @container (max-width: 400px) {
          .grid-layout {
            grid-template-columns: repeat(${Math.min(columns, 2)}, 1fr);
          }
        }
  
        @container (max-width: 300px) {
          .grid-layout {
            grid-template-columns: 1fr;
          }
        }
  
        /* 网格块动画 */
        .grid-block-enter {
          opacity: 0;
          transform: scale(0.8);
        }
  
        .grid-block-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: all 0.3s ease;
        }
  
        .grid-block-exit {
          opacity: 1;
          transform: scale(1);
        }
  
        .grid-block-exit-active {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }
  
        /* 网格拖拽样式 */
        .grid-block.dragging {
          opacity: 0.5;
          transform: rotate(5deg);
        }
  
        .grid-block.drop-zone {
          outline: 2px dashed var(--cf-primary-color);
          background: rgba(var(--cf-rgb-primary), 0.05);
        }
  
        /* 网格排序占位符 */
        .grid-placeholder {
          background: rgba(var(--cf-rgb-primary), 0.1);
          border: 2px dashed var(--cf-primary-color);
          border-radius: var(--cf-radius-md);
          min-height: 60px;
        }
      `;
    }
  
    static calculatePositions(blocks, columns) {
      const positions = [];
      let currentIndex = 0;
  
      // 简单的从左到右、从上到下排列
      for (let row = 0; row < Math.ceil(blocks.length / columns); row++) {
        for (let col = 0; col < columns; col++) {
          if (currentIndex >= blocks.length) break;
          
          positions.push({
            row: row + 1,
            col: col + 1,
            index: currentIndex
          });
          currentIndex++;
        }
      }
  
      return positions;
    }
  
    static validateGridLayout(blocks, columns) {
      const errors = [];
  
      blocks.forEach((block, index) => {
        // 检查块位置是否超出网格范围
        if (block.position) {
          const { x, y, w, h } = block.position;
          
          if (x + w > columns) {
            errors.push(`块 ${index + 1} 超出网格列范围`);
          }
          
          if (x < 0 || y < 0 || w < 1 || h < 1) {
            errors.push(`块 ${index + 1} 位置数据无效`);
          }
        }
  
        // 检查块重叠
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
  
    static optimizeGrid(blocks, columns) {
      const optimized = [...blocks];
      
      // 简单的优化：按块大小排序，大的放前面
      optimized.sort((a, b) => {
        const sizeA = (a.position?.w || 1) * (a.position?.h || 1);
        const sizeB = (b.position?.w || 1) * (b.position?.h || 1);
        return sizeB - sizeA;
      });
  
      // 重新计算位置
      const grid = Array(columns).fill().map(() => []);
      const positions = [];
  
      optimized.forEach(block => {
        const width = block.position?.w || 1;
        const height = block.position?.h || 1;
        
        const position = this._findGridPosition(grid, width, height, columns);
        if (position) {
          positions.push(position);
          this._placeBlock(grid, position, width, height);
        }
      });
  
      // 更新块位置
      optimized.forEach((block, index) => {
        if (positions[index]) {
          block.position = positions[index];
        }
      });
  
      return optimized;
    }
  
    static _findGridPosition(grid, width, height, columns) {
      for (let row = 0; row < 20; row++) { // 限制最大行数
        for (let col = 0; col <= columns - width; col++) {
          if (this._canPlaceBlock(grid, col, row, width, height)) {
            return { x: col, y: row, w: width, h: height };
          }
        }
      }
      return null;
    }
  
    static _canPlaceBlock(grid, startCol, startRow, width, height) {
      for (let row = startRow; row < startRow + height; row++) {
        for (let col = startCol; col < startCol + width; col++) {
          if (grid[col] && grid[col][row]) {
            return false;
          }
        }
      }
      return true;
    }
  
    static _placeBlock(grid, position, width, height) {
      for (let row = position.y; row < position.y + height; row++) {
        for (let col = position.x; col < position.x + width; col++) {
          if (!grid[col]) grid[col] = [];
          grid[col][row] = true;
        }
      }
    }
  }
  
  export {GridRenderer};