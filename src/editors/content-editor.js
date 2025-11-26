// src/editors/content-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { blockManager } from '../core/block-manager.js';
import './block-forms/base-form.js';

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
      // 等待块管理器初始化完成
      await blockManager.initialize();
      this._availableBlocks = blockManager.getAllBlocks();
      console.log('可用块:', this._availableBlocks);
    } catch (error) {
      console.error('加载块失败:', error);
    } finally {
      this._loading = false;
      this.requestUpdate();
    }
  }

  render() {
    if (this._loading) {
      return html`
        <div class="loading-state">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="cf-text-sm cf-mt-md">加载块类型中...</div>
        </div>
      `;
    }

    const currentSection = this.activeSection || 'main';
    const sectionBlocks = this.config?.sections?.[currentSection]?.blocks || [];

    return html`
      <div class="content-container">
        <div class="section-header">
          当前区域: ${currentSection}
        </div>

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
      </div>
    `;
  }

  // ... 其余方法保持不变
}

if (!customElements.get('content-editor')) {
  customElements.define('content-editor', ContentEditor);
}

export { ContentEditor };
