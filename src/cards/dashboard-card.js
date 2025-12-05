// 仪表盘卡片 - 直接使用CSS变量
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
    contentBlockLayout: {
      type: 'select',
      label: '内容块布局',
      options: [
        { value: 'horizontal', label: '水平布局' },
        { value: 'vertical', label: '垂直布局' },
        { value: 'auto', label: '自动响应' }
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
          <div class="empty-hint">请添加块到标题、内容或页脚区域</div>
        </div>
      `;
    }
    
    let html = `<div class="dashboard-card layout-${config.contentLayout} spacing-${config.spacing}">`;
    
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
      
      // 根据配置确定布局模式
      let layoutMode = config.contentBlockLayout;
      if (layoutMode === 'auto') {
        // 可以根据块数量或其他因素自动决定
        layoutMode = blocksByArea.content.length > 4 ? 'vertical' : 'horizontal';
      }
      
      html += `
        <div class="dashboard-content layout-${layoutMode} columns-${config.gridColumns}">
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
    // 直接使用CSS变量，不进行变量提取
    // 计算间距
    let gapSize = 'var(--cf-spacing-md)';
    let paddingSize = 'var(--cf-spacing-md)';
    let headerFooterPadding = 'var(--cf-spacing-sm) var(--cf-spacing-md)';
    
    if (config.spacing === 'compact') {
      gapSize = 'var(--cf-spacing-sm)';
      paddingSize = 'var(--cf-spacing-sm)';
      headerFooterPadding = 'var(--cf-spacing-xs) var(--cf-spacing-sm)';
    } else if (config.spacing === 'relaxed') {
      gapSize = 'var(--cf-spacing-lg)';
      paddingSize = 'var(--cf-spacing-lg)';
      headerFooterPadding = 'var(--cf-spacing-md) var(--cf-spacing-lg)';
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
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        box-shadow: var(--cf-shadow-sm);
        transition: all var(--cf-transition-duration-normal) var(--cf-easing-standard);
      }
      
      .dashboard-card:hover {
        box-shadow: var(--cf-shadow-md);
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
      
      .dashboard-header .area-header {
        display: flex;
        gap: ${gapSize};
        flex-wrap: wrap;
        justify-content: var(--align, flex-start);
      }
      
      .dashboard-header.align-left .area-header { --align: flex-start; }
      .dashboard-header.align-center .area-header { --align: center; }
      .dashboard-header.align-right .area-header { --align: flex-end; }
      
      .dashboard-content {
        flex: 1;
        overflow: auto;
        padding: var(--cf-spacing-sm);
      }
      
      /* 内容区域布局 */
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
      
      /* 内容块布局模式 */
      .dashboard-content.layout-horizontal .area-content {
        display: flex;
        flex-wrap: wrap;
        gap: ${gapSize};
      }
      
      .dashboard-content.layout-vertical .area-content {
        display: flex;
        flex-direction: column;
        gap: ${gapSize};
      }
      
      /* 确保块在网格布局中正确显示 */
      .layout-grid .dashboard-content .area-content {
        display: contents; /* 让块直接成为网格项 */
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
      
      .dashboard-footer .area-footer {
        display: flex;
        gap: ${gapSize};
        flex-wrap: wrap;
        justify-content: var(--align, flex-start);
      }
      
      .dashboard-footer.align-left .area-footer { --align: flex-start; }
      .dashboard-footer.align-center .area-footer { --align: center; }
      .dashboard-footer.align-right .area-footer { --align: flex-end; }
      
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
        background: var(--cf-surface-elevated);
        border-radius: var(--cf-radius-lg);
        border: 2px dashed var(--cf-border-light);
      }
      
      .empty-icon {
        font-size: 3em;
        opacity: 0.4;
      }
      
      .empty-text {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-secondary);
      }
      
      .empty-hint {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-tertiary);
        max-width: 300px;
        line-height: var(--cf-line-height-relaxed);
      }
      
      /* 深色模式优化 - 通过设计系统变量自动处理 */
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 768px) {
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .dashboard-header .area-header,
        .dashboard-footer .area-footer {
          justify-content: center !important;
          text-align: center;
        }
      }
      
      @container cardforge-container (max-width: 600px) {
        .layout-grid .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .layout-flow .dashboard-content {
          justify-content: center;
        }
        
        .dashboard-header.align-left,
        .dashboard-header.align-right,
        .dashboard-footer.align-left,
        .dashboard-footer.align-right {
          text-align: center;
        }
        
        .spacing-normal .dashboard-card {
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }
        
        .spacing-relaxed .dashboard-card {
          padding: var(--cf-spacing-md);
          gap: var(--cf-spacing-md);
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .dashboard-card {
          min-height: 180px;
        }
        
        .layout-flow .dashboard-content,
        .dashboard-content.layout-horizontal .area-content {
          flex-direction: column;
        }
        
        .dashboard-content {
          padding: var(--cf-spacing-xs);
        }
        
        .empty {
          padding: var(--cf-spacing-xl);
        }
        
        .empty-text {
          font-size: var(--cf-font-size-md);
        }
        
        .empty-hint {
          font-size: var(--cf-font-size-xs);
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .dashboard-card {
          padding: var(--cf-spacing-sm);
          gap: var(--cf-spacing-sm);
        }
        
        .empty {
          padding: var(--cf-spacing-lg);
          gap: var(--cf-spacing-sm);
        }
        
        .empty-icon {
          font-size: 2.5em;
        }
      }
      
      /* 高对比度模式支持 */
      .high-contrast .dashboard-card {
        border: 2px solid var(--cf-border);
      }
      
      .high-contrast .empty {
        border-width: 3px;
        border-style: dashed;
      }
    `;
  }
};
