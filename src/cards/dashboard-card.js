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
    
    // 根据布局模式生成内容区域类名
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
    
    // 获取内容块样式
    const contentBlockStyle = config.contentBlockStyle || 'compact';
    
    return html`
      <div class="dashboard-card">
        <!-- 标题区域 - 强制使用水平布局 -->
        ${config.showHeader ? html`
          <div class="dashboard-header align-${config.headerAlign}">
            <div class="header-content">
              ${headerBlocks.map(block => html`
                <block-base 
                  .block=${block}
                  .hass=${hass}
                  block-style="horizontal"
                  area-align="${config.headerAlign}"
                  fill-width
                  show-name=${true}
                  show-value=${true}
                ></block-base>
              `)}
              ${headerBlocks.length === 0 ? html`
                <div class="empty-area">标题区域 - 可在此添加块</div>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <!-- 内容区域 -->
        <div class="dashboard-content">
          <div class="content-container ${getContentContainerClass()}">
            ${contentBlocks.map(block => html`
              <block-base 
                .block=${block}
                .hass=${hass}
                block-style="${contentBlockStyle}"
                show-name=${true}
                show-value=${true}
              ></block-base>
            `)}
            ${contentBlocks.length === 0 ? html`
              <div class="empty-area">内容区域 - 请在此添加块</div>
            ` : ''}
          </div>
        </div>
        
        <!-- 页脚区域 - 强制使用水平布局，状态值允许换行 -->
        ${config.showFooter ? html`
          <div class="dashboard-footer align-${config.footerAlign}">
            <div class="footer-content">
              ${footerBlocks.map(block => html`
                <block-base 
                  .block=${block}
                  .hass=${hass}
                  block-style="horizontal"
                  area-align="${config.footerAlign}"
                  fill-width
                  show-name=${false}  /* 页脚通常不显示名称 */
                  show-value=${true}
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
        min-height: 44px;
        padding: 8px 12px;
        border-bottom: 1px solid var(--cf-border);
        box-sizing: border-box;
      }
      
      .dashboard-footer {
        border-bottom: none;
        border-top: 1px solid var(--cf-border);
      }
      
      /* 对齐方式 - 应用到整个容器 */
      .dashboard-header.align-left,
      .dashboard-footer.align-left {
        justify-content: flex-start;
      }
      
      .dashboard-header.align-center,
      .dashboard-footer.align-center {
        justify-content: center;
      }
      
      .dashboard-header.align-right,
      .dashboard-footer.align-right {
        justify-content: flex-end;
      }
      
      /* 标题/页脚内容容器 - 水平流式填充布局 */
      .header-content,
      .footer-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        width: 100%;
      }
      
      /* 标题/页脚块样式 - 填充剩余空间，移除鼠标动画 */
      .header-content block-base,
      .footer-content block-base {
        flex: 1;
        min-width: 140px;
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
      }
      
      /* 移除标题/页脚块的鼠标悬停效果 */
      .header-content block-base:hover,
      .footer-content block-base:hover {
        background: transparent !important;
        transform: none !important;
      }
      
      /* ===== 内容区域 ===== */
      .dashboard-content {
        flex: 1;
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        overflow: auto;
        box-sizing: border-box;
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
        gap: 10px;
        justify-content: center;
        width: fit-content;
        max-width: 100%;
      }
      
      .content-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: fit-content;
        max-width: 100%;
      }
      
      .content-grid-2 {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 10px !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      
      .content-grid-3 {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 10px !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      
      .content-grid-4 {
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 10px !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      
      /* 内容区域块样式 */
      .content-container block-base {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        transition: all var(--cf-transition-fast);
        box-sizing: border-box;
      }
      
      .content-container block-base:hover {
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
        padding: 16px;
        width: 100%;
        background: rgba(var(--cf-primary-color-rgb), 0.03);
        border: 1px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        box-sizing: border-box;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 768px) {
        .dashboard-header,
        .dashboard-footer {
          min-height: 40px;
          padding: 6px 8px;
        }
        
        .header-content,
        .footer-content {
          gap: 6px;
        }
        
        .header-content block-base,
        .footer-content block-base {
          min-width: 120px;
        }
        
        .dashboard-content {
          padding: 10px;
        }
        
        .content-flow,
        .content-stack,
        .content-grid-2,
        .content-grid-3,
        .content-grid-4 {
          gap: 8px;
        }
        
        .content-grid-3,
        .content-grid-4 {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        
        .empty-area {
          padding: 10px;
          font-size: 0.8em;
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .dashboard-header,
        .dashboard-footer {
          min-height: 36px;
          padding: 4px 6px;
        }
        
        .header-content block-base,
        .footer-content block-base {
          min-width: 100px;
        }
        
        .dashboard-content {
          padding: 8px;
        }
        
        .content-flow,
        .content-stack,
        .content-grid-2,
        .content-grid-3,
        .content-grid-4 {
          gap: 6px;
        }
        
        .content-grid-2,
        .content-grid-3,
        .content-grid-4 {
          grid-template-columns: 1fr !important;
        }
        
        .empty-area {
          padding: 8px;
          font-size: 0.75em;
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .dashboard-header,
        .dashboard-footer {
          min-height: 32px;
          padding: 3px 4px;
        }
        
        .header-content block-base,
        .footer-content block-base {
          min-width: 80px;
        }
        
        .dashboard-content {
          padding: 6px;
        }
        
        .content-flow,
        .content-stack {
          gap: 4px;
        }
        
        .empty-area {
          padding: 6px;
          font-size: 0.7em;
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .dashboard-header,
        .dashboard-footer {
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .content-container block-base {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .empty-area {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .header-content block-base:hover,
        .footer-content block-base:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
      }
    `;
    
    return createCardStyles(customStyles);
  }
};