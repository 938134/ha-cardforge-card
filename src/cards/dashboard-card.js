// cards/dashboard-card.js - 仪表盘卡片（修正版）
import { createCardStyles } from '../core/card-styles.js';
import '../blocks/block-base.js';

export const card = {
  id: 'dashboard',
  meta: {
    name: '仪表盘',
    description: '三段式布局的仪表盘',
    icon: '📊',
    category: '布局'
  },
  
  blockType: 'custom',
  
  schema: {
    // 标题设置
    showHeader: {
      type: 'boolean',
      label: '显示标题区域',
      default: true
    },
    headerAlignment: {
      type: 'select',
      label: '标题对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'center'
    },
    
    // 内容设置
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
      default: 'grid-3'
    },
    blockStyle: {
      type: 'select',
      label: '块样式',
      options: [
        { value: 'compact', label: '紧凑样式' },
        { value: 'horizontal', label: '水平样式' },
        { value: 'vertical', label: '垂直样式' }
      ],
      default: 'compact'
    },
    
    // 页脚设置
    showFooter: {
      type: 'boolean',
      label: '显示页脚区域',
      default: true
    },
    footerAlignment: {
      type: 'select',
      label: '页脚对齐方式',
      options: [
        { value: 'left', label: '左对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'right', label: '右对齐' }
      ],
      default: 'center'
    }
  },
  
template: (config, data) => {
  const blocks = config.blocks || {};
  
  // 按区域分组块
  const headerBlocks = {};
  const contentBlocks = {};
  const footerBlocks = {};
  
  Object.entries(blocks).forEach(([id, block]) => {
    const area = block.area || 'content';
    if (area === 'header') {
      headerBlocks[id] = block;
    } else if (area === 'footer') {
      footerBlocks[id] = block;
    } else {
      contentBlocks[id] = block;
    }
  });
  
  // 生成HTML - 修复属性绑定问题
  return `
    <div class="dashboard-card">
      ${config.showHeader && Object.keys(headerBlocks).length > 0 ? `
        <div class="dashboard-header ${config.headerAlignment}">
          <div class="dashboard-area-content">
            ${Object.entries(headerBlocks).map(([id, block]) => {
              // 为标题区域强制设置horizontal布局
              const blockWithLayout = { ...block, layout: 'horizontal', area: 'header' };
              return `
                <block-base 
                  class="dashboard-block"
                  .block=${blockWithLayout}
                  .hass=${data?.hass}
                  .showName=${true}
                  .showValue=${true}
                ></block-base>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="dashboard-content layout-${config.contentLayout || 'grid-3'}">
        <div class="dashboard-area-content">
          ${Object.entries(contentBlocks).map(([id, block]) => {
            // 为内容区域使用配置的布局
            const blockWithLayout = { 
              ...block, 
              layout: config.blockStyle || 'compact',
              area: 'content' 
            };
            return `
              <block-base 
                class="dashboard-block"
                .block=${blockWithLayout}
                .hass=${data?.hass}
                .showName=${true}
                .showValue=${true}
              ></block-base>
            `;
          }).join('')}
          ${Object.keys(contentBlocks).length === 0 ? `
            <div class="dashboard-empty">
              <div class="dashboard-empty-icon">
                <ha-icon icon="mdi:view-grid-plus"></ha-icon>
              </div>
              <div>请在块管理中为内容区域添加块</div>
            </div>
          ` : ''}
        </div>
      </div>
      
      ${config.showFooter && Object.keys(footerBlocks).length > 0 ? `
        <div class="dashboard-footer ${config.footerAlignment}">
          <div class="dashboard-area-content">
            ${Object.entries(footerBlocks).map(([id, block]) => {
              // 为页脚区域强制设置horizontal布局
              const blockWithLayout = { ...block, layout: 'horizontal', area: 'footer' };
              return `
                <block-base 
                  class="dashboard-block"
                  .block=${blockWithLayout}
                  .hass=${data?.hass}
                  .showName=${true}
                  .showValue=${true}
                ></block-base>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
},
  
styles: (config) => {
  const customStyles = `
    /* 仪表盘卡片容器 - 完全自适应高度 */
    .dashboard-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 300px;
      background: var(--cf-background);
      box-sizing: border-box;
    }
    
    /* 区域基础样式 */
    .dashboard-header,
    .dashboard-content,
    .dashboard-footer {
      background: var(--cf-surface);
      transition: all var(--cf-transition-fast);
      box-sizing: border-box;
    }
    
    .dashboard-header {
      min-height: 60px;
      border-bottom: 1px solid var(--cf-border);
      flex-shrink: 0;
    }
    
    .dashboard-content {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      position: relative;
    }
    
    .dashboard-footer {
      min-height: 50px;
      border-top: 1px solid var(--cf-border);
      flex-shrink: 0;
    }
    
    /* 区域内容容器 */
    .dashboard-area-content {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    
    /* 对齐方式 */
    .dashboard-header.left .dashboard-area-content {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px;
      height: 100%;
    }
    
    .dashboard-header.center .dashboard-area-content {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px;
      height: 100%;
    }
    
    .dashboard-header.right .dashboard-area-content {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px;
      height: 100%;
    }
    
    .dashboard-footer.left .dashboard-area-content {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px;
      height: 100%;
    }
    
    .dashboard-footer.center .dashboard-area-content {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px;
      height: 100%;
    }
    
    .dashboard-footer.right .dashboard-area-content {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 12px;
      height: 100%;
    }
    
    /* 内容区域布局模式 - 完全自适应 */
    .dashboard-content.layout-flow .dashboard-area-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: flex-start;
      align-content: flex-start;
      gap: 12px;
      padding: 12px;
      overflow-y: auto;
      height: 100%;
      box-sizing: border-box;
    }
    
    .dashboard-content.layout-stack .dashboard-area-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 12px;
      overflow-y: auto;
      height: 100%;
      box-sizing: border-box;
    }
    
    .dashboard-content.layout-grid-2 .dashboard-area-content {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: min-content;
      gap: 12px;
      align-items: start;
      padding: 12px;
      overflow-y: auto;
      height: 100%;
      box-sizing: border-box;
    }
    
    .dashboard-content.layout-grid-3 .dashboard-area-content {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-auto-rows: min-content;
      gap: 12px;
      align-items: start;
      padding: 12px;
      overflow-y: auto;
      height: 100%;
      box-sizing: border-box;
    }
    
    .dashboard-content.layout-grid-4 .dashboard-area-content {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-auto-rows: min-content;
      gap: 12px;
      align-items: start;
      padding: 12px;
      overflow-y: auto;
      height: 100%;
      box-sizing: border-box;
    }
    
    /* 块样式优化 */
    .dashboard-block {
      transition: all var(--cf-transition-fast);
      height: fit-content;
    }
    
    /* 标题/页脚块 - 确保水平布局 */
    .dashboard-header .dashboard-block,
    .dashboard-footer .dashboard-block {
      height: 60px !important;
      min-height: 60px !important;
    }
    
    /* 空状态 */
    .dashboard-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
      color: var(--cf-text-secondary);
      text-align: center;
      grid-column: 1 / -1;
      padding: 32px;
    }
    
    .dashboard-empty-icon {
      font-size: 2em;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    /* 响应式设计 */
    @container cardforge-container (max-width: 768px) {
      .dashboard-content.layout-grid-3 .dashboard-area-content {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      
      .dashboard-content.layout-grid-4 .dashboard-area-content {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      
      .dashboard-header .dashboard-area-content,
      .dashboard-footer .dashboard-area-content {
        padding: 8px;
        gap: 8px;
      }
      
      .dashboard-content .dashboard-area-content {
        padding: 8px;
        gap: 8px;
      }
    }
    
    @container cardforge-container (max-width: 480px) {
      .dashboard-content.layout-grid-2 .dashboard-area-content,
      .dashboard-content.layout-grid-3 .dashboard-area-content,
      .dashboard-content.layout-grid-4 .dashboard-area-content {
        grid-template-columns: 1fr;
      }
      
      .dashboard-content.layout-flow .dashboard-area-content {
        justify-content: flex-start;
      }
      
      .dashboard-header,
      .dashboard-footer {
        min-height: 50px;
      }
      
      .dashboard-header .dashboard-area-content,
      .dashboard-footer .dashboard-area-content {
        padding: 6px;
        gap: 6px;
      }
      
      .dashboard-content .dashboard-area-content {
        padding: 6px;
        gap: 6px;
      }
    }
    
    /* 深色模式适配 */
    @media (prefers-color-scheme: dark) {
      .dashboard-header {
        background: rgba(var(--cf-primary-color-rgb), 0.05);
      }
      
      .dashboard-footer {
        background: rgba(var(--cf-accent-color-rgb), 0.05);
      }
    }
  `;
  
  return createCardStyles(customStyles);
}
};