// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    entities: { type: Object },
    _config: { state: true },
    _editingId: { state: true },
    _expandedSections: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      /* 官方 entities 卡片样式 */
      .card {
        background: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
        padding: 0;
        margin-bottom: 16px;
        position: relative;
        overflow: hidden;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        border-bottom: 1px solid transparent;
      }

      .card-header:hover {
        background: var(--secondary-background-color);
      }

      .card.expanded .card-header {
        border-bottom-color: var(--divider-color);
      }

      .card-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .expand-icon {
        transition: transform 0.3s ease;
      }

      .card.expanded .expand-icon {
        transform: rotate(180deg);
      }

      .card-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
      }

      .card.expanded .card-content {
        max-height: 1000px;
        padding: 16px;
      }

      .entities {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* 官方 entity-row 样式 */
      .entity {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 12px);
        border: 1px solid var(--divider-color);
        transition: all 0.3s ease;
        cursor: pointer;
        min-height: 60px;
      }

      .entity:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .entity-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        border-radius: 50%;
        margin-right: 16px;
        color: white;
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
        margin-bottom: 4px;
      }

      .entity-state {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
      }

      .entity-actions {
        display: flex;
        gap: 8px;
        margin-left: 16px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .entity:hover .entity-actions {
        opacity: 1;
      }

      /* 官方按钮样式 */
      .button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.3s;
      }

      .button:hover {
        background: var(--accent-color);
      }

      .icon-button {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;
      }

      .icon-button:hover {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }

      /* 内联编辑表单 - 三行布局 */
      .edit-form {
        background: var(--secondary-background-color);
        border: 2px solid var(--primary-color);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 16px;
        margin-top: 8px;
        animation: slideDown 0.3s ease;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .form-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .form-row:last-child {
        margin-bottom: 0;
      }

      .form-label {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 14px;
        margin-bottom: 4px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .empty-state {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }

      /* 实体预览 */
      .entity-preview {
        font-size: 12px;
        color: var(--success-color);
        margin-top: 4px;
        font-style: italic;
      }

      /* 备用实体输入框 */
      .entity-input {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .entity-input:focus {
        border-color: var(--primary-color);
        outline: none;
      }
    `
  ];

  constructor() {
    super();
    this._config = { header: [], content: [], footer: [] };
    this._editingId = null;
    this._expandedSections = new Set(['content']);
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities')) {
      this._parseConfig();
    }
  }

  _parseConfig() {
    if (!this.entities) {
      this._config = { header: [], content: [], footer: [] };
      return;
    }

    const config = { header: [], content: [], footer: [] };
    
    Object.keys(this.entities).forEach(key => {
      if (key.startsWith('header_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('header_', '');
        config.header.push({
          id: `header-${index}`,
          label: this.entities[`header_${index}_label`] || '标题',
          value: this.entities[key],
          icon: this.entities[`header_${index}_icon`] || 'mdi:format-title'
        });
      } else if (key.startsWith('content_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('content_', '');
        config.content.push({
          id: `content-${index}`,
          label: this.entities[`content_${index}_label`] || `项目 ${index}`,
          value: this.entities[key],
          icon: this.entities[`content_${index}_icon`] || 'mdi:chart-box'
        });
      } else if (key.startsWith('footer_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('footer_', '');
        config.footer.push({
          id: `footer-${index}`,
          label: this.entities[`footer_${index}_label`] || '页脚',
          value: this.entities[key],
          icon: this.entities[`footer_${index}_icon`] || 'mdi:page-layout-footer'
        });
      }
    });

    this._config = config;
  }

  _getEntitiesFromConfig() {
    const entities = {};
    
    ['header', 'content', 'footer'].forEach(sectionType => {
      this._config[sectionType].forEach((item, index) => {
        const baseKey = `${sectionType}_${index + 1}`;
        entities[baseKey] = item.value;
        entities[`${baseKey}_label`] = item.label;
        entities[`${baseKey}_icon`] = item.icon;
      });
    });
    
    return entities;
  }

  _notifyChange() {
    const entities = this._getEntitiesFromConfig();
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }

  _toggleSection(sectionType) {
    if (this._expandedSections.has(sectionType)) {
      this._expandedSections.delete(sectionType);
    } else {
      this._expandedSections.add(sectionType);
    }
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderSection('header', 'mdi:format-title', '标题')}
        ${this._renderSection('content', 'mdi:view-grid', '内容项')}
        ${this._renderSection('footer', 'mdi:page-layout-footer', '页脚')}
      </div>
    `;
  }

  _renderSection(sectionType, icon, title) {
    const items = this._config[sectionType];
    const isExpanded = this._expandedSections.has(sectionType);
    const isEditing = this._editingId?.startsWith(sectionType);

    return html`
      <div class="card ${isExpanded ? 'expanded' : ''}">
        <div class="card-header" @click=${() => this._toggleSection(sectionType)}>
          <div class="card-title">
            <ha-icon .icon=${icon}></ha-icon>
            ${title}
            <span style="margin-left: 8px; color: var(--secondary-text-color); font-size: 14px;">
              (${items.length})
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="button" @click=${(e) => {
              e.stopPropagation();
              this._addItem(sectionType);
            }}>
              <ha-icon icon="mdi:plus"></ha-icon>
              添加
            </button>
            <ha-icon 
              class="expand-icon"
              .icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
            ></ha-icon>
          </div>
        </div>

        <div class="card-content">
          <div class="entities">
            ${items.length === 0 ? html`
              <div class="empty-state">
                暂无${title}，点击"添加"按钮创建
              </div>
            ` : items.map((item, index) => 
              this._renderEntity(item, index, sectionType)
            )}
          </div>

          ${isEditing ? this._renderEditForm(sectionType) : ''}
        </div>
      </div>
    `;
  }

  _renderEntity(item, index, sectionType) {
    const entityId = `${sectionType}-${index}`;
    const isEditing = this._editingId === entityId;
    const preview = this._getEntityPreview(item.value);

    if (isEditing) return '';

    return html`
      <div class="entity" @click=${() => this._editItem(sectionType, index)}>
        <div class="entity-icon">
          <ha-icon .icon=${item.icon}></ha-icon>
        </div>
        <div class="entity-info">
          <div class="entity-name">${item.label}</div>
          <div class="entity-state">${item.value}</div>
          ${preview ? html`<div class="entity-state" style="color: var(--success-color);">${preview}</div>` : ''}
        </div>
        <div class="entity-actions">
          <button class="icon-button" @click=${(e) => {
            e.stopPropagation();
            this._removeItem(sectionType, index);
          }} title="删除">
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderEditForm(sectionType) {
    const [_, index] = this._editingId.split('-');
    const item = this._config[sectionType][parseInt(index)] || { label: '', value: '', icon: 'mdi:chart-box' };
    const entityInfo = this._getEntityInfo(item.value);
    const preview = this._getEntityPreview(item.value);

    return html`
      <div class="edit-form">
        <!-- 第一行：名称 -->
        <div class="form-row">
          <div class="form-label">显示名称</div>
          <ha-textfield
            .value=${item.label}
            @input=${e => this._updateItem('label', e.target.value)}
            placeholder=${entityInfo.name || "输入显示名称"}
            fullwidth
          ></ha-textfield>
        </div>

        <!-- 第二行：图标 -->
        <div class="form-row">
          <div class="form-label">图标</div>
          <ha-icon-picker
            .hass=${this.hass}
            .value=${item.icon}
            @value-changed=${e => this._updateItem('icon', e.detail.value)}
            label="选择图标"
            fullwidth
          ></ha-icon-picker>
        </div>

        <!-- 第三行：实体选择 -->
        <div class="form-row">
          <div class="form-label">数据源</div>
          ${this._renderEntityPicker(item)}
          ${preview ? html`<div class="entity-preview">当前状态: ${preview}</div>` : ''}
        </div>

        <div class="form-actions">
          <button class="button" style="background: var(--secondary-color);" @click=${this._cancelEdit}>
            取消
          </button>
          <button 
            class="button" 
            @click=${this._saveEdit}
            ?disabled=${!item.label || !item.value}
          >
            保存
          </button>
        </div>
      </div>
    `;
  }

  _renderEntityPicker(item) {
    // 检查 ha-entity-picker 组件是否可用
    if (customElements.get('ha-entity-picker')) {
      return html`
        <ha-entity-picker
          .hass=${this.hass}
          .value=${item.value}
          @value-changed=${e => {
            this._updateItem('value', e.detail.value);
            // 自动填充实体信息
            if (e.detail.value) {
              const info = this._getEntityInfo(e.detail.value);
              if (info.name && !item.label) {
                this._updateItem('label', info.name);
              }
              if (info.icon && item.icon === 'mdi:chart-box') {
                this._updateItem('icon', info.icon);
              }
            }
          }}
          label="选择实体"
          allow-custom-value
          fullwidth
        ></ha-entity-picker>
      `;
    } else {
      // 备用方案：使用输入框
      return html`
        <input
          class="entity-input"
          .value=${item.value}
          @input=${e => this._updateItem('value', e.target.value)}
          placeholder="输入实体ID，例如：sensor.temperature"
        />
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">
          提示：输入实体ID或使用实体选择器
        </div>
      `;
    }
  }

  _getEntityInfo(entityValue) {
    if (!entityValue || !this.hass?.states) {
      return { name: '', icon: 'mdi:chart-box' };
    }

    // 如果是实体ID
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      const entity = this.hass.states[entityValue];
      return {
        name: entity.attributes?.friendly_name || entityValue,
        icon: entity.attributes?.icon || this._getDefaultIcon(entityValue)
      };
    }

    return { name: '', icon: 'mdi:chart-box' };
  }

  _getEntityPreview(entityValue) {
    if (!entityValue || !this.hass?.states) return '';
    
    // 如果是实体ID，显示当前状态
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      return this.hass.states[entityValue].state;
    }
    
    return '';
  }

  _getDefaultIcon(entityId) {
    const domain = entityId.split('.')[0];
    const icons = {
      light: 'mdi:lightbulb',
      sensor: 'mdi:gauge',
      switch: 'mdi:power-plug',
      climate: 'mdi:thermostat',
      media_player: 'mdi:television',
      person: 'mdi:account',
      binary_sensor: 'mdi:checkbox-marked-circle',
      input_boolean: 'mdi:toggle-switch',
      automation: 'mdi:robot',
      script: 'mdi:script-text'
    };
    return icons[domain] || 'mdi:circle';
  }

  _addItem(sectionType) {
    const newIndex = this._config[sectionType].length;
    this._config[sectionType].push({
      id: `${sectionType}-${newIndex}`,
      label: '',
      value: '',
      icon: 'mdi:chart-box'
    });
    this._editingId = `${sectionType}-${newIndex}`;
    this._expandedSections.add(sectionType);
    this.requestUpdate();
  }

  _editItem(sectionType, index) {
    this._editingId = `${sectionType}-${index}`;
    this.requestUpdate();
  }

  _updateItem(field, value) {
    if (!this._editingId) return;
    
    const [sectionType, index] = this._editingId.split('-');
    this._config[sectionType][parseInt(index)][field] = value;
    this.requestUpdate();
  }

  _saveEdit() {
    if (!this._editingId) return;
    
    const [sectionType, index] = this._editingId.split('-');
    const item = this._config[sectionType][parseInt(index)];
    
    if (!item.label || !item.value) return;
    
    this._editingId = null;
    this._notifyChange();
  }

  _cancelEdit() {
    if (!this._editingId) return;
    
    const [sectionType, index] = this._editingId.split('-');
    const itemIndex = parseInt(index);
    
    // 如果是新增且未填写内容，则删除
    if (itemIndex >= this._config[sectionType].length - 1) {
      const item = this._config[sectionType][itemIndex];
      if (!item.label && !item.value) {
        this._config[sectionType].pop();
      }
    }
    
    this._editingId = null;
    this.requestUpdate();
  }

  _removeItem(sectionType, index) {
    this._config[sectionType].splice(index, 1);
    this._editingId = null;
    this._notifyChange();
  }

  // 确保组件加载
  firstUpdated() {
    // 尝试动态加载 ha-entity-picker 如果不存在
    if (!customElements.get('ha-entity-picker')) {
      console.warn('ha-entity-picker 组件未加载，使用备用输入框');
    }
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}
