// src/plugins/dashboard-card.js
import { BasePlugin } from '../core/base-plugin.js';
import { BlockManager } from '../editors/dashboard/block-manager.js';

class DashboardCard extends BasePlugin {
  getTemplate(config, hass, entities) {
    const allBlocks = BlockManager.deserializeFromEntities(entities);
    
    // 分离不同类型的块
    const headerBlocks = allBlocks.filter(block => block.config?.blockType === 'header');
    const contentBlocks = allBlocks.filter(block => 
      !block.config?.blockType || block.config.blockType === 'content'
    );
    const footerBlocks = allBlocks.filter(block => block.config?.blockType === 'footer');
    
    const enrichedContentBlocks = BlockManager.enrichWithRealtimeData(contentBlocks, hass);
    const layout = config.layout || '2x2';
    const layoutType = config.layoutType || 'grid';
    const layoutOptions = config.layoutOptions || {};

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <!-- 标题区域 -->
      ${headerBlocks.length > 0 ? this._renderHeaderArea(headerBlocks) : ''}
      
      <!-- 内容区域 -->
      <div class="dashboard-content">
        ${this._renderContentLayout(enrichedContentBlocks, layout, layoutType, layoutOptions, hass)}
      </div>
      
      <!-- 页脚区域 -->
      ${footerBlocks.length > 0 ? this._renderFooterArea(footerBlocks) : ''}
      
      ${this._renderCardFooter(config, entities)}
    `, 'dashboard-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    const layout = config.layout || '2x2';
    const layoutType = config.layoutType || 'grid';
    const gridConfig = BlockManager.LAYOUT_PRESETS[layout];
    
    return `
      ${baseStyles}
      
      .dashboard-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 200px;
      }
      
