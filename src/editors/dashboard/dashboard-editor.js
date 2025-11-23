// src/editors/dashboard/dashboard-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';
import './layout-presets.js';
import './block-list.js';
import './inline-editor.js';

export class DashboardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _allBlocks: { state: true },
    _selectedLayout: { state: true },
    _contentAlignment: { state: true },
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

      .editor-section {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid var(--cf-primary-color);
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .section-description {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        margin-top: var(--cf-spacing-xs);
      }

      .add-btn {
        padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        background: var(--cf-primary-color);
        color: white;
        border: none;
        border-radius: var(--cf-radius-sm);
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .add-btn:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }

      .layout-config {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .config-row {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: var(--cf-spacing-md);
        align-items: center;
      }

      .config-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
      }

      @media (max-width: 768px) {
        .config-row {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._allBlocks = [];
    this._selectedLayout = '2x2';
    this._contentAlignment = 'center';
    this._editingBlock = null;
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._allBlocks = BlockManager.deserializeFromEntities(this.config.entities);
      this._selectedLayout = this.config.layout || '2x2';
      this._contentAlignment = this.config.content_alignment || 'center';
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    return html`
      <div class="dashboard-editor">
        <!-- 布局配置 -->
        <div class="editor-section">
          <div class="section-header">
            <div>
              <div class="section-title">
                <ha-icon icon="mdi:view-grid"></ha-icon>
                <span>内容区域布局</span>
              </div>
              <div class="section-description">配置内容块的网格布局和对齐方式</div>
            </div>
          </div>
          
          <div class="layout-config">
            <div class="config-row">
              <label class="config-label">网格布局</label>
              <layout-presets
                .selectedLayout=${this._selectedLayout}
                .blocks=${this._allBlocks}
                @layout-changed=${e => this._onLayoutChanged(e.detail.layout)}
              ></layout-presets>
            </div>
            
            <div class="config-row">
              <label class="config-label">内容对齐</label>
              <ha-select
                .value=${this._contentAlignment}
                @closed=${this._preventClose}
                naturalMenuWidth
                fixedMenuPosition
              >
                <ha-list-item 
                  .value=${'center'}
                  @click=${() => this._onAlignmentChanged('center')}
                >
                  居中
                </ha-list-item>
                <ha-list-item 
                  .value=${'compact'}
                  @click=${() => this._onAlignmentChanged('compact')}
                >
                  紧凑
                </ha-list-item>
                <ha-list-item 
                  .value=${'stretch'}
                  @click=${() => this._onAlignmentChanged('stretch')}
                >
                  拉伸
                </ha-list-item>
              </ha-select>
            </div>
          </div>
        </div>

        <!-- 块管理 -->
        <div class="editor-section">
          <div class="section-header">
            <div>
              <div class="section-title">
                <ha-icon icon="mdi:cube"></ha-icon>
                <span>数据源配置</span>
              </div>
              <div class="section-description">管理标题、内容和页脚块</div>
            </div>
            <button class="add-btn" @click=${this._addContentBlock}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加块
            </button>
          </div>
          
          <block-list
            .hass=${this.hass}
            .blocks=${this._allBlocks}
            .availableEntities=${this._availableEntities}
            .layout=${this._selectedLayout}
            @blocks-changed=${e => this._onBlocksChanged(e.detail.blocks)}
            @edit-block=${e => this._onEditBlock(e.detail.block)}
          ></block-list>

          <!-- 内联编辑器 -->
          ${this._editingBlock ? html`
            <div style="margin-top: var(--cf-spacing-lg);">
              <div class="section-header">
                <ha-icon icon="mdi:pencil"></ha-icon>
                <span>编辑块</span>
              </div>
              
              <inline-editor
                .hass=${this.hass}
                .block=${this._editingBlock}
                .availableEntities=${this._availableEntities}
                .layout=${this._selectedLayout}
                @block-saved=${e => this._saveBlock(e.detail.block)}
                @edit-cancelled=${() => this._cancelEdit()}
              ></inline-editor>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _addContentBlock() {
    const newBlock = BlockManager.createBlock('text');
    newBlock.config = { ...newBlock.config, blockType: 'content' };
    newBlock.position = BlockManager.getNextPosition(
      this._allBlocks.filter(b => !b.config?.blockType || b.config.blockType === 'content'),
      this._selectedLayout
    );
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

  _onLayoutChanged(layout) {
    this._selectedLayout = layout;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { layout } }
    }));
  }

  _onAlignmentChanged(alignment) {
    this._contentAlignment = alignment;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { content_alignment: alignment } }
    }));
  }

  _onBlocksChanged(blocks) {
    this._allBlocks = blocks;
    this._saveAllBlocks();
  }

  _onEditBlock(block) {
    this._editingBlock = block;
  }

  _saveBlock(updatedBlock) {
    this._allBlocks = this._allBlocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._editingBlock = null;
    this._saveAllBlocks();
  }

  _cancelEdit() {
    this._editingBlock = null;
  }

  _saveAllBlocks() {
    const entities = BlockManager.serializeToEntities(this._allBlocks);
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }

  _preventClose(e) {
    e.stopPropagation();
  }
}

if (!customElements.get('dashboard-editor')) {
  customElements.define('dashboard-editor', DashboardEditor);
}