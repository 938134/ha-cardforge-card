// src/editors/entity-manager.js
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';
import { foundationStyles } from '../core/styles.js';

export class EntityManager extends LitElement {
  static properties = {
    hass: { type: Object },
    entities: { type: Object },
    _config: { state: true },
    _expandedSections: { state: true }
  };

  static styles = [
    foundationStyles,
    css`
      .entity-manager {
        width: 100%;
      }

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

      .entities-list {
        padding: 8px 0;
      }

      .entity-row {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid var(--divider-color);
        min-height: 52px;
      }

      .entity-row:last-child {
        border-bottom: none;
      }

      .entity-content {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 2px;
      }

      .entity-value {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-family: monospace;
      }

      .entity-actions {
        display: flex;
        gap: 4px;
      }

      .empty-state {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }
    `
  ];

  constructor() {
    super();
    this._config = { header: [], content: [], footer: [] };
    this._expandedSections = new Set(['content']);
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
          icon: this.entities[`header_${index}_icon`] || '🏷️'
        });
      } else if (key.startsWith('content_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('content_', '');
        config.content.push({
          label: this.entities[`content_${index}_label`] || `项目 ${index}`,
          value: this.entities[key],
          icon: this.entities[`content_${index}_icon`] || '📊'
        });
      } else if (key.startsWith('footer_') && !key.includes('_label') && !key.includes('_icon')) {
        const index = key.replace('footer_', '');
        config.footer.push({
          label: this.entities[`footer_${index}_label`] || '页脚',
          value: this.entities[key],
          icon: this.entities[`footer_${index}_icon`] || '📄'
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
        ${this._renderSection('header', '🏷️', '标题')}
        ${this._renderSection('content', '📊', '内容项')}
        ${this._renderSection('footer', '📄', '页脚')}
      </div>
    `;
  }

  _renderSection(sectionType, icon, title) {
    const items = this._config[sectionType];
    const isExpanded = this._expandedSections.has(sectionType);

    return html`
      <div class="config-section">
        <div class="section-header" @click=${() => this._toggleSection(sectionType)}>
          <div class="section-title">
            <span>${icon}</span>
            ${title}
            ${items.length > 0 ? html`<span class="section-count">${items.length}</span>` : ''}
          </div>
          <button class="add-button" @click=${(e) => {
            e.stopPropagation();
            this._showEntityEditor(sectionType);
          }}>
            添加
          </button>
        </div>
        
        ${isExpanded ? html`
          <div class="entities-list">
            ${items.length === 0 ? html`
              <div class="empty-state">暂无${title}</div>
            ` : items.map((item, index) => this._renderEntityRow(item, index, sectionType))}
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderEntityRow(item, index, sectionType) {
    return html`
      <div class="entity-row">
        <div class="entity-content">
          <div class="entity-name">${item.label}</div>
          <div class="entity-value">${item.value}</div>
        </div>
        <div class="entity-actions">
          <button @click=${() => this._showEntityEditor(sectionType, index)}>编辑</button>
          <button @click=${() => this._removeItem(sectionType, index)}>删除</button>
        </div>
      </div>
    `;
  }

  _showEntityEditor(sectionType, index = null) {
    const item = index !== null ? this._config[sectionType][index] : null;
    
    // 使用官方实体选择器
    this._openEntityPicker(sectionType, index, item);
  }

  _openEntityPicker(sectionType, index, item) {
    // 创建官方实体选择器
    const entityPicker = document.createElement('ha-entity-picker');
    entityPicker.hass = this.hass;
    entityPicker.allowCustomValue = true;
    
    if (item?.value && this.hass?.states[item.value]) {
      entityPicker.value = item.value;
    }

    // 创建对话框
    const dialog = document.createElement('ha-dialog');
    dialog.heading = index !== null ? '编辑实体' : '添加实体';
    
    dialog.content = html`
      <div style="padding: 20px; min-width: 300px;">
        <ha-textfield
          label="显示名称"
          .value=${item?.label || ''}
          @input=${e => this._tempLabel = e.target.value}
          style="width: 100%; margin-bottom: 16px;"
        ></ha-textfield>
        
        <ha-entity-picker
          .hass=${this.hass}
          .value=${item?.value || ''}
          @value-changed=${e => this._tempValue = e.detail.value}
          style="width: 100%; margin-bottom: 16px;"
        ></ha-entity-picker>

        <ha-icon-picker
          label="图标"
          .value=${item?.icon || 'mdi:home'}
          @value-changed=${e => this._tempIcon = e.detail.value}
          style="width: 100%;"
        ></ha-icon-picker>
      </div>
    `;

    dialog.actions = [
      { label: '取消', action: 'close' },
      { 
        label: '保存', 
        action: () => {
          this._saveEntity(sectionType, index, {
            label: this._tempLabel || this._getDefaultLabel(this._tempValue),
            value: this._tempValue,
            icon: this._tempIcon || 'mdi:home'
          });
        } 
      }
    ];

    document.body.appendChild(dialog);
    dialog.showDialog();

    // 存储临时数据
    this._tempLabel = item?.label || '';
    this._tempValue = item?.value || '';
    this._tempIcon = item?.icon || 'mdi:home';
  }

  _getDefaultLabel(entityId) {
    if (!entityId || !this.hass?.states[entityId]) return '新项目';
    return this.hass.states[entityId].attributes?.friendly_name || entityId;
  }

  _saveEntity(sectionType, index, newItem) {
    if (!newItem.value) return;

    if (index !== null) {
      // 编辑现有项
      this._config[sectionType][index] = newItem;
    } else {
      // 添加新项
      this._config[sectionType].push(newItem);
    }

    this._notifyEntitiesChange();
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