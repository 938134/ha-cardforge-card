// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockRegistry } from '../core/block-registry.js';
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
    _activeTab: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
        background: var(--cf-background);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
      }

      .tabs-container {
        display: flex;
        background: var(--cf-surface);
        border-bottom: 1px solid var(--cf-border);
      }

      .tab {
        flex: 1;
        padding: var(--cf-spacing-md);
        text-align: center;
        background: transparent;
        border: none;
        color: var(--cf-text-secondary);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        font-weight: 500;
      }

      .tab.active {
        color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-bottom: 2px solid var(--cf-primary-color);
      }

      .tab:hover:not(.active) {
        background: rgba(var(--cf-rgb-primary), 0.02);
      }

      .tab-content {
        padding: var(--cf-spacing-md);
        min-height: 400px;
      }

      .blocks-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-sm);
      }

      .theme-grid {
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
        min-height: 70px;
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

      .theme-preview {
        width: 100%;
        height: 40px;
        border-radius: var(--cf-radius-sm);
        margin-bottom: 6px;
        border: 2px solid transparent;
      }

      .theme-item.selected .theme-preview {
        border-color: rgba(255, 255, 255, 0.5);
      }

      .theme-name {
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.2;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
      }

      .blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
        max-height: 400px;
        overflow-y: auto;
      }

      .block-item {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .block-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .block-item.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .block-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
      }

      .block-info {
        flex: 1;
      }

      .block-name {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .block-type {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
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
    this._activeTab = 'blocks';
  }

  async firstUpdated() {
    await blockRegistry.initialize();
    await themeManager.initialize();
    
    this._availableThemes = themeManager.getAllThemes();
    
    if (this.config.blocks) {
      this._blocks = [...this.config.blocks];
    }
  }

  setConfig(config) {
    this.config = { 
      type: 'custom:ha-cardforge-card',
      blocks: [],
      theme: 'auto',
      ...config 
    };
    
    if (this.config.blocks) {
      this._blocks = [...this.config.blocks];
    }
  }

  render() {
    return html`
      <div class="editor-container">
        <!-- 标签页 -->
        <div class="tabs-container">
          <button 
            class="tab ${this._activeTab === 'blocks' ? 'active' : ''}"
            @click=${() => this._switchTab('blocks')}
          >
            块管理
          </button>
          <button 
            class="tab ${this._activeTab === 'theme' ? 'active' : ''}"
            @click=${() => this._switchTab('theme')}
          >
            主题样式
          </button>
          <button 
            class="tab ${this._activeTab === 'properties' ? 'active' : ''}"
            @click=${() => this._switchTab('properties')}
            ?disabled=${!this._selectedBlock}
          >
            属性设置
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="tab-content">
          ${this._activeTab === 'blocks' ? this._renderBlocksTab() : ''}
          ${this._activeTab === 'theme' ? this._renderThemeTab() : ''}
          ${this._activeTab === 'properties' ? this._renderPropertiesTab() : ''}
        </div>
      </div>
    `;
  }

  _renderBlocksTab() {
    return html`
      <div class="blocks-section">
        <div class="section-title">添加块</div>
        <block-palette
          @block-selected=${this._onBlockSelected}
        ></block-palette>

        <div class="section-title">已添加的块</div>
        ${this._blocks.length === 0 ? html`
          <div class="empty-state">
            <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.5;"></ha-icon>
            <div class="cf-text-sm cf-mt-md">尚未添加任何块</div>
            <div class="cf-text-xs cf-mt-sm cf-text-secondary">从上方选择块开始创建</div>
          </div>
        ` : html`
          <div class="blocks-list">
            ${this._blocks.map((block, index) => {
              const manifest = blockRegistry.getBlockManifest(block.type);
              return html`
                <div 
                  class="block-item ${this._selectedBlock?.id === block.id ? 'selected' : ''}"
                  @click=${() => this._selectBlock(block)}
                >
                  <div class="block-icon">${manifest?.icon || '📦'}</div>
                  <div class="block-info">
                    <div class="block-name">${manifest?.name || block.type}</div>
                  </div>
                  <div class="block-type">${block.type}</div>
                  <ha-icon 
                    icon="mdi:delete" 
                    style="color: var(--cf-error-color); cursor: pointer;"
                    @click=${e => this._removeBlock(e, block.id)}
                  ></ha-icon>
                </div>
              `;
            })}
          </div>
        `}
      </div>
    `;
  }

  _renderThemeTab() {
    return html`
      <div class="blocks-section">
        <div class="section-title">选择主题</div>
        <div class="theme-grid">
          ${this._availableThemes.map(theme => html`
            <div 
              class="theme-item ${this.config.theme === theme.id ? 'selected' : ''}"
              @click=${() => this._selectTheme(theme.id)}
              title="${theme.description}"
            >
              <div class="theme-preview" style="
                background: ${theme.preview?.background || 'var(--cf-background)'};
                color: ${theme.preview?.color || 'var(--cf-text-primary)'};
                border: ${theme.preview?.border || '1px solid var(--cf-border)'};
              "></div>
              <div class="theme-name">${theme.name}</div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  _renderPropertiesTab() {
    if (!this._selectedBlock) {
      return html`
        <div class="empty-state">
          <ha-icon icon="mdi:select" style="font-size: 2em; opacity: 0.5;"></ha-icon>
          <div class="cf-text-sm cf-mt-md">请先选择一个块</div>
        </div>
      `;
    }

    return html`
      <block-properties
        .block=${this._selectedBlock}
        .hass=${this.hass}
        @block-updated=${this._onBlockUpdated}
      ></block-properties>
    `;
  }

  _switchTab(tab) {
    this._activeTab = tab;
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
    this._activeTab = 'properties'; // 自动切换到属性标签
    this._notifyConfigUpdate();
  }

  _selectBlock(block) {
    this._selectedBlock = block;
    this._activeTab = 'properties'; // 自动切换到属性标签
  }

  _removeBlock(e, blockId) {
    e.stopPropagation();
    
    this._blocks = this._blocks.filter(block => block.id !== blockId);
    
    if (this._selectedBlock?.id === blockId) {
      this._selectedBlock = null;
      this._activeTab = 'blocks'; // 回到块管理标签
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