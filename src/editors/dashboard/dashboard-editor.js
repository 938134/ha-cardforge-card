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
    _availableEntities: { state: true },
    _titleBlocks: { state: true },
    _footerBlocks: { state: true },
    _editingTitleBlock: { state: true },
    _editingFooterBlock: { state: true }
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

      .add-btn {
        padding: var(--cf-spacing-xs) var(--cf-spacing-sm);
        background: var(--cf-primary-color);
        color: white;
        border: none;
        border-radius: var(--cf-radius-sm);
        cursor: pointer;
        font-size: 0.8em;
        transition: all var(--cf-transition-fast);
      }

      .add-btn:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }

      .block-preview {
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-top: var(--cf-spacing-sm);
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
      }

      .preview-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
      }

      .preview-action {
        width: 24px;
        height: 24px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        cursor: pointer;
        font-size: 0.7em;
        transition: all var(--cf-transition-fast);
      }

      .preview-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-lg);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: rgba(var(--cf-rgb-primary), 0.02);
      }
    `
  ];

  constructor() {
    super();
    this._contentBlocks = [];
    this._selectedLayout = '2x2';
    this._editingBlock = null;
    this._availableEntities = [];
    this._titleBlocks = [];
    this._footerBlocks = [];
    this._editingTitleBlock = null;
    this._editingFooterBlock = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._contentBlocks = BlockManager.deserializeFromEntities(this.config.entities);
      this._selectedLayout = this.config.layout || '2x2';
      this._titleBlocks = this._extractSpecialBlocks('title');
      this._footerBlocks = this._extractSpecialBlocks('footer');
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
            <div class="section-title">
              <ha-icon icon="mdi:view-grid"></ha-icon>
              <span>布局配置</span>
            </div>
          </div>
          
          <layout-presets
            .selectedLayout=${this._selectedLayout}
            @layout-changed=${e => this._onLayoutChanged(e.detail.layout)}
          ></layout-presets>
        </div>

        <!-- 标题设置 -->
        <div class="editor-section">
          <div class="section-header">
            <div class="section-title">
              <ha-icon icon="mdi:format-title"></ha-icon>
              <span>标题设置</span>
            </div>
            <button class="add-btn" @click=${() => this._addTitleBlock()}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加
            </button>
          </div>
          
          ${this._titleBlocks.length > 0 ? html`
            ${this._titleBlocks.map(block => html`
              ${this._editingTitleBlock?.id === block.id ? 
                this._renderTitleBlockEditor(block) : 
                this._renderTitleBlockPreview(block)
              }
            `)}
          ` : html`
            <div class="empty-state">
              <ha-icon icon="mdi:format-title" style="font-size: 2em; opacity: 0.5;"></ha-icon>
              <div class="cf-text-sm cf-mt-sm">暂无标题内容</div>
            </div>
          `}
        </div>

        <!-- 内容块管理 -->
        <div class="editor-section">
          <div class="section-header">
            <div class="section-title">
              <ha-icon icon="mdi:cube"></ha-icon>
              <span>内容块管理</span>
            </div>
          </div>
          
          <block-editor
            .hass=${this.hass}
            .blocks=${this._contentBlocks}
            .availableEntities=${this._availableEntities}
            .layout=${this._selectedLayout}
            @blocks-changed=${e => this._onBlocksChanged(e.detail.blocks)}
            @edit-block=${e => this._onEditBlock(e.detail.block)}
          ></block-editor>
        </div>

        <!-- 页脚设置 -->
        <div class="editor-section">
          <div class="section-header">
            <div class="section-title">
              <ha-icon icon="mdi:page-layout-footer"></ha-icon>
              <span>页脚设置</span>
            </div>
            <button class="add-btn" @click=${() => this._addFooterBlock()}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加
            </button>
          </div>
          
          ${this._footerBlocks.length > 0 ? html`
            ${this._footerBlocks.map(block => html`
              ${this._editingFooterBlock?.id === block.id ? 
                this._renderFooterBlockEditor(block) : 
                this._renderFooterBlockPreview(block)
              }
            `)}
          ` : html`
            <div class="empty-state">
              <ha-icon icon="mdi:page-layout-footer" style="font-size: 2em; opacity: 0.5;"></ha-icon>
              <div class="cf-text-sm cf-mt-sm">暂无页脚内容</div>
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
              @block-saved=${e => this._saveBlock(e.detail.block)}
              @edit-cancelled=${() => this._cancelEdit()}
            ></inline-block-editor>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderTitleBlockPreview(block) {
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
        <div class="preview-content">${block.content || '空内容'}</div>
      </div>
    `;
  }

  _renderFooterBlockPreview(block) {
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
        <div class="preview-content">${block.content || '空内容'}</div>
      </div>
    `;
  }

  _renderTitleBlockEditor(block) {
    return html`
      <div class="block-preview" style="border-color: var(--cf-primary-color);">
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

  _renderFooterBlockEditor(block) {
    return html`
      <div class="block-preview" style="border-color: var(--cf-primary-color);">
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

  _extractSpecialBlocks(type) {
    return this._contentBlocks.filter(block => block.config?.blockType === type);
  }

  _addTitleBlock() {
    const newBlock = BlockManager.createBlock('text', `title_${Date.now()}`);
    newBlock.config = { ...newBlock.config, blockType: 'title' };
    newBlock.content = '仪表盘标题';
    this._contentBlocks = [...this._contentBlocks, newBlock];
    this._titleBlocks = this._extractSpecialBlocks('title');
    this._onBlocksChanged(this._contentBlocks);
    this._editingTitleBlock = newBlock;
  }

  _addFooterBlock() {
    const newBlock = BlockManager.createBlock('text', `footer_${Date.now()}`);
    newBlock.config = { ...newBlock.config, blockType: 'footer' };
    newBlock.content = '页脚信息';
    this._contentBlocks = [...this._contentBlocks, newBlock];
    this._footerBlocks = this._extractSpecialBlocks('footer');
    this._onBlocksChanged(this._contentBlocks);
    this._editingFooterBlock = newBlock;
  }

  _editTitleBlock(block) {
    this._editingTitleBlock = block;
  }

  _editFooterBlock(block) {
    this._editingFooterBlock = block;
  }

  _updateTitleBlockContent(blockId, content) {
    this._contentBlocks = this._contentBlocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
    this._titleBlocks = this._extractSpecialBlocks('title');
  }

  _updateFooterBlockContent(blockId, content) {
    this._contentBlocks = this._contentBlocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
    this._footerBlocks = this._extractSpecialBlocks('footer');
  }

  _saveTitleBlock(block) {
    this._editingTitleBlock = null;
    this._onBlocksChanged(this._contentBlocks);
  }

  _saveFooterBlock(block) {
    this._editingFooterBlock = null;
    this._onBlocksChanged(this._contentBlocks);
  }

  _deleteTitleBlock(blockId) {
    if (confirm('确定要删除这个标题块吗？')) {
      this._contentBlocks = this._contentBlocks.filter(block => block.id !== blockId);
      this._titleBlocks = this._extractSpecialBlocks('title');
      this._onBlocksChanged(this._contentBlocks);
    }
  }

  _deleteFooterBlock(blockId) {
    if (confirm('确定要删除这个页脚块吗？')) {
      this._contentBlocks = this._contentBlocks.filter(block => block.id !== blockId);
      this._footerBlocks = this._extractSpecialBlocks('footer');
      this._onBlocksChanged(this._contentBlocks);
    }
  }

  _cancelEditTitleBlock() {
    this._editingTitleBlock = null;
  }

  _cancelEditFooterBlock() {
    this._editingFooterBlock = null;
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

  _onEditBlock(block) {
    this._editingBlock = block;
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