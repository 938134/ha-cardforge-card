// src/plugins/dashboard-card.js
import { BasePlugin } from '../core/base-plugin.js';

class DashboardCardPlugin extends BasePlugin {
  static manifest = {
    id: 'dashboard-card',
    name: '数据看板',
    description: '支持标题、内容和页脚的灵活看板卡片',
    version: '1.0.0',
    category: 'dashboard',
    icon: '📊',
    author: 'CardForge',
    config_schema: {
      layout: {
        type: 'select',
        label: '布局方式',
        options: ['vertical', 'horizontal', 'grid'],
        default: 'vertical',
        required: true
      },
      show_header: {
        type: 'boolean',
        label: '显示标题栏',
        default: true,
        required: false
      },
      show_footer: {
        type: 'boolean',
        label: '显示页脚栏',
        default: true,
        required: false
      },
      card_style: {
        type: 'select',
        label: '卡片样式',
        options: ['default', 'minimal', 'bordered', 'filled'],
        default: 'default',
        required: false
      }
    }
  };

  getTemplate(config, hass, entities) {
    const header = this._renderHeader(config, hass, entities);
    const content = this._renderContent(config, hass, entities);
    const footer = this._renderFooter(config, hass, entities);
    
    const layoutClass = `layout-${config.layout || 'vertical'}`;
    const styleClass = `style-${config.card_style || 'default'}`;

    return `
      <div class="dashboard-card ${layoutClass} ${styleClass}">
        ${config.show_header !== false ? header : ''}
        <div class="dashboard-content">
          ${content}
        </div>
        ${config.show_footer !== false ? footer : ''}
      </div>
    `;
  }

  _renderHeader(config, hass, entities) {
    const title = this._getCardValue(hass, entities, 'header', '数据看板');
    const icon = entities.header_icon || '🏷️';

    if (!title) return '';

    return `
      <div class="dashboard-header">
        <div class="header-icon">${icon}</div>
        <div class="header-text">
          <div class="header-title">${this._renderSafeHTML(title)}</div>
        </div>
      </div>
    `;
  }

  _renderContent(config, hass, entities) {
    const contentItems = this._discoverContentItems(entities);
    
    if (contentItems.length === 0) {
      return this._renderEmpty('暂无内容配置', '📝');
    }

    const itemsHtml = contentItems.map((item, index) => 
      this._renderContentItem(item, hass, index)
    ).join('');

    return itemsHtml;
  }

  _discoverContentItems(entities) {
    const items = [];
    let index = 1;
    
    while (entities[`content_${index}`] || entities[`item_${index}`]) {
      const baseKey = entities[`content_${index}`] ? `content_${index}` : `item_${index}`;
      items.push({
        value: entities[baseKey],
        label: entities[`${baseKey}_label`] || entities[`${baseKey}_name`] || `项目 ${index}`,
        icon: entities[`${baseKey}_icon`] || '📊',
        key: baseKey
      });
      index++;
    }
    
    return items;
  }

  _renderContentItem(item, hass, index) {
    const displayValue = this._getFlexibleValue(hass, item.value, '--');
    const formattedValue = this._formatValue(displayValue, item.value);
    
    return `
      <div class="content-item" data-index="${index}">
        <div class="item-icon">${item.icon}</div>
        <div class="item-content">
          <div class="item-label">${this._renderSafeHTML(item.label)}</div>
          <div class="item-value">${formattedValue}</div>
        </div>
        ${this._renderItemBadge(item, hass)}
      </div>
    `;
  }

  _renderItemBadge(item, hass) {
    if (item.value.includes('.')) {
      const entity = hass?.states?.[item.value];
      if (entity) {
        const state = entity.state;
        const isOn = state === 'on' || state === 'home' || state === 'open';
        const isOff = state === 'off' || state === 'away' || state === 'closed';
        const isUnavailable = state === 'unavailable' || state === 'unknown';
        
        if (isUnavailable) {
          return '<div class="item-badge unavailable">离线</div>';
        } else if (isOn || isOff) {
          return `<div class="item-badge ${isOn ? 'on' : 'off'}">${isOn ? '开' : '关'}</div>`;
        }
      }
    }
    return '';
  }

  _renderFooter(config, hass, entities) {
    const footerText = this._getCardValue(hass, entities, 'footer', '');
    const footerIcon = entities.footer_icon || '📄';

    if (!footerText) return '';

    return `
      <div class="dashboard-footer">
        <div class="footer-content">
          <div class="footer-text">
            <span class="footer-icon">${footerIcon}</span>
            ${this._renderSafeHTML(footerText)}
          </div>
        </div>
      </div>
    `;
  }

