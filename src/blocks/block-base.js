// 基础块组件 - 优化紧凑模式显示
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { AREAS, ENTITY_ICONS } from './block-config.js';

export class BlockBase extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    showName: { type: Boolean },
    showValue: { type: Boolean },
    compact: { type: Boolean },
    _displayName: { state: true },
    _displayValue: { state: true },
    _icon: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host { display: block; }
      
      /* 基础块容器 - 使用紧凑网格布局（图标在左，名称在上，状态值在下） */
      .block-base {
        width: 100%;
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 2px 8px;
        align-items: center;
        min-height: 60px;
        padding: 8px;
      }
      
      .compact.block-base {
        min-height: 50px;
        grid-template-columns: 32px 1fr;
        gap: 1px 6px;
        padding: 6px;
      }
      
      /* 块图标 */
      .block-icon {
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
        align-self: center;
      }
      
      .compact .block-icon {
        width: 32px;
        height: 32px;
        font-size: 1.1em;
      }
      
      /* 块名称（网格定位：右上） */
      .block-name {
        grid-column: 2;
        grid-row: 1;
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-secondary);
        font-weight: var(--cf-font-weight-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: var(--cf-line-height-tight);
        align-self: end;
      }
      
      /* 紧凑模式下的名称显示优化 */
      .compact .block-name {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
      }
      
      /* 当 showName=false 时隐藏名称 */
      .block-name:empty {
        display: none;
      }
      
      /* 块值（网格定位：右下） */
      .block-value {
        grid-column: 2;
        grid-row: 2;
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        line-height: var(--cf-line-height-tight);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        align-self: start;
      }
      
      /* 紧凑模式下的值显示优化 */
      .compact .block-value {
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-semibold);
      }
      
      /* 当 showValue=false 时隐藏值 */
      .block-value:empty {
        display: none;
      }
      
      /* 单位显示 */
      .block-unit {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
        font-weight: var(--cf-font-weight-normal);
        margin-left: 2px;
      }
      
      .compact .block-unit {
        font-size: 0.7em;
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
      
      .compact .block-status {
        width: 5px;
        height: 5px;
        top: 3px;
        right: 3px;
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
      
      .compact .empty-state {
        font-size: var(--cf-font-size-xs);
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
      
      /* 响应式设计 - 超小屏幕适配 */
      @container cardforge-container (max-width: 320px) {
        .block-base {
          grid-template-columns: 28px 1fr;
          gap: 1px 4px;
          padding: 4px;
        }
        
        .block-icon {
          width: 28px;
          height: 28px;
          font-size: 1em;
        }
        
        .block-name {
          font-size: 0.7em;
        }
        
        .block-value {
          font-size: 0.85em;
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
        
        .compact .block-name {
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
    this.compact = false;
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
    
    return html`
      <div class="block-base ${this.compact ? 'compact' : ''} area-${area}">
        <div class="block-icon">
          <ha-icon .icon=${this._icon}></ha-icon>
        </div>
        
        ${this.showName ? html`
          <div class="block-name">${this._displayName || ''}</div>
        ` : ''}
        
        ${this.showValue ? html`
          <div class="block-value">
            ${hasEntity ? this._displayValue : html`<span class="empty-state">未配置实体</span>`}
          </div>
        ` : ''}
        
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
