// 仪表盘卡片 - 使用设计系统变量
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
    // 内容区域排列方式（一级布局）
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
    
    // 显示控制
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
    
    // 标题区域对齐方式
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
    
    // 页脚区域对齐方式
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
    
    // 间距控制
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
    
    // 内容块内部布局（二级布局）
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
        <div class="dashboard-card empty">
          <div class="empty-icon">📊</div>
          <div class="empty-text">仪表盘暂无数据块</div>
        </div>
      `;
    }
    
    let html = `<div class="dashboard-card layout-${config.contentLayout} spacing-${config.spacing}">`;
    
    // 标题区域 - 固定水平布局
    if (config.showHeader && blocksByArea.header.length > 0) {
      const headerBlocks = Object.fromEntries(blocksByArea.header);
      html += `
        <div class="dashboard-header" style="justify-content: ${config.headerAlign}">
          ${renderBlocks(headerBlocks, data.hass, { 
            layout: 'horizontal' // 标题固定水平布局
          })}
        </div>
      `;
    }
    
    // 内容区域 - 可配置布局
    if (blocksByArea.content.length > 0) {
      const contentBlocks = Object.fromEntries(blocksByArea.content);
      html += `
        <div class="dashboard-content columns-${config.gridColumns}">
          ${renderBlocks(contentBlocks, data.hass, { 
            layout: config.contentBlockLayout // 内容块可配置布局
          })}
        </div>
      `;
    }
    
    // 页脚区域 - 固定水平布局
    if (config.showFooter && blocksByArea.footer.length > 0) {
      const footerBlocks = Object.fromEntries(blocksByArea.footer);
      html += `
        <div class="dashboard-footer" style="justify-content: ${config.footerAlign}">
          ${renderBlocks(footerBlocks, data.hass, { 
            layout: 'horizontal' // 页脚固定水平布局
          })}
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  },
  
  styles: (config, theme) => {
    // 直接使用设计系统变量，不重新定义
    return `
      .dashboard-card {
        height: 100%;
        min-height: 200px;
        padding: var(--cf-spacing-xl);
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        font-family: var(--cf-font-family-base);
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
      
      /* 标题区域 - 水平布局，无底色图标 */
      .dashboard-header {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cf-spacing-md);
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
        color: var(--cf-text-secondary);
        font-size: var(--cf-font-size-sm);
      }
      
      .dashboard-header .block-value {
        color: var(--cf-text-primary);
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-semibold);
      }
      
      /* 内容区域 - 可配置排列方式 */
      .dashboard-content {
        flex: 1;
        overflow: auto;
        padding: var(--cf-spacing-sm);
      }
      
      /* 流式排列 */
      .layout-flow .dashboard-content {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cf-spacing-md);
        align-content: flex-start;
        justify-content: center;
      }
      
      /* 网格排列 */
      .layout-grid .dashboard-content {
        display: grid;
        grid-template-columns: repeat(${config.gridColumns}, 1fr);
        gap: var(--cf-spacing-md);
        align-content: start;
      }
      
      /* 列表排列 */
      .layout-list .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }
      
      /* 内容块通用样式 - 无底色图标 */
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
      
      /* 页脚区域 - 水平布局，无底色图标 */
      .dashboard-footer {
        display: flex;
        flex-wrap: wrap;
        gap: var(--cf-spacing-md);
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
        color: var(--cf-text-tertiary);
        font-size: var(--cf-font-size-xs);
      }
      
      .dashboard-footer .block-value {
        color: var(--cf-text-secondary);
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-medium);
      }
      
      /* 空状态 */
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--cf-text-tertiary);
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-2xl);
        background: var(--cf-surface);
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
          background: var(--cf-surface);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .dashboard-header {
          background: rgba(var(--cf-primary-color-rgb), 0.1);
          border-left-color: var(--cf-primary-color);
        }
        
        .dashboard-header .cardforge-block {
          border-color: rgba(var(--cf-primary-color-rgb), 0.3);
        }
        
        .dashboard-content .cardforge-block {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .dashboard-footer {
          background: rgba(var(--cf-accent-color-rgb), 0.08);
          border-top-color: rgba(255, 255, 255, 0.2);
        }
        
        .dashboard-footer .cardforge-block {
          border-color: rgba(var(--cf-accent-color-rgb), 0.3);
        }
        
        .empty {
          background: rgba(255, 255, 255, 0.03);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 768px) {
        .dashboard-card {
          padding: var(--cf-spacing-lg);
          gap: var(--cf-spacing-md);
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .dashboard-header, .dashboard-footer {
          gap: var(--cf-spacing-sm);
          padding: var(--cf-spacing-xs);
        }
        
        .empty {
          padding: var(--cf-spacing-xl);
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .dashboard-card {
          padding: var(--cf-spacing-md);
          gap: var(--cf-spacing-sm);
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
          gap: var(--cf-spacing-xs);
        }
        
        /* 手机端强制标题/页脚块垂直布局 */
        @container cardforge-container (max-width: 480px) {
          .dashboard-header .layout-horizontal,
          .dashboard-footer .layout-horizontal {
            display: grid !important;
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            gap: 2px 8px;
          }
          
          .dashboard-header .layout-horizontal .block-icon,
          .dashboard-footer .layout-horizontal .block-icon {
            grid-column: 1;
            grid-row: 1 / span 2;
          }
          
          .dashboard-header .layout-horizontal .block-name,
          .dashboard-footer .layout-horizontal .block-name {
            grid-column: 2;
            grid-row: 1;
            align-self: end;
          }
          
          .dashboard-header .layout-horizontal .block-value,
          .dashboard-footer .layout-horizontal .block-value {
            grid-column: 2;
            grid-row: 2;
            align-self: start;
          }
        }
      }
      
      @container cardforge-container (max-width: 320px) {
        .dashboard-card {
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-xs);
        }
        
        .dashboard-content {
          padding: var(--cf-spacing-xs);
        }
        
        .empty {
          padding: var(--cf-spacing-lg);
        }
        
        .empty-icon {
          font-size: 2em;
        }
        
        .empty-text {
          font-size: var(--cf-font-size-md);
        }
      }
      
      /* 高对比度模式支持 */
      .high-contrast .dashboard-header {
        border-left-width: 4px;
      }
      
      .high-contrast .dashboard-footer {
        border-top-width: 2px;
      }
      
      .high-contrast .dashboard-content .cardforge-block:hover {
        outline: 2px solid var(--cf-primary-color);
      }
    `;
  }
};