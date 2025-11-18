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
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: var(--secondary-background-color);
        border-bottom: 1px solid var(--divider-color);
      }

      .section-title {
        font-weight: 600;
        color: var(--primary-text-color);
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .add-entity-row {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        background: var(--card-background-color);
        gap: 12px;
      }

      .add-entity-inputs {
        flex: 1;
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .entity-name-input {
        flex: 1;
        min-width: 120px;
      }

      .entity-picker-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
      }

      .add-button {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
        white-space: nowrap;
      }

      .add-button:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
      }

      /* 官方实体行样式 */
      .entities-list {
        padding: 0;
      }

      .entity-row {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
        transition: background-color 0.3s;
        min-height: 60px;
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

      .entity-value {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
        word-break: break-all;
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
    `
  ];

  constructor() {
    super();
    this._config = { header: [], content: [], footer: [] };
    this._newItems = {
      header: { label: '', value: '' },
      content: { label: '', value: '' },
      footer: { label: '', value: '' }
    };
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
      </div>
    `;
  }

  _renderSection(sectionType, defaultIcon, title) {
    const items = this._config[sectionType];
    const newItem = this._newItems[sectionType];

    return html`
      <div class="entities-section">
        <div class="section-header">
          <div class="section-title">
            <ha-icon .icon=${defaultIcon}></ha-icon>
            ${title}
          </div>
        </div>

        <!-- 添加实体行 -->
        <div class="add-entity-row">
          <div class="add-entity-inputs">
            <ha-textfield
              class="entity-name-input"
              .value=${newItem.label}
              @input=${e => this._updateNewItem(sectionType, 'label', e.target.value)}
              placeholder="显示名称"
              outlined
            ></ha-textfield>
            
            <ha-textfield
              .value=${newItem.value}
              @input=${e => this._updateNewItem(sectionType, 'value', e.target.value)}
              placeholder="实体ID、Jinja模板或文本"
              outlined
              style="flex: 2;"
            ></ha-textfield>

            <button class="entity-picker-btn" @click=${() => this._showEntityPicker(sectionType)}>
              <ha-icon icon="mdi:magnify"></ha-icon>
              选择实体
            </button>
          </div>

          <button 
            class="add-button"
            @click=${() => this._addEntity(sectionType)}
            ?disabled=${!newItem.label.trim() || !newItem.value.trim()}
          >
            添加
          </button>
        </div>

        <!-- 实体列表 -->
        <div class="entities-list">
          ${items.length === 0 ? this._renderEmptyState(defaultIcon, title) : 
            items.map((item, index) => this._renderEntityRow(item, index, sectionType))
          }
        </div>
      </div>
    `;
  }

  _renderEmptyState(icon, title) {
    return html`
      <div class="empty-state">
        <div class="empty-icon">
          <ha-icon .icon=${icon}></ha-icon>
        </div>
        <div class="empty-text">暂无${title}</div>
        <div class="empty-hint">在上方输入名称和数据源来添加</div>
      </div>
    `;
  }

  _renderEntityRow(item, index, sectionType) {
    const entityInfo = this._getEntityInfo(item.value);
    const displayIcon = item.icon || entityInfo.icon || 'mdi:circle';

    return html`
      <div class="entity-row">
        <div class="entity-icon">
          <ha-icon .icon=${displayIcon}></ha-icon>
        </div>
        <div class="entity-content">
          <div class="entity-name">${item.label}</div>
          <div class="entity-value">${item.value}</div>
        </div>
        <div class="entity-actions">
          <button 
            class="entity-action" 
            @click=${() => this._removeEntity(sectionType, index)}
            title="删除"
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _updateNewItem(sectionType, field, value) {
    this._newItems[sectionType][field] = value;
    this.requestUpdate();
  }

  _addEntity(sectionType) {
    const newItem = this._newItems[sectionType];
    if (!newItem.label.trim() || !newItem.value.trim()) return;

    const entityInfo = this._getEntityInfo(newItem.value);
    
    this._config[sectionType].push({
      label: newItem.label,
      value: newItem.value,
      icon: entityInfo.icon || 'mdi:circle'
    });

    // 清空输入框
    this._newItems[sectionType] = { label: '', value: '' };
    this._notifyEntitiesChange();
  }

  _removeEntity(sectionType, index) {
    this._config[sectionType].splice(index, 1);
    this._notifyEntitiesChange();
  }

  _getEntityInfo(entityValue) {
    if (!entityValue || !this.hass) return { name: '', icon: 'mdi:circle' };
    
    // 如果是实体ID
    if (entityValue.includes('.') && this.hass.states[entityValue]) {
      const entity = this.hass.states[entityValue];
      return {
        name: entity.attributes?.friendly_name || entityValue,
        icon: entity.attributes?.icon || this._getDefaultEntityIcon(entityValue)
      };
    }
    
    return { name: '', icon: 'mdi:circle' };
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

  _showEntityPicker(sectionType) {
    const entityPicker = document.createElement('ha-entity-picker');
    entityPicker.hass = this.hass;
    entityPicker.allowCustomValue = true;
    
    entityPicker.addEventListener('value-changed', (e) => {
      const entityId = e.detail.value;
      if (entityId) {
        const entityInfo = this._getEntityInfo(entityId);
        this._updateNewItem(sectionType, 'value', entityId);
        
        // 如果名称为空，自动填充实体名称
        if (!this._newItems[sectionType].label.trim()) {
          this._updateNewItem(sectionType, 'label', entityInfo.name || entityId);
        }
      }
      entityPicker.remove();
    });

    document.body.appendChild(entityPicker);
    
    setTimeout(() => {
      entityPicker.focus();
      entityPicker.select();
    }, 100);
  }
}

if (!customElements.get('entity-manager')) {
  customElements.define('entity-manager', EntityManager);
}
