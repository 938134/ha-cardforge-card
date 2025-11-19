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
      show_header: {
        type: 'boolean',
        label: '显示标题栏',
        default: true
      },
      show_footer: {
        type: 'boolean',
        label: '显示页脚栏',
        default: false
      }
    }
  };

  getTemplate(config, hass, entities) {
    const blocks = this._extractContentBlocks(entities);
    const columns = config.columns || 3;
    
    return this._renderCardContainer(`
      ${this._renderIf(config.show_header !== false, this._renderHeader(config, entities))}
      ${this._renderContent(blocks, columns, hass, config)}
      ${this._renderIf(config.show_footer, this._renderFooter(config, entities))}
    `, 'dashboard-card', config);
  }

  _renderHeader(config, entities) {
    const title = entities.title || config.title || '仪表盘';
    const subtitle = entities.subtitle || config.subtitle;
    
    return `
      <div class="dashboard-header">
        <div class="dashboard-title">${this._renderSafeHTML(title)}</div>
        ${subtitle ? `<div class="dashboard-subtitle">${this._renderSafeHTML(subtitle)}</div>` : ''}
      </div>
    `;
  }

  _renderContent(blocks, columns, hass, config) {
    if (blocks.length === 0) {
      return `
        <div class="dashboard-empty">
          <div class="empty-icon">📊</div>
          <div class="empty-text">暂无内容块，请添加内容块</div>
        </div>
      `;
    }

    return `
      <div class="dashboard-content">
        <div class="dashboard-grid columns-${columns}">
          ${blocks.map(block => this._renderContentBlock(block, hass, config)).join('')}
        </div>
      </div>
    `;
  }

  _renderFooter(config, entities) {
    const footerText = entities.footer || config.footer || '';
    
    return footerText ? `
      <div class="dashboard-footer">
        <div class="footer-text">${this._renderSafeHTML(footerText)}</div>
      </div>
    ` : '';
  }

  _extractContentBlocks(entities) {
    const blocks = [];
    Object.entries(entities || {}).forEach(([key, value]) => {
      if (key.endsWith('_type') && !key.startsWith('_')) {
        const blockId = key.replace('_type', '');
        const configKey = `${blockId}_config`;
        
        try {
          blocks.push({
            id: blockId,
            type: value,
            content: entities[blockId] || '',
            config: entities[configKey] ? JSON.parse(entities[configKey]) : {},
            order: parseInt(entities[`${blockId}_order`]) || 0
          });
        } catch (e) {
          console.warn(`解析内容块配置失败: ${blockId}`, e);
        }
      }
    });
    
    return blocks.sort((a, b) => a.order - b.order);
  }

  _renderContentBlock(block, hass, config) {
    const blockConfig = block.config || {};
    const backgroundColor = blockConfig.background || '';
    const textColor = blockConfig.textColor || '';
    const customClass = blockConfig.class || '';
    
    return `
      <div class="dashboard-block block-${block.type} ${customClass}" 
           style="${backgroundColor ? `background: ${backgroundColor};` : ''} ${textColor ? `color: ${textColor};` : ''}">
        ${this._renderBlockContent(block, hass, config)}
      </div>
    `;
  }

  _renderBlockContent(block, hass, config) {
    switch (block.type) {
      case 'text':
        return `
          <div class="text-content">
            <div class="text-block">${this._renderSafeHTML(block.content)}</div>
          </div>
        `;
        
      case 'sensor':
        const entity = hass?.states[block.content];
        const sensorValue = entity?.state || '未知';
        const unit = entity?.attributes?.unit_of_measurement || '';
        const friendlyName = entity?.attributes?.friendly_name || block.content.split('.')[1] || block.content;
        
        return `
          <div class="sensor-block">
            <div class="sensor-value">${sensorValue}${unit}</div>
            <div class="sensor-name">${friendlyName}</div>
            ${entity?.attributes?.icon ? `<div class="sensor-icon">${entity.attributes.icon}</div>` : ''}
          </div>
        `;
        
      case 'weather':
        const weatherEntity = hass?.states[block.content];
        const temperature = weatherEntity?.attributes?.temperature || '--';
        const condition = weatherEntity?.state || '未知';
        
        return `
          <div class="weather-block">
            <div class="weather-temp">${temperature}°</div>
            <div class="weather-condition">${condition}</div>
          </div>
        `;
        
      case 'switch':
        const switchEntity = hass?.states[block.content];
        const isOn = switchEntity?.state === 'on';
        const switchName = switchEntity?.attributes?.friendly_name || block.content.split('.')[1] || block.content;
        
        return `
          <div class="switch-block ${isOn ? 'on' : 'off'}">
            <div class="switch-state">${isOn ? '开' : '关'}</div>
            <div class="switch-name">${switchName}</div>
          </div>
        `;
        
      default:
        return `
          <div class="unknown-block">
            <div class="unknown-icon">❓</div>
            <div class="unknown-text">未知类型: ${block.type}</div>
          </div>
        `;
    }
  }

  getStyles(config) {
    const spacing = config.spacing === '紧凑' ? 'var(--cf-spacing-sm)' : 
                   config.spacing === '宽松' ? 'var(--cf-spacing-lg)' : 'var(--cf-spacing-md)';
    
    return `
      ${this.getEnhancedBaseStyles(config)}
      
      .dashboard-card {
        padding: 0;
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .dashboard-header {
        padding: ${spacing};
        border-bottom: 1px solid var(--cf-border);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      .dashboard-title {
        font-size: 1.2em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0;
      }
      
      .dashboard-subtitle {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }
      
      .dashboard-content {
        flex: 1;
        padding: ${spacing};
        overflow: auto;
      }
      
      .dashboard-grid {
        display: grid;
        gap: ${spacing};
        height: 100%;
      }
      
      .dashboard-grid.columns-1 { grid-template-columns: 1fr; }
      .dashboard-grid.columns-2 { grid-template-columns: repeat(2, 1fr); }
      .dashboard-grid.columns-3 { grid-template-columns: repeat(3, 1fr); }
      .dashboard-grid.columns-4 { grid-template-columns: repeat(4, 1fr); }
      .dashboard-grid.columns-5 { grid-template-columns: repeat(5, 1fr); }
      .dashboard-grid.columns-6 { grid-template-columns: repeat(6, 1fr); }
      
      .dashboard-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: ${spacing};
        min-height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--cf-transition-fast);
      }
      
      .dashboard-block:hover {
        border-color: var(--cf-primary-color);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .text-content {
        width: 100%;
      }
      
      .text-block {
        font-size: 0.9em;
        line-height: 1.4;
      }
      
      .sensor-block {
        text-align: center;
        width: 100%;
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
      
      .sensor-icon {
        font-size: 1.2em;
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .weather-block {
        text-align: center;
        width: 100%;
      }
      
      .weather-temp {
        font-size: 1.8em;
        font-weight: bold;
        color: var(--cf-primary-color);
      }
      
      .weather-condition {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }
      
      .switch-block {
        text-align: center;
        width: 100%;
      }
      
      .switch-block.on {
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-color: var(--cf-primary-color);
      }
      
      .switch-state {
        font-size: 1.2em;
        font-weight: bold;
      }
      
      .switch-block.on .switch-state {
        color: var(--cf-success-color);
      }
      
      .switch-block.off .switch-state {
        color: var(--cf-text-secondary);
      }
      
      .switch-name {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }
      
      .unknown-block {
        text-align: center;
        color: var(--cf-text-secondary);
      }
      
      .unknown-icon {
        font-size: 1.5em;
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .unknown-text {
        font-size: 0.8em;
      }
      
      .dashboard-footer {
        padding: ${spacing};
        border-top: 1px solid var(--cf-border);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }
      
      .footer-text {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        text-align: center;
      }
      
      .dashboard-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        text-align: center;
        height: 100%;
      }
      
      .empty-icon {
        font-size: 3em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }
      
      .empty-text {
        font-size: 0.9em;
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 600px) {
        .dashboard-grid.columns-2,
        .dashboard-grid.columns-3,
        .dashboard-grid.columns-4,
        .dashboard-grid.columns-5,
        .dashboard-grid.columns-6 {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      
      @container cardforge-container (max-width: 400px) {
        .dashboard-grid.columns-2,
        .dashboard-grid.columns-3,
        .dashboard-grid.columns-4,
        .dashboard-grid.columns-5,
        .dashboard-grid.columns-6 {
          grid-template-columns: 1fr;
        }
        
        .dashboard-header,
        .dashboard-content,
        .dashboard-footer {
          padding: var(--cf-spacing-md);
        }
      }
    `;
  }
}

export default DashboardCard;
export const manifest = DashboardCard.manifest;