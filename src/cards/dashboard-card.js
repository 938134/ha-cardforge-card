// cards/dashboard-card.js - 完整修复版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
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
    
    contentLayout: {
      type: 'select',
      label: '内容区域布局模式',
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
      label: '内容块样式',
      options: [
        { value: 'compact', label: '紧凑样式' },
        { value: 'horizontal', label: '水平样式' },
        { value: 'vertical', label: '垂直样式' }
      ],
      default: 'compact'
    },
    
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
    
    // 获取内容区域容器样式
    const getContentContainerClass = () => {
      switch (config.contentLayout) {
        case 'flow': return 'content-flow';
        case 'stack': return 'content-stack';
        case 'grid-2': return 'content-grid-2';
        case 'grid-3': return 'content-grid-3';
        case 'grid-4': return 'content-grid-4';
        default: return 'content-flow';
      }
    };
    
    return html`
      <div class="dashboard-card">
        <!-- 标题区域 - 水平流式填充布局 -->
        ${config.showHeader ? html`
          <div class="dashboard-header align-${config.headerAlign}">
            <div class="header-content">
              ${headerBlocks.map(block => html`
                <block-base 
                  class="header-block"
                  .block=${block}
                  .hass=${hass}
                  .blockStyle="horizontal"
                  .showName=${true}
                  .showValue=${true}
                ></block-base>
              `)}
              ${headerBlocks.length === 0 ? html`
                <div class="empty-area">标题区域 - 可在此添加块</div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- 内容区域 - 五种布局模式，居中显示 -->
        <div class="dashboard-content">
          <div class="content-container ${getContentContainerClass()}">
            ${contentBlocks.map(block => html`
              <block-base 
                class="content-block"
                .block=${block}
                .hass=${hass}
                .blockStyle=${config.contentBlockStyle}
                .showName=${true}
                .showValue=${true}
              ></block-base>
            `)}
            ${contentBlocks.length === 0 ? html`
              <div class="empty-area">内容区域 - 请在此添加块</div>
            ` : ''}
          </div>
        </div>
        
        <!-- 页脚区域 - 水平流式填充布局 -->
        ${config.showFooter ? html`
          <div class="dashboard-footer align-${config.footerAlign}">
            <div class="footer-content">
              ${footerBlocks.map(block => html`
                <block-base 
                  class="footer-block"
                  .block=${block}
                  .hass=${hass}
                  .blockStyle="horizontal"
                  .showName=${false}  /* 页脚可隐藏名称 */
                  .showValue=${true}
                ></block-base>
              `)}
              ${footerBlocks.length === 0 ? html`
                <div class="empty-area">页脚区域 - 可在此添加块</div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  },
  
  styles: (config) => {
    const customStyles = css`
      /* 仪表盘卡片容器 */
      .dashboard-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 200px;
        width: 100%;
      }
      
      /* ===== 标题/页脚区域 ===== */
      .dashboard-header,
      .dashboard-footer {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        min-height: 40px;
        padding: 6px 8px;
        border-bottom: 1px solid var(--cf-border);
      }
      
      .dashboard-footer {
        border-bottom: none;
        border-top: 1px solid var(--cf-border);
      }
      
      /* 对齐方式 - 控制整个容器 */
      .align-left { justify-content: flex-start; }
      .align-center { justify-content: center; }
      .align-right { justify-content: flex-end; }
      
      /* 标题/页脚内容容器 - 水平流式填充布局 */
      .header-content,
      .footer-content {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        width: 100%;
      }
      
      /* 标题/页脚块样式 - 填充剩余空间 */
      .header-content .header-block,
      .footer-content .footer-block {
        flex: 1;
        min-width: 120px;
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 4px 6px !important;
      }
      
      .header-content .header-block:hover,
      .footer-content .footer-block:hover {
        background: rgba(var(--cf-primary-color-rgb), 0.05) !important;
        border-radius: var(--cf-radius-sm);
      }
      
      /* ===== 内容区域 ===== */
      .dashboard-content {
        flex: 1;
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center; /* 整体居中 */
        padding: 10px;
        overflow: auto;
      }
      
      .content-container {
        width: 100%;
        max-width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* 五种布局模式 */
      .content-flow {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        width: fit-content;
        max-width: 100%;
      }
      
      .content-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        width: fit-content;
        max-width: 100%;
      }
      
      .content-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        width: fit-content;
        max-width: 100%;
      }
      
      .content-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        width: fit-content;
        max-width: 100%;
      }
      
      .content-grid-4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        width: fit-content;
        max-width: 100%;
      }
      
      /* 内容区域块样式 */
      .content-container .content-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        transition: all var(--cf-transition-fast);
      }
      
      .content-container .content-block:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-sm);
        transform: translateY(-1px);
      }
      
      /* 空区域提示 */
      .empty-area {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cf-text-tertiary);
        font-style: italic;
        font-size: 0.85em;
        padding: 12px;
        width: 100%;
        background: rgba(var(--cf-primary-color-rgb), 0.03);
        border: 1px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 768px) {
        .dashboard-header,
        .dashboard-footer {
          min-height: 36px;
          padding: 4px 6px;
        }
        
        .header-content,
        .footer-content {
          gap: 4px;
        }
        
        .header-content .header-block,
        .footer-content .footer-block {
          min-width: 100px;
        }
        
        .dashboard-content {
          padding: 8px;
        }
        
        .content-flow,
        .content-grid-2,
        .content-grid-3,
        .content-grid-4 {
          gap: 6px;
        }
        
        .content-grid-3,
        .content-grid-4 {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .empty-area {
          padding: 10px;
          font-size: 0.8em;
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .dashboard-header,
        .dashboard-footer {
          min-height: 32px;
          padding: 3px 4px;
        }
        
        .header-content .header-block,
        .footer-content .footer-block {
          min-width: 80px;
          padding: 3px 4px !important;
        }
        
        .dashboard-content {
          padding: 6px;
        }
        
        .content-flow,
        .content-stack,
        .content-grid-2,
        .content-grid-3,
        .content-grid-4 {
          gap: 4px;
        }
        
        .content-grid-2,
        .content-grid-3,
        .content-grid-4 {
          grid-template-columns: 1fr;
        }
        
        .empty-area {
          padding: 8px;
          font-size: 0.75em;
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .dashboard-header,
        .dashboard-footer {
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .content-container .content-block {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .empty-area {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .header-content .header-block:hover,
        .footer-content .footer-block:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};
