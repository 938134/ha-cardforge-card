// src/core/layout-engine.js
export class LayoutEngine {
    static calculateGridPositions(blocks, columns) {
      const positions = [];
      let currentRow = 0;
      let currentCol = 0;
  
      blocks.forEach(block => {
        const blockWidth = block.position?.w || 1;
        const blockHeight = block.position?.h || 1;
  
        // 检查当前行是否有足够空间
        if (currentCol + blockWidth > columns) {
          currentRow++;
          currentCol = 0;
        }
  
        positions.push({
          x: currentCol,
          y: currentRow,
          w: blockWidth,
          h: blockHeight
        });
  
        currentCol += blockWidth;
  
        // 如果块高度大于1，跳过相应行数
        if (blockHeight > 1) {
          currentRow += blockHeight - 1;
          currentCol = 0;
        }
      });
  
      return positions;
    }
  
    static optimizeGridLayout(blocks, columns) {
      const optimized = [...blocks];
      const positions = this.calculateGridPositions(optimized, columns);
  
      optimized.forEach((block, index) => {
        block.position = positions[index];
      });
  
      return optimized;
    }
  
    static calculateFlexSizes(blocks, containerWidth) {
      const minBlockWidth = 150; // 最小块宽度
      const gap = 12; // 间距
      
      // 计算每行可以容纳的块数
      const blocksPerRow = Math.max(1, Math.floor(containerWidth / (minBlockWidth + gap)));
      
      return blocks.map(block => {
        const flexBasis = `calc(${100 / blocksPerRow}% - ${gap}px)`;
        return {
          ...block,
          style: {
            ...block.style,
            flexBasis
          }
        };
      });
    }
  
    static calculateAbsolutePositions(blocks, containerWidth, containerHeight) {
      const cellWidth = containerWidth / 10; // 10列网格
      const cellHeight = containerHeight / 10; // 10行网格
  
      return blocks.map(block => {
        const position = block.position || { x: 0, y: 0, w: 2, h: 2 };
        
        return {
          ...block,
          computedPosition: {
            left: position.x * cellWidth,
            top: position.y * cellHeight,
            width: position.w * cellWidth,
            height: position.h * cellHeight
          }
        };
      });
    }
  
    static validateLayout(blocks, layoutType) {
      const errors = [];
  
      blocks.forEach((block, index) => {
        // 验证位置数据
        if (block.position) {
          const { x, y, w, h } = block.position;
  
          if (x < 0 || y < 0 || w < 1 || h < 1) {
            errors.push(`块 ${index + 1} 的位置数据无效`);
          }
  
          if (layoutType === 'grid' && (x + w > 12 || y + h > 12)) {
            errors.push(`块 ${index + 1} 超出网格范围`);
          }
        }
  
        // 验证块类型
        if (!block.type) {
          errors.push(`块 ${index + 1} 缺少类型定义`);
        }
  
        // 验证ID唯一性
        const duplicateIds = blocks.filter(b => b.id === block.id);
        if (duplicateIds.length > 1) {
          errors.push(`块ID重复: ${block.id}`);
        }
      });
  
      return {
        valid: errors.length === 0,
        errors
      };
    }
  
    static autoArrange(blocks, layoutType, options = {}) {
      switch (layoutType) {
        case 'grid':
          return this.autoArrangeGrid(blocks, options.columns || 4);
        case 'flex':
          return this.autoArrangeFlex(blocks);
        case 'absolute':
          return this.autoArrangeAbsolute(blocks);
        default:
          return blocks;
      }
    }
  
    static autoArrangeGrid(blocks, columns) {
      return this.optimizeGridLayout(blocks, columns);
    }
  
    static autoArrangeFlex(blocks) {
      // 弹性布局不需要特殊的位置计算
      return blocks.map(block => ({
        ...block,
        position: undefined // 清除位置数据
      }));
    }
  
