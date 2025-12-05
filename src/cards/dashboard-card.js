// 仪表盘卡片 - 添加布局配置支持
import { renderBlocks } from '../blocks/index.js';

export const card = {
  id: 'dashboard',
  meta: {
    name: '仪表盘',
    description: '三段式自由布局仪表盘',
    icon: '📊',
    category: '信息'
  },
  
  schema: {
    contentLayout: {
      type: 'select',
      label: '内容区域布局',
      options: [
        { value: 'flow', label: '流式布局' },
        { value: 'grid', label: '网格布局' },
        { value: 'list', label: '列表布局' }
      ],
      default: 'flow'
    },
    gridColumns: {
      type: 'number',
      label: '网格列数',
      min: 1,
      max: 6,
      default: 3,
      visibleWhen: (config) => config.contentLayout === 'grid'
    },
    showHeader: {
      type: 'boolean',
      label: '显示标题区域',
      default: true
    },
    showFooter: {
      type: 'boolean',
      label: '显示页脚区域',
      default: true
    },
    headerAlign: {
      type: 'select',
      label: '标题区域对齐',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'left',
      visibleWhen: (config) => config.showHeader
    },
    footerAlign: {
      type: 'select',
      label: '页脚区域对齐',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'left',
      visibleWhen: (config) => config.showFooter
    },
    spacing: {
      type: 'select',
      label: '间距大小',
      options: [
        { value: 'compact', label: '紧凑' },
        { value: 'normal', label: '正常' },
        { value: 'relaxed', label: '宽松' }
      ],
      default: 'normal'
    },
    // 新增：块布局配置
    headerBlockLayout: {
      type: 'select',
      label: '标题块布局',
      options: [
        { value: 'horizontal', label: '水平布局' },
        { value: 'compact', label: '紧凑网格' },
        { value: 'vertical', label: '垂直布局' }
      ],
      default: 'horizontal',
      visibleWhen: (config) => config.showHeader
    },
    contentBlockLayout: {
      type: 'select',
      label: '内容块布局',
      options: [
        { value: 'horizontal', label: '水平布局' },
        { value: 'compact', label: '紧凑网格' },
        { value: 'vertical', label: '垂直布局' }
      ],
      default: 'horizontal'
    },
    footerBlockLayout: {
      type: 'select',
      label: '页脚块布局',
      options: [
        { value: 'horizontal', label: '水平布局' },
        { value: 'compact', label: '紧凑网格' },
        { value: 'vertical', label: '垂直布局' }
      ],
      default: 'compact',
      visibleWhen: (config) => config.showFooter
    }
  },
  
  blockType: 'custom',
  
  template: (config, data) => {
    const blocks = config.blocks || {};
    const blockList = Object.entries(blocks);
    
    // 按区域分组
    const blocksByArea = {
      header: blockList.filter(([_, block]) => block.area === 'header'),
      content: blockList.filter(([_, block]) => !block.area || block.area === 'content'),
      footer: blockList.filter(([_, block]) => block.area === 'footer')
    };
    
    const hasBlocks = Object.values(blocksByArea).some(blocks => blocks.length > 0);
    
    if (!hasBlocks) {
      return `
        <div class="dashboard-card empty">
          <div class="empty-icon">📊</div>
          <div class="empty-text">仪表盘暂无数据块</div>
        </div>
      `;
    }
    
    let html = `<div class="dashboard-card layout-${config.contentLayout} spacing-${config.spacing}">`;
    
    // 标题区域
    if (config.showHeader && blocksByArea.header.length > 0) {
      const headerBlocks = Object.fromEntries(blocksByArea.header);
      html += `
        <div class="dashboard-header align-${config.headerAlign}">
          ${renderBlocks(headerBlocks, data.hass, { 
            layout: config.headerBlockLayout 
          })}
        </div>
      `;
    }
    
    // 内容区域
    if (blocksByArea.content.length > 0) {
      const contentBlocks = Object.fromEntries(blocksByArea.content);
      html += `
        <div class="dashboard-content columns-${config.gridColumns}">
          ${renderBlocks(contentBlocks, data.hass, { 
            layout: config.contentBlockLayout 
          })}
        </div>
      `;
    }
    
    // 页脚区域
    if (config.showFooter && blocksByArea.footer.length > 0) {
      const footerBlocks = Object.fromEntries(blocksByArea.footer);
      html += `
        <div class="dashboard-footer align-${config.footerAlign}">
          ${renderBlocks(footerBlocks, data.hass, { 
            layout: config.footerBlockLayout 
          })}
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  },
  
  styles: (config, theme) => {
    // 使用design-system变量
    const surfaceColor = theme['--cf-surface'] || 'var(--cf-surface)';
    const textTertiary = theme['--cf-text-tertiary'] || 'var(--cf-text-tertiary)';
    
    // 计算间距
    let gapSize = 'var(--cf-spacing-md)';
    let paddingSize = 'var(--cf-spacing-md)';
    
    if (config.spacing === 'compact') {
      gapSize = 'var(--cf-spacing-sm)';
      paddingSize = 'var(--cf-spacing-sm)';
    } else if (config.spacing === 'relaxed') {
      gapSize = 'var(--cf-spacing-lg)';
      paddingSize = 'var(--cf-spacing-lg)';
    }
    
    return `
      .dashboard-card {
        height: 100%;
        min-height: 200px;
        padding: ${paddingSize};
        display: flex;
        flex-direction: column;
        gap: ${gapSize};
        font-family: var(--cf-font-family-base);
        background: ${surfaceColor};
        border-radius: var(--cf-radius-lg);
        box-shadow: var(--cf-shadow-sm);
      }
      
      /* 仪表盘区域样式 */
      .dashboard-header {
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .dashboard-header.align-left {
        text-align: left;
      }
      
      .dashboard-header.align-center {
        text-align: center;
      }
      
      .dashboard-header.align-right {
        text-align: right;
      }
      
      .dashboard-content {
        flex: 1;
        overflow: auto;
        padding: var(--cf-spacing-sm);
      }
      
      .layout-flow .dashboard-content {
        display: flex;
        flex-wrap: wrap;
        gap: ${gapSize};
        align-content: flex-start;
      }
      
      .layout-grid .dashboard-content {
        display: grid;
        grid-template-columns: repeat(${config.gridColumns}, 1fr);
        gap: ${gapSize};
        align-content: start;
      }
      
      .layout-list .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: ${gapSize};
      }
      
      .dashboard-footer {
        margin-top: var(--cf-spacing-xs);
      }
      
      .dashboard-footer.align-left {
        text-align: left;
      }
      
      .dashboard-footer.align-center {
        text-align: center;
      }
      
      .dashboard-footer.align-right {
        text-align: right;
      }
      
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: ${textTertiary};
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-2xl);
        background: ${surfaceColor};
      }
      
      .empty-icon {
        font-size: 2.5em;
        opacity: 0.4;
      }
      
      .empty-text {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-medium);
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .dashboard-card {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .empty {
          background: rgba(255, 255, 255, 0.03);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .layout-grid .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .dashboard-card {
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }
      }
    `;
  }
};
