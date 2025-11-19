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
      },
      show_title: {
        type: 'boolean',
        label: '显示标题',
        default: true
      },
      show_footer: {
        type: 'boolean',
        label: '显示页脚',
        default: false
      }
    }
  };

  getTemplate(config, hass, entities) {
    const blocks = this._extractContentBlocks(entities);
    const columns = config.columns || 3;
    
    // 获取标题和页脚内容
    const title = this._getCardValue(hass, entities, 'title', '仪表盘');
    const footer = this._getCardValue(hass, entities, 'footer', '');
    
    return this._renderCardContainer(`
      ${config.show_title !== false ? `
        <div class="dashboard-title cardforge-title">
          ${this._renderSafeHTML(title)}
        </div>
      ` : ''}
      
      <div class="dashboard-content">
        <div class="dashboard-grid columns-${columns}">
          ${blocks.map(block => this._renderContentBlock(block, hass)).join('')}
        </div>
      </div>
      
      ${config.show_footer && footer ? `
        <div class="dashboard-footer cardforge-text-small">
          ${this._renderSafeHTML(footer)}
        </div>
      ` : ''}
    `, 'dashboard-card', config);
  }

  _extractContentBlocks(entities) {
    const blocks = [];
    Object.entries(entities || {}).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        try {
          const configKey = `${blockId}_config`;
          blocks.push({
            id: blockId,
            type: value,
            content: entities[blockId] || '',
            config: entities[configKey] ? JSON.parse(entities[configKey]) : {},
            order: parseInt(blockId.split('_').pop()) || 0
          });
        } catch (e) {
          console.warn(`解析内容块配置失败: ${blockId}`, e);
        }
      }
    });
    
    // 按顺序排序
    return blocks.sort((a, b) => a.order - b.order);
  }

  _renderContentBlock(block, hass) {
    return `
      <div class="dashboard-block block-${block.type}" data-block-id="${block.id}">
        ${this._renderBlockContent(block, hass)}
      </div>
    `;
  }

  _renderBlockContent(block, hass) {
    switch (block.type) {
      case 'text':
        return `<div class="text-content">${this._renderSafeHTML(block.content)}</div>`;
        
      case 'sensor':
        const entity = hass?.states[block.content];
        const sensorValue = entity?.state || '未知';
        const friendlyName = entity?.attributes?.friendly_name || block.content.split('.')[1] || block.content;
        return `
          <div class="sensor-block">
            <div class="sensor-value">${sensorValue}</div>
            <div class="sensor-name">${this._renderSafeHTML(friendlyName)}</div>
          </div>
        `;
        
      case 'entity':
        return this._renderEntityBlock(block, hass);
        
      case 'markdown':
        return `<div class="markdown-content">${this._renderSafeHTML(block.content)}</div>`;
        
      default:
        return `<div class="unknown-block">未知类型: ${block.type}</div>`;
    }
  }

  _renderEntityBlock(block, hass) {
    const entity = hass?.states[block.content];
    if (!entity) {
      return `<div class="entity-unavailable">实体不可用: ${block.content}</div>`;
    }
    
    const domain = block.content.split('.')[0];
    const friendlyName = entity.attributes?.friendly_name || block.content;
    const state = entity.state;
    
    return `
      <div class="entity-block domain-${domain}">
        <div class="entity-icon">${this._getEntityIcon(domain)}</div>
        <div class="entity-info">
          <div class="entity-name">${this._renderSafeHTML(friendlyName)}</div>
          <div class="entity-state">${this._renderSafeHTML(state)}</div>
        </div>
      </div>
    `;
  }

  _getEntityIcon(domain) {
    const icons = {
      'light': '💡',
      'sensor': '📊',
      'switch': '🔌',
      'climate': '🌡️',
      'media_player': '📺',
      'person': '👤',
      'binary_sensor': '📟'
    };
    return icons[domain] || '🏷️';
  }

  getStyles(config) {
    const spacing = config.spacing === '紧凑' ? 'var(--cf-spacing-sm)' : 
                   config.spacing === '宽松' ? 'var(--cf-spacing-lg)' : 'var(--cf-spacing-md)';
    
    return `
      ${this.getEnhancedBaseStyles(config)}
      
      .dashboard-card {
        padding: ${spacing};
        gap: ${spacing};
      }
      
      .dashboard-title {
        text-align: center;
        margin-bottom: ${spacing};
      }
      
      .dashboard-content {
        flex: 1;
      }
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(${config.columns || 3}, 1fr);
        gap: ${spacing};
        align-items: start;
      }
      
      .dashboard-footer {
        text-align: center;
        margin-top: ${spacing};
        padding-top: ${spacing};
        border-top: 1px solid var(--cf-border);
      }
      
      .dashboard-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: ${spacing};
        min-height: 80px;
        transition: all var(--cf-transition-fast);
      }
      
      .dashboard-block:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .text-content {
        font-size: 0.9em;
        line-height: 1.4;
      }
      
      .sensor-block {
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
      }
      
      .sensor-value {
        font-size: 1.5em;
        font-weight: bold;
        color: var(--cf-primary-color);
        line-height: 1.2;
      }
      
      .sensor-name {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }
      
      .entity-block {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
      }
      
      .entity-icon {
        font-size: 1.5em;
        opacity: 0.8;
      }
      
      .entity-info {
        flex: 1;
      }
      
      .entity-name {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .entity-state {
        font-size: 1.1em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }
      
      .markdown-content {
        font-size: 0.85em;
        line-height: 1.4;
      }
      
      .entity-unavailable {
        color: var(--cf-error-color);
        font-size: 0.8em;
        text-align: center;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .dashboard-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }
}

export default DashboardCard;
export const manifest = DashboardCard.manifest;