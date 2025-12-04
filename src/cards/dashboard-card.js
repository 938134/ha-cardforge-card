// 仪表盘卡片
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
    
    let html = `<div class="dashboard-card layout-${config.contentLayout}">`;
    
    // 标题区域
    if (config.showHeader && blocksByArea.header.length > 0) {
      const headerBlocks = Object.fromEntries(blocksByArea.header);
      html += `
        <div class="dashboard-header align-${config.headerAlign}">
          ${renderBlocks(headerBlocks, data.hass)}
        </div>
      `;
    }
    
    // 内容区域
    if (blocksByArea.content.length > 0) {
      const contentBlocks = Object.fromEntries(blocksByArea.content);
      html += `
        <div class="dashboard-content columns-${config.gridColumns}">
          ${renderBlocks(contentBlocks, data.hass)}
        </div>
      `;
    }
    
    // 页脚区域
    if (config.showFooter && blocksByArea.footer.length > 0) {
      const footerBlocks = Object.fromEntries(blocksByArea.footer);
      html += `
        <div class="dashboard-footer align-${config.footerAlign}">
          ${renderBlocks(footerBlocks, data.hass)}
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
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .dashboard-header {
        padding: 6px 8px;
        background: rgba(33, 150, 243, 0.08);
        border-left: 3px solid #2196f3;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 4px;
      }
      
      .dashboard-header.align-left .area-content { justify-content: flex-start; }
      .dashboard-header.align-center .area-content { justify-content: center; }
      .dashboard-header.align-right .area-content { justify-content: flex-end; }
      
      .dashboard-header .cardforge-block {
        background: transparent;
        min-height: 40px;
        padding: 4px 8px;
        border: 1px solid rgba(33, 150, 243, 0.3);
      }
      
      .dashboard-header .block-icon {
        font-size: 1.2em;
        color: #2196f3;
      }
      
      .dashboard-content {
        flex: 1;
        overflow: auto;
        padding: 4px;
      }
      
      .layout-flow .dashboard-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-content: flex-start;
      }
      
      .layout-grid .dashboard-content {
        display: grid;
        grid-template-columns: repeat(${config.gridColumns}, 1fr);
        gap: 8px;
        align-content: start;
      }
      
      .layout-list .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .dashboard-footer {
        padding: 6px 8px;
        background: rgba(255, 152, 0, 0.05);
        border-top: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        margin-top: 4px;
      }
      
      .dashboard-footer.align-left .area-content { justify-content: flex-start; }
      .dashboard-footer.align-center .area-content { justify-content: center; }
      .dashboard-footer.align-right .area-content { justify-content: flex-end; }
      
      .dashboard-footer .cardforge-block {
        background: rgba(255, 152, 0, 0.05);
        min-height: 36px;
        padding: 3px 6px;
      }
      
      .dashboard-footer .block-icon {
        font-size: 1em;
        color: var(--cf-text-secondary);
      }
      
      .empty {
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
    `;
  }
};
