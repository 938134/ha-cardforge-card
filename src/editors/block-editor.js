// src/editors/block-editor.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { blockManager } from '../core/block-manager.js';
import { designSystem } from '../core/design-system.js';
import './block-palette.js';
import './block-canvas.js';
import './block-inspector.js';
import './layout-toolbar.js';

class BlockEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _blocks: { state: true },
    _selectedBlock: { state: true },
    _activeTab: { state: true },
    _initialized: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .editor-container {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
        max-width: 100%;
        min-height: 600px;
      }

      .editor-header {
        background: var(--cf-surface);
        border-bottom: 1px solid var(--cf-border);
        padding: var(--cf-spacing-lg);
        border-radius: var(--cf-radius-lg) var(--cf-radius-lg) 0 0;
      }

      .editor-title {
        font-size: 1.3em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 var(--cf-spacing-md) 0;
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
      }

      .editor-subtitle {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        margin: 0;
      }

      .editor-body {
        display: grid;
        grid-template-columns: 280px 1fr 320px;
        gap: var(--cf-spacing-lg);
        flex: 1;
        min-height: 500px;
      }

      .editor-sidebar {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .editor-main {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        min-height: 500px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .editor-inspector {
        background: var(--cf-surface);
        border-radius: var(--cf-radius-lg);
        border: 1px solid var(--cf-border);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .empty-icon {
        font-size: 4em;
        opacity: 0.3;
        margin-bottom: var(--cf-spacing-md);
      }

      .loading-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--cf-spacing-md);
        padding: var(--cf-spacing-lg);
        border-top: 1px solid var(--cf-border);
        background: var(--cf-surface);
      }

      .action-button {
        padding: var(--cf-spacing-md) var(--cf-spacing-lg);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: var(--cf-surface);
        color: var(--cf-text-primary);
        cursor: pointer;
        font-size: 0.9em;
        font-weight: 500;
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .action-button.primary {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .action-button:hover {
        transform: translateY(-1px);
        box-shadow: var(--cf-shadow-sm);
      }

      .action-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      @media (max-width: 1200px) {
        .editor-body {
          grid-template-columns: 250px 1fr;
        }
        
        .editor-inspector {
          grid-column: 1 / -1;
          order: 3;
          max-height: 400px;
        }
      }

      @media (max-width: 768px) {
        .editor-body {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-md);
        }
        
        .editor-sidebar {
          order: 2;
          max-height: 300px;
        }
        
        .editor-main {
          order: 1;
          min-height: 400px;
        }
        
        .editor-inspector {
          order: 3;
          max-height: 350px;
        }
        
        .editor-actions {
          flex-direction: column;
        }
        
        .action-button {
          justify-content: center;
        }
      }

      @media (max-width: 480px) {
        .editor-header {
          padding: var(--cf-spacing-md);
        }
        
        .editor-title {
          font-size: 1.1em;
        }
        
        .editor-body {
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this.config = {};
    this._blocks = [];
    this._selectedBlock = null;
    this._activeTab = 'blocks';
    this._initialized = false;
  }

  async setConfig(config) {
    try {
      this._initialized = false;
      
      // 初始化块管理器
      await blockManager.initialize();
      
      this.config = {
        type: 'custom:ha-cardforge-card',
        layout: 'grid',
        theme: 'auto',
        grid: { columns: 4, gap: '8px' },
        flex: { direction: 'row', wrap: 'wrap', justifyContent: 'flex-start', alignItems: 'stretch', gap: '8px' },
        absolute: { containerWidth: 1000, containerHeight: 600 },
        blocks: [],
        ...config
      };
      
      this._blocks = [...(this.config.blocks || [])];
      this._initialized = true;
      
    } catch (error) {
      console.error('编辑器初始化失败:', error);
      this._initialized = false;
    }
  }

  render() {
    if (!this._initialized) {
      return this._renderLoading();
    }

    return html`
      <div class="editor-container">
        ${this._renderHeader()}
        ${this._renderBody()}
        ${this._renderActions()}
      </div>
    `;
  }

  _renderHeader() {
    return html`
      <div class="editor-header">
        <h2 class="editor-title">
          <ha-icon icon="mdi:palette"></ha-icon>
          卡片工坊编辑器
        </h2>
        <p class="editor-subtitle">
          拖拽块类型到画布，配置属性创建个性化卡片
        </p>
        <layout-toolbar
          .layout=${this.config.layout}
          .gridConfig=${this.config.grid}
          .flexConfig=${this.config.flex}
          .absoluteConfig=${this.config.absolute}
          .theme=${this.config.theme}
          @layout-changed=${this._onLayoutChanged}
          @theme-changed=${this._onThemeChanged}
        ></layout-toolbar>
      </div>
    `;
  }

  _renderBody() {
    return html`
      <div class="editor-body">
        <!-- 左侧：块面板 -->
        <div class="editor-sidebar">
          <block-palette
            @block-added=${this._onBlockAdded}
          ></block-palette>
        </div>
        
        <!-- 中间：编辑画布 -->
        <div class="editor-main">
          ${this._blocks.length > 0 ? html`
            <block-canvas
              .hass=${this.hass}
              .blocks=${this._blocks}
              .layout=${this.config.layout}
              .gridConfig=${this.config.grid}
              .flexConfig=${this.config.flex}
              .absoluteConfig=${this.config.absolute}
              .selectedBlock=${this._selectedBlock}
              @block-selected=${this._onBlockSelected}
              @blocks-reordered=${this._onBlocksReordered}
              @block-removed=${this._onBlockRemoved}
              @block-updated=${this._onBlockUpdated}
            ></block-canvas>
          ` : html`
            <div class="empty-state">
              <ha-icon class="empty-icon" icon="mdi:view-grid-plus"></ha-icon>
              <div class="cf-text-lg cf-mb-sm">从左侧添加内容块</div>
              <div class="cf-text-sm cf-text-secondary">拖拽或点击块类型添加到画布</div>
              <div class="cf-text-xs cf-mt-md cf-text-secondary">
                支持传感器、文本、时间、天气、媒体、操作、图表和布局容器
              </div>
            </div>
          `}
        </div>
        
        <!-- 右侧：属性检查器 -->
        <div class="editor-inspector">
          ${this._selectedBlock ? html`
            <block-inspector
              .block=${this._selectedBlock}
              .hass=${this.hass}
              @block-updated=${this._onBlockUpdated}
              @block-removed=${this._onBlockRemoved}
            ></block-inspector>
          ` : html`
            <div class="empty-state">
              <ha-icon class="empty-icon" icon="mdi:cursor-default-click"></ha-icon>
              <div class="cf-text-md cf-mb-sm">选择块进行配置</div>
              <div class="cf-text-sm cf-text-secondary">点击画布中的块查看和编辑属性</div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  _renderActions() {
    return html`
      <div class="editor-actions">
        <button class="action-button" @click=${this._onCancel} title="取消编辑">
          <ha-icon icon="mdi:close"></ha-icon>
          取消
        </button>
        <button class="action-button" @click=${this._onReset} title="重置配置">
          <ha-icon icon="mdi:refresh"></ha-icon>
          重置
        </button>
        <button class="action-button primary" @click=${this._onSave} title="保存配置">
          <ha-icon icon="mdi:content-save"></ha-icon>
          保存
        </button>
      </div>
    `;
  }

  _renderLoading() {
    return html`
      <div class="editor-container">
        <div class="loading-state">
          <ha-circular-progress indeterminate></ha-circular-progress>
          <div class="cf-text-md cf-mt-md">初始化编辑器中...</div>
        </div>
      </div>
    `;
  }

  _onBlockAdded(e) {
    const blockType = e.detail.type;
    const defaultConfig = blockManager.getDefaultConfig(blockType);
    
    const newBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      config: defaultConfig,
      position: { x: 0, y: 0, w: 1, h: 1 }
    };
    
    this._blocks = [...this._blocks, newBlock];
    this._selectedBlock = newBlock;
    this._notifyConfigChanged();
  }

  _onBlockSelected(e) {
    this._selectedBlock = e.detail.block;
  }

  _onBlockUpdated(e) {
    const updatedBlock = e.detail.block;
    this._blocks = this._blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    );
    this._selectedBlock = updatedBlock;
    this._notifyConfigChanged();
  }

  _onBlockRemoved(e) {
    const blockId = e.detail.blockId;
    this._blocks = this._blocks.filter(block => block.id !== blockId);
    
    if (this._selectedBlock?.id === blockId) {
      this._selectedBlock = null;
    }
    
    this._notifyConfigChanged();
  }

  _onBlocksReordered(e) {
    this._blocks = e.detail.blocks;
    this._notifyConfigChanged();
  }

  _onLayoutChanged(e) {
    this.config = {
      ...this.config,
      layout: e.detail.layout,
      grid: e.detail.gridConfig,
      flex: e.detail.flexConfig,
      absolute: e.detail.absoluteConfig
    };
    this._notifyConfigChanged();
  }

  _onThemeChanged(e) {
    this.config = {
      ...this.config,
      theme: e.detail.theme
    };
    this._notifyConfigChanged();
  }

  _onSave() {
    this._notifyConfigChanged();
    
    // 显示保存成功提示
    this.dispatchEvent(new CustomEvent('editor-saved', {
      detail: { message: '配置已保存' }
    }));
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent('editor-cancelled'));
  }

  _onReset() {
    if (confirm('确定要重置所有配置吗？这将清除所有块和设置。')) {
      this._blocks = [];
      this._selectedBlock = null;
      this.config = {
        type: 'custom:ha-cardforge-card',
        layout: 'grid',
        theme: 'auto',
        grid: { columns: 4, gap: '8px' },
        blocks: []
      };
      this._notifyConfigChanged();
    }
  }

  _notifyConfigChanged() {
    const configToSend = {
      ...this.config,
      blocks: this._blocks
    };
    
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: configToSend }
    }));
  }

  // Home Assistant 编辑器接口
  static get hass() {
    return this._hass;
  }

  static set hass(value) {
    this._hass = value;
  }

  get hass() {
    return this._hass;
  }

  set hass(value) {
    this._hass = value;
  }
}

if (!customElements.get('block-editor')) {
  customElements.define('block-editor', BlockEditor);
}

// 注册为Home Assistant卡片编辑器
if (!customElements.get('ha-cardforge-editor')) {
  customElements.define('ha-cardforge-editor', BlockEditor);
}

export { BlockEditor };