    static autoArrangeAbsolute(blocks) {
      const containerWidth = 1000; // 假设容器宽度
      const containerHeight = 600; // 假设容器高度
      
      return blocks.map((block, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        
        return {
          ...block,
          position: {
            x: col * 2.5, // 每块占2.5个单位宽度
            y: row * 2.5, // 每块占2.5个单位高度
            w: 2,
            h: 2
          }
        };
      });
    }
  
    static calculateContainerSize(blocks, layoutType) {
      if (blocks.length === 0) {
        return { width: 300, height: 200 };
      }
  
      switch (layoutType) {
        case 'grid':
          return this.calculateGridContainerSize(blocks);
        case 'flex':
          return this.calculateFlexContainerSize(blocks);
        case 'absolute':
          return this.calculateAbsoluteContainerSize(blocks);
        default:
          return { width: 400, height: 300 };
      }
    }
  
    static calculateGridContainerSize(blocks) {
      const columns = 4;
      const rows = Math.ceil(blocks.length / columns);
      const blockHeight = 80; // 预估块高度
      const gap = 12;
  
      return {
        width: 400, // 固定宽度
        height: rows * (blockHeight + gap) + gap
      };
    }
  
    static calculateFlexContainerSize(blocks) {
      const minBlockHeight = 60;
      const gap = 12;
      const blocksPerRow = Math.min(blocks.length, 3);
      const rows = Math.ceil(blocks.length / blocksPerRow);
  
      return {
        width: '100%',
        height: rows * (minBlockHeight + gap) + gap
      };
    }
  
    static calculateAbsoluteContainerSize(blocks) {
      let maxX = 0;
      let maxY = 0;
  
      blocks.forEach(block => {
        if (block.position) {
          const { x, y, w, h } = block.position;
          maxX = Math.max(maxX, x + w);
          maxY = Math.max(maxY, y + h);
        }
      });
  
      const cellSize = 60; // 每个网格单元的大小
      return {
        width: Math.max(300, maxX * cellSize),
        height: Math.max(200, maxY * cellSize)
      };
    }
  
    static generateResponsiveRules(blocks, breakpoints) {
      const rules = [];
  
      breakpoints.forEach(breakpoint => {
        const { maxWidth, columns } = breakpoint;
        
        rules.push(`
          @container (max-width: ${maxWidth}px) {
            .grid-layout {
              grid-template-columns: repeat(${columns}, 1fr);
            }
            
            .flex-layout .block-item {
              flex-basis: calc(${100 / columns}% - var(--cf-spacing-md));
            }
          }
        `);
      });
  
      return rules.join('\n');
    }
  
    static getLayoutPresets() {
      return {
        'grid-2x2': {
          name: '2×2网格',
          layout: 'grid',
          columns: 2,
          blocks: [
            { type: 'time', position: { x: 0, y: 0, w: 1, h: 1 } },
            { type: 'sensor', position: { x: 1, y: 0, w: 1, h: 1 } },
            { type: 'sensor', position: { x: 0, y: 1, w: 1, h: 1 } },
            { type: 'weather', position: { x: 1, y: 1, w: 1, h: 1 } }
          ]
        },
        'grid-3x2': {
          name: '3×2网格',
          layout: 'grid',
          columns: 3,
          blocks: [
            { type: 'time', position: { x: 0, y: 0, w: 2, h: 1 } },
            { type: 'weather', position: { x: 2, y: 0, w: 1, h: 1 } },
            { type: 'sensor', position: { x: 0, y: 1, w: 1, h: 1 } },
            { type: 'sensor', position: { x: 1, y: 1, w: 1, h: 1 } },
            { type: 'action', position: { x: 2, y: 1, w: 1, h: 1 } }
          ]
        },
        'flex-horizontal': {
          name: '水平排列',
          layout: 'flex',
          blocks: [
            { type: 'time' },
            { type: 'weather' },
            { type: 'sensor' }
          ]
        }
      };
    }
  }