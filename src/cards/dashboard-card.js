// src/cards/dashboard-card.js - 简化版
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
    title: {
      type: 'text',
      label: '卡片标题',
      placeholder: '例如：XX省今日油价',
      default: ''
    },
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
    gap: {
      type: 'select',
      label: '块间距',
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' }
      ],
      default: 'medium'
    }
  },
  
  // 块配置：支持自定义块，可指定区域
  blockType: 'custom',
  
  // 支持的区域定义
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
    
    let html = `<div class="dashboard-card layout-${config.contentLayout} gap-${config.gap}">`;
    
    // 标题区域
    if (config.showHeader && blocksByArea.header.length > 0) {
      html += `
        <div class="dashboard-header">
          ${config.title ? `<div class="dashboard-title">${escapeHtml(config.title)}</div>` : ''}
          <div class="header-blocks">
            ${blocksByArea.header.map(([id, block]) => 
              context.renderBlock({ ...block, id })
            ).join('')}
          </div>
        </div>
      `;
    } else if (config.title) {
      html += `<div class="dashboard-title">${escapeHtml(config.title)}</div>`;
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
        <div class="dashboard-footer">
          ${blocksByArea.footer.map(([id, block]) => 
            context.renderBlock({ ...block, id })
          ).join('')}
        </div>
      `;
    }
    
    html += '</div>';
    return html;
    
    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  },
  
  styles: (config, theme) => {
    const gapMap = {
      small: '8px',
      medium: '12px',
      large: '16px'
    };
    
    const gap = gapMap[config.gap] || '12px';
    
    return `
      .dashboard-card {
        height: 100%;
        min-height: 200px;
        padding: ${gap};
        display: flex;
        flex-direction: column;
        gap: ${gap};
      }
      
      .dashboard-header {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--cf-border);
      }
      
      .dashboard-title {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-primary-color);
        margin-bottom: 4px;
        text-align: left;
      }
      
      .header-blocks {
        display: flex;
        flex-wrap: wrap;
        gap: ${gap};
        align-items: center;
      }
      
      .header-blocks .cardforge-block {
        background: transparent;
        min-height: auto;
        padding: 4px 8px;
        border: 1px solid var(--cf-border);
      }
      
      .dashboard-content {
        flex: 1;
        overflow: auto;
      }
      
      /* 流式布局 */
      .layout-flow .dashboard-content {
        display: flex;
        flex-wrap: wrap;
        gap: ${gap};
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
        gap: ${gap};
        align-content: start;
      }
      
      /* 列表布局 */
      .layout-list .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: ${gap};
      }
      
      .layout-list .cardforge-block {
        width: 100%;
      }
      
      .dashboard-footer {
        display: flex;
        flex-wrap: wrap;
        gap: ${gap};
        padding-top: 12px;
        border-top: 1px solid var(--cf-border);
        justify-content: space-between;
      }
      
      .dashboard-footer .cardforge-block {
        background: rgba(var(--cf-rgb-primary), 0.05);
        border: none;
        min-height: auto;
        padding: 8px 12px;
      }
      
      /* 空状态 */
      .dashboard-card.empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--cf-text-secondary);
        gap: 16px;
      }
      
      .empty-icon {
        font-size: 2.5em;
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 1.1em;
      }
      
      .empty-hint {
        font-size: 0.9em;
        opacity: 0.7;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 800px) {
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 600px) {
        .dashboard-card {
          padding: 10px;
          gap: 10px;
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .header-blocks {
          flex-direction: column;
          align-items: stretch;
        }
        
        .dashboard-footer {
          flex-direction: column;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .layout-grid .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .layout-flow .cardforge-block {
          min-width: 100%;
        }
        
        .dashboard-title {
          font-size: 1.1em;
        }
      }
      
      /* 块的区域样式 */
      .area-header .cardforge-block {
        background: linear-gradient(135deg, rgba(var(--cf-rgb-primary), 0.1) 0%, transparent 100%);
        border-left: 3px solid var(--cf-primary-color);
      }
      
      .area-footer .cardforge-block {
        background: linear-gradient(135deg, transparent 0%, rgba(var(--cf-rgb-primary), 0.05) 100%);
        font-size: 0.9em;
      }
    `;
  },
  
  // 推荐的布局大小
  layout: {
    recommendedSize: 4,
    areas: [
      { id: 'header', label: '标题区域', maxBlocks: 5 },
      { id: 'content', label: '内容区域', maxBlocks: 20 },
      { id: 'footer', label: '页脚区域', maxBlocks: 5 }
    ]
  }
};