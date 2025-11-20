// src/editors/layout-editors.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { designSystem } from '../core/design-system.js';
import { LayoutStrategy } from '../core/layout-strategy.js';
import './inline-block-editor.js';

// === 自由布局编辑器 ===
export class FreeLayoutEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _contentBlocks: { state: true },
    _availableEntities: { state: true },
    _editingBlockId: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .free-layout-editor {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .header-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .field-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: grid;
        grid-template-columns: 25% 75%;
        gap: var(--cf-spacing-md);
        align-items: center;
      }

      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .blocks-section {
        margin-top: var(--cf-spacing-lg);
      }

      .section-title {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .content-blocks-list {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-sm);
      }

      .content-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        transition: all var(--cf-transition-fast);
        cursor: pointer;
      }

      .content-block:hover {
        border-color: var(--cf-primary-color);
      }

      .block-icon {
        font-size: 1.2em;
        opacity: 0.7;
        width: 24px;
        text-align: center;
      }

      .block-info {
        flex: 1;
      }

      .block-title {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
        margin-bottom: 2px;
      }

      .block-preview {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        opacity: 0.7;
      }

      .block-actions {
        display: flex;
        gap: var(--cf-spacing-xs);
        opacity: 0;
        transition: opacity var(--cf-transition-fast);
      }

      .content-block:hover .block-actions {
        opacity: 1;
      }

      .block-action {
        width: 32px;
        height: 32px;
        border-radius: var(--cf-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--cf-background);
        border: 1px solid var(--cf-border);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
      }

      .block-action:hover {
        background: var(--cf-primary-color);
        color: white;
        border-color: var(--cf-primary-color);
      }

      .block-action.delete:hover {
        background: var(--cf-error-color);
        border-color: var(--cf-error-color);
      }

      .add-block-btn {
        width: 100%;
        padding: var(--cf-spacing-lg);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        background: transparent;
        color: var(--cf-text-secondary);
        cursor: pointer;
        transition: all var(--cf-transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--cf-spacing-sm);
        font-size: 0.9em;
      }

      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
        background: rgba(var(--cf-rgb-primary), 0.05);
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
        border: 2px dashed var(--cf-border);
        border-radius: var(--cf-radius-md);
        margin-bottom: var(--cf-spacing-md);
      }

      @media (max-width: 600px) {
        .header-fields {
          grid-template-columns: 1fr;
        }

        .field-card {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._contentBlocks = [];
    this._availableEntities = [];
    this._editingBlockId = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      this._contentBlocks = LayoutStrategy.extractContentBlocks(this.config.entities || {});
    }
    
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: state.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  render() {
    const capabilities = this._getPluginCapabilities();
    
    return html`
      <div class="free-layout-editor">
        ${capabilities.supportsTitle || capabilities.supportsFooter ? html`
          <div class="header-fields">
            ${capabilities.supportsTitle ? html`
              <div class="field-card">
                <div class="field-label">标题</div>
                <ha-combo-box
                  .items=${this._availableEntities}
                  .value=${this._getEntityValue('title')}
                  @value-changed=${e => this._onHeaderFieldChanged('title', e.detail.value)}
                  allow-custom-value
                  label="标题文本或实体"
                ></ha-combo-box>
              </div>
              <div class="field-card">
                <div class="field-label">副标题</div>
                <ha-combo-box
                  .items=${this._availableEntities}
                  .value=${this._getEntityValue('subtitle')}
                  @value-changed=${e => this._onHeaderFieldChanged('subtitle', e.detail.value)}
                  allow-custom-value
                  label="副标题文本或实体"
                ></ha-combo-box>
              </div>
            ` : ''}
            
            ${capabilities.supportsFooter ? html`
              <div class="field-card">
                <div class="field-label">页脚</div>
                <ha-combo-box
                  .items=${this._availableEntities}
                  .value=${this._getEntityValue('footer')}
                  @value-changed=${e => this._onHeaderFieldChanged('footer', e.detail.value)}
                  allow-custom-value
                  label="页脚文本或实体"
                ></ha-combo-box>
              </div>
            ` : ''}
          </div>
        ` : ''}
        
        <div class="blocks-section">
          <div class="section-title">
            <span>内容块管理</span>
            <span class="cf-text-sm cf-text-secondary">${this._contentBlocks.length} 个内容块</span>
          </div>
          
          <div class="content-blocks-list">
            ${this._contentBlocks.map(block => 
              block.id === this._editingBlockId ? 
                this._renderInlineEditor(block) : 
                this._renderContentBlock(block)
            )}
            
            ${this._contentBlocks.length === 0 ? html`
              <div class="empty-state">
                <ha-icon class="empty-icon" icon="mdi:package-variant"></ha-icon>
                <p class="empty-text">点击"添加内容块"开始构建布局</p>
              </div>
            ` : ''}
            
            <button class="add-block-btn" @click=${this._addContentBlock}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加内容块
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _getPluginCapabilities() {
    // 这里应该从插件manifest获取，暂时返回默认值
    return {
      supportsTitle: true,
      supportsFooter: true
    };
  }

  _getEntityValue(key) {
    const value = this.config.entities?.[key];
    if (value && typeof value === 'object') return value._source || value.state || '';
    return value || '';
  }

  _renderContentBlock(block) {
    return html`
      <div class="content-block">
        <ha-icon class="block-icon" .icon=${this._getBlockIcon(block.type)}></ha-icon>
        <div class="block-info" @click=${() => this._editContentBlock(block.id)}>
          <div class="block-title">${this._getBlockTypeName(block.type)}</div>
          <div class="block-preview">${this._getBlockPreview(block)}</div>
        </div>
        <div class="block-actions">
          <div class="block-action" @click=${() => this._editContentBlock(block.id)}>
            <ha-icon icon="mdi:pencil"></ha-icon>
          </div>
          <div class="block-action delete" @click=${() => this._deleteContentBlock(block.id)}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }

  _renderInlineEditor(block) {
    return html`
      <inline-block-editor
        .block=${block}
        .hass=${this.hass}
        .availableEntities=${this._availableEntities}
        .onSave=${(updatedBlock) => this._saveContentBlock(updatedBlock)}
        .onDelete=${(blockId) => this._deleteContentBlock(blockId)}
        .onCancel=${() => this._cancelEdit()}
      ></inline-block-editor>
    `;
  }

  _getBlockIcon(type) {
    const icons = { 
      text: 'mdi:text', 
      sensor: 'mdi:gauge', 
      weather: 'mdi:weather-cloudy', 
      switch: 'mdi:power' 
    };
    return icons[type] || 'mdi:cube';
  }

  _getBlockTypeName(type) {
    const names = { 
      text: '文本块', 
      sensor: '传感器', 
      weather: '天气', 
      switch: '开关' 
    };
    return names[type] || '内容块';
  }

  _getBlockPreview(block) {
    if (block.type === 'text') {
      return (block.content || '').substring(0, 20) + ((block.content || '').length > 20 ? '...' : '');
    }
    return block.content || '点击编辑';
  }

  _onHeaderFieldChanged(field, value) {
    this._updateEntities({ [field]: value });
  }

  _addContentBlock() {
    const blockId = `block_${Date.now()}`;
    const newBlock = { 
      id: blockId, 
      type: 'text', 
      content: '', 
      config: {}, 
      order: this._contentBlocks.length 
    };
    this._contentBlocks = [...this._contentBlocks, newBlock];
    this._editingBlockId = blockId;
    this._saveBlockToEntities(newBlock);
  }

  _editContentBlock(blockId) {
    this._editingBlockId = blockId;
  }

  _deleteContentBlock(blockId) {
    if (!confirm('确定要删除这个内容块吗？')) return;
    
    const newEntities = { ...this.config.entities };
    Object.keys(newEntities).forEach(key => {
      if (key.startsWith(blockId)) delete newEntities[key];
    });
    
    this._updateEntities(newEntities);
    this._editingBlockId = null;
  }

  _saveContentBlock(updatedBlock) {
    this._saveBlockToEntities(updatedBlock);
    this._editingBlockId = null;
  }

  _cancelEdit() {
    this._editingBlockId = null;
  }

  _saveBlockToEntities(block) {
    const newEntities = { ...this.config.entities };
    
    newEntities[block.id] = block.content || '';
    newEntities[`${block.id}_type`] = block.type || 'text';
    newEntities[`${block.id}_order`] = String(block.order || '0');
    
    if (Object.keys(block.config || {}).length > 0) {
      newEntities[`${block.id}_config`] = JSON.stringify(block.config);
    }
    
    this._updateEntities(newEntities);
  }

  _updateEntities(entities) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: typeof entities === 'object' ? entities : { ...this.config.entities, ...entities } }
    }));
  }
}

