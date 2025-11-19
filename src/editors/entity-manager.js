// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _currentStrategy: { state: true },
    _contentBlocks: { state: true },
    _availableEntities: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      .strategy-indicator {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 4px solid var(--cf-primary-color);
      }

      .strategy-info {
        flex: 1;
      }

      .strategy-title {
        font-size: 1em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 var(--cf-spacing-xs) 0;
      }

      .strategy-description {
        font-size: 0.85em;
        color: var(--cf-text-secondary);
        margin: 0;
        line-height: 1.4;
      }

      /* 自由布局样式 */
      .free-layout-section {
        margin-bottom: var(--cf-spacing-lg);
      }

      .section-title {
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin-bottom: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .content-blocks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
      }

      .content-block {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        transition: all var(--cf-transition-fast);
        cursor: pointer;
        min-height: 60px;
      }

      .content-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
        box-shadow: var(--cf-shadow-sm);
      }

      .block-icon {
        font-size: 1.2em;
        opacity: 0.7;
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

      /* 结构化实体样式 */
      .structured-section {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .entity-field {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-md);
      }

      .entity-field.required {
        border-left: 3px solid var(--cf-error-color);
      }

      .field-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--cf-spacing-sm);
      }

      .field-info {
        flex: 1;
      }

      .field-name {
        font-size: 0.95em;
        font-weight: 600;
        color: var(--cf-text-primary);
        margin: 0 0 4px 0;
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .field-description {
        font-size: 0.8em;
        color: var(--cf-text-secondary);
        line-height: 1.3;
        margin: 0;
      }

      .required-badge {
        background: var(--cf-error-color);
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 0.7em;
        font-weight: 500;
        white-space: nowrap;
      }

      .optional-badge {
        background: var(--cf-text-secondary);
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 0.7em;
        font-weight: 500;
        white-space: nowrap;
      }

      /* 无状态样式 */
      .stateless-section {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .stateless-icon {
        font-size: 2.5em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }

      .stateless-title {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: var(--cf-spacing-sm);
        color: var(--cf-text-primary);
      }

      .stateless-description {
        font-size: 0.9em;
        line-height: 1.4;
        margin: 0;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .empty-icon {
        font-size: 2em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }

      .empty-text {
        font-size: 0.9em;
        margin: 0;
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .content-block {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .entity-field {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }
      }

      /* 响应式优化 */
      @media (max-width: 600px) {
        .content-blocks-grid {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: var(--cf-spacing-sm);
        }

        .content-block {
          min-height: 55px;
          padding: var(--cf-spacing-sm);
        }

        .field-header {
          flex-direction: column;
          gap: var(--cf-spacing-xs);
        }

        .required-badge,
        .optional-badge {
          align-self: flex-start;
        }
      }
    `
  ];

  constructor() {
    super();
    this._currentStrategy = 'stateless';
    this._contentBlocks = [];
    this._availableEntities = [];
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

    const entities = Object.entries(this.hass.states)
      .map(([entityId, state]) => ({
        value: entityId,
        label: state.attributes?.friendly_name || entityId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    this._availableEntities = entities;
  }

  _detectStrategy() {
    const manifest = this.pluginManifest;
    if (!manifest) return 'stateless';

    if (manifest.layout_type === 'free') return 'free_layout';
    if (manifest.entity_requirements && Object.keys(manifest.entity_requirements).length > 0) {
      return 'structured';
    }
    return 'stateless';
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderStrategyIndicator()}
        ${this._renderStrategyContent()}
      </div>
    `;
  }

  _renderStrategyIndicator() {
    const strategyInfo = this._getStrategyInfo();
    
    return html`
      <div class="strategy-indicator">
        <ha-icon .icon=${strategyInfo.icon}></ha-icon>
        <div class="strategy-info">
          <div class="strategy-title">${strategyInfo.name}</div>
          <div class="strategy-description">${strategyInfo.description}</div>
        </div>
      </div>
    `;
  }

  _renderStrategyContent() {
    switch (this._currentStrategy) {
      case 'free_layout':
        return this._renderFreeLayout();
      case 'structured':
        return this._renderStructured();
      default:
        return this._renderStateless();
    }
  }

  _renderFreeLayout() {
    return html`
      <div class="free-layout-section">
        <div class="section-title">
          <ha-icon icon="mdi:view-grid-plus"></ha-icon>
          内容块管理
        </div>

        <div class="content-blocks-grid">
          ${this._contentBlocks.map(block => this._renderContentBlock(block))}
          <button class="add-block-btn" @click=${this._addContentBlock}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加内容块
          </button>
        </div>

        ${this._contentBlocks.length === 0 ? html`
          <div class="empty-state">
            <ha-icon class="empty-icon" icon="mdi:package-variant"></ha-icon>
            <p class="empty-text">点击"添加内容块"开始构建布局</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderStructured() {
    const requirements = this.pluginManifest?.entity_requirements || {};

    return html`
      <div class="structured-section">
        <div class="section-title">
          <ha-icon icon="mdi:database-cog"></ha-icon>
          数据源配置
        </div>

        ${Object.entries(requirements).map(([key, requirement]) => 
          this._renderEntityField(key, requirement)
        )}
      </div>
    `;
  }

  _renderStateless() {
    return html`
      <div class="stateless-section">
        <ha-icon class="stateless-icon" icon="mdi:chart-donut"></ha-icon>
        <div class="stateless-title">智能数据源</div>
        <p class="stateless-description">
          此卡片使用内置数据源，无需额外配置实体。<br>
          系统会自动提供相关数据展示。
        </p>
      </div>
    `;
  }

  _renderContentBlock(block) {
    return html`
      <div class="content-block" @click=${() => this._editContentBlock(block.id)}>
        <ha-icon class="block-icon" .icon=${this._getBlockIcon(block.type)}></ha-icon>
        <div class="block-info">
          <div class="block-title">${this._getBlockTypeName(block.type)}</div>
          <div class="block-preview">${this._getBlockPreview(block)}</div>
        </div>
      </div>
    `;
  }

  _renderEntityField(key, requirement) {
    const currentValue = this.config.entities?.[key] || '';

    return html`
      <div class="entity-field ${requirement.required ? 'required' : ''}">
        <div class="field-header">
          <div class="field-info">
            <div class="field-name">
              ${requirement.name}
              ${requirement.required ? html`
                <span class="required-badge">必需</span>
              ` : html`
                <span class="optional-badge">可选</span>
              `}
            </div>
            ${requirement.description ? html`
              <p class="field-description">${requirement.description}</p>
            ` : ''}
          </div>
        </div>

        <ha-combo-box
          .items=${this._availableEntities}
          .value=${currentValue}
          @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
          allow-custom-value
          label=${`选择 ${requirement.name}`}
        ></ha-combo-box>

        ${requirement.example ? html`
          <div style="margin-top: var(--cf-spacing-xs);">
            <small style="color: var(--cf-text-secondary);">例如: ${requirement.example}</small>
          </div>
        ` : ''}
      </div>
    `;
  }

  _getStrategyInfo() {
    const strategyInfo = {
      free_layout: {
        name: '自由布局模式',
        description: '可任意添加和排列内容块，构建个性化布局',
        icon: 'mdi:view-grid-plus'
      },
      structured: {
        name: '数据源配置模式', 
        description: '为此卡片配置需要的数据源和实体',
        icon: 'mdi:database-cog'
      },
      stateless: {
        name: '智能数据源模式',
        description: '此卡片使用内置数据源，无需额外配置',
        icon: 'mdi:chart-donut'
      }
    };

    return strategyInfo[this._currentStrategy] || strategyInfo.stateless;
  }

  _extractContentBlocks() {
    const blocks = [];
    const entities = this.config.entities || {};

    Object.entries(entities).forEach(([key, value]) => {
      if (key.endsWith('_type')) {
        const blockId = key.replace('_type', '');
        blocks.push({
          id: blockId,
          type: value,
          content: entities[blockId] || ''
        });
      }
    });

    return blocks;
  }

  _getBlockIcon(blockType) {
    const icons = {
      text: 'mdi:text',
      image: 'mdi:image',
      sensor: 'mdi:gauge',
      chart: 'mdi:chart-line'
    };
    return icons[blockType] || 'mdi:cube';
  }

  _getBlockTypeName(blockType) {
    const names = {
      text: '文本块',
      image: '图片块',
      sensor: '传感器块',
      chart: '图表块'
    };
    return names[blockType] || '内容块';
  }

  _getBlockPreview(block) {
    if (block.type === 'text') {
      return block.content.substring(0, 15) + (block.content.length > 15 ? '...' : '');
    }
    if (block.type === 'sensor' && block.content) {
      return block.content.split('.')[1] || block.content;
    }
    return '点击编辑';
  }

  _onEntityChanged(key, value) {
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: {
        entities: {
          ...this.config.entities,
          [key]: value
        }
      }
    }));
  }

  _addContentBlock() {
    const blockId = `block_${Date.now()}`;
    const newEntities = {
      ...this.config.entities,
      [blockId]: '新内容块',
      [`${blockId}_type`]: 'text'
    };

    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities: newEntities }
    }));
  }

  _editContentBlock(blockId) {
    // 编辑内容块的逻辑
    console.log('编辑内容块:', blockId);
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}