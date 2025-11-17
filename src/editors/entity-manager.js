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
    _draggingIndex: { state: true },
    _showEntityPicker: { state: true },
    _currentPickerField: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      /* 参照官方卡片设计 */
      .config-section {
        background: var(--card-background-color);
        border-radius: var(--card-border-radius, 12px);
        padding: 16px;
        margin-bottom: 16px;
        border: 1px solid var(--divider-color);
        box-shadow: var(--card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
      }

      .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--divider-color);
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .section-icon {
        font-size: 20px;
      }

      .add-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 20px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.3s;
      }

      .add-button:hover {
        background: var(--accent-color);
      }

      .add-button ha-icon {
        --mdc-icon-size: 18px;
      }

      /* 字段组样式 */
      .field-group {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: start;
      }

      .field-with-preview {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field-inputs {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .field-inputs ha-textfield {
        flex: 1;
      }

      .entity-picker-btn {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        color: var(--primary-text-color);
        transition: all 0.3s;
        min-width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .entity-picker-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .field-preview {
        font-size: 12px;
        color: var(--secondary-text-color);
        background: var(--secondary-background-color);
        padding: 4px 8px;
        border-radius: 4px;
        min-height: 20px;
      }

      .preview-value {
        font-family: var(--code-font-family, monospace);
        color: var(--accent-color);
      }

      /* 内容项样式 */
      .content-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .content-item {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 16px;
        transition: all 0.3s;
        position: relative;
      }

      .content-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .content-item.dragging {
        opacity: 0.6;
        border: 2px dashed var(--primary-color);
      }

      .item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--divider-color);
      }

      .item-number {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .item-actions {
        display: flex;
        gap: 4px;
      }

      .item-action {
        background: none;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 6px 8px;
        cursor: pointer;
        color: var(--secondary-text-color);
        transition: all 0.3s;
        font-size: 12px;
      }

      .item-action:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .item-action:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .item-action:disabled:hover {
        background: none;
        color: var(--secondary-text-color);
        border-color: var(--divider-color);
      }

      .item-fields {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 12px;
        align-items: start;
      }

      .icon-picker {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .icon-display {
        font-size: 20px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
      }

      .icon-picker-btn {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        color: var(--primary-text-color);
        transition: all 0.3s;
      }

      .icon-picker-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      /* 空状态 */
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--secondary-text-color);
      }

      .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 16px;
        margin-bottom: 8px;
      }

      /* 实体选择器样式 */
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
        border-radius: 12px;
        padding: 24px;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .picker-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 18px;
      }

      .close-button {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;
      }

      .close-button:hover {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }

      .search-box {
        margin-bottom: 16px;
      }

      .entity-list {
        flex: 1;
        overflow-y: auto;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        max-height: 300px;
      }

      .entity-item {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid var(--divider-color);
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .entity-item:hover {
        background: var(--secondary-background-color);
      }

      .entity-item:last-child {
        border-bottom: none;
      }

      .entity-icon {
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .entity-info {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
        margin-bottom: 2px;
      }

      .entity-id {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
      }

      .template-option {
        border-top: 2px solid var(--divider-color);
        background: var(--secondary-background-color);
      }

      .template-option .entity-name {
        color: var(--primary-color);
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .config-section {
          padding: 12px;
        }

        .item-fields {
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .field-group {
          grid-template-columns: 1fr;
        }

        .entity-picker-dialog {
          padding: 16px;
          margin: 10px;
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

        .entity-picker-btn,
        .icon-picker-btn {
          background: var(--dark-secondary-background-color);
          border-color: var(--dark-divider-color);
        }

        .field-preview {
          background: var(--dark-secondary-background-color);
        }
      }
    `
  ];

  constructor() {
    super();
    this._config = {
      header: { value: '', icon: '🏷️' },
      content: [],
      footer: { value: '', icon: '📄' }
    };
    this._draggingIndex = -1;
    this._showEntityPicker = false;
    this._currentPickerField = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities')) {
      this._parseConfigFromEntities();
    }
  }

  _parseConfigFromEntities() {
    if (!this.entities) {
      this._config = { header: { value: '', icon: '🏷️' }, content: [], footer: { value: '', icon: '📄' } };
      return;
    }

    const config = { header: { value: '', icon: '🏷️' }, content: [], footer: { value: '', icon: '📄' } };
    
    // 解析标题
    if (this.entities.header) {
      config.header.value = this.entities.header;
      config.header.icon = this.entities.header_icon || '🏷️';
    }
    
    // 解析内容项
    let index = 1;
    while (this.entities[`content_${index}`]) {
      config.content.push({
        label: this.entities[`content_${index}_label`] || `项目 ${index}`,
        value: this.entities[`content_${index}`],
        icon: this.entities[`content_${index}_icon`] || '📊'
      });
      index++;
    }
    
    // 解析页脚
    if (this.entities.footer) {
      config.footer.value = this.entities.footer;
      config.footer.icon = this.entities.footer_icon || '📄';
    }
    
    this._config = config;
  }

  _getEntitiesFromConfig() {
    const entities = {};
    
    // 标题
    if (this._config.header.value) {
      entities.header = this._config.header.value;
      entities.header_icon = this._config.header.icon;
    }
    
    // 内容项
    this._config.content.forEach((item, index) => {
      const key = `content_${index + 1}`;
      entities[key] = item.value;
      entities[`${key}_label`] = item.label;
      entities[`${key}_icon`] = item.icon;
    });
    
    // 页脚
    if (this._config.footer.value) {
      entities.footer = this._config.footer.value;
      entities.footer_icon = this._config.footer.icon;
    }
    
    return entities;
  }

  _notifyEntitiesChange() {
    const entities = this._getEntitiesFromConfig();
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
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
          <div class="section-title">
            <span class="section-icon">🏷️</span>
            标题设置
          </div>
        </div>
        
        <div class="field-group">
          ${this._renderField(this._config.header, 'header', '例如：家庭监控中心')}
          ${this._renderIconPicker(this._config.header.icon, (icon) => this._updateSection('header', { ...this._config.header, icon }))}
        </div>
      </div>
    `;
  }

  _renderContentSection() {
    return html`
      <div class="config-section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-icon">📊</span>
            内容项设置
          </div>
          <button class="add-button" @click=${this._addContentItem}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加内容项
          </button>
        </div>
        
        ${this._config.content.length === 0 ? html`
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-text">暂无内容项</div>
            <div class="empty-hint">点击"添加内容项"按钮开始配置</div>
          </div>
        ` : html`
          <div class="content-items">
            ${this._config.content.map((item, index) => 
              this._renderContentItem(item, index)
            )}
          </div>
        `}
      </div>
    `;
  }

  _renderFooterSection() {
    return html`
      <div class="config-section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-icon">📄</span>
            页脚设置
          </div>
        </div>
        
        <div class="field-group">
          ${this._renderField(this._config.footer, 'footer', '例如：最后更新 {{ now().strftime("%H:%M") }}')}
          ${this._renderIconPicker(this._config.footer.icon, (icon) => this._updateSection('footer', { ...this._config.footer, icon }))}
        </div>
      </div>
    `;
  }

  _renderField(section, sectionType, placeholder) {
    const preview = this._getFieldPreview(section.value);
    
    return html`
      <div class="field-with-preview">
        <div class="field-inputs">
          <ha-textfield
            .value=${section.value}
            @input=${e => this._updateSection(sectionType, { ...section, value: e.target.value })}
            placeholder=${placeholder}
            fullwidth
          ></ha-textfield>
          <button 
            class="entity-picker-btn" 
            @click=${() => this._showEntityPickerFor(sectionType)}
            title="选择实体"
          >
            <ha-icon icon="mdi:magnify"></ha-icon>
          </button>
        </div>
        <div class="field-preview">
          预览: <span class="preview-value">${preview || '(空值)'}</span>
        </div>
      </div>
    `;
  }

  _renderContentItem(item, index) {
    const valuePreview = this._getFieldPreview(item.value);
    
    return html`
      <div 
        class="content-item ${this._draggingIndex === index ? 'dragging' : ''}"
        draggable="true"
        @dragstart=${e => this._onDragStart(e, index)}
        @dragover=${e => this._onDragOver(e, index)}
        @dragend=${this._onDragEnd}
        @drop=${e => this._onDrop(e, index)}
      >
        <div class="item-header">
          <div class="item-number">内容项 #${index + 1}</div>
          <div class="item-actions">
            <button 
              class="item-action" 
              @click=${() => this._moveItem(index, 'up')}
              ?disabled=${index === 0}
              title="上移"
            >↑</button>
            <button 
              class="item-action" 
              @click=${() => this._moveItem(index, 'down')}
              ?disabled=${index === this._config.content.length - 1}
              title="下移"
            >↓</button>
            <button 
              class="item-action" 
              @click=${() => this._removeItem(index)}
              title="删除"
            >🗑️</button>
          </div>
        </div>
        
        <div class="item-fields">
          <div class="field-with-preview">
            <ha-textfield
              .value=${item.label}
              @input=${e => this._updateContentItem(index, { ...item, label: e.target.value })}
              placeholder="显示标签"
              fullwidth
            ></ha-textfield>
            <div class="field-preview">标签: ${item.label || '(未设置)'}</div>
          </div>
          
          <div class="field-with-preview">
            <div class="field-inputs">
              <ha-textfield
                .value=${item.value}
                @input=${e => this._updateContentItem(index, { ...item, value: e.target.value })}
                placeholder="实体ID或模板"
                fullwidth
              ></ha-textfield>
              <button 
                class="entity-picker-btn" 
                @click=${() => this._showEntityPickerFor('content', index)}
                title="选择实体"
              >
                <ha-icon icon="mdi:magnify"></ha-icon>
              </button>
            </div>
            <div class="field-preview">预览: <span class="preview-value">${valuePreview || '(空值)'}</span></div>
          </div>
          
          ${this._renderIconPicker(item.icon, (icon) => this._updateContentItem(index, { ...item, icon }))}
        </div>
      </div>
    `;
  }

  _renderIconPicker(currentIcon, onUpdate) {
    const commonIcons = ['📊', '🌡️', '💧', '💡', '⚡', '🚪', '👤', '🕒', '🏠', '📱'];
    
    return html`
      <div class="icon-picker">
        <div class="icon-display">${currentIcon}</div>
        <select 
          class="icon-picker-btn"
          .value=${currentIcon}
          @change=${e => onUpdate(e.target.value)}
        >
          ${commonIcons.map(icon => html`
            <option value=${icon}>${icon}</option>
          `)}
        </select>
      </div>
    `;
  }

  _renderEntityPicker() {
    if (!this._showEntityPicker) return '';

    const entities = this._getAvailableEntities();
    const templates = [
      { name: '当前时间', value: "{{ now().strftime('%H:%M') }}" },
      { name: '今日日期', value: "{{ now().strftime('%Y-%m-%d') }}" },
      { name: '实体状态', value: "{{ states('entity_id') }}" },
      { name: '实体属性', value: "{{ state_attr('entity_id', 'attribute') }}" }
    ];

    return html`
      <div class="entity-picker-overlay" @click=${this._hideEntityPicker}>
        <div class="entity-picker-dialog" @click=${e => e.stopPropagation()}>
          <div class="picker-header">
            <div class="picker-title">选择实体或模板</div>
            <button class="close-button" @click=${this._hideEntityPicker}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          
          <div class="search-box">
            <ha-textfield
              label="搜索实体..."
              fullwidth
              id="entity-search"
            ></ha-textfield>
          </div>
          
          <div class="entity-list">
            ${entities.map(entity => html`
              <div class="entity-item" @click=${() => this._selectEntity(entity.entity_id)}>
                <ha-icon class="entity-icon" icon="mdi:circle"></ha-icon>
                <div class="entity-info">
                  <div class="entity-name">${entity.friendly_name}</div>
                  <div class="entity-id">${entity.entity_id}</div>
                </div>
              </div>
            `)}
            
            ${templates.map(template => html`
              <div class="entity-item template-option" @click=${() => this._selectEntity(template.value)}>
                <ha-icon class="entity-icon" icon="mdi:code-braces"></ha-icon>
                <div class="entity-info">
                  <div class="entity-name">${template.name}</div>
                  <div class="entity-id">${template.value}</div>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  _getAvailableEntities() {
    if (!this.hass) return [];
    
    return Object.entries(this.hass.states)
      .map(([entity_id, stateObj]) => ({
        entity_id,
        friendly_name: stateObj.attributes?.friendly_name || entity_id
      }))
      .slice(0, 50); // 限制数量避免性能问题
  }

  _getFieldPreview(value) {
    if (!value) return '';
    const parser = getJinjaParser(this.hass);
    return parser.parse(value, '');
  }

  _updateSection(sectionType, newSection) {
    this._config[sectionType] = newSection;
    this._notifyEntitiesChange();
  }

  _updateContentItem(index, newItem) {
    this._config.content[index] = newItem;
    this._notifyEntitiesChange();
  }

  _addContentItem() {
    this._config.content.push({
      label: `项目 ${this._config.content.length + 1}`,
      value: '',
      icon: '📊'
    });
    this._notifyEntitiesChange();
  }

  _removeItem(index) {
    this._config.content.splice(index, 1);
    this._notifyEntitiesChange();
  }

  _moveItem(index, direction) {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < this._config.content.length) {
      const item = this._config.content.splice(index, 1)[0];
      this._config.content.splice(newIndex, 0, item);
      this._notifyEntitiesChange();
    }
  }

  _onDragStart(e, index) {
    this._draggingIndex = index;
    e.dataTransfer.effectAllowed = 'move';
  }

  _onDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  _onDragEnd() {
    this._draggingIndex = -1;
  }

  _onDrop(e, targetIndex) {
    e.preventDefault();
    if (this._draggingIndex !== -1 && this._draggingIndex !== targetIndex) {
      const item = this._config.content.splice(this._draggingIndex, 1)[0];
      this._config.content.splice(targetIndex, 0, item);
      this._notifyEntitiesChange();
    }
    this._draggingIndex = -1;
  }

  _showEntityPickerFor(sectionType, contentIndex = null) {
    this._currentPickerField = { sectionType, contentIndex };
    this._showEntityPicker = true;
  }

  _hideEntityPicker() {
    this._showEntityPicker = false;
    this._currentPickerField = null;
  }

  _selectEntity(entityValue) {
    if (this._currentPickerField) {
      const { sectionType, contentIndex } = this._currentPickerField;
      
      if (sectionType === 'content' && contentIndex !== null) {
        this._updateContentItem(contentIndex, {
          ...this._config.content[contentIndex],
          value: entityValue
        });
      } else {
        this._updateSection(sectionType, {
          ...this._config[sectionType],
          value: entityValue
        });
      }
    }
    
    this._hideEntityPicker();
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}