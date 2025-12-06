// cards/dashboard-card.js - 仪表盘卡片
import { createCardStyles } from '../core/card-styles.js';
import { renderBlocks } from '../blocks/index.js';

export const card = {
  id: 'dashboard',
  
  meta: {
    name: '仪表盘',
    description: '灵活的仪表盘卡片，支持15种布局组合',
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
    // 从context中提取hass
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
    
    // 标题/页脚：使用水平模式，非紧凑
    // 内容：根据选择的块样式和布局模式渲染
    
    return `
      <div class="dashboard-container">
        ${show_header && Object.keys(headerBlocks).length > 0 ? `
          <div class="dashboard-header align-${header_alignment}">
            ${renderBlocks(headerBlocks, hass, { layout: 'horizontal' })}
          </div>
        ` : ''}
        
        <div class="dashboard-content layout-${content_layout} block-style-${block_style}"
             data-columns="${gridColumns}">
          ${Object.keys(contentBlocks).length > 0 ? 
            renderBlocks(contentBlocks, hass, { layout: block_style }) 
          : `
            <div class="empty-content">
              <ha-icon icon="mdi:view-dashboard"></ha-icon>
              <div>添加内容块以显示仪表盘</div>
            </div>
          `}
        </div>
        
        ${show_footer && Object.keys(footerBlocks).length > 0 ? `
          <div class="dashboard-footer align-${footer_alignment}">
            ${renderBlocks(footerBlocks, hass, { layout: 'horizontal' })}
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
      
      /* 标题/页脚区域 - 水平模式 */
      .dashboard-header,
      .dashboard-footer {
        display: flex;
        align-items: center;
        min-height: 48px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--cf-border);
        flex-shrink: 0;
        flex-wrap: nowrap;
        overflow-x: auto;
        gap: 12px;
      }
      
      .dashboard-footer {
        border-top: 1px solid var(--cf-border);
        border-bottom: none;
      }
      
      /* 标题/页脚对齐方式 */
      .align-left { justify-content: flex-start; }
      .align-center { justify-content: center; }
      .align-right { justify-content: flex-end; }
      .align-space-between { justify-content: space-between; }
      
      /* 内容区域 - 始终居中 */
      .dashboard-content {
        flex: 1;
        min-height: 60px;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      /* === 横向流式布局 (5种组合之一) === */
      .dashboard-content.layout-flow {
        flex-wrap: wrap;
        gap: 16px;
        align-items: flex-start;
      }
      
      /* 横向流式 + 紧凑样式 */
      .dashboard-content.layout-flow.block-style-compact {
        align-content: center;
      }
      
      .dashboard-content.layout-flow.block-style-compact .cardforge-block {
        width: 180px;
        min-height: 70px;
      }
      
      /* 横向流式 + 水平样式 */
      .dashboard-content.layout-flow.block-style-horizontal {
        align-content: center;
      }
      
      .dashboard-content.layout-flow.block-style-horizontal .cardforge-block {
        width: 220px;
        min-height: 60px;
      }
      
      /* 横向流式 + 垂直样式 */
      .dashboard-content.layout-flow.block-style-vertical {
        align-content: center;
      }
      
      .dashboard-content.layout-flow.block-style-vertical .cardforge-block {
        width: 150px;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      /* === 纵向堆叠布局 (5种组合之二) === */
      .dashboard-content.layout-stack {
        flex-direction: column;
        gap: 12px;
        align-items: center;
        justify-content: center;
      }
      
      /* 纵向堆叠 + 紧凑样式 */
      .dashboard-content.layout-stack.block-style-compact .cardforge-block {
        width: 300px;
        max-width: 80%;
        min-height: 50px;
      }
      
      /* 纵向堆叠 + 水平样式 */
      .dashboard-content.layout-stack.block-style-horizontal .cardforge-block {
        width: 400px;
        max-width: 90%;
        min-height: 60px;
      }
      
      /* 纵向堆叠 + 垂直样式 */
      .dashboard-content.layout-stack.block-style-vertical .cardforge-block {
        width: 180px;
        min-height: 140px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      /* === 网格布局 (15种组合之三到五) === */
      /* 网格2列 */
      .dashboard-content.layout-grid-2 {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(2, 1fr);
        align-items: center;
        justify-items: center;
      }
      
      /* 网格3列 */
      .dashboard-content.layout-grid-3 {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(3, 1fr);
        align-items: center;
        justify-items: center;
      }
      
      /* 网格4列 */
      .dashboard-content.layout-grid-4 {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(4, 1fr);
        align-items: center;
        justify-items: center;
      }
      
      /* 网格布局 + 紧凑样式 */
      .dashboard-content[class*="layout-grid"].block-style-compact .cardforge-block {
        width: 100%;
        min-height: 80px;
      }
      
      /* 网格布局 + 水平样式 */
      .dashboard-content[class*="layout-grid"].block-style-horizontal .cardforge-block {
        width: 100%;
        min-height: 60px;
      }
      
      /* 网格布局 + 垂直样式 */
      .dashboard-content[class*="layout-grid"].block-style-vertical .cardforge-block {
        width: 100%;
        min-height: 140px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
        margin-bottom: 16px;
        opacity: 0.4;
      }
      
      /* === 响应式设计 === */
      
      /* 中等屏幕 (平板) */
      @container dashboard (max-width: 1024px) {
        .dashboard-content.layout-flow.block-style-compact .cardforge-block {
          width: 160px;
        }
        
        .dashboard-content.layout-flow.block-style-horizontal .cardforge-block {
          width: 200px;
        }
        
        .dashboard-content.layout-grid-4 {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      /* 小屏幕 (大手机) */
      @container dashboard (max-width: 768px) {
        .dashboard-header,
        .dashboard-footer {
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          min-height: 60px;
        }
        
        .dashboard-content.layout-flow {
          justify-content: center;
        }
        
        .dashboard-content.layout-flow.block-style-compact .cardforge-block {
          width: 140px;
        }
        
        .dashboard-content.layout-flow.block-style-horizontal .cardforge-block {
          width: 180px;
        }
        
        .dashboard-content.layout-grid-3,
        .dashboard-content.layout-grid-4 {
          grid-template-columns: repeat(2, 1fr);
        }
        
        /* 纵向堆叠布局在小屏幕全宽 */
        .dashboard-content.layout-stack.block-style-compact .cardforge-block,
        .dashboard-content.layout-stack.block-style-horizontal .cardforge-block {
          width: 100%;
          max-width: 100%;
        }
      }
      
      /* 超小屏幕 (手机) */
      @container dashboard (max-width: 480px) {
        .dashboard-content {
          padding: 12px;
        }
        
        .dashboard-content.layout-flow .cardforge-block {
          width: 100% !important;
          max-width: 100%;
        }
        
        .dashboard-content.layout-grid-2,
        .dashboard-content.layout-grid-3,
        .dashboard-content.layout-grid-4 {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        
        /* 纵向堆叠布局间距调整 */
        .dashboard-content.layout-stack {
          gap: 8px;
        }
      }
      
      /* 超小屏幕 (小手机) */
      @container dashboard (max-width: 360px) {
        .dashboard-header,
        .dashboard-footer {
          padding: 6px;
          gap: 6px;
        }
        
        .dashboard-content {
          padding: 8px;
        }
        
        .dashboard-content.layout-flow {
          gap: 8px;
        }
        
        .dashboard-content[class*="layout-grid"] {
          gap: 8px;
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .dashboard-header,
        .dashboard-footer {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .empty-content {
          color: var(--cf-text-secondary);
        }
      }
    `);
  }
};