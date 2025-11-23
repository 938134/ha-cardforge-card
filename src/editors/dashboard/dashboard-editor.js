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
    _title: { state: true },
    _footer: { state: true }
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

      .config-field {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-md);
      }

      .config-label {
        font-weight: 500;
        font-size: 0.9em;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-xs);
      }

      .switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        transition: all var(--cf-transition-fast);
        min-height: 52px;
      }

      .switch-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }

      .switch-label {
        font-size: 0.9em;
        color: var(--cf-text-primary);
        flex: 1;
      }
    `
  ];

  constructor() {
    super();
    this._contentBlocks = [];
    this._selectedLayout = '2x2';
    this._editingBlock = null;
    this._availableEntities = [];
    this._title = '';
    this._footer = '';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._contentBlocks = BlockManager.deserializeFromEntities(this.config.entities);
      this._selectedLayout = this.config.layout || '2x2';
      this._title = this.config.title || '';
      this._footer = this.config.footer || '';
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
            <ha-icon icon="mdi:view-grid"></ha-icon>
            <span>布局配置</span>
          </div>
          
          <div class="section-title">选择布局模板</div>
          <layout-presets
            .selectedLayout=${this._selectedLayout}
            @layout-changed=${e => this._onLayoutChanged(e.detail.layout)}
          ></layout-presets>
        </div>

        <!-- 标题设置 -->
        <div class="editor-section">
          <div class="section-header">
            <ha-icon icon="mdi:format-title"></ha-icon>
            <span>标题设置</span>
          </div>
          
          <div class="config-field">
            <label class="config-label">卡片标题</label>
            <ha-textfield
              .value=${this._title}
              @input=${e => this._onTitleChanged(e.target.value)}
              placeholder="输入卡片标题"
              fullwidth
            ></ha-textfield>
          </div>
          
          <div class="switch-item">
            <span class="switch-label">显示标题</span>
            <ha-switch
              .checked=${!!this._title}
              @change=${e => this._onTitleChanged(e.target.checked ? '仪表盘' : '')}
            ></ha-switch>
          </div>
        </div>

        <!-- 内容块管理 -->
        <div class="editor-section">
          <div class="section-header">
            <ha-icon icon="mdi:cube"></ha-icon>
            <span>内容块管理</span>
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
            <ha-icon icon="mdi:page-layout-footer"></ha-icon>
            <span>页脚设置</span>
          </div>
          
          <div class="config-field">
            <label class="config-label">页脚文本</label>
            <ha-textfield
              .value=${this._footer}
              @input=${e => this._onFooterChanged(e.target.value)}
              placeholder="输入页脚文本"
              fullwidth
            ></ha-textfield>
          </div>
          
          <div class="switch-item">
            <span class="switch-label">显示页脚</span>
            <ha-switch
              .checked=${!!this._footer}
              @change=${e => this._onFooterChanged(e.target.checked ? '卡片工坊' : '')}
            ></ha-switch>
          </div>
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
              @block-deleted=${e => this._deleteBlock(e.detail.blockId)}
            ></inline-block-editor>
          </div>
        ` : ''}
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

  _onTitleChanged(title) {
    this._title = title;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { title } }
    }));
  }

  _onFooterChanged(footer) {
    this._footer = footer;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { footer } }
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

  _deleteBlock(blockId) {
    this._contentBlocks = this._contentBlocks.filter(block => block.id !== blockId);
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