// src/plugins/dashboard-card.js
import { BasePlugin } from '../core/base-plugin.js';
import { BlockManager } from '../core/block-manager.js';

class DashboardCard extends BasePlugin {
  getTemplate(config, hass, entities) {
    const contentBlocks = this.processEntities(entities, config, hass);
    const columns = this._getColumnCount(config.columns);

    let dashboardContent = '';
    
    if (contentBlocks.mode === 'free' && contentBlocks.blocks.length > 0) {
      dashboardContent = this._renderDashboardGrid(contentBlocks.blocks, columns, config.show_icons);
    } else {
      dashboardContent = this._renderEmptyState();
    }

    return this._renderCardContainer(`
      ${this._renderCardHeader(config, entities)}
      
      <div class="cf-mt-md">
        ${dashboardContent}
      </div>
      
      ${this._renderCardFooter(config, entities)}
    `, 'dashboard-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .dashboard-item {
        background: rgba(var(--cf-rgb-primary), 0.05);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        text-align: center;
        transition: all var(--cf-transition-fast);
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      
      .dashboard-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .item-label {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-sm);
      }
      
      .item-value {
        font-size: 1.5em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }
      
      .dashboard-grid {
        gap: var(--cf-spacing-md);
      }
      
      @container cardforge-container (max-width: 400px) {
        .dashboard-grid {
          grid-template-columns: 1fr !important;
        }
        
        .dashboard-item {
          padding: var(--cf-spacing-md);
          min-height: 80px;
        }
        
        .item-value {
          font-size: 1.2em;
        }
      }
    `;
  }

  _getColumnCount(columnConfig) {
    const columnMap = {
      '2列': 2,
      '3列': 3,
      '4列': 4
    };
    return columnMap[columnConfig] || 3;
  }

  _renderDashboardGrid(blocks, columns, showIcons) {
    const gridItems = blocks.map(block => this._renderDashboardItem(block, showIcons));
    
    return this.renderGrid(gridItems, columns, 'dashboard-grid');
  }

  _renderDashboardItem(block, showIcons) {
    const value = block.realTimeData?.state || block.content;
    const unit = block.realTimeData?.attributes?.unit_of_measurement || '';
    const icon = showIcons ? this._getBlockIcon(block) : '';
    const label = BlockManager.getBlockDisplayName(block);
    
    return `
      <div class="dashboard-item">
        ${icon}
        <div class="item-label">${label}</div>
        <div class="item-value">${value} ${unit}</div>
      </div>
    `;
  }

  _getBlockIcon(block) {
    if (block.realTimeData?.attributes?.icon) {
      return `<ha-icon icon="${block.realTimeData.attributes.icon}" style="font-size: 1.5em; margin-bottom: var(--cf-spacing-sm);"></ha-icon>`;
    }
    
    const defaultIcons = {
      text: '📝',
      sensor: '📊',
      weather: '🌤️',
      switch: '🔌'
    };
    
    const icon = defaultIcons[block.type] || '📦';
    return `<div style="font-size: 1.5em; margin-bottom: var(--cf-spacing-sm);">${icon}</div>`;
  }

  _renderEmptyState() {
    return `
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-lg">
        <ha-icon icon="mdi:chart-box-outline" style="font-size: 3em; opacity: 0.3; margin-bottom: var(--cf-spacing-md);"></ha-icon>
        <div class="cardforge-text-medium cf-mb-sm">暂无数据</div>
        <div class="cardforge-text-small cf-text-secondary">请添加内容块来构建仪表盘</div>
      </div>
    `;
  }
}

DashboardCard.manifest = {
  id: 'dashboard-card',
  name: '仪表盘卡片',
  description: '多数据源仪表盘展示',
  icon: '📊',
  category: '信息',
  version: '1.0.0',
  author: 'CardForge',
  layout_type: 'free',
  allow_custom_entities: true,
  config_schema: {
    columns: {
      type: 'select',
      label: '列数',
      options: ['2列', '3列', '4列'],
      default: '3列'
    },
    show_icons: {
      type: 'boolean',
      label: '显示图标',
      default: true
    }
  }
};

export { DashboardCard as default, DashboardCard };
export const manifest = DashboardCard.manifest;