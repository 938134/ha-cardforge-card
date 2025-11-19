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
    
    layout_type: 'free',
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
    
    const header = config.show_header !== false ? this._renderHeader(config, hass, entities) : '';
    const content = this._renderContent(blocks, columns, hass, config);
    const footer = config.show_footer ? this._renderFooter(config, hass, entities) : '';
    
    return this._renderCardContainer(`
      ${header}
      ${content}
      ${footer}
    `, 'dashboard-card', config);
  }

  _renderHeader(config, hass, entities) {
    const title = this._getCardValue(hass, entities, 'title') || '仪表盘';
    const subtitle = this._getCardValue(hass, entities, 'subtitle');
    
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
          ${blocks.map(block => this._renderContentBlock(block, hass)).join('')}
        </div>
      </div>
    `;
  }

  _renderFooter(config, hass, entities) {
    const footerText = this._getCardValue(hass, entities, 'footer') || '';
    
    return footerText ? `
      <div class="dashboard-footer">
        <div class="footer-text">${this._renderSafeHTML(footerText)}</div>
      </div>
    ` : '';
  }

  _extractContentBlocks(entities) {
    const blocks = [];
    
    if (!entities) return blocks;
    
    Object.entries(entities).forEach(([key, value]) => {
      if (key.endsWith('_type') && 
          !['title', 'subtitle', 'footer', '_layout_columns', '_layout_style', '_layout_spacing'].some(prefix => key.startsWith(prefix))) {
        
        const blockId = key.replace('_type', '');
        
        // 直接使用字符串值
        const blockType = this._getStringValue(value);
        const blockContent = this._getStringValue(entities[blockId] || '');
        
        let blockConfig = {};
        const configKey = `${blockId}_config`;
        if (entities[configKey]) {
          try {
            const configStr = this._getStringValue(entities[configKey]);
            blockConfig = JSON.parse(configStr);
          } catch (e) {
            console.warn(`解析内容块配置失败: ${blockId}`, e);
          }
        }
        
        const order = parseInt(this._getStringValue(entities[`${blockId}_order`])) || 0;
        
        blocks.push({
          id: blockId,
          type: blockType,
          content: blockContent,
          config: blockConfig,
          order: order
        });
      }
    });
    
    return blocks.sort((a, b) => a.order - b.order);
  }

  _getStringValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      // 如果是实体对象，直接返回 _source（实体ID）
      return value._source || value.state || '';
    }
    return String(value);
  }

  _renderContentBlock(block, hass) {
    const blockConfig = block.config || {};
    const backgroundColor = blockConfig.background || '';
    const textColor = blockConfig.textColor || '';
    const customClass = blockConfig.class || '';
    
    const style = [];
    if (backgroundColor) style.push(`background: ${backgroundColor}`);
    if (textColor) style.push(`color: ${textColor}`);
    
    return `
      <div class="dashboard-block block-${block.type} ${customClass}" 
           style="${style.join('; ')}">
        ${this._renderBlockContent(block, hass)}
      </div>
    `;
  }

  _renderBlockContent(block, hass) {
    const blockType = block.type || 'text';
    const content = block.content || '';
    
    // 获取实体状态值
    let displayValue = content;
    let entity = null;
    
    // 如果是实体ID（包含点号），从hass获取状态
    if (content && content.includes('.') && hass?.states) {
      entity = hass.states[content];
      if (entity) {
        displayValue = entity.state;
      }
    }
    
    switch (blockType) {
      case 'text':
        return `
          <div class="text-content">
            <div class="text-block">${this._renderSafeHTML(displayValue)}</div>
          </div>
        `;
        
      case 'sensor':
        if (!entity) {
          const entityName = content.split('.')[1] || content;
          return `
            <div class="sensor-block unavailable">
              <div class="sensor-value">--</div>
              <div class="sensor-name">${entityName}</div>
              <div class="sensor-status">实体未找到</div>
            </div>
          `;
        }
        
        const sensorValue = entity.state || '未知';
        const unit = entity.attributes?.unit_of_measurement || '';
        const friendlyName = entity.attributes?.friendly_name || content.split('.')[1] || content;
        
        return `
          <div class="sensor-block">
            <div class="sensor-value">${sensorValue}${unit}</div>
            <div class="sensor-name">${friendlyName}</div>
          </div>
        `;
        
      case 'weather':
        if (!entity) {
          return `
            <div class="weather-block unavailable">
              <div class="weather-temp">--</div>
              <div class="weather-condition">实体未找到</div>
            </div>
          `;
        }
        
        const temperature = entity.attributes?.temperature || '--';
        const condition = entity.state || '未知';
        
        return `
          <div class="weather-block">
            <div class="weather-temp">${temperature}°</div>
            <div class="weather-condition">${condition}</div>
          </div>
        `;
        
      case 'switch':
        if (!entity) {
          const switchName = content.split('.')[1] || content;
          return `
            <div class="switch-block unavailable">
              <div class="switch-state">--</div>
              <div class="switch-name">${switchName}</div>
            </div>
          `;
        }
        
        const isOn = entity.state === 'on';
        const switchName = entity.attributes?.friendly_name || content.split('.')[1] || content;
        
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
            <div class="unknown-text">未知类型: ${blockType}</div>
          </div>
        `;
    }
  }

  // 重写 _getCardValue 方法
  _getCardValue(hass, entities, key, defaultValue = '') {
    const source = this._getEntityValue(entities, key);
    if (!source) return defaultValue;
    
    // 如果是实体对象，获取实体ID
    const entityId = this._getStringValue(source);
    
    // 如果是实体ID，从hass获取状态
    if (entityId && entityId.includes('.') && hass?.states?.[entityId]) {
      const entity = hass.states[entityId];
      return entity.state || entityId;
    }
    
    return entityId;
  }

  _getEntityValue(entities, key, defaultValue = '') {
    if (!entities || !entities[key]) return defaultValue;
    return this._getStringValue(entities[key]);
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
        word-break: break-word;
      }
      
      .sensor-block, .weather-block, .switch-block {
        text-align: center;
        width: 100%;
      }
      
      .sensor-block.unavailable, .weather-block.unavailable, .switch-block.unavailable {
        opacity: 0.6;
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
      
      .sensor-status {
        font-size: 0.7em;
        color: var(--cf-error-color);
        margin-top: var(--cf-spacing-xs);
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
        padding: var(--cf-spacing-sm);
      }
      
      .unknown-icon {
        font-size: 1.5em;
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .unknown-text {
        font-size: 0.9em;
        margin-bottom: var(--cf-spacing-xs);
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