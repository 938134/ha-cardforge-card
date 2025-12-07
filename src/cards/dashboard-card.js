// cards/dashboard-card.js - 仪表盘卡片
import { createCardStyles } from '../core/card-styles.js';
import { BlockBase } from '../blocks/block-base.js';

export const card = {
  id: 'dashboard',
  meta: {
    name: '仪表盘',
    description: '三段式布局的仪表盘卡片',
    icon: '📊',
    category: '布局'
  },
  
  schema: {
    // 标题区域
    showHeader: {
      type: 'boolean',
      label: '显示标题区域',
      default: true
    },
    headerAlign: {
      type: 'select',
      label: '标题对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'left'
    },
    
    // 内容区域
    contentLayout: {
      type: 'select',
      label: '内容布局模式',
      options: [
        { value: 'flow', label: '横向流式' },
        { value: 'stack', label: '纵向堆叠' },
        { value: 'grid-2', label: '网格2列' },
        { value: 'grid-3', label: '网格3列' },
        { value: 'grid-4', label: '网格4列' }
      ],
      default: 'flow'
    },
    contentBlockStyle: {
      type: 'select',
      label: '块样式',
      options: [
        { value: 'compact', label: '紧凑样式' },
        { value: 'horizontal', label: '水平样式' },
        { value: 'vertical', label: '垂直样式' }
      ],
      default: 'compact'
    },
    
    // 页脚区域
    showFooter: {
      type: 'boolean',
      label: '显示页脚区域',
      default: false
    },
    footerAlign: {
      type: 'select',
      label: '页脚对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'right'
    }
  },
  
  blockType: 'custom',
  
  template: (config, { hass }) => {
    // 获取所有块配置
    const blocks = config.blocks || {};
    
    // 分离不同区域的块
    const headerBlocks = [];
    const contentBlocks = [];
    const footerBlocks = [];
    
    Object.entries(blocks).forEach(([id, block]) => {
      const area = block.area || 'content';
      const blockData = { id, ...block };
      
      if (area === 'header') {
        headerBlocks.push(blockData);
      } else if (area === 'footer') {
        footerBlocks.push(blockData);
      } else {
        contentBlocks.push(blockData);
      }
    });
    
    return `
      <div class="dashboard-card">
        <!-- 标题区域 -->
        ${config.showHeader ? `
          <div class="dashboard-header align-${config.headerAlign}">
            <div class="header-content">
              ${headerBlocks.map(block => `
                <block-base 
                  class="dashboard-block header-block"
                  .block="${JSON.stringify(block)}"
                  .hass="${JSON.stringify(hass)}"
                  .showName="${true}"
                  .showValue="${true}"
                  .layoutMode="horizontal"
                  .blockStyle="horizontal"
                  .areaAlign="${config.headerAlign}"
                ></block-base>
              `).join('')}
              ${headerBlocks.length === 0 ? `
                <div class="empty-area">标题区域 - 可在此添加块</div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- 内容区域 -->
        <div class="dashboard-content layout-${config.contentLayout} block-style-${config.contentBlockStyle}">
          <div class="content-container">
            ${contentBlocks.map(block => `
              <block-base 
                class="dashboard-block content-block"
                .block="${JSON.stringify(block)}"
                .hass="${JSON.stringify(hass)}"
                .showName="${true}"
                .showValue="${true}"
                .layoutMode="${config.contentLayout}"
                .blockStyle="${config.contentBlockStyle}"
                .areaAlign="center"
              ></block-base>
            `).join('')}
            ${contentBlocks.length === 0 ? `
              <div class="empty-area">内容区域 - 请在此添加块</div>
            ` : ''}
          </div>
        </div>
        
        <!-- 页脚区域 -->
        ${config.showFooter ? `
          <div class="dashboard-footer align-${config.footerAlign}">
            <div class="footer-content">
              ${footerBlocks.map(block => `
                <block-base 
                  class="dashboard-block footer-block"
                  .block="${JSON.stringify(block)}"
                  .hass="${JSON.stringify(hass)}"
                  .showName="${true}"
                  .showValue="${true}"
                  .layoutMode="horizontal"
                  .blockStyle="horizontal"
                  .areaAlign="${config.footerAlign}"
                ></block-base>
              `).join('')}
              ${footerBlocks.length === 0 ? `
                <div class="empty-area">页脚区域 - 可在此添加块</div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  styles: (config) => {
    const customStyles = `
      /* 仪表盘卡片容器 */
      .dashboard-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 200px;
        width: 100%;
      }
      
      /* 区域通用样式 */
      .dashboard-header,
      .dashboard-footer {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        min-height: 60px;
        padding: 8px 12px;
        background: rgba(var(--cf-primary-color-rgb), 0.05);
        border-bottom: 1px solid var(--cf-border);
      }
      
      .dashboard-footer {
        border-bottom: none;
        border-top: 1px solid var(--cf-border);
        background: rgba(var(--cf-accent-color-rgb), 0.05);
      }
      
      /* 对齐方式 */
      .align-left { justify-content: flex-start; }
      .align-center { justify-content: center; }
      .align-right { justify-content: flex-end; }
      
      /* 区域内容容器 */
      .header-content,
      .footer-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        width: 100%;
      }
      
      /* 内容区域 */
      .dashboard-content {
        flex: 1;
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        overflow: auto;
      }
      
      .content-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* 布局模式 */
      /* 流式布局 */
      .layout-flow .content-container {
        flex-wrap: wrap;
        gap: 12px;
        justify-content: flex-start;
      }
      
      /* 堆叠布局 */
      .layout-stack .content-container {
        flex-direction: column;
        gap: 12px;
      }
      
      /* 网格布局 */
      .layout-grid-2 .content-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      
      .layout-grid-3 .content-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      
      .layout-grid-4 .content-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      
      /* 仪表盘块样式 */
      .dashboard-block {
        width: 100%;
        height: 100%;
      }
      
      /* 块样式差异处理 */
      .content-block.block-style-compact {
        /* 紧凑样式已在block-base中定义 */
      }
      
      .content-block.block-style-horizontal {
        /* 水平样式调整 */
      }
      
      .content-block.block-style-vertical {
        /* 垂直样式调整 */
      }
      
      /* 空区域提示 */
      .empty-area {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cf-text-tertiary);
        font-style: italic;
        font-size: 0.9em;
        padding: 16px;
        width: 100%;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 768px) {
        .dashboard-header,
        .dashboard-footer {
          min-height: 50px;
          padding: 6px 10px;
        }
        
        .layout-grid-3 .content-container,
        .layout-grid-4 .content-container {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .header-content,
        .footer-content {
          gap: 8px;
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .dashboard-header,
        .dashboard-footer {
          min-height: 45px;
          padding: 4px 8px;
        }
        
        .layout-grid-2 .content-container,
        .layout-grid-3 .content-container,
        .layout-grid-4 .content-container {
          grid-template-columns: 1fr;
        }
        
        .layout-flow .content-container {
          justify-content: center;
        }
        
        .header-content,
        .footer-content {
          gap: 6px;
        }
      }
      
      /* 滚动条样式 */
      .header-content::-webkit-scrollbar,
      .footer-content::-webkit-scrollbar {
        height: 4px;
      }
      
      .header-content::-webkit-scrollbar-track,
      .footer-content::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 2px;
      }
      
      .header-content::-webkit-scrollbar-thumb,
      .footer-content::-webkit-scrollbar-thumb {
        background: rgba(var(--cf-primary-color-rgb), 0.3);
        border-radius: 2px;
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .dashboard-header {
          background: rgba(var(--cf-primary-color-rgb), 0.1);
        }
        
        .dashboard-footer {
          background: rgba(var(--cf-accent-color-rgb), 0.1);
        }
        
        .empty-area {
          color: var(--cf-text-tertiary);
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};