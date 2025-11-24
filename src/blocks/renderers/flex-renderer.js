// src/blocks/renderers/flex-renderer.js
export class FlexRenderer {
    static render(blocks, flexConfig, hass) {
      const { 
        direction = 'row', 
        wrap = 'wrap',
        justifyContent = 'flex-start',
        alignItems = 'stretch',
        gap = '8px'
      } = flexConfig;
  
      const flexStyle = `
        flex-direction: ${direction};
        flex-wrap: ${wrap};
        justify-content: ${justifyContent};
        align-items: ${alignItems};
        gap: ${gap};
      `;
  
      const blocksHtml = blocks.map(block => 
        this._renderBlock(block, hass)
      ).join('');
  
      return `
        <div class="flex-layout" style="${flexStyle}">
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
  
        // 计算弹性基础值
        const flexBasis = this._calculateFlexBasis(block);
        const blockStyle = `flex-basis: ${flexBasis};`;
  
        return `
          <div class="flex-block" data-block-id="${block.id}" style="${blockStyle}">
            ${content}
            <style>${styles}</style>
          </div>
        `;
      } catch (error) {
        console.error(`渲染弹性块 ${block.id} 失败:`, error);
        return this._renderErrorBlock(block, error.message);
      }
    }
  
    static _renderErrorBlock(block, error) {
      return `
        <div class="flex-block error" data-block-id="${block.id}">
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
  
    static _calculateFlexBasis(block) {
      // 根据块类型和配置计算弹性基础值
      const baseSizes = {
        'time': '200px',
        'sensor': '150px',
        'weather': '180px',
        'media': '220px',
        'action': '120px',
        'text': '160px',
        'chart': '250px',
        'layout': '200px'
      };
  
      const customSize = block.config?.flexBasis;
      if (customSize) return customSize;
  
      return baseSizes[block.type] || '150px';
    }
  
    static getStyles(flexConfig) {
      const { 
        direction = 'row', 
        wrap = 'wrap',
        justifyContent = 'flex-start',
        alignItems = 'stretch',
        gap = '8px'
      } = flexConfig;
  
      return `
        .flex-layout {
          display: flex;
          flex-direction: ${direction};
          flex-wrap: ${wrap};
          justify-content: ${justifyContent};
          align-items: ${alignItems};
          gap: ${gap};
          width: 100%;
          height: 100%;
          container-type: inline-size;
        }
  
        .flex-block {
          flex: 0 1 auto;
          min-width: 120px;
          min-height: 60px;
          transition: all var(--cf-transition-fast);
          position: relative;
        }
  
        .flex-block:hover {
          transform: translateY(-2px);
          z-index: 2;
        }
  
        .flex-block.error {
          outline: 2px solid var(--cf-error-color);
        }
  
        .flex-block .block-container {
          height: 100%;
          border-radius: var(--cf-radius-md);
          overflow: hidden;
        }
  
        /* 弹性布局响应式 */
        @container (max-width: 600px) {
          .flex-layout {
            flex-wrap: wrap;
          }
          
          .flex-block {
            flex-basis: calc(50% - ${gap}) !important;
          }
        }
  
        @container (max-width: 400px) {
          .flex-block {
            flex-basis: 100% !important;
          }
        }
  
        /* 垂直方向布局 */
        .flex-layout.vertical {
          flex-direction: column;
        }
  
        .flex-layout.vertical .flex-block {
          flex-basis: auto !important;
        }
  
        /* 居中对齐变体 */
        .flex-layout.center {
          justify-content: center;
          align-items: center;
        }
  
        .flex-layout.space-between {
          justify-content: space-between;
        }
  
        .flex-layout.space-around {
          justify-content: space-around;
        }
  
        /* 弹性块动画 */
        .flex-block-enter {
          opacity: 0;
          transform: scale(0.8) translateY(20px);
        }
  
        .flex-block-enter-active {
          opacity: 1;
          transform: scale(1) translateY(0);
          transition: all 0.3s ease;
        }
  
        .flex-block-exit {
          opacity: 1;
          transform: scale(1);
        }
  
        .flex-block-exit-active {
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.3s ease;
        }
  
        /* 弹性拖拽样式 */
        .flex-block.dragging {
          opacity: 0.5;
          transform: rotate(5deg);
        }
  
        .flex-block.drop-zone {
          outline: 2px dashed var(--cf-primary-color);
          background: rgba(var(--cf-rgb-primary), 0.05);
          flex-grow: 1;
        }
  
        /* 弹性排序占位符 */
        .flex-placeholder {
          background: rgba(var(--cf-rgb-primary), 0.1);
          border: 2px dashed var(--cf-primary-color);
          border-radius: var(--cf-radius-md);
          min-height: 60px;
          flex: 1;
        }
  
        /* 弹性增长控制 */
        .flex-block.grow-1 { flex-grow: 1; }
        .flex-block.grow-2 { flex-grow: 2; }
        .flex-block.grow-3 { flex-grow: 3; }
  
        .flex-block.shrink-0 { flex-shrink: 0; }
        .flex-block.shrink-1 { flex-shrink: 1; }
  
        /* 对齐自覆盖 */
        .flex-block.align-start { align-self: flex-start; }
        .flex-block.align-center { align-self: center; }
        .flex-block.align-end { align-self: flex-end; }
        .flex-block.align-stretch { align-self: stretch; }
      `;
    }
  
    static calculateFlexLayout(blocks, containerWidth) {
      const minBlockWidth = 120;
      const gap = 8;
      
      // 计算每行可以容纳的块数
      const availableWidth = containerWidth - 32; // 减去padding
      const maxBlocksPerRow = Math.max(1, Math.floor(availableWidth / (minBlockWidth + gap)));
      
      return blocks.map(block => {
        const flexBasis = this._calculateOptimalFlexBasis(block, maxBlocksPerRow, gap);
        
        return {
          ...block,
          computedStyle: {
            flexBasis,
            flexGrow: block.config?.flexGrow || 0,
            flexShrink: block.config?.flexShrink || 1,
            alignSelf: block.config?.alignSelf || 'auto'
          }
        };
      });
    }
  
    static _calculateOptimalFlexBasis(block, maxBlocksPerRow, gap) {
      const preferredSize = block.config?.preferredSize || 'auto';
      
      if (preferredSize !== 'auto') {
        return preferredSize;
      }
  
      // 根据块类型和内容计算合适的基准大小
      const typeSizes = {
        'time': '200px',
        'sensor': '150px',
        'weather': '180px',
        'media': '220px',
        'action': '120px',
        'text': '160px',
        'chart': '250px',
        'layout': '200px'
      };
  
      const baseSize = typeSizes[block.type] || '150px';
      
      // 如果一行可以放多个块，使用固定大小
      if (maxBlocksPerRow > 1) {
        return baseSize;
      }
      
      // 如果只能放一个块，使用自适应大小
      return '100%';
    }
  
    static validateFlexLayout(blocks) {
      const errors = [];
  
      blocks.forEach((block, index) => {
        // 验证弹性属性
        const flexGrow = block.config?.flexGrow;
        const flexShrink = block.config?.flexShrink;
        
        if (flexGrow !== undefined && (flexGrow < 0 || !Number.isInteger(flexGrow))) {
          errors.push(`块 ${index + 1} 的 flex-grow 值无效`);
        }
        
        if (flexShrink !== undefined && (flexShrink < 0 || !Number.isInteger(flexShrink))) {
          errors.push(`块 ${index + 1} 的 flex-shrink 值无效`);
        }
  
        // 验证对齐属性
        const alignSelf = block.config?.alignSelf;
        const validAlignValues = ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch'];
        if (alignSelf && !validAlignValues.includes(alignSelf)) {
          errors.push(`块 ${index + 1} 的 align-self 值无效`);
        }
      });
  
      return {
        valid: errors.length === 0,
        errors
      };
    }
  
    static optimizeFlexOrder(blocks) {
      const optimized = [...blocks];
      
      // 根据内容重要性重新排序
      optimized.sort((a, b) => {
        const priorityA = this._getBlockPriority(a);
        const priorityB = this._getBlockPriority(b);
        return priorityB - priorityA;
      });
  
      return optimized;
    }
  
    static _getBlockPriority(block) {
      const priorities = {
        'time': 90,
        'sensor': 80,
        'weather': 85,
        'media': 70,
        'action': 75,
        'text': 60,
        'chart': 85,
        'layout': 50
      };
  
      return priorities[block.type] || 50;
    }
  
    static getFlexPresets() {
      return {
        'horizontal': {
          name: '水平排列',
          direction: 'row',
          wrap: 'wrap',
          justifyContent: 'flex-start',
          alignItems: 'stretch'
        },
        'vertical': {
          name: '垂直排列',
          direction: 'column',
          wrap: 'nowrap',
          justifyContent: 'flex-start',
          alignItems: 'stretch'
        },
        'centered': {
          name: '居中对齐',
          direction: 'row',
          wrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center'
        },
        'spaced': {
          name: '均匀分布',
          direction: 'row',
          wrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'stretch'
        }
      };
    }
  }
  
  export { FlexRenderer };