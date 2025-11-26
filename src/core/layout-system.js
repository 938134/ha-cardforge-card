// src/core/layout-system.js
export class LayoutSystem {
    static LAYOUT_PRESETS = {
      'single': {
        name: '单列布局',
        description: '垂直排列所有块',
        icon: 'mdi:view-stream'
      },
      'grid-2x2': {
        name: '2x2网格',
        description: '2行2列的网格布局',
        icon: 'mdi:view-grid',
        gridTemplate: 'repeat(2, 1fr) / repeat(2, 1fr)'
      },
      'grid-1x4': {
        name: '1x4网格', 
        description: '1行4列的网格布局',
        icon: 'mdi:view-grid',
        gridTemplate: '1fr / repeat(4, 1fr)'
      },
      'grid-3x3': {
        name: '3x3网格',
        description: '3行3列的网格布局', 
        icon: 'mdi:view-grid',
        gridTemplate: 'repeat(3, 1fr) / repeat(3, 1fr)'
      }
    };
  
    // 获取所有布局选项
    static getLayoutOptions() {
      return Object.entries(this.LAYOUT_PRESETS).map(([value, preset]) => ({
        value,
        label: preset.name,
        description: preset.description,
        icon: preset.icon
      }));
    }
  
    // 获取布局信息
    static getLayoutInfo(layoutId) {
      return this.LAYOUT_PRESETS[layoutId] || this.LAYOUT_PRESETS.single;
    }
  
    // 生成布局CSS
    static generateLayoutCSS(layoutId) {
      const layout = this.LAYOUT_PRESETS[layoutId];
      if (!layout) return '';
      
      if (layoutId === 'single') {
        return `
          .layout-single {
            display: flex;
            flex-direction: column;
            gap: var(--cf-spacing-md);
          }
        `;
      }
      
      if (layout.gridTemplate) {
        return `
          .layout-grid.${layoutId} {
            display: grid;
            grid-template: ${layout.gridTemplate};
            gap: var(--cf-spacing-md);
          }
          
          @container cardforge-container (max-width: 400px) {
            .layout-grid.${layoutId} {
              grid-template: 1fr / 1fr;
            }
          }
        `;
      }
      
      return '';
    }
  
    // 验证布局是否支持块数量
    static validateLayoutCapacity(layoutId, blockCount) {
      const layout = this.LAYOUT_PRESETS[layoutId];
      if (!layout) return true;
      
      const maxCapacity = {
        'single': 999,
        'grid-2x2': 4,
        'grid-1x4': 4,
        'grid-3x3': 9
      };
      
      return blockCount <= (maxCapacity[layoutId] || 999);
    }
  
    // 获取推荐布局
    static getSuggestedLayout(blockCount) {
      if (blockCount <= 1) return 'single';
      if (blockCount <= 4) return 'grid-2x2';
      if (blockCount <= 9) return 'grid-3x3';
      return 'single';
    }
  }