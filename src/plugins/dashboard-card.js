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

    return this._renderCardContainer(`
      ${this._renderHeaderArea(headerBlocks)}
      
      <!-- 内容区域 -->
      <div class="dashboard-content">
        ${this._renderGridLayout(enrichedContentBlocks, layout, hass)}
      </div>
      
      ${this._renderFooterArea(footerBlocks)}
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
      
      /* 开关块样式 */
      .switch-block .block-value {
        color: var(--cf-accent-color);
        font-weight: 600;
      }
      
      /* 天气块样式 */
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
          return `
            <div class="block-value">${state}</div>
            ${unit ? `<div class="block-unit">${unit}</div>` : ''}
          `;
        }
        return `<div class="block-placeholder">${block.content || '未配置'}</div>`;
        
      default:
        return `<div class="block-placeholder">未知类型</div>`;
    }
  }

  _formatState(state, type) {
    // 对特定类型的状态进行格式化
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