// blocks/block-base.js - 兼容版
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
    areaAlign: { type: String }
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
        min-height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      /* 紧凑模式 */
      .compact.block-base {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 2px 8px;
        align-items: center;
        min-height: 50px;
        padding: 6px;
      }
      
      /* 水平模式 */
      .horizontal.block-base {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
      }
      
      /* 垂直模式 */
      .vertical.block-base {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 12px;
        gap: 4px;
      }
      
      /* 块图标 */
      .block-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-primary-color-rgb), 0.1);
        color: var(--cf-text-secondary);
        font-size: 1.3em;
        transition: all var(--cf-transition-duration-fast) var(--cf-easing-standard);
      }
      
      .compact .block-icon {
        grid-column: 1;
        grid-row: 1 / span 2;
        width: 32px;
        height: 32px;
        font-size: 1.1em;
      }
      
      .horizontal .block-icon {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
      }
      
      .vertical .block-icon {
        width: 40px;
        height: 40px;
        margin-bottom: 4px;
        font-size: 1.4em;
      }
      
      /* 块内容 */
      .block-content {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      
      .compact .block-content {
        grid-column: 2;
        grid-row: 1 / span 2;
      }
      
      .horizontal .block-content {
        flex: 1;
      }
      
      .vertical .block-content {
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
        color: var(--cf-text-tertiary);
        align-self: end;
      }
      
      .horizontal .block-name {
        margin-bottom: 2px;
      }
      
      .vertical .block-name {
        margin-bottom: 4px;
        font-size: var(--cf-font-size-xs);
      }
      
      .block-name:empty {
        display: none;
      }
      
      /* 块值 */
      .block-value {
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
        align-self: start;
      }
      
      .horizontal .block-value {
        font-size: var(--cf-font-size-md);
      }
      
      .vertical .block-value {
        font-size: var(--cf-font-size-lg);
        margin-top: 2px;
      }
      
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
      
      /* 响应式设计 */
      @container cardforge-container (max-width: 320px) {
        .compact.block-base {
          grid-template-columns: 28px 1fr;
          gap: 1px 4px;
          padding: 4px;
        }
        
        .compact .block-icon {
          width: 28px;
          height: 28px;
          font-size: 1em;
        }
        
        .compact .block-name {
          font-size: 0.7em;
        }
        
        .compact .block-value {
          font-size: 0.85em;
        }
        
        .horizontal.block-base {
          padding: 4px 6px;
          gap: 4px;
        }
        
        .horizontal .block-icon {
          width: 30px;
          height: 30px;
        }
        
        .vertical.block-base {
          padding: 8px;
        }
      }
    `
  ];

  render() {
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
    const area = block.area || 'content';
    
    // 获取显示名称
    let displayName = block.name || '';
    if (!displayName && hasEntity) {
      const entity = this.hass.states[entityId];
      displayName = entity.attributes?.friendly_name || entityId;
    }
    if (!displayName) {
      displayName = block.entity ? '实体块' : '新块';
    }
    
    // 获取显示值
    let displayValue = '';
    if (hasEntity) {
      const entity = this.hass.states[entityId];
      const state = entity.state;
      const unit = entity.attributes?.unit_of_measurement || '';
      displayValue = unit ? `${state} ${unit}` : state;
    }
    
    // 获取图标
    let icon = block.icon || 'mdi:cube-outline';
    if (!block.icon && entityId) {
      const domain = entityId.split('.')[0];
      icon = ENTITY_ICONS[domain] || 'mdi:cube';
    }
    
    // 确定显示样式
    let displayStyle = 'compact';
    if (this.blockStyle) {
      displayStyle = this.blockStyle;
    } else if (this.compact) {
      displayStyle = 'compact';
    }
    
    // 根据样式渲染不同的HTML结构
    if (displayStyle === 'compact') {
      return this._renderCompact(area, icon, displayName, displayValue);
    } else if (displayStyle === 'horizontal') {
      return this._renderHorizontal(area, icon, displayName, displayValue);
    } else if (displayStyle === 'vertical') {
      return this._renderVertical(area, icon, displayName, displayValue);
    } else {
      return this._renderCompact(area, icon, displayName, displayValue);
    }
  }

  _renderCompact(area, icon, name, value) {
    return html`
      <div class="block-base compact area-${area}">
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        
        <div class="block-content">
          ${this.showName ? html`
            <div class="block-name">${name}</div>
          ` : ''}
          
          ${this.showValue ? html`
            <div class="block-value">
              ${value || html`<span class="empty-state">未配置实体</span>`}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderHorizontal(area, icon, name, value) {
    return html`
      <div class="block-base horizontal area-${area}">
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        
        <div class="block-content">
          ${this.showName ? html`
            <div class="block-name">${name}</div>
          ` : ''}
          
          ${this.showValue ? html`
            <div class="block-value">
              ${value || html`<span class="empty-state">未配置实体</span>`}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderVertical(area, icon, name, value) {
    return html`
      <div class="block-base vertical area-${area}">
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        
        ${this.showName ? html`
          <div class="block-name">${name}</div>
        ` : ''}
        
        ${this.showValue ? html`
          <div class="block-value">
            ${value || html`<span class="empty-state">未配置实体</span>`}
          </div>
        ` : ''}
      </div>
    `;
  }
}

if (!customElements.get('block-base')) {
  customElements.define('block-base', BlockBase);
}