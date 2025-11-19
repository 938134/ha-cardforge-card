// src/plugins/dashboard-card.js
import { BasePlugin } from '../core/base-plugin.js';

class DashboardCard extends BasePlugin {
  static manifest = {
    id: 'dashboard-card',
    name: '仪表盘',
    version: '1.0.0',
    description: '自由布局的仪表盘，可任意添加内容块',
    category: '布局',
    icon: '📊',
    author: 'CardForge',
    
    // 自由布局标记
    layout_type: 'free',
    
    // 支持标题和页脚
    capabilities: {
      supportsTitle: true,
      supportsContent: true,
      supportsFooter: true
    },
    
    config_schema: {
      columns: {
        type: 'number',
        label: '列数',
        min: 1,
        max: 6,
        default: 3
      },
      spacing: {
        type: 'select',
        label: '间距',
        options: ['紧凑', '正常', '宽松'],
        default: '正常'
      }
    }
  };

  getTemplate(config, hass, entities) {
    const blocks = this._extractContentBlocks(entities);
    const columns = config.columns || 3;
    
    return this._renderCardContainer(`
      ${config.title ? `<div class="cardforge-title">${this._renderSafeHTML(config.title)}</div>` : ''}
      
      <div class="dashboard-grid columns-${columns}">
        ${blocks.map(block => this._renderContentBlock(block, hass)).join('')}
      </div>
      
      ${config.footer ? `<div class="cardforge-text-small">${this._renderSafeHTML(config.footer)}</div>` : ''}
    `, 'dashboard-card', config);
  }

  _extractContentBlocks(entities) {
    const blocks = [];
    Object.entries(entities || {}).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        const nameKey = `${blockId}_name`;
        
        blocks.push({
          id: blockId,
          type: value,
          content: entities[blockId] || '',
          name: entities[nameKey] || '',
          entity_id: entities[blockId] || ''
        });
      }
    });
    return blocks;
  }

  _renderContentBlock(block, hass) {
    return `
      <div class="dashboard-block block-${block.type}">
        ${this._renderBlockContent(block, hass)}
      </div>
    `;
  }

  _renderBlockContent(block, hass) {
    const displayName = block.name || this._getEntityDisplayName(block, hass);
    
    switch (block.type) {
      case 'text':
        return `<div class="text-content">${this._renderSafeHTML(block.content)}</div>`;
      case 'sensor':
        const sensorValue = hass?.states[block.content]?.state || '未知';
        const unit = hass?.states[block.content]?.attributes?.unit_of_measurement || '';
        return `
          <div class="sensor-block">
            <div class="sensor-value">${sensorValue}${unit}</div>
            <div class="sensor-name">${displayName}</div>
          </div>
        `;
      case 'switch':
      case 'light':
        const state = hass?.states[block.content]?.state || 'unavailable';
        const isOn = state === 'on';
        return `
          <div class="device-block ${isOn ? 'on' : 'off'}">
            <div class="device-icon">${isOn ? '💡' : '⚫'}</div>
            <div class="device-name">${displayName}</div>
            <div class="device-state">${isOn ? '开启' : '关闭'}</div>
          </div>
        `;
      default:
        return `<div class="unknown-block">未知类型: ${block.type}</div>`;
    }
  }

  _getEntityDisplayName(block, hass) {
    if (block.name) return block.name;
    if (block.content && hass?.states[block.content]) {
      return hass.states[block.content].attributes?.friendly_name || block.content.split('.')[1] || block.content;
    }
    return block.content || '未知';
  }

  getStyles(config) {
    const spacing = config.spacing === '紧凑' ? 'var(--cf-spacing-sm)' : 
                   config.spacing === '宽松' ? 'var(--cf-spacing-lg)' : 'var(--cf-spacing-md)';
    
    return `
      ${this.getBaseStyles(config)}
      .dashboard-card {
        padding: ${spacing};
      }
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(${config.columns || 3}, 1fr);
        gap: ${spacing};
      }
      .dashboard-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: ${spacing};
        min-height: 80px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: all var(--cf-transition-fast);
      }
      .dashboard-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }
      .text-content {
        font-size: 0.9em;
        line-height: 1.4;
      }
      .sensor-block {
        text-align: center;
      }
      .sensor-value {
        font-size: 1.5em;
        font-weight: bold;
        color: var(--cf-primary-color);
      }
      .sensor-name {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }
      .device-block {
        text-align: center;
      }
      .device-icon {
        font-size: 1.5em;
        margin-bottom: var(--cf-spacing-xs);
      }
      .device-block.on .device-icon {
        color: var(--cf-success-color);
      }
      .device-name {
        font-size: 0.9em;
        font-weight: 500;
      }
      .device-state {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }
    `;
  }
}

export default DashboardCard;
export const manifest = DashboardCard.manifest;