// src/editors/layout-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { BlockManager } from '../core/block-manager.js';

export class LayoutEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _contentBlocks: { state: true },
    _availableEntities: { state: true }
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

      /* 普通卡片实体配置样式 */
      .entity-driven-form {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .entity-row {
        display: grid;
        grid-template-columns: 25% 75%;
        gap: var(--cf-spacing-md);
        align-items: center;
      }

      .entity-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-xs);
      }

      .required-star {
        color: var(--cf-error-color);
      }

      .entity-control {
        width: 100%;
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

      .info-description {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }

      /* 仪表盘布局设计样式 */
      .layout-info {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .current-layout {
        font-weight: 500;
        color: var(--cf-primary-color);
      }

      .blocks-section {
        margin-top: var(--cf-spacing-lg);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-md);
        color: var(--cf-text-primary);
      }

      @media (max-width: 768px) {
        .entity-row {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._contentBlocks = [];
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._contentBlocks = BlockManager.deserializeFromEntities(this.config.entities);
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    const isDashboard = this.pluginManifest?.free_layout;
    
    if (!isDashboard) {
      return this._renderEntityDriven();
    }

    return html`
      <div class="layout-editor">
        <div class="layout-info">
          <div class="cf-text-sm cf-text-secondary">当前布局</div>
          <div class="current-layout">${this._getLayoutDisplayName()}</div>
        </div>

        <div class="blocks-section">
          <div class="section-title">内容块管理</div>
          <block-editor
            .blocks=${this._contentBlocks}
            .hass=${this.hass}
            .availableEntities=${this._availableEntities}
            .layout=${this.config.layout || '2x2'}
            @blocks-changed=${this._onBlocksChanged}
          ></block-editor>
        </div>
      </div>
    `;
  }

  _getLayoutDisplayName() {
    const layout = this.config.layout || '2x2';
    const preset = BlockManager.LAYOUT_PRESETS[layout];
    return preset ? `${preset.name} (${preset.cols}×${preset.rows})` : '未知布局';
  }

  _renderEntityDriven() {
    const requirements = this.pluginManifest?.entity_requirements || {};
    
    if (Object.keys(requirements).length === 0) {
      return this._renderNoRequirements();
    }

    return html`
      <div class="entity-driven-form">
        ${Object.entries(requirements).map(([key, requirement]) => {
          const currentValue = this._getEntityValue(key);
          
          return html`
            <div class="entity-row">
              <div class="entity-label">
                ${requirement.name}
                ${requirement.required ? html`<span class="required-star">*</span>` : ''}
              </div>
              <div class="entity-control">
                <ha-combo-box
                  .items=${this._availableEntities}
                  .value=${currentValue}
                  @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
                  allow-custom-value
                  label=${`选择 ${requirement.name}`}
                ></ha-combo-box>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  _renderNoRequirements() {
    return html`
      <div class="info-card">
        <ha-icon class="info-icon" icon="mdi:auto-fix"></ha-icon>
        <div class="info-title">智能数据源</div>
        <div class="info-description">此卡片会自动处理数据源，无需额外配置</div>
      </div>
    `;
  }

  _getEntityValue(key) {
    const value = this.config.entities?.[key];
    if (typeof value === 'string') {
      return value;
    }
    return value || '';
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

  _onEntityChanged(key, value) {
    const updatedEntities = { 
      ...this.config.entities,
      [key]: value 
    };
    this._updateEntities(updatedEntities);
  }

  _onBlocksChanged(e) {
    const blocks = e.detail.blocks;
    const entities = BlockManager.serializeToEntities(blocks);
    this._updateEntities(entities);
  }

  _updateEntities(entities) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }
}

if (!customElements.get('layout-editor')) {
  customElements.define('layout-editor', LayoutEditor);
}