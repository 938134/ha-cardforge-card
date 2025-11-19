// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';
import './inline-block-editor.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _currentStrategy: { state: true },
    _contentBlocks: { state: true },
    _availableEntities: { state: true },
    _editingBlockId: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
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

      .info-card {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
        text-align: center;
        margin-top: var(--cf-spacing-lg);
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
    this._currentStrategy = 'stateless';
    this._contentBlocks = [];
    this._availableEntities = [];
    this._editingBlockId = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest') || changedProperties.has('config')) {
      this._currentStrategy = this._detectStrategy();
      this._contentBlocks = this._extractContentBlocks();
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

  _detectStrategy() {
    const manifest = this.pluginManifest;
    if (!manifest) return 'stateless';
    if (manifest.layout_type === 'free') return 'free_layout';
    if (manifest.entity_requirements) return 'structured';
    return 'stateless';
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderStrategyContent()}
        ${this._renderInfoCard()}
      </div>
    `;
  }

  _renderStrategyContent() {
    switch (this._currentStrategy) {
      case 'free_layout': return this._renderFreeLayout();
      case 'structured': return this._renderStructured();
      default: return this._renderStateless();
    }
  }

  _renderFreeLayout() {
    return html`
      <div>
        ${this._renderHeaderFields()}
        
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

  _renderHeaderFields() {
    const capabilities = this.pluginManifest?.capabilities || {};
    if (!capabilities.supportsTitle && !capabilities.supportsFooter) return '';

    return html`
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
    `;
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

  _renderStructured() {
    const requirements = this.pluginManifest?.entity_requirements || {};
    return html`
      <div>
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
      </div>
    `;
  }

  _renderStateless() {
    return html``;
  }

  _renderInfoCard() {
    const strategyInfo = {
      free_layout: { name: '自由布局模式', description: '可任意添加和排列内容块', icon: 'mdi:view-grid-plus' },
      structured: { name: '智能数据源', description: '配置所需的数据源实体', icon: 'mdi:database-cog' },
      stateless: { name: '智能数据源', description: '使用内置数据源', icon: 'mdi:chart-donut' }
    };

    const info = strategyInfo[this._currentStrategy] || strategyInfo.stateless;

    return html`
      <div class="info-card">
        <ha-icon class="info-icon" .icon=${info.icon}></ha-icon>
        <div class="info-title">${info.name}</div>
        <p class="info-description">${info.description}</p>
      </div>
    `;
  }

  _getEntityValue(key) {
    const value = this.config.entities?.[key];
    if (value && typeof value === 'object') return value._source || value.state || '';
    return value || '';
  }

  _extractContentBlocks() {
    const blocks = [];
    const entities = this.config.entities || {};
    
    Object.entries(entities).forEach(([key, value]) => {
      if (key.endsWith('_type') && !['title', 'subtitle', 'footer'].some(prefix => key.startsWith(prefix))) {
        const blockId = key.replace('_type', '');
        
        const blockType = this._getStringValue(value);
        const blockContent = this._getStringValue(entities[blockId] || '');
        
        let blockConfig = {};
        const configKey = `${blockId}_config`;
        if (entities[configKey]) {
          try {
            blockConfig = JSON.parse(this._getStringValue(entities[configKey]));
          } catch (e) {
            console.warn(`解析内容块配置失败: ${blockId}`, e);
          }
        }
        
        const order = parseInt(this._getStringValue(entities[`${blockId}_order`])) || 0;
        
        blocks.push({ id: blockId, type: blockType, content: blockContent, config: blockConfig, order });
      }
    });
    
    return blocks.sort((a, b) => a.order - b.order);
  }

  _getStringValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value._source || value.state || '';
    return String(value);
  }

  _getBlockIcon(type) {
    const icons = { text: 'mdi:text', sensor: 'mdi:gauge', weather: 'mdi:weather-cloudy', switch: 'mdi:power' };
    return icons[type] || 'mdi:cube';
  }

  _getBlockTypeName(type) {
    const names = { text: '文本块', sensor: '传感器', weather: '天气', switch: '开关' };
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

  _onEntityChanged(key, value) {
    this._updateEntities({ [key]: value });
  }

  _addContentBlock() {
    const blockId = `block_${Date.now()}`;
    const newBlock = { id: blockId, type: 'text', content: '', config: {}, order: this._contentBlocks.length };
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

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}