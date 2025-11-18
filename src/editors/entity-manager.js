// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    entities: { type: Object },
    _config: { state: true },
    _expandedSections: { state: true },
    _editingItem: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager { width: 100%; }
      .config-section {
        background: var(--card-background-color);
        border-radius: 12px;
        margin-bottom: 12px;
        border: 1px solid var(--divider-color);
        overflow: hidden;
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--secondary-background-color);
        cursor: pointer;
        min-height: 44px;
      }
      .section-title {
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-count {
        background: var(--primary-color);
        color: white;
        border-radius: 10px;
        padding: 2px 8px;
        font-size: 11px;
        margin-left: 6px;
      }
      .add-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
      }
      .entities-list { padding: 8px 0; }
      .entity-row {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid var(--divider-color);
        min-height: 52px;
        cursor: pointer;
      }
      .entity-row:last-child { border-bottom: none; }
      .entity-row:hover { background: var(--secondary-background-color); }
      .entity-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        border-radius: 8px;
        margin-right: 12px;
        color: white;
      }
      .entity-content { flex: 1; min-width: 0; }
      .entity-name { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
      .entity-value { font-size: 11px; color: var(--secondary-text-color); font-family: monospace; }
      .entity-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .entity-row:hover .entity-actions { opacity: 1; }
      .empty-state { text-align: center; padding: 20px; color: var(--secondary-text-color); }
      .edit-form {
        padding: 16px;
        background: var(--secondary-background-color);
        border-top: 1px solid var(--divider-color);
      }
      .form-field { margin-bottom: 16px; }
      .form-label { display: block; font-weight: 600; font-size: 12px; margin-bottom: 6px; color: var(--primary-text-color); }
      .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
      ha-textfield { width: 100%; }
    `
  ];

  constructor() {
    super();
    this._config = { header: [], content: [], footer: [] };
    this._expandedSections = new Set(['content']);
    this._editingItem = null;
    this._entityPools = { header: [], content: [], footer: [] };
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('entities')) this._parseConfigFromEntities();
    if (changedProperties.has('hass')) this._updateEntityPools();
  }

  _parseConfigFromEntities() {
    if (!this.entities) { this._config = { header: [], content: [], footer: [] }; return; }
    const config = { header: [], content: [], footer: [] };
    Object.keys(this.entities).forEach(key => {
      if (key.startsWith('header_') && !key.includes('_label') && !key.includes('_icon')) {
        const idx = key.replace('header_', '');
        config.header.push({ label: this.entities[`header_${idx}_label`] || '标题', value: this.entities[key], icon: this.entities[`header_${idx}_icon`] || 'mdi:format-title' });
      } else if (key.startsWith('content_') && !key.includes('_label') && !key.includes('_icon')) {
        const idx = key.replace('content_', '');
        config.content.push({ label: this.entities[`content_${idx}_label`] || `项目 ${idx}`, value: this.entities[key], icon: this.entities[`content_${idx}_icon`] || 'mdi:chart-box' });
      } else if (key.startsWith('footer_') && !key.includes('_label') && !key.includes('_icon')) {
        const idx = key.replace('footer_', '');
        config.footer.push({ label: this.entities[`footer_${idx}_label`] || '页脚', value: this.entities[key], icon: this.entities[`footer_${idx}_icon`] || 'mdi:file-document' });
      }
    });
    this._config = config;
    this._updateEntityPools();
  }

  _updateEntityPools() {
    if (!this.hass) return;
    ['header', 'content', 'footer'].forEach(sec => { this._entityPools[sec] = this._config[sec].map(it => this._mapEntityRow(it)); });
  }

  _mapEntityRow(item) {
    const isEntity = item.value && item.value.includes('.') && this.hass.states[item.value];
    if (!isEntity) return { ...item, _type: 'text' };
    const st = this.hass.states[item.value];
    const icon = st.attributes.icon || this._defaultIcon(item.value);
    const name = item.label || st.attributes.friendly_name || item.value;
    const state = st.state;
    const domain = item.value.split('.')[0];
    const canToggle = ['switch', 'light', 'input_boolean', 'fan', 'cover'].includes(domain);
    return { ...item, _type: 'entity', entityId: item.value, icon, name, state, canToggle };
  }

  _defaultIcon(entityId) {
    const domain = entityId.split('.')[0];
    const map = { light: 'mdi:lightbulb', switch: 'mdi:power-plug', sensor: 'mdi:gauge', climate: 'mdi:thermostat', fan: 'mdi:fan', cover: 'mdi:window-open', input_boolean: 'mdi:toggle-switch', automation: 'mdi:robot', script: 'mdi:script-text', person: 'mdi:account', binary_sensor: 'mdi:checkbox-marked-circle', camera: 'mdi:camera', lock: 'mdi:lock', vacuum: 'mdi:robot-vacuum' };
    return map[domain] || 'mdi:circle';
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
    this.dispatchEvent(new CustomEvent('entities-changed', { detail: { entities } }));
  }

  _toggleSection(sectionType) {
    if (this._expandedSections.has(sectionType)) this._expandedSections.delete(sectionType);
    else this._expandedSections.add(sectionType);
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="entity-manager">
        ${this._renderSection('header', 'mdi:format-title', '标题')}
        ${this._renderSection('content', 'mdi:chart-box', '内容项')}
        ${this._renderSection('footer', 'mdi:file-document', '页脚')}
      </div>
    `;
  }

  _renderSection(sectionType, icon, title) {
    const items = this._config[sectionType];
    const isExpanded = this._expandedSections.has(sectionType);
    const isEditing = this._editingItem?.sectionType === sectionType;

    return html`
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection(sectionType)}>
          <div class="section-title">
            <ha-icon .icon=${icon}></ha-icon>
            ${title}
            ${items.length > 0 ? html`<span class="section-count">${items.length}</span>` : ''}
          </div>
          <button class="add-button" @click=${e => { e.stopPropagation(); this._startAddItem(sectionType); }}>添加</button>
        </div>
        ${isExpanded ? html`
          <div class="entities-list">
            ${items.length === 0 ? html`<div class="empty-state">暂无${title}</div>` : items.map((item, index) => this._renderEntityRow(item, index, sectionType))}
          </div>
        ` : ''}
        ${isEditing ? this._renderEditForm(sectionType) : ''}
      </div>
    `;
  }

  _renderEntityRow(item, index, sectionType) {
    const isEditing = this._editingItem?.sectionType === sectionType && this._editingItem?.index === index;
    if (isEditing) return '';

    const row = this._entityPools[sectionType]?.[index] || { _type: 'text', ...item };
    if (row._type === 'entity') {
      return html`
        <div class="entity-row" @click=${() => this._moreInfo(row.entityId)}>
          <div class="entity-icon"><ha-icon .icon=${row.icon}></ha-icon></div>
          <div class="entity-content">
            <div class="entity-name">${row.name}</div>
            <div class="entity-value">${row.state}</div>
          </div>
          <div class="entity-actions">
            ${row.canToggle ? html`<ha-switch .checked=${row.state === 'on'} @click=${e => { e.stopPropagation(); this._toggle(e, row.entityId); }}></ha-switch>` : ''}
            <mwc-icon-button icon="delete" @click=${e => { e.stopPropagation(); this.removeEntity(entityId); }}></mwc-icon-button>
          </div>
        </div>`;
    }
    return html`
      <div class="entity-row" @click=${() => this._startEditItem(sectionType, index)}>
        <div class="entity-icon"><ha-icon .icon=${item.icon}></ha-icon></div>
        <div class="entity-content">
          <div class="entity-name">${item.label}</div>
          <div class="entity-value">${item.value}</div>
        </div>
        <div class="entity-actions">
          <button @click=${e => { e.stopPropagation(); this._removeItem(sectionType, index); }}>删除</button>
        </div>
      </div>`;
  }

  _toggle(ev, entityId) {
    const on = this.hass.states[entityId].state === 'on';
    const domain = entityId.split('.')[0];
    this.hass.callService(domain, on ? 'turn_off' : 'turn_on', { entity_id: entityId });
  }

  _moreInfo(entityId) {
    const ev = new Event('hass-more-info', { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  _startAddItem(sectionType) {
    if (!this._config[sectionType]) this._config[sectionType] = [];
    this._editingItem = { sectionType, index: this._config[sectionType].length, isNew: true };
    this._config[sectionType].push({ label: '', value: '', icon: 'mdi:chart-box' });
    this._expandedSections.add(sectionType);
    this.requestUpdate();
  }

  _startEditItem(sectionType, index) {
    this._editingItem = { sectionType, index, isNew: false };
    this.requestUpdate();
  }

  _updateEditingItem(updates) {
    if (!this._editingItem) return;
    const { sectionType, index } = this._editingItem;
    this._config[sectionType][index] = { ...this._config[sectionType][index], ...updates };
    this.requestUpdate();
  }

  _saveEdit() {
    if (!this._editingItem) return;
    const { sectionType, index } = this._editingItem;
    const item = this._config[sectionType][index];
    if (!item.label.trim() || !item.value.trim()) return;
    this._editingItem = null;
    this._notifyEntitiesChange();
  }

  _cancelEdit() {
    if (!this._editingItem) return;
    const { sectionType, index, isNew } = this._editingItem;
    if (isNew) this._config[sectionType].splice(index, 1);
    this._editingItem = null;
    this.requestUpdate();
  }

  _removeItem(sectionType, index) {
    this._config[sectionType].splice(index, 1);
    this._notifyEntitiesChange();
  }

  _renderEditForm(sectionType) {
    if (!this._editingItem || this._editingItem.sectionType !== sectionType) return html``;
    const { index } = this._editingItem;
    const item = this._config[sectionType][index];
    return html`
      <div class="edit-form">
        <div class="form-field">
          <label class="form-label">显示名称</label>
          <ha-textfield .value=${item.label} @input=${e => this._updateEditingItem({ label: e.target.value })} placeholder="名称" fullwidth></ha-textfield>
        </div>
        <div class="form-field">
          <label class="form-label">数据源（实体ID 或 文本）</label>
          <ha-textfield .value=${item.value} @input=${e => this._updateEditingItem({ value: e.target.value }) } placeholder="light.living_room" fullwidth></ha-textfield>
        </div>
        <div class="form-field">
          <label class="form-label">图标（mdi 名称）</label>
          <ha-textfield .value=${item.icon} @input=${e => this._updateEditingItem({ icon: e.target.value }) } placeholder="mdi:chart-box" fullwidth></ha-textfield>
        </div>
        <div class="form-actions">
          <button @click=${this._cancelEdit}>取消</button>
          <button @click=${this._saveEdit} ?disabled=${!item.label.trim() || !item.value.trim()}>保存</button>
        </div>
      </div>`;
  }

  static getConfigElement() { return document.createElement('entity-manager-editor'); }
}

if (!customElements.get('entity-manager')) customElements.define('entity-manager', EntityManager);
