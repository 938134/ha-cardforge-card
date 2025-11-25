// src/editors/block-properties.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockManager } from '../core/block-manager.js';

class BlockProperties extends LitElement {
  static properties = {
    block: { type: Object },
    hass: { type: Object },
    _availableEntities: { state: true },
    _editingBlock: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .properties-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        height: 100%;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .block-header {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
      }

      .header-top {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-icon {
        font-size: 1.2em;
      }

      .block-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .block-type {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 8px;
        border-radius: var(--cf-radius-sm);
      }

      .block-description {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }

      .property-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        overflow-y: auto;
        flex: 1;
      }

      .property-group {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .group-title {
        font-size: 0.9em;
        font-weight: 600;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .group-title ha-icon {
        color: var(--cf-primary-color);
      }

      .property-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .property-label {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .property-hint {
        font-size: 0.75em;
        color: var(--cf-text-secondary);
        font-style: italic;
      }

      .no-config {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .actions {
        display: flex;
        gap: var(--cf-spacing-sm);
        margin-top: auto;
        padding-top: var(--cf-spacing-lg);
        border-top: 1px solid var(--cf-border);
      }
    `
  ];

  constructor() {
    super();
    this._availableEntities = [];
    this._editingBlock = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('block')) {
      this._editingBlock = this.block ? { ...this.block } : null;
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    if (!this._editingBlock) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:select" style="font-size: 3em; opacity: 0.3;"></ha-icon>
          <div class="cf-text-md cf-mt-md">请选择一个块</div>
          <div class="cf-text-sm cf-mt-sm cf-text-secondary">从左侧块管理面板选择块进行配置</div>
        </div>
      `;
    }

    const blockManifest = blockManager.getBlockManifest(this._editingBlock.type);
    const schema = blockManifest?.config_schema || {};
    
    return html`
      <div class="properties-container">
        <!-- 块头部信息 -->
        <div class="block-header">
          <div class="header-top">
            <div class="block-icon">${blockManifest?.icon || '📦'}</div>
            <div class="block-title">${blockManifest?.name || this._editingBlock.type}</div>
            <div class="block-type">${this._editingBlock.type}</div>
          </div>
          <div class="block-description">
            ${blockManifest?.description || '暂无描述'}
          </div>
        </div>

        <!-- 配置表单 -->
        ${Object.keys(schema).length === 0 ? html`
          <div class="no-config">
            <ha-icon icon="mdi:check-circle" style="color: var(--cf-success-color);"></ha-icon>
            <div class="cf-text-sm cf-mt-sm">此块无需额外配置</div>
          </div>
        ` : html`
          <div class="property-form">
            ${this._renderConfigGroups(schema)}
          </div>
        `}

        <!-- 操作按钮 -->
        <div class="actions">
          <mwc-button 
            class="warning" 
            @click=${this._deleteBlock}
            outlined
          >
            <ha-icon icon="mdi:delete" slot="icon"></ha-icon>
            删除块
          </mwc-button>
        </div>
      </div>
    `;
  }

  _renderConfigGroups(schema) {
    const groups = {
      basic: { title: '基础设置', icon: 'mdi:cog', fields: [] },
      display: { title: '显示设置', icon: 'mdi:palette', fields: [] },
      advanced: { title: '高级设置', icon: 'mdi:toolbox', fields: [] }
    };

    // 简单分组逻辑 - 根据字段名和类型分组
    Object.entries(schema).forEach(([key, field]) => {
      if (key.includes('entity') || key.includes('content')) {
        groups.basic.fields.push([key, field]);
      } else if (key.includes('color') || key.includes('size') || key.includes('align')) {
        groups.display.fields.push([key, field]);
      } else {
        groups.advanced.fields.push([key, field]);
      }
    });

    return Object.entries(groups)
      .filter(([_, group]) => group.fields.length > 0)
      .map(([groupId, group]) => html`
        <div class="property-group">
          <div class="group-title">
            <ha-icon icon="${group.icon}"></ha-icon>
            ${group.title}
          </div>
          ${group.fields.map(([key, field]) => this._renderConfigField(key, field))}
        </div>
      `);
  }

  _renderConfigField(key, field) {
    const currentValue = this._editingBlock.config?.[key] ?? field.default;
    
    switch (field.type) {
      case 'boolean':
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-switch
              .checked=${!!currentValue}
              @change=${e => this._updateConfig(key, e.target.checked)}
            ></ha-switch>
            ${field.description ? html`<div class="property-hint">${field.description}</div>` : ''}
          </div>
        `;

      case 'select':
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-select
              .value=${currentValue}
              naturalMenuWidth
              fixedMenuPosition
              fullwidth
              @change=${e => this._updateConfig(key, e.target.value)}
            >
              ${field.options.map(option => html`
                <ha-list-item .value=${option}>${option}</ha-list-item>
              `)}
            </ha-select>
            ${field.description ? html`<div class="property-hint">${field.description}</div>` : ''}
          </div>
        `;

      case 'entity':
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-entity-picker
              .hass=${this.hass}
              .value=${currentValue}
              @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
              allow-custom-entity
            ></ha-entity-picker>
            ${field.description ? html`<div class="property-hint">${field.description}</div>` : ''}
          </div>
        `;

      case 'icon':
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-icon-picker
              .value=${currentValue}
              @value-changed=${e => this._updateConfig(key, e.detail.value)}
            ></ha-icon-picker>
            ${field.description ? html`<div class="property-hint">${field.description}</div>` : ''}
          </div>
        `;

      default: // string, number
        return html`
          <div class="property-field">
            <label class="property-label">${field.label}</label>
            <ha-textfield
              .value=${currentValue}
              @input=${e => this._updateConfig(key, e.target.value)}
              .type=${field.type === 'number' ? 'number' : 'text'}
              fullwidth
              placeholder=${field.placeholder || field.default || ''}
            ></ha-textfield>
            ${field.description ? html`<div class="property-hint">${field.description}</div>` : ''}
          </div>
        `;
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: `${state.attributes?.friendly_name || entityId} (${entityId})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  _onEntityChanged(key, entityId) {
    this._updateConfig(key, entityId);
    
    // 自动填充实体相关信息
    if (entityId && this.hass?.states?.[entityId]) {
      const entity = this.hass.states[entityId];
      
      // 自动填充名称
      if (!this._editingBlock.config.name && entity.attributes?.friendly_name) {
        this._updateConfig('name', entity.attributes.friendly_name);
      }
      
      // 自动填充图标
      if (!this._editingBlock.config.icon && entity.attributes?.icon) {
        this._updateConfig('icon', entity.attributes.icon);
      }
    }
  }

  _updateConfig(key, value) {
    if (!this._editingBlock) return;
    
    this._editingBlock = {
      ...this._editingBlock,
      config: {
        ...this._editingBlock.config,
        [key]: value
      }
    };
    
    this._notifyBlockUpdated();
  }

  _deleteBlock() {
    if (this._editingBlock) {
      this.dispatchEvent(new CustomEvent('block-deleted', {
        detail: { blockId: this._editingBlock.id }
      }));
    }
  }

  _notifyBlockUpdated() {
    this.dispatchEvent(new CustomEvent('block-updated', {
      detail: { block: this._editingBlock }
    }));
  }
}

if (!customElements.get('block-properties')) {
  customElements.define('block-properties', BlockProperties);
}

export { BlockProperties };
