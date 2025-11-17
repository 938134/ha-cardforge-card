// src/plugins/dashboard-card.js
import { BasePlugin } from '../core/base-plugin.js';

export default class DashboardCardPlugin extends BasePlugin {
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
    },
    entity_requirements: [
      {
        key: 'header_title',
        description: '标题文本或实体',
        required: false
      },
      {
        key: 'footer_text',
        description: '页脚文本或实体',
        required: false
      }
    ]
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
    const title = this._getCardValue(hass, entities, 'header_title', '数据看板');
    const subtitle = this._getCardValue(hass, entities, 'header_subtitle', '');
    const icon = entities.header_icon || '📊';

    return `
      <div class="dashboard-header">
        <div class="header-icon">${icon}</div>
        <div class="header-text">
          <div class="header-title">${this._renderSafeHTML(title)}</div>
          ${subtitle ? `<div class="header-subtitle">${this._renderSafeHTML(subtitle)}</div>` : ''}
        </div>
        ${this._renderHeaderActions(config, hass, entities)}
      </div>
    `;
  }

  _renderHeaderActions(config, hass, entities) {
    const actions = [];
    
    // 动态添加操作按钮
    for (let i = 1; i <= 3; i++) {
      const actionKey = `header_action_${i}`;
      if (entities[actionKey]) {
        const actionConfig = this._parseActionConfig(entities[actionKey]);
        if (actionConfig) {
          actions.push(`
            <button class="header-action" data-action="${actionConfig.action}" data-entity="${actionConfig.entity}">
              ${actionConfig.icon || '⚡'}
            </button>
          `);
        }
      }
    }

    return actions.length > 0 ? `
      <div class="header-actions">
        ${actions.join('')}
      </div>
    ` : '';
  }

  _renderContent(config, hass, entities) {
    const contentItems = [];
    
    // 解析内容配置
    const contentConfig = this._parseContentConfig(entities);
    
    contentConfig.forEach((item, index) => {
      contentItems.push(this._renderContentItem(item, hass, index));
    });

    if (contentItems.length === 0) {
      return this._renderEmpty('暂无内容配置', '📝');
    }

    return contentItems.join('');
  }

  _parseContentConfig(entities) {
    const items = [];
    let index = 1;
    
    while (true) {
      const baseKey = `content_${index}`;
      const valueKey = `${baseKey}_value`;
      const labelKey = `${baseKey}_label`;
      const iconKey = `${baseKey}_icon`;
      const typeKey = `${baseKey}_type`;
      
      if (!entities[valueKey] && !entities[baseKey]) {
        break;
      }
      
      // 支持两种配置方式：content_1 或 content_1_value
      const value = entities[valueKey] || entities[baseKey];
      const label = entities[labelKey] || `项目 ${index}`;
      const icon = entities[iconKey] || this._getDefaultIconForValue(value);
      const type = entities[typeKey] || 'text';
      
      items.push({
        value,
        label,
        icon,
        type,
        key: baseKey
      });
      
      index++;
    }
    
    return items;
  }

  _renderContentItem(item, hass, index) {
    const displayValue = this._getFlexibleValue(hass, item.value, '--');
    const formattedValue = this._formatValue(displayValue, item.type);
    
    return `
      <div class="content-item" data-type="${item.type}" data-index="${index}">
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
    if (item.type === 'entity' && item.value.includes('.')) {
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
    const footerText = this._getCardValue(hass, entities, 'footer_text', '');
    const footerIcon = entities.footer_icon || '🕒';
    const timestamp = this._getCardValue(hass, entities, 'footer_timestamp', '');

    if (!footerText && !timestamp) {
      return '';
    }

    return `
      <div class="dashboard-footer">
        <div class="footer-content">
          ${footerText ? `
            <div class="footer-text">
              <span class="footer-icon">${footerIcon}</span>
              ${this._renderSafeHTML(footerText)}
            </div>
          ` : ''}
          ${timestamp ? `
            <div class="footer-timestamp">
              ${this._renderSafeHTML(timestamp)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _formatValue(value, type) {
    if (value === '--') return value;
    
    switch (type) {
      case 'number':
        const num = parseFloat(value);
        return isNaN(num) ? value : num.toLocaleString();
      case 'percentage':
        const percent = parseFloat(value);
        return isNaN(percent) ? value : `${percent}%`;
      case 'temperature':
        const temp = parseFloat(value);
        return isNaN(temp) ? value : `${temp}°C`;
      case 'currency':
        const amount = parseFloat(value);
        return isNaN(amount) ? value : `¥${amount.toLocaleString()}`;
      default:
        return this._renderSafeHTML(value);
    }
  }

  _getDefaultIconForValue(value) {
    if (!value) return '📄';
    
    if (value.includes('temperature') || value.includes('temp')) return '🌡️';
    if (value.includes('humidity')) return '💧';
    if (value.includes('pressure')) return '🌪️';
    if (value.includes('light')) return '💡';
    if (value.includes('power')) return '⚡';
    if (value.includes('door') || value.includes('window')) return '🚪';
    if (value.includes('motion')) return '👤';
    if (value.includes('water')) return '💦';
    
    return '📊';
  }

  _parseActionConfig(actionConfig) {
    // 解析动作配置格式: "action:turn_on,entity:light.living_room,icon:💡"
    try {
      const config = {};
      actionConfig.split(',').forEach(part => {
        const [key, value] = part.split(':');
        if (key && value) {
          config[key.trim()] = value.trim();
        }
      });
      return config;
    } catch (error) {
      console.warn('动作配置解析失败:', actionConfig);
      return null;
    }
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
      
      /* 布局变体 */
      .layout-horizontal .dashboard-content {
        display: flex;
        flex-direction: row;
        overflow-x: auto;
      }
      
      .layout-horizontal .content-item {
        min-width: 120px;
        flex-shrink: 0;
      }
      
      .layout-grid .dashboard-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: var(--cf-spacing-md);
      }
      
      /* 标题样式 */
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
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .header-subtitle {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }
      
      .header-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        flex-shrink: 0;
      }
      
      .header-action {
        background: none;
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-sm);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        font-size: 1.1em;
      }
      
      .header-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }
      
      /* 内容样式 */
      .dashboard-content {
        flex: 1;
        padding: var(--cf-spacing-lg);
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
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
      
      /* 页脚样式 */
      .dashboard-footer {
        padding: var(--cf-spacing-md) var(--cf-spacing-lg);
        background: rgba(var(--cf-rgb-primary), 0.03);
        border-top: 1px solid var(--cf-border);
      }
      
      .footer-content {
        display: flex;
        justify-content: space-between;
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
      
      /* 样式变体 */
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
      
      /* 响应式设计 */
      @container (max-width: 400px) {
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--cf-spacing-sm);
        }
        
        .header-actions {
          align-self: stretch;
          justify-content: space-between;
        }
        
        .layout-grid .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .footer-content {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
          align-items: flex-start;
        }
      }
      
      /* 深色模式适配 */
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