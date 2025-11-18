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
    
    return `
      <div class="cardforge-responsive-container dashboard-card columns-${columns}">
        <div class="dashboard-grid">
          ${blocks.map(block => this._renderContentBlock(block, hass)).join('')}
        </div>
      </div>
    `;
  }

  _extractContentBlocks(entities) {
    const blocks = [];
    Object.entries(entities || {}).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        blocks.push({
          id: blockId,
          type: value,
          content: entities[blockId] || ''
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
    switch (block.type) {
      case 'text':
        return `<div class="text-content">${block.content}</div>`;
      case 'sensor':
        const sensorValue = hass?.states[block.content]?.state || '未知';
        return `
          <div class="sensor-block">
            <div class="sensor-value">${sensorValue}</div>
            <div class="sensor-name">${block.content.split('.')[1] || block.content}</div>
          </div>
        `;
      default:
        return `<div class="unknown-block">未知类型: ${block.type}</div>`;
    }
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
      }
      .text-content {
        font-size: 0.9em;
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
    `;
  }
}

export default DashboardCard;
export const manifest = DashboardCard.manifest;