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
    const alignment = config.content_alignment || 'center';

    return this._renderCardContainer(`
      <!-- 标题区域 -->
      ${headerBlocks.length > 0 ? this._renderHeaderArea(headerBlocks) : ''}
      
      <!-- 内容区域 -->
      <div class="dashboard-content">
        ${this._renderGridLayout(enrichedContentBlocks, layout, alignment, hass)}
      </div>
      
      <!-- 页脚区域 -->
      ${footerBlocks.length > 0 ? this._renderFooterArea(footerBlocks) : ''}
    `, 'dashboard-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    const layout = config.layout || '2x2';
    const alignment = config.content_alignment || 'center';
    const gridConfig = BlockManager.LAYOUT_PRESETS[layout];
    
    // 根据对齐方式设置不同的样式
    const alignmentStyles = {
      'center': `
        gap: var(--cf-spacing-md);
        .dashboard-block {
          margin: 4px;
        }
      `,
      'compact': `
        gap: 2px;
        .dashboard-block {
          margin: 0;
        }
      `,
      'stretch': `
        gap: 1px;
        .dashboard-block {
          margin: 0;
          height: 100%;
        }
      `
    };

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
        flex: 1;
        ${alignmentStyles[alignment] || alignmentStyles.center}
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
      .header-area {
        margin-bottom: var(--cf-spacing-lg);
        text-align: center;
        padding: var(--cf-spacing-md);
      }
      
      .header-content {
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
      
      /* 文本块特殊样式 */
      .text-block {
        background: rgba(var(--cf-rgb-primary), 0.05);
        border: 1px solid rgba(var(--cf-rgb-primary), 0.2);
      }
      
      .text-block .block-text {
        font-size: 1em;
        color: var(--cf-text-primary);
      }
      
      /* 传感器块样式 */
      .sensor-block .block-value {
        color: var(--cf-primary-color);
      }
      
      /* 自定义背景色支持 */
      .dashboard-block[style*="background"] {
        border: none;
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
        
        .header-content {
          font-size: 1.2em;
        }
        
        .footer-content {
          font-size: 0.8em;
        }
      }
      
      @container cardforge-container (max-width: 300px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        
        .block-value {
          font-size: 1.1em;
        }
      }
    `;
  }

  _renderHeaderArea(headerBlocks) {
    if (headerBlocks.length === 0) return '';
    
    const headerBlock = headerBlocks[0];
    const icon = headerBlock.config?.icon ? `<ha-icon icon="${headerBlock.config.icon}" style="margin-right: 8px;"></ha-icon>` : '';
    const title = headerBlock.config?.title || headerBlock.content || '';
    
    return `
      <div class="header-area">
        <div class="header-content">
          ${icon}${title}
        </div>
      </div>
    `;
  }

  _renderFooterArea(footerBlocks) {
    if (footerBlocks.length === 0) return '';
    
    const footerBlock = footerBlocks[0];
    const icon = footerBlock.config?.icon ? `<ha-icon icon="${footerBlock.config.icon}" style="margin-right: 8px;"></ha-icon>` : '';
    const content = footerBlock.config?.title || footerBlock.content || '';
    
    return `
      <div class="footer-area">
        <div class="footer-content">
          ${icon}${content}
        </div>
      </div>
    `;
  }

  _renderGridLayout(blocks, layout, alignment, hass) {
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
          ${this._renderBlockContent(block, hass)}
        </div>
      </div>
    `;
  }

  _renderBlockContent(block, hass) {
    // 统一处理逻辑：有实体内容显示传感器数据，否则显示文本
    if (block.content && block.realTimeData) {
      // 传感器模式
      const state = this._formatState(block.realTimeData.state);
      const unit = block.realTimeData.attributes?.unit_of_measurement || '';
      return `
        <div class="block-value">${state}</div>
        ${unit ? `<div class="block-unit">${unit}</div>` : ''}
      `;
    } else {
      // 文本模式：优先显示配置的标题，其次显示内容
      const displayText = block.config?.title || block.content || '';
      return `<div class="block-text">${displayText}</div>`;
    }
  }
  
  // 简化状态格式化
  _formatState(state) {
    return state;
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
      label: '网格布局',
      default: '2x2',
      options: ['1x1', '1x2', '2x2', '2x3', '3x3']
    },
    content_alignment: {
      type: 'select',
      label: '内容对齐',
      default: 'center',
      options: ['居中', '紧凑', '拉伸']
    }
  }
};

export { DashboardCard as default, DashboardCard };
export const manifest = DashboardCard.manifest;