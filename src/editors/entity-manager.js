// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    entities: { type: Object },
    _config: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

      /* 官方 Entities 卡片风格 */
      .entities-section {
        background: var(--card-background-color);
        border-radius: var(--ha-card-border-radius, 12px);
        padding: 0;
        margin-bottom: 16px;
        border: var(--ha-card-border, none);
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
        overflow: hidden;
        position: relative;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: var(--secondary-background-color);
        border-bottom: 1px solid var(--divider-color);
        min-height: 60px;
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .add-entity-button {
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

      .add-entity-button:hover {
        background: var(--accent-color);
      }

      .add-entity-button ha-icon {
        --mdc-icon-size: 18px;
      }

      /* 官方实体行样式 */
      .entities-container {
        padding: 0;
      }

      .entity-row {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        transition: background-color 0.3s;
        min-height: 60px;
        cursor: pointer;
      }

      .entity-row:hover {
        background: var(--secondary-background-color);
      }

      .entity-row:last-child {
        border-bottom: none;
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

      .entity-content {
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
        flex-shrink: 0;
      }

      .entity-action {
        background: none;
        border: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .entity-action:hover {
        background: var(--secondary-background-color);
        color: var(--primary-color);
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

      /* 编辑表单 - 官方风格 */
      .edit-dialog-overlay {
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

      .edit-dialog {
        background: var(--card-background-color);
        border-radius: 12px;
        padding: 24px;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .dialog-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 20px;
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

      .form-field {
        margin-bottom: 20px;
      }

      .form-label {
        display: block;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 8px;
        font-size: 14px;
      }

      .data-source-input {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }

      .data-source-input ha-textfield {
        flex: 1;
      }

      .entity-picker-btn {
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 12px 16px;
        cursor: pointer;
        color: var(--primary-text-color);
        transition: all 0.3s;
        white-space: nowrap;
      }

      .entity-picker-btn:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .icon-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 8px;
        border: 1px solid var(--divider-color);
      }

      .icon-preview-text {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--divider-color);
      }

      .cancel-button {
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
      }

      .cancel-button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .save-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 24px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.3s;
      }

      .save-button:hover:not(:disabled) {
        background: var(--accent-color);
      }

      .save-button:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .edit-dialog {
          padding: 16px;
          margin: 10px;
        }

        .data-source-input {
          flex-direction: column;
        }

        .entity-picker-btn {
          width: 100%;
        }
      }
    `
  ];

  constructor() {
    super();
    this._config = { header: [], content: [], footer: [] };
    this._editingItem = null;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities')) {
      this._parseConfigFromEntities();
    }
  }

  _parseConfigFromEntities() {
    if (!this.entities) {
      this._config = { header: [], content: [], footer: [] };
      return;
    }

    const config = { header: [], content: [], footer: [] };
    
    Object.keys(this.entities).forEach(key => {
      if (key.startsWith('header_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('header_', '');
        config.header.push({
          label: this.entities[`header_${index}_label`] || '标题',
          value: this.entities[key],
          icon: this.entities[`header_${index}_icon`] || 'mdi:format-title'
        });
      } else if (key.startsWith('content_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('content_', '');
        config.content.push({
          label: this.entities[`content_${index}_label`] || `项目 ${index}`,
          value: this.entities[key],
          icon: this.entities[`content_${index}_icon`] || 'mdi:chart-box'
        });
      } else if (key.startsWith('footer_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('footer_', '');
        config.footer.push({
          label: this.entities[`footer_${index}_label`] || '页脚',
          value: this.entities[key],
          icon: this.entities[`footer_${index}_icon`] || 'mdi:file-document'
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

  _notifyEntitiesChange() {
    const entities = this._getEntitiesFromConfig();
    this.dispatchEvent(new CustomEvent('entities-changed', {
      detail: { entities }
    }));
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderSection('header', 'mdi:format-title', '标题')}
        ${this._renderSection('content', 'mdi:chart-box', '内容项')}
        ${this._renderSection('footer', 'mdi:file-document', '页脚')}
        ${this._renderEditDialog()}
      </div>
    `;
  }

  _renderSection(sectionType, icon, title) {
    const items = this._config[sectionType];

    return html`
      <div class="entities-section">
        <div class="section-header">
          <div class="section-title">
            <ha-icon .icon=${icon}></ha-icon>
            ${title}
          </div>
          <button class="add-entity-button" @click=${() => this._startAddItem(sectionType)}>
            <ha-icon icon="mdi:plus"></ha-icon>
            添加实体
          </button>
        </div>
        
        <div class="entities-container">
          ${items.length === 0 ? this._renderEmptyState(icon, title) : 
            items.map((item, index) => this._renderEntityRow(item, index, sectionType))
          }
        </div>
      </div>
    `;
  }

  _renderEmptyState(icon, title) {
    return html`
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <div class="empty-text">暂无${title}</div>
        <div class="empty-hint">点击"添加实体"按钮开始配置</div>
      </div>
    `;
  }

  _renderEntityRow(item, index, sectionType) {
    const state = this._getEntityState(item.value);

    return html`
      <div class="entity-row" @click=${() => this._startEditItem(sectionType, index)}>
        <div class="entity-icon">
          <ha-icon .icon=${item.icon}></ha-icon>
        </div>
        <div class="entity-content">
          <div class="entity-name">${item.label}</div>
          <div class="entity-state">${item.value}</div>
          ${state ? html`<div class="entity-state">${state}</div>` : ''}
        </div>
        <div class="entity-actions">
          <button class="entity-action" @click=${(e) => {
            e.stopPropagation();
            this._removeItem(sectionType, index);
          }} title="删除">
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderEditDialog() {
    if (!this._editingItem) return '';

    const { sectionType, index } = this._editingItem;
    const item = this._config[sectionType][index] || { label: '', value: '', icon: 'mdi:chart-box' };
    const entityInfo = this._getEntityInfo(item.value);
    const currentIcon = item.icon || entityInfo.icon || 'mdi:chart-box';
    const isValid = item.label.trim() && item.value.trim();

    return html`
      <div class="edit-dialog-overlay" @click=${this._cancelEdit}>
        <div class="edit-dialog" @click=${e => e.stopPropagation()}>
          <div class="dialog-header">
            <div class="dialog-title">
              ${index !== null ? '编辑实体' : '添加实体'}
            </div>
            <button class="close-button" @click=${this._cancelEdit}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="form-field">
            <label class="form-label">显示名称</label>
            <ha-textfield
              .value=${item.label}
              @input=${e => this._updateEditingItem({ label: e.target.value })}
              placeholder=${entityInfo.name || "显示名称"}
              fullwidth
            ></ha-textfield>
          </div>

          <div class="form-field">
            <label class="form-label">数据源</label>
            <div class="data-source-input">
              <ha-textfield
                .value=${item.value}
                @input=${e => {
                  const newValue = e.target.value;
                  this._updateEditingItem({ value: newValue });
                  // 自动检测实体信息
                  const entityInfo = this._getEntityInfo(newValue);
                  if (entityInfo.name && !item.label) {
                    this._updateEditingItem({ label: entityInfo.name });
                  }
                  if (entityInfo.icon) {
                    this._updateEditingItem({ icon: entityInfo.icon });
                  }
                }}
                placeholder="实体ID、Jinja模板或自定义文本"
                fullwidth
              ></ha-textfield>
              <button class="entity-picker-btn" @click=${this._showEntityPicker}>
                <ha-icon icon="mdi:magnify"></ha-icon>
                选择实体
              </button>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">图标</label>
            <div class="icon-preview">
              <ha-icon .icon=${currentIcon}></ha-icon>
              <span class="icon-preview-text">${currentIcon}</span>
            </div>
            <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 8px;">
              图标会根据数据源自动选择
            </div>
          </div>

          <div class="form-actions">
            <button class="cancel-button" @click=${this._cancelEdit}>取消</button>
            <button 
              class="save-button" 
              ?disabled=${!isValid}
              @click=${this._saveEdit}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _getEntityState(entityValue) {
    if (!entityValue || !this.hass) return '';
    
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      return this.hass.states[entityValue].state;
    }
    
    return '';
  }

  _getEntityInfo(entityValue) {
    if (!entityValue || !this.hass) return { name: '', icon: 'mdi:chart-box' };
    
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      const entity = this.hass.states[entityValue];
      return {
        name: entity.attributes?.friendly_name || entityValue,
        icon: entity.attributes?.icon || this._getDefaultEntityIcon(entityValue)
      };
    }
    
    return { name: '', icon: 'mdi:chart-box' };
  }

  _getDefaultEntityIcon(entityId) {
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

  _showEntityPicker() {
    if (!this._editingItem) return;

    const entityPicker = document.createElement('ha-entity-picker');
    entityPicker.hass = this.hass;
    entityPicker.allowCustomValue = true;
    
    entityPicker.addEventListener('value-changed', (e) => {
      const entityId = e.detail.value;
      if (entityId) {
        const entityInfo = this._getEntityInfo(entityId);
        this._updateEditingItem({ 
          value: entityId,
          label: entityInfo.name || entityId,
          icon: entityInfo.icon
        });
      }
      entityPicker.remove();
    });

    document.body.appendChild(entityPicker);
    setTimeout(() => {
      entityPicker.focus();
      entityPicker.select();
    }, 100);
  }

  _startAddItem(sectionType) {
    this._editingItem = {
      sectionType,
      index: this._config[sectionType].length,
      isNew: true
    };
    this._config[sectionType].push({ label: '', value: '', icon: 'mdi:chart-box' });
    this.requestUpdate();
  }

  _startEditItem(sectionType, index) {
    this._editingItem = { sectionType, index, isNew: false };
    this.requestUpdate();
  }

  _updateEditingItem(updates) {
    if (!this._editingItem) return;
    
    const { sectionType, index } = this._editingItem;
    this._config[sectionType][index] = {
      ...this._config[sectionType][index],
      ...updates
    };
    this.requestUpdate();
  }

  _saveEdit() {
    if (!this._editingItem) return;
    
    this._editingItem = null;
    this._notifyEntitiesChange();
  }

  _cancelEdit() {
    if (!this._editingItem) return;
    
    const { sectionType, index, isNew } = this._editingItem;
    
    if (isNew) {
      this._config[sectionType].splice(index, 1);
    }
    
    this._editingItem = null;
    this.requestUpdate();
  }

  _removeItem(sectionType, index) {
    this._config[sectionType].splice(index, 1);
    this._notifyEntitiesChange();
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}
