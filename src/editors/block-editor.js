// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockManager } from '../core/block-manager.js';
import { themeManager } from '../core/theme-manager.js';

class BlockEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _blocks: { state: true },
    _selectedBlock: { state: true },
    _availableThemes: { state: true },
    _initialized: { state: true },
    _activeTab: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .tabs-container {
        display: flex;
        border-bottom: 1px solid var(--cf-border);
        margin-bottom: var(--cf-spacing-md);
      }

      .tab {
        padding: var(--cf-spacing-md) var(--cf-spacing-lg);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all var(--cf-transition-fast);
        font-weight: 500;
        color: var(--cf-text-secondary);
      }

      .tab.active {
        color: var(--cf-primary-color);
        border-bottom-color: var(--cf-primary-color);
      }

      .tab:hover {
        color: var(--cf-primary-color);
      }

      .tab-content {
        display: none;
      }

      .tab-content.active {
        display: block;
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-xl);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .blocks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: var(--cf-spacing-sm);
      }

      .block-type-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
        gap: var(--cf-spacing-sm);
      }

      .block-type-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .block-icon {
        font-size: 1.5em;
      }

      .block-type-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
      }

      .blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        max-height: 400px;
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
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
      }

      .block-item.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .block-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-item-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .block-item-name {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .block-item-type {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
      }

      .block-content-preview {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        padding: var(--cf-spacing-sm);
        background: rgba(var(--cf-rgb-primary), 0.03);
        border-radius: var(--cf-radius-sm);
        min-height: 20px;
      }

      .themes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: var(--cf-spacing-sm);
      }

      .theme-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-md);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        background: var(--cf-surface);
        text-align: center;
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
        font-size: 1.5em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .theme-name {
        font-size: 0.85em;
        font-weight: 500;
        line-height: 1.2;
      }

      .action-buttons {
        display: flex;
        gap: var(--cf-spacing-sm);
        margin-top: var(--cf-spacing-md);
      }

      .action-button {
        flex: 1;
        padding: var(--cf-spacing-sm);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        cursor: pointer;
        text-align: center;
        transition: all var(--cf-transition-fast);
      }

      .action-button:hover {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
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
    this._activeTab = 'blocks';
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
        <!-- 标签导航 -->
        <div class="tabs-container">
          <div 
            class="tab ${this._activeTab === 'blocks' ? 'active' : ''}"
            @click=${() => this._switchTab('blocks')}
          >
            🧩 块管理
          </div>
          <div 
            class="tab ${this._activeTab === 'theme' ? 'active' : ''}"
            @click=${() => this._switchTab('theme')}
          >
            🎨 主题
          </div>
          <div 
            class="tab ${this._activeTab === 'settings' ? 'active' : ''}"
            @click=${() => this._switchTab('settings')}
          >
            ⚙️ 配置
          </div>
        </div>

        <!-- 块管理标签页 -->
        <div class="tab-content ${this._activeTab === 'blocks' ? 'active' : ''}">
          ${this._renderBlocksTab()}
        </div>

        <!-- 主题标签页 -->
        <div class="tab-content ${this._activeTab === 'theme' ? 'active' : ''}">
          ${this._renderThemeTab()}
        </div>

        <!-- 配置标签页 -->
        <div class="tab-content ${this._activeTab === 'settings' ? 'active' : ''}">
          ${this._renderSettingsTab()}
        </div>
      </div>
    `;
  }

  _renderBlocksTab() {
    return html`
      <!-- 步骤1：选择块类型 -->
      <div class="section">
        <div class="section-title">选择块类型</div>
        <div class="blocks-grid">
          ${blockManager.getAllBlocks().map(block => html`
            <div 
              class="block-type-item"
              @click=${() => this._addBlock(block.type)}
              title="${block.name}"
            >
              <div class="block-icon">${block.icon}</div>
              <div class="block-type-name">${block.name}</div>
            </div>
          `)}
        </div>
      </div>

      <!-- 步骤2：管理块列表 -->
      <div class="section">
        <div class="section-title">管理块列表</div>
        <div class="blocks-list">
          ${this._blocks.length === 0 ? html`
            <div class="empty-state">
              <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.5;"></ha-icon>
              <div class="cf-text-sm cf-mt-md">尚未添加任何块</div>
              <div class="cf-text-xs cf-mt-sm cf-text-secondary">从上方选择块开始创建</div>
            </div>
          ` : this._blocks.map(block => this._renderBlockItem(block))}
        </div>
      </div>

      <!-- 步骤3：配置选中块 -->
      <div class="section">
        <div class="section-title">配置选中块</div>
        ${this._selectedBlock ? html`
          <block-properties
            .block=${this._selectedBlock}
            .hass=${this.hass}
            @block-updated=${this._onBlockUpdated}
          ></block-properties>
        ` : html`
          <div class="empty-state">
            <ha-icon icon="mdi:select" style="font-size: 1.5em; opacity: 0.5;"></ha-icon>
            <div class="cf-text-sm cf-mt-md">请选择一个块进行配置</div>
          </div>
        `}
      </div>
    `;
  }

  _renderThemeTab() {
    return html`
      <div class="section">
        <div class="section-title">选择主题</div>
        <div class="themes-grid">
          ${this._availableThemes.map(theme => html`
            <div 
              class="theme-item ${this.config.theme === theme.id ? 'selected' : ''}"
              @click=${() => this._selectTheme(theme.id)}
              title="${theme.description}"
            >
              <div class="theme-icon">${theme.icon}</div>
              <div class="theme-name">${theme.name}</div>
            </div>
          `)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">主题预览</div>
        <div class="cf-text-sm cf-text-secondary">
          主题更改会立即在官方预览窗口中显示效果
        </div>
      </div>
    `;
  }

  _renderSettingsTab() {
    return html`
      <div class="section">
        <div class="section-title">全局配置</div>
        <div class="cf-text-sm cf-text-secondary">
          全局配置功能开发中...
        </div>
      </div>
    `;
  }

  _renderBlockItem(block) {
    const manifest = blockManager.getBlockManifest(block.type);
    
    let previewText = '';
    if (block.type === 'text') {
      previewText = block.config?.content || '文本内容';
    } else if (block.type === 'entity') {
      previewText = block.config?.entity || '未选择实体';
    } else if (block.type === 'time') {
      previewText = '时间显示';
    } else if (block.type === 'layout') {
      previewText = `${block.config?.layout || 'vertical'} 布局`;
    }

    return html`
      <div 
        class="block-item ${this._selectedBlock?.id === block.id ? 'selected' : ''}"
        @click=${() => this._selectBlock(block)}
      >
        <div class="block-header">
          <div class="block-item-icon">${manifest?.icon || '📦'}</div>
          <div class="block-item-name">${manifest?.name || block.type}</div>
          <div class="block-item-type">${block.type}</div>
          <ha-icon 
            icon="mdi:delete" 
            @click=${e => this._removeBlock(e, block.id)}
            style="color: var(--cf-error-color); cursor: pointer;"
          ></ha-icon>
        </div>
        <div class="block-content-preview">
          ${previewText}
        </div>
      </div>
    `;
  }

  _switchTab(tabName) {
    this._activeTab = tabName;
  }

  _addBlock(blockType) {
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

  _removeBlock(e, blockId) {
    e.stopPropagation();
    
    this._blocks = this._blocks.filter(block => block.id !== blockId);
    
    if (this._selectedBlock?.id === blockId) {
      this._selectedBlock = null;
    }
    
    this._notifyConfigUpdate();
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
