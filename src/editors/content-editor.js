// src/editors/content-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockManager } from '../core/block-manager.js';

class ContentEditor extends LitElement {
  static properties = {
    config: { type: Object },
    hass: { type: Object },
    activeSection: { type: String },
    _availableBlocks: { state: true },
    _editingBlock: { state: true },
    _showBlockPicker: { state: true },
    _loading: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .content-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .section-header {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
      }

      .blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .add-block-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--cf-spacing-lg);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        color: var(--cf-text-secondary);
      }

      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
      }

      .block-picker {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-md);
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
      }

      .block-type-item:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-1px);
      }

      .block-icon {
        font-size: 1.5em;
        margin-bottom: var(--cf-spacing-sm);
      }

      .block-type-name {
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
        background: var(--cf-surface);
      }

      .loading-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }
    `
  ];

  constructor() {
    super();
    this._availableBlocks = [];
    this._editingBlock = null;
    this._showBlockPicker = false;
    this._loading = true;
  }

  async firstUpdated() {
    try {
      console.log('🔄 开始加载块...');
      await blockManager.initialize();
      this._availableBlocks = blockManager.getAllBlocks();
      console.log('✅ 块加载完成:', this._availableBlocks);
      this._loading = false;
      this.requestUpdate();
    } catch (error) {
      console.error('❌ 块加载失败:', error);
      this._loading = false;
      this.requestUpdate();
    }
  }

  render() {
    const currentSection = this.activeSection || 'main';
    const sectionBlocks = this.config?.sections?.[currentSection]?.blocks || [];

    return html`
      <div class="content-container">
        <div class="section-header">
          当前区域: ${currentSection}
        </div>

        ${this._loading ? this._renderLoading() : this._renderContent(sectionBlocks)}
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="loading-state">
        <ha-circular-progress indeterminate></ha-circular-progress>
        <div class="cf-text-sm cf-mt-md">加载块类型...</div>
      </div>
    `;
  }

  _renderContent(sectionBlocks) {
    return html`
      <!-- 块选择器 -->
      ${this._showBlockPicker ? html`
        <div class="block-picker">
          <div class="cf-text-sm cf-font-medium cf-mb-md">选择块类型:</div>
          <div class="blocks-grid">
            ${this._availableBlocks.map(block => html`
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
      ` : ''}

      <!-- 添加块按钮 -->
      <div 
        class="add-block-btn"
        @click=${this._toggleBlockPicker}
      >
        <ha-icon icon="mdi:plus" class="cf-mr-sm"></ha-icon>
        ${this._showBlockPicker ? '取消添加' : '添加块'}
      </div>

      <!-- 块列表 -->
      <div class="blocks-list">
        ${sectionBlocks.length === 0 ? html`
          <div class="empty-state">
            <ha-icon icon="mdi:package-variant" style="font-size: 2em; opacity: 0.5;"></ha-icon>
            <div class="cf-text-sm cf-mt-md">此区域尚未添加任何块</div>
            <div class="cf-text-xs cf-mt-sm">点击上方"添加块"开始创建</div>
          </div>
        ` : sectionBlocks.map(block => this._renderBlockItem(block))}
      </div>

      <!-- 块编辑表单 -->
      ${this._editingBlock ? html`
        <block-form
          .block=${this._editingBlock}
          .hass=${this.hass}
          @block-updated=${this._onBlockUpdated}
          @block-deleted=${this._onBlockDeleted}
        ></block-form>
      ` : ''}
    `;
  }

  _renderBlockItem(block) {
    const manifest = blockManager.getBlockManifest(block.type);
    
    return html`
      <div class="block-item">
        <div class="cf-flex cf-flex-between cf-p-md" style="background: var(--cf-surface); border-radius: var(--cf-radius-md); border: 1px solid var(--cf-border);">
          <div class="cf-flex cf-gap-md">
            <div>${manifest?.icon || '📦'}</div>
            <div>
              <div class="cf-text-sm cf-font-medium">${manifest?.name || block.type}</div>
              <div class="cf-text-xs cf-text-secondary">${this._getBlockPreview(block)}</div>
            </div>
          </div>
          <div class="cf-flex cf-gap-sm">
            <ha-icon 
              icon="mdi:pencil" 
              style="cursor: pointer; color: var(--cf-primary-color);"
              @click=${() => this._editBlock(block)}
            ></ha-icon>
            <ha-icon 
              icon="mdi:delete" 
              style="cursor: pointer; color: var(--cf-error-color);"
              @click=${() => this._deleteBlock(block.id)}
            ></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  _getBlockPreview(block) {
    switch (block.type) {
      case 'text':
        return block.config?.content || '文本内容';
      case 'entity':
        return block.config?.entity || '未选择实体';
      case 'time':
        return '时间显示';
      case 'layout':
        return `${block.config?.layout || 'vertical'} 布局`;
      default:
        return '块内容';
    }
  }

  _toggleBlockPicker() {
    this._showBlockPicker = !this._showBlockPicker;
  }

  _addBlock(blockType) {
    const currentSection = this.activeSection || 'main';
    const newBlock = {
      id: `block_${Date.now()}`,
      type: blockType,
      config: {}
    };

    const newSections = {
      ...this.config.sections,
      [currentSection]: {
        blocks: [...(this.config.sections?.[currentSection]?.blocks || []), newBlock]
      }
    };

    const newConfig = {
      ...this.config,
      sections: newSections
    };

    this._showBlockPicker = false;
    this._editingBlock = newBlock;

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
  }

  _editBlock(block) {
    this._editingBlock = block;
  }

  _deleteBlock(blockId) {
    const currentSection = this.activeSection || 'main';
    const sectionBlocks = this.config.sections?.[currentSection]?.blocks || [];
    const newBlocks = sectionBlocks.filter(block => block.id !== blockId);

    const newSections = {
      ...this.config.sections,
      [currentSection]: { blocks: newBlocks }
    };

    const newConfig = {
      ...this.config,
      sections: newSections
    };

    if (this._editingBlock?.id === blockId) {
      this._editingBlock = null;
    }

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
  }

  _onBlockUpdated(e) {
    const updatedBlock = e.detail.block;
    const currentSection = this.activeSection || 'main';
    const sectionBlocks = this.config.sections?.[currentSection]?.blocks || [];
    
    const newBlocks = sectionBlocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );

    const newSections = {
      ...this.config.sections,
      [currentSection]: { blocks: newBlocks }
    };

    const newConfig = {
      ...this.config,
      sections: newSections
    };

    this._editingBlock = updatedBlock;

    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: newConfig }
    }));
  }

  _onBlockDeleted(e) {
    this._deleteBlock(e.detail.blockId);
  }
}

if (!customElements.get('content-editor')) {
  customElements.define('content-editor', ContentEditor);
}

export { ContentEditor };
