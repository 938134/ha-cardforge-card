// src/editors/block-properties.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockSystem } from '../core/block-system.js';
import './form-builder.js';

class BlockProperties extends LitElement {
  static properties = {
    blockConfig: { type: Object },
    hass: { type: Object },
    availableEntities: { type: Array },
    _fieldSchema: { state: true },
    _entityInfo: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .block-properties {
        width: 100%;
      }

      .properties-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
      }

      .block-type-badge {
        padding: 4px 8px;
        background: var(--cf-primary-color);
        color: white;
        border-radius: var(--cf-radius-sm);
        font-size: 0.8em;
        font-weight: 500;
      }

      .entity-info {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        margin-top: 4px;
        line-height: 1.3;
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-sm);
      }
    `
  ];

  constructor() {
    super();
    this._fieldSchema = {};
    this._entityInfo = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('blockConfig')) {
      this._updateFieldSchema();
      this._updateEntityInfo();
    }
  }

  _updateFieldSchema() {
    if (!this.blockConfig) return;

    // 简化的字段配置 - 所有块类型使用相同的字段
    this._fieldSchema = {
      area: {
        type: 'select',
        label: '区域',
        options: ['header', 'content', 'footer'],
        default: 'content'
      },
      entity: {
        type: 'entity',
        label: '实体',
        default: ''
      },
      title: {
        type: 'text',
        label: '名称',
        default: ''
      },
      icon: {
        type: 'icon',
        label: '图标',
        default: ''
      }
      // 移除了 content 和 style 字段
    };
  }

  _updateEntityInfo() {
    if (!this.blockConfig?.entity || !this.hass) {
      this._entityInfo = null;
      return;
    }
    
    const entity = this.hass.states[this.blockConfig.entity];
    if (!entity) {
      this._entityInfo = { state: '实体未找到' };
      return;
    }
    
    this._entityInfo = {
      state: entity.state,
      unit: entity.attributes?.unit_of_measurement || '',
      friendlyName: entity.attributes?.friendly_name || this.blockConfig.entity
    };
  }

  render() {
    if (!this.blockConfig) {
      return html`<div class="cf-text-secondary">请选择一个块进行编辑</div>`;
    }

    const blockType = BlockSystem.detectBlockType(this.blockConfig);
    const blockTypeName = BlockSystem.getBlockDisplayName(this.blockConfig);

    return html`
      <div class="block-properties">
        <div class="properties-header">
          <div class="block-type-badge">${blockTypeName}</div>
          <div class="cf-text-sm cf-text-secondary">编辑块属性</div>
        </div>

        ${this._renderEntityInfo()}

        <form-builder
          .config=${this.blockConfig}
          .schema=${this._fieldSchema}
          .hass=${this.hass}
          .availableEntities=${this.availableEntities}
          @config-changed=${this._onConfigChanged}
        ></form-builder>
      </div>
    `;
  }

  _renderEntityInfo() {
    if (!this._entityInfo) return '';

    return html`
      <div class="entity-info">
        <div><strong>状态:</strong> ${this._entityInfo.state}</div>
        ${this._entityInfo.unit ? html`
          <div><strong>单位:</strong> ${this._entityInfo.unit}</div>
        ` : ''}
        ${this._entityInfo.friendlyName ? html`
          <div><strong>名称:</strong> ${this._entityInfo.friendlyName}</div>
        ` : ''}
      </div>
    `;
  }

  _onConfigChanged(e) {
    const updatedConfig = {
      ...this.blockConfig,
      ...e.detail.config
    };

    // 自动填充实体相关信息
    if (e.detail.config.entity && this.hass) {
      const autoFilledConfig = BlockSystem.autoFillFromEntity(updatedConfig, this.hass);
      this.dispatchEvent(new CustomEvent('block-config-changed', {
        detail: { blockConfig: autoFilledConfig }
      }));
    } else {
      this.dispatchEvent(new CustomEvent('block-config-changed', {
        detail: { blockConfig: updatedConfig }
      }));
    }
  }
}

if (!customElements.get('block-properties')) {
  customElements.define('block-properties', BlockProperties);
}

export { BlockProperties };
