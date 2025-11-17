// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';
import { getJinjaParser } from '../core/jinja-parser.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    requirements: { type: Array },
    entities: { type: Object },
    _config: { state: true },
    _showEntityPicker: { state: true },
    _pickingFor: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      .config-section {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: var(--cf-spacing-lg);
        margin-bottom: var(--cf-spacing-lg);
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
        margin-bottom: var(--cf-spacing-lg);
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 1.1em;
      }

      .section-icon {
        font-size: 1.2em;
      }

      .field-group {
        margin-bottom: var(--cf-spacing-lg);
      }

      .field-label {
        display: block;
        margin-bottom: var(--cf-spacing-sm);
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .field-with-preview {
        margin-bottom: var(--cf-spacing-md);
      }

      .field-inputs {
        display: flex;
        gap: var(--cf-spacing-sm);
        align-items: center;
        margin-bottom: var(--cf-spacing-xs);
      }

      .field-inputs ha-textfield {
        flex: 1;
      }

      .entity-picker-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .entity-picker-btn:hover {
        background: var(--accent-color);
      }

      .field-preview {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        background: rgba(var(--rgb-primary-color), 0.05);
        padding: 4px 8px;
        border-radius: 4px;
        margin-top: 4px;
      }

      .content-items {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .content-item {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: var(--cf-spacing-md);
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--cf-spacing-md);
      }

      .item-number {
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .item-actions {
        display: flex;
        gap: 4px;
      }

      .item-actions button {
        background: none;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .item-actions button:hover:not(:disabled) {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .item-actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .item-fields {
        display: flex;
        flex-direction: column;
        gap: var(--cf-spacing-md);
      }

      .icon-picker {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
      }

      .icon-picker ha-textfield {
        flex: 1;
      }

      .icon-preview {
        font-size: 1.5em;
        width: 40px;
        text-align: center;
      }

      .add-item-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 16px;
        cursor: pointer;
        font-size: 0.95em;
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: var(--cf-spacing-md);
      }

      .add-item-btn:hover {
        background: var(--accent-color);
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--secondary-text-color);
      }

      .empty-icon {
        font-size: 3em;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .entity-picker-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }

      .entity-picker-dialog {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 24px;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
      }

      .entity-picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .entity-picker-title {
        font-weight: 600;
        font-size: 1.2em;
      }

      .entity-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 300px;
        overflow-y: auto;
      }

      .entity-item {
        padding: 12px 16px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .entity-item:hover {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.05);
      }

      .entity-name {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .entity-id {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .config-section {
          padding: var(--cf-spacing-md);
        }

        .field-inputs {
          flex-direction: column;
          align-items: stretch;
        }

        .entity-picker-btn {
          align-self: flex-start;
        }
      }

      /* 深色模式适配 */
      @media (prefers-color-scheme: dark) {
        .config-section {
          background: var(--dark-card-background-color);
          border-color: var(--dark-divider-color);
        }

        .content-item {
          background: var(--dark-secondary-background-color);
          border-color: var(--dark-divider-color);
        }

        .field-preview {
          background: rgba(var(--rgb-primary-color), 0.1);
        }

        .entity-picker-dialog {
          background: var(--dark-card-background-color);
        }

        .entity-item {
          border-color: var(--dark-divider-color);
        }
      }
    `
  ];

  constructor() {
    super();
    this._config = {
      header: { value: '', icon: '🏷️', type: 'text' },
      content: [],
      footer: { value: '', icon: '📄', type: 'text' }
    };
    this._showEntityPicker = false;
    this._pickingFor = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities')) {
      this._parseConfigFromEntities();
    }
  }

  _parseConfigFromEntities() {
    if (!this.entities) {
      this._config = {
        header: { value: '', icon: '🏷️', type: 'text' },
        content: [],
        footer: { value: '', icon: '📄', type: 'text' }
      };
      return;
    }

    const config = {
      header: { value: '', icon: '🏷️', type: 'text' },
      content: [],
      footer: { value: '', icon: '📄', type: 'text' }
    };

    // 解析标题
    if (this.entities.header) {
      config.header = {
        value: this.entities.header,
        icon: this.entities.header_icon || '🏷️',
        type: this._detectValueType(this.entities.header)
      };
    }

    // 解析内容项
    let index = 1;
    while (this.entities[`content_${index}`] || this.entities[`item_${index}`]) {
      const baseKey = this.entities[`content_${index}`] ? `content_${index}` : `item_${index}`;
      config.content.push({
        label: this.entities[`${baseKey}_label`] || this.entities[`${baseKey}_name`] || `项目 ${index}`,
        value: this.entities[baseKey],
        icon: this.entities[`${baseKey}_icon`] || '📊',
        type: this._detectValueType(this.entities[baseKey])
      });
      index++;
    }

    // 解析页脚
    if (this.entities.footer) {
      config.footer = {
        value: this.entities.footer,
        icon: this.entities.footer_icon || '📄',
        type: this._detectValueType(this.entities.footer)
      };
    }

    this._config = config;
  }

  _detectValueType(value) {
    if (!value) return 'text';
    if (value.includes('{{')) return 'template';
    if (value.includes('.')) return 'entity';
    return 'text';
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderHeaderSection()}
        ${this._renderContentSection()}
        ${this._renderFooterSection()}
        ${this._renderEntityPicker()}
      </div>
    `;
  }

  _renderHeaderSection() {
    return html`
      <div class="config-section">
        <div class="section-header">
          <span class="section-icon">🏷️</span>
          <span>标题设置</span>
        </div>
        
        <div class="field-group">
          <label class="field-label">标题内容</label>
          ${this._renderField(this._config.header, (newValue) => {
            this._config.header = { ...this._config.header, ...newValue };
            this._notifyConfigChange();
          })}
        </div>

        <div class="field-group">
          <label class="field-label">标题图标</label>
          ${this._renderIconPicker(this._config.header.icon, (newIcon) => {
            this._config.header.icon = newIcon;
            this._notifyConfigChange();
          })}
        </div>
      </div>
    `;
  }

  _renderContentSection() {
    return html`
      <div class="config-section">
        <div class="section-header">
          <span class="section-icon">📊</span>
          <span>内容项设置</span>
        </div>
        
        <div class="content-items">
          ${this._config.content.length === 0 ? html`
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <div>暂无内容项</div>
              <div class="empty-hint">点击下方按钮添加内容项</div>
            </div>
          ` : ''}
          
          ${this._config.content.map((item, index) => 
            this._renderContentItem(item, index)
          )}
        </div>

        <button class="add-item-btn" @click=${this._addContentItem}>
          <ha-icon icon="mdi:plus"></ha-icon>
          添加内容项
        </button>
      </div>
    `;
  }

  _renderContentItem(item, index) {
    return html`
      <div class="content-item">
        <div class="item-header">
          <span class="item-number">内容项 #${index + 1}</span>
          <div class="item-actions">
            <button 
              @click=${() => this._moveItem(index, 'up')} 
              ?disabled=${index === 0}
              title="上移"
            >↑</button>
            <button 
              @click=${() => this._moveItem(index, 'down')} 
              ?disabled=${index === this._config.content.length - 1}
              title="下移"
            >↓</button>
            <button 
              @click=${() => this._removeItem(index)}
              title="删除"
            >🗑️</button>
          </div>
        </div>
        
        <div class="item-fields">
          <div class="field-group">
            <label class="field-label">显示标签</label>
            <ha-textfield
              .value=${item.label}
              @input=${e => this._updateContentItem(index, { ...item, label: e.target.value })}
              placeholder="例如：室内温度"
              fullwidth
              outlined
            ></ha-textfield>
          </div>

          <div class="field-group">
            <label class="field-label">数据源</label>
            ${this._renderField(
              { value: item.value, type: item.type },
              (newValue) => this._updateContentItem(index, { ...item, ...newValue })
            )}
          </div>

          <div class="field-group">
            <label class="field-label">图标</label>
            ${this._renderIconPicker(item.icon, (newIcon) => {
              this._updateContentItem(index, { ...item, icon: newIcon });
            })}
          </div>
        </div>
      </div>
    `;
  }

  _renderFooterSection() {
    return html`
      <div class="config-section">
        <div class="section-header">
          <span class="section-icon">📄</span>
          <span>页脚设置</span>
        </div>
        
        <div class="field-group">
          <label class="field-label">页脚内容</label>
          ${this._renderField(this._config.footer, (newValue) => {
            this._config.footer = { ...this._config.footer, ...newValue };
            this._notifyConfigChange();
          })}
        </div>

        <div class="field-group">
          <label class="field-label">页脚图标</label>
          ${this._renderIconPicker(this._config.footer.icon, (newIcon) => {
            this._config.footer.icon = newIcon;
            this._notifyConfigChange();
          })}
        </div>
      </div>
    `;
  }

  _renderField(fieldConfig, onUpdate) {
    const preview = this._getPreview(fieldConfig.value);
    
    return html`
      <div class="field-with-preview">
        <div class="field-inputs">
          <ha-textfield
            .value=${fieldConfig.value}
            @input=${e => onUpdate({ value: e.target.value, type: this._detectValueType(e.target.value) })}
            placeholder="输入文本、Jinja模板或选择实体"
            fullwidth
            outlined
          ></ha-textfield>
          <button 
            class="entity-picker-btn" 
            @click=${() => this._startEntityPicking(onUpdate)}
            title="选择实体"
          >
            <ha-icon icon="mdi:magnify"></ha-icon>
          </button>
        </div>
        ${preview ? html`
          <div class="field-preview">
            预览: ${preview}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderIconPicker(currentIcon, onUpdate) {
    return html`
      <div class="icon-picker">
        <span class="icon-preview">${currentIcon}</span>
        <ha-textfield
          .value=${currentIcon}
          @input=${e => onUpdate(e.target.value)}
          placeholder="输入图标"
          fullwidth
          outlined
        ></ha-textfield>
      </div>
    `;
  }

  _renderEntityPicker() {
    if (!this._showEntityPicker) return '';

    return html`
      <div class="entity-picker-overlay" @click=${this._cancelEntityPicking}>
        <div class="entity-picker-dialog" @click=${e => e.stopPropagation()}>
          <div class="entity-picker-header">
            <div class="entity-picker-title">选择实体</div>
            <button class="entity-picker-btn" @click=${this._cancelEntityPicking}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          
          <div class="entity-list">
            ${this._getAvailableEntities().map(entity => html`
              <div class="entity-item" @click=${() => this._selectEntity(entity)}>
                <div class="entity-name">${entity.friendly_name}</div>
                <div class="entity-id">${entity.entity_id}</div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  _getPreview(value) {
    if (!value) return '';
    const parser = getJinjaParser(this.hass);
    return parser.parse(value, '') || '(空值)';
  }

  _getAvailableEntities() {
    if (!this.hass) return [];
    
    return Object.entries(this.hass.states)
      .map(([entity_id, stateObj]) => ({
        entity_id,
        friendly_name: stateObj.attributes?.friendly_name || entity_id,
        state: stateObj.state
      }))
      .slice(0, 50); // 限制数量
  }

  _startEntityPicking(onUpdate) {
    this._pickingFor = onUpdate;
    this._showEntityPicker = true;
  }

  _cancelEntityPicking() {
    this._showEntityPicker = false;
    this._pickingFor = null;
  }

  _selectEntity(entity) {
    if (this._pickingFor) {
      this._pickingFor({ value: entity.entity_id, type: 'entity' });
    }
    this._cancelEntityPicking();
  }

  _addContentItem() {
    this._config.content.push({
      label: `项目 ${this._config.content.length + 1}`,
      value: '',
      icon: '📊',
      type: 'text'
    });
    this._notifyConfigChange();
  }

  _updateContentItem(index, newItem) {
    this._config.content[index] = newItem;
    this._notifyConfigChange();
  }

  _removeItem(index) {
    this._config.content.splice(index, 1);
    this._notifyConfigChange();
  }

  _moveItem(index, direction) {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < this._config.content.length) {
      const item = this._config.content.splice(index, 1)[0];
      this._config.content.splice(newIndex, 0, item);
      this._notifyConfigChange();
    }
  }

  _notifyConfigChange() {
    const entities = this._serializeConfigToEntities();
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
    this.requestUpdate();
  }

  _serializeConfigToEntities() {
    const entities = {};

    // 序列化标题
    if (this._config.header.value) {
      entities.header = this._config.header.value;
      entities.header_icon = this._config.header.icon;
    }

    // 序列化内容项
    this._config.content.forEach((item, index) => {
      const baseKey = `content_${index + 1}`;
      entities[baseKey] = item.value;
      entities[`${baseKey}_label`] = item.label;
      entities[`${baseKey}_icon`] = item.icon;
    });

    // 序列化页脚
    if (this._config.footer.value) {
      entities.footer = this._config.footer.value;
      entities.footer_icon = this._config.footer.icon;
    }

    return entities;
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}