      /* 网格布局 */
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(${gridConfig.cols}, 1fr);
        grid-template-rows: repeat(${gridConfig.rows}, 1fr);
        gap: var(--cf-spacing-md);
        flex: 1;
      }
      
      /* 列表布局 */
      .dashboard-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }
      
      .dashboard-list.compact {
        gap: 1px;
      }
      
      .dashboard-list.compact .list-item {
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
      
      .dashboard-list.compact .list-item:first-child {
        border-top: none;
      }
      
      .dashboard-list.compact .list-item:last-child {
        border-bottom: none;
      }
      
      .list-item {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
      }
      
      .list-item.card {
        box-shadow: var(--cf-shadow-sm);
      }
      
      .list-item:hover {
        border-color: var(--cf-primary-color);
      }
      
      .list-item.with-divider {
        border-bottom: 1px solid var(--cf-border);
      }
      
      .list-item.with-divider:last-child {
        border-bottom: none;
      }
      
      .list-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .list-content {
        flex: 1;
        min-width: 0;
      }
      
      .list-title {
        font-size: 0.95em;
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
      }
      
      .list-value {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-primary-color);
      }
      
      /* 时间线布局 */
      .dashboard-timeline {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        position: relative;
        padding-left: var(--cf-spacing-xl);
      }
      
      .dashboard-timeline.vertical::before {
        content: '';
        position: absolute;
        left: 20px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--cf-border);
      }
      
      .dashboard-timeline.horizontal {
        flex-direction: row;
        padding-left: 0;
        padding-top: var(--cf-spacing-xl);
        overflow-x: auto;
      }
      
      .dashboard-timeline.horizontal::before {
        left: 0;
        right: 0;
        top: 20px;
        width: auto;
        height: 2px;
      }
      
      .timeline-item {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: var(--cf-spacing-md);
      }
      
      .dashboard-timeline.horizontal .timeline-item {
        flex-direction: column;
        min-width: 120px;
      }
      
      .timeline-marker {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--cf-primary-color);
        border: 2px solid var(--cf-background);
        position: absolute;
        left: -26px;
        top: 6px;
        z-index: 1;
      }
      
      .dashboard-timeline.horizontal .timeline-marker {
        left: 50%;
        top: -26px;
        transform: translateX(-50%);
      }
      
      .timeline-content {
        flex: 1;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        min-width: 0;
      }
      
      .dashboard-timeline.horizontal .timeline-content {
        text-align: center;
      }
      
      .timeline-item.alternate .timeline-content {
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      .timeline-time {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-bottom: 4px;
      }
      
      .timeline-title {
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
      }
      
      .timeline-value {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-primary-color);
      }
      
      /* 通用块样式 */
      .dashboard-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: flex;
        flex-direction: column;
        transition: all var(--cf-transition-fast);
        min-height: 80px;
      }
      
      .dashboard-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }
      
      .block-header {
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .block-title {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      .block-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      
      .block-value {
        font-size: 1.5em;
        font-weight: 600;
        color: var(--cf-primary-color);
        line-height: 1;
      }
      
      .block-unit {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }
      
      .block-text {
        font-size: 0.95em;
        color: var(--cf-text-primary);
        line-height: 1.4;
      }
      
      .block-placeholder {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        opacity: 0.7;
      }
      
      /* 标题区域样式 */
      .header-area {
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        text-align: center;
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid var(--cf-primary-color);
      }
      
      .header-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        font-size: 1.4em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }
      
      .header-icon {
        color: var(--cf-primary-color);
      }
      
      /* 页脚区域样式 */
      .footer-area {
        margin-top: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        text-align: center;
        background: rgba(var(--cf-rgb-primary), 0.03);
        border-radius: var(--cf-radius-md);
        border-top: 1px solid var(--cf-border);
      }
      
      .footer-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }
      
      .footer-icon {
        color: var(--cf-text-secondary);
        opacity: 0.7;
      }
      
      /* 类型特定样式 */
      .text-block {
        background: rgba(var(--cf-rgb-primary), 0.05);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
      }
      
      .sensor-block .block-value {
        color: var(--cf-primary-color);
      }
      
      .switch-block .block-value {
        color: var(--cf-accent-color);
        font-weight: 600;
      }
      
      .weather-block .block-value {
        color: #2196F3;
      }
      
      /* 自定义背景色支持 */
      .dashboard-block[style*="background"] {
        border: none;
      }
      
      @container cardforge-container (max-width: 400px) {
        .dashboard-grid {
          gap: var(--cf-spacing-sm);
        }
        
        .dashboard-block, .list-item, .timeline-content {
          padding: var(--cf-spacing-sm);
          min-height: 60px;
        }
        
        .block-value {
          font-size: 1.2em;
        }
        
        .header-content {
          font-size: 1.2em;
        }
        
        .footer-content {
          font-size: 0.8em;
        }
        
        .dashboard-timeline.horizontal {
          gap: var(--cf-spacing-md);
        }
        
        .dashboard-timeline.horizontal .timeline-item {
          min-width: 100px;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        
        .block-value {
          font-size: 1.1em;
        }
        
        .dashboard-timeline {
          padding-left: var(--cf-spacing-lg);
        }
        
        .timeline-marker {
          left: -20px;
        }
      }
    `;
  }

  _renderContentLayout(blocks, layout, layoutType, layoutOptions, hass) {
    if (blocks.length === 0) {
      return this._renderEmptyState();
    }
    
    switch (layoutType) {
      case 'grid':
        return this._renderGridLayout(blocks, layout, hass);
      case 'list':
        return this._renderListLayout(blocks, layoutOptions.list, hass);
      case 'timeline':
        return this._renderTimelineLayout(blocks, layoutOptions.timeline, hass);
      case 'free':
        return this._renderFreeLayout(blocks, hass);
      default:
        return this._renderGridLayout(blocks, layout, hass);
    }
  }

  _renderGridLayout(blocks, layout, hass) {
    const gridConfig = BlockManager.LAYOUT_PRESETS[layout] || BlockManager.LAYOUT_PRESETS['2x2'];
    
    // 创建网格容器
    let gridHTML = `<div class="dashboard-grid">`;
    
    // 为每个位置渲染块
    for (let row = 0; row < gridConfig.rows; row++) {
      for (let col = 0; col < gridConfig.cols; col++) {
        const block = blocks.find(b => 
          b.position && b.position.row === row && b.position.col === col
        );
        
        if (block) {
          gridHTML += this._renderBlock(block, hass, 'grid');
        } else {
          // 空位置
          gridHTML += `<div class="dashboard-block" style="opacity: 0.3; background: rgba(var(--cf-rgb-primary), 0.05);"></div>`;
        }
      }
    }
    
    gridHTML += `</div>`;
    return gridHTML;
  }

  _renderListLayout(blocks, options, hass) {
    const listClass = options?.style === 'compact' ? 'compact' : '';
    const showDividers = options?.showDividers !== false;
    const showIcons = options?.showIcons !== false;
    
    let listHTML = `<div class="dashboard-list ${listClass}">`;
    
    blocks.forEach((block, index) => {
      const dividerClass = showDividers ? 'with-divider' : '';
      const itemClass = options?.style === 'card' ? 'card' : '';
      
      listHTML += `
        <div class="list-item ${dividerClass} ${itemClass}">
          ${showIcons ? `
            <div class="list-icon">
              <ha-icon icon="${block.config?.icon || BlockManager.getBlockIcon(block)}"></ha-icon>
            </div>
          ` : ''}
          <div class="list-content">
            <div class="list-title">${block.config?.title || BlockManager.getBlockDisplayName(block)}</div>
            ${this._renderBlockValue(block, hass, 'list')}
          </div>
        </div>
      `;
    });
    
    listHTML += `</div>`;
    return listHTML;
  }

  _renderTimelineLayout(blocks, options, hass) {
    const orientation = options?.orientation || 'vertical';
    const showTimestamps = options?.showTimestamps !== false;
    const showIcons = options?.showIcons !== false;
    const alternate = options?.alternate === true;
    
    let timelineHTML = `<div class="dashboard-timeline ${orientation}">`;
    
    blocks.forEach((block, index) => {
      const alternateClass = alternate && index % 2 === 1 ? 'alternate' : '';
      const now = new Date();
      const timestamp = showTimestamps ? 
        now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '';
      
      timelineHTML += `
        <div class="timeline-item ${alternateClass}">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            ${showTimestamps ? `<div class="timeline-time">${timestamp}</div>` : ''}
            <div class="timeline-title">${block.config?.title || BlockManager.getBlockDisplayName(block)}</div>
            ${this._renderBlockValue(block, hass, 'timeline')}
          </div>
        </div>
      `;
    });
    
    timelineHTML += `</div>`;
    return timelineHTML;
  }

  _renderFreeLayout(blocks, hass) {
    // 自由布局 - 使用绝对定位或CSS Grid area
    return this._renderGridLayout(blocks, '2x2', hass); // 暂时回退到网格布局
  }

  _renderBlock(block, hass, layoutType = 'grid') {
    const blockStyle = block.config?.style ? `block-style-${block.config.style}` : '';
    const customBackground = block.config?.background ? `style="background: ${block.config.background}"` : '';
    const blockClass = `${block.type}-block ${blockStyle}`;
    
    return `
      <div class="dashboard-block ${blockClass}" data-block-id="${block.id}" ${customBackground}>
        ${block.config?.title ? `
          <div class="block-header">
            <span class="block-title">${block.config.title}</span>
          </div>
        ` : ''}
        <div class="block-content">
          ${this._renderBlockValue(block, hass, layoutType)}
        </div>
      </div>
    `;
  }

  _renderBlockValue(block, hass, layoutType) {
    switch (block.type) {
      case 'text':
        return `<div class="block-text">${block.content || ''}</div>`;
        
      case 'sensor':
      case 'weather':
      case 'switch':
      case 'light':
      case 'climate':
      case 'cover':
      case 'media_player':
        if (block.realTimeData) {
          const state = this._formatState(block.realTimeData.state, block.type);
          const unit = block.realTimeData.attributes?.unit_of_measurement || '';
          
          if (layoutType === 'list' || layoutType === 'timeline') {
            return `<div class="list-value">${state}${unit ? ' ' + unit : ''}</div>`;
          } else {
            return `
              <div class="block-value">${state}</div>
              ${unit ? `<div class="block-unit">${unit}</div>` : ''}
            `;
          }
        }
        return `<div class="block-placeholder">${block.content || '未配置'}</div>`;
        
      default:
        return `<div class="block-placeholder">未知类型</div>`;
    }
  }

  _renderEmptyState() {
    return `
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-lg">
        <ha-icon icon="mdi:view-grid-plus" style="font-size: 2em; opacity: 0.5;"></ha-icon>
        <div class="cf-text-sm cf-mt-md cf-text-secondary">添加内容块来构建仪表板</div>
      </div>
    `;
  }

  _renderHeaderArea(headerBlocks) {
    if (headerBlocks.length === 0) return '';
    
    return headerBlocks.map(block => `
      <div class="header-area" data-block-id="${block.id}">
        <div class="header-content">
          ${block.config?.icon ? `<ha-icon icon="${block.config.icon}" class="header-icon"></ha-icon>` : ''}
          <span class="header-text">${block.content || ''}</span>
        </div>
      </div>
    `).join('');
  }

  _renderFooterArea(footerBlocks) {
    if (footerBlocks.length === 0) return '';
    
    return footerBlocks.map(block => `
      <div class="footer-area" data-block-id="${block.id}">
        <div class="footer-content">
          ${block.config?.icon ? `<ha-icon icon="${block.config.icon}" class="footer-icon"></ha-icon>` : ''}
          <span class="footer-text">${block.content || ''}</span>
        </div>
      </div>
    `).join('');
  }

  _formatState(state, type) {
    switch (type) {
      case 'switch':
      case 'light':
        return state === 'on' ? '开启' : state === 'off' ? '关闭' : state;
      case 'cover':
        return state === 'open' ? '打开' : state === 'closed' ? '关闭' : state;
      case 'climate':
        return this._formatClimateState(state);
      default:
        return state;
    }
  }

  _formatClimateState(state) {
    const stateMap = {
      'heat': '制热',
      'cool': '制冷', 
      'auto': '自动',
      'off': '关闭',
      'fan_only': '仅风扇'
    };
    return stateMap[state] || state;
  }
}

DashboardCard.manifest = {
  id: 'dashboard-card',
  name: '仪表盘卡片',
  description: '支持多种布局的数据仪表板',
  icon: '📊',
  category: '数据',
  version: '1.1.0',
  author: 'CardForge',
  free_layout: true,
  config_schema: {
    layout: {
      type: 'select',
      label: '网格布局',
      default: '2x2',
      options: ['1x1', '1x2', '1x3', '1x4', '2x2', '2x3', '3x3', 'free']
    },
    layoutType: {
      type: 'select',
      label: '布局类型',
      default: 'grid',
      options: ['grid', 'list', 'timeline', 'free']
    }
  }
};

export { DashboardCard as default, DashboardCard };
export const manifest = DashboardCard.manifest;