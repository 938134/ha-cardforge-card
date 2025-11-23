// src/editors/dashboard/dashboard-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../../core/design-system.js';
import { BlockManager } from './block-manager.js';
import './layout-presets.js';
import './block-editor.js';
import './inline-block-editor.js';

export class DashboardEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _contentBlocks: { state: true },
    _selectedLayout: { state: true },
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
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid var(--cf-primary-color);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
      }

      .grid-preview {
        display: grid;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        min-height: 120px;
      }

      .grid-cell {
        background: var(--cf-surface);
        border: 1px dashed var(--cf-border);
        border-radius: var(--cf-radius-sm);
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .grid-cell.occupied {
        border-style: solid;
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .cell-label {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        position: absolute;
        top: 2px;
        left: 4px;
      }

      .block-count {
        position: absolute;
        top: 2px;
        right: 4px;
        font-size: 0.7em;
        color: var(--cf-text-secondary);
      }

      .stats-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        margin-bottom: var(--cf-spacing-md);
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }

      .stat-value {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-primary-color);
      }

      .stat-label {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
      }

      @media (max-width: 768px) {
        .stats-bar {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._contentBlocks = [];
    this._selectedLayout = '2x2';
    this._editingBlock = null;
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._contentBlocks = BlockManager.deserializeFromEntities(this.config.entities);
      this._selectedLayout = this.config.layout || '2x2';
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    return html`
      <div class="dashboard-editor">
        <!-- 统计信息 -->
        ${this._renderStatsBar()}
        
        <!-- 布局配置 -->
        <div class="editor-section">
          <div class="section-header">
            <ha-icon icon="mdi:view-grid"></ha-icon>
            <span>布局配置</span>
          </div>
          
          <div class="section-title">选择布局模板</div>
          <layout-presets
            .selectedLayout=${this._selectedLayout}
            .onLayoutChange=${(layout) => this._onLayoutChanged(layout)}
          ></layout-presets>
          
          ${this._renderGridPreview()}
        </div>

        <!-- 内容块管理 -->
        <div class="editor-section">
          <div class="section-header">
            <ha-icon icon="mdi:cube"></ha-icon>
            <span>内容块管理</span>
          </div>
          
          <block-editor
            .blocks=${this._contentBlocks}
            .onBlocksChange=${(blocks) => this._onBlocksChanged(blocks)}
          ></block-editor>
        </div>

        <!-- 内联编辑器 -->
        ${this._editingBlock ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:pencil"></ha-icon>
              <span>编辑内容块</span>
            </div>
            
            <inline-block-editor
              .block=${this._editingBlock}
              .availableEntities=${this._availableEntities}
              .layout=${this._selectedLayout}
              .onSave=${(updatedBlock) => this._saveBlock(updatedBlock)}
              .onCancel=${() => this._cancelEdit()}
            ></inline-block-editor>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderStatsBar() {
    const totalBlocks = this._contentBlocks.length;
    const usedPositions = new Set();
    this._contentBlocks.forEach(block => {
      if (block.position) {
        usedPositions.add(`${block.position.row},${block.position.col}`);
      }
    });
    
    const gridConfig = BlockManager.LAYOUT_PRESETS[this._selectedLayout];
    const totalPositions = gridConfig.rows * gridConfig.cols;
    const usagePercent = totalPositions > 0 ? Math.round((usedPositions.size / totalPositions) * 100) : 0;

    return html`
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">${totalBlocks}</div>
          <div class="stat-label">内容块</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${usedPositions.size}/${totalPositions}</div>
          <div class="stat-label">网格位置</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${usagePercent}%</div>
          <div class="stat-label">使用率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this._selectedLayout}</div>
          <div class="stat-label">当前布局</div>
        </div>
      </div>
    `;
  }

  _renderGridPreview() {
    const gridConfig = BlockManager.LAYOUT_PRESETS[this._selectedLayout];
    const gridCells = [];
    
    for (let row = 0; row < gridConfig.rows; row++) {
      for (let col = 0; col < gridConfig.cols; col++) {
        const blocksInCell = this._contentBlocks.filter(block => 
          block.position?.row === row && block.position?.col === col
        );
        gridCells.push({ row, col, blocks: blocksInCell });
      }
    }

    return html`
      <div class="section-title">布局预览</div>
      <div class="grid-preview" style="
        grid-template-columns: repeat(${gridConfig.cols}, 1fr);
        grid-template-rows: repeat(${gridConfig.rows}, 1fr);
      ">
        ${gridCells.map(cell => html`
          <div class="grid-cell ${cell.blocks.length > 0 ? 'occupied' : ''}">
            <span class="cell-label">${cell.row},${cell.col}</span>
            ${cell.blocks.length > 0 ? html`
              <span class="block-count">${cell.blocks.length}</span>
            ` : ''}
          </div>
        `)}
      </div>
    `;
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

  _onBlocksChanged(blocks) {
    this._contentBlocks = blocks;
    const entities = BlockManager.serializeToEntities(blocks);
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }

  _saveBlock(updatedBlock) {
    this._contentBlocks = this._contentBlocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._editingBlock = null;
    this._onBlocksChanged(this._contentBlocks);
  }

  _cancelEdit() {
    this._editingBlock = null;
  }
}

if (!customElements.get('dashboard-editor')) {
  customElements.define('dashboard-editor', DashboardEditor);
}

export { DashboardEditor };