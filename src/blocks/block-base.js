// 基础块组件 - 统一渲染方案
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { AREAS, ENTITY_ICONS } from './block-config.js';

export class BlockBase extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    showName: { type: Boolean },
    showValue: { type: Boolean },
    layout: { type: String },  // horizontal, vertical, compact
    area: { type: String },    // header, content, footer
    _displayName: { state: true },
    _displayValue: { state: true },
    _icon: { state: true },
    _hasEntity: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host { 
        display: block; 
        box-sizing: border-box;
      }
      
      /* ===== 基础容器 ===== */
      .block-base {
        width: 100%;
        height: 100%;
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
        position: relative;
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        box-sizing: border-box;
        overflow: hidden;
      }
      
      /* 区域样式 */
      .block-base.area-header {
        background: rgba(var(--cf-primary-color-rgb), 0.05);
        border-color: rgba(var(--cf-primary-color-rgb), 0.3);
      }
      
      .block-base.area-footer {
        background: rgba(var(--cf-accent-color-rgb), 0.05);
        border-color: rgba(var(--cf-accent-color-rgb), 0.3);
      }
      
      /* ===== 水平布局 (100%宽度) ===== */
      .block-base.layout-horizontal {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 60px;
        min-height: 60px;
        padding: 0 12px;
      }
      
      .block-base.layout-horizontal .block-icon {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
        font-size: 1.5em;
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      .block-base.layout-horizontal .block-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 0;
        gap: 8px;
      }
      
      .block-base.layout-horizontal .block-name {
        font-size: var(--cf-font-size-base);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        min-width: 0;
      }
      
      .block-base.layout-horizontal .block-value {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100px;
      }
      
      /* ===== 垂直布局 (自适应) ===== */
      .block-base.layout-vertical {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 140px;
        min-height: 120px;
        padding: 12px;
        gap: 8px;
        text-align: center;
      }
      
      .block-base.layout-vertical .block-icon {
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
        font-size: 1.8em;
        margin-bottom: 8px;
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      .block-base.layout-vertical .block-name {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-secondary);
        font-weight: var(--cf-font-weight-medium);
        text-align: center;
        margin: 4px 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.3;
        max-height: 2.6em;
      }
      
      .block-base.layout-vertical .block-value {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        text-align: center;
        margin-top: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
      
      /* ===== 紧凑布局 (自适应) ===== */
      .block-base.layout-compact {
        display: grid;
        grid-template-columns: 40px 1fr;
        grid-template-rows: auto auto;
        gap: 4px 12px;
        align-items: center;
        width: 160px;
        min-height: 80px;
        padding: 10px;
      }
      
      .block-base.layout-compact .block-icon {
        grid-column: 1;
        grid-row: 1 / span 2;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
        font-size: 1.3em;
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      .block-base.layout-compact .block-name {
        grid-column: 2;
        grid-row: 1;
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
        font-weight: var(--cf-font-weight-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        align-self: end;
        line-height: 1.2;
      }
      
      .block-base.layout-compact .block-value {
        grid-column: 2;
        grid-row: 2;
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-semibold);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        align-self: start;
        line-height: 1.2;
      }
      
      /* ===== 通用样式 ===== */
      .block-unit {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
        font-weight: var(--cf-font-weight-normal);
        margin-left: 2px;
      }
      
      /* 状态指示器 */
      .block-status {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--cf-neutral-400);
      }
      
      .block-status.online {
        background: var(--cf-success-color);
        box-shadow: 0 0 0 1px rgba(76, 175, 80, 0.2);
      }
      
      .block-status.offline {
        background: var(--cf-error-color);
        box-shadow: 0 0 0 1px rgba(244, 67, 54, 0.2);
      }
      
      .block-status.warning {
        background: var(--cf-warning-color);
        box-shadow: 0 0 0 1px rgba(255, 152, 0, 0.2);
      }
      
      /* 空状态 */
      .empty-state {
        color: var(--cf-text-tertiary);
        font-style: italic;
        font-weight: var(--cf-font-weight-normal);
        font-size: var(--cf-font-size-sm);
      }
      
      /* 交互效果 */
      .block-base:hover {
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-md);
        border-color: var(--cf-primary-color);
      }
      
      .block-base:hover .block-icon {
        transform: scale(1.05);
        background: rgba(var(--cf-primary-color-rgb), 0.2);
      }
      
      /* ===== 块预览模式（用于块管理界面）===== */
      :host(.block-preview) .block-base.layout-compact {
        width: 100% !important;
        min-width: 100% !important;
        grid-template-columns: 40px 1fr;
        gap: 4px 12px;
        padding: 10px;
      }
      
      :host(.block-preview) .block-base.layout-compact .block-name {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-primary);
        font-weight: var(--cf-font-weight-medium);
      }
      
      :host(.block-preview) .block-base.layout-compact .block-value {
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-semibold);
      }
      
      /* ===== 响应式设计 ===== */
      @container cardforge-container (max-width: 768px) {
        .block-base.layout-horizontal {
          height: 56px;
          min-height: 56px;
        }
        
        .block-base.layout-horizontal .block-icon {
          width: 44px;
          height: 44px;
          font-size: 1.4em;
        }
        
        .block-base.layout-horizontal .block-name {
          font-size: var(--cf-font-size-sm);
        }
        
        .block-base.layout-horizontal .block-value {
          font-size: var(--cf-font-size-md);
          max-width: 80px;
        }
        
        .block-base.layout-vertical {
          width: 130px;
          min-height: 110px;
        }
        
        .block-base.layout-vertical .block-icon {
          width: 50px;
          height: 50px;
          font-size: 1.6em;
        }
        
        .block-base.layout-compact {
          width: 150px;
          min-height: 75px;
        }
        
        :host(.block-preview) .block-base.layout-compact {
          grid-template-columns: 36px 1fr;
          gap: 4px 10px;
          padding: 8px;
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .block-base.layout-horizontal {
          height: 52px;
          min-height: 52px;
          padding: 0 10px;
          gap: 10px;
        }
        
        .block-base.layout-horizontal .block-icon {
          width: 40px;
          height: 40px;
          font-size: 1.3em;
        }
        
        .block-base.layout-horizontal .block-name {
          font-size: var(--cf-font-size-xs);
        }
        
        .block-base.layout-horizontal .block-value {
          font-size: var(--cf-font-size-sm);
          max-width: 60px;
        }
        
        .block-base.layout-vertical {
          width: 120px;
          min-height: 100px;
          padding: 10px;
        }
        
        .block-base.layout-vertical .block-icon {
          width: 48px;
          height: 48px;
          font-size: 1.5em;
        }
        
        .block-base.layout-vertical .block-name {
          font-size: var(--cf-font-size-xs);
        }
        
        .block-base.layout-vertical .block-value {
          font-size: var(--cf-font-size-md);
        }
        
        .block-base.layout-compact {
          width: 140px;
          min-height: 70px;
          padding: 8px;
          grid-template-columns: 36px 1fr;
          gap: 3px 10px;
        }
        
        .block-base.layout-compact .block-icon {
          width: 36px;
          height: 36px;
          font-size: 1.2em;
        }
        
        .block-base.layout-compact .block-name {
          font-size: 0.7em;
        }
        
        .block-base.layout-compact .block-value {
          font-size: var(--cf-font-size-md);
        }
        
        :host(.block-preview) .block-base.layout-compact {
          grid-template-columns: 32px 1fr;
          gap: 3px 8px;
          padding: 6px;
        }
        
        :host(.block-preview) .block-base.layout-compact .block-name {
          font-size: var(--cf-font-size-xs);
        }
        
        :host(.block-preview) .block-base.layout-compact .block-value {
          font-size: var(--cf-font-size-sm);
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .block-base.layout-horizontal {
          height: 48px;
          min-height: 48px;
          padding: 0 8px;
          gap: 8px;
        }
        
        .block-base.layout-horizontal .block-icon {
          width: 36px;
          height: 36px;
          font-size: 1.2em;
        }
        
        .block-base.layout-horizontal .block-name {
          font-size: 0.75em;
        }
        
        .block-base.layout-horizontal .block-value {
          font-size: var(--cf-font-size-sm);
          max-width: 50px;
        }
        
        .block-base.layout-vertical {
          width: 110px;
          min-height: 95px;
          padding: 8px;
        }
        
        .block-base.layout-vertical .block-icon {
          width: 44px;
          height: 44px;
          font-size: 1.4em;
        }
        
        .block-base.layout-compact {
          width: 130px;
          min-height: 65px;
          padding: 6px;
        }
      }
      
      /* ===== 深色模式 ===== */
      @media (prefers-color-scheme: dark) {
        .block-base {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .block-icon {
          background: rgba(var(--cf-primary-color-rgb), 0.2);
          color: var(--cf-text-tertiary);
        }
        
        .block-base.area-header {
          background: rgba(var(--cf-primary-color-rgb), 0.12);
          border-color: rgba(var(--cf-primary-color-rgb), 0.4);
        }
        
        .block-base.area-footer {
          background: rgba(var(--cf-accent-color-rgb), 0.12);
          border-color: rgba(var(--cf-accent-color-rgb), 0.4);
        }
        
        .block-base.layout-compact .block-name {
          color: var(--cf-text-secondary);
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
    this.layout = 'compact';  // 默认紧凑布局
    this.area = 'content';    // 默认内容区域
    this._displayName = '';
    this._displayValue = '';
    this._icon = 'mdi:cube-outline';
    this._hasEntity = false;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block') || changedProperties.has('hass')) {
      this._updateDisplayData();
    }
  }

  render() {
    return html`
      <div class="block-base layout-${this.layout} area-${this.area}">
        ${this._renderContent()}
        ${this._hasEntity ? html`
          <div class="block-status ${this._getEntityStatusClass()}"></div>
        ` : ''}
      </div>
    `;
  }

  _renderContent() {
    switch (this.layout) {
      case 'horizontal':
        return this._renderHorizontal();
      case 'vertical':
        return this._renderVertical();
      case 'compact':
      default:
        return this._renderCompact();
    }
  }

  _renderHorizontal() {
    return html`
      <div class="block-icon">
        <ha-icon .icon=${this._icon}></ha-icon>
      </div>
      <div class="block-content">
        ${this.showName ? html`
          <div class="block-name">${this._displayName || ''}</div>
        ` : ''}
        ${this.showValue ? html`
          <div class="block-value">
            ${this._hasEntity ? this._displayValue : html`<span class="empty-state">未配置</span>`}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderVertical() {
    return html`
      <div class="block-icon">
        <ha-icon .icon=${this._icon}></ha-icon>
      </div>
      ${this.showName ? html`
        <div class="block-name">${this._displayName || ''}</div>
      ` : ''}
      ${this.showValue ? html`
        <div class="block-value">
          ${this._hasEntity ? this._displayValue : html`<span class="empty-state">未配置</span>`}
        </div>
      ` : ''}
    `;
  }

  _renderCompact() {
    return html`
      <div class="block-icon">
        <ha-icon .icon=${this._icon}></ha-icon>
      </div>
      ${this.showName ? html`
        <div class="block-name">${this._displayName || ''}</div>
      ` : ''}
      ${this.showValue ? html`
        <div class="block-value">
          ${this._hasEntity ? this._displayValue : html`<span class="empty-state">未配置</span>`}
        </div>
      ` : ''}
    `;
  }

_updateDisplayData() {
  if (!this.block) {
    this._resetData();
    return;
  }
  
  // 优先使用组件属性，然后使用block中的配置
  // 重要：这里确保外部传入的layout属性优先
  const blockLayout = this.layout || this.block.layout || 'compact';
  const blockArea = this.area || this.block.area || 'content';
  
  // 更新布局和区域
  this.layout = blockLayout;
  this.area = blockArea;
  
  // 获取显示名称
  this._displayName = this._getDisplayName();
  
  // 获取显示值
  this._displayValue = this._getDisplayValue();
  
  // 获取图标
  this._icon = this._getIcon();
  
  // 检查是否有实体
  this._hasEntity = this._checkHasEntity();
}

  _resetData() {
    this._displayName = '';
    this._displayValue = '';
    this._icon = 'mdi:cube-outline';
    this._hasEntity = false;
  }

  _getDisplayName() {
    // 优先使用block中的name
    if (this.block.name) return this.block.name;
    
    // 如果有实体，使用实体友好名称
    if (this.block.entity && this.hass?.states?.[this.block.entity]) {
      const entity = this.hass.states[this.block.entity];
      return entity.attributes?.friendly_name || this.block.entity;
    }
    
    // 默认名称
    return this.block.entity ? '实体块' : '自定义块';
  }

  _getDisplayValue() {
    if (!this._hasEntity) return '';
    
    const entity = this.hass.states[this.block.entity];
    const state = entity.state;
    const unit = entity.attributes?.unit_of_measurement || '';
    
    if (unit) {
      return html`${state} <span class="block-unit">${unit}</span>`;
    }
    
    return state;
  }

  _getIcon() {
    // 优先使用block中的icon
    if (this.block.icon) return this.block.icon;
    
    // 如果有实体，根据实体类型获取默认图标
    if (this.block.entity) {
      const domain = this.block.entity.split('.')[0];
      return ENTITY_ICONS[domain] || 'mdi:cube';
    }
    
    // 默认图标
    return 'mdi:cube-outline';
  }

  _checkHasEntity() {
    return !!(this.block.entity && this.hass?.states?.[this.block.entity]);
  }

  _getEntityStatusClass() {
    if (!this._hasEntity) return '';
    
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