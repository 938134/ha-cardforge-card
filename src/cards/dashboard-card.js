// src/cards/dashboard-card.js - 完整实现
export const card = {
  id: 'dashboard',
  meta: {
    name: '仪表盘',
    description: '三段式自由布局仪表盘',
    icon: '📊',
    category: '信息',
    version: '2.0.0',
    author: 'CardForge'
  },
  
  schema: {
    contentLayout: {
      type: 'select',
      label: '内容区域布局',
      options: [
        { value: 'flow', label: '流式布局（自动换行）' },
        { value: 'grid', label: '网格布局' },
        { value: 'list', label: '列表布局（垂直）' }
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
      label: '标题区域对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中' },
        { value: 'right', label: '右对齐' },
        { value: 'space-between', label: '两端对齐' }
      ],
      default: 'left',
      visibleWhen: (config) => config.showHeader
    },
    footerAlign: {
      type: 'select',
      label: '页脚区域对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中' },
        { value: 'right', label: '右对齐' },
        { value: 'space-between', label: '两端对齐' }
      ],
      default: 'space-between',
      visibleWhen: (config) => config.showFooter
    }
  },
  
  // 块配置：支持自定义块，可指定区域
  blockType: 'custom',
  
  // 支持的区域定义
  layout: {
    recommendedSize: 4,
    areas: [
      { 
        id: 'header', 
        label: '标题区域', 
        maxBlocks: 5,
        icon: 'mdi:format-header-1'
      },
      { 
        id: 'content', 
        label: '内容区域', 
        maxBlocks: 20,
        icon: 'mdi:view-grid'
      },
      { 
        id: 'footer', 
        label: '页脚区域', 
        maxBlocks: 5,
        icon: 'mdi:page-layout-footer'
      }
    ]
  },
  
  template: (config, data, context) => {
    const blocks = config.blocks || {};
    const blockList = Object.entries(blocks);
    
    // 按区域分组
    const blocksByArea = {
      header: blockList.filter(([_, block]) => block.area === 'header'),
      content: blockList.filter(([_, block]) => !block.area || block.area === 'content'),
      footer: blockList.filter(([_, block]) => block.area === 'footer')
    };
    
    // 计算是否有块
    const hasBlocks = Object.values(blocksByArea).some(blocks => blocks.length > 0);
    
    if (!hasBlocks) {
      return `
        <div class="dashboard-card empty">
          <div class="empty-icon">📊</div>
          <div class="empty-text">仪表盘暂无数据块</div>
          <div class="empty-hint">请在编辑器中添加块并指定区域</div>
        </div>
      `;
    }
    
    let html = `<div class="dashboard-card layout-${config.contentLayout}">`;
    
    // 标题区域
    if (config.showHeader && blocksByArea.header.length > 0) {
      html += `
        <div class="dashboard-header align-${config.headerAlign}">
          <div class="header-blocks">
            ${blocksByArea.header.map(([id, block]) => 
              context.renderBlock({ ...block, id, compact: true })
            ).join('')}
          </div>
        </div>
      `;
    }
    
    // 内容区域
    if (blocksByArea.content.length > 0) {
      html += `
        <div class="dashboard-content columns-${config.gridColumns}">
          ${blocksByArea.content.map(([id, block]) => 
            context.renderBlock({ ...block, id })
          ).join('')}
        </div>
      `;
    }
    
    // 页脚区域
    if (config.showFooter && blocksByArea.footer.length > 0) {
      html += `
        <div class="dashboard-footer align-${config.footerAlign}">
          <div class="footer-blocks">
            ${blocksByArea.footer.map(([id, block]) => 
              context.renderBlock({ ...block, id, compact: true })
            ).join('')}
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  },
  
  styles: (config, theme) => {
    const primaryColor = theme['--cf-primary-color'] || '#03a9f4';
    
    return `
      .dashboard-card {
        height: 100%;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        gap: 8px; /* 固定小间距 */
      }
      
      /* === 标题区域样式 === */
      .dashboard-header {
        padding: 8px 12px;
        background: linear-gradient(135deg, rgba(var(--cf-rgb-primary, 3, 169, 244), 0.05) 0%, transparent 100%);
        border-bottom: 2px solid rgba(var(--cf-rgb-primary, 3, 169, 244), 0.3);
        border-radius: 8px 8px 0 0;
      }
      
      .header-blocks {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      
      /* 标题区域对齐方式 */
      .dashboard-header.align-left .header-blocks {
        justify-content: flex-start;
      }
      
      .dashboard-header.align-center .header-blocks {
        justify-content: center;
      }
      
      .dashboard-header.align-right .header-blocks {
        justify-content: flex-end;
      }
      
      .dashboard-header.align-space-between .header-blocks {
        justify-content: space-between;
      }
      
      /* 标题区域块特殊样式 */
      .dashboard-header .cardforge-block {
        background: transparent;
        min-height: auto;
        padding: 4px 8px;
        border: 1px solid rgba(var(--cf-rgb-primary, 3, 169, 244), 0.2);
        border-radius: 6px;
      }
      
      .dashboard-header .block-icon {
        font-size: 1.2em;
        color: var(--cf-primary-color);
        opacity: 0.8;
      }
      
      .dashboard-header .block-name {
        font-size: 0.85em;
        font-weight: 500;
      }
      
      .dashboard-header .block-value {
        font-size: 0.95em;
        font-weight: 600;
      }
      
      /* === 内容区域样式 === */
      .dashboard-content {
        flex: 1;
        overflow: auto;
        padding: 8px 0;
      }
      
      /* 流式布局 */
      .layout-flow .dashboard-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-content: flex-start;
      }
      
      .layout-flow .cardforge-block {
        min-width: 120px;
        flex: 0 1 auto;
      }
      
      /* 网格布局 */
      .layout-grid .dashboard-content {
        display: grid;
        grid-template-columns: repeat(${config.gridColumns}, 1fr);
        gap: 8px;
        align-content: start;
      }
      
      /* 列表布局 */
      .layout-list .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .layout-list .cardforge-block {
        width: 100%;
      }
      
      /* 内容区域块标准样式 */
      .dashboard-content .cardforge-block {
        background: var(--cf-block-bg, rgba(0, 0, 0, 0.03));
        border: 1px solid var(--cf-border);
        transition: all var(--cf-transition-fast);
      }
      
      .dashboard-content .cardforge-block:hover {
        background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.05);
        border-color: var(--cf-primary-color);
      }
      
      /* === 页脚区域样式 === */
      .dashboard-footer {
        padding: 8px 12px;
        background: linear-gradient(135deg, transparent 0%, rgba(var(--cf-rgb-primary, 3, 169, 244), 0.03) 100%);
        border-top: 1px solid var(--cf-border);
        border-radius: 0 0 8px 8px;
      }
      
      .footer-blocks {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      
      /* 页脚区域对齐方式 */
      .dashboard-footer.align-left .footer-blocks {
        justify-content: flex-start;
      }
      
      .dashboard-footer.align-center .footer-blocks {
        justify-content: center;
      }
      
      .dashboard-footer.align-right .footer-blocks {
        justify-content: flex-end;
      }
      
      .dashboard-footer.align-space-between .footer-blocks {
        justify-content: space-between;
      }
      
      /* 页脚区域块特殊样式 */
      .dashboard-footer .cardforge-block {
        background: transparent;
        min-height: auto;
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
      }
      
      .dashboard-footer .block-icon {
        font-size: 1.1em;
        color: var(--cf-text-secondary);
      }
      
      .dashboard-footer .block-name {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
      }
      
      .dashboard-footer .block-value {
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }
      
      /* 空状态样式 */
      .dashboard-card.empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--cf-text-secondary);
        gap: 16px;
        padding: 32px;
      }
      
      .empty-icon {
        font-size: 3em;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1.2em;
        font-weight: 500;
      }
      
      .empty-hint {
        font-size: 0.9em;
        opacity: 0.7;
        max-width: 300px;
        line-height: 1.4;
      }
      
      /* === 响应式设计 === */
      @container cardforge-container (max-width: 800px) {
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 600px) {
        .dashboard-card {
          gap: 6px;
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .dashboard-header,
        .dashboard-footer {
          padding: 6px 8px;
        }
        
        .header-blocks,
        .footer-blocks {
          justify-content: center !important; /* 小屏强制居中 */
        }
        
        .header-blocks,
        .footer-blocks {
          flex-direction: column;
          align-items: stretch;
          gap: 6px;
        }
        
        .dashboard-header .cardforge-block,
        .dashboard-footer .cardforge-block {
          width: 100%;
          text-align: center;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .layout-grid .dashboard-content,
        .layout-flow .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .layout-grid .cardforge-block,
        .layout-flow .cardforge-block {
          width: 100%;
        }
        
        .dashboard-content {
          padding: 6px 0;
        }
        
        .dashboard-header .block-name,
        .dashboard-footer .block-name {
          font-size: 0.75em;
        }
        
        .dashboard-header .block-value,
        .dashboard-footer .block-value {
          font-size: 0.85em;
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .dashboard-header {
          background: linear-gradient(135deg, rgba(var(--cf-rgb-primary, 3, 169, 244), 0.1) 0%, transparent 100%);
          border-bottom-color: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.5);
        }
        
        .dashboard-footer {
          background: linear-gradient(135deg, transparent 0%, rgba(var(--cf-rgb-primary, 3, 169, 244), 0.05) 100%);
        }
        
        .dashboard-header .cardforge-block {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .dashboard-content .cardforge-block:hover {
          background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.1);
        }
      }
    `;
  }
};
