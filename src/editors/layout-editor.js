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

      .free-layout-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .header-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .field-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: grid;
        grid-template-columns: 25% 75%;
        gap: var(--cf-spacing-md);
        align-items: center;
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

      @media (max-width: 600px) {
        .entity-row {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }

        .header-fields {
          grid-template-columns: 1fr;
        }

        .field-card {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._currentMode = 'entity_driven';
    this._contentBlocks = [];
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest')) {
      this._currentMode = LayoutEngine.detectMode(this.pluginManifest);
    }
    
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._contentBlocks = BlockManager.deserializeFromEntities(this.config.entities);
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    if (!this.pluginManifest) {
      return this._renderNoPlugin();
    }

    return html`
      <div class="layout-editor">
        ${this._currentMode === 'free' 
          ? this._renderFreeLayout()
          : this._renderEntityDriven()
        }
      </div>
    `;
  }

  _renderFreeLayout() {
    const capabilities = this._getPluginCapabilities();
    
    return html`
      ${capabilities.supportsTitle || capabilities.supportsFooter ? html`
        <div class="header-fields">
          ${capabilities.supportsTitle ? html`
            <div class="field-card">
              <div class="entity-label">标题</div>
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this._getEntityValue('title')}
                @value-changed=${e => this._onHeaderFieldChanged('title', e.detail.value)}
                allow-custom-value
                label="标题文本或实体"
              ></ha-combo-box>
            </div>
            <div class="field-card">
              <div class="entity-label">副标题</div>
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this._getEntityValue('subtitle')}
                @value-changed=${e => this._onHeaderFieldChanged('subtitle', e.detail.value)}
                allow-custom-value
                label="副标题文本或实体"
              ></ha-combo-box>
            </div>
          ` : ''}
          
          ${capabilities.supportsFooter ? html`
            <div class="field-card">
              <div class="entity-label">页脚</div>
              <ha-combo-box
                .items=${this._availableEntities}
                .value=${this._getEntityValue('footer')}
                @value-changed=${e => this._onHeaderFieldChanged('footer', e.detail.value)}
                allow-custom-value
                label="页脚文本或实体"
              ></ha-combo-box>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <div class="free-layout-section">
        <block-editor
          .blocks=${this._contentBlocks}
          .hass=${this.hass}
          .availableEntities=${this._availableEntities}
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

  _renderNoPlugin() {
    return html`
      <div class="info-card">
        <ha-icon class="info-icon" icon="mdi:palette"></ha-icon>
        <div class="info-title">选择卡片类型</div>
        <div class="info-description">请先选择一个卡片插件来配置数据源</div>
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

  _getPluginCapabilities() {
    return this.pluginManifest?.capabilities || {
      supportsTitle: true,
      supportsFooter: true
    };
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

  _getEntityValue(key) {
    const value = this.config.entities?.[key];
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      return value._source || value.state || '';
    }
    return value || '';
  }

  _onHeaderFieldChanged(field, value) {
    this._updateEntities({ [field]: value });
  }

  _onEntityChanged(key, value) {
    // 修复：只更新当前字段，不覆盖其他字段
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