// src/plugins/dashboard-card.js
import { BasePlugin } from '../core/base-plugin.js';
import { BlockManager } from '../editors/dashboard/block-manager.js';

class DashboardCard extends BasePlugin {
  getTemplate(config, hass, entities) {
    const allBlocks = BlockManager.deserializeFromEntities(entities);
    
    // 分离不同类型的块
    const titleBlocks = allBlocks.filter(block => block.config?.blockType === 'title');
    const contentBlocks = allBlocks.filter(block => 
      !block.config?.blockType || block.config.blockType === 'content'
    );
    const footerBlocks = allBlocks.filter(block => block.config?.blockType === 'footer');
    
    const enrichedContentBlocks = BlockManager.enrichWithRealtimeData(contentBlocks, hass);
    const layout = config.layout || '2x2';

    return this._renderCardContainer(`
      <!-- 标题区域 -->
      ${titleBlocks.length > 0 ? this._renderTitleArea(titleBlocks) : ''}
      
      <!-- 内容区域 -->
      <div class="dashboard-content">
        ${this._renderGridLayout(enrichedContentBlocks, layout, hass)}
      </div>
      
      <!-- 页脚区域 -->
      ${footerBlocks.length > 0 ? this._renderFooterArea(footerBlocks) : ''}
    `, 'dashboard-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    const layout = config.layout || '2x2';
    const gridConfig = BlockManager.LAYOUT_PRESETS[layout];
    
    return `
      ${baseStyles}
      
      .dashboard-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 200px;
      }
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(${gridConfig.cols}, 1fr);
        grid-template-rows: repeat(${gridConfig.rows}, 1fr);
        gap: var(--cf-spacing-md);
        flex: 1;
      }
      
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
      .title-area {
        margin-bottom: var(--cf-spacing-lg);
        text-align: center;
      }
      
      .title-content {
        font-size: 1.4em;
        font-weight: 600;
        color: var(--cf-text-primary);
        line-height: 1.2;
      }
      
      /* 页脚区域样式 */
      .footer-area {
        margin-top: var(--cf-spacing-lg);
        padding-top: var(--cf-spacing-md);
        border-top: 1px solid var(--cf-border);
        text-align: center;
      }
      
      .footer-content {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }
      
      @container cardforge-container (max-width: 400px) {
        .dashboard-grid {
          gap: var(--cf-spacing-sm);
        }
        
        .dashboard-block {
          padding: var(--cf-spacing-sm);
          min-height: 60px;
        }
        
        .block-value {
          font-size: 1.2em;
        }
        
        .title-content {
          font-size: 1.2em;
        }
      }
    `;
  }

  _renderTitleArea(titleBlocks) {
    if (titleBlocks.length === 0) return '';
    
    const titleContent = titleBlocks[0].content || '';
    return `
      <div class="title-area">
        <div class="title-content">${titleContent}</div>
      </div>
    `;
  }

  _renderFooterArea(footerBlocks) {
    if (footerBlocks.length === 0) return '';
    
    const footerContent = footerBlocks[0].content || '';
    return `
      <div class="footer-area">
        <div class="footer-content">${footerContent}</div>
      </div>
    `;
  }

  _renderGridLayout(blocks, layout, hass) {
    if (blocks.length === 0) {
      return `
        <div class="cf-flex cf-flex-center cf-flex-column cf-p-lg">
          <ha-icon icon="mdi:view-grid-plus" style="font-size: 2em; opacity: 0.5;"></ha-icon>
          <div class="cf-text-sm cf-mt-md cf-text-secondary">添加内容块来构建仪表板</div>
        </div>
      `;
    }
    
    return `
      <div class="dashboard-grid">
        ${blocks.map(block => this._renderBlock(block, hass)).join('')}
      </div>
    `;
  }

  _renderBlock(block, hass) {
    const blockStyle = block.config?.style ? `block-style-${block.config.style}` : '';
    
    return `
      <div class="dashboard-block ${blockStyle}" data-block-id="${block.id}">
        <div class="block-header">
          <span class="block-title">${block.config?.title || BlockManager.getBlockDisplayName(block)}</span>
        </div>
        <div class="block-content">
          ${this._renderBlockContent(block, hass)}
        </div>
      </div>
    `;
  }

  _renderBlockContent(block, hass) {
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
          return `
            <div class="block-value">${block.realTimeData.state}</div>
            ${block.realTimeData.attributes.unit_of_measurement ? 
              `<div class="block-unit">${block.realTimeData.attributes.unit_of_measurement}</div>` : ''}
          `;
        }
        return `<div class="block-placeholder">点击配置实体</div>`;
        
      default:
        return `<div class="block-placeholder">未知类型</div>`;
    }
  }
}

DashboardCard.manifest = {
  id: 'dashboard-card',
  name: '仪表盘卡片',
  description: '自由布局的数据仪表板',
  icon: '📊',
  category: '数据',
  version: '1.0.0',
  author: 'CardForge',
  free_layout: true,
  config_schema: {
    layout: {
      type: 'select',
      label: '内容区域布局',
      default: '2x2',
      options: ['1x1', '1x2', '1x3', '1x4', '2x2', '2x3', '3x3', 'free']
    }
  }
};

export { DashboardCard as default, DashboardCard };
export const manifest = DashboardCard.manifest;