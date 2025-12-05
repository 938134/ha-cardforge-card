// 基础块组件 - 使用合并后的设计系统
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
    layout: { type: String }, // 'horizontal' | 'vertical'
    _displayName: { state: true },
    _displayValue: { state: true },
    _icon: { state: true }
  };

  static styles = [
    designSystem, // 直接使用合并后的设计系统
    css`
      :host { display: block; }
      
      /* 基础块容器 */
      .block-base {
        width: 100%;
        position: relative;
        overflow: hidden;
      }
      
      /* 区域样式应用 */
      .area-header {
        @apply --cf-recipe-header-block;
      }
      
      .area-content.horizontal {
        @apply --cf-recipe-content-block-horizontal;
      }
      
      .area-content.vertical {
        @apply --cf-recipe-content-block-vertical;
      }
      
      .area-footer {
        @apply --cf-recipe-footer-block;
      }
      
      /* 块通用交互 */
      .block-base:hover {
        @apply --cf-block-hover-state;
      }
      
      .block-base:active {
        @apply --cf-block-active-state;
      }
      
      /* 块图标 */
      .block-icon {
        @apply --cf-block-icon-base;
      }
      
      .block-base:hover .block-icon {
        @apply --cf-block-icon-hover;
      }
      
      /* 块内容 */
      .block-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .vertical .block-content {
        align-items: center;
        text-align: center;
      }
      
      /* 块名称 */
      .block-name {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-secondary);
        margin-bottom: var(--cf-spacing-xs);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: var(--cf-font-weight-medium);
      }
      
      .compact .block-name {
        font-size: var(--cf-font-size-xs);
        margin-bottom: 2px;
      }
      
      .vertical .block-name {
        text-align: center;
        white-space: normal;
        line-height: var(--cf-line-height-tight);
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
      
      .vertical .block-value {
        text-align: center;
        white-space: normal;
        margin-top: var(--cf-spacing-xs);
      }
      
      .block-unit {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-tertiary);
        font-weight: var(--cf-font-weight-normal);
        margin-left: var(--cf-spacing-xs);
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
      
      /* 紧凑模式调整 */
      .compact.block-base {
        min-height: 50px;
      }
      
      .compact .block-icon {
        width: 36px;
        height: 36px;
        font-size: 1.2em;
      }
      
      /* 最小模式调整 */
      .minimal.block-base {
        background: transparent;
        border: none;
        padding: 0;
        min-height: auto;
      }
      
      .minimal .block-icon {
        background: transparent;
        width: 32px;
        height: 32px;
        color: var(--cf-text-tertiary);
      }
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 400px) {
        .block-base {
          flex-direction: column;
          text-align: center;
          gap: var(--cf-spacing-sm);
          padding: var(--cf-spacing-md);
        }
        
        .block-icon {
          margin-bottom: var(--cf-spacing-xs);
        }
        
        .block-name {
          font-size: var(--cf-font-size-xs);
          margin-bottom: var(--cf-spacing-xs);
        }
        
        .block-value {
          font-size: var(--cf-font-size-lg);
        }
        
        .block-content {
          width: 100%;
          text-align: center;
        }
        
        /* 在小屏幕上强制垂直布局 */
        .area-content.horizontal {
          @apply --cf-layout-vertical;
          align-items: center;
        }
        
        .horizontal .block-content {
          align-items: center;
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
    const isPreset = this.block?.presetKey;
    const isRequired = this.block?.required;
    const area = this.block?.area || 'content';
    
    // 确定布局：内容块根据layout属性，其他区域固定
    let layoutClass = '';
    if (area === 'content') {
      layoutClass = this.layout;
    } else {
      // 标题和页脚块固定为水平布局
      layoutClass = 'horizontal';
    }
    
    return html`
      <div class="block-base area-${area} ${layoutClass} ${this.compact ? 'compact' : ''}">
        <div class="block-icon">
          <ha-icon .icon=${this._icon}></ha-icon>
        </div>
        
        <div class="block-content">
          ${this.showName && this._displayName ? html`
            <div class="block-name">
              ${this._displayName}
              ${isPreset ? html`<span class="preset-badge">预设</span>` : ''}
              ${isRequired ? html`<span class="required-badge">必需</span>` : ''}
            </div>
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