  _formatValue(value, source) {
    if (value === '--') return value;
    
    // 根据源内容智能格式化
    if (source.includes('temperature') || source.includes('temp')) {
      const num = parseFloat(value);
      return isNaN(num) ? value : `${num}°C`;
    }
    if (source.includes('humidity')) {
      const num = parseFloat(value);
      return isNaN(num) ? value : `${num}%`;
    }
    
    return this._renderSafeHTML(value);
  }

  getStyles(config) {
    const baseStyles = this.getBaseStyles(config);
    
    return `
      ${baseStyles}
      
      .dashboard-card {
        display: flex;
        flex-direction: column;
        min-height: 120px;
        background: var(--card-background-color);
        border-radius: var(--cf-radius-lg);
        overflow: hidden;
        container-type: inline-size;
      }
      
      .layout-horizontal .dashboard-content {
        display: flex;
        flex-direction: row;
        overflow-x: auto;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
      }
      
      .layout-horizontal .content-item {
        min-width: 140px;
        flex-shrink: 0;
      }
      
      .layout-grid .dashboard-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-lg);
      }
      
      .layout-vertical .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-lg);
      }
      
      .dashboard-header {
        display: flex;
        align-items: center;
        padding: var(--cf-spacing-lg);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-bottom: 1px solid var(--cf-border);
        gap: var(--cf-spacing-md);
      }
      
      .header-icon {
        font-size: 1.5em;
        flex-shrink: 0;
      }
      
      .header-text {
        flex: 1;
        min-width: 0;
      }
      
      .header-title {
        font-weight: 600;
        font-size: 1.1em;
        color: var(--cf-text-primary);
      }
      
      .content-item {
        display: flex;
        align-items: center;
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
        border-radius: var(--cf-radius-md);
        border: 1px solid var(--cf-border);
        gap: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
        position: relative;
      }
      
      .content-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }
      
      .item-icon {
        font-size: 1.5em;
        flex-shrink: 0;
        width: 40px;
        text-align: center;
      }
      
      .item-content {
        flex: 1;
        min-width: 0;
      }
      
      .item-label {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .item-value {
        font-weight: 600;
        font-size: 1.1em;
        color: var(--cf-text-primary);
      }
      
      .item-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.7em;
        padding: 2px 6px;
        border-radius: 10px;
        background: var(--cf-text-secondary);
        color: white;
      }
      
      .item-badge.on {
        background: var(--cf-success-color);
      }
      
      .item-badge.off {
        background: var(--cf-text-secondary);
      }
      
      .item-badge.unavailable {
        background: var(--cf-error-color);
      }
      
      .dashboard-footer {
        padding: var(--cf-spacing-md) var(--cf-spacing-lg);
        background: rgba(var(--cf-rgb-primary), 0.03);
        border-top: 1px solid var(--cf-border);
      }
      
      .footer-content {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.85em;
        color: var(--cf-text-secondary);
      }
      
      .footer-text {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
      }
      
      .footer-icon {
        font-size: 1.1em;
      }
      
      .style-minimal .dashboard-header,
      .style-minimal .dashboard-footer {
        background: transparent;
        border: none;
      }
      
      .style-minimal .content-item {
        background: transparent;
        border: 1px solid transparent;
      }
      
      .style-bordered .dashboard-card {
        border: 2px solid var(--cf-border);
      }
      
      .style-bordered .content-item {
        border: 1px solid var(--cf-border);
      }
      
      .style-filled .content-item {
        background: rgba(var(--cf-rgb-primary), 0.1);
        border-color: rgba(var(--cf-rgb-primary), 0.2);
      }
      
      @container (max-width: 400px) {
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--cf-spacing-sm);
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: 1fr;
        }
      }
      
      @media (prefers-color-scheme: dark) {
        .dashboard-header {
          background: rgba(var(--cf-rgb-primary), 0.1);
        }
        
        .dashboard-footer {
          background: rgba(var(--cf-rgb-primary), 0.05);
        }
        
        .content-item {
          background: var(--cf-dark-surface);
        }
        
        .style-filled .content-item {
          background: rgba(var(--cf-rgb-primary), 0.15);
        }
      }
    `;
  }
}

export default DashboardCardPlugin;
export const manifest = DashboardCardPlugin.manifest;