// cards/dashboard-card.js - 简化测试版
import { html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { createCardStyles } from '../core/card-styles.js';

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
    
    showFooter: {
      type: 'boolean',
      label: '显示页脚区域',
      default: false
    }
  },
  
  blockType: 'custom',
  
  template: (config, { hass }) => {
    return html`
      <div class="dashboard-card">
        <!-- 标题区域 -->
        ${config.showHeader ? html`
          <div class="dashboard-header align-${config.headerAlign}">
            <div class="header-content">
              <div class="empty-area">标题区域 - 可在此添加块</div>
            </div>
          </div>
        ` : ''}
        
        <!-- 内容区域 -->
        <div class="dashboard-content layout-${config.contentLayout}">
          <div class="content-container">
            <div class="empty-area">内容区域 - 请在此添加块</div>
          </div>
        </div>
        
        <!-- 页脚区域 -->
        ${config.showFooter ? html`
          <div class="dashboard-footer align-right">
            <div class="footer-content">
              <div class="empty-area">页脚区域 - 可在此添加块</div>
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
    `;
    
    return createCardStyles(customStyles);
  }
};
