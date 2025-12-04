// 仪表盘卡片 - 完全变量化版本
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
      html += `
        <div class="dashboard-content columns-${config.gridColumns}">
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
    // 使用设计系统变量
    const primaryColor = theme['--cf-primary-color'] || 'var(--cf-primary-color, #03a9f4)';
    const accentColor = theme['--cf-accent-color'] || 'var(--cf-accent-color, #ff4081)';
    const borderColor = theme['--cf-border'] || 'var(--cf-border, #e0e0e0)';
    const surfaceColor = theme['--cf-surface'] || 'var(--cf-surface, #ffffff)';
    const textPrimary = theme['--cf-text-primary'] || 'var(--cf-text-primary, #212121)';
    const textSecondary = theme['--cf-text-secondary'] || 'var(--cf-text-secondary, #757575)';
    const textTertiary = theme['--cf-text-tertiary'] || 'var(--cf-text-tertiary, #9e9e9e)';
    const hoverColor = theme['--cf-hover-color'] || 'rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.08)';
    
    // 计算间距
    let gapSize = 'var(--cf-spacing-md, 12px)';
    let paddingSize = 'var(--cf-spacing-md, 12px)';
    let headerPadding = 'var(--cf-spacing-sm, 8px) var(--cf-spacing-md, 12px)';
    
    if (config.spacing === 'compact') {
      gapSize = 'var(--cf-spacing-sm, 8px)';
      paddingSize = 'var(--cf-spacing-sm, 8px)';
      headerPadding = 'var(--cf-spacing-xs, 4px) var(--cf-spacing-sm, 8px)';
    } else if (config.spacing === 'relaxed') {
      gapSize = 'var(--cf-spacing-lg, 16px)';
      paddingSize = 'var(--cf-spacing-lg, 16px)';
      headerPadding = 'var(--cf-spacing-md, 12px) var(--cf-spacing-lg, 16px)';
    }
    
    return `
      .dashboard-card {
        height: 100%;
        min-height: 200px;
        padding: ${paddingSize};
        display: flex;
        flex-direction: column;
        gap: ${gapSize};
        font-family: var(--cf-font-family-base, inherit);
        background: ${surfaceColor};
        border-radius: var(--cf-radius-lg, 12px);
        box-shadow: var(--cf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      .dashboard-header {
        padding: ${headerPadding};
        background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.08);
        border-left: 3px solid ${primaryColor};
        border-radius: var(--cf-radius-md, 8px);
        margin-bottom: var(--cf-spacing-xs, 4px);
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
        gap: var(--cf-spacing-sm, 8px);
        flex-wrap: wrap;
        justify-content: var(--align, flex-start);
      }
      
      .dashboard-header.align-left .area-header { --align: flex-start; }
      .dashboard-header.align-center .area-header { --align: center; }
      .dashboard-header.align-right .area-header { --align: flex-end; }
      
      .dashboard-header .cardforge-block {
        background: rgba(255, 255, 255, 0.9);
        min-height: 50px;
        padding: var(--cf-spacing-sm, 8px);
        border: 1px solid rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.3);
        border-radius: var(--cf-radius-sm, 4px);
        transition: all var(--cf-transition-fast, 0.15s) ease;
      }
      
      .dashboard-header .cardforge-block:hover {
        background: white;
        border-color: ${primaryColor};
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      .dashboard-header .block-icon {
        font-size: 1.4em;
        color: ${primaryColor};
        background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.1);
      }
      
      .dashboard-header .block-name {
        color: ${textSecondary};
        font-size: var(--cf-font-size-sm, 0.875rem);
      }
      
      .dashboard-header .block-value {
        color: ${textPrimary};
        font-size: var(--cf-font-size-lg, 1.125rem);
        font-weight: var(--cf-font-weight-medium, 500);
      }
      
      .dashboard-content {
        flex: 1;
        overflow: auto;
        padding: var(--cf-spacing-sm, 8px);
      }
      
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
      
      .dashboard-content .area-content .cardforge-block {
        background: ${surfaceColor};
        min-height: 70px;
        border: 1px solid ${borderColor};
        border-radius: var(--cf-radius-md, 8px);
        padding: var(--cf-spacing-md, 12px);
        transition: all var(--cf-transition-fast, 0.15s) ease;
      }
      
      .dashboard-content .area-content .cardforge-block:hover {
        background: ${hoverColor};
        border-color: ${primaryColor};
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      }
      
      .dashboard-content .block-icon {
        background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.1);
        color: ${primaryColor};
      }
      
      .dashboard-footer {
        padding: ${headerPadding};
        background: rgba(var(--cf-accent-color-rgb, 255, 64, 129), 0.05);
        border-top: 1px solid ${borderColor};
        border-radius: var(--cf-radius-md, 8px);
        margin-top: var(--cf-spacing-xs, 4px);
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
        gap: var(--cf-spacing-sm, 8px);
        flex-wrap: wrap;
        justify-content: var(--align, flex-start);
      }
      
      .dashboard-footer.align-left .area-footer { --align: flex-start; }
      .dashboard-footer.align-center .area-footer { --align: center; }
      .dashboard-footer.align-right .area-footer { --align: flex-end; }
      
      .dashboard-footer .cardforge-block {
        background: rgba(255, 255, 255, 0.8);
        min-height: 45px;
        padding: var(--cf-spacing-sm, 8px);
        border-radius: var(--cf-radius-sm, 4px);
        transition: all var(--cf-transition-fast, 0.15s) ease;
      }
      
      .dashboard-footer .cardforge-block:hover {
        background: white;
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.12));
      }
      
      .dashboard-footer .block-icon {
        font-size: 1.2em;
        color: ${textTertiary};
        background: rgba(0, 0, 0, 0.05);
      }
      
      .dashboard-footer .block-name {
        color: ${textTertiary};
        font-size: var(--cf-font-size-xs, 0.75rem);
      }
      
      .dashboard-footer .block-value {
        color: ${textSecondary};
        font-size: var(--cf-font-size-base, 1rem);
      }
      
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: ${textTertiary};
        gap: var(--cf-spacing-md, 12px);
        padding: var(--cf-spacing-2xl, 24px);
        background: ${surfaceColor};
      }
      
      .empty-icon {
        font-size: 2.5em;
        opacity: 0.4;
      }
      
      .empty-text {
        font-size: var(--cf-font-size-lg, 1.125rem);
        font-weight: var(--cf-font-weight-medium, 500);
      }
      
      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .dashboard-card {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        .dashboard-header {
          background: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.12);
          border-left-color: ${primaryColor};
        }
        
        .dashboard-header .cardforge-block {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(var(--cf-primary-color-rgb, 3, 169, 244), 0.4);
        }
        
        .dashboard-header .cardforge-block:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: ${primaryColor};
        }
        
        .dashboard-content .area-content .cardforge-block {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }
        
        .dashboard-content .area-content .cardforge-block:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: ${primaryColor};
        }
        
        .dashboard-footer {
          background: rgba(var(--cf-accent-color-rgb, 255, 64, 129), 0.08);
          border-top-color: rgba(255, 255, 255, 0.2);
        }
        
        .dashboard-footer .cardforge-block {
          background: rgba(255, 255, 255, 0.06);
        }
        
        .dashboard-footer .cardforge-block:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .empty {
          background: rgba(255, 255, 255, 0.03);
        }
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .layout-grid .dashboard-content {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .dashboard-header .area-header,
        .dashboard-footer .area-footer {
          justify-content: center !important;
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .layout-grid .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .dashboard-header .cardforge-block,
        .dashboard-footer .cardforge-block {
          width: 100%;
          max-width: 100%;
        }
        
        .spacing-normal .dashboard-card {
          padding: var(--cf-spacing-sm, 8px);
          gap: var(--cf-spacing-sm, 8px);
        }
      }
      
      /* 动画效果 */
      .dashboard-card {
        animation: dashboardAppear var(--cf-transition-slow, 0.4s) ease;
      }
      
      @keyframes dashboardAppear {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .area-header .cardforge-block,
      .area-content .cardforge-block,
      .area-footer .cardforge-block {
        animation: blockAppear 0.3s ease var(--delay, 0s) both;
      }
      
      .area-header .cardforge-block:nth-child(1) { --delay: 0.1s; }
      .area-header .cardforge-block:nth-child(2) { --delay: 0.2s; }
      .area-header .cardforge-block:nth-child(3) { --delay: 0.3s; }
      
      @keyframes blockAppear {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
  }
};