// blocks/block-base.js - 优化版（紧凑显示，移除单位）
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { ENTITY_ICONS } from './block-config.js';

export class BlockBase extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    showName: { type: Boolean },
    showValue: { type: Boolean },
    compact: { type: Boolean },
    layoutMode: { type: String },
    blockStyle: { type: String },
    areaAlign: { type: String },
    _friendlyName: { state: true },
    _stateValue: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host { 
        display: block; 
      }
      
      /* 基础块容器 */
      .block-base {
        width: 100%;
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
        display: flex;
      }
      
      /* ===== 1. 紧凑布局（默认） ===== */
      .block-base.layout-compact {
        display: grid;
        grid-template-areas:
          "icon name"
          "icon value";
        grid-template-columns: 32px 1fr;
        grid-template-rows: auto auto;
        gap: 2px 6px;
        padding: 4px;
        min-height: 48px;
        width: fit-content;
        max-width: 160px;
      }
      
      .block-base.layout-compact .block-icon {
        grid-area: icon;
        width: 32px;
        height: 32px;
        font-size: 1.1em;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-sm);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
      }
      
      .block-base.layout-compact .block-name {
        grid-area: name;
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-secondary);
        font-weight: var(--cf-font-weight-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        align-self: end;
        line-height: 1.2;
      }
      
      .block-base.layout-compact .block-value {
        grid-area: value;
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-semibold);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        align-self: start;
        line-height: 1.2;
      }
      
      .block-base.layout-compact .block-unit {
        display: none; /* 隐藏单位 */
      }
      
      /* ===== 2. 水平布局（填充宽度） ===== */
      .block-base.layout-horizontal {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        min-height: 32px;
        flex: 1;
        min-width: 120px;
      }
      
      .block-base.layout-horizontal .block-icon {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-sm);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
        font-size: 1em;
      }
      
      .block-base.layout-horizontal .block-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      
      .block-base.layout-horizontal .block-name {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-secondary);
        font-weight: var(--cf-font-weight-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.2;
      }
      
      .block-base.layout-horizontal .block-value {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-semibold);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.2;
      }
      
      .block-base.layout-horizontal .block-unit {
        display: none; /* 隐藏单位 */
      }
      
      /* ===== 3. 垂直布局（自适应宽度） ===== */
      .block-base.layout-vertical {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 6px 8px;
        min-height: 60px;
        width: 100%;
        min-width: 100px;
        gap: 3px;
      }
      
      .block-base.layout-vertical .block-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-sm);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
        font-size: 1.2em;
        margin-bottom: 2px;
      }
      
      .block-base.layout-vertical .block-name {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-secondary);
        font-weight: var(--cf-font-weight-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        line-height: 1.2;
      }
      
      .block-base.layout-vertical .block-value {
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-semibold);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        line-height: 1.2;
      }
      
      .block-base.layout-vertical .block-unit {
        display: none; /* 隐藏单位 */
      }
      
      /* 区域样式 */
      .block-base.area-header {
        border-left: 2px solid var(--cf-primary-color);
      }
      
      .block-base.area-footer {
        border-right: 2px solid var(--cf-accent-color);
      }
      
      /* 空状态 */
      .empty-state {
        color: var(--cf-text-tertiary);
        font-style: italic;
        font-weight: var(--cf-font-weight-normal);
        font-size: var(--cf-font-size-xs);
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 480px) {
        .block-base.layout-compact {
          grid-template-columns: 28px 1fr;
          padding: 3px;
          min-height: 42px;
          max-width: 140px;
        }
        
        .block-base.layout-compact .block-icon {
          width: 28px;
          height: 28px;
          font-size: 1em;
        }
        
        .block-base.layout-compact .block-name {
          font-size: 0.7em;
        }
        
        .block-base.layout-compact .block-value {
          font-size: 0.85em;
        }
        
        .block-base.layout-horizontal {
          padding: 3px 6px;
          gap: 4px;
          min-width: 100px;
        }
        
        .block-base.layout-horizontal .block-icon {
          width: 24px;
          height: 24px;
          font-size: 0.9em;
        }
        
        .block-base.layout-vertical {
          padding: 4px 6px;
          min-height: 52px;
        }
        
        .block-base.layout-vertical .block-icon {
          width: 32px;
          height: 32px;
          font-size: 1.1em;
        }
      }
      
      @container cardforge-container (max-width: 360px) {
        .block-base.layout-compact {
          grid-template-columns: 24px 1fr;
          padding: 2px;
          min-height: 36px;
          max-width: 120px;
        }
        
        .block-base.layout-compact .block-icon {
          width: 24px;
          height: 24px;
          font-size: 0.9em;
        }
        
        .block-base.layout-horizontal {
          min-width: 80px;
        }
      }
    `
  ];

  willUpdate(changedProperties) {
    if (changedProperties.has('block') || changedProperties.has('hass')) {
      this._updateDisplayData();
    }
  }

  _updateDisplayData() {
    // 安全地获取 block 数据
    let block = {};
    try {
      if (this.block && typeof this.block === 'object') {
        block = this.block;
      } else if (typeof this.block === 'string') {
        block = JSON.parse(this.block);
      }
    } catch (e) {
      console.warn('无法解析 block 数据:', this.block);
      block = {};
    }
    
    const entityId = block.entity || '';
    const hasEntity = entityId && this.hass?.states?.[entityId];
    
    // 获取友好名称
    if (hasEntity) {
      const entity = this.hass.states[entityId];
      this._friendlyName = entity.attributes?.friendly_name || entityId.split('.')[1] || entityId;
    } else {
      this._friendlyName = block.name || (block.entity ? '实体块' : '新块');
    }
    
    // 获取状态值（移除单位）
    if (hasEntity) {
      const entity = this.hass.states[entityId];
      let state = entity.state || '';
      
      // 移除单位
      if (state.includes(' ')) {
        state = state.split(' ')[0];
      }
      
      this._stateValue = state;
    } else {
      this._stateValue = '';
    }
    
    // 获取图标
    this._icon = block.icon || 'mdi:cube-outline';
    if (!block.icon && entityId) {
      const domain = entityId.split('.')[0];
      this._icon = ENTITY_ICONS[domain] || 'mdi:cube';
    }
  }

  render() {
    const area = this.block?.area || 'content';
    const layout = this.blockStyle || (this.compact ? 'compact' : 'horizontal');
    
    return html`
      <div class="block-base layout-${layout} area-${area}">
        <div class="block-icon">
          <ha-icon .icon=${this._icon}></ha-icon>
        </div>
        
        ${layout === 'compact' ? this._renderCompact() : ''}
        ${layout === 'horizontal' ? this._renderHorizontal() : ''}
        ${layout === 'vertical' ? this._renderVertical() : ''}
      </div>
    `;
  }

  _renderCompact() {
    return html`
      ${this.showName ? html`
        <div class="block-name">${this._friendlyName}</div>
      ` : ''}
      
      ${this.showValue ? html`
        <div class="block-value">
          ${this._stateValue || html`<span class="empty-state">-</span>`}
        </div>
      ` : ''}
    `;
  }

  _renderHorizontal() {
    return html`
      <div class="block-content">
        ${this.showName ? html`
          <div class="block-name">${this._friendlyName}</div>
        ` : ''}
        
        ${this.showValue ? html`
          <div class="block-value">
            ${this._stateValue || html`<span class="empty-state">-</span>`}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderVertical() {
    return html`
      ${this.showName ? html`
        <div class="block-name">${this._friendlyName}</div>
      ` : ''}
      
      ${this.showValue ? html`
        <div class="block-value">
          ${this._stateValue || html`<span class="empty-state">-</span>`}
        </div>
      ` : ''}
    `;
  }
}

if (!customElements.get('block-base')) {
  customElements.define('block-base', BlockBase);
}
