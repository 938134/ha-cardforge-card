// src/editors/dashboard/dashboard-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';
import './block-list.js';

export class DashboardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _allBlocks: { state: true },
    _editingBlock: { state: true },
    _availableEntities: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .dashboard-editor {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }
    `
  ];

  constructor() {
    super();
    this._allBlocks = [];
    this._editingBlock = null;
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._allBlocks = BlockManager.deserializeFromEntities(this.config.entities);
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    return html`
      <div class="dashboard-editor">
        <block-list
          .hass=${this.hass}
          .blocks=${this._allBlocks}
          .availableEntities=${this._availableEntities}
          @blocks-changed=${e => this._onBlocksChanged(e.detail.blocks)}
          @edit-block=${e => this._onEditBlock(e.detail.block)}
          @add-block=${this._addContentBlock}
        ></block-list>
      </div>
    `;
  }

  _addContentBlock = () => {
    const newBlock = BlockManager.createBlock('text');
    newBlock.config = { ...newBlock.config, blockType: 'content' };
    this._allBlocks = [...this._allBlocks, newBlock];
    this._saveAllBlocks();
    this._editingBlock = newBlock;
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

  _onBlocksChanged(blocks) {
    this._allBlocks = blocks;
    this._saveAllBlocks();
  }

  _onEditBlock(block) {
    this._editingBlock = block;
  }

  _saveAllBlocks() {
    const entities = BlockManager.serializeToEntities(this._allBlocks);
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }
}

if (!customElements.get('dashboard-editor')) {
  customElements.define('dashboard-editor', DashboardEditor);
}