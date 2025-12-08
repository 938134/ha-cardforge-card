import { LitElement, html, css } from 'https://unpkg.com/lit@3.1.3/index.js?module';
import { property, state } from 'https://unpkg.com/lit@3.1.3/decorators.js?module';
import { designSystem } from '../core/design-system.js';
import { 
  getEntityFriendlyName, 
  getEntityState, 
  getEntityIcon, 
  getEntityUnit 
} from '../core/card-tools.js';

/**
 * 块基础组件
 */
export class BlockBase extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    showName: { type: Boolean },
    showValue: { type: Boolean },
    compact: { type: Boolean },
    horizontal: { type: Boolean },
    vertical: { type: Boolean },
    _entityData: { state: true },
    _updateTimer: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .block-base {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 2px 8px;
        align-items: center;
        padding: 8px;
        width: 100%;
        height: 100%;
        min-height: 60px;
        box-sizing: border-box;
        transition: all var(--cf-transition-fast);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        border: 1px solid transparent;
      }

      .block-base:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-primary-color-rgb), 0.03);
        box-shadow: var(--cf-shadow-sm);
      }

      /* 紧凑模式 */
      .block-base.compact {
        grid-template-columns: 32px 1fr;
        gap: 1px 6px;
        padding: 6px;
        min-height: 50px;
      }

      /* 水平模式 */
      .block-base.horizontal {
        grid-template-columns: auto 1fr auto;
        grid-template-rows: 1fr;
        gap: 8px;
        align-items: center;
        justify-items: start;
      }

      .block-base.horizontal.compact {
        grid-template-columns: 32px 1fr auto;
        gap: 6px;
      }

      /* 垂直模式 */
      .block-base.vertical {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 4px;
        justify-items: center;
        text-align: center;
        padding: 12px 8px;
      }

      .block-base.vertical.compact {
        padding: 8px 6px;
        gap: 3px;
      }

      /* 图标区域 */
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
        transition: all var(--cf-transition-fast);
      }

      .compact .block-icon {
        width: 32px;
        height: 32px;
        font-size: 1.1em;
      }

      .horizontal .block-icon {
        grid-row: 1;
      }

      .vertical .block-icon {
        grid-column: 1;
        grid-row: 1;
        width: 48px;
        height: 48px;
        margin-bottom: 4px;
      }

      .vertical.compact .block-icon {
        width: 40px;
        height: 40px;
      }

      /* 名称区域 */
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
      }

      .compact .block-name {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
      }

      .horizontal .block-name {
        grid-column: 2;
        grid-row: 1;
        align-self: end;
      }

      .vertical .block-name {
        grid-column: 1;
        grid-row: 2;
        width: 100%;
        text-align: center;
      }

      .block-name:empty {
        display: none;
      }

      /* 值区域 */
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
      }

      .compact .block-value {
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-semibold);
      }

      .horizontal .block-value {
        grid-column: 3;
        grid-row: 1;
        align-self: end;
        justify-self: end;
      }

      .vertical .block-value {
        grid-column: 1;
        grid-row: 3;
        width: 100%;
        text-align: center;
      }

      .block-value:empty {
        display: none;
      }

      /* 单位 */
      .block-unit {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
        font-weight: var(--cf-font-weight-normal);
        margin-left: 2px;
      }

      .compact .block-unit {
        font-size: 0.7em;
      }

      /* 空状态 */
      .block-empty {
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

      /* 响应式设计 */
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

      /* 深色模式优化 */
      @media (prefers-color-scheme: dark) {
        .block-base {
          background: rgba(255, 255, 255, 0.05);
        }

        .block-base:hover {
          background: rgba(var(--cf-primary-color-rgb), 0.1);
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
    this.horizontal = false;
    this.vertical = false;
    this._entityData = null;
    this._updateTimer = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._startAutoUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._stopAutoUpdate();
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block') || changedProperties.has('hass')) {
      this._updateEntityData();
    }
  }

  /**
   * 开始自动更新
   */
  _startAutoUpdate() {
    if (this._updateTimer) {
      clearInterval(this._updateTimer);
    }
    
    // 如果有实体，每分钟更新一次
    if (this.block?.entity) {
      this._updateTimer = setInterval(() => {
        this._updateEntityData();
      }, 60000);
    }
  }

  /**
   * 停止自动更新
   */
  _stopAutoUpdate() {
    if (this._updateTimer) {
      clearInterval(this._updateTimer);
      this._updateTimer = null;
    }
  }

  /**
   * 更新实体数据
   */
  _updateEntityData() {
    if (!this.block || !this.hass) {
      this._entityData = null;
      return;
    }

    const { entity: entityId, name: customName, icon: customIcon } = this.block;
    
    if (!entityId || !this.hass.states?.[entityId]) {
      this._entityData = {
        hasEntity: false,
        name: customName || '未配置实体',
        value: '',
        icon: customIcon || 'mdi:cube-outline',
        unit: ''
      };
      return;
    }

    const entity = this.hass.states[entityId];
    const name = customName || getEntityFriendlyName(this.hass, entityId, entityId);
    const value = getEntityState(this.hass, entityId, '');
    const icon = customIcon || getEntityIcon(this.hass, entityId, 'mdi:cube');
    const unit = getEntityUnit(this.hass, entityId, '');

    this._entityData = {
      hasEntity: true,
      name,
      value,
      icon,
      unit,
      entity
    };
  }

  render() {
    if (!this._entityData) {
      this._updateEntityData();
    }

    const data = this._entityData || {};
    const { name, value, icon, unit, hasEntity } = data;
    const area = this.block.area || 'content';

    // 确定布局类
    const layoutClasses = [
      'block-base',
      this.compact ? 'compact' : '',
      this.horizontal ? 'horizontal' : '',
      this.vertical ? 'vertical' : '',
      `area-${area}`
    ].filter(Boolean).join(' ');

    return html`
      <div class="${layoutClasses}">
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        
        ${this.showName ? html`
          <div class="block-name">
            ${name}
          </div>
        ` : ''}
        
        ${this.showValue ? html`
          <div class="block-value">
            ${hasEntity && value ? html`
              ${value}<span class="block-unit">${unit}</span>
            ` : html`
              <span class="block-empty">未配置实体</span>
            `}
          </div>
        ` : ''}
      </div>
    `;
  }
}

// 注册自定义元素
if (!customElements.get('block-base')) {
  customElements.define('block-base', BlockBase);
}
