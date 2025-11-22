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
    _availableEntities: { state: true },
    _selectedLayout: { state: true }
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

      .layout-presets {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
      }

      .layout-preset {
        aspect-ratio: 1;
        border: 2px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        padding: var(--cf-spacing-sm);
        background: var(--cf-surface);
      }

      .layout-preset:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .layout-preset.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .layout-preview {
        flex: 1;
        width: 100%;
        display: grid;
        gap: 2px;
        margin-bottom: 4px;
      }

      .layout-name {
        font-size: 0.7em;
        text-align: center;
        color: var(--cf-text-secondary);
      }

      .layout-content {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
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
        .layout-presets {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `
  ];

  constructor() {
    super();
    this._contentBlocks = [];
    this._availableEntities = [];
    this._selectedLayout = '2x2';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config') || changedProperties.has('hass')) {
      this._contentBlocks = BlockManager.deserializeFromEntities(this.config.entities);
    }
    
    if (changedProperties.has('config')) {
      this._selectedLayout = this.config.layout || '2x2';
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    return html`
      <div class="layout-editor">
        <div class="layout-presets-section">
          <div class="section-title">选择布局</div>
          <div class="layout-presets">
            ${Object.entries(BlockManager.LAYOUT_PRESETS).map(([key, preset]) => html`
              <div 
                class="layout-preset ${this._selectedLayout === key ? 'selected' : ''}"
                @click=${() => this._selectLayout(key)}
                title="${preset.name}"
              >
                <div class="layout-preview" style="
                  grid-template-columns: repeat(${preset.cols}, 1fr);
                  grid-template-rows: repeat(${preset.rows}, 1fr);
                ">
                  ${Array.from({ length: preset.rows * preset.cols }, (_, i) => html`
                    <div style="background: var(--cf-border); border-radius: 1px;"></div>
                  `)}
                </div>
                <div class="layout-name">${preset.cols}×${preset.rows}</div>
              </div>
            `)}
          </div>
        </div>

        <div class="layout-content">
          <div class="blocks-section">
            <div class="section-title">内容块管理</div>
            <block-editor
              .blocks=${this._contentBlocks}
              .hass=${this.hass}
              .availableEntities=${this._availableEntities}
              .layout=${this._selectedLayout}
              @blocks-changed=${this._onBlocksChanged}
            ></block-editor>
          </div>
        </div>
      </div>
    `;
  }

  _selectLayout(layout) {
    this._selectedLayout = layout;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { layout } }
    }));
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