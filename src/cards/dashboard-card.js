// cards/dashboard-card.js - 紧凑优化版
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
      label: '内容布局模式',
      options: [
        { value: 'compact', label: '紧凑网格' },
        { value: 'horizontal', label: '水平流式' },
        { value: 'vertical', label: '垂直堆叠' }
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
    
    // 根据内容布局模式决定块样式
    const getContentBlockStyle = () => {
      switch (config.contentLayout) {
        case 'horizontal':
          return 'horizontal';
        case 'vertical':
          return 'vertical';
        case 'compact':
        default:
          return 'compact';
      }
    };
    
    // 获取内容区域容器类
    const getContentContainerClass = () => {
      switch (config.contentLayout) {
        case 'horizontal':
          return 'layout-horizontal-fill';
        case 'vertical':
          return 'layout-vertical-stack';
        case 'compact':
        default:
          return 'layout-compact-grid';
      }
    };
    
    return html`
      <div class="dashboard-card">
        <!-- 标题区域 - 始终使用水平布局 -->
        ${config.showHeader ? html`
          <div class="dashboard-header align-${config.headerAlign}">
            <div class="header-content layout-horizontal-fill">
              ${headerBlocks.map(block => html`
                <block-base 
                  class="dashboard-block header-block"
                  .block=${block}
                  .hass=${hass}
                  .blockStyle="horizontal" /* 标题区域强制水平布局 */
                  .showName=${true}
                  .showValue=${true}
                ></block-base>
              `)}
              ${headerBlocks.length === 0 ? html`
                <div class="empty-area">标题区域</div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- 内容区域 - 根据配置选择布局 -->
        <div class="dashboard-content ${getContentContainerClass()}">
          ${contentBlocks.map(block => html`
            <block-base 
              class="dashboard-block content-block"
              .block=${block}
              .hass=${hass}
              .blockStyle=${getContentBlockStyle()} /* 根据配置选择布局 */
              .showName=${true}
              .showValue=${true}
            ></block-base>
          `)}
          ${contentBlocks.length === 0 ? html`
            <div class="empty-area">内容区域</div>
          ` : ''}
        </div>
        
        <!-- 页脚区域 - 始终使用水平布局 -->
        ${config.showFooter ? html`
          <div class="dashboard-footer align-${config.footerAlign}">
            <div class="footer-content layout-horizontal-fill">
              ${footerBlocks.map(block => html`
                <block-base 
                  class="dashboard-block footer-block"
                  .block=${block}
                  .hass=${hass}
                  .blockStyle="horizontal" /* 页脚区域强制水平布局 */
                  .showName=${true}
                  .showValue=${true}
                ></block-base>
              `)}
              ${footerBlocks.length === 0 ? html`
                <div class="empty-area">页脚区域</div>
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
        min-height: 40px; /* 减小高度 */
        padding: 6px 8px; /* 减小内边距 */
        border-bottom: 1px solid var(--cf-border);
      }
      
      .dashboard-footer {
        border-bottom: none;
        border-top: 1px solid var(--cf-border);
      }
      
      /* 对齐方式 */
      .align-left { justify-content: flex-start; }
      .align-center { justify-content: center; }
      .align-right { justify-content: flex-end; }
      
      /* 标题/页脚内容容器 */
      .header-content,
      .footer-content {
        width: 100%;
      }
      
      /* 标题/页脚区域块样式 */
      .dashboard-header .dashboard-block,
      .dashboard-footer .dashboard-block {
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
        padding: 2px 4px !important;
      }
      
      .dashboard-header .dashboard-block:hover,
      .dashboard-footer .dashboard-block:hover {
        background: rgba(var(--cf-primary-color-rgb), 0.05) !important;
      }
      
      /* ===== 内容区域 ===== */
      .dashboard-content {
        flex: 1;
        min-height: 80px;
        padding: 10px; /* 减小内边距 */
        overflow: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* 内容区域块样式 */
      .dashboard-content .dashboard-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        transition: all var(--cf-transition-fast);
      }
      
      .dashboard-content .dashboard-block:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-sm);
        transform: translateY(-1px);
      }
      
      /* 内容区域不同布局的调整 */
      .dashboard-content.layout-horizontal-fill {
        justify-content: flex-start;
        align-items: flex-start;
      }
      
      .dashboard-content.layout-vertical-stack {
        align-items: center;
      }
      
      .dashboard-content.layout-compact-grid {
        justify-content: flex-start;
        align-items: flex-start;
      }
      
      /* 空区域提示 */
      .empty-area {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cf-text-tertiary);
        font-style: italic;
        font-size: 0.85em;
        padding: 12px; /* 减小内边距 */
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
        
        .dashboard-content {
          padding: 8px;
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
        
        .dashboard-content {
          padding: 6px;
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
        
        .dashboard-content .dashboard-block {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .empty-area {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .dashboard-header .dashboard-block:hover,
        .dashboard-footer .dashboard-block:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};
