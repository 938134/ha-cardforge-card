// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockManager } from '../core/block-manager.js';
import { themeManager } from '../core/theme-manager.js';
import './block-palette.js';
import './block-properties.js';

class BlockEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _blocks: { state: true },
    _selectedBlock: { state: true },
    _availableThemes: { state: true },
    _initialized: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        display: flex;
        gap: var(--cf-spacing-lg);
        height: 500px;
      }

      .blocks-panel {
        width: 250px;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .properties-panel {
        flex: 1;
        min-width: 300px;
      }

      .section {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
      }

      .section-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .section-title ha-icon {
        color: var(--cf-primary-color);
      }

      .blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        max-height: 300px;
        overflow-y: auto;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }

      .block-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        padding: var(--cf-spacing-sm) var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .block-item.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.1);
      }

      .block-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1em;
      }

      .block-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .block-name {
        font-size: 0.85em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .block-preview {
        font-size: 0.75em;
        color: var(--cf-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .block-type {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
      }

      .nested-blocks {
        margin-left: var(--cf-spacing-lg);
        border-left: 2px solid var(--cf-border);
        padding-left: var(--cf-spacing-md);
      }

      .add-block-btn {
        width: 100%;
        margin-top: var(--cf-spacing-sm);
      }

      .themes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
      }

      .theme-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        aspect-ratio: 1;
      }

      .theme-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .theme-item.selected {
        border-color: var(--cf-primary-color);
        background: var(--cf-primary-color);
        color: white;
      }

      .theme-icon {
        font-size: 1.2em;
        margin-bottom: var(--cf-spacing-xs);
      }

      .theme-name {
        font-size: 0.7em;
        font-weight: 500;
        line-height: 1.2;
      }
    `
  ];

  constructor() {
    super();
    this.config = { 
      type: 'custom:ha-cardforge-card',
      blocks: [],
      theme: 'auto'
    };
    this._blocks = [];
    this._selectedBlock = null;
    this._availableThemes = [];
    this._initialized = false;
  }

  async firstUpdated() {
    await blockManager.initialize();
    await themeManager.initialize();
    
    this._availableThemes = themeManager.getAllThemes();
    
    if (this.config.blocks) {
      this._blocks = [...this.config.blocks];
    }
    
    this._initialized = true;
  }

  setConfig(config) {
    this.config = { 
      type: 'custom:ha-cardforge-card',
      blocks: [],
      theme: 'auto',
      ...config 
    };
    
    if (this.config.blocks && this._initialized) {
      this._blocks = [...this.config.blocks];
    }
  }

  render() {
    if (!this._initialized) {
      return html`<div class="cf-loading">初始化编辑器...</div>`;
    }

    return html`
      <div class="editor-container">
        <!-- 左侧：块管理面板 -->
        <div class="blocks-panel">
          <!-- 块选择 -->
          <div class="section">
            <div class="section-title">
              <ha-icon icon="mdi:cube-outline"></ha-icon>
              添加块
            </div>
            <block-palette
              @block-selected=${this._onBlockSelected}
            ></block-palette>
          </div>

          <!-- 已添加的块 -->
          <div class="section">
            <div class="section-title">
              <ha-icon icon="mdi:view-grid"></ha-icon>
              块管理 (${this._blocks.length})
            </div>
            <div class="blocks-list">
              ${this._blocks.length === 0 ? html`
                <div class="empty-state">
                  <ha-icon icon="mdi:package-variant" style="opacity: 0.5;"></ha-icon>
                  <div class="cf-text-sm cf-mt-sm">尚未添加任何块</div>
                </div>
              ` : this._renderBlocksTree(this._blocks)}
            </div>
          </div>

          <!-- 主题选择 -->
          <div class="section">
            <div class="section-title">
              <ha-icon icon="mdi:palette"></ha-icon>
              主题
            </div>
            <div class="themes-grid">
              ${this._availableThemes.map(theme => html`
                <div 
                  class="theme-item ${this.config.theme === theme.id ? 'selected' : ''}"
                  @click=${() => this._selectTheme(theme.id)}
                  title="${theme.name}"
                >
                  <div class="theme-icon">${theme.icon}</div>
                  <div class="theme-name">${theme.name}</div>
                </div>
              `)}
            </div>
          </div>
        </div>

        <!-- 右侧：属性配置面板 -->
        <div class="properties-panel">
          <div class="section" style="height: 100%;">
            <block-properties
              .block=${this._selectedBlock}
              .hass=${this.hass}
              @block-updated=${this._onBlockUpdated}
            ></block-properties>
          </div>
        </div>
      </div>
    `;
  }

  _renderBlocksTree(blocks, level = 0) {
    return blocks.map(block => html`
      <div class="block-item ${this._selectedBlock?.id === block.id ? 'selected' : ''}"
           @click=${() => this._selectBlock(block)}
           style="margin-left: ${level * 12}px;">
        <div class="block-icon">${this._getBlockIcon(block.type)}</div>
        <div class="block-info">
          <div class="block-name">${this._getBlockDisplayName(block)}</div>
          <div class="block-preview">${this._getBlockPreview(block)}</div>
        </div>
        <div class="block-type">${block.type}</div>
      </div>
      ${block.blocks ? this._renderBlocksTree(block.blocks, level + 1) : ''}
    `);
  }

  _getBlockIcon(blockType) {
    const manifest = blockManager.getBlockManifest(blockType);
    return manifest?.icon || '📦';
  }

  _getBlockDisplayName(block) {
    const manifest = blockManager.getBlockManifest(block.type);
    const baseName = manifest?.name || block.type;
    
    // 根据块类型显示具体内容
    switch (block.type) {
      case 'text':
        return block.config?.content ? `文本: ${block.config.content.substring(0, 10)}...` : baseName;
      case 'entity':
        return block.config?.entity ? `实体: ${block.config.entity.split('.')[1]}` : baseName;
      case 'time':
        return baseName;
      case 'layout':
        return `布局: ${block.config?.layout || 'vertical'}`;
      default:
        return baseName;
    }
  }

  _getBlockPreview(block) {
    switch (block.type) {
      case 'text':
        return block.config?.content || '暂无内容';
      case 'entity':
        return block.config?.entity || '未选择实体';
      case 'time':
        return block.config?.use_24_hour ? '24小时制' : '12小时制';
      case 'layout':
        return `包含 ${block.blocks?.length || 0} 个子块`;
      default:
        return '';
    }
  }

  _onBlockSelected(e) {
    const blockType = e.detail.blockType;
    const newBlock = {
      id: `block_${Date.now()}`,
      type: blockType,
      config: {}
    };
    
    this._blocks = [...this._blocks, newBlock];
    this._selectedBlock = newBlock;
    this._notifyConfigUpdate();
  }

  _selectBlock(block) {
    this._selectedBlock = block;
  }

  _selectTheme(themeId) {
    this.config = {
      ...this.config,
      theme: themeId
    };
    this._notifyConfigUpdate();
  }

  _onBlockUpdated(e) {
    const updatedBlock = e.detail.block;
    this._blocks = this._blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._selectedBlock = updatedBlock;
    this._notifyConfigUpdate();
  }

  _notifyConfigUpdate() {
    const configToSend = {
      type: 'custom:ha-cardforge-card',
      ...this.config,
      blocks: this._blocks
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configToSend }
    }));
  }
}

if (!customElements.get('block-editor')) {
  customElements.define('block-editor', BlockEditor);
}

export { BlockEditor };
