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
    _initialized: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .section-title ha-icon {
        color: var(--cf-primary-color);
      }

      .blocks-container {
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
        background: var(--cf-surface);
      }

      .block-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .block-card:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .block-card.selected {
        border-color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .block-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2em;
      }

      .block-name {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        flex: 1;
      }

      .block-type {
        font-size: 0.7em;
        color: var(--cf-text-secondary);
        background: rgba(var(--cf-rgb-primary), 0.1);
        padding: 2px 6px;
        border-radius: var(--cf-radius-sm);
      }

      .block-content {
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-sm);
        border-radius: var(--cf-radius-sm);
        background: rgba(var(--cf-rgb-primary), 0.03);
      }

      .themes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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

      .delete-btn {
        color: var(--cf-error-color);
        cursor: pointer;
        opacity: 0.7;
        transition: opacity var(--cf-transition-fast);
      }

      .delete-btn:hover {
        opacity: 1;
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
    await blockRegistry.initialize();
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
        <!-- 块选择区域 -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:cube-outline"></ha-icon>
            块
          </div>
          <block-palette
            @block-selected=${this._onBlockSelected}
          ></block-palette>
        </div>

        <!-- 已添加的块 -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:view-grid"></ha-icon>
            块卡片
          </div>
          <div class="blocks-container">
            ${this._blocks.length === 0 ? html`
              <div class="empty-state">
                <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.5;"></ha-icon>
                <div class="cf-text-sm cf-mt-md">尚未添加任何块</div>
                <div class="cf-text-xs cf-mt-sm cf-text-secondary">从上方选择块开始创建</div>
              </div>
            ` : this._blocks.map(block => this._renderBlockCard(block))}
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
                title="${theme.description}"
              >
                <div class="theme-icon">${theme.icon}</div>
                <div class="theme-name">${theme.name}</div>
              </div>
            `)}
          </div>
        </div>

        <!-- 属性设置 -->
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:cog"></ha-icon>
            属性
          </div>
          <block-properties
            .block=${this._selectedBlock}
            .hass=${this.hass}
            @block-updated=${this._onBlockUpdated}
          ></block-properties>
        </div>
      </div>
    `;
  }

  _renderBlockCard(block) {
    const manifest = blockRegistry.getBlockManifest(block.type);
    const blockInstance = blockRegistry.createBlockInstance(block.type);
    
    let previewContent = '预览内容';
    try {
      if (blockInstance) {
        const template = blockInstance.render(block.config, this.hass);
        // 提取纯文本内容用于预览
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template;
        previewContent = tempDiv.textContent?.trim() || '预览内容';
      }
    } catch (error) {
      previewContent = '渲染错误';
    }

    return html`
      <div 
        class="block-card ${this._selectedBlock?.id === block.id ? 'selected' : ''}"
        @click=${() => this._selectBlock(block)}
      >
        <div class="block-header">
          <div class="block-icon">${manifest?.icon || '📦'}</div>
          <div class="block-name">${manifest?.name || block.type}</div>
          <div class="block-type">${block.type}</div>
          <ha-icon 
            class="delete-btn"
            icon="mdi:delete" 
            @click=${e => this._removeBlock(e, block.id)}
          ></ha-icon>
        </div>
        <div class="block-content">
          ${previewContent}
        </div>
      </div>
    `;
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