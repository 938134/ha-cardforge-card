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
    _layoutType: { state: true },
    _editingBlock: { state: true },
    _availableEntities: { state: true },
    _layoutOptions: { state: true }
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

      .layout-info {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-sm);
        background: var(--cf-background);
        border-radius: var(--cf-radius-md);
        margin-bottom: var(--cf-spacing-md);
        font-size: 0.85em;
      }

      .layout-badge {
        padding: 4px 8px;
        background: var(--cf-primary-color);
        color: white;
        border-radius: var(--cf-radius-sm);
        font-size: 0.8em;
        font-weight: 500;
      }

      .blocks-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-md);
        padding-bottom: var(--cf-spacing-sm);
        border-bottom: 1px solid var(--cf-border);
      }

      .blocks-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
      }

      .block-actions {
        display: flex;
        gap: var(--cf-spacing-sm);
      }

      .action-btn {
        padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-sm);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .action-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
      }

      .action-btn.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .action-btn.primary:hover {
        opacity: 0.8;
      }

      @media (max-width: 768px) {
        .blocks-header {
          flex-direction: column;
          gap: var(--cf-spacing-sm);
          align-items: flex-start;
        }

        .block-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `
  ];

  constructor() {
    super();
    this._allBlocks = [];
    this._selectedLayout = '2x2';
    this._layoutType = 'grid';
    this._editingBlock = null;
    this._availableEntities = [];
    this._layoutOptions = {};
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._allBlocks = BlockManager.deserializeFromEntities(this.config.entities);
      this._selectedLayout = this.config.layout || '2x2';
      this._layoutType = this.config.layoutType || 'grid';
      this._layoutOptions = this.config.layoutOptions || {};
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    const contentBlocks = this._allBlocks.filter(b => !b.config?.blockType || b.config.blockType === 'content');
    const hasBlocks = this._allBlocks.length > 0;

    return html`
      <div class="dashboard-editor">
        <!-- 内容区域布局 -->
        <div class="editor-section">
          <div class="section-header">
            <div>
              <div class="section-title">
                <ha-icon icon="mdi:view-grid"></ha-icon>
                <span>内容区域布局</span>
              </div>
              <div class="section-description">配置内容块的排列方式</div>
            </div>
          </div>
          
          <layout-presets
            .selectedLayout=${this._selectedLayout}
            .layoutType=${this._layoutType}
            .blocks=${this._allBlocks}
            @layout-changed=${e => this._onLayoutChanged(e.detail.layout, e.detail.layoutType)}
            @layout-type-changed=${e => this._onLayoutTypeChanged(e.detail.layoutType)}
            @layout-options-changed=${e => this._onLayoutOptionsChanged(e.detail.layoutType, e.detail.options)}
          ></layout-presets>
        </div>

        <!-- 块管理 -->
        <div class="editor-section">
          <div class="section-header">
            <div>
              <div class="section-title">
                <ha-icon icon="mdi:cube"></ha-icon>
                <span>块管理</span>
              </div>
              <div class="section-description">管理标题、内容和页脚块</div>
            </div>
          </div>

          <!-- 布局信息 -->
          ${this._renderLayoutInfo()}

          <!-- 块操作头部 -->
          <div class="blocks-header">
            <div class="blocks-title">内容块</div>
            <div class="block-actions">
              ${hasBlocks ? html`
                <button class="action-btn" @click=${this._addContentBlock}>
                  <ha-icon icon="mdi:plus"></ha-icon>
                  添加块
                </button>
                <button class="action-btn" @click=${this._reorderBlocks}>
                  <ha-icon icon="mdi:sort"></ha-icon>
                  重新排序
                </button>
              ` : ''}
            </div>
          </div>
          
          <block-list
            .hass=${this.hass}
            .blocks=${this._allBlocks}
            .availableEntities=${this._availableEntities}
            .layout=${this._selectedLayout}
            .layoutType=${this._layoutType}
            @blocks-changed=${e => this._onBlocksChanged(e.detail.blocks)}
            @edit-block=${e => this._onEditBlock(e.detail.block)}
          ></block-list>

          <!-- 空状态 -->
          ${!hasBlocks ? this._renderEmptyState() : ''}
        </div>

        <!-- 内联编辑器 -->
        ${this._editingBlock ? html`
          <div class="editor-section">
            <div class="section-header">
              <div class="section-title">
                <ha-icon icon="mdi:pencil"></ha-icon>
                <span>编辑块</span>
              </div>
            </div>
            
            <inline-editor
              .hass=${this.hass}
              .block=${this._editingBlock}
              .availableEntities=${this._availableEntities}
              .layout=${this._selectedLayout}
              .layoutType=${this._layoutType}
              @block-saved=${e => this._saveBlock(e.detail.block)}
              @edit-cancelled=${() => this._cancelEdit()}
            ></inline-editor>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderLayoutInfo() {
    const contentBlocks = this._allBlocks.filter(b => !b.config?.blockType || b.config.blockType === 'content');
    const layoutName = this._getLayoutDisplayName();
    
    return html`
      <div class="layout-info">
        <div class="layout-badge">${layoutName}</div>
        <div>${contentBlocks.length} 个内容块</div>
        ${this._layoutType === 'grid' ? html`
          <div>网格: ${this._selectedLayout}</div>
        ` : ''}
      </div>
    `;
  }

  _renderEmptyState() {
    return html`
      <div class="cf-flex cf-flex-center cf-flex-column cf-p-xl" style="border: 2px dashed var(--cf-border); border-radius: var(--cf-radius-md);">
        <ha-icon icon="mdi:view-grid-plus" style="font-size: 3em; opacity: 0.5; margin-bottom: var(--cf-spacing-md);"></ha-icon>
        <div class="cf-text-lg cf-font-bold cf-mb-sm">还没有任何块</div>
        <div class="cf-text-sm cf-text-secondary cf-mb-lg">开始添加第一个块来构建您的仪表板</div>
        <button class="action-btn primary" @click=${this._addContentBlock}>
          <ha-icon icon="mdi:plus"></ha-icon>
          添加第一个块
        </button>
      </div>
    `;
  }

  _getLayoutDisplayName() {
    const layoutNames = {
      'grid': '网格布局',
      'list': '列表布局', 
      'timeline': '时间线',
      'free': '自由面板'
    };
    return layoutNames[this._layoutType] || '网格布局';
  }

  _addContentBlock() {
    const newBlock = BlockManager.createBlock('text');
    newBlock.config = { ...newBlock.config, blockType: 'content' };
    
    // 根据布局类型设置初始位置
    if (this._layoutType === 'grid') {
      newBlock.position = BlockManager.getNextPosition(
        this._allBlocks.filter(b => !b.config?.blockType || b.config.blockType === 'content'),
        this._selectedLayout
      );
    } else {
      // 对于非网格布局，按顺序排列
      newBlock.order = this._allBlocks.length;
    }
    
    this._allBlocks = [...this._allBlocks, newBlock];
    this._saveAllBlocks();
    this._editingBlock = newBlock;
  }

  _reorderBlocks() {
    // 实现块重新排序逻辑
    alert('块重新排序功能开发中...');
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

  _onLayoutChanged(layout, layoutType) {
    this._selectedLayout = layout;
    this._layoutType = layoutType || 'grid';
    this._saveLayoutConfig();
  }

  _onLayoutTypeChanged(layoutType) {
    this._layoutType = layoutType;
    this._saveLayoutConfig();
  }

  _onLayoutOptionsChanged(layoutType, options) {
    this._layoutOptions[layoutType] = options;
    this._saveLayoutConfig();
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

  _saveLayoutConfig() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { 
        config: { 
          layout: this._selectedLayout,
          layoutType: this._layoutType,
          layoutOptions: this._layoutOptions
        } 
      }
    }));
  }
}

if (!customElements.get('dashboard-editor')) {
  customElements.define('dashboard-editor', DashboardEditor);
}