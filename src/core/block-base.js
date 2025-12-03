// src/core/block-base.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from './design-system.js';

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
      :host {
        display: block;
      }
      
      .block-base {
        display: flex;
        align-items: center;
        gap: var(--cf-block-gap);
        padding: var(--cf-block-padding);
        background: var(--cf-block-bg);
        border-radius: var(--cf-block-radius);
        min-height: 60px;
        transition: all var(--cf-transition-fast);
      }
      
      .block-base.compact {
        min-height: 50px;
        padding: 8px;
      }
      
      .block-base:hover {
        background: rgba(var(--cf-rgb-primary), 0.05);
      }
      
      .block-icon {
        font-size: 1.5em;
        color: var(--cf-text-secondary);
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.1);
      }
      
      .block-base.compact .block-icon {
        font-size: 1.2em;
        width: 32px;
        height: 32px;
      }
      
      .block-content {
        flex: 1;
        min-width: 0;
      }
      
      .block-name {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .block-base.compact .block-name {
        font-size: 0.8em;
        margin-bottom: 2px;
      }
      
      .block-value {
        font-size: 1.2em;
        font-weight: 500;
        color: var(--cf-text-primary);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .block-base.compact .block-value {
        font-size: 1em;
      }
      
      .block-entity {
        font-size: 0.75em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        margin-top: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .block-area {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: var(--cf-surface);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        margin-top: 4px;
        display: inline-block;
      }
      
      /* 预设块样式 */
      .preset-badge {
        background: rgba(var(--cf-rgb-primary), 0.1);
        color: var(--cf-primary-color);
        font-size: 0.7em;
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        margin-left: 6px;
      }
      
      .required-badge {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
        font-size: 0.7em;
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
        margin-left: 4px;
      }
      
      /* 空状态 */
      .empty-state {
        color: var(--cf-text-secondary);
        font-style: italic;
      }
      
      /* 响应式 */
      @container cardforge-container (max-width: 400px) {
        .block-base {
          flex-direction: column;
          text-align: center;
          gap: 8px;
          padding: 10px;
        }
        
        .block-name {
          font-size: 0.8em;
          margin-bottom: 2px;
        }
        
        .block-value {
          font-size: 1em;
        }
        
        .block-icon {
          width: 36px;
          height: 36px;
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
    const isPreset = this.block?.presetKey;
    const isRequired = this.block?.required;
    
    return html`
      <div class="block-base ${this.compact ? 'compact' : ''}">
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
          
          ${this.block?.entity && !this.compact ? html`
            <div class="block-entity" title="${this.block.entity}">
              ${this._truncateText(this.block.entity, 24)}
            </div>
          ` : ''}
          
          ${this.block?.area && !this.compact && this.block.area !== 'content' ? html`
            <span class="block-area">${this._getAreaLabel(this.block.area)}</span>
          ` : ''}
        </div>
        
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
    const iconMap = {
      light: 'mdi:lightbulb',
      switch: 'mdi:power',
      sensor: 'mdi:gauge',
      binary_sensor: 'mdi:toggle-switch',
      climate: 'mdi:thermostat',
      cover: 'mdi:blinds',
      media_player: 'mdi:speaker',
      vacuum: 'mdi:robot-vacuum',
      text_sensor: 'mdi:text-box',
      person: 'mdi:account',
      device_tracker: 'mdi:account',
      sun: 'mdi:white-balance-sunny',
      weather: 'mdi:weather-partly-cloudy'
    };
    
    return iconMap[domain] || 'mdi:cube';
  }

  _getAreaLabel(areaId) {
    const areaMap = {
      header: '标题区',
      content: '内容区',
      footer: '页脚区',
      sidebar: '侧边栏'
    };
    
    return areaMap[areaId] || areaId;
  }

  _truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '…';
  }

  // 获取实体信息（供外部调用）
  getEntityInfo() {
    if (!this.block?.entity || !this.hass?.states?.[this.block.entity]) {
      return null;
    }
    
    const entity = this.hass.states[this.block.entity];
    return {
      state: entity.state,
      unit: entity.attributes?.unit_of_measurement || '',
      friendly_name: entity.attributes?.friendly_name || this.block.entity,
      icon: entity.attributes?.icon || this._getIcon()
    };
  }
}

if (!customElements.get('block-base')) {
  customElements.define('block-base', BlockBase);
}
