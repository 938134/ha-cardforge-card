// src/editors/layout-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { LayoutEngine } from '../core/layout-engine.js';
import { BlockManager } from '../core/block-manager.js';

export class LayoutEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _currentMode: { state: true },
    _contentBlocks: { state: true },
    _dataSourceOptions: { state: true },
    _headerFields: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .layout-editor {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .header-section {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        margin-bottom: var(--cf-spacing-md);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-md);
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .fields-grid {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .field-row {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: var(--cf-spacing-md);
        align-items: start;
      }

      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        padding-top: var(--cf-spacing-sm);
      }

      .entity-driven-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .requirement-field {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
      }

      .requirement-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-sm);
      }

      .requirement-name {
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .requirement-description {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        margin-top: 2px;
      }

      .entity-picker-container {
        display: flex;
        gap: var(--cf-spacing-sm);
      }

      .icon-picker-container {
        flex-shrink: 0;
      }

      .info-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        text-align: center;
      }

      .info-icon {
        font-size: 2em;
        color: var(--cf-primary-color);
        margin-bottom: var(--cf-spacing-md);
      }

      .info-title {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
        color: var(--cf-text-primary);
      }

      @media (max-width: 600px) {
        .field-row {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .entity-picker-container {
          flex-direction: column;
        }
      }
    `
  ];

  constructor() {
    super();
    this._currentMode = 'entity_driven';
    this._contentBlocks = [];
    this._dataSourceOptions = {};
    this._headerFields = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest')) {
      this._currentMode = LayoutEngine.detectMode(this.pluginManifest);
      this._dataSourceOptions = LayoutEngine.getDataSourceOptions(this.pluginManifest);
      this._updateHeaderFields();
    }
    
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._contentBlocks = BlockManager.deserializeFromEntities(this.config.entities);
    }
  }

  render() {
    if (!this.pluginManifest) {
      return this._renderNoPlugin();
    }

    return html`
      <div class="layout-editor">
        ${this._renderHeaderSection()}
        ${this._renderContentSection()}
      </div>
    `;
  }

  _renderHeaderSection() {
    if (!this._dataSourceOptions.supportsTitle && 
        !this._dataSourceOptions.supportsSubtitle && 
        !this._dataSourceOptions.supportsFooter) {
      return '';
    }

    return html`
      <div class="header-section">
        <div class="section-title">
          <ha-icon icon="mdi:card-text-outline"></ha-icon>
          卡片文本配置
        </div>
        
        <div class="fields-grid">
          ${this._dataSourceOptions.supportsTitle ? this._renderHeaderField('title', '标题') : ''}
          ${this._dataSourceOptions.supportsSubtitle ? this._renderHeaderField('subtitle', '副标题') : ''}
          ${this._dataSourceOptions.supportsFooter ? this._renderHeaderField('footer', '页脚') : ''}
        </div>
      </div>
    `;
  }

  _renderHeaderField(field, label) {
    const value = this._getEntityValue(field);
    
    return html`
      <div class="field-row">
        <div class="field-label">${label}</div>
        <div class="field-control">
          <ha-textfield
            .value=${value}
            @input=${e => this._onHeaderFieldChanged(field, e.target.value)}
            label=${`${label}文本或实体ID`}
            fullwidth
          ></ha-textfield>
        </div>
      </div>
    `;
  }

  _renderContentSection() {
    if (this._currentMode === 'free') {
      return this._renderFreeLayout();
    } else {
      return this._renderEntityDriven();
    }
  }

  _renderFreeLayout() {
    return html`
      <div class="header-section">
        <div class="section-title">
          <ha-icon icon="mdi:view-grid-plus"></ha-icon>
          内容块管理
        </div>
        
        <block-editor
          .blocks=${this._contentBlocks}
          .hass=${this.hass}
          @blocks-changed=${this._onBlocksChanged}
        ></block-editor>
      </div>
    `;
  }

  _renderEntityDriven() {
    const requirements = this.pluginManifest?.entity_requirements || {};
    
    if (Object.keys(requirements).length === 0) {
      return this._renderNoRequirements();
    }

    return html`
      <div class="header-section">
        <div class="section-title">
          <ha-icon icon="mdi:database-cog"></ha-icon>
          数据源配置
        </div>
        
        <div class="entity-driven-section">
          ${Object.entries(requirements).map(([key, requirement]) => 
            this._renderRequirementField(key, requirement)
          )}
        </div>
      </div>
    `;
  }

  _renderRequirementField(key, requirement) {
    const value = this._getEntityValue(key);
    const entityState = value ? this.hass?.states[value] : null;
    
    return html`
      <div class="requirement-field">
        <div class="requirement-header">
          <div>
            <div class="requirement-name">${requirement.name}</div>
            ${requirement.description ? html`
              <div class="requirement-description">${requirement.description}</div>
            ` : ''}
          </div>
        </div>
        
        <div class="entity-picker-container">
          <ha-entity-picker
            .hass=${this.hass}
            .value=${value}
            @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
            .label=${`选择${requirement.name}`}
            allow-custom-entity
            fullwidth
          ></ha-entity-picker>
          
          ${value ? html`
            <div class="icon-picker-container">
              <ha-icon-picker
                .value=${this._headerFields[key]?.icon || 'mdi:cube'}
                @value-changed=${e => this._onEntityIconChanged(key, e.detail.value)}
                .label=${`${requirement.name}图标`}
              ></ha-icon-picker>
            </div>
          ` : ''}
        </div>
        
        ${value && entityState ? html`
          <div style="margin-top: var(--cf-spacing-sm); font-size: 0.85em; color: var(--cf-text-secondary);">
            当前状态: ${entityState.state}
            ${entityState.attributes.unit_of_measurement ? ` ${entityState.attributes.unit_of_measurement}` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderNoPlugin() {
    return html`
      <div class="info-card">
        <ha-icon class="info-icon" icon="mdi:palette"></ha-icon>
        <div class="info-title">选择卡片类型</div>
        <div class="cf-text-sm cf-text-secondary">请先选择要使用的卡片类型</div>
      </div>
    `;
  }

  _renderNoRequirements() {
    return html`
      <div class="info-card">
        <ha-icon class="info-icon" icon="mdi:auto-fix"></ha-icon>
        <div class="info-title">智能数据源</div>
        <div class="cf-text-sm cf-text-secondary">此卡片无需特殊数据源配置</div>
      </div>
    `;
  }

  _updateHeaderFields() {
    this._headerFields = this.config.entities?._header_fields || {};
  }

  _getEntityValue(key) {
    const value = this.config.entities?.[key];
    if (value && typeof value === 'object') return value._source || value.state || '';
    return value || '';
  }

  _onHeaderFieldChanged(field, value) {
    this._updateEntities({ [field]: value });
  }

  _onEntityChanged(key, value) {
    this._updateEntities({ [key]: value });
    
    // 自动设置图标
    if (value && this.hass?.states[value]) {
      const entity = this.hass.states[value];
      const defaultIcon = entity.attributes.icon || 'mdi:cube';
      this._updateHeaderFieldsConfig(key, 'icon', defaultIcon);
    }
  }

  _onEntityIconChanged(key, icon) {
    this._updateHeaderFieldsConfig(key, 'icon', icon);
  }

  _onBlocksChanged(e) {
    const blocks = e.detail.blocks;
    const entities = BlockManager.serializeToEntities(blocks);
    this._updateEntities(entities);
  }

  _updateEntities(entities) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: { ...this.config.entities, ...entities } }
    }));
  }

  _updateHeaderFieldsConfig(key, field, value) {
    const headerFields = { ...this._headerFields };
    if (!headerFields[key]) headerFields[key] = {};
    headerFields[key][field] = value;
    
    this._headerFields = headerFields;
    this._updateEntities({ _header_fields: headerFields });
  }
}

if (!customElements.get('layout-editor')) {
  customElements.define('layout-editor', LayoutEditor);
}