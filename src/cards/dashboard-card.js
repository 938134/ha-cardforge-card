// cards/dashboard-card.js - 重构版
import { renderBlocks } from '../blocks/index.js';
import { createCardStyles } from '../core/card-styles.js';

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
      label: '内容区域排列',
      options: [
        { value: 'flow', label: '流式排列（自动换行）' },
        { value: 'grid', label: '网格排列' },
        { value: 'list', label: '列表排列（垂直堆叠）' }
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
        { value: 'flex-start', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'flex-end', label: '右对齐' },
        { value: 'space-between', label: '两端对齐' },
        { value: 'space-around', label: '均匀分布' }
      ],
      default: 'flex-start',
      visibleWhen: (config) => config.showHeader
    },
    
    footerAlign: {
      type: 'select',
      label: '页脚区域对齐',
      options: [
        { value: 'flex-start', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'flex-end', label: '右对齐' },
        { value: 'space-between', label: '两端对齐' },
        { value: 'space-around', label: '均匀分布' }
      ],
      default: 'flex-start',
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
    
    contentBlockLayout: {
      type: 'select',
      label: '内容块布局',
      options: [
        { value: 'horizontal', label: '水平布局（图标+名称+状态值）' },
        { value: 'vertical', label: '垂直布局（图标在上，垂直堆叠）' },
        { value: 'compact', label: '紧凑网格（图标左，右侧上下）' }
      ],
      default: 'horizontal'
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
        <div class="dashboard-card card-empty">
          <div class="card-empty-icon">📊</div>
          <div class="card-empty-text">仪表盘暂无数据块</div>
        </div>
      `;
    }
    
    let html = `<div class="dashboard-card layout-${config.contentLayout} spacing-${config.spacing}">`;
    
    // 标题区域
    if (config.showHeader && blocksByArea.header.length > 0) {
      const headerBlocks = Object.fromEntries(blocksByArea.header);
      html += `
        <div class="dashboard-header" style="justify-content: ${config.headerAlign}">
          ${renderBlocks(headerBlocks, data.hass, { 
            layout: 'horizontal'
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
        <div class="dashboard-footer" style="justify-content: ${config.footerAlign}">
          ${renderBlocks(footerBlocks, data.hass, { 
            layout: 'horizontal'
          })}
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  },
  
  styles: (config, theme) => {
    // 只保留仪表盘卡片特有的样式
    const customStyles = `
      .dashboard-card {
        min-height: 200px;
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        box-shadow: var(--cf-shadow-sm);
        transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
      }
      
      /* 间距控制 */
      .dashboard-card.spacing-compact {
        padding: var(--cf-spacing-md);
        gap: var(--cf-spacing-md);
      }
      
      .dashboard-card.spacing-relaxed {
        padding: var(--cf-spacing-2xl);
        gap: var(--cf-spacing-xl);
      }
      
      /* 标题区域 */
      .dashboard-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-primary-color-rgb), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 3px solid var(--cf-primary-color);
      }
      
      .dashboard-header .cardforge-block {
        background: transparent;
        border: 1px solid rgba(var(--cf-primary-color-rgb), 0.2);
      }
      
      .dashboard-header .block-icon {
        background: transparent !important;
        color: var(--cf-primary-color);
      }
      
      .dashboard-header .block-name {
        font-size: var(--cf-font-size-sm);
      }
      
      .dashboard-header .block-value {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-semibold);
      }
      
      /* 内容区域 */
      .dashboard-content {
        flex: 1;
        overflow: auto;
        padding: var(--cf-spacing-sm);
      }
      
      /* 流式排列 */
      .layout-flow .dashboard-content {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
      
      /* 网格排列 */
      .layout-grid .dashboard-content {
        display: grid;
        grid-template-columns: repeat(${config.gridColumns}, 1fr);
        align-content: start;
      }
      
      /* 列表排列 */
      .layout-list .dashboard-content {
        display: flex;
        flex-direction: column;
      }
      
      /* 内容块通用样式 */
      .dashboard-content .cardforge-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      .dashboard-content .cardforge-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .dashboard-content .block-icon {
        background: transparent !important;
        color: var(--cf-text-secondary);
      }
      
      .dashboard-content .cardforge-block:hover .block-icon {
        color: var(--cf-primary-color);
        transform: scale(1.05);
      }
      
      /* 页脚区域 */
      .dashboard-footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-accent-color-rgb), 0.05);
        border-radius: var(--cf-radius-md);
        border-top: 1px solid var(--cf-border);
      }
      
      .dashboard-footer .cardforge-block {
        background: transparent;
        border: 1px solid rgba(var(--cf-accent-color-rgb), 0.2);
      }
      
      .dashboard-footer .block-icon {
        background: transparent !important;
        color: var(--cf-text-tertiary);
      }
      
      .dashboard-footer .block-name {
        font-size: var(--cf-font-size-xs);
      }
      
      .dashboard-footer .block-value {
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-medium);
      }
      
      /* 仪表盘卡片特定的响应式 */
      @container cardforge-container (max-width: 768px) {
        .dashboard-card {
          min-height: 180px;
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .dashboard-card {
          min-height: 160px;
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .layout-flow .dashboard-content {
          justify-content: stretch;
        }
        
        .dashboard-header, .dashboard-footer {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `;
    
    // 使用通用样式工具
    return createCardStyles(customStyles);
  }
};