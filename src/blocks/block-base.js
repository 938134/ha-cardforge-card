// 基础块组件 - 支持3种布局
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { AREAS, ENTITY_ICONS, BLOCK_LAYOUTS } from './block-config.js';

export class BlockBase extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    showName: { type: Boolean },
    showValue: { type: Boolean },
    compact: { type: Boolean },
    layout: { type: String }, // 'horizontal' | 'compact' | 'vertical'
    _displayName: { state: true },
    _displayValue: { state: true },
    _icon: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host { display: block; }
      
      /* 基础块容器 */
      .block-base {
        width: 100%;
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      /* 布局1：水平布局（默认） */
      .layout-horizontal {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        text-align: left;
        min-height: 60px;
      }
      
      .compact.layout-horizontal {
        min-height: 50px;
        gap: var(--cf-spacing-sm);
      }
      
      /* 布局2：紧凑网格布局 */
      .layout-compact {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 4px 8px;
        align-items: center;
        min-height: 60px;
      }
      
      .compact.layout-compact {
        min-height: 50px;
        grid-template-columns: 32px 1fr;
        gap: 2px 6px;
      }
      
      /* 布局3：垂直布局 */
      .layout-vertical {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--cf-spacing-sm);
        text-align: center;
        min-height: 80px;
        justify-content: center;
      }
      
      .compact.layout-vertical {
        min-height: 70px;
        gap: var(--cf-spacing-xs);
      }
      
      /* 块图标 - 通用样式 */
      .block-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      /* 水平布局的图标 */
      .layout-horizontal .block-icon {
        width: 48px;
        height: 48px;
        font-size: 1.5em;
      }
      
      .compact.layout-horizontal .block-icon {
        width: 36px;
        height: 36px;
        font-size: 1.2em;
      }
      
      /* 紧凑布局的图标 */
      .layout-compact .block-icon {
        grid-column: 1;
        grid-row: 1 / span 2;
        width: 40px;
        height: 40px;
        font-size: 1.3em;
        align-self: center;
      }
      
      .compact.layout-compact .block-icon {
        width: 32px;
        height: 32px;
        font-size: 1.1em;
      }
      
      /* 垂直布局的图标 */
      .layout-vertical .block-icon {
        width: 56px;
        height: 56px;
        font-size: 1.8em;
        margin-bottom: var(--cf-spacing-xs);
      }
      
      .compact.layout-vertical .block-icon {
        width: 44px;
        height: 44px;
        font-size: 1.5em;
      }
      
      /* 块内容容器 */
      .block-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 0;
      }
      
      /* 水平布局的内容 */
      .layout-horizontal .block-content {
        flex: 1;
      }
      
      /* 紧凑布局的内容（网格定位） */
      .layout-compact .block-name {
        grid-column: 2;
        grid-row: 1;
        align-self: end;
      }
      
      .layout-compact .block-value {
        grid-column: 2;
        grid-row: 2;
        align-self: start;
      }
      
      /* 垂直布局的内容 */
      .layout-vertical .block-content {
        align-items: center;
        width: 100%;
      }
      
      /* 块名称 */
      .block-name {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-secondary);
        font-weight: var(--cf-font-weight-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: var(--cf-line-height-tight);
      }
      
      .compact .block-name {
        font-size: var(--cf-font-size-xs);
      }
      
      .layout-vertical .block-name {
        white-space: normal;
        text-align: center;
        line-height: var(--cf-line-height-normal);
        margin-bottom: 2px;
      }
      
      /* 块值 */
      .block-value {
        font-size: var(--cf-font-size-xl);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        line-height: var(--cf-line-height-tight);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .compact .block-value {
        font-size: var(--cf-font-size-lg);
      }
      
      .layout-vertical .block-value {
        font-size: var(--cf-font-size-2xl);
        white-space: normal;
        text-align: center;
        line-height: var(--cf-line-height-tight);
      }
      
      .block-unit {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-tertiary);
        font-weight: var(--cf-font-weight-normal);
        margin-left: var(--cf-spacing-xs);
      }
      
      .compact .block-unit {
        font-size: var(--cf-font-size-xs);
      }
      
      /* 状态指示器 */
      .block-status {
        position: absolute;
        top: var(--cf-spacing-sm);
        right: var(--cf-spacing-sm);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--cf-neutral-400);
      }
      
      .block-status.online {
        background: var(--cf-success-color);
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
      }
      
      .block-status.offline {
        background: var(--cf-error-color);
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
      }
      
      .block-status.warning {
        background: var(--cf-warning-color);
        box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
      }
      
      /* 空状态 */
      .empty-state {
        color: var(--cf-text-tertiary);
        font-style: italic;
        font-weight: var(--cf-font-weight-normal);
      }
      
      /* 区域样式 */
      .area-header .block-icon {
        background: rgba(var(--cf-primary-color-rgb), 0.15);
        color: var(--cf-primary-color);
      }
      
      .area-footer .block-icon {
        background: rgba(var(--cf-accent-color-rgb), 0.1);
        color: var(--cf-accent-color);
      }
      
      /* 交互效果 */
      .block-base:hover .block-icon {
        transform: scale(1.05);
        background: rgba(var(--cf-primary-color-rgb), 0.2);
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 480px) {
        /* 在小屏幕上强制垂直布局 */
        .layout-horizontal:not(.force-layout),
        .layout-compact:not(.force-layout) {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--cf-spacing-sm);
          text-align: center;
        }
        
        .layout-horizontal:not(.force-layout) .block-icon,
        .layout-compact:not(.force-layout) .block-icon {
          margin-bottom: var(--cf-spacing-xs);
        }
        
        .layout-horizontal:not(.force-layout) .block-content,
        .layout-compact:not(.force-layout) .block-content {
          align-items: center;
          width: 100%;
        }
        
        .layout-horizontal:not(.force-layout) .block-name,
        .layout-compact:not(.force-layout) .block-name,
        .layout-horizontal:not(.force-layout) .block-value,
        .layout-compact:not(.force-layout) .block-value {
          text-align: center;
          white-space: normal;
        }
      }
      
      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .block-icon {
          background: rgba(var(--cf-primary-color-rgb), 0.2);
          color: var(--cf-text-tertiary);
        }
        
        .area-header .block-icon {
          background: rgba(var(--cf-primary-color-rgb), 0.25);
          color: var(--cf-primary-color);
        }
        
        .area-footer .block-icon {
          background: rgba(var(--cf-accent-color-rgb), 0.15);
          color: var(--cf-accent-color);
        }
      }
    `
  ];

  constructor() {
    super();
    this.block = {};
    this.hass = null;
    this.showName = true;
    this.showValue = true;
    this.compact = false;
    this.layout = 'horizontal'; // 默认水平布局
    this._displayName = '';
    this._displayValue = '';
    this._icon = 'mdi:cube-outline';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block') || changedProperties.has('hass')) {
      this._updateDisplayData();
    }
  }

  render() {
    const hasEntity = this.block?.entity && this.hass?.states?.[this.block.entity];
    const area = this.block?.area || 'content';
    const layout = this.block?.layout || this.layout;
    
    // 确定使用的布局类
    const layoutClass = `layout-${layout}`;
    
    return html`
      <div class="block-base ${layoutClass} ${this.compact ? 'compact' : ''} area-${area}">
        <div class="block-icon">
          <ha-icon .icon=${this._icon}></ha-icon>
        </div>
        
        <div class="block-content">
          ${this.showName && this._displayName ? html`
            <div class="block-name">${this._displayName}</div>
          ` : ''}
          
          ${this.showValue ? html`
            <div class="block-value">
              ${hasEntity ? this._displayValue : html`<span class="empty-state">未配置实体</span>`}
            </div>
          ` : ''}
        </div>
        
        ${hasEntity ? html`
          <div class="block-status ${this._getEntityStatusClass()}"></div>
        ` : ''}
        
        <slot></slot>
      </div>
    `;
  }

  _updateDisplayData() {
    if (!this.block) {
      this._displayName = '';
      this._displayValue = '';
      this._icon = 'mdi:cube-outline';
      return;
    }
    
    // 获取显示名称
    this._displayName = this._getDisplayName();
    
    // 获取显示值
    this._displayValue = this._getDisplayValue();
    
    // 获取图标
    this._icon = this._getIcon();
  }

  _getDisplayName() {
    if (this.block.name) return this.block.name;
    
    if (this.block.entity && this.hass?.states?.[this.block.entity]) {
      const entity = this.hass.states[this.block.entity];
      return entity.attributes?.friendly_name || this.block.entity;
    }
    
    return this.block.entity ? '实体块' : '自定义块';
  }

  _getDisplayValue() {
    if (!this.block.entity || !this.hass?.states?.[this.block.entity]) {
      return '';
    }
    
    const entity = this.hass.states[this.block.entity];
    const state = entity.state;
    const unit = entity.attributes?.unit_of_measurement || '';
    
    return unit ? `${state} ${unit}` : state;
  }

  _getIcon() {
    if (this.block.icon) return this.block.icon;
    
    if (!this.block.entity) return 'mdi:cube-outline';
    
    const domain = this.block.entity.split('.')[0];
    return ENTITY_ICONS[domain] || 'mdi:cube';
  }

  _getEntityStatusClass() {
    if (!this.block.entity || !this.hass?.states?.[this.block.entity]) {
      return '';
    }
    
    const entity = this.hass.states[this.block.entity];
    const state = entity.state.toLowerCase();
    
    if (state === 'on' || state === 'home' || state === 'unlocked') {
      return 'online';
    } else if (state === 'off' || state === 'away' || state === 'locked') {
      return 'offline';
    } else if (state === 'unavailable' || state === 'unknown') {
      return 'warning';
    }
    
    return '';
  }
}

if (!customElements.get('block-base')) {
  customElements.define('block-base', BlockBase);
}
