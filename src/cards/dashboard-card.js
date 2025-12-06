// cards/dashboard-card.js - 修复宽度问题
import { createCardStyles } from '../core/card-styles.js';

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
        { value: 'right', label: '右对齐' }
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
        { value: 'right', label: '右对齐' }
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
    const { hass } = context || {};
    const {
      show_header = true,
      header_alignment = 'left',
      show_footer = true,
      footer_alignment = 'left',
      content_layout = 'flow',
      block_style = 'compact'
    } = config;
    
    // 分离块
    const headerBlocks = [];
    const contentBlocks = [];
    const footerBlocks = [];
    
    Object.entries(config.blocks || {}).forEach(([id, block]) => {
      const blockWithId = { ...block, id };
      if (block.area === 'header') {
        headerBlocks.push(blockWithId);
      } else if (block.area === 'footer') {
        footerBlocks.push(blockWithId);
      } else {
        contentBlocks.push(blockWithId);
      }
    });
    
    return `
      <div class="dashboard-container">
        ${show_header && headerBlocks.length > 0 ? `
          <div class="dashboard-header alignment-${header_alignment}">
            ${headerBlocks.map(block => renderBlock(block, hass, 'header')).join('')}
          </div>
        ` : ''}
        
        <div class="dashboard-content layout-${content_layout} style-${block_style}">
          ${contentBlocks.length > 0 ? 
            renderContentBlocks(contentBlocks, hass, content_layout, block_style)
          : `
            <div class="empty-state">
              <ha-icon icon="mdi:view-dashboard-outline"></ha-icon>
              <div>添加内容块以显示仪表盘</div>
            </div>
          `}
        </div>
        
        ${show_footer && footerBlocks.length > 0 ? `
          <div class="dashboard-footer alignment-${footer_alignment}">
            ${footerBlocks.map(block => renderBlock(block, hass, 'footer')).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },
  
  styles: (config, themeVariables) => {
    const { content_layout = 'flow', block_style = 'compact' } = config;
    
    // 根据布局和样式计算最佳宽度
    const getBlockWidth = () => {
      if (content_layout.startsWith('grid-')) {
        // 网格布局：宽度由网格列数决定，自动填充
        return '100%';
      } else if (content_layout === 'stack') {
        // 纵向堆叠：根据样式决定
        switch (block_style) {
          case 'compact': return '320px';
          case 'horizontal': return '380px';
          case 'vertical': return '200px';
          default: return '300px';
        }
      } else {
        // 横向流式：根据样式决定
        switch (block_style) {
          case 'compact': return '180px';
          case 'horizontal': return '220px';
          case 'vertical': return '150px';
          default: return '180px';
        }
      }
    };
    
    const blockWidth = getBlockWidth();
    
    return createCardStyles(`
      /* 仪表盘容器 */
      .dashboard-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 160px;
        container-type: inline-size;
        container-name: dashboard;
      }
      
      /* ===== 标题/页脚区域 ===== */
      .dashboard-header,
      .dashboard-footer {
        display: flex;
        align-items: center;
        min-height: 52px;
        padding: 12px 16px;
        background: rgba(var(--cf-primary-color-rgb), 0.03);
        border: 1px solid rgba(var(--cf-primary-color-rgb), 0.1);
        flex-shrink: 0;
        gap: 12px;
      }
      
      .dashboard-header {
        border-bottom: none;
        border-radius: var(--cf-radius-lg) var(--cf-radius-lg) 0 0;
      }
      
      .dashboard-footer {
        border-top: none;
        border-radius: 0 0 var(--cf-radius-lg) var(--cf-radius-lg);
      }
      
      /* 标题/页脚对齐方式 */
      .dashboard-header.alignment-left,
      .dashboard-footer.alignment-left {
        justify-content: flex-start;
      }
      
      .dashboard-header.alignment-center,
      .dashboard-footer.alignment-center {
        justify-content: center;
      }
      
      .dashboard-header.alignment-right,
      .dashboard-footer.alignment-right {
        justify-content: flex-end;
      }
      
      /* 标题/页脚块样式（固定水平模式） */
      .dashboard-header .dashboard-block,
      .dashboard-footer .dashboard-block {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        min-width: 0; /* 重要：允许内容收缩 */
        flex-shrink: 1;
        white-space: nowrap;
        overflow: hidden;
      }
      
      .dashboard-header .dashboard-block-icon,
      .dashboard-footer .dashboard-block-icon {
        font-size: 1.2em;
        color: var(--cf-primary-color);
        flex-shrink: 0;
      }
      
      .dashboard-header .dashboard-block-name,
      .dashboard-footer .dashboard-block-name {
        font-weight: 500;
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 1;
        min-width: 0;
      }
      
      .dashboard-header .dashboard-block-value,
      .dashboard-footer .dashboard-block-value {
        color: var(--cf-text-secondary);
        margin-left: 4px;
        flex-shrink: 0;
      }
      
      /* ===== 内容区域 ===== */
      .dashboard-content {
        flex: 1;
        min-height: 100px;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--cf-background);
        overflow: auto;
      }
      
      /* 通用块样式 - 修复宽度问题 */
      .dashboard-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-lg);
        box-shadow: var(--cf-shadow-sm);
        transition: all var(--cf-transition-fast);
        overflow: hidden;
        box-sizing: border-box;
      }
      
      .dashboard-block:hover {
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
        border-color: var(--cf-primary-color);
      }
      
      .dashboard-block-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cf-primary-color);
      }
      
      .dashboard-block-name {
        font-weight: 600;
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .dashboard-block-value {
        font-weight: 700;
        color: var(--cf-text-primary);
        font-size: 1.1em;
      }
      
      .dashboard-block-unit {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-left: 2px;
      }
      
      /* === 横向流式布局 === */
      .dashboard-content.layout-flow {
        flex-wrap: wrap;
        gap: 16px;
        align-content: center;
      }
      
      /* 横向流式 + 紧凑样式 */
      .dashboard-content.layout-flow.style-compact {
        align-items: center;
      }
      
      .dashboard-content.layout-flow.style-compact .dashboard-block {
        width: 180px;
        height: 80px;
        display: grid;
        grid-template-columns: 40px 1fr;
        grid-template-rows: auto auto;
        gap: 4px 8px;
        padding: 12px;
      }
      
      /* 横向流式 + 水平样式 */
      .dashboard-content.layout-flow.style-horizontal {
        align-items: center;
      }
      
      .dashboard-content.layout-flow.style-horizontal .dashboard-block {
        width: 220px;
        height: 60px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
      }
      
      /* 横向流式 + 垂直样式 */
      .dashboard-content.layout-flow.style-vertical {
        align-items: center;
      }
      
      .dashboard-content.layout-flow.style-vertical .dashboard-block {
        width: 150px;
        height: 140px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px;
      }
      
      /* === 纵向堆叠布局 === */
      .dashboard-content.layout-stack {
        flex-direction: column;
        gap: 12px;
        align-items: center;
        justify-content: center;
      }
      
      /* 纵向堆叠 + 紧凑样式 */
      .dashboard-content.layout-stack.style-compact .dashboard-block {
        width: 300px;
        max-width: 90%;
        height: 60px;
        display: grid;
        grid-template-columns: 40px 1fr;
        grid-template-rows: auto auto;
        gap: 4px 12px;
        padding: 12px;
      }
      
      /* 纵向堆叠 + 水平样式 */
      .dashboard-content.layout-stack.style-horizontal .dashboard-block {
        width: 350px;
        max-width: 95%;
        height: 60px;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
      }
      
      /* 纵向堆叠 + 垂直样式 */
      .dashboard-content.layout-stack.style-vertical .dashboard-block {
        width: 180px;
        height: 160px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 16px;
      }
      
      /* === 网格布局 === */
      /* 网格2列 */
      .dashboard-content.layout-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        justify-items: center;
        align-items: center;
        width: 100%;
      }
      
      /* 网格3列 */
      .dashboard-content.layout-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        justify-items: center;
        align-items: center;
        width: 100%;
      }
      
      /* 网格4列 */
      .dashboard-content.layout-grid-4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        justify-items: center;
        align-items: center;
        width: 100%;
      }
      
      /* 网格布局通用块样式 */
      .dashboard-content[class*="layout-grid"] .dashboard-block {
        width: 100%; /* 网格布局宽度自动适应 */
        min-width: 0; /* 允许收缩 */
        max-width: 100%;
      }
      
      /* 网格 + 紧凑样式 */
      .dashboard-content[class*="layout-grid"].style-compact .dashboard-block {
        height: 90px;
        display: grid;
        grid-template-columns: 40px 1fr;
        grid-template-rows: auto auto;
        gap: 4px 12px;
        padding: 12px;
      }
      
      /* 网格 + 水平样式 */
      .dashboard-content[class*="layout-grid"].style-horizontal .dashboard-block {
        height: 70px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
      }
      
      /* 网格 + 垂直样式 */
      .dashboard-content[class*="layout-grid"].style-vertical .dashboard-block {
        height: 160px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px;
      }
      
      /* 紧凑样式特定定位 */
      .style-compact .dashboard-block-icon {
        grid-column: 1;
        grid-row: 1 / span 2;
        font-size: 1.3em;
      }
      
      .style-compact .dashboard-block-name {
        grid-column: 2;
        grid-row: 1;
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        align-self: end;
      }
      
      .style-compact .dashboard-block-value {
        grid-column: 2;
        grid-row: 2;
        align-self: start;
      }
      
      /* 空状态 */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--cf-text-tertiary);
        text-align: center;
        padding: 40px 20px;
      }
      
      .empty-state ha-icon {
        font-size: 3em;
        margin-bottom: 16px;
        opacity: 0.3;
      }
      
      /* ===== 响应式设计 ===== */
      @container dashboard (max-width: 1024px) {
        .dashboard-content.layout-flow.style-compact .dashboard-block {
          width: 160px;
        }
        
        .dashboard-content.layout-flow.style-horizontal .dashboard-block {
          width: 200px;
        }
        
        .dashboard-content.layout-grid-4 {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      @container dashboard (max-width: 768px) {
        .dashboard-header,
        .dashboard-footer {
          padding: 8px 12px;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center !important;
        }
        
        .dashboard-header .dashboard-block,
        .dashboard-footer .dashboard-block {
          padding: 4px 8px;
          min-width: 80px;
          font-size: 0.9em;
        }
        
        .dashboard-content {
          padding: 16px;
        }
        
        .dashboard-content.layout-flow {
          gap: 12px;
        }
        
        .dashboard-content.layout-flow.style-compact .dashboard-block {
          width: 140px;
          height: 70px;
          padding: 10px;
        }
        
        .dashboard-content.layout-flow.style-horizontal .dashboard-block {
          width: 180px;
          padding: 10px;
        }
        
        .dashboard-content.layout-grid-3,
        .dashboard-content.layout-grid-4 {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .dashboard-content.layout-stack.style-compact .dashboard-block,
        .dashboard-content.layout-stack.style-horizontal .dashboard-block {
          width: 280px;
        }
      }
      
      @container dashboard (max-width: 480px) {
        .dashboard-header,
        .dashboard-footer {
          min-height: 44px;
          padding: 6px 8px;
          gap: 6px;
        }
        
        .dashboard-content {
          padding: 12px;
        }
        
        .dashboard-content.layout-flow {
          gap: 8px;
        }
        
        .dashboard-content.layout-flow .dashboard-block {
          width: 100% !important;
          max-width: 100%;
        }
        
        .dashboard-content.layout-grid-2,
        .dashboard-content.layout-grid-3,
        .dashboard-content.layout-grid-4 {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        
        .dashboard-content.layout-stack {
          gap: 8px;
        }
        
        .dashboard-content.layout-stack .dashboard-block {
          width: 100% !important;
          max-width: 100%;
        }
      }
      
      /* 深色模式 */
      @media (prefers-color-scheme: dark) {
        .dashboard-header,
        .dashboard-footer {
          background: rgba(var(--cf-primary-color-rgb), 0.08);
          border-color: rgba(var(--cf-primary-color-rgb), 0.2);
        }
        
        .dashboard-block {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
      }
    `);
  }
};

