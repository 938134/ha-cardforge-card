// cards/dashboard-card.js - 修复版
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
    
    return html`
      <div class="dashboard-card">
        <!-- 标题区域 -->
        ${config.showHeader ? html`
          <div class="dashboard-header align-${config.headerAlign}">
            <div class="header-content">
              ${headerBlocks.map(block => html`
                <block-base 
                  class="dashboard-block header-block"
                  .block=${block}
                  .hass=${hass}
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
        
        <!-- 内容区域 -->
        <div class="dashboard-content layout-${config.contentLayout} block-style-${config.contentBlockStyle}">
          <div class="content-container">
            ${contentBlocks.map(block => html`
              <block-base 
                class="dashboard-block content-block"
                .block=${block}
                .hass=${hass}
                .showName=${true}
                .showValue=${true}
              ></block-base>
            `)}
            ${contentBlocks.length === 0 ? html`
              <div class="empty-area">内容区域 - 请在此添加块</div>
            ` : ''}
          </div>
        </div>
        
        <!-- 页脚区域 -->
        ${config.showFooter ? html`
          <div class="dashboard-footer align-${config.footerAlign}">
            <div class="footer-content">
              ${footerBlocks.map(block => html`
                <block-base 
                  class="dashboard-block footer-block"
                  .block=${block}
                  .hass=${hass}
                  .showName=${true}
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
      .layout-flow .content-container {
        flex-wrap: wrap;
        gap: 12px;
        justify-content: flex-start;
      }
      
      .layout-stack .content-container {
        flex-direction: column;
        gap: 12px;
      }
      
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
    `;
    
    return createCardStyles(customStyles);
  }
};
