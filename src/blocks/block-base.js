// blocks/block-base.js - 修复版
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
    
    // =========== 新增属性 ===========
    layoutMode: { type: String },  // flow, stack, grid-2, grid-3, grid-4, horizontal
    blockStyle: { type: String },  // compact, horizontal, vertical
    areaAlign: { type: String },   // left, center, right
    // ================================
    
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
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 2px 8px;
        align-items: center;
        min-height: 60px;
        padding: 8px;
      }
      
      /* 原有样式保持不变... */
      
      /* =========== 新增：优化空状态显示 =========== */
      
      /* 优化空状态文本 */
      .empty-state {
        color: var(--cf-text-tertiary);
        font-style: italic;
        font-weight: var(--cf-font-weight-normal);
        font-size: var(--cf-font-size-sm);
        padding: 4px 0;
      }
      
      .compact .empty-state {
        font-size: var(--cf-font-size-xs);
      }
      
      /* 针对空块的优化样式 */
      .block-base:has(.block-value:empty) {
        opacity: 0.8;
      }
      
      .block-base:has(.block-value:empty) .block-icon {
        background: rgba(var(--cf-primary-color-rgb), 0.05);
        color: var(--cf-text-tertiary);
      }
      
      /* =========== 新增布局模式样式 =========== */
      
      /* 水平布局模式 - 用于标题/页脚区域 */
      .layout-horizontal.block-base {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 50px;
        padding: 6px 8px;
      }
      
      .layout-horizontal .block-icon {
        width: 36px;
        height: 36px;
        font-size: 1.2em;
      }
      
      .layout-horizontal .block-name {
        font-size: var(--cf-font-size-base);
        font-weight: var(--cf-font-weight-medium);
        color: var(--cf-text-primary);
        flex: 1;
        text-align: left;
      }
      
      .layout-horizontal .block-value {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-bold);
        margin-left: 4px;
      }
      
      /* 流式布局模式 */
      .layout-flow.block-base {
        grid-template-columns: auto 1fr;
        min-width: 120px;
      }
      
      /* 堆叠布局模式 */
      .layout-stack.block-base {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 4px;
        padding: 12px;
        min-height: 80px;
      }
      
      .layout-stack .block-icon {
        grid-column: 1;
        grid-row: 1;
        width: 48px;
        height: 48px;
        font-size: 1.6em;
      }
      
      .layout-stack .block-name {
        grid-column: 1;
        grid-row: 2;
        font-size: var(--cf-font-size-sm);
        margin-top: 4px;
      }
      
      .layout-stack .block-value {
        grid-column: 1;
        grid-row: 3;
        font-size: var(--cf-font-size-xl);
        font-weight: var(--cf-font-weight-bold);
      }
      
      /* 网格布局模式的块样式 */
      .layout-grid-2 .block-base,
      .layout-grid-3 .block-base,
      .layout-grid-4 .block-base {
        min-height: 70px;
        padding: 10px;
      }
      
      /* =========== 新增块样式 =========== */
      
      /* 紧凑样式 (默认) */
      .block-style-compact .block-base {
        /* 使用默认的紧凑网格布局 */
      }
      
      /* 水平样式 (用于内容区域) */
      .block-style-horizontal .block-base {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 60px;
        padding: 8px 10px;
      }
      
      .block-style-horizontal .block-icon {
        width: 40px;
        height: 40px;
        font-size: 1.3em;
      }
      
      .block-style-horizontal .block-name {
        flex: 1;
        font-size: var(--cf-font-size-sm);
        text-align: left;
      }
      
      .block-style-horizontal .block-value {
        font-size: var(--cf-font-size-lg);
        font-weight: var(--cf-font-weight-semibold);
      }
      
      /* 垂直样式 */
      .block-style-vertical .block-base {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 6px;
        min-height: 90px;
        padding: 12px;
      }
      
      .block-style-vertical .block-icon {
        width: 44px;
        height: 44px;
        font-size: 1.5em;
        margin-bottom: 4px;
      }
      
      .block-style-vertical .block-name {
        font-size: var(--cf-font-size-sm);
        font-weight: var(--cf-font-weight-medium);
      }
      
      .block-style-vertical .block-value {
        font-size: var(--cf-font-size-xl);
        font-weight: var(--cf-font-weight-bold);
      }
      
      /* =========== 区域对齐方式 =========== */
      .area-align-left .block-base {
        justify-content: flex-start;
        text-align: left;
      }
      
      .area-align-center .block-base {
        justify-content: center;
        text-align: center;
      }
      
      .area-align-right .block-base {
        justify-content: flex-end;
        text-align: right;
      }
      
      /* 响应式优化 */
      @container cardforge-container (max-width: 768px) {
        .layout-grid-3 .block-base,
        .layout-grid-4 .block-base {
          min-height: 60px;
          padding: 8px;
        }
        
        .layout-stack .block-icon {
          width: 40px;
          height: 40px;
          font-size: 1.4em;
        }
        
        .block-style-vertical .block-base {
          min-height: 80px;
          padding: 10px;
        }
        
        .block-style-vertical .block-icon {
          width: 36px;
          height: 36px;
          font-size: 1.3em;
        }
      }
      
      @container cardforge-container (max-width: 480px) {
        .layout-horizontal .block-base {
          min-height: 45px;
          padding: 4px 6px;
          gap: 8px;
        }
        
        .layout-horizontal .block-icon {
          width: 32px;
          height: 32px;
          font-size: 1.1em;
        }
        
        .layout-grid-2 .block-base,
        .layout-grid-3 .block-base,
        .layout-grid-4 .block-base {
          min-height: 55px;
          padding: 6px;
        }
        
        .layout-stack .block-base {
          min-height: 70px;
          padding: 8px;
        }
        
        .block-style-horizontal .block-base {
          min-height: 55px;
          padding: 6px 8px;
        }
        
        .block-style-vertical .block-base {
          min-height: 75px;
          padding: 8px;
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
    
    // 新增属性默认值
    this.layoutMode = 'flow';
    this.blockStyle = 'compact';
    this.areaAlign = 'center';
    
    this._displayName = '';
    this._displayValue = '';
    this._icon = 'mdi:cube-outline';
  }

  render() {
    const hasEntity = this.block?.entity && this.hass?.states?.[this.block.entity];
    const area = this.block?.area || 'content';
    
    // 生成CSS类名
    const layoutClass = `layout-${this.layoutMode}`;
    const styleClass = `block-style-${this.blockStyle}`;
    const alignClass = `area-align-${this.areaAlign}`;
    
    return html`
      <div class="block-base ${layoutClass} ${styleClass} ${alignClass} area-${area} ${this.compact ? 'compact' : ''}">
        <div class="block-icon">
          <ha-icon .icon=${this._icon}></ha-icon>
        </div>
        
        ${this.showName ? html`
          <div class="block-name">${this._displayName || ''}</div>
        ` : ''}
        
        ${this.showValue ? html`
          <div class="block-value">
            ${hasEntity ? this._displayValue : html`
              <!-- 优化空状态显示 -->
              <span class="empty-state">
                ${this.block.entity ? '未配置实体' : '点击编辑'}
              </span>
            `}
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
    
    // =========== 关键修复：优化显示名称逻辑 ===========
    this._displayName = this._getDisplayName();
    
    // =========== 关键修复：优化显示值逻辑 ===========
    this._displayValue = this._getDisplayValue();
    
    // 获取图标
    this._icon = this._getIcon();
  }

  _getDisplayName() {
    // 1. 优先使用块配置中的name
    if (this.block.name && this.block.name.trim()) {
      return this.block.name.trim();
    }
    
    // 2. 如果有实体，优先显示friendly_name
    if (this.block.entity && this.hass?.states?.[this.block.entity]) {
      const entity = this.hass.states[this.block.entity];
      const friendlyName = entity.attributes?.friendly_name;
      
      // 如果friendly_name包含中文，直接使用
      if (friendlyName && /[\u4e00-\u9fa5]/.test(friendlyName)) {
        // 移除可能存在的括号内容
        return friendlyName.replace(/\(.*?\)/g, '').trim();
      }
      
      // 否则使用实体ID的最后一部分（去掉下划线）
      const entityParts = this.block.entity.split('.');
      const lastPart = entityParts[entityParts.length - 1];
      return lastPart.replace(/_/g, ' ').replace(/\d+$/, '').trim();
    }
    
    // 3. 如果只有entity ID但没有实体
    if (this.block.entity) {
      const entityParts = this.block.entity.split('.');
      const lastPart = entityParts[entityParts.length - 1];
      return lastPart.replace(/_/g, ' ');
    }
    
    // 4. 默认名称
    return '新块';
  }

  _getDisplayValue() {
    if (!this.block.entity || !this.hass?.states?.[this.block.entity]) {
      return ''; // 返回空字符串，让渲染逻辑处理
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