// 渲染标题/页脚块（固定水平模式）
function renderBlock(block, hass, area) {
  const entity = block.entity ? hass?.states?.[block.entity] : null;
  const name = block.name || entity?.attributes?.friendly_name || block.entity || '未命名';
  const value = entity ? entity.state : '';
  const unit = entity?.attributes?.unit_of_measurement || '';
  const icon = block.icon || 'mdi:cube-outline';
  
  return `
    <div class="dashboard-block" data-block-id="${block.id}">
      <div class="dashboard-block-icon">
        <ha-icon icon="${icon}"></ha-icon>
      </div>
      <div class="dashboard-block-name">${escapeHtml(name)}</div>
      ${value ? `<div class="dashboard-block-value">${escapeHtml(value)}${unit ? `<span class="dashboard-block-unit">${unit}</span>` : ''}</div>` : ''}
    </div>
  `;
}

// 渲染内容块（根据布局和样式）
function renderContentBlocks(blocks, hass, layout, style) {
  const blocksHtml = blocks.map(block => {
    const entity = block.entity ? hass?.states?.[block.entity] : null;
    const name = block.name || entity?.attributes?.friendly_name || block.entity || '未命名';
    const value = entity ? entity.state : '';
    const unit = entity?.attributes?.unit_of_measurement || '';
    const icon = block.icon || 'mdi:cube-outline';
    
    return `
      <div class="dashboard-block" data-block-id="${block.id}">
        <div class="dashboard-block-icon">
          <ha-icon icon="${icon}"></ha-icon>
        </div>
        <div class="dashboard-block-name">${escapeHtml(name)}</div>
        ${value ? `<div class="dashboard-block-value">${escapeHtml(value)}${unit ? `<span class="dashboard-block-unit">${unit}</span>` : ''}</div>` : ''}
      </div>
    `;
  }).join('');
  
  return blocksHtml;
}

// HTML安全编码
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}