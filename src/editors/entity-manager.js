// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    config: { type: Object },
    pluginManifest: { type: Object },
    _currentStrategy: { state: true },
    _contentBlocks: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      .strategy-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-md);
        margin-bottom: var(--cf-spacing-lg);
        padding: var(--cf-spacing-md);
        background: rgba(var(--cf-rgb-primary), 0.05);
        border-radius: var(--cf-radius-md);
        border-left: 3px solid var(--cf-primary-color);
      }

      .strategy-header h3 {
        margin: 0;
        font-size: 1.1em;
        color: var(--cf-text-primary);
      }

      .strategy-header p {
        margin: 0;
        font-size: 0.9em;
        color: var(--cf-text-secondary);
      }

      /* 自由布局样式 */
      .content-blocks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
      }

      .content-block:hover {
        border-color: var(--cf-primary-color);
        transform: translateY(-2px);
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
      }

      .add-block-btn:hover {
        border-color: var(--cf-primary-color);
        color: var(--cf-primary-color);
      }

      /* 结构化实体样式 */
      .entity-requirements {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-lg);
      }

      .entity-requirement {
        background: var(--cf-surface);
        border: 1px solid var(--cf-border);
        border-radius: var(--cf-radius-md);
        padding: var(--cf-spacing-lg);
      }

      .entity-requirement.required {
        border-left: 4px solid var(--cf-error-color);
      }

      .requirement-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-md);
      }

      .requirement-info h4 {
        margin: 0 0 var(--cf-spacing-xs) 0;
        color: var(--cf-text-primary);
      }

      .requirement-description {
        color: var(--cf-text-secondary);
        font-size: 0.9em;
        margin-bottom: var(--cf-spacing-md);
      }

      .required-badge {
        background: var(--cf-error-color);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.7em;
        font-weight: 500;
      }

      .example-hint {
        margin-top: var(--cf-spacing-sm);
        color: var(--cf-text-secondary);
        font-size: 0.8em;
      }

      .empty-state {
        text-align: center;
        padding: var(--cf-spacing-xl);
        color: var(--cf-text-secondary);
      }

      .empty-state ha-icon {
        font-size: 3em;
        margin-bottom: var(--cf-spacing-md);
        opacity: 0.5;
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .content-block {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }

        .entity-requirement {
          background: var(--cf-dark-surface);
          border-color: var(--cf-dark-border);
        }
      }
    `
  ];

  constructor() {
    super();
    this._currentStrategy = 'stateless';
    this._contentBlocks = [];
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('pluginManifest') || changedProperties.has('config')) {
      this._currentStrategy = this._detectStrategy();
      this._contentBlocks = this._extractContentBlocks();
    }
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
        ${this._renderStrategyContent()}
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
      <div class="strategy-header">
        <ha-icon icon="mdi:view-grid-plus"></ha-icon>
        <div>
          <h3>自由布局</h3>
          <p>可任意添加和排列内容块</p>
        </div>
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
          <ha-icon icon="mdi:package-variant"></ha-icon>
          <p>点击"添加内容块"开始构建布局</p>
        </div>
      ` : ''}
    `;
  }

  _renderStructured() {
    const requirements = this.pluginManifest?.entity_requirements || {};

    return html`
      <div class="strategy-header">
        <ha-icon icon="mdi:format-list-checks"></ha-icon>
        <div>
          <h3>数据源配置</h3>
          <p>配置卡片需要的数据源</p>
        </div>
      </div>

      <div class="entity-requirements">
        ${Object.entries(requirements).map(([key, requirement]) => 
          this._renderEntityRequirement(key, requirement)
        )}
      </div>
    `;
  }

  _renderStateless() {
    return html`
      <div class="strategy-header">
        <ha-icon icon="mdi:chart-donut"></ha-icon>
        <div>
          <h3>内置数据</h3>
          <p>此卡片使用内置数据源</p>
        </div>
      </div>
    `;
  }

  _renderContentBlock(block) {
    return html`
      <div class="content-block" @click=${() => this._editContentBlock(block.id)}>
        <ha-icon .icon=${this._getBlockIcon(block.type)}></ha-icon>
        <div class="block-info">
          <div class="block-title">${this._getBlockTypeName(block.type)}</div>
          <div class="block-preview">${this._getBlockPreview(block)}</div>
        </div>
      </div>
    `;
  }

  _renderEntityRequirement(key, requirement) {
    const currentValue = this.config.entities?.[key] || '';

    return html`
      <div class="entity-requirement ${requirement.required ? 'required' : ''}">
        <div class="requirement-header">
          <div class="requirement-info">
            <h4>${requirement.name}</h4>
            ${requirement.description ? html`
              <div class="requirement-description">${requirement.description}</div>
            ` : ''}
          </div>
          ${requirement.required ? html`
            <span class="required-badge">必需</span>
          ` : ''}
        </div>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${currentValue}
          @value-changed=${e => this._onEntityChanged(key, e.detail.value)}
          allow-custom-value
          .label=${`选择 ${requirement.name}`}
        ></ha-entity-picker>

        ${requirement.example ? html`
          <div class="example-hint">
            <small>例如: ${requirement.example}</small>
          </div>
        ` : ''}
      </div>
    `;
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
      return block.content.substring(0, 20) + (block.content.length > 20 ? '...' : '');
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