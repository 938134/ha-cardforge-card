// src/cards/dashboard-card.js - 修复版
import { renderBlocks } from '../blocks/index.js';
import { createCardStyles, responsiveClasses, darkModeClasses } from '../core/card-styles.js';

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
        { value: 'flow', label: '流式排列' },
        { value: 'grid', label: '网格排列' },
        { value: 'list', label: '列表排列' }
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
        { value: 'horizontal', label: '水平布局' },
        { value: 'vertical', label: '垂直布局' },
        { value: 'compact', label: '紧凑网格' }
      ],
      default: 'horizontal'
    }
  },
  
  blockType: 'custom',
  
  template: (config, data) => {
    const blocks = config.blocks || {};
    const blockList = Object.entries(blocks);
    
    const blocksByArea = {
      header: blockList.filter(([_, block]) => block.area === 'header'),
      content: blockList.filter(([_, block]) => !block.area || block.area === 'content'),
      footer: blockList.filter(([_, block]) => block.area === 'footer')
    };
    
    const hasBlocks = Object.values(blocksByArea).some(blocks => blocks.length > 0);
    
    if (!hasBlocks) {
      return `
        <div class="dashboard-card empty-state ${darkModeClasses.base}">
          <div class="empty-icon">📊</div>
          <div class="empty-text ${responsiveClasses.title}">仪表盘暂无数据块</div>
        </div>
      `;
    }
    
    let html = `<div class="dashboard-card card-base ${darkModeClasses.base} ${responsiveClasses.container} layout-${config.contentLayout} spacing-${config.spacing}">`;
    
    // 标题区域
    if (config.showHeader && blocksByArea.header.length > 0) {
      const headerBlocks = Object.fromEntries(blocksByArea.header);
      html += `
        <div class="dashboard-header ${darkModeClasses.bgPrimary} ${responsiveClasses.gapMd}" style="justify-content: ${config.headerAlign}">
          ${renderBlocks(headerBlocks, data.hass, { layout: 'horizontal' })}
        </div>
      `;
    }
    
    // 内容区域
    if (blocksByArea.content.length > 0) {
      const contentBlocks = Object.fromEntries(blocksByArea.content);
      html += `
        <div class="dashboard-content columns-${config.gridColumns}">
          ${renderBlocks(contentBlocks, data.hass, { layout: config.contentBlockLayout })}
        </div>
      `;
    }
    
    // 页脚区域
    if (config.showFooter && blocksByArea.footer.length > 0) {
      const footerBlocks = Object.fromEntries(blocksByArea.footer);
      html += `
        <div class="dashboard-footer ${darkModeClasses.bgAccent} ${responsiveClasses.gapMd}" style="justify-content: ${config.footerAlign}">
          ${renderBlocks(footerBlocks, data.hass, { layout: 'horizontal' })}
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  },
  
  styles: (config, theme) => {
    const customStyles = `
      .dashboard-card {
        min-height: 200px;
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        box-shadow: var(--cf-shadow-sm);
        display: flex;
        flex-direction: column;
      }
      
      /* 间距控制 */
      .dashboard-card.spacing-compact {
        padding: var(--cf-spacing-md);
        gap: var(--cf-spacing-md);
      }
      
      .dashboard-card.spacing-normal {
        padding: var(--cf-spacing-xl);
        gap: var(--cf-spacing-lg);
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
        border-radius: var(--cf-radius-md);
        border-left: 3px solid var(--cf-primary-color);
      }
      
      .dashboard-header .cardforge-block {
        background: transparent;
        border: 1px solid rgba(var(--cf-primary-color-rgb), 0.2);
        padding: var(--cf-spacing-sm);
        border-radius: var(--cf-radius-sm);
      }
      
      .dashboard-header .block-icon {
        background: transparent !important;
        color: var(--cf-primary-color);
        width: 36px;
        height: 36px;
        font-size: 1.2em;
      }
      
      .dashboard-header .block-name {
        color: var(--cf-text-secondary);
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
      }
      
      .dashboard-header .block-value {
        color: var(--cf-text-primary);
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
        align-content: flex-start;
        justify-content: center;
        gap: var(--cf-spacing-md);
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
      
      /* 内容块通用样式 */
      .dashboard-content .cardforge-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
        min-height: 80px;
      }
      
      .dashboard-content .cardforge-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
      }
      
      .dashboard-content .block-icon {
        background: transparent !important;
        color: var(--cf-text-secondary);
        width: 40px;
        height: 40px;
        font-size: 1.5em;
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
        border-radius: var(--cf-radius-md);
        border-top: 1px solid var(--cf-border);
      }
      
      .dashboard-footer .cardforge-block {
        background: transparent;
        border: 1px solid rgba(var(--cf-accent-color-rgb), 0.2);
        padding: var(--cf-spacing-sm);
        border-radius: var(--cf-radius-sm);
      }
      
      .dashboard-footer .block-icon {
        background: transparent !important;
        color: var(--cf-text-tertiary);
        width: 32px;
        height: 32px;
        font-size: 1.1em;
      }
      
      .dashboard-footer .block-name {
        color: var(--cf-text-tertiary);
        font-size: var(--cf-font-size-xs);
        font-weight: var(--cf-font-weight-medium);
      }
      
      .dashboard-footer .block-value {
        color: var(--cf-text-secondary);
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-medium);
      }
      
      /* 特定响应式 - 平板 */
      @container cardforge-container (max-width: 768px) {
        .dashboard-card.spacing-normal,
        .dashboard-card.spacing-relaxed {
          padding: var(--cf-spacing-lg);
          gap: var(--cf-spacing-md);
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
          gap: var(--cf-spacing-sm);
        }
        
        .layout-flow .dashboard-content,
        .layout-list .dashboard-content {
          gap: var(--cf-spacing-sm);
        }
        
        .dashboard-header,
        .dashboard-footer {
          padding: var(--cf-spacing-xs);
          gap: var(--cf-spacing-sm);
        }
        
        .dashboard-header .cardforge-block,
        .dashboard-footer .cardforge-block {
          padding: var(--cf-spacing-xs);
        }
        
        .dashboard-content .cardforge-block {
          padding: var(--cf-spacing-sm);
          min-height: 70px;
        }
      }
      
      /* 特定响应式 - 手机 */
      @container cardforge-container (max-width: 480px) {
        .dashboard-card {
          padding: var(--cf-spacing-md) !important;
          gap: var(--cf-spacing-sm) !important;
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .dashboard-header,
        .dashboard-footer {
          flex-direction: column;
          align-items: stretch;
          gap: var(--cf-spacing-xs);
        }
        
        .dashboard-header .cardforge-block,
        .dashboard-footer .cardforge-block {
          width: 100%;
          margin-bottom: var(--cf-spacing-xs);
        }
        
        .dashboard-header .block-icon,
        .dashboard-footer .block-icon {
          width: 28px;
          height: 28px;
          font-size: 1em;
        }
        
        .dashboard-content .cardforge-block {
          padding: var(--cf-spacing-xs);
          min-height: 60px;
        }
        
        .dashboard-content .block-icon {
          width: 32px;
          height: 32px;
          font-size: 1.2em;
        }
      }
      
      /* 特定响应式 - 小手机 */
      @container cardforge-container (max-width: 360px) {
        .dashboard-card {
          padding: var(--cf-spacing-sm) !important;
          gap: var(--cf-spacing-xs) !important;
        }
        
        .dashboard-content {
          padding: var(--cf-spacing-xs);
        }
        
        .dashboard-content .cardforge-block {
          min-height: 50px;
          padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        }
        
        .dashboard-header .block-name,
        .dashboard-footer .block-name {
          font-size: 0.7em;
        }
        
        .dashboard-header .block-value,
        .dashboard-footer .block-value {
          font-size: var(--cf-font-size-sm);
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};