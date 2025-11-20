// src/plugins/dashboard-card.js
import { BasePlugin } from '../core/base-plugin.js';

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
    `, 'dashboard-card', config);
  }

  getStyles(config) {
    return this.getBaseStyles(config);
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
    const gridItems = blocks.map(block => {
      let value = block.content;
      let icon = '';
      let unit = '';

      if (block.realTimeData) {
        value = block.realTimeData.state;
        const attributes = block.realTimeData.attributes || {};
        unit = attributes.unit_of_measurement || '';
        
        if (showIcons) {
          icon = attributes.icon ? `<ha-icon icon="${attributes.icon}"></ha-icon>` : this._getDefaultIcon(block.type);
        }
      } else if (showIcons) {
        icon = this._getDefaultIcon(block.type);
      }

      return `
        <div class="cf-flex cf-flex-center cf-flex-column cf-p-md" style="
          background: rgba(var(--cf-rgb-primary), 0.05); 
          border-radius: var(--cf-radius-md);
          border: 1px solid var(--cf-border);
        ">
          ${icon ? `<div class="cf-mb-sm" style="font-size: 1.5em;">${icon}</div>` : ''}
          <div class="cardforge-text-medium cf-font-semibold">${this._getBlockTypeName(block.type)}</div>
          <div class="cardforge-text-large cf-mt-sm">${value} ${unit}</div>
        </div>
      `;
    });

    return this.renderGrid(gridItems, columns, 'dashboard-grid');
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

  _getDefaultIcon(type) {
    const icons = {
      text: '📝',
      sensor: '📊',
      weather: '🌤️',
      switch: '🔌'
    };
    return icons[type] || '📦';
  }

  _getBlockTypeName(type) {
    const names = {
      text: '文本',
      sensor: '传感器', 
      weather: '天气',
      switch: '开关'
    };
    return names[type] || '数据';
  }
}

// 正确导出 manifest 和默认类
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
  },
  capabilities: {
    supportsTitle: true,
    supportsFooter: false
  }
};

export { DashboardCard as default, DashboardCard };
export const manifest = DashboardCard.manifest;