// blocks/block-base.js - 简化安全版（完全使用 Lit 框架）
import { LitElement, html, css } from 'lit';
import { designSystem } from '../core/design-system.js';
import { AREAS, ENTITY_ICONS } from './block-config.js';

export class BlockBase extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    showName: { type: Boolean },
    showValue: { type: Boolean },
    compact: { type: Boolean }
  };

  static styles = [
    designSystem,
    css`
      :host { display: block; }
      
      /* 基础块容器 */
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
      
      /* 块名称 */
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
      
      .compact .block-name {
        font-size: var(--cf-font-size-xs);
        color: var(--cf-text-tertiary);
      }
      
      .block-name:empty {
        display: none;
      }
      
      /* 块值 */
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
      
      .compact .block-value {
        font-size: var(--cf-font-size-md);
        font-weight: var(--cf-font-weight-semibold);
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
    `
  ];

  render() {
    // 安全地获取 block 数据
    let block = {};
    try {
      if (this.block && typeof this.block === 'object') {
        block = this.block;
      } else if (typeof this.block === 'string') {
        // 如果是字符串，尝试解析
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
    
    return html`
      <div class="block-base ${this.compact ? 'compact' : ''} area-${area}">
        <div class="block-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        
        ${this.showName ? html`
          <div class="block-name">${displayName}</div>
        ` : ''}
        
        ${this.showValue ? html`
          <div class="block-value">
            ${displayValue || html`<span class="empty-state">未配置实体</span>`}
          </div>
        ` : ''}
      </div>
    `;
  }
}

if (!customElements.get('block-base')) {
  customElements.define('block-base', BlockBase);
}