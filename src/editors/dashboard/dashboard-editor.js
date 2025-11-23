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
    _titleBlocks: { state: true },
    _footerBlocks: { state: true },
    _selectedLayout: { state: true },
    _editingBlock: { state: true },
    _editingTitleBlock: { state: true },
    _editingFooterBlock: { state: true },
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

      .special-blocks-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .block-preview {
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
      }

      .block-preview.editing {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--cf-spacing-sm);
      }

      .preview-title {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .preview-content {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
        white-space: pre-wrap;
      }

      .preview-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
      }

      .preview-action {
        width: 28px;
        height: 28px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
      }

      .preview-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }

      .empty-icon {
        font-size: 2em;
        opacity: 0.5;
        margin-bottom: var(--cf-spacing-sm);
      }
    `
  ];

  constructor() {
    super();
    this._contentBlocks = [];
    this._titleBlocks = [];
    this._footerBlocks = [];
    this._selectedLayout = '2x2';
    this._editingBlock = null;
    this._editingTitleBlock = null;
    this._editingFooterBlock = null;
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      const allBlocks = BlockManager.deserializeFromEntities(this.config.entities);
      
      // 分离不同类型的块
      this._contentBlocks = allBlocks.filter(block => 
        !block.config?.blockType || block.config.blockType === 'content'
      );
      this._titleBlocks = allBlocks.filter(block => 
        block.config?.blockType === 'title'
      );
      this._footerBlocks = allBlocks.filter(block => 
        block.config?.blockType === 'footer'
      );
      
      this._selectedLayout = this.config.layout || '2x2';
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  render() {
    return html`
      <div class="dashboard-editor">
        <!-- 标题区域 -->
        <div class="editor-section">
          <div class="section-header">
            <div>
              <div class="section-title">
                <ha-icon icon="mdi:format-title"></ha-icon>
                <span>标题区域</span>
              </div>
              <div class="section-description">显示在卡片顶部的标题内容</div>
            </div>
            ${this._titleBlocks.length === 0 ? html`
              <button class="add-btn" @click=${this._addTitleBlock}>
                <ha-icon icon="mdi:plus"></ha-icon>
                添加标题
              </button>
            ` : ''}
          </div>
          
          ${this._titleBlocks.length > 0 ? html`
            <div class="special-blocks-container">
              ${this._titleBlocks.map(block => 
                this._editingTitleBlock?.id === block.id ? 
                  this._renderTitleEditor(block) : 
                  this._renderTitlePreview(block)
              )}
            </div>
          ` : html`
            <div class="empty-state">
              <ha-icon class="empty-icon" icon="mdi:format-title"></ha-icon>
              <div class="cf-text-sm">暂无标题内容</div>
            </div>
          `}
        </div>

        <!-- 内容区域配置 -->
        <div class="editor-section">
          <div class="section-header">
            <div>
              <div class="section-title">
                <ha-icon icon="mdi:view-grid"></ha-icon>
                <span>内容区域布局</span>
              </div>
              <div class="section-description">配置内容块的网格布局（仅影响内容区域）</div>
            </div>
          </div>
          
          <layout-presets
            .selectedLayout=${this._selectedLayout}
            @layout-changed=${e => this._onLayoutChanged(e.detail.layout)}
          ></layout-presets>
        </div>

        <!-- 内容区域管理 -->
        <div class="editor-section">
          <div class="section-header">
            <div>
              <div class="section-title">
                <ha-icon icon="mdi:cube"></ha-icon>
                <span>内容区域</span>
              </div>
              <div class="section-description">网格布局中的内容块，支持多种实体类型</div>
            </div>
            <button class="add-btn" @click=${this._addContentBlock}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加内容块
            </button>
          </div>
          
          <block-editor
            .hass=${this.hass}
            .blocks=${this._contentBlocks}
            .availableEntities=${this._availableEntities}
            .layout=${this._selectedLayout}
            @blocks-changed=${e => this._onContentBlocksChanged(e.detail.blocks)}
            @edit-block=${e => this._onEditBlock(e.detail.block)}
          ></block-editor>
        </div>

        <!-- 页脚区域 -->
        <div class="editor-section">
          <div class="section-header">
            <div>
              <div class="section-title">
                <ha-icon icon="mdi:page-layout-footer"></ha-icon>
                <span>页脚区域</span>
              </div>
              <div class="section-description">显示在卡片底部的页脚内容</div>
            </div>
            ${this._footerBlocks.length === 0 ? html`
              <button class="add-btn" @click=${this._addFooterBlock}>
                <ha-icon icon="mdi:plus"></ha-icon>
                添加页脚
              </button>
            ` : ''}
          </div>
          
          ${this._footerBlocks.length > 0 ? html`
            <div class="special-blocks-container">
              ${this._footerBlocks.map(block => 
                this._editingFooterBlock?.id === block.id ? 
                  this._renderFooterEditor(block) : 
                  this._renderFooterPreview(block)
              )}
            </div>
          ` : html`
            <div class="empty-state">
              <ha-icon class="empty-icon" icon="mdi:page-layout-footer"></ha-icon>
              <div class="cf-text-sm">暂无页脚内容</div>
            </div>
          `}
        </div>

        <!-- 内联编辑器 -->
        ${this._editingBlock ? html`
          <div class="editor-section">
            <div class="section-header">
              <ha-icon icon="mdi:pencil"></ha-icon>
              <span>编辑内容块</span>
            </div>
            
            <inline-block-editor
              .hass=${this.hass}
              .block=${this._editingBlock}
              .availableEntities=${this._availableEntities}
              .layout=${this._selectedLayout}
              @block-saved=${e => this._saveContentBlock(e.detail.block)}
              @edit-cancelled=${() => this._cancelEditContentBlock()}
            ></inline-block-editor>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderTitlePreview(block) {
    return html`
      <div class="block-preview">
        <div class="preview-header">
          <div class="preview-title">标题内容</div>
          <div class="preview-actions">
            <div class="preview-action" @click=${() => this._editTitleBlock(block)} title="编辑">
              <ha-icon icon="mdi:pencil"></ha-icon>
            </div>
            <div class="preview-action" @click=${() => this._deleteTitleBlock(block.id)} title="删除">
              <ha-icon icon="mdi:delete"></ha-icon>
            </div>
          </div>
        </div>
        <div class="preview-content">${block.content || '空标题'}</div>
      </div>
    `;
  }

  _renderFooterPreview(block) {
    return html`
      <div class="block-preview">
        <div class="preview-header">
          <div class="preview-title">页脚内容</div>
          <div class="preview-actions">
            <div class="preview-action" @click=${() => this._editFooterBlock(block)} title="编辑">
              <ha-icon icon="mdi:pencil"></ha-icon>
            </div>
            <div class="preview-action" @click=${() => this._deleteFooterBlock(block.id)} title="删除">
              <ha-icon icon="mdi:delete"></ha-icon>
            </div>
          </div>
        </div>
        <div class="preview-content">${block.content || '空页脚'}</div>
      </div>
    `;
  }

  _renderTitleEditor(block) {
    return html`
      <div class="block-preview editing">
        <div class="preview-header">
          <div class="preview-title">编辑标题内容</div>
          <div class="preview-actions">
            <div class="preview-action" @click=${() => this._saveTitleBlock(block)} title="保存">
              <ha-icon icon="mdi:check"></ha-icon>
            </div>
            <div class="preview-action" @click=${() => this._cancelEditTitleBlock()} title="取消">
              <ha-icon icon="mdi:close"></ha-icon>
            </div>
          </div>
        </div>
        <ha-textarea
          .value=${block.content || ''}
          @input=${e => this._updateTitleBlockContent(block.id, e.target.value)}
          placeholder="输入标题内容..."
          rows="2"
          fullwidth
        ></ha-textarea>
      </div>
    `;
  }

  _renderFooterEditor(block) {
    return html`
      <div class="block-preview editing">
        <div class="preview-header">
          <div class="preview-title">编辑页脚内容</div>
          <div class="preview-actions">
            <div class="preview-action" @click=${() => this._saveFooterBlock(block)} title="保存">
              <ha-icon icon="mdi:check"></ha-icon>
            </div>
            <div class="preview-action" @click=${() => this._cancelEditFooterBlock()} title="取消">
              <ha-icon icon="mdi:close"></ha-icon>
            </div>
          </div>
        </div>
        <ha-textarea
          .value=${block.content || ''}
          @input=${e => this._updateFooterBlockContent(block.id, e.target.value)}
          placeholder="输入页脚内容..."
          rows="2"
          fullwidth
        ></ha-textarea>
      </div>
    `;
  }

  _addTitleBlock() {
    const newBlock = BlockManager.createBlock('text', `title_${Date.now()}`);
    newBlock.config = { ...newBlock.config, blockType: 'title' };
    newBlock.content = '仪表盘标题';
    this._titleBlocks = [newBlock];
    this._editingTitleBlock = newBlock;
    this._saveAllBlocks();
  }

  _addFooterBlock() {
    const newBlock = BlockManager.createBlock('text', `footer_${Date.now()}`);
    newBlock.config = { ...newBlock.config, blockType: 'footer' };
    newBlock.content = '页脚信息';
    this._footerBlocks = [newBlock];
    this._editingFooterBlock = newBlock;
    this._saveAllBlocks();
  }

  _addContentBlock() {
    const newBlock = BlockManager.createBlock('text');
    newBlock.config = { ...newBlock.config, blockType: 'content' };
    newBlock.position = BlockManager.getNextPosition(this._contentBlocks, this._selectedLayout);
    this._contentBlocks = [...this._contentBlocks, newBlock];
    this._saveAllBlocks();
    this._editingBlock = newBlock;
  }

  _editTitleBlock(block) {
    this._editingTitleBlock = block;
  }

  _editFooterBlock(block) {
    this._editingFooterBlock = block;
  }

  _updateTitleBlockContent(blockId, content) {
    this._titleBlocks = this._titleBlocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
  }

  _updateFooterBlockContent(blockId, content) {
    this._footerBlocks = this._footerBlocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
  }

  _saveTitleBlock(block) {
    this._editingTitleBlock = null;
    this._saveAllBlocks();
  }

  _saveFooterBlock(block) {
    this._editingFooterBlock = null;
    this._saveAllBlocks();
  }

  _saveContentBlock(updatedBlock) {
    this._contentBlocks = this._contentBlocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._editingBlock = null;
    this._saveAllBlocks();
  }

  _deleteTitleBlock(blockId) {
    if (confirm('确定要删除这个标题块吗？')) {
      this._titleBlocks = this._titleBlocks.filter(block => block.id !== blockId);
      this._saveAllBlocks();
    }
  }

  _deleteFooterBlock(blockId) {
    if (confirm('确定要删除这个页脚块吗？')) {
      this._footerBlocks = this._footerBlocks.filter(block => block.id !== blockId);
      this._saveAllBlocks();
    }
  }

  _cancelEditTitleBlock() {
    this._editingTitleBlock = null;
  }

  _cancelEditFooterBlock() {
    this._editingFooterBlock = null;
  }

  _cancelEditContentBlock() {
    this._editingBlock = null;
  }

  _saveAllBlocks() {
    const allBlocks = [
      ...this._titleBlocks,
      ...this._contentBlocks,
      ...this._footerBlocks
    ];
    const entities = BlockManager.serializeToEntities(allBlocks);
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
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

  _onLayoutChanged(layout) {
    this._selectedLayout = layout;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { layout } }
    }));
  }

  _onContentBlocksChanged(blocks) {
    this._contentBlocks = blocks;
    this._saveAllBlocks();
  }

  _onEditBlock(block) {
    this._editingBlock = block;
  }
}

if (!customElements.get('dashboard-editor')) {
  customElements.define('dashboard-editor', DashboardEditor);
}