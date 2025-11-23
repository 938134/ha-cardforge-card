// src/editors/standard-card/entity-mapping-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';

export class EntityMappingEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _availableEntities: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .entity-mapping-editor {
        width: 100%;
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
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    const requirements = this.pluginManifest?.entity_requirements || {};
    
    if (Object.keys(requirements).length === 0) {
      return this._renderNoRequirements();
    }

    return html`
      <div class="entity-mapping-editor">
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
    if (value && typeof value === 'object') {
      return value._source || value.state || '';
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
    
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: updatedEntities }
    }));
  }
}

if (!customElements.get('entity-mapping-editor')) {
  customElements.define('entity-mapping-editor', EntityMappingEditor);
}