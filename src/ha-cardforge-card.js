import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

class HaCardForgeCard extends LitElement {
  static properties = {
    hass: { type: Object },
    _config: { type: Object, state: true }
  };

  static styles = css`
    .card {
      background: var(--card-background-color, white);
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
      overflow: hidden;
      font-family: var(--ha-card-font-family, inherit);
      color: var(--primary-text-color);
    }

    .header {
      display: flex;
      align-items: center;
      padding: 16px;
      background: var(--primary-color, #03a9f4);
      color: white;
      font-weight: 500;
    }

    .header-icon {
      margin-right: 8px;
    }

    .header-title {
      flex: 1;
      font-size: 1.1em;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
      color: white;
    }

    .action-btn:hover {
      opacity: 1;
    }

    .content {
      padding: 20px;
      min-height: 120px;
    }

    .content-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--disabled-text-color);
      text-align: center;
      height: 120px;
    }

    .setup-btn {
      margin-top: 12px;
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .entities-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .entity-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: rgba(0,0,0,0.02);
      border-radius: 6px;
      border-left: 4px solid var(--primary-color);
    }

    .entity-info {
      display: flex;
      flex-direction: column;
    }

    .entity-name {
      font-weight: 500;
    }

    .entity-domain {
      font-size: 0.8em;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .entity-state {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
    }

    .state-unit {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(0,0,0,0.03);
      border-top: 1px solid var(--divider-color);
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }

    .footer-info {
      display: flex;
      gap: 16px;
    }

    .powered-by {
      font-size: 0.8em;
      opacity: 0.7;
    }
  `;

  setConfig(config) {
    this._config = this._validateConfig(config);
  }

  _validateConfig(config) {
    const defaultConfig = {
      layout: {
        header: { 
          title: '', 
          icon: '', 
          visible: true,
          show_edit_button: true
        },
        content: { 
          entities: []
        },
        footer: { 
          visible: true, 
          show_timestamp: false,
          show_entity_count: true
        }
      }
    };
    return this._deepMerge(defaultConfig, config);
  }

  _deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  render() {
    if (!this._config) {
      return html`<ha-card><div class="card">Loading...</div></ha-card>`;
    }

    const { header, content, footer } = this._config.layout;

    return html`
      <ha-card>
        <div class="card">
          ${header.visible ? this._renderHeader() : ''}
          <div class="content">
            ${this._renderContent()}
          </div>
          ${footer.visible ? this._renderFooter() : ''}
        </div>
      </ha-card>
    `;
  }

  _renderHeader() {
    const { title, icon, show_edit_button } = this._config.layout.header;
    
    return html`
      <div class="header">
        ${icon ? html`<ha-icon class="header-icon" .icon=${icon}></ha-icon>` : ''}
        <span class="header-title">${title}</span>
        <div class="header-actions">
          ${show_edit_button ? html`
            <ha-icon 
              class="action-btn" 
              .icon=${"mdi:cog"}
              title="编辑卡片"
              @click=${this._openEditor}
            ></ha-icon>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderContent() {
    const { entities } = this._config.layout.content;
    
    if (!entities || entities.length === 0) {
      return html`
        <div class="content-empty">
          <ha-icon .icon=${"mdi:plus-circle-outline"}></ha-icon>
          <p>点击配置内容区域</p>
          <button class="setup-btn" @click=${this._openEditor}>开始设置</button>
        </div>
      `;
    }

    return this._renderEntities(entities);
  }

  _renderEntities(entities) {
    const entityData = this._getEntityData(entities);
    
    return html`
      <div class="entities-list">
        ${entityData.map(entity => html`
          <div class="entity-item">
            <div class="entity-info">
              <span class="entity-name">${entity.name}</span>
              <span class="entity-domain">${entity.domain}</span>
            </div>
            <div class="entity-state">
              <span class="state-value">${entity.state}</span>
              ${entity.unit ? html`<span class="state-unit">${entity.unit}</span>` : ''}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  _getEntityData(entityIds) {
    if (!this.hass || !this.hass.states) {
      return entityIds.map(entityId => ({
        id: entityId,
        name: entityId,
        domain: 'unknown',
        state: '未知',
        unit: ''
      }));
    }
    
    return entityIds.map(entityId => {
      const entity = this.hass.states[entityId];
      if (!entity) {
        return {
          id: entityId,
          name: entityId,
          domain: 'unknown',
          state: '不可用',
          unit: ''
        };
      }
      
      return {
        id: entityId,
        name: entity.attributes.friendly_name || entityId,
        domain: entityId.split('.')[0],
        state: entity.state,
        unit: entity.attributes.unit_of_measurement || ''
      };
    });
  }

  _renderFooter() {
    const { show_timestamp, show_entity_count } = this._config.layout.footer;
    const timestamp = show_timestamp ? new Date().toLocaleTimeString() : '';
    const entityCount = show_entity_count ? this._config.layout.content.entities.length : 0;
    
    return html`
      <div class="footer">
        <div class="footer-info">
          ${show_timestamp ? html`<span class="timestamp">${timestamp}</span>` : ''}
          ${show_entity_count ? html`<span class="entity-count">实体: ${entityCount}</span>` : ''}
        </div>
        <div class="footer-actions">
          <span class="powered-by">卡片工坊</span>
        </div>
      </div>
    `;
  }

  _openEditor() {
    if (window.HACardForgeEditor) {
      window.HACardForgeEditor.open(this._config, (newConfig) => {
        this.setConfig(newConfig);
      });
    }
  }

  // Home Assistant 标准接口
  getCardSize() {
    const entityCount = this._config?.layout?.content?.entities?.length || 0;
    return Math.max(2, 2 + Math.ceil(entityCount / 2));
  }

  static getStubConfig() {
    return {
      layout: {
        header: {
          title: "卡片工坊",
          icon: "mdi:widgets",
          visible: true
        },
        content: {
          entities: []
        },
        footer: {
          visible: true,
          show_timestamp: true
        }
      }
    };
  }
}

customElements.define('ha-cardforge-card', HaCardForgeCard);