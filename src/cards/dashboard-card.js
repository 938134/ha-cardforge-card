// src/cards/dashboard-card.js - 完整实现
export const card = {
  id: 'dashboard',
  meta: {
    name: '仪表盘',
    description: '三段式自由布局仪表盘，支持Header/Content/Footer分区',
    icon: '📊',
    category: '信息',
    version: '2.1.0',
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
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'left',
      visibleWhen: (config) => config.showHeader
    },
    footerAlign: {
      type: 'select',
      label: '页脚区域对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'left',
      visibleWhen: (config) => config.showFooter
    }
  },
  
  blockType: 'custom',
  
  layout: {
    areas: [
      { id: 'header', label: '标题区域', maxBlocks: 5 },
      { id: 'content', label: '内容区域', maxBlocks: 20 },
      { id: 'footer', label: '页脚区域', maxBlocks: 5 }
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
              context.renderBlock({ ...block, id })
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
              context.renderBlock({ ...block, id })
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
    const accentColor = theme['--cf-accent-color'] || '#ff4081';
    
    return `
      .dashboard-card {
        height: 100%;
        min-height: 200px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      /* 标题区域样式 */
      .dashboard-header {
        padding: 6px 8px;
        background: linear-gradient(135deg, rgba(var(--cf-rgb-primary, 3, 169, 244), 0.08) 0%, transparent 100%);
        border-left: 3px solid ${primaryColor};
        border-radius: var(--cf-radius-sm);
        margin-bottom: 4px;
      }
      
      .dashboard-header.align-left .header-blocks {
        justify-content: flex-start;
      }
      
      .dashboard-header.align-center .header-blocks {
        justify-content: center;
      }
      
      .dashboard-header.align-right .header-blocks {
        justify-content: flex-end;
      }
      
      .header-blocks {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      
      /* 标题区域块特殊样式 */
      .header-blocks .cardforge-block {
        background: transparent;
        min-height: 40px;
        padding: 4px 8px;
        border: 1px solid rgba(var(--cf-rgb-primary, 3, 169, 244), 0.3);
        border-radius: var(--cf-radius-sm);
        flex-shrink: 0;
      }
      
      .header-blocks .block-icon {
        font-size: 1.2em;
        color: ${primaryColor};
      }
      
      .header-blocks .block-name {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
      }
      
      .header-blocks .block-value {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      /* 内容区域 */
      .dashboard-content {
        flex: 1;
        overflow: auto;
        padding: 4px;
      }
      
      /* 流式布局 */
      .layout-flow .dashboard-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-content: flex-start;
      }
      
      .layout-flow .cardforge-block {
        min-width: 140px;
        flex: 0 1 auto;
        max-width: calc(50% - 4px);
      }
      
      /* 网格布局 */
      .layout-grid .dashboard-content {
        display: grid;
        grid-template-columns: repeat(${config.gridColumns}, 1fr);
        gap: 8px;
        align-content: start;
      }
      
      .layout-grid .cardforge-block {
        width: 100%;
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
      
      /* 页脚区域样式 */
      .dashboard-footer {
        padding: 6px 8px;
        background: linear-gradient(135deg, transparent 0%, rgba(var(--cf-rgb-primary, 3, 169, 244), 0.05) 100%);
        border-top: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        margin-top: 4px;
      }
      
      .dashboard-footer.align-left .footer-blocks {
        justify-content: flex-start;
      }
      
      .dashboard-footer.align-center .footer-blocks {
        justify-content: center;
      }
      
      .dashboard-footer.align-right .footer-blocks {
        justify-content: flex-end;
      }
      
      .footer-blocks {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
      }
      
      /* 页脚区域块特殊样式 */
      .footer-blocks .cardforge-block {
        background: rgba(var(--cf-rgb-primary, 3, 169, 244), 0.05);
        min-height: 36px;
        padding: 3px 6px;
        border: none;
        border-radius: var(--cf-radius-sm);
        flex-shrink: 0;
      }
      
      .footer-blocks .block-icon {
        font-size: 1em;
        color: var(--cf-text-secondary);
      }
      
      .footer-blocks .block-name {
        font-size: 0.75em;
        color: var(--cf-text-secondary);
      }
      
      .footer-blocks .block-value {
        font-size: 0.85em;
        color: var(--cf-text-primary);
      }
      
      /* 空状态 */
      .dashboard-card.empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--cf-text-secondary);
        gap: 12px;
        padding: 24px;
      }
      
      .empty-icon {
        font-size: 2.2em;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1em;
      }
      
      .empty-hint {
        font-size: 0.85em;
        opacity: 0.7;
        max-width: 200px;
        line-height: 1.3;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 800px) {
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(3, 1fr);
        }
        
        .layout-flow .cardforge-block {
          max-width: calc(33.33% - 6px);
        }
      }
      
      @container cardforge-container (max-width: 600px) {
        .dashboard-card {
          padding: 6px;
          gap: 6px;
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .layout-flow .cardforge-block {
          min-width: 120px;
          max-width: calc(50% - 4px);
        }
        
        .header-blocks,
        .footer-blocks {
          flex-direction: row;
          justify-content: flex-start;
        }
        
        .dashboard-header,
        .dashboard-footer {
          padding: 4px 6px;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .layout-grid .dashboard-content,
        .layout-list .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .layout-flow .dashboard-content {
          flex-direction: column;
        }
        
        .layout-flow .cardforge-block {
          min-width: 100%;
          max-width: 100%;
        }
        
        .dashboard-header.align-left,
        .dashboard-header.align-center,
        .dashboard-header.align-right,
        .dashboard-footer.align-left,
        .dashboard-footer.align-center,
        .dashboard-footer.align-right {
          text-align: center;
        }
        
        .header-blocks,
        .footer-blocks {
          justify-content: center;
        }
      }
      
      /* 区域标识的视觉提示 */
      .area-header .cardforge-block::before {
        content: "标题区";
        position: absolute;
        top: -8px;
        left: 8px;
        font-size: 0.6em;
        color: ${primaryColor};
        background: white;
        padding: 1px 4px;
        border-radius: 2px;
        border: 1px solid ${primaryColor};
        opacity: 0.8;
      }
      
      .area-footer .cardforge-block::before {
        content: "页脚区";
        position: absolute;
        top: -8px;
        left: 8px;
        font-size: 0.6em;
        color: var(--cf-text-secondary);
        background: white;
        padding: 1px 4px;
        border-radius: 2px;
        border: 1px solid var(--cf-text-secondary);
        opacity: 0.8;
      }
      
      @media (prefers-color-scheme: dark) {
        .area-header .cardforge-block::before,
        .area-footer .cardforge-block::before {
          background: var(--cf-surface);
        }
      }
    `;
  }
};

export class DashboardCard {
  static card = card;
}
