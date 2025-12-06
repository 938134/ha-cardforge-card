// cards/dashboard-card.js - 仪表盘卡片
import { createCardStyles } from '../core/card-styles.js';
import { renderBlocks } from '../blocks/index.js';

export const card = {
  id: 'dashboard',
  
  meta: {
    name: '仪表盘',
    description: '灵活的仪表盘卡片，支持多种布局',
    icon: '📊',
    tags: ['dashboard', 'layout', 'blocks']
  },
  
  schema: {
    // 标题设置
    show_header: {
      type: 'boolean',
      label: '显示标题',
      default: true,
      description: '显示标题区域块'
    },
    header_alignment: {
      type: 'select',
      label: '标题对齐',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' },
        { value: 'space-between', label: '两端对齐' }
      ],
      default: 'left',
      description: '标题区域块的对齐方式'
    },
    
    // 内容设置
    content_layout: {
      type: 'select',
      label: '布局模式',
      options: [
        { value: 'flow', label: '横向流式' },
        { value: 'stack', label: '纵向堆叠' },
        { value: 'grid-2', label: '网格（2列）' },
        { value: 'grid-3', label: '网格（3列）' },
        { value: 'grid-4', label: '网格（4列）' }
      ],
      default: 'flow',
      description: '内容区域的布局方式'
    },
    block_style: {
      type: 'select',
      label: '块样式',
      options: [
        { value: 'compact', label: '紧凑样式' },
        { value: 'horizontal', label: '水平样式' },
        { value: 'vertical', label: '垂直样式' }
      ],
      default: 'compact',
      description: '内容块的显示样式'
    },
    
    // 页脚设置
    show_footer: {
      type: 'boolean',
      label: '显示页脚',
      default: true,
      description: '显示页脚区域块'
    },
    footer_alignment: {
      type: 'select',
      label: '页脚对齐',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' },
        { value: 'space-between', label: '两端对齐' }
      ],
      default: 'left',
      description: '页脚区域块的对齐方式'
    }
  },
  
  blockType: 'custom',
  
  layout: {
    recommendedSize: 4,
    supportsResize: true
  },
  
  template: (config, context, themeVariables) => {
    // 修正：正确解构参数
    const { hass, theme } = context || {};
    
    const {
      show_header = true,
      header_alignment = 'left',
      show_footer = true,
      footer_alignment = 'left',
      content_layout = 'flow',
      block_style = 'compact'
    } = config;
    
    // 按区域分离块
    const headerBlocks = {};
    const contentBlocks = {};
    const footerBlocks = {};
    
    Object.entries(config.blocks || {}).forEach(([id, block]) => {
      if (block.area === 'header') {
        headerBlocks[id] = block;
      } else if (block.area === 'footer') {
        footerBlocks[id] = block;
      } else {
        contentBlocks[id] = block;
      }
    });
    
    // 解析网格列数
    let gridColumns = 3;
    if (content_layout.startsWith('grid-')) {
      gridColumns = parseInt(content_layout.split('-')[1]) || 3;
    }
    
    // 根据布局决定使用哪种块样式
    let renderLayout = block_style;
    if (content_layout.startsWith('grid-')) {
      renderLayout = 'vertical'; // 网格布局使用垂直样式
    }
    
    return `
      <div class="dashboard-container">
        ${show_header && Object.keys(headerBlocks).length > 0 ? `
          <div class="dashboard-header align-${header_alignment}">
            ${renderBlocks(headerBlocks, hass, { layout: 'horizontal', compact: true })}
          </div>
        ` : ''}
        
        <div class="dashboard-content layout-${content_layout} block-style-${block_style}"
             data-columns="${gridColumns}">
          ${Object.keys(contentBlocks).length > 0 ? 
            renderBlocks(contentBlocks, hass, { layout: renderLayout }) 
          : `
            <div class="empty-content">
              <ha-icon icon="mdi:view-dashboard"></ha-icon>
              <div>添加内容块以显示仪表盘</div>
            </div>
          `}
        </div>
        
        ${show_footer && Object.keys(footerBlocks).length > 0 ? `
          <div class="dashboard-footer align-${footer_alignment}">
            ${renderBlocks(footerBlocks, hass, { layout: 'horizontal', compact: true })}
          </div>
        ` : ''}
      </div>
    `;
  },
  
  styles: (config, themeVariables) => {
    const {
      content_layout = 'flow',
      block_style = 'compact'
    } = config;
    
    return createCardStyles(`
      /* 仪表盘容器 */
      .dashboard-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 140px;
        container-type: inline-size;
        container-name: dashboard;
      }
      
      /* 通用区域样式 */
      .dashboard-header,
      .dashboard-footer {
        display: flex;
        align-items: center;
        min-height: 44px;
        padding: 4px 8px;
        border-bottom: 1px solid var(--cf-border);
        flex-shrink: 0;
        flex-wrap: nowrap;
        overflow-x: auto;
        gap: 8px;
      }
      
      .dashboard-footer {
        border-top: 1px solid var(--cf-border);
        border-bottom: none;
      }
      
      /* 对齐方式 */
      .align-left { justify-content: flex-start; }
      .align-center { justify-content: center; }
      .align-right { justify-content: flex-end; }
      .align-space-between { justify-content: space-between; }
      
      /* 内容区域 */
      .dashboard-content {
        flex: 1;
        min-height: 60px;
        overflow-y: auto;
        padding: 12px;
        display: flex;
        justify-content: center; /* 默认居中 */
      }
      
      /* 横向流式布局 - 始终居中 */
      .dashboard-content.layout-flow {
        flex-wrap: wrap;
        gap: 12px;
        align-items: flex-start;
      }
      
      /* 纵向堆叠布局 - 始终居中 */
      .dashboard-content.layout-stack {
        flex-direction: column;
        gap: 12px;
        align-items: center;
      }
      
      /* 网格布局 - 始终居中 */
      .dashboard-content.layout-grid-2 {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(2, 1fr);
        align-items: start;
        justify-items: center;
      }
      
      .dashboard-content.layout-grid-3 {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, 1fr);
        align-items: start;
        justify-items: center;
      }
      
      .dashboard-content.layout-grid-4 {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(4, 1fr);
        align-items: start;
        justify-items: center;
      }
      
      /* 块样式适配 */
      .dashboard-content.block-style-compact .cardforge-block {
        width: 100%;
        max-width: 200px;
      }
      
      .dashboard-content[class*="layout-grid"].block-style-compact .cardforge-block {
        max-width: 100%;
      }
      
      .dashboard-content.layout-flow.block-style-horizontal .cardforge-block {
        width: 100%;
        max-width: 300px;
      }
      
      .dashboard-content.layout-flow.block-style-vertical .cardforge-block {
        width: 100%;
        max-width: 200px;
      }
      
      /* 网格布局中的垂直样式块调整 */
      .dashboard-content[class*="layout-grid"].block-style-vertical .cardforge-block {
        height: 100%;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      /* 纵向堆叠布局中的块样式调整 */
      .dashboard-content.layout-stack.block-style-horizontal .cardforge-block,
      .dashboard-content.layout-stack.block-style-compact .cardforge-block {
        width: 100%;
        max-width: 400px;
      }
      
      /* 空状态 */
      .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--cf-text-tertiary);
        width: 100%;
        height: 100%;
        text-align: center;
        padding: 32px;
      }
      
      .empty-content ha-icon {
        font-size: 2.5em;
        margin-bottom: 12px;
        opacity: 0.4;
      }
      
      /* 响应式设计 */
      @container dashboard (max-width: 768px) {
        .dashboard-content.layout-flow {
          justify-content: center;
        }
        
        .dashboard-content.layout-flow .cardforge-block {
          max-width: 180px;
        }
        
        .dashboard-content.layout-grid-3,
        .dashboard-content.layout-grid-4 {
          grid-template-columns: repeat(2, 1fr);
          justify-items: center;
        }
      }
      
      @container dashboard (max-width: 480px) {
        .dashboard-content.layout-flow .cardforge-block {
          max-width: 100%;
          width: 100%;
        }
        
        .dashboard-content.layout-grid-2,
        .dashboard-content.layout-grid-3,
        .dashboard-content.layout-grid-4 {
          grid-template-columns: 1fr;
          justify-items: center;
        }
        
        /* 在小屏幕上水平布局标题/页脚 */
        .dashboard-header,
        .dashboard-footer {
          flex-wrap: wrap;
          justify-content: center;
          gap: 6px;
        }
        
        /* 小屏幕纵向堆叠布局块全宽 */
        .dashboard-content.layout-stack .cardforge-block {
          width: 100%;
          max-width: 100%;
        }
      }
      
      /* 超小屏幕（手机横屏/竖屏） */
      @container dashboard (max-width: 360px) {
        .dashboard-content.layout-flow .cardforge-block {
          max-width: 100%;
        }
        
        .dashboard-content.layout-stack .cardforge-block {
          max-width: 100%;
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .dashboard-header,
        .dashboard-footer {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
        }
      }
    `);
  }
};