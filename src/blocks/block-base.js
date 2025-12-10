// blocks/block-base.js - 简化名称显示优先级
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { ENTITY_ICONS } from './block-config.js';

export class BlockBase extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    showName: { type: Boolean, attribute: 'show-name' },
    showValue: { type: Boolean, attribute: 'show-value' },
    compact: { type: Boolean },
    blockStyle: { type: String, attribute: 'block-style' },
    areaAlign: { type: String, attribute: 'area-align' },
    fillWidth: { type: Boolean, attribute: 'fill-width' },
    _displayName: { state: true },
    _stateValue: { state: true },
    _icon: { state: true },
    _hasName: { state: true }
  };

  static styles = [
    designSystem,
    css`
      :host { 
        display: block; 
      }
      
      /* 基础块容器 */
      .block-base {
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
        box-sizing: border-box;
      }
      
      /* ===== 1. 水平布局（标题/页脚使用） ===== */
      .block-base.layout-horizontal {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        min-height: 36px;
        width: 100%;
      }
      
      /* 填充宽度模式 */
      .block-base.fill-width {
        flex: 1;
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
        font-size: 1.1em;
      }
      
      .block-base.layout-horizontal .block-content {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      
      .block-base.layout-horizontal .block-name {
        font-size: var(--cf-font-size-sm);
        color: var(--cf-text-secondary);
        font-weight: var(--cf-font-weight-medium);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.2;
        flex-shrink: 0;
      }
      
      .block-base.layout-horizontal .block-value {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-semibold);
        color: var(--cf-text-primary);
        overflow-wrap: break-word;
        word-break: break-word;
        white-space: normal;
        line-height: 1.2;
        min-width: 0;
        flex: 1;
      }
      
      .block-base.layout-horizontal .block-separator {
        color: var(--cf-border);
        margin: 0 2px;
        flex-shrink: 0;
      }
      
      /* ===== 2. 紧凑布局（默认布局） ===== */
      .block-base.layout-compact {
        display: grid;
        grid-template-areas:
          "icon name"
          "icon value";
        grid-template-columns: 36px 1fr;
        grid-template-rows: auto auto;
        gap: 2px 8px;
        padding: 6px;
        min-height: 52px;
        width: 100%;
        box-sizing: border-box;
      }
      
      /* 无名称时的紧凑布局 */
      .block-base.layout-compact.no-name {
        grid-template-areas: "icon value";
        grid-template-columns: 36px 1fr;
        grid-template-rows: 1fr;
        align-items: center;
      }
      
      /* 填充宽度模式 */
      .block-base.layout-compact.fill-width {
        flex: 1;
        min-width: 0;
      }
      
      .block-base.layout-compact .block-icon {
        grid-area: icon;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
        font-size: 1.2em;
        align-self: center;
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
        text-align: left;
        min-width: 0;
      }
      
      .block-base.layout-compact .block-value {
        grid-area: value;
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-semibold);
        color: var(--cf-text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        align-self: start;
        line-height: 1.2;
        text-align: left;
        min-width: 0;
      }
      
      /* 无名称时的值显示 */
      .block-base.layout-compact.no-name .block-value {
        align-self: center;
        font-size: var(--cf-font-size-xl);
      }
      
      /* 空状态 */
      .empty-state {
        color: var(--cf-text-tertiary);
        font-style: italic;
        font-weight: var(--cf-font-weight-normal);
        font-size: var(--cf-font-size-xs);
      }
      
      /* 对齐方式控制 */
      .block-base.align-left {
        justify-content: flex-start;
        text-align: left;
      }
      
      .block-base.align-center {
        justify-content: center;
        text-align: center;
      }
      
      .block-base.align-right {
        justify-content: flex-end;
        text-align: right;
      }
      
      /* 移除区域特殊样式（去掉竖线） */
      .block-base.area-header,
      .block-base.area-content,
      .block-base.area-footer {
        /* 不再添加竖线边框 */
      }
      
      /* 移除标题/页脚鼠标动画 */
      .block-base.no-hover:hover {
        background: transparent !important;
        transform: none !important;
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
    const blockName = block.name || '';
    
    // 简化逻辑：只检查是否有名称
    this._hasName = blockName && blockName.trim() !== '';
    
    // 如果有名称就显示，没有就为空（直接显示状态值）
    this._displayName = this._hasName ? blockName : '';
    
    console.log('BlockBase: 显示名称计算', {
      blockName: block.name,
      displayName: this._displayName,
      hasEntity,
      hasName: this._hasName
    });
    
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
    const align = this.areaAlign || 'left';
    const fillWidth = this.fillWidth || false;
    const noHover = area === 'header' || area === 'footer';
    
    // 确定要显示的内容
    const showName = this.showName !== false;
    const showValue = this.showValue !== false;
    
    // 判断是否有名称
    const hasName = this._hasName && showName;
    
    return html`
      <div class="block-base 
                  layout-${layout} 
                  ${!hasName && layout === 'compact' ? 'no-name' : ''}
                  align-${align} 
                  area-${area}
                  ${fillWidth ? 'fill-width' : ''}
                  ${noHover ? 'no-hover' : ''}">
        ${this._renderLayout(layout, hasName, showValue)}
      </div>
    `;
  }

  _renderLayout(layout, showName, showValue) {
    switch (layout) {
      case 'horizontal':
        return this._renderHorizontal(showName, showValue);
      case 'compact':
      default:
        return this._renderCompact(showName, showValue);
    }
  }

  _renderHorizontal(showName, showValue) {
    // 水平布局：如果有名称显示"名称: 值"，否则只显示"值"
    return html`
      <div class="block-icon">
        <ha-icon .icon=${this._icon}></ha-icon>
      </div>
      
      <div class="block-content">
        ${showName && this._displayName ? html`
          <span class="block-name">${this._displayName}</span>
          ${showValue && this._stateValue ? html`<span class="block-separator">:</span>` : ''}
        ` : ''}
        
        ${showValue ? html`
          <span class="block-value">
            ${this._stateValue || html`<span class="empty-state">-</span>`}
          </span>
        ` : ''}
      </div>
    `;
  }

  _renderCompact(showName, showValue) {
    // 紧凑布局：如果有名称显示两行，否则值居中显示
    return html`
      <div class="block-icon">
        <ha-icon .icon=${this._icon}></ha-icon>
      </div>
      
      ${showName && this._displayName ? html`
        <div class="block-name">${this._displayName}</div>
      ` : ''}
      
      ${showValue ? html`
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