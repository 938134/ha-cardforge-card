// 基础块组件 - 优化自适应布局
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
      
      /* ===== 基础块容器 - 默认紧凑布局 ===== */
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
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        box-sizing: border-box;
      }
      
      /* ===== 水平布局样式 (用于标题/页脚) ===== */
      :host(.style-horizontal) .block-base {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 200px;
        max-width: 300px;
        height: 60px;
        min-height: 60px;
        padding: 0 12px;
      }
      
      :host(.style-horizontal) .block-icon {
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
      
      :host(.style-horizontal) .block-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 0;
        gap: 8px;
      }
      
      :host(.style-horizontal) .block-name {
        font-size: var(--cf-font-size-base);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        min-width: 0;
      }
      
      :host(.style-horizontal) .block-value {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100px;
      }
      
      /* ===== 垂直布局样式 ===== */
      :host(.style-vertical) .block-base {
        width: 140px;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px;
        gap: 8px;
        text-align: center;
      }
      
      :host(.style-vertical) .block-icon {
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
      
      :host(.style-vertical) .block-name {
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
      
      :host(.style-vertical) .block-value {
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
      
      /* ===== 紧凑布局样式 ===== */
      :host(.style-compact) .block-base {
        width: 160px;
        min-height: 80px;
        display: grid;
        grid-template-columns: 40px 1fr;
        grid-template-rows: auto auto;
        gap: 4px 12px;
        align-items: center;
        padding: 10px;
      }
      
      :host(.style-compact) .block-icon {
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
      
      :host(.style-compact) .block-name {
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
      
      :host(.style-compact) .block-value {
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
      
      /* ===== 区域样式 ===== */
      :host(.header-block) .block-base {
        background: rgba(var(--cf-primary-color-rgb), 0.05);
        border-color: rgba(var(--cf-primary-color-rgb), 0.3);
      }
      
      :host(.header-block) .block-icon {
        background: rgba(var(--cf-primary-color-rgb), 0.15);
        color: var(--cf-primary-color);
      }
      
      :host(.footer-block) .block-base {
        background: rgba(var(--cf-accent-color-rgb), 0.05);
        border-color: rgba(var(--cf-accent-color-rgb), 0.3);
      }
      
      :host(.footer-block) .block-icon {
        background: rgba(var(--cf-accent-color-rgb), 0.15);
        color: var(--cf-accent-color);
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
      
      /* ===== 响应式设计 ===== */
      
      /* 平板设备 */
      @container cardforge-container (max-width: 768px) {
        :host(.style-horizontal) .block-base {
          min-width: 180px;
          height: 56px;
          min-height: 56px;
        }
        
        :host(.style-horizontal) .block-icon {
          width: 44px;
          height: 44px;
          font-size: 1.4em;
        }
        
        :host(.style-horizontal) .block-name {
          font-size: var(--cf-font-size-sm);
        }
        
        :host(.style-horizontal) .block-value {
          font-size: var(--cf-font-size-md);
          max-width: 80px;
        }
        
        :host(.style-vertical) .block-base {
          width: 130px;
          min-height: 110px;
        }
        
        :host(.style-vertical) .block-icon {
          width: 50px;
          height: 50px;
          font-size: 1.6em;
        }
        
        :host(.style-compact) .block-base {
          width: 150px;
          min-height: 75px;
        }
      }
      
      /* 手机设备 */
      @container cardforge-container (max-width: 480px) {
        :host(.style-horizontal) .block-base {
          min-width: 150px;
          height: 52px;
          min-height: 52px;
          padding: 0 10px;
          gap: 10px;
        }
        
        :host(.style-horizontal) .block-icon {
          width: 40px;
          height: 40px;
          font-size: 1.3em;
        }
        
        :host(.style-horizontal) .block-name {
          font-size: var(--cf-font-size-xs);
        }
        
        :host(.style-horizontal) .block-value {
          font-size: var(--cf-font-size-sm);
          max-width: 60px;
        }
        
        :host(.style-vertical) .block-base {
          width: 120px;
          min-height: 100px;
          padding: 10px;
        }
        
        :host(.style-vertical) .block-icon {
          width: 48px;
          height: 48px;
          font-size: 1.5em;
        }
        
        :host(.style-vertical) .block-name {
          font-size: var(--cf-font-size-xs);
        }
        
        :host(.style-vertical) .block-value {
          font-size: var(--cf-font-size-md);
        }
        
        :host(.style-compact) .block-base {
          width: 140px;
          min-height: 70px;
          padding: 8px;
          grid-template-columns: 36px 1fr;
          gap: 3px 10px;
        }
        
        :host(.style-compact) .block-icon {
          width: 36px;
          height: 36px;
          font-size: 1.2em;
        }
        
        :host(.style-compact) .block-name {
          font-size: 0.7em;
        }
        
        :host(.style-compact) .block-value {
          font-size: var(--cf-font-size-md);
        }
      }
      
      /* 小屏手机 */
      @container cardforge-container (max-width: 360px) {
        :host(.style-horizontal) .block-base {
          min-width: 120px;
          height: 48px;
          min-height: 48px;
          padding: 0 8px;
          gap: 8px;
        }
        
        :host(.style-horizontal) .block-icon {
          width: 36px;
          height: 36px;
          font-size: 1.2em;
        }
        
        :host(.style-horizontal) .block-name {
          font-size: 0.75em;
        }
        
        :host(.style-horizontal) .block-value {
          font-size: var(--cf-font-size-sm);
          max-width: 50px;
        }
        
        :host(.style-vertical) .block-base {
          width: 110px;
          min-height: 95px;
          padding: 8px;
        }
        
        :host(.style-vertical) .block-icon {
          width: 44px;
          height: 44px;
          font-size: 1.4em;
        }
        
        :host(.style-compact) .block-base {
          width: 130px;
          min-height: 65px;
          padding: 6px;
        }
      }
      
      /* 超小屏幕 */
      @container cardforge-container (max-width: 320px) {
        :host(.style-horizontal) .block-base {
          min-width: 100px;
        }
        
        :host(.style-vertical) .block-base {
          width: 100px;
          min-height: 90px;
        }
        
        :host(.style-compact) .block-base {
          width: 120px;
          min-height: 60px;
        }
      }
      
      /* ===== 深色模式适配 ===== */
      @media (prefers-color-scheme: dark) {
        .block-base {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }
        
        .block-icon {
          background: rgba(var(--cf-primary-color-rgb), 0.2);
          color: var(--cf-text-tertiary);
        }
        
        :host(.header-block) .block-base {
          background: rgba(var(--cf-primary-color-rgb), 0.12);
          border-color: rgba(var(--cf-primary-color-rgb), 0.4);
        }
        
        :host(.header-block) .block-icon {
          background: rgba(var(--cf-primary-color-rgb), 0.25);
          color: var(--cf-primary-color);
        }
        
        :host(.footer-block) .block-base {
          background: rgba(var(--cf-accent-color-rgb), 0.12);
          border-color: rgba(var(--cf-accent-color-rgb), 0.4);
        }
        
        :host(.footer-block) .block-icon {
          background: rgba(var(--cf-accent-color-rgb), 0.25);
          color: var(--cf-accent-color);
        }
        
        :host(.style-compact) .block-name {
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
    
    // 确定渲染模式
    const renderMode = this._getRenderMode();
    
    return html`
      <div class="block-base area-${area}">
        ${renderMode === 'horizontal' ? this._renderHorizontal() : ''}
        ${renderMode === 'vertical' ? this._renderVertical() : ''}
        ${renderMode === 'compact' ? this._renderCompact() : ''}
        
        ${hasEntity ? html`
          <div class="block-status ${this._getEntityStatusClass()}"></div>
        ` : ''}
      </div>
    `;
  }

  // 水平布局渲染（用于标题/页脚）
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
            ${this._hasEntity() ? this._displayValue : html`<span class="empty-state">未配置</span>`}
          </div>
        ` : ''}
      </div>
    `;
  }

  // 垂直布局渲染
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
          ${this._hasEntity() ? this._displayValue : html`<span class="empty-state">未配置</span>`}
        </div>
      ` : ''}
    `;
  }

  // 紧凑布局渲染（默认）
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
          ${this._hasEntity() ? this._displayValue : html`<span class="empty-state">未配置</span>`}
        </div>
      ` : ''}
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
    if (!this._hasEntity()) {
      return '';
    }
    
    const entity = this.hass.states[this.block.entity];
    const state = entity.state;
    const unit = entity.attributes?.unit_of_measurement || '';
    
    if (unit) {
      return html`${state} <span class="block-unit">${unit}</span>`;
    }
    
    return state;
  }

  _getIcon() {
    if (this.block.icon) return this.block.icon;
    
    if (!this.block.entity) return 'mdi:cube-outline';
    
    const domain = this.block.entity.split('.')[0];
    return ENTITY_ICONS[domain] || 'mdi:cube';
  }

  _hasEntity() {
    return this.block.entity && this.hass?.states?.[this.block.entity];
  }

  _getEntityStatusClass() {
    if (!this._hasEntity()) {
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

  // 根据宿主类名确定渲染模式
  _getRenderMode() {
    if (this.classList.contains('style-horizontal')) {
      return 'horizontal';
    } else if (this.classList.contains('style-vertical')) {
      return 'vertical';
    } else if (this.classList.contains('style-compact')) {
      return 'compact';
    }
    
    // 默认使用紧凑模式
    return 'compact';
  }
}

if (!customElements.get('block-base')) {
  customElements.define('block-base', BlockBase);
}