// === 实体驱动编辑器 ===
export class EntityDrivenEditor extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _availableEntities: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .entity-driven-editor {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .field-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: grid;
        grid-template-columns: 25% 75%;
        gap: var(--cf-spacing-md);
        align-items: center;
        margin-bottom: var(--cf-spacing-md);
      }

      .field-label {
        font-size: 0.9em;
        font-weight: 500;
        color: var(--cf-text-primary);
      }

      .info-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        text-align: center;
        margin-top: var(--cf-spacing-lg);
      }

      .info-icon {
        font-size: 2em;
        color: var(--cf-primary-color);
        margin-bottom: var(--cf-spacing-md);
      }

      .info-title {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
        color: var(--cf-text-primary);
      }

      .info-description {
        font-size: 0.9em;
        color: var(--cf-text-secondary);
        line-height: 1.4;
      }

      @media (max-width: 600px) {
        .field-card {
          grid-template-columns: 1fr;
          gap: var(--cf-spacing-sm);
        }
      }
    `
  ];

  constructor() {
    super();
    this._availableEntities = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('hass') && this.hass) {
      this._updateAvailableEntities();
    }
  }

  _updateAvailableEntities() {
    if (!this.hass?.states) {
      this._availableEntities = [];
      return;
    }

    this._availableEntities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: state.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  render() {
    const requirements = this.pluginManifest?.entity_requirements || {};
    
    if (Object.keys(requirements).length === 0) {
      return this._renderNoRequirements();
    }

    return html`
      <div class="entity-driven-editor">
        ${Object.entries(requirements).map(([key, requirement]) => html`
          <div class="field-card">
            <div class="field-label">${requirement.name}</div>
            <ha-combo-box
              .items=${this._availableEntities}
              .value=${this._getEntityValue(key)}
              @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
              allow-custom-value
              label=${`选择 ${requirement.name}`}
            ></ha-combo-box>
          </div>
        `)}
        
        ${this._renderInfoCard()}
      </div>
    `;
  }

  _renderNoRequirements() {
    return html`
      <div class="entity-driven-editor">
        <div class="info-card">
          <ha-icon class="info-icon" icon="mdi:auto-fix"></ha-icon>
          <div class="info-title">智能数据源</div>
          <p class="info-description">此卡片使用内置数据源，无需额外配置实体</p>
        </div>
      </div>
    `;
  }

  _renderInfoCard() {
    return html`
      <div class="info-card">
        <ha-icon class="info-icon" icon="mdi:database-cog"></ha-icon>
        <div class="info-title">数据源配置</div>
        <p class="info-description">为此卡片配置需要的数据源实体</p>
      </div>
    `;
  }

  _getEntityValue(key) {
    const value = this.config.entities?.[key];
    if (value && typeof value === 'object') return value._source || value.state || '';
    return value || '';
  }

  _onEntityChanged(key, value) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: { [key]: value } }
    }));
  }
}

// === 布局编辑器管理器 ===
export class LayoutEditorManager extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _currentMode: { state: true }
  };

  static styles = [
    designSystem,
    css`
      .layout-manager {
        width: 100%;
      }
    `
  ];

  constructor() {
    super();
    this._currentMode = 'entity_driven';
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest')) {
      this._currentMode = this._detectLayoutMode();
    }
  }

  _detectLayoutMode() {
    if (!this.pluginManifest) return 'entity_driven';
    
    if (this.pluginManifest.layout_type === 'free' || this.pluginManifest.allow_custom_entities) {
      return 'free';
    }
    
    return 'entity_driven';
  }

  render() {
    switch (this._currentMode) {
      case 'free':
        return html`
          <free-layout-editor
            .hass=${this.hass}
            .config=${this.config}
            @entities-changed=${this._onEntitiesChanged}
          ></free-layout-editor>
        `;
      case 'entity_driven':
      default:
        return html`
          <entity-driven-editor
            .hass=${this.hass}
            .config=${this.config}
            .pluginManifest=${this.pluginManifest}
            @entities-changed=${this._onEntitiesChanged}
          ></entity-driven-editor>
        `;
    }
  }

  _onEntitiesChanged(e) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: e.detail
    }));
  }
}

// 注册自定义元素
if (!customElements.get('free-layout-editor')) {
  customElements.define('free-layout-editor', FreeLayoutEditor);
}

if (!customElements.get('entity-driven-editor')) {
  customElements.define('entity-driven-editor', EntityDrivenEditor);
}

if (!customElements.get('layout-editor-manager')) {
  customElements.define('layout-editor-manager', LayoutEditorManager);
}