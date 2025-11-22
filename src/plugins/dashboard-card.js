// src/plugins/dashboard-card.js
import { BasePlugin } from '../core/base-plugin.js';

class DashboardCard extends BasePlugin {
  getTemplate(safeConfig, hass, entities) {
    const contentBlocks = this.processEntities(entities, safeConfig, hass);
    
    let customContent = '';
    if (contentBlocks.mode === 'free' && contentBlocks.blocks.length > 0) {
      customContent = this._renderCustomBlocks(contentBlocks.blocks, hass);
    }

    return this._renderCardContainer(`
      ${this._renderCardHeader(safeConfig, entities)}
      
      <div class="cf-flex cf-flex-column cf-gap-md">
        ${customContent || `
          <div class="cf-text-center cf-text-secondary cf-p-lg">
            <ha-icon icon="mdi:view-dashboard" style="font-size: 2em; opacity: 0.5;"></ha-icon>
            <div class="cf-mt-md">添加内容块来构建仪表板</div>
          </div>
        `}
      </div>
      
      ${this._renderCardFooter(safeConfig, entities)}
    `, 'dashboard-card');
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--cf-spacing-md);
      }
      
      .dashboard-item {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        text-align: center;
        transition: all var(--cf-transition-fast);
      }
      
      .dashboard-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
      }
      
      .dashboard-value {
        font-size: 1.5em;
        font-weight: 600;
        color: var(--cf-primary-color);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .dashboard-label {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
      }
    `;
  }

  _renderCustomBlocks(blocks, hass) {
    const blockElements = blocks.map(block => {
      if (block.type === 'text') {
        return `<div class="dashboard-item">
          <div class="dashboard-value">📝</div>
          <div class="dashboard-label">${this._renderSafeHTML(block.content)}</div>
        </div>`;
      } else if (block.realTimeData) {
        const state = block.realTimeData.state;
        const icon = this._getEntityIcon(block.type, state);
        
        return `<div class="dashboard-item">
          <div class="dashboard-value">${icon} ${state}</div>
          <div class="dashboard-label">${this._getBlockTypeName(block.type)}</div>
        </div>`;
      } else {
        return `<div class="dashboard-item">
          <div class="dashboard-value">❓</div>
          <div class="dashboard-label">${this._getBlockTypeName(block.type)}</div>
        </div>`;
      }
    });

    return `
      <div class="dashboard-grid">
        ${blockElements.join('')}
      </div>
    `;
  }

  _getEntityIcon(type, state) {
    const icons = {
      sensor: '📊',
      weather: '🌤️',
      switch: state === 'on' ? '💡' : '⚪'
    };
    return icons[type] || '📦';
  }

  _getBlockTypeName(type) {
    const names = { text: '文本', sensor: '传感器', weather: '天气', switch: '开关' };
    return names[type] || '内容';
  }
}

DashboardCard.manifest = {
  id: 'dashboard-card',
  name: '仪表板卡片',
  description: '自由布局的数据仪表板',
  icon: '📊',
  category: '数据',
  version: '1.0.0',
  author: 'CardForge',
  layout_type: 'free',
  allow_custom_entities: true
};

export { DashboardCard as default, DashboardCard };
export const manifest = DashboardCard.manifest;