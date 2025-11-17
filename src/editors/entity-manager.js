// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';
import { getJinjaParser } from '../core/jinja-parser.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    requirements: { type: Array },
    entities: { type: Object },
    _config: { state: true }
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

      .field-row {
        display: flex;
        gap: var(--cf-spacing-md);
        align-items: flex-start;
      }

      .field-input {
        flex: 1;
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

      .icon-field {
        display: flex;
        align-items: center;
        gap: var(--cf-spacing-sm);
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

      /* 官方样式适配 */
      ha-entity-picker {
        width: 100%;
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .config-section {
          padding: var(--cf-spacing-md);
        }

        .field-row {
          flex-direction: column;
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
          ${this._renderValueField(this._config.header, (newValue) => {
            this._config.header = { ...this._config.header, ...newValue };
            this._notifyConfigChange();
          })}
        </div>

        <div class="field-group">
          <label class="field-label">标题图标</label>
          ${this._renderIconField(this._config.header.icon, (newIcon) => {
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
            ${this._renderValueField(
              { value: item.value, type: item.type },
              (newValue) => this._updateContentItem(index, { ...item, ...newValue })
            )}
          </div>

          <div class="field-group">
            <label class="field-label">图标</label>
            ${this._renderIconField(item.icon, (newIcon) => {
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
          ${this._renderValueField(this._config.footer, (newValue) => {
            this._config.footer = { ...this._config.footer, ...newValue };
            this._notifyConfigChange();
          })}
        </div>

        <div class="field-group">
          <label class="field-label">页脚图标</label>
          ${this._renderIconField(this._config.footer.icon, (newIcon) => {
            this._config.footer.icon = newIcon;
            this._notifyConfigChange();
          })}
        </div>
      </div>
    `;
  }

  _renderValueField(fieldConfig, onUpdate) {
    const preview = this._getPreview(fieldConfig.value);
    const isEntity = fieldConfig.type === 'entity';
    
    return html`
      <div class="field-with-preview">
        <div class="field-row">
          ${isEntity ? html`
            <ha-entity-picker
              class="field-input"
              .hass=${this.hass}
              .value=${fieldConfig.value}
              @value-changed=${e => onUpdate({ value: e.detail.value, type: 'entity' })}
              allow-custom-entity
            ></ha-entity-picker>
          ` : html`
            <ha-textfield
              class="field-input"
              .value=${fieldConfig.value}
              @input=${e => onUpdate({ value: e.target.value, type: this._detectValueType(e.target.value) })}
              placeholder="输入文本、Jinja模板或选择实体"
              fullwidth
              outlined
            ></ha-textfield>
          `}
          
          <ha-icon-button
            @click=${() => {
              if (isEntity) {
                // 从实体切换到文本输入
                onUpdate({ value: '', type: 'text' });
              } else {
                // 从文本切换到实体选择
                onUpdate({ value: '', type: 'entity' });
              }
            }}
            .label=${isEntity ? '切换到文本输入' : '切换到实体选择'}
          >
            <ha-icon .icon=${isEntity ? 'mdi:text-box' : 'mdi:database'}></ha-icon>
          </ha-icon-button>
        </div>
        
        ${preview ? html`
          <div class="field-preview">
            预览: ${preview}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderIconField(currentIcon, onUpdate) {
    return html`
      <div class="icon-field">
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

  _getPreview(value) {
    if (!value) return '';
    const parser = getJinjaParser(this.hass);
    return parser.parse(value, '') || '(空值